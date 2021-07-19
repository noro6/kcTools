document.addEventListener('DOMContentLoaded', function () {
   document.getElementById('fleet_tab_container').classList.add('d-none');
   document.getElementById('fleet_tab_container').classList.remove('d-flex');
   // トップページへ
   document.getElementById('btn_top').addEventListener('click', () => { window.location.href = '../list/'; });

   $('#item_list').on('click', '.item_container', function () { item_container_Clicked($(this)); });
   $('#modal_item_edit').on('blur', 'input', function () { item_stock_Leaved($(this)); });
   $('#modal_item_edit').on('input', 'input', function () { item_stock_Changed($(this)); });
   $('#modal_item_edit').on('click', '#btn_reset_item_stock', btn_reset_item_stock_Clicked);

   refreshItemList();

   // モーダル初期化
   $('.modal').modal();
});

/**
 * 現在登録されている装備情報から所持装備一覧を再描画
 */
function refreshItemList() {
   const types = ITEM_API_TYPE.map(function (v) {
      const type = v.id;
      if ([13, 22, 26, 28, 32, 33, 40, 42, 46].includes(type)) return { type: -99 };
      const data = { type: type, name: v.name, items: [] };

      if (type === 5) {
         // 魚雷に特殊潜航艇、潜水艦魚雷を含める
         data.name = '魚雷 / 特殊潜航艇';
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 22 || i.type === 32);
      }
      else if (type === 12) {
         // 小型電探に大型電探を含める
         data.name = '電探';
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 13);
      }
      else if (type === 14) {
         // 小型ソナーに大型ソナーを含める
         data.name = 'ソナー';
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 40);
      }
      else if (type === 24) {
         // 大発系 / 内火艇
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 46);
      }
      else if (type === 25) {
         // 大発系 / 内火艇
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 26);
      }
      else if (type === 27) {
         // 小バルジに大バルジを含める
         data.name = '追加装甲(中型 / 大型)';
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 28);
      }
      else if (type === 29) {
         // 探照灯 / 照明弾 / 大型探照灯
         data.name = '探照灯 / 照明弾';
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 33 || i.type === 42);
      }
      else {
         data.items = ITEM_DATA.filter(i => i.type === type);
      }

      data.items.sort((a, b) => a.type - b.type);
      return data;
   });

   // 所持装備
   const stockItems = loadPlaneStock();

   const fragment = document.createDocumentFragment();
   for (const type of types) {
      if (type.type < 0) continue;

      const container = createDiv('type_content general_box');

      const header = createDiv('item_type_header d-flex');
      header.innerHTML = `<div><img src="../img/type/type${type.type}.png" class="item_type_img" alt="${type.name}"></div>
      <div class="ml-2">${type.name}</div>`;
      container.appendChild(header);

      for (const item of type.items) {
         const item_container = createDiv('item_container');
         item_container.dataset.itemId = item.id;

         const item_header = createDiv('item_header');
         const img = document.createElement('img');
         img.className = 'item_icon';
         img.src = `../img/type/icon${item.itype}.png`;
         item_header.appendChild(img);

         const nameSpan = createDiv('item_name');
         nameSpan.textContent = item.name;
         item_header.appendChild(nameSpan);

         // 登録済み個数
         let sumCount = 0;

         const stock = stockItems.find(v => v.id === item.id);
         // 明細行(改修値とともに)
         if (stock && stock.num.some(v => v > 0)) {
            for (let remodel = 10; remodel >= 0; remodel--) {
               const count = stock.num[remodel];
               if (count) {
                  sumCount += count;

                  const item_detail = createDiv('item_detail');

                  const remodel_div = createDiv('text_remodel item_remodel');
                  remodel_div.textContent = '★+' + remodel;
                  item_detail.appendChild(remodel_div);

                  const count_div = createDiv('text_count');
                  count_div.textContent = count;
                  item_detail.appendChild(count_div);

                  item_container.appendChild(item_detail);
               }
            }
         }

         const count_div = createDiv('sum_count');
         count_div.textContent = sumCount;
         item_header.appendChild(count_div);

         if (!sumCount) {
            item_container.classList.add('no_item');
         }

         item_container.prepend(item_header);

         container.appendChild(item_container);
      }

      fragment.appendChild(container);
   }

   document.getElementById('item_list').innerHTML = '';
   document.getElementById('item_list').appendChild(fragment);
}

/**
 * 装備一覧内　装備クリック
 * @param {*} $this
 */
function item_container_Clicked($this) {
   const itemId = castInt($this[0].dataset.itemId);
   const item = ITEM_DATA.find(v => v.id === itemId);
   const stock = loadPlaneStock().find(v => v.id === itemId);

   if (!item) {
      inform_danger('装備取得に失敗しました。');
      return;
   }

   document.getElementById('edit_item_id').textContent = 'No.' + ('000' + item.id).slice(-3);
   document.getElementById('edit_item_name').textContent = item.name;
   document.getElementById('img_plane_card').src = `../img/plane/${item.id}.png`;
   document.getElementById('img_plane_card').alt = item.id;
   document.getElementById('edit_item_fire').textContent = item.fire;
   document.getElementById('edit_item_antiAir').textContent = item.antiAir;
   document.getElementById('edit_item_torpedo').textContent = item.torpedo;
   document.getElementById('edit_item_bomber').textContent = item.bomber;
   document.getElementById('edit_item_armor').textContent = item.armor;
   document.getElementById('edit_item_asw').textContent = item.asw;
   document.getElementById('edit_item_accracy').textContent = item.accuracy;
   document.getElementById('edit_item_avoid').textContent = item.avoid2;
   document.getElementById('edit_item_scout').textContent = item.scout;
   document.getElementById('edit_item_antiBomber').textContent = item.antiBomber;
   document.getElementById('edit_item_interception').textContent = item.interception;
   document.getElementById('edit_item_radius').textContent = item.radius;

   let sumStock = 0;
   for (let remodel = 0; remodel <= 10; remodel++) {
      if (item.canRemodel && remodel > 0) {
         document.getElementById('remodel_' + remodel)['disabled'] = false;
      }
      else if (remodel > 0) {
         document.getElementById('remodel_' + remodel)['disabled'] = true;
      }

      if (stock && stock.num[remodel]) {
         document.getElementById('remodel_' + remodel).value = stock.num[remodel];
         sumStock += stock.num[remodel];
      }
      else {
         document.getElementById('remodel_' + remodel).value = '';
      }
   }
   document.getElementById('remodel_all').value = sumStock;

   $('#modal_item_edit').modal('open');
}

/**
 * 装備所持変更欄　所持数入力欄フォーカスアウト
 * @param {*} $this
 */
function item_stock_Leaved($this) {
   const input = castInt($this.val());

   if (input <= 0) {
      $this.val('');
   }
   else if (input >= 99) {
      $this.val(99);
   }

   let sumStock = 0;
   $('#item_stock_inputs input[type="number"]').each((i, e) => {
      sumStock += castInt($(e).val());
   });
   document.getElementById('remodel_all').value = sumStock;
}

/**
 * 装備所持変更欄　所持数入力欄入力時
 * @param {*} $this
 */
function item_stock_Changed($this) {
   const input = castInt($this.val());

   if (input < 0) {
      $this.val(0);
   }
   else if (input >= 99) {
      $this.val(99);
   }

   let sumStock = 0;
   $('#item_stock_inputs input[type="number"]').each((i, e) => {
      sumStock += castInt($(e).val());
   });

   document.getElementById('remodel_all').value = sumStock;
}

/**
 * 所持装備数リセット押下時
 */
function btn_reset_item_stock_Clicked() {
   $('#item_stock_inputs input[type="number"]').each((i, e) => {
      $(e).val('');
   });
   document.getElementById('remodel_all').value = 0;
}
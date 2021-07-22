/** @type {{type: number, type2: number, name: string, items: any[]}[]} */
let ITEM_TYPES_LIST = [];

let timer = null;

document.addEventListener('DOMContentLoaded', function () {
   // モーダル初期化
   $('.modal').modal();
   // タブ初期化
   $('.tabs').tabs();
   // 折り畳み初期化
   $('.collapsible').collapsible();
   // select初期化
   $('select').formSelect();
   // 画像
   $('.materialboxed').materialbox();

   const slider = document.getElementById('remodel_range');
   noUiSlider.create(slider, {
      start: [0, 10],
      connect: true,
      step: 1,
      orientation: 'horizontal',
      range: { 'min': 0, 'max': 10 },
      format: {
         to: (value) => castInt(value),
         from: (value) => castInt(value)
      }
   });
   slider.noUiSlider.on('update.one', (value) => {
      document.getElementById('remodel_min').value = value[0];
      document.getElementById('remodel_max').value = value[1];
   });
   slider.noUiSlider.on('change.one', initItemList);

   document.getElementById('fleet_tab_container').classList.add('d-none');
   document.getElementById('fleet_tab_container').classList.remove('d-flex');
   // トップページへ
   document.getElementById('btn_top').addEventListener('click', () => { window.location.href = '../list/'; });
   // シミュページへ
   document.getElementById('btn_share').addEventListener('click', () => { window.location.href = '../simulator/'; });

   document.getElementById('btn_read_ship').addEventListener('click', btn_read_ship_Clicked);
   document.getElementById('btn_read_item').addEventListener('click', btn_read_item_Clicked);

   // 装備関連
   $('#items_filter').on('input', 'input[type="number"]', setRemodelSlider);
   $('#items_filter').on('click', 'input[type="number"]', function () { $(this).select(); });
   $('#items_filter').on('change', '#enabled_types_container', filterItemList);
   $('#items_filter').on('change', '#no_item_invisible', initItemList);

   $('#item_list').on('click', '.item_container', function () { item_container_Clicked($(this)); });

   $('#modal_item_edit').on('blur', 'input', function () { item_stock_Leaved($(this)); });
   $('#modal_item_edit').on('input', 'input', function () { item_stock_Changed($(this)); });
   $('#modal_item_edit').on('click', '#btn_save_item', btn_save_item_stock_Clicked);
   $('#modal_item_edit').on('click', '#btn_reset_item_stock', btn_reset_item_stock_Clicked);

   initShipList();
   initItemList();
});


/**
 * 現在取る臆されている艦娘情報から所持艦娘一覧を再構築
 */
function initShipList() {
   // 所持装備
   const stockShips = loadShipStock();

   // 表示条件
   // const noItemInvisible = document.getElementById('no_item_invisible')['checked'];
   // const remodelMin = castInt(document.getElementById('remodel_min').value);
   // const remodelMax = castInt(document.getElementById('remodel_max').value);
   // const visibleTypes = $('#enabled_types').formSelect('getSelectedValues').map(v => castInt(v));

   //　もう表示した艦娘
   const doneShipId = [];

   const fragment = document.createDocumentFragment();
   for (const ctype of API_CTYPE) {
      const container = createDiv('my-3 px-2 py-2 general_box');

      const header = createDiv('ship_type_header');
      header.textContent = ctype.name;
      container.appendChild(header);

      const ctypeBody = createDiv('ship_type_body');

      // 艦型で検索し、いったん最終改造状態のみ取得
      const ships = SHIP_DATA.filter(v => v.type2 === ctype.id && v.final);
      for (const ship of ships) {
         const versions = SHIP_DATA.filter(v => v.orig === ship.orig);
         if (!versions.length) break;

         const shipContainer = createDiv('ship_container');
         versions.sort((a, b) => b.ver - a.ver);
         let done = false;
         for (const ver of versions) {
            // 所持数取得
            const stock = stockShips.find(v => v.id === ver.id);
            if ((ver.ver > 0 && (!stock || !stock.details.length)) || doneShipId.includes(ver.api)) {
               continue;
            }

            doneShipId.push(ver.api);

            const verContainer = createDiv('version_container');
            const verHeader = createDiv('version_header');
            verHeader.innerHTML = `
            <div class="d-flex">
               <div class="version_ship_name">${ver.name}</div>
               <div class="version_ship_stock">所持: ${stock && stock.details.length ? stock.details.length : '-'}</div>
            </div>`;

            const shipImage = createDiv('ship_img_div');
            shipImage.innerHTML = `<img src="../img/ship/${ver.id}.png" >`;
            verHeader.appendChild(shipImage);

            verContainer.appendChild(verHeader);

            if (stock && stock.details.length) {
               for (let i = 0; i < stock.details.length; i++) {
                  const detail = stock.details[i];
                  const detailContainer = createDiv('detail_container');

                  if (detail.lv === 175) detailContainer.classList.add('lv_max2');
                  else if (detail.lv > 99) detailContainer.classList.add('lv_100');
                  else if (detail.lv === 99) detailContainer.classList.add('lv_max');

                  detailContainer.innerHTML = `
                  <div class="ship_lv">${detail.lv}</div>
                  <div>HP ${(detail.lv > 99 ? ver.hp2 : ver.hp) + detail.st[5]}</div>
                  <div>運 ${ver.luck + detail.st[4]}</div>
                  ${detail.area < 1 ? '<div class="sally_area"></div>' : `<div class="sally_area"><img src="../img/util/area${detail.area}.png"></div>`}`;
                  verContainer.appendChild(detailContainer);
               }
               done = true;
               shipContainer.appendChild(verContainer);
            }
            else if (!done) {
               // 完全に未所持
               const detailContainer = createDiv('detail_container no_ship');
               detailContainer.innerHTML = `<div>新規登録</div>`;
               shipContainer.classList.add('no_ship');
               verContainer.appendChild(detailContainer);
               shipContainer.appendChild(verContainer);
            }
         }

         // 1件もなければ追加されない
         if (shipContainer.getElementsByClassName('version_container').length) {
            ctypeBody.appendChild(shipContainer);
         }
      }

      container.appendChild(ctypeBody);

      // 1件もなければ追加されない
      if (container.getElementsByClassName('version_container').length) {
         fragment.appendChild(container);
      }

   }

   document.getElementById('ship_list').innerHTML = '';
   document.getElementById('ship_list').appendChild(fragment);
}

/**
 * 現在登録されている装備情報から所持装備一覧を再構築
 */
function initItemList() {
   if (!ITEM_TYPES_LIST.length) {
      ITEM_TYPES_LIST = ITEM_API_TYPE.map(function (v) {
         const type = v.id;
         if ([13, 22, 26, 28, 32, 33, 40, 42, 46].includes(type)) return { type: -99 };
         const data = { type: type, type2: 99, name: v.name, items: [] };

         if (type === 5) {
            // 魚雷に特殊潜航艇、潜水艦魚雷を含める
            data.name = '魚雷 / 特殊潜航艇';
            data.type2 = type;
            data.items = ITEM_DATA.filter(i => i.type === type || i.type === 22 || i.type === 32);
         }
         else if (type === 12) {
            // 小型電探に大型電探を含める
            data.name = '電探';
            data.type2 = type;
            data.items = ITEM_DATA.filter(i => i.type === type || i.type === 13);
         }
         else if (type === 14) {
            // 小型ソナーに大型ソナーを含める
            data.name = 'ソナー';
            data.type2 = type;
            data.items = ITEM_DATA.filter(i => i.type === type || i.type === 40);
         }
         else if (type === 24) {
            // 大発系 / 内火艇
            data.type2 = type;
            data.items = ITEM_DATA.filter(i => i.type === type || i.type === 46);
         }
         else if (type === 25) {
            // オートジャイロ / 哨戒機
            data.type2 = type;
            data.items = ITEM_DATA.filter(i => i.type === type || i.type === 26);
         }
         else if (type === 27) {
            // 小バルジに大バルジを含める
            data.name = '追加装甲(中型 / 大型)';
            data.type2 = type;
            data.items = ITEM_DATA.filter(i => i.type === type || i.type === 28);
         }
         else if (type === 29) {
            // 探照灯 / 照明弾 / 大型探照灯
            data.name = '探照灯 / 照明弾';
            data.items = ITEM_DATA.filter(i => i.type === type || i.type === 33 || i.type === 42);
         }
         else {
            // その他
            data.items = ITEM_DATA.filter(i => i.type === type);
            if (type === 1 || type === 2 || type === 3) data.type2 = 1; // 大分類 主砲
            else if (type === 4 || type === 21) data.type2 = 4; // 大分類 副砲, 機銃
            else if (type === 6) data.type2 = 6; // 大分類 艦戦
            else if (type === 7 || type === 8 || type === 57) data.type2 = 7; // 大分類 攻撃機
            else if (type === 9 || type === 10 || type === 11 || type === 41 || type === 45) data.type2 = 10; // 大分類 艦偵, 水上機
            else if (type === 14 || type === 15) data.type2 = 14; // 大分類 艦偵, 水上機
            else if (type === 24 || type === 30 || type === 46) data.type2 = 24; // 大分類 大発系
            else if (type === 24 || type === 30 || type === 46) data.type2 = 24; // 大分類 対地装備
            else if (type === 37) data.type2 = 37; // 大分類 対地装備
            else if (type === 47 || type === 48 || type === 49 || type === 53) data.type2 = 47; // 大分類 艦偵, 陸上機
         }

         data.items.sort((a, b) => a.type - b.type);
         return data;
      });

      ITEM_TYPES_LIST = ITEM_TYPES_LIST.filter(v => v.type >= 0);
   }

   // 所持装備
   const stockItems = loadPlaneStock();

   // 表示条件
   const noItemInvisible = document.getElementById('no_item_invisible')['checked'];
   const remodelMin = castInt(document.getElementById('remodel_min').value);
   const remodelMax = castInt(document.getElementById('remodel_max').value);
   const visibleTypes = $('#enabled_types').formSelect('getSelectedValues').map(v => castInt(v));

   const fragment = document.createDocumentFragment();
   for (const type of ITEM_TYPES_LIST) {
      if (visibleTypes.length && !visibleTypes.includes(type.type2)) {
         continue;
      }
      const container = createDiv('type_content general_box');
      container.dataset.type2Id = type.type2;

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
            for (let remodel = remodelMax; remodel >= remodelMin; remodel--) {
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

         if (sumCount || !noItemInvisible) {
            container.appendChild(item_container);
         }
      }

      fragment.appendChild(container);
   }

   document.getElementById('item_list').innerHTML = '';
   document.getElementById('item_list').appendChild(fragment);
}

/**
 * 装備種別で表示装備をフィルタリング
 */
function filterItemList() {
   const visibleTypes = $('#enabled_types').formSelect('getSelectedValues').map(v => castInt(v));
   const containers = document.getElementsByClassName('type_content');

   for (const container of containers) {
      if (visibleTypes.length && !visibleTypes.includes(castInt(container.dataset.type2Id))) {
         container.classList.add('d-none');
      }
      else {
         container.classList.remove('d-none');
      }
   }
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
   document.getElementById('edit_item_id').dataset.itemId = item.id;
   document.getElementById('edit_item_name').textContent = item.name;
   document.getElementById('img_plane_card').src = `../img/plane/${item.id}.png`;
   document.getElementById('img_plane_card').alt = item.name;
   document.getElementById('edit_item_fire').textContent = item.fire;
   document.getElementById('edit_item_antiAir').textContent = item.antiAir;
   document.getElementById('edit_item_torpedo').textContent = item.torpedo;
   document.getElementById('edit_item_bomber').textContent = item.bomber;
   document.getElementById('edit_item_armor').textContent = item.armor;
   document.getElementById('edit_item_asw').textContent = item.asw;
   document.getElementById('edit_item_accracy').textContent = item.accuracy;
   document.getElementById('edit_item_avoid').textContent = item.avoid2;
   document.getElementById('edit_item_scout').textContent = item.scout;

   const range = RANGES.find(v => v.id === item.range2);
   if (range && range.id > 0) {
      document.getElementById('edit_item_range').textContent = range.name;
      document.getElementById('edit_item_range').parentElement.classList.remove('d-none');
   }
   else {
      document.getElementById('edit_item_range').textContent = range.name;
      document.getElementById('edit_item_range').parentElement.classList.add('d-none');
   }
   if (item.radius) {
      document.getElementById('edit_item_radius').textContent = item.radius;
      document.getElementById('edit_item_radius').parentElement.classList.remove('d-none');
   }
   else {
      document.getElementById('edit_item_radius').parentElement.classList.add('d-none');
   }
   if (item.antiBomber) {
      document.getElementById('edit_item_antiBomber').textContent = item.antiBomber;
      document.getElementById('edit_item_antiBomber').parentElement.classList.remove('d-none');
      document.getElementById('edit_item_accracy').parentElement.classList.add('d-none');
   }
   else {
      document.getElementById('edit_item_antiBomber').parentElement.classList.add('d-none');
      document.getElementById('edit_item_accracy').parentElement.classList.remove('d-none');
   }
   if (item.interception) {
      document.getElementById('edit_item_interception').textContent = item.interception;
      document.getElementById('edit_item_interception').parentElement.classList.remove('d-none');
      document.getElementById('edit_item_avoid').parentElement.classList.add('d-none');
   }
   else {
      document.getElementById('edit_item_interception').parentElement.classList.add('d-none');
      document.getElementById('edit_item_avoid').parentElement.classList.remove('d-none');
   }

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
 * 所持機体数保存クリック
 */
function btn_save_item_stock_Clicked() {
   const planeStock = loadPlaneStock();
   const planeId = castInt(document.getElementById('edit_item_id').dataset.itemId);

   const numArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

   for (let remodel = 0; remodel <= 10; remodel++) {
      const element = document.getElementById('remodel_' + remodel);
      numArray[remodel] = castInt(element.value);
   }

   planeStock.find(v => v.id === planeId).num = numArray;
   saveLocalStorage('planeStock', planeStock);
   inform_success('所持数を更新しました。');
   initItemList();
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

/**
 * 表示改修値直接入力
 */
function setRemodelSlider() {
   const min = castInt(document.getElementById('remodel_min').value);
   const max = castInt(document.getElementById('remodel_max').value);
   document.getElementById('remodel_range').noUiSlider.set([min, min > max ? min : max]);
   initItemList();
}

/**
 * 所持艦娘反映クリック
 */
function btn_read_ship_Clicked() {
   const textBox = document.getElementById('ship_json_input');
   const inputData = textBox.value.trim();

   if (!inputData) {
      inform_danger('艦娘反映エリアが未入力です');
   }
   else if (readShipJson(inputData)) {
      initShipList();
      textBox.value = '';
      inform_success('所持装備情報を更新しました');
   }
   else if (readKantaiBunsekiJson(inputData)) {
      textBox.value = '';
      inform_success('所持装備情報を更新しました');
   }
   else {
      inform_danger('艦娘情報の読み込みに失敗しました。入力されたデータ形式が正しくない可能性があります');
   }
}

/**
 * 所持装備反映クリック
 */
function btn_read_item_Clicked() {
   const textBox = document.getElementById('item_json_input');
   const inputData = textBox.value.trim();

   if (!inputData) {
      inform_danger('装備反映エリアが未入力です');
   }
   else if (readEquipmentJson(inputData)) {
      initItemList();
      textBox.value = '';
      inform_success('所持装備情報を更新しました');
   }
   else {
      inform_danger('装備情報の読み込みに失敗しました。入力されたデータ形式が正しくない可能性があります');
   }
}
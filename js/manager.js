/** @type {{type: number, type2: number, name: string, items: any[], sort: string[]}[]} */
let ITEM_TYPES_LIST = [];

let timer = null;
document.addEventListener('DOMContentLoaded', function () {

   document.getElementById('ship_legacy')['checked'] = setting.managerViewMode !== 'table';
   document.getElementById('ship_table')['checked'] = setting.managerViewMode === 'table';

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

   document.getElementById('fleet_tab_container').classList.add('d-none');
   document.getElementById('fleet_tab_container').classList.remove('d-flex');
   // トップページへ
   document.getElementById('btn_top').addEventListener('click', () => { window.location.href = '../list/'; });
   // シミュページへ
   document.getElementById('btn_share').addEventListener('click', () => { window.location.href = '../simulator/'; });

   document.getElementById('btn_read_ship').addEventListener('click', btn_read_ship_Clicked);
   document.getElementById('btn_read_item').addEventListener('click', btn_read_item_Clicked);
   document.getElementById('btn_url_shorten').addEventListener('click', btn_url_shorten_Clicked);

   //　艦娘関連
   const levelSlider = document.getElementById('level_range');
   noUiSlider.create(levelSlider, {
      start: [1, 175], range: { 'min': 1, 'max': 175 }, connect: true, step: 1, orientation: 'horizontal',
      format: {
         to: (value) => castInt(value),
         from: (value) => castInt(value)
      }
   });
   levelSlider.noUiSlider.on('slide.one', (value) => {
      document.getElementById('level_min').value = value[0];
      document.getElementById('level_max').value = value[1];
   });
   levelSlider.noUiSlider.on('change.one', filterShipList);

   const luckSlider = document.getElementById('luck_range');
   noUiSlider.create(luckSlider, {
      start: [0, 200], range: { 'min': 0, 'max': 200 }, connect: true, step: 1, orientation: 'horizontal',
      format: {
         to: (value) => castInt(value),
         from: (value) => castInt(value)
      }
   });
   luckSlider.noUiSlider.on('slide.one', (value) => {
      document.getElementById('luck_min').value = value[0];
      document.getElementById('luck_max').value = value[1];
   });
   luckSlider.noUiSlider.on('change.one', filterShipList);
   $('#ships_filter').on('input', '#level_max', setLevelSlider);
   $('#ships_filter').on('input', '#level_min', setLevelSlider);
   $('#ships_filter').on('input', '#luck_max', setLuckSlider);
   $('#ships_filter').on('input', '#luck_min', setLuckSlider);
   $('#ships_filter').on('click', 'input[type="number"]', function () { $(this).select(); });
   $('#ships_filter').on('change', 'select', filterShipList);
   $('#ships_filter').on('change', '#no_ship_invisible', filterShipList);
   $('#ships_filter').on('click', '.filter_area', function () { filter_area_Clicked($(this)); });
   $('#ships_filter').on('change', '#ship_table', function (e) { if (e.target.checked) initShipList(); });
   $('#ships_filter').on('change', '#ship_legacy', function (e) { if (e.target.checked) initShipList(); });

   $('#ship_list').on('click', '.detail_container', function () { ship_detail_container_Clicked($(this)); });
   $('#ship_list').on('click', '.ship_table_tr:not(.header)', function () { ship_detail_container_Clicked($(this)); });

   $('#modal_ship_edit').on('change', '.version_radio', version_Changed);
   $('#modal_ship_edit').on('blur', '#ship_level', function () { ship_input_Leaved($(this)); });
   $('#modal_ship_edit').on('input', '#ship_level', function () { ship_input_Changed($(this)); });
   $('#modal_ship_edit').on('blur', '#ship_luck', function () { ship_input_Leaved($(this)); });
   $('#modal_ship_edit').on('input', '#ship_luck', function () { ship_input_Changed($(this)); });
   $('#modal_ship_edit').on('input', '#ship_level_range', function () { ship_level_range_Changed($(this)); });
   $('#modal_ship_edit').on('input', '#ship_luck_range', function () { ship_luck_range_Changed($(this)); });
   $('#modal_ship_edit').on('click', '#btn_level_99', btn_level_99_Clicked);
   $('#modal_ship_edit').on('click', '.selectable_area_banner', function () { area_banner_Clicked($(this)); });
   $('#modal_ship_edit').on('click', '#btn_create_ship', btn_create_ship_Clicked);
   $('#modal_ship_edit').on('click', '#btn_update_ship', btn_update_ship_Clicked);
   $('#modal_ship_edit').on('click', '#btn_delete_ship', btn_delete_ship_Clicked);

   // 装備関連
   const slider = document.getElementById('remodel_range');
   noUiSlider.create(slider, {
      start: [0, 10], range: { 'min': 0, 'max': 10 }, connect: true, step: 1, orientation: 'horizontal',
      format: {
         to: (value) => castInt(value),
         from: (value) => castInt(value)
      }
   });
   slider.noUiSlider.on('slide.one', (value) => {
      document.getElementById('remodel_min').value = value[0];
      document.getElementById('remodel_max').value = value[1];
   });
   slider.noUiSlider.on('change.one', filterItemList);
   $('#items_filter').on('input', 'input[type="number"]', setRemodelSlider);
   $('#items_filter').on('click', 'input[type="number"]', function () { $(this).select(); });
   $('#items_filter').on('change', '#enabled_types_container', filterItemList);
   $('#items_filter').on('change', '#no_item_invisible', filterItemList);

   $('#item_list').on('click', '.item_container', function () { item_container_Clicked($(this)); });
   $('#item_list').on('change', '.item_type_sort_container', function (e) { item_sort_Changed($(this), e); });

   $('#modal_item_edit').on('blur', 'input', function () { item_stock_Leaved($(this)); });
   $('#modal_item_edit').on('input', 'input', function () { item_stock_Changed($(this)); });
   $('#modal_item_edit').on('click', '#btn_save_item', btn_save_item_stock_Clicked);
   $('#modal_item_edit').on('click', '#btn_reset_item_stock', btn_reset_item_stock_Clicked);

   $('#others').on('click', 'textarea', function () { $(this).select(); });
   $('#others').on('click', '#btn_kantai_sarashi', getKantaiSarashi);

   initItemList();
   initShipList();
});


/**
 * 現在登録されている艦娘情報から所持艦娘一覧を再構築
 */
function initShipList() {
   if (document.getElementById('ship_table')['checked']) {
      // document.getElementById('ships_sort_container').classList.remove('d-none');
      initShipListTable();
      filterShipListTable();
      setting.managerViewMode = 'table';
      saveSetting();
      return;
   }

   setting.managerViewMode = 'legacy';
   saveSetting();

   document.getElementById('ships_sort_container').classList.add('d-none');

   // 所持装備
   const stockShips = loadShipStock();
   //　もう表示した艦娘
   const doneShipId = [];

   const fragment = document.createDocumentFragment();
   for (const ctype of API_CTYPE) {
      const container = createDiv('my-2 px-2 py-2 general_box ship_type_container');

      const header = createDiv('ship_type_header');
      header.textContent = ctype.name;
      container.appendChild(header);

      const ctypeBody = createDiv('ship_type_body');

      // 艦型で検索し、いったん最終改造状態のみ取得
      const ships = SHIP_DATA.filter(v => v.type2 === ctype.id && v.final);
      for (const ship of ships) {
         const versions = SHIP_DATA.filter(v => v.orig === ship.orig);
         if (!versions.length) break;

         const shipContainer = createDiv('ship_container general_box');
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
            verContainer.dataset.shipType = ver.type;
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
                  detailContainer.dataset.shipId = ver.id;
                  detailContainer.dataset.uniqueId = detail.id;

                  if (detail.lv === 175) detailContainer.classList.add('lv_max2');
                  else if (detail.lv > 99) detailContainer.classList.add('lv_100');
                  else if (detail.lv === 99) detailContainer.classList.add('lv_max');

                  let asw = 0;
                  if (detail.lv === 99 && ver.max_asw > 0) {
                     // Lv99ステ
                     asw = ver.max_asw;
                  }
                  else if (ver.max_asw > 0) {
                     // Lv99以外 算出可能な場合
                     asw = Math.floor((ver.max_asw - ver.asw) * (detail.lv / 99) + ver.asw);
                  }
                  else {
                     // 算出不可
                     asw = 0;
                  }

                  detailContainer.innerHTML = `
                  <div class="d-flex">
                     <div class="ship_lv" data-level="${detail.lv}">${detail.lv}</div>
                  </div>
                  <div class="d-flex">
                     <div class="detail_ship_label_img"><img src="../img/util/status_hp.png"></div>
                     <div class="detail_ship_status remodel_hp" data-remodel-hp="${detail.st[5]}">${(detail.lv > 99 ? ver.hp2 : ver.hp) + detail.st[5]}</div>
                  </div>
                  <div class="d-flex">
                     <div class="detail_ship_label_img"><img src="../img/util/status_asw.png"></div>
                     <div class="detail_ship_status remodel_asw" data-remodel-asw="${detail.st[6]}">${asw > 0 ? asw + detail.st[6] : '-'}</div>
                  </div>
                  <div class="d-flex">
                     <div class="detail_ship_label_img"><img src="../img/util/status_luck.png"></div>
                     <div class="detail_ship_status remodel_luck" data-luck="${ver.luck + detail.st[4]}">${ver.luck + detail.st[4]}</div>
                  </div>
                  ${detail.area < 1 ? '<div class="sally_area"></div>' : `<div class="sally_area" data-area="${detail.area}"><img src="../img/util/area${detail.area}.png"></div>`}`;
                  verContainer.appendChild(detailContainer);
               }
               done = true;
               shipContainer.appendChild(verContainer);
            }
            else if (!done) {
               // 完全に未所持
               const detailContainer = createDiv('detail_container no_ship');
               detailContainer.dataset.shipId = ver.id;
               detailContainer.dataset.uniqueId = -1;
               detailContainer.innerHTML = `<div>新規登録</div>
               <div class="ship_lv d-none" data-level="1"></div>
               <div class="remodel_hp d-none" data-remodel-hp="0"></div>
               <div class="remodel_asw d-none" data-remodel-asw="0"></div>
               <div class="remodel_luck d-none" data-luck="${ver.luck}"></div>
               <div class="sally_area d-none" data-area="0"></div>
               `;
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
   document.getElementById('ship_list').classList.add('d-flex');
   document.getElementById('ship_list').appendChild(fragment);

   filterShipList();
}

/**
 * 現在登録されている艦娘情報から所持艦娘一覧を再構築　テーブル形式
 */
function initShipListTable() {
   const sortKey = document.getElementById('ships_sort').value;
   // 所持装備
   const stockShips = loadShipStock();
   const fragment = document.createDocumentFragment();
   let defaultIndex = 0;
   // ヘッダー
   const header = createDiv('ship_table_tr d-flex header');
   header.innerHTML = `<div class="ship_table_td_name">艦娘</div>
   <div class="ship_table_td_status">Lv.</div>
   <div class="ship_table_td_status">耐久</div>
   <div class="ship_table_td_status">運</div>
   <div class="ship_table_td_status">対潜</div>
   <div class="ship_table_td_status">命中項</div>
   <div class="ship_table_td_status">回避項</div>
   <div class="ship_table_td_status">CI項</div>`;
   fragment.appendChild(header);

   let baseShips = [];

   switch (sortKey) {
      case "port":
         for (const ctype of API_CTYPE) {
            baseShips = baseShips.concat(SHIP_DATA.filter(v => v.type2 === ctype.id));
         }
         break;
      default:
         for (const ctype of API_CTYPE) {
            baseShips = baseShips.concat(SHIP_DATA.filter(v => v.type2 === ctype.id));
         }
         break;
   }

   for (const ship of baseShips) {
      const stock = stockShips.find(v => v.id === ship.id);

      if (stock && stock.details.length) {
         stock.details.sort((a, b) => b.lv - a.lv);
         for (const detail of stock.details) {
            const luck = ship.luck + detail.st[4];

            const tr = createDiv('ship_table_tr d-flex');
            tr.dataset.shipId = ship.id;
            tr.dataset.shipType = ship.type;
            tr.dataset.uniqueId = detail.id;
            tr.dataset.level = detail.lv;
            tr.dataset.luck = luck;
            tr.dataset.remodelHp = detail.st[5];
            tr.dataset.remodelAsw = detail.st[6];
            tr.dataset.area = detail.area;
            tr.dataset.index = defaultIndex++;

            if (detail.lv === 175) tr.classList.add('lv175');
            else if (detail.lv > 99) tr.classList.add('lv100');
            else if (detail.lv === 99) tr.classList.add('lv99');

            const tdImage = createDiv('ship_table_td_name d-flex flex-wrap');
            tdImage.innerHTML = `
               <div class="align-self-center ship_table_td_image mr-1">
                  <img src="../img/ship/${ship.id}.png" alt="${ship.name}">
                  ${detail.area >= 0 ? `<img class="area_banner" src="../img/util/area${detail.area}.png" alt="${detail.area}">` : ''}
               </div>
               <div class="align-self-center">${ship.name}</div>`;
            tr.appendChild(tdImage);

            const tdLevel = createDiv('ship_table_td_status');
            tdLevel.textContent = detail.lv;
            tr.appendChild(tdLevel);

            const tdHP = createDiv('ship_table_td_status');
            tdHP.textContent = ship.hp + detail.st[5];
            tr.appendChild(tdHP);

            const tdLuck = createDiv('ship_table_td_status');
            tdLuck.textContent = luck;
            tr.appendChild(tdLuck);

            let asw = 0;
            if (detail.lv === 99 && ship.max_asw > 0) asw = ship.max_asw;
            else if (ship.max_asw > 0) asw = Math.floor((ship.max_asw - ship.asw) * (detail.lv / 99) + ship.asw);
            else asw = 0;
            const tdAsw = createDiv('ship_table_td_status');
            tdAsw.textContent = asw + detail.st[6];
            tr.appendChild(tdAsw);

            // 命中項(ステータス部分のみ)
            const tdAccuracy = createDiv('ship_table_td_status');
            tdAccuracy.textContent = Math.floor(2 * Math.sqrt(detail.lv) + 1.5 * Math.sqrt(luck));
            tr.appendChild(tdAccuracy);

            let avoid = 0;
            if (detail.lv === 99 && ship.max_avoid > 0) avoid = ship.max_avoid;
            else if (ship.max_avoid > 0) avoid = Math.floor((ship.max_avoid - ship.avoid) * (detail.lv / 99) + ship.avoid);
            else avoid = 0;

            // 回避項(ステータス部分のみ)
            const tdAvoid = createDiv('ship_table_td_status');
            const baseAvoid = Math.floor(avoid + Math.sqrt(2 * luck));
            if (baseAvoid >= 65) {
               tdAvoid.textContent = Math.floor(55 + 2 * Math.sqrt(baseAvoid - 65));
            }
            else if (baseAvoid >= 45) {
               tdAvoid.textContent = Math.floor(40 + 3 * Math.sqrt(baseAvoid - 40));
            }
            else {
               tdAvoid.textContent = baseAvoid;
            }
            tr.appendChild(tdAvoid);

            // CI項(ステータス部分のみ)
            const tdCI = createDiv('ship_table_td_status');
            if (luck >= 50) {
               tdCI.textContent = Math.floor(65 + Math.sqrt(luck - 50) + 0.8 * Math.sqrt(detail.lv));
            }
            else {
               tdCI.textContent = Math.floor(15 + luck + 0.75 * Math.sqrt(detail.lv));
            }
            tr.appendChild(tdCI);
            fragment.appendChild(tr);
         }
      }
      else if (ship.ver === 0) {
         // 新規登録用フォームが必要かチェック
         const versions = SHIP_DATA.filter(v => v.orig === ship.id).map(v => v.id);
         if (stockShips.find(v => versions.includes(v.id) && v.details.length)) {
            continue;
         }

         const tr = createDiv('ship_table_tr d-flex no_ship');
         const luck = ship.luck;
         tr.dataset.shipId = ship.id;
         tr.dataset.shipType = ship.type;
         tr.dataset.uniqueId = '';
         tr.dataset.level = 1;
         tr.dataset.luck = ship.luck;
         tr.dataset.remodelHp = 0;
         tr.dataset.remodelAsw = 0;
         tr.dataset.area = 0;
         tr.dataset.orig = ship.id;
         tr.dataset.index = defaultIndex++;

         const tdImage = createDiv('ship_table_td_name d-flex flex-wrap');
         tdImage.innerHTML = `
            <div class="align-self-center ship_table_td_image mr-1">
               <img src="../img/ship/${ship.id}.png" alt="${ship.name}">
            </div>
            <div class="align-self-center">${ship.name}</div>`;
         tr.appendChild(tdImage);

         const tdLevel = createDiv('ship_table_td_status');
         tdLevel.textContent = 1;
         tr.appendChild(tdLevel);

         const tdHP = createDiv('ship_table_td_status');
         tdHP.textContent = ship.hp;
         tr.appendChild(tdHP);

         const tdLuck = createDiv('ship_table_td_status');
         tdLuck.textContent = luck;
         tr.appendChild(tdLuck);

         const tdAsw = createDiv('ship_table_td_status');
         tdAsw.textContent = ship.asw ? ship.asw : 0;
         tr.appendChild(tdAsw);

         // 命中項(ステータス部分のみ)
         const tdAccuracy = createDiv('ship_table_td_status');
         tdAccuracy.textContent = Math.floor(2 * Math.sqrt(1) + 1.5 * Math.sqrt(luck));
         tr.appendChild(tdAccuracy);

         const avoid = ship.avoid ? ship.avoid : 0;
         // 回避項(ステータス部分のみ)
         const tdAvoid = createDiv('ship_table_td_status');
         const baseAvoid = Math.floor(avoid + Math.sqrt(2 * luck));
         if (baseAvoid >= 65) {
            tdAvoid.textContent = Math.floor(55 + 2 * Math.sqrt(baseAvoid - 65));
         }
         else if (baseAvoid >= 45) {
            tdAvoid.textContent = Math.floor(40 + 3 * Math.sqrt(baseAvoid - 40));
         }
         else {
            tdAvoid.textContent = baseAvoid;
         }
         tr.appendChild(tdAvoid);

         // CI項(ステータス部分のみ)
         const tdCI = createDiv('ship_table_td_status');
         if (luck >= 50) {
            tdCI.textContent = Math.floor(65 + Math.sqrt(luck - 50) + 0.8 * Math.sqrt(1));
         }
         else {
            tdCI.textContent = Math.floor(15 + luck + 0.75 * Math.sqrt(1));
         }
         tr.appendChild(tdCI);

         fragment.appendChild(tr);
      }
   }

   document.getElementById('ship_list').innerHTML = '';
   document.getElementById('ship_list').classList.remove('d-flex');
   document.getElementById('ship_list').appendChild(fragment);
}

/**
 * 艦娘フィルターによる表示物変更
 */
function filterShipList() {
   if (document.getElementById('ship_table')['checked']) {
      filterShipListTable();
      return;
   }
   // 表示条件
   const noShipInvisible = document.getElementById('no_ship_invisible')['checked'];
   const levelMin = castInt(document.getElementById('level_min').value);
   const levelMax = castInt(document.getElementById('level_max').value);
   const luckMin = castInt(document.getElementById('luck_min').value);
   const luckMax = castInt(document.getElementById('luck_max').value);
   const visibleTypes = $('#enabled_ship_types').formSelect('getSelectedValues').map(v => castInt(v));
   const remodelHps = $('#ship_remodel_hps').formSelect('getSelectedValues').map(v => castInt(v));
   const remodelAwses = $('#ship_remodel_awses').formSelect('getSelectedValues').map(v => castInt(v));
   const areas = [];
   $('.filter_area.selected').each((i, e) => {
      areas.push(castInt($(e)[0].dataset.area));
   });

   const containers = document.getElementsByClassName('ship_type_container');
   for (const container of containers) {
      for (const origParent of container.getElementsByClassName('ship_container')) {
         for (const verParent of container.getElementsByClassName('version_container')) {
            if (visibleTypes.length && !visibleTypes.includes(castInt(verParent.dataset.shipType))) {
               verParent.classList.add('d-none');
               continue;
            }
            else {
               verParent.classList.remove('d-none');
            }

            for (const detail of verParent.getElementsByClassName('detail_container')) {
               if (noShipInvisible && detail.classList.contains('no_ship')) {
                  detail.classList.add('d-none');
                  continue;
               }

               const lv = castInt(detail.getElementsByClassName('ship_lv')[0].dataset.level);
               const luck = castInt(detail.getElementsByClassName('remodel_luck')[0].dataset.luck);
               const remodelHp = castInt(detail.getElementsByClassName('remodel_hp')[0].dataset.remodelHp);
               const remodelAsw = castInt(detail.getElementsByClassName('remodel_asw')[0].dataset.remodelAsw);
               const area = castInt(detail.getElementsByClassName('sally_area')[0].dataset.area);

               // Lv条件
               if (lv < levelMin || lv > levelMax) {
                  detail.classList.add('d-none');
               }
               // 運改修条件
               else if (luck < luckMin || luck > luckMax) {
                  detail.classList.add('d-none');
               }
               // 耐久改修条件
               else if (remodelHps.length && !remodelHps.includes(remodelHp)) {
                  detail.classList.add('d-none');
               }
               // 対潜改修条件
               else if (remodelAwses.length && !remodelAwses.includes(remodelAsw)) {
                  detail.classList.add('d-none');
               }
               // 出撃海域条件
               else if (!areas.includes(area)) {
                  detail.classList.add('d-none');
               }
               else {
                  detail.classList.remove('d-none');
               }
            }
            if ($(verParent).find('.detail_container:not(.d-none)').length) {
               // 子に非表示でない者が1件でもあれば表示
               verParent.classList.remove('d-none');
            }
            else {
               // 子がないので非表示
               verParent.classList.add('d-none');
            }
         }

         if ($(origParent).find('.version_container:not(.d-none)').length) {
            // 子に非表示でない者が1件でもあれば表示
            origParent.classList.remove('d-none');
         }
         else {
            // 子がないので非表示
            origParent.classList.add('d-none');
         }
      }

      if ($(container).find('.ship_container:not(.d-none)').length) {
         // 子に非表示でない者が1件でもあれば表示
         container.classList.remove('d-none');
      }
      else {
         // 子がないので非表示
         container.classList.add('d-none');
      }
   }
}

/**
 * 艦娘フィルターによる表示物変更
 */
function filterShipListTable() {
   // 表示条件
   const noShipInvisible = document.getElementById('no_ship_invisible')['checked'];
   const levelMin = castInt(document.getElementById('level_min').value);
   const levelMax = castInt(document.getElementById('level_max').value);
   const luckMin = castInt(document.getElementById('luck_min').value);
   const luckMax = castInt(document.getElementById('luck_max').value);
   const visibleTypes = $('#enabled_ship_types').formSelect('getSelectedValues').map(v => castInt(v));
   const remodelHps = $('#ship_remodel_hps').formSelect('getSelectedValues').map(v => castInt(v));
   const remodelAwses = $('#ship_remodel_awses').formSelect('getSelectedValues').map(v => castInt(v));
   const areas = [];
   $('.filter_area.selected').each((i, e) => {
      const area = castInt($(e)[0].dataset.area);
      areas.push(area);
      if (area === 0) areas.push(-1);
   });

   const trs = document.getElementsByClassName('ship_table_tr');
   for (const tr of trs) {
      if (tr.classList.contains('header')) {
         continue;
      }
      const shipType = castInt(tr.dataset.shipType);
      const lv = castInt(tr.dataset.level);
      const luck = castInt(tr.dataset.luck);
      const remodelHp = castInt(tr.dataset.remodelHp);
      const remodelAsw = castInt(tr.dataset.remodelAsw);
      const area = castInt(tr.dataset.area);

      if (visibleTypes.length && !visibleTypes.includes(castInt(shipType))) {
         tr.classList.add('d-none');
      }
      // Lv条件
      else if (lv < levelMin || lv > levelMax) {
         tr.classList.add('d-none');
      }
      // 運改修条件
      else if (luck < luckMin || luck > luckMax) {
         tr.classList.add('d-none');
      }
      // 耐久改修条件
      else if (remodelHps.length && !remodelHps.includes(remodelHp)) {
         tr.classList.add('d-none');
      }
      // 対潜改修条件
      else if (remodelAwses.length && !remodelAwses.includes(remodelAsw)) {
         tr.classList.add('d-none');
      }
      // 出撃海域条件
      else if (!areas.includes(area)) {
         tr.classList.add('d-none');
      }
      else if (noShipInvisible && tr.classList.contains('no_ship')) {
         tr.classList.add('d-none');
      }
      else {
         tr.classList.remove('d-none');
      }
   }
}

/**
 * 艦娘フィルタ　札クリック
 * @param {*} $this
 */
function filter_area_Clicked($this) {
   $this.toggleClass('selected');
   filterShipList();
}

/**
 * 表示Lv直接入力
 */
function setLevelSlider() {
   const min = castInt(document.getElementById('level_min').value);
   const max = castInt(document.getElementById('level_max').value);
   document.getElementById('level_range').noUiSlider.set([min, min > max ? min : max]);
   filterShipList();
}

/**
 * 表示運直接入力
 */
function setLuckSlider() {
   const min = castInt(document.getElementById('luck_min').value);
   const max = castInt(document.getElementById('luck_max').value);
   document.getElementById('luck_range').noUiSlider.set([min, min > max ? min : max]);
   filterShipList();
}

function initItemTypes() {
   ITEM_TYPES_LIST = ITEM_API_TYPE.map(function (v) {
      const type = v.id;
      if ([13, 22, 26, 28, 32, 33, 40, 42, 46].includes(type)) return { type: -99 };
      const data = { type: type, type2: 99, name: v.name, items: [], sort: [] };

      if (type === 5) {
         // 魚雷に特殊潜航艇、潜水艦魚雷を含める
         data.name = '魚雷 / 特殊潜航艇';
         data.type2 = type;
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 22 || i.type === 32);
         data.sort = ['torpedo'];
      }
      else if (type === 12) {
         // 小型電探に大型電探を含める
         data.name = '電探';
         data.type2 = type;
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 13);
         data.sort = ['scout', 'accuracy'];
      }
      else if (type === 14) {
         // 小型ソナーに大型ソナーを含める
         data.name = 'ソナー';
         data.type2 = type;
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 40);
         data.sort = ['asw'];
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
         data.sort = ['asw'];
      }
      else if (type === 27) {
         // 小バルジに大バルジを含める
         data.name = '追加装甲(中型 / 大型)';
         data.type2 = type;
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 28);
         data.sort = ['armor'];
      }
      else if (type === 29) {
         // 探照灯 / 照明弾 / 大型探照灯
         data.name = '探照灯 / 照明弾';
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 33 || i.type === 42);
      }
      else {
         // その他
         data.items = ITEM_DATA.filter(i => i.type === type);
         if (type === 1 || type === 2 || type === 3) {
            data.type2 = 1; // 大分類 主砲
            data.sort = ['fire', 'accuracy'];
         }
         else if (type === 4 || type === 21) {
            data.type2 = 4; // 大分類 副砲, 機銃
            data.sort = ['fire', 'antiAir', 'accuracy'];
         }
         else if (type === 14 || type === 15) {
            data.type2 = 14; // 大分類 対潜装備
            data.sort = ['asw'];
         }
         else if (type === 6) data.type2 = 6; // 大分類 艦戦
         else if (type === 7 || type === 8 || type === 57) data.type2 = 7; // 大分類 攻撃機
         else if (type === 9 || type === 10 || type === 11 || type === 41 || type === 45) data.type2 = 10; // 大分類 艦偵, 水上機
         else if (type === 24 || type === 30 || type === 46) data.type2 = 24; // 大分類 大発系
         else if (type === 37) data.type2 = 37; // 大分類 対地装備
         else if (type === 47 || type === 48 || type === 49 || type === 53) data.type2 = 47; // 大分類 艦偵, 陸上機
      }

      // ソート項目付与
      if (FIGHTERS.includes(data.type)) {
         data.sort.push('antiAir');
         if (data.type > 47) {
            data.sort.push('interception');
            data.sort.push('antiBomber');
         }
      }
      if (data.type === 8 || data.type === 47) {
         data.sort.push('torpedo');
      }
      if (ATTACKERS.includes(data.type)) {
         data.sort.push('bomber');
         data.sort.push('antiAir');
      }
      if (RECONNAISSANCES.includes(data.type)) {
         data.sort.push('scout');
      }
      if (PLANE_TYPE.includes(data.type)) {
         data.sort.push('radius');
      }

      data.items.sort((a, b) => a.type - b.type);
      return data;
   });

   ITEM_TYPES_LIST = ITEM_TYPES_LIST.filter(v => v.type >= 0);
}

/**
 * 現在登録されている装備情報から所持装備一覧を再構築
 */
function initItemList() {
   if (!ITEM_TYPES_LIST.length) {
      initItemTypes();
   }

   // 所持装備
   const stockItems = loadPlaneStock();

   // selectいったん除去
   $('.item_type_sort').formSelect('destroy');

   const fragment = document.createDocumentFragment();
   for (const type of ITEM_TYPES_LIST) {
      const container = createDiv('type_content general_box');
      container.dataset.type2Id = type.type2;

      const header = createDiv('item_type_header d-flex');
      header.innerHTML = `
      <div><img src="../img/type/type${type.type}${type.type === 17 ? '-alt2' : ''}.png" class="item_type_img" alt="${type.name}"></div>
      <div class="ml-2">${type.name}</div>
      <div class="ml-auto"><i class="fa-sort-amount-desc"></i></div>
      <div class="input-field ml-2 item_type_sort_container">
         <select class="item_type_sort">
            <option value="id">図鑑</option>
            ${type.sort.length ? type.sort.map(v => `<option value="${v}">${convertHeaderText(v)}</option>`).join('') : ''}
         </select>
      </div>`;
      container.appendChild(header);

      for (const item of type.items) {
         const item_container = createDiv('item_container');
         item_container.dataset.itemId = item.id;
         if (type.sort.length) {
            for (const key of type.sort) {
               item_container.dataset[key] = item[key];
            }
         }

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
                  remodel_div.dataset.remodel = remodel;
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

   filterItemList();

   $('.item_type_sort').formSelect();
}

/**
 * 艦娘フィルターによる表示物変更
 */
function filterItemList() {
   // 表示条件
   const noItemInvisible = document.getElementById('no_item_invisible')['checked'];
   const remodelMin = castInt(document.getElementById('remodel_min').value);
   const remodelMax = castInt(document.getElementById('remodel_max').value);
   const visibleTypes = $('#enabled_types').formSelect('getSelectedValues').map(v => castInt(v));

   const containers = document.getElementsByClassName('type_content');
   for (const container of containers) {
      if (visibleTypes.length && !visibleTypes.includes(castInt(container.dataset.type2Id))) {
         container.classList.add('d-none');
         continue;
      }
      else {
         container.classList.remove('d-none');
      }

      for (const itemContainer of container.getElementsByClassName('item_container')) {
         if (noItemInvisible && itemContainer.classList.contains('no_item')) {
            itemContainer.classList.add('d-none');
            continue;
         }
         for (const detail of itemContainer.getElementsByClassName('item_detail')) {
            const remodel = castInt(detail.getElementsByClassName('item_remodel')[0].dataset.remodel);
            if (remodel < remodelMin || remodel > remodelMax) {
               detail.classList.add('d-none');
            }
            else {
               detail.classList.remove('d-none');
            }
         }
         if (!$(itemContainer).find('.item_detail').length || $(itemContainer).find('.item_detail:not(.d-none)').length) {
            // 子に非表示でない者が1件でもあれば表示
            itemContainer.classList.remove('d-none');
         }
         else {
            // 子がないので非表示
            itemContainer.classList.add('d-none');
         }
      }

      if ($(container).find('.item_container:not(.d-none)').length) {
         // 子に非表示でない者が1件でもあれば表示
         container.classList.remove('d-none');
      }
      else {
         // 子がないので非表示
         container.classList.add('d-none');
      }
   }
}

/**
 * 装備ソート変更時
 * @param {*} $this
 */
function item_sort_Changed($this, e) {
   /** @type {HTMLElement} */
   const parent = $this.closest('.type_content')[0];
   const items = parent.getElementsByClassName('item_container');
   const containers = Array.prototype.slice.call(items);

   const sortKey = `${e.target.value}`;
   if (sortKey === 'id') {
      // 図鑑は昇順
      containers.sort((a, b) => castInt(a.dataset.itemId) - castInt(b.dataset.itemId));
   }
   else {
      containers.sort((a, b) => castInt(b.dataset[sortKey]) - castInt(a.dataset[sortKey]));
   }
   for (var i = 0; i < containers.length; i++) {
      parent.appendChild(parent.removeChild(containers[i]))
   }
}

/**
 * 艦娘一覧内　クリック
 * @param {*} $this
 */
function ship_detail_container_Clicked($this) {
   const stocks = loadShipStock();
   const shipId = castInt($this[0].dataset.shipId);
   const uniqueId = castInt($this[0].dataset.uniqueId);
   const raw = SHIP_DATA.find(v => v.id === shipId);
   if (!raw) return;

   const versions = SHIP_DATA.filter(v => v.orig === raw.orig).sort((a, b) => a.ver - b.ver);
   // 改装段階リスト
   const fragment = document.createDocumentFragment();

   const ship_selector = createDiv('version_selector d-flex');

   const img_container = createDiv('version_img_container');
   const ship_img = document.createElement('img');
   ship_img.src = `../img/ship/${shipId}.png`;
   ship_img.alt = raw.name;
   img_container.appendChild(ship_img)
   ship_selector.appendChild(img_container);

   const selectors_container = createDiv('align-self-center d-flex flex-wrap');
   for (const ship of versions) {
      const select_container = createDiv('')

      const version_select = document.createElement('label');
      version_select.className = 'ml-2';
      version_select.dataset.shipId = ship.id;
      version_select.innerHTML = `
      <input class="with-gap version_radio" name="version" type="radio" ${(ship.id === shipId) ? 'checked' : ''} data-ship-id="${ship.id}"/>
      <span>${ship.name}</span>`;

      select_container.appendChild(version_select);
      selectors_container.appendChild(select_container);
   }
   ship_selector.appendChild(selectors_container);

   fragment.appendChild(ship_selector);

   const list = document.getElementById('ship_version_list')
   list.innerHTML = ''
   list.appendChild(fragment);

   document.getElementById('ship_level').value = 1;
   document.getElementById('ship_level_range').value = 1;
   document.getElementById('ship_luck_range').max = raw.max_luck;
   document.getElementById('ship_luck').max = raw.max_luck;
   document.getElementById('ship_luck_range').min = raw.luck;
   document.getElementById('ship_luck').min = raw.luck;
   document.getElementById('ship_remodel_hp').value = '';
   document.getElementById('ship_remodel_asw').value = '';
   $('.selectable_area_banner.selected').removeClass('selected');

   if (uniqueId > 0) {
      const stock = stocks.find(v => v.id === shipId && v.details.some(x => x.id === uniqueId));
      if (stock) {
         const detail = stock.details.find(v => v.id === uniqueId);
         document.getElementById('ship_level').value = detail.lv;
         document.getElementById('ship_level_range').value = detail.lv;
         document.getElementById('ship_luck').value = raw.luck + detail.st[4];
         document.getElementById('ship_luck_range').value = raw.luck + detail.st[4];
         if (detail.st[5]) document.getElementById('ship_remodel_hp').value = detail.st[5];
         if (detail.st[6]) document.getElementById('ship_remodel_asw').value = detail.st[6];

         document.getElementById('modal_ship_edit').dataset.editShipId = uniqueId;

         if ($(`.selectable_area_banner[data-area="${detail.area}"`).length) {
            $(`.selectable_area_banner[data-area="${detail.area}"`).addClass('selected');
         }

         document.getElementById('btn_update_ship')['disabled'] = false;
         document.getElementById('btn_delete_ship')['disabled'] = false;
      }
   }
   else {
      document.getElementById('ship_luck').value = raw.luck;
      document.getElementById('ship_luck_range').value = raw.luck;

      document.getElementById('btn_update_ship')['disabled'] = true;
      document.getElementById('btn_delete_ship')['disabled'] = true;
   }

   $('#modal_ship_edit').modal('open');
}

/**
 * 艦娘入力欄 改装状態変更
 */
function version_Changed() {
   const shipId = castInt($('#modal_ship_edit').find('.version_radio:checked')[0].dataset.shipId);
   const ship = SHIP_DATA.find(v => v.id === shipId);
   if (ship) {
      $('.version_img_container').find('img').attr('src', `../img/ship/${ship.id}.png`);
      $('.version_img_container').find('img').attr('alt', ship.name);

      document.getElementById('ship_luck_range').min = ship.luck;
      document.getElementById('ship_luck_range').max = ship.max_luck;
      document.getElementById('ship_luck').min = ship.luck;
      document.getElementById('ship_luck').max = ship.max_luck;
      const value = castInt(document.getElementById('ship_luck').value);
      if (value < ship.luck || value > ship.max_luck) {
         document.getElementById('ship_luck').value = ship.luck;
         document.getElementById('ship_luck_range').value = ship.luck;
      }
   }
}


/**
 * 艦娘練度 フォーカスアウト
 * @param {*} $this
 */
function ship_input_Leaved($this) {
   const max = castInt($this.attr('max'));
   const min = castInt($this.attr('min'));
   let input = castInt($this.val());

   if (input < min) {
      input = min;
      $this.val(min);
      $this.next().addClass('active');
   }
   else if (input >= max) {
      input = max;
      $this.val(max);
   }
   document.getElementById($this.attr('id') + '_range').value = input;
}

/**
 * 艦娘練度 入力欄入力時
 * @param {*} $this
 */
function ship_input_Changed($this) {
   const max = castInt($this.attr('max'));
   const min = castInt($this.attr('min'));
   let input = castInt($this.val());

   if (input < min) {
      input = min;
      $this.val('');
   }
   else if (input >= max) {
      input = max;
      $this.val(max);
   }
   document.getElementById($this.attr('id') + '_range').value = input;
}

/**
 * 99レベルにするだけ
 */
function btn_level_99_Clicked() {
   document.getElementById('ship_level').value = 99;
   document.getElementById('ship_level_range').value = 99;
}

/**
 * 艦娘練度バー 入力欄入力時
 * @param {*} $this
 */
function ship_level_range_Changed($this) {
   document.getElementById('ship_level').value = castInt($this.val());
}

/**
 * 艦娘運バー 入力欄入力時
 * @param {*} $this
 */
function ship_luck_range_Changed($this) {
   document.getElementById('ship_luck').value = castInt($this.val());
}

/**
 * 艦娘 お札クリック
 * @param {*} $this
 */
function area_banner_Clicked($this) {
   if ($this.hasClass('selected')) {
      $this.removeClass('selected');
   }
   else {
      $('.selectable_area_banner').removeClass('selected');
      $this.addClass('selected');
   }
}

/**
 * 艦娘 着任クリック
 */
function btn_create_ship_Clicked() {
   const shipId = castInt($('#modal_ship_edit').find('.version_radio:checked')[0].dataset.shipId);
   const raw = SHIP_DATA.find(v => v.id === shipId);
   const lv = castInt(document.getElementById('ship_level').value);
   const exp = LEVEL_BORDERS.find(v => v.lv === lv).req;
   const luck = castInt(document.getElementById('ship_luck').value) - raw.luck;
   const hp = castInt(document.getElementById('ship_remodel_hp').value);
   const asw = castInt(document.getElementById('ship_remodel_asw').value);
   const selectedArea = $('.selectable_area_banner.selected');
   const area = selectedArea.length ? castInt(selectedArea[0].dataset.area) : -1;

   const stockShips = loadShipStock();

   // 新しいid(最大値+1)
   const newUniqueId = stockShips.reduce((acc, v) => {
      for (const detail of v.details) {
         if (acc <= detail.id) acc = detail.id + 1;
      }
      return acc;
   }, 0);

   const newStock = stockShips.find(v => v.id === shipId);
   const newDetail = { id: newUniqueId, lv: lv, exp: exp, st: [0, 0, 0, 0, luck, hp, asw], area: area };

   if (newStock) {
      newStock.details.push(newDetail);
   }
   else {
      stockShips.push({ id: shipId, details: [newDetail] });
   }

   document.getElementById('modal_ship_edit').dataset.editShipId = newUniqueId;
   document.getElementById('btn_update_ship')['disabled'] = false;
   document.getElementById('btn_delete_ship')['disabled'] = false;

   saveLocalStorage('shipStock', stockShips);
   inform_success(raw.name + 'が着任しました。');
   initShipList();
}

/**
 * 艦娘 更新クリック
 */
function btn_update_ship_Clicked() {
   const shipId = castInt($('#modal_ship_edit').find('.version_radio:checked')[0].dataset.shipId);
   const uniqueId = castInt(document.getElementById('modal_ship_edit').dataset.editShipId);

   const newRaw = SHIP_DATA.find(v => v.id === shipId);
   const lv = castInt(document.getElementById('ship_level').value);
   const exp = LEVEL_BORDERS.find(v => v.lv === lv).req;
   const luck = castInt(document.getElementById('ship_luck').value) - newRaw.luck;
   const hp = castInt(document.getElementById('ship_remodel_hp').value);
   const asw = castInt(document.getElementById('ship_remodel_asw').value);
   const selectedArea = $('.selectable_area_banner.selected');
   const area = selectedArea.length ? castInt(selectedArea[0].dataset.area) : -1;

   if (uniqueId > 0) {
      let stockShips = loadShipStock();
      const oldStockIndex = stockShips.findIndex(v => v.details.some(x => x.id === uniqueId));
      if (oldStockIndex >= 0) {
         const oldStock = stockShips[oldStockIndex];
         if (oldStock.id !== shipId) {
            // 改装状態が変わったため削除
            oldStock.details = oldStock.details.filter(v => v.id !== uniqueId);

            // 明細がまだあるか？
            if (oldStock.details.length) {
               stockShips[oldStockIndex] = oldStock;
            }
            else {
               // 全明細が消えたのでヘッダーも消す
               stockShips = stockShips.filter(v => v.id !== oldStock.id);
            }

            // 新しいid(最大値+1)
            const newUniqueId = stockShips.reduce((acc, v) => {
               for (const detail of v.details) {
                  if (acc <= detail.id) acc = detail.id + 1;
               }
               return acc;
            }, 0);

            // 新しい方のヘッダーがあるかチェック
            const newStock = stockShips.find(v => v.id === shipId);
            const newDetail = { id: newUniqueId, lv: lv, exp: exp, st: [0, 0, 0, 0, luck, hp, asw], area: area };
            if (newStock) {
               newStock.details.push(newDetail);
            }
            else {
               stockShips.push({ id: shipId, details: [newDetail] });
            }
         }
         else {
            //　改装状態据え置き ステータスの更新のみ
            const oldDetail = oldStock.details.find(v => v.id === uniqueId);
            if (oldDetail.lv !== lv) {
               oldDetail.lv = lv;
               oldDetail.exp = exp;
            }
            oldDetail.st[4] = luck;
            oldDetail.st[5] = hp;
            oldDetail.st[6] = asw;
            oldDetail.area = area;
         }
      }

      saveLocalStorage('shipStock', stockShips);
      inform_success('更新されました。');
      // 再描画
      initShipList();
   }
}

/**
 * 艦娘 除籍クリック
 */
function btn_delete_ship_Clicked() {
   const uniqueId = castInt(document.getElementById('modal_ship_edit').dataset.editShipId);

   if (uniqueId > 0) {
      let stockShips = loadShipStock();
      const stockIndex = stockShips.findIndex(v => v.details.some(x => x.id === uniqueId));
      if (stockIndex >= 0) {
         const stock = stockShips[stockIndex];
         // 削除
         stock.details = stock.details.filter(v => v.id !== uniqueId);
         if (stock.details.length) {
            stockShips[stockIndex] = stock;
         }
         else {
            // 明細が全部消えたならヘッダも消す
            stockShips = stockShips.filter(v => v.id !== stock.id);
         }

         saveLocalStorage('shipStock', stockShips);
         inform_success('除籍されました。');
         // 再描画
         initShipList();
      }
      else {
         inform_success('除籍に失敗しました。既に除籍されています。');
      }
   }
   $('#modal_ship_edit').modal('close');
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
   filterItemList();
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

/**
 * 読み込みクリック
 */
function btn_url_shorten_Clicked() {
   const button = document.getElementById('btn_url_shorten');
   const textbox = document.getElementById('input_url');
   const url = textbox.value.trim();
   textbox.value = "";

   // 所持装備チェック
   if (readEquipmentJson(url)) {
      initItemList();
      inform_success('所持装備の反映に成功しました。');
   }
   else if (readShipJson(url)) {
      initShipList();
      inform_success('所持艦娘の反映に成功しました。');
   }
   else if (readKantaiBunsekiJson(url)) {
      initShipList();
      inform_success('所持艦娘の反映に成功しました。');
   }
   else {
      inform_danger('入力値の読み込みに失敗しました。');
   }

   button.textContent = '読み込み';
}

/**
 * 艦隊晒し用コード変換
 */
function getKantaiSarashi() {
   let success = false;
   const shipStock = loadShipStock();
   if (shipStock && shipStock.length) {
      const text = []
      for (const stock of shipStock) {
         const ship = SHIP_DATA.find(v => v.id === stock.id);
         for (const detail of stock.details) {
            const nextLvObj = LEVEL_BORDERS.find(v => v.lv === (detail.lv + 1));
            const nextExp = nextLvObj ? nextLvObj.req - detail.exp : 0;
            text.push(`{"id":${ship.api},"lv":${detail.lv},"st":[${detail.st.join(',')}],"exp":[${detail.exp},${nextExp},${0}]}`);
         }
      }

      document.getElementById('kantai_sarashi').value = "[" + text.join(',') + "]";
      document.getElementById('kantai_sarashi').nextElementSibling.classList.add('active');
      success = true;
   }

   const itemStock = loadPlaneStock();
   if (itemStock && itemStock.length) {
      const text = []
      for (const item of itemStock) {
         for (let remodel = 0; remodel < item.num.length; remodel++) {
            const stock = item.num[remodel];
            for (let i = 0; i < stock; i++) {
               text.push(`{"id":${item.id},"lv"${remodel}}`);
            }
         }
      }

      document.getElementById('kantai_sarashi_item').value = "[" + text.join(',') + "]";
      document.getElementById('kantai_sarashi_item').nextElementSibling.classList.add('active');
      success = true;
   }

   if (success) {
      inform_success('出力しました。');
   }
   else {
      inform_success('出力に失敗しました。艦娘、装備の反映を行ってください。');
   }
}
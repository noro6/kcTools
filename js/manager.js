/** @type {{type: number, type2: number, name: string, items: any[], sort: string[]}[]} */
let ITEM_TYPES_LIST = [];

let timer = null;

let readOnlyMode = false;
/** @type {{id: number, details: {id: number, lv: number, exp: number, st: number[], area: number }[]}[]} */
let readOnlyShips = [];
/** @type {{id: number, num: number[]}[]} */
let readOnlyItems = [];

let expChart = null;
let expRadarChart = null;
let expStackChart = null;

const FINAL_SHIPS = SHIP_DATA.filter(v => v.final);
const FIRST_SHIPS = SHIP_DATA.filter(v => v.ver === 0).map(v => {
   return { id: v.id, versions: SHIP_DATA.filter(x => x.orig === v.id).map(y => y.id) }
});

const OK_DAIHATSU_TYPE = LINK_SHIP_ITEM.filter(v => v.e_type.includes(24)).map(v => v.type);
const OK_NAIKATEI_TYPE = LINK_SHIP_ITEM.filter(v => v.e_type.includes(46)).map(v => v.type);
const OK_DAIHATSU_SHIP = SPECIAL_LINK_SHIP_ITEM.filter(v => v.itemType.includes(24)).map(v => v.apiShip);
const OK_NAIKATEI_SHIP = SPECIAL_LINK_SHIP_ITEM.filter(v => v.itemType.includes(46)).map(v => v.apiShip);

const COUNTRY_ARRAY = [[], DEU, ITA, USA, GBR, FRA, RUS, SWE, NLD, AUS];

let shipSortKey = '';
let isAscShip = false;

document.addEventListener('DOMContentLoaded', function () {
   document.getElementById('ship_legacy')['checked'] = setting.managerViewMode !== 'table';
   document.getElementById('ship_table')['checked'] = setting.managerViewMode === 'table';

   // モーダル初期化
   $('.modal').modal();
   // タブ初期化
   $('.tabs').tabs();
   $('#ship_content_tabs').tabs('select', 'ship_view');
   $('#item_content_tabs').tabs('select', 'item_view');
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
   // Tweet
   document.getElementById('btn_twitter').addEventListener('click', btn_twitter_Clicked);
   // 閲覧モード終了
   document.getElementById('btn_exit_readonly').addEventListener('click', quitReadonlyMode);

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
   $('#ships_filter').on('change', '#ok_daihatsu', filterShipList);
   $('#ships_filter').on('change', '#ok_naikatei', filterShipList);
   $('#ships_filter').on('click', '.filter_area', function () { filter_area_Clicked($(this)); });
   $('#ships_filter').on('change', '#ship_table', function (e) { if (e.target.checked) initShipList(); });
   $('#ships_filter').on('change', '#ship_legacy', function (e) { if (e.target.checked) initShipList(); });

   $('#ship_list').on('click', '.detail_container', function () { ship_detail_container_Clicked($(this)); });
   $('#ship_list').on('click', '.ship_table_tr:not(.header)', function () { ship_detail_container_Clicked($(this)); });
   $('#ship_list').on('click', '.header .ship_table_td_status', function () { ship_header_table_tr_Clicked($(this)); });

   $('#modal_ship_edit').on('change', '.version_radio', version_Changed);
   $('#modal_ship_edit').on('blur', '#ship_level', function () { ship_input_Leaved($(this)); });
   $('#modal_ship_edit').on('input', '#ship_level', function () { ship_input_Changed($(this)); });
   $('#modal_ship_edit').on('blur', '#ship_luck', function () { ship_input_Leaved($(this)); });
   $('#modal_ship_edit').on('input', '#ship_luck', function () { ship_input_Changed($(this)); });
   $('#modal_ship_edit').on('input', '#ship_level_range', function () { ship_level_range_Changed($(this)); });
   $('#modal_ship_edit').on('input', '#ship_luck_range', function () { ship_luck_range_Changed($(this)); });
   $('#modal_ship_edit').on('click', '#btn_level_99', btn_level_99_Clicked);
   $('#modal_ship_edit').on('click', '.selectable_area_banner', function () { area_banner_Clicked($(this)); });
   $('#modal_ship_edit').on('click', '#toggle_fav_ship', function () { ship_fav_Clicked($(this)) });
   $('#modal_ship_edit').on('click', '#btn_create_ship', btn_create_ship_Clicked);
   $('#modal_ship_edit').on('click', '#btn_update_ship', btn_update_ship_Clicked);
   $('#modal_ship_edit').on('click', '#btn_delete_ship', () => { $('#modal_ship_remove_confirm').modal('open'); });
   $('#modal_ship_remove_confirm').on('click', '#btn_delete_ship_commit', btn_delete_ship_Clicked);
   $('#modal_ship_remove_confirm').on('click', '.cancel', () => { $('#modal_ship_remove_confirm').modal('close'); });


   // 経験値関連
   const expRangeSlider = document.getElementById('exp_range');
   noUiSlider.create(expRangeSlider, {
      start: [1, 175], range: { 'min': 1, 'max': 175 }, connect: true, step: 1, orientation: 'horizontal',
      format: {
         to: (value) => castInt(value),
         from: (value) => castInt(value)
      }
   });
   expRangeSlider.noUiSlider.on('slide.one', (value) => {
      document.getElementById('exp_range_min').value = value[0];
      document.getElementById('exp_range_max').value = value[1];
   });
   expRangeSlider.noUiSlider.on('change.one', initExpTable);
   $('#ship_content_tabs').on('click', 'a[href="#ship_exp"]', initExpTable);
   $('#ship_exp').on('input', '#exp_range_min', setExpRangeSlider);
   $('#ship_exp').on('input', '#exp_range_max', setExpRangeSlider);
   $('#ship_exp').on('change', '#without_lv1', initExpTable);
   $('#ship_exp').on('click', '#btn_exp_range_manual', () => {
      // 集計対象手動に切り替え
      document.getElementById('without_lv1')['checked'] = false;
      document.getElementById('exp_range_simple').classList.add('d-none');
      document.getElementById('exp_range_simple').classList.remove('d-flex');
      document.getElementById('exp_range_manual').classList.add('d-flex');
      document.getElementById('exp_range_manual').classList.remove('d-none');
      initExpTable();
   });

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
   $('#modal_item_edit').on('click', '#toggle_fav_item', function () { item_fav_Clicked($(this)) });

   $('#others').on('click', 'input[type="text"]', function () { $(this).select(); });
   $('#others').on('click', 'textarea', function () { $(this).select(); });
   $('#others').on('click', '#btn_share_fleet', createSharedURL);
   $('#others').on('click', '#btn_kan_bunseki', outputKantaiBunsekiCode);
   $('#others').on('click', '#btn_kantai_sarashi', outputKantaiSarashiCode);

   $('#readonly_mode').on('click', 'button', quitReadonlyMode);
   $('#content_tabs').on('click', 'a[href="#others"]', initURLs);
   $('#created_url_list').on('click', '.btn_link', function () { location.href = $(this)[0].dataset.url; });
   $('#created_url_list').on('click', '.btn_delete_url', function () { btn_delete_url_Clicked($(this)); });
   $('#modal_url_remove_confirm').on('click', '#btn_delete_url_commit', btn_delete_url_commit_Clicked);
   $('#modal_url_remove_confirm').on('click', '.cancel', () => { $('#modal_url_remove_confirm').modal('close'); });

   const params = getUrlParams();
   if (params.hasOwnProperty("id")) {
      readURLData(params.id);
   }
   else {
      initItemList();
      initShipList();
   }
});


/**
 * 現在登録されている艦娘情報から所持艦娘一覧を再構築
 */
function initShipList() {
   document.getElementById('btn_kan_bunseki_parent').classList.remove('d-none');
   document.getElementById('kan_bunseki_parent').classList.add('d-none');
   document.getElementById('btn_kantai_sarashi_parent').classList.remove('d-none');
   document.getElementById('kantai_sarashi_link_parent').classList.add('d-none');

   enabledShareButton();

   if (document.getElementById('ship_table')['checked']) {
      // document.getElementById('ships_sort_container').classList.remove('d-none');
      initShipListTable();
      filterShipListTable();
      setting.managerViewMode = 'table';
      saveSetting();

      if (shipSortKey && shipSortKey !== 'index') {
         sortShipTable(shipSortKey, isAscShip);
      }
      return;
   }

   setting.managerViewMode = 'legacy';
   saveSetting();

   document.getElementById('ships_sort_container').classList.add('d-none');

   // 所持装備
   const stockShips = readOnlyMode ? readOnlyShips : loadShipStock();
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
      const ships = FINAL_SHIPS.filter(v => v.type2 === ctype.id);
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
            verContainer.dataset.shipType2 = ver.type2;
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
               stock.details.sort((a, b) => b.lv - a.lv);
               for (let i = 0; i < stock.details.length; i++) {
                  const detail = stock.details[i];
                  const detailContainer = createDiv('detail_container');
                  detailContainer.dataset.shipId = ver.id;
                  detailContainer.dataset.shipApi = ver.api;
                  detailContainer.dataset.uniqueId = detail.id;

                  if (detail.lv === 175) detailContainer.classList.add('lv_max2');
                  else if (detail.lv > 99) detailContainer.classList.add('lv_100');
                  else if (detail.lv === 99) detailContainer.classList.add('lv_max');

                  // 対潜値算出
                  const asw = getLevelStatus(detail.lv, ver.max_asw, ver.asw);

                  detailContainer.innerHTML = `
                  <div class="d-flex">
                     <div class="ship_lv" data-level="${detail.lv}">${detail.lv}</div>
                  </div>
                  <div class="d-flex">
                     <div class="detail_ship_label_img"><img src="../img/util/status_hp.png"></div>
                     <div class="detail_ship_status remodel_hp ${(detail.st[5] ? 'status_up' : '')}" data-remodel-hp="${detail.st[5]}">
                        ${(detail.lv > 99 ? ver.hp2 : ver.hp) + detail.st[5]}
                     </div>
                  </div>
                  <div class="d-flex">
                     <div class="detail_ship_label_img"><img src="../img/util/status_asw.png"></div>
                     <div class="detail_ship_status remodel_asw ${(detail.st[6] ? 'status_up' : '')}" data-remodel-asw="${detail.st[6]}">
                        ${asw > 0 ? asw + detail.st[6] : '-'}
                     </div>
                  </div>
                  <div class="d-flex">
                     <div class="detail_ship_label_img"><img src="../img/util/status_luck.png"></div>
                     <div class="detail_ship_status remodel_luck ${(detail.st[4] ? 'status_up' : '')}" data-luck="${ver.luck + detail.st[4]}">
                        ${ver.luck + detail.st[4]}
                     </div>
                  </div>
                  ${detail.area < 1 || detail.area > MAX_AREA ? '<div class="sally_area no_area"></div>' : `<div class="sally_area" data-area="${detail.area}"><img src="../img/util/area${detail.area}_min.png" alt="area${detail.area}"></div>`}`;
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
   document.getElementById('ship_list').appendChild(fragment);
   document.getElementById('ship_list').classList.add('d-flex');

   filterShipList();
}

/**
 * 現在登録されている艦娘情報から所持艦娘一覧を再構築　テーブル形式
 */
function initShipListTable() {
   const sortKey = document.getElementById('ships_sort').value;
   // 所持装備
   const stockShips = readOnlyMode ? readOnlyShips : loadShipStock();
   const fragment = document.createDocumentFragment();
   let defaultIndex = 0;
   // ヘッダー
   const header = createDiv('ship_table_tr d-flex header');
   header.innerHTML = `<div class="ship_table_td_name">艦娘</div>
   <div class="ship_table_td_status" data-sortkey="level">Lv.</div>
   <div class="ship_table_td_status" data-sortkey="hp">耐久</div>
   <div class="ship_table_td_status" data-sortkey="luck">運</div>
   <div class="ship_table_td_status" data-sortkey="asw">対潜</div>
   <div class="ship_table_td_status" data-sortkey="accuracy">命中項</div>
   <div class="ship_table_td_status" data-sortkey="avoid">回避項</div>
   <div class="ship_table_td_status" data-sortkey="ci">CI項</div>`;
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

   const tbody = document.createElement('div');
   tbody.id = 'ship_table_tbody';
   for (const ship of baseShips) {
      const stock = stockShips.find(v => v.id === ship.id);

      if (stock && stock.details.length) {
         stock.details.sort((a, b) => b.lv - a.lv);
         for (const detail of stock.details) {
            const luck = ship.luck + detail.st[4];

            const tr = createDiv('ship_table_tr d-flex');
            tr.dataset.shipId = ship.id;
            tr.dataset.shipApi = ship.api;
            tr.dataset.shipType = ship.type;
            tr.dataset.shipType2 = ship.type2;
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
                  ${detail.area > 0 && detail.area <= MAX_AREA ? `<img class="area_banner" src="../img/util/area${detail.area}.png" alt="${detail.area}">` : ''}
               </div>
               <div class="align-self-center">${ship.name}</div>`;
            tr.appendChild(tdImage);

            const tdLevel = createDiv('ship_table_td_status');
            tdLevel.textContent = detail.lv;
            tr.appendChild(tdLevel);

            const tdHP = createDiv('ship_table_td_status ' + (detail.st[5] ? 'status_up' : ''));
            const hpValue = (detail.lv > 99 ? ship.hp2 : ship.hp) + detail.st[5];
            tdHP.textContent = hpValue;
            tr.dataset.hp = hpValue;
            if (detail.st[5]) {
               const bonus = createDiv('bonus_status_after');
               bonus.innerHTML = `&uarr;${detail.st[5]}`;
               tdHP.appendChild(bonus);
            }
            tr.appendChild(tdHP);

            const tdLuck = createDiv('ship_table_td_status ' + (detail.st[4] ? 'status_up' : ''));
            tdLuck.textContent = luck;
            if (detail.st[4]) {
               const bonus = createDiv('bonus_status_after');
               bonus.innerHTML = `&uarr;${detail.st[4]}`;
               tdLuck.appendChild(bonus);
            }
            tr.appendChild(tdLuck);

            const asw = getLevelStatus(detail.lv, ship.max_asw, ship.asw);
            const tdAsw = createDiv('ship_table_td_status ' + (detail.st[6] ? 'status_up' : ''));
            tdAsw.textContent = asw + detail.st[6];
            tr.dataset.asw = asw + detail.st[6];
            if (detail.st[6]) {
               const bonus = createDiv('bonus_status_after');
               bonus.innerHTML = `&uarr;${detail.st[6]}`;
               tdAsw.appendChild(bonus);
            }
            tr.appendChild(tdAsw);

            // 命中項(ステータス部分のみ)
            const tdAccuracy = createDiv('ship_table_td_status');
            const accuracyValue = Math.floor(2 * Math.sqrt(detail.lv) + 1.5 * Math.sqrt(luck));
            tdAccuracy.textContent = accuracyValue;
            tr.dataset.accuracy = accuracyValue;
            tr.appendChild(tdAccuracy);

            const avoid = getLevelStatus(detail.lv, ship.max_avoid, ship.avoid);
            // 回避項(ステータス部分のみ)
            const tdAvoid = createDiv('ship_table_td_status');
            const baseAvoid = Math.floor(avoid + Math.sqrt(2 * luck));
            let avoidValue = baseAvoid;
            if (baseAvoid >= 65) {
               avoidValue = Math.floor(55 + 2 * Math.sqrt(baseAvoid - 65));
            }
            else if (baseAvoid >= 45) {
               avoidValue = Math.floor(40 + 3 * Math.sqrt(baseAvoid - 40));
            }

            tdAvoid.textContent = avoidValue;
            tr.dataset.avoid = avoidValue;
            tr.appendChild(tdAvoid);

            // CI項(ステータス部分のみ)
            const tdCI = createDiv('ship_table_td_status');
            let ciValue = 0;
            if (luck >= 50) {
               ciValue = Math.floor(65 + Math.sqrt(luck - 50) + 0.8 * Math.sqrt(detail.lv));
            }
            else {
               ciValue = Math.floor(15 + luck + 0.75 * Math.sqrt(detail.lv));
            }
            tdCI.textContent = ciValue;
            tr.dataset.ci = ciValue;
            tr.appendChild(tdCI);


            tbody.appendChild(tr);
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
         tr.dataset.shipApi = ship.api;
         tr.dataset.shipType = ship.type;
         tr.dataset.shipType2 = ship.type2;
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
         tdLevel.textContent = '-';
         tr.appendChild(tdLevel);

         const tdHP = createDiv('ship_table_td_status');
         tdHP.textContent = ship.hp;
         tr.dataset.hp = ship.hp;
         tr.appendChild(tdHP);

         const tdLuck = createDiv('ship_table_td_status');
         tdLuck.textContent = luck;
         tr.appendChild(tdLuck);

         const noShipStatusArea = createDiv('no_ship_area d-flex');
         const tdNoStatusLine = createDiv('ml-4 ship_table_td_line');
         noShipStatusArea.appendChild(tdNoStatusLine);

         const tdNoStatus = createDiv('text-center mx-3');
         tdNoStatus.textContent = '未所持';
         noShipStatusArea.appendChild(tdNoStatus);

         const tdNoStatusLine2 = createDiv('ship_table_td_line');
         noShipStatusArea.appendChild(tdNoStatusLine2);
         tr.appendChild(noShipStatusArea);

         const tdAsw = createDiv('ship_table_td_status d-none');
         tdAsw.textContent = '';
         tr.dataset.asw = ship.asw ? ship.asw : 0;
         tr.appendChild(tdAsw);

         const tdAccuracy = createDiv('ship_table_td_status d-none');
         tdAccuracy.textContent = '';
         tr.dataset.accuracy = 0;
         tr.appendChild(tdAccuracy);

         const tdAvoid = createDiv('ship_table_td_status d-none');
         tdAvoid.textContent = '-';
         tr.dataset.avoid = 0;
         tr.appendChild(tdAvoid);

         const tdCI = createDiv('ship_table_td_status d-none');
         tdCI.textContent = '-';
         tr.dataset.ci = 0;
         tr.appendChild(tdCI);

         tbody.appendChild(tr);
      }
   }

   fragment.appendChild(tbody);
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
   const okDaihatsu = document.getElementById('ok_daihatsu')['checked'];
   const okNaikatei = document.getElementById('ok_naikatei')['checked'];
   const visibleCountries = $('#enabled_ship_country').formSelect('getSelectedValues').map(v => castInt(v));

   const containers = document.getElementsByClassName('ship_type_container');
   for (const container of containers) {
      for (const origParent of container.getElementsByClassName('ship_container')) {
         for (const verParent of container.getElementsByClassName('version_container')) {
            const typeId = castInt(verParent.dataset.shipType);
            const shipType2 = castInt(verParent.dataset.shipType2);
            if (visibleTypes.length && !visibleTypes.includes(typeId)) {
               verParent.classList.add('d-none');
               continue;
            }
            else if (visibleCountries.length) {
               let exist = false;
               for (const value of visibleCountries) {
                  if (COUNTRY_ARRAY[castInt(value)].includes(shipType2)) {
                     exist = true;
                     break;
                  }
               }

               if (exist) {
                  verParent.classList.remove('d-none');
               }
               else {
                  verParent.classList.add('d-none');
                  continue;
               }
            }
            else {
               verParent.classList.remove('d-none');
            }

            for (const detail of verParent.getElementsByClassName('detail_container')) {
               if (noShipInvisible && detail.classList.contains('no_ship')) {
                  detail.classList.add('d-none');
                  continue;
               }

               const api = castInt(detail.dataset.shipApi);
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
               // 大発条件
               else if (okDaihatsu && !OK_DAIHATSU_TYPE.includes(typeId) && !OK_DAIHATSU_SHIP.includes(api)) {
                  detail.classList.add('d-none');
               }
               // 内火艇条件
               else if (okNaikatei && !OK_NAIKATEI_TYPE.includes(typeId) && !OK_NAIKATEI_SHIP.includes(api)) {
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
   const visibleCountries = $('#enabled_ship_country').formSelect('getSelectedValues').map(v => castInt(v));

   const areas = [];
   $('.filter_area.selected').each((i, e) => {
      const area = castInt($(e)[0].dataset.area);
      areas.push(area);
      if (area === 0) areas.push(-1);
   });
   const okDaihatsu = document.getElementById('ok_daihatsu')['checked'];
   const okNaikatei = document.getElementById('ok_naikatei')['checked'];

   const trs = document.getElementsByClassName('ship_table_tr');
   for (const tr of trs) {
      if (tr.classList.contains('header')) {
         continue;
      }
      const api = castInt(tr.dataset.shipApi);
      const shipType = castInt(tr.dataset.shipType);
      const shipType2 = castInt(tr.dataset.shipType2);
      const lv = castInt(tr.dataset.level);
      const luck = castInt(tr.dataset.luck);
      const remodelHp = castInt(tr.dataset.remodelHp);
      const remodelAsw = castInt(tr.dataset.remodelAsw);
      const area = castInt(tr.dataset.area);

      if (visibleTypes.length && !visibleTypes.includes(shipType)) {
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
      // 大発条件
      else if (okDaihatsu && !OK_DAIHATSU_TYPE.includes(shipType) && !OK_DAIHATSU_SHIP.includes(api)) {
         tr.classList.add('d-none');
      }
      // 内火艇条件
      else if (okNaikatei && !OK_NAIKATEI_TYPE.includes(shipType) && !OK_NAIKATEI_SHIP.includes(api)) {
         tr.classList.add('d-none');
      }
      else if (visibleCountries.length) {
         let exist = false;
         for (const value of visibleCountries) {
            if (COUNTRY_ARRAY[castInt(value)].includes(shipType2)) {
               exist = true;
               break;
            }
         }

         if (exist) {
            tr.classList.remove('d-none');
         }
         else {
            tr.classList.add('d-none');
         }
      }
      else {
         tr.classList.remove('d-none');
      }
   }
}

/**
 * 経験値テーブル集計対象変更時
 */
function setExpRangeSlider() {
   const min = castInt(document.getElementById('exp_range_min').value);
   const max = castInt(document.getElementById('exp_range_max').value);
   document.getElementById('exp_range').noUiSlider.set([min, min > max ? min : max]);
   initExpTable();
}

/**
 * 経験値テーブル初期化
 */
function initExpTable() {
   const shipStock = readOnlyMode ? readOnlyShips : loadShipStock();
   const isDark = document.body.classList.contains('dark-theme');
   const isManual = document.getElementById('exp_range_manual').classList.contains('d-flex');
   const withoutLevel1 = document.getElementById('without_lv1')['checked'];
   let lvRangeMin = castInt(document.getElementById('exp_range_min').value);
   let lvRangeMax = castInt(document.getElementById('exp_range_max').value);
   lvRangeMax = lvRangeMax > 175 || lvRangeMax < 1 ? 175 : lvRangeMax;
   lvRangeMin = lvRangeMin > lvRangeMax || lvRangeMin < 1 ? 1 : lvRangeMin;

   let allMaxLv = 0;
   let allMinLv = 175;
   let allSumLv = 0;
   let allSumExp = 0;
   let allCount = 0;
   let allLvs = [];

   const fragment = document.createDocumentFragment();

   // レーダーチャート用カテゴリ別カラーテーブル
   const barColors = isDark ? ["rgba(255, 80, 80, 0.5)", "rgba(170, 80, 255, 0.5)", "rgba(80, 80, 255, 0.5)", "rgba(80, 180, 255, 0.5)", "rgba(80, 255, 255, 0.5)", "rgba(80, 255, 80, 0.5)", "rgba(255, 255, 80, 0.5)", "rgba(255, 180, 80, 0.5)"] :
      ["rgba(200, 0, 0, 0.5)", "rgba(100, 0, 200, 0.5)", "rgba(0, 0, 200, 0.5)", "rgba(0, 100, 200, 0.5)", "rgba(0, 200, 200, 0.5)", "rgba(0, 200, 0, 0.5)", "rgba(200, 200, 0, 0.5)", "rgba(200, 100, 0, 0.5)"];
   const barBorderColors = isDark ? ["rgb(255, 80, 80)", "rgb(170, 80, 255)", "rgb(80, 80, 255)", "rgb(80, 180, 255)", "rgb(80, 255, 255)", "rgb(80, 255, 80)", "rgb(255, 255, 80)", "rgb(255, 180, 80)", "rgb(255, 255, 153)", "rgb(255, 204, 153)", "rgb(255, 153, 153)"] :
      ["rgb(200, 0, 0)", "rgb(100, 0, 200)", "rgb(0, 0, 200)", "rgb(0, 100, 200)", "rgb(0, 200, 100)", "rgb(0, 200, 0)", "rgb(200, 200, 0)", "rgb(200, 100, 0)"];
   // 積み上げ棒グラフ用
   const stackedDataset = [];

   // レーダー用データ
   const maxLvs = [];
   const minLvs = [];
   const midLvs = [];
   const avgLvs = [];

   // 艦娘別取得経験値ランカー
   const expRanking = FIRST_SHIPS.map(v => { return { id: v.id, versions: v.versions, sumExp: 0 } });

   for (let idx = 0; idx < SHIP_TYPE_REV2.length; idx++) {
      const type = SHIP_TYPE_REV2[idx];
      // 艦種拡張
      let dispType = [];
      switch (type.id) {
         case 103:
            // 軽巡級
            dispType = [3, 4, 21];
            break;
         case 105:
            // 重巡級
            dispType = [5, 6];
            break;
         case 114:
            // 潜水艦
            dispType = [13, 14];
            break;
         case 11:
            // 正規空母
            dispType = [11, 18];
            break;
         case 108:
            // 戦艦
            dispType = [8, 9, 10];
            break;
         case 116:
            // 補助艦艇
            dispType = [1, 16, 17, 19, 20, 22];
            break;
         default:
            dispType.push(type.id);
            break;
      }

      let maxLv = 0;
      let minLv = 175;
      let sumLv = 0;
      let sumExp = 0;
      let count = 0;
      let all = [];

      const newStackedData = {
         label: type.name,
         backgroundColor: barColors[idx],
         borderColor: barBorderColors[idx],
         borderWidth: 0,
         data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };

      const shipIds = SHIP_DATA.filter(v => dispType.includes(v.type)).map(v => v.id);
      const targetStocks = shipStock.filter(v => shipIds.includes(v.id));
      for (const stock of targetStocks) {
         let shipSumExp = 0;
         for (const detail of stock.details) {
            const level = detail.lv;
            if (isManual && (level < lvRangeMin || level > lvRangeMax)) {
               continue;
            }
            else if (level === 1 && withoutLevel1) {
               continue;
            }

            count++;
            sumLv += level;
            sumExp += detail.exp;
            shipSumExp += detail.exp;

            all.push(level);
            allLvs.push(level);
            if (maxLv < level) maxLv = level;
            if (minLv > level) minLv = level;

            allCount++;
            allSumLv += level;
            allSumExp += detail.exp;
            if (allMaxLv < level) allMaxLv = level;
            if (allMinLv > level) allMinLv = level;

            newStackedData.data[17 - Math.floor(level / 10)] += 1;
         }

         const expRankData = expRanking.find(v => v.versions.includes(stock.id));
         if (expRankData) {
            expRankData.sumExp += shipSumExp;
         }
      }

      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.className = 'td_name';
      tdName.textContent = type.name;
      tr.appendChild(tdName);

      const tdCount = document.createElement('td');
      tdCount.textContent = count;
      tr.appendChild(tdCount);

      const tdMaxLevel = document.createElement('td');
      tdMaxLevel.textContent = maxLv;
      tr.appendChild(tdMaxLevel);

      const tdMinLevel = document.createElement('td');
      tdMinLevel.textContent = count ? minLv : 0;
      tr.appendChild(tdMinLevel);

      all.sort(((a, b) => a - b));
      const half = Math.floor(all.length / 2);
      const tdMidLevel = document.createElement('td');
      const midLv = count ? count % 2 ? all[half] : Math.floor((all[half - 1] + all[half]) / 2) : 0;
      tdMidLevel.textContent = midLv;
      tr.appendChild(tdMidLevel);

      const tdAvgLevel = document.createElement('td');
      tdAvgLevel.textContent = count ? (sumLv / count).toFixed(1) : 0;
      tr.appendChild(tdAvgLevel);

      const tdSumExp = document.createElement('td');
      tdSumExp.className = 'td_sum_exp';
      tdSumExp.dataset.exp = sumExp;
      tdSumExp.textContent = Number(sumExp).toLocaleString();
      tr.appendChild(tdSumExp);

      const tdAvgExp = document.createElement('td');
      tdAvgExp.textContent = count ? Number(Math.floor(sumExp / count)).toLocaleString() : 0;
      tr.appendChild(tdAvgExp);

      const tdExpRate = document.createElement('td');
      tdExpRate.className = 'td_exp_rate';
      tdExpRate.textContent = 100;
      tr.appendChild(tdExpRate);

      fragment.appendChild(tr);

      // レーダー用データ格納
      maxLvs.push(maxLv);
      minLvs.push(count ? minLv : 0);
      midLvs.push(midLv)
      avgLvs.push(count ? Math.floor(sumLv / count) : 0);

      stackedDataset.push(newStackedData);
   }

   document.getElementById('ship_exp_tbody').innerHTML = '';
   document.getElementById('ship_exp_tbody').appendChild(fragment);

   const expChartData = [];
   $('#ship_exp_tbody tr').each((i, e) => {
      const sumExp = castInt($(e).find('.td_sum_exp')[0].dataset.exp);
      const rate = allSumExp ? 100 * sumExp / allSumExp : 0;
      $(e).find('.td_exp_rate').text((rate).toFixed(1) + '%');
      expChartData.push(rate.toFixed(2));
   });

   const footFragment = document.createDocumentFragment();
   const tr = document.createElement('tr');
   const tdName = document.createElement('td');
   tdName.className = 'td_name';
   tdName.textContent = '合計';
   tr.appendChild(tdName);

   const tdCount = document.createElement('td');
   tdCount.textContent = allCount;
   tr.appendChild(tdCount);

   const tdMaxLevel = document.createElement('td');
   tdMaxLevel.textContent = allMaxLv;
   tr.appendChild(tdMaxLevel);

   const tdMinLevel = document.createElement('td');
   tdMinLevel.textContent = allCount ? allMinLv : 0;
   tr.appendChild(tdMinLevel);

   allLvs.sort(((a, b) => a - b));
   const half = Math.floor(allLvs.length / 2);
   const tdMidLevel = document.createElement('td');
   tdMidLevel.textContent = allCount ? allCount % 2 ? allLvs[half] : Math.floor((allLvs[half - 1] + allLvs[half]) / 2) : 0;
   tr.appendChild(tdMidLevel);

   const tdAvgLevel = document.createElement('td');
   tdAvgLevel.textContent = allCount ? (allSumLv / allCount).toFixed(1) : 0;
   tr.appendChild(tdAvgLevel);

   const tdSumExp = document.createElement('td');
   tdSumExp.textContent = Number(allSumExp).toLocaleString();
   tr.appendChild(tdSumExp);

   const tdAvgExp = document.createElement('td');
   tdAvgExp.textContent = allCount ? Number(Math.floor(allSumExp / allCount)).toLocaleString() : 0;
   tr.appendChild(tdAvgExp);

   const tdExpRate = document.createElement('td');
   tdExpRate.textContent = '-';
   tr.appendChild(tdExpRate);

   footFragment.appendChild(tr);
   document.getElementById('ship_exp_tfoot').innerHTML = '';
   document.getElementById('ship_exp_tfoot').appendChild(footFragment);

   // チャート処理
   const textColor = "rgba(" + hexToRGB(mainColor).join(',') + ", 0.8)";
   const expRateChart = document.getElementById('exp_rate_chart');
   const typeLabels = SHIP_TYPE_REV2.map(v => v.name);
   if (!expChart) {
      expChart = new Chart(expRateChart, {
         type: "horizontalBar",
         data: {
            labels: typeLabels,
            datasets: [{
               data: expChartData,
               backgroundColor: "rgba(80, 200, 255, 0.2)",
               borderColor: "rgb(80, 200, 255)",
               borderWidth: 2
            }]
         },
         options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
               xAxes: [{
                  scaleLabel: { display: true, labelString: '経験値割合 [%]', fontColor: textColor, fontSize: 12 },
                  gridLines: { color: "rgba(128, 128, 128, 0.2)" },
                  ticks: { fontColor: textColor, fontSize: 10, stepSize: 5 }
               }],
               yAxes: [{
                  ticks: { fontColor: textColor },
                  gridLines: { display: false }
               }],
            },
            legend: { display: false }
         }
      });
   }
   else {
      expChart.data.datasets[0].data = expChartData;
      expChart.update();
   }

   const gridColor = "rgba(" + hexToRGB(mainColor).join(',') + ", 0.25)";
   const ctx = document.getElementById('exp_radar_chart');
   const radarDatasetLabels = ['最大Lv', '最小Lv', '中央Lv', '平均Lv'];
   if (!expRadarChart) {
      const tooltips = {
         callbacks: {
            title: (tooltipItem) => {
               return 'Lv: ' + tooltipItem[0].value;

            },
            label: (tooltipItem) => {
               const index = tooltipItem ? castInt(tooltipItem.index) : 0;
               return index < typeLabels.length ? typeLabels[index] : '';
            }
         }
      }

      expRadarChart = new Chart(ctx, {
         type: "radar",
         data: {
            labels: typeLabels,
            datasets: [{
               label: radarDatasetLabels[0],
               data: maxLvs,
               fill: false,
               borderColor: isDark ? "rgb(64, 200, 255)" : "rgb(64, 128, 200)",
               borderWidth: 1,
            },
            {
               label: radarDatasetLabels[1],
               data: minLvs,
               fill: false,
               borderColor: "rgb(255, 64, 64)",
               borderWidth: 1,
               hidden: true
            },
            {
               label: radarDatasetLabels[2],
               data: midLvs,
               fill: false,
               borderColor: "rgb(0, 200, 0)",
               borderWidth: 1
            },
            {
               label: radarDatasetLabels[3],
               data: avgLvs,
               fill: false,
               borderColor: "rgb(255, 128, 0)",
               borderWidth: 1
            }]
         },
         options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { position: 'bottom', labels: { fontColor: textColor } },
            scale: {
               pointLabels: { fontColor: textColor },
               ticks: {
                  min: 0,
                  max: isManual ? lvRangeMax : 175,
                  stepSize: 50, fontColor: textColor, backdropColor: 'rgba(128, 128, 128, 0)'
               },
               angleLines: { display: true, color: gridColor },
               gridLines: { display: true, color: gridColor }
            },
            tooltips: tooltips
         }
      });
   }
   else {
      expRadarChart.data.datasets[0].data = maxLvs;
      expRadarChart.data.datasets[1].data = minLvs;
      expRadarChart.data.datasets[2].data = midLvs;
      expRadarChart.data.datasets[3].data = avgLvs;
      expRadarChart.options.scale.ticks.max = isManual ? lvRangeMax : 175;

      expRadarChart.update();
   }

   const stackChartArea = document.getElementById('exp_stacked_chart');
   const stackedLvLabels = [];
   for (let i = 170; i >= 0; i -= 10) {
      stackedLvLabels.push((i ? i : 1) + '~');
   }
   if (!expStackChart) {
      expStackChart = new Chart(stackChartArea, {
         type: "horizontalBar",
         data: {
            labels: stackedLvLabels,
            datasets: stackedDataset
         },
         options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
               xAxes: [{
                  stacked: true,
                  scaleLabel: { display: true, labelString: '艦娘数 [隻]', fontColor: textColor, fontSize: 12 },
                  gridLines: { color: "rgba(128, 128, 128, 0.2)" },
                  ticks: { fontColor: textColor, fontSize: 10, stepSize: 10 }
               }],
               yAxes: [{
                  stacked: true,
                  ticks: { fontColor: textColor },
                  gridLines: { display: false }
               }],
            },
            legend: { position: 'bottom', labels: { fontColor: textColor } },
            tooltips: {
               filter: (item) => (item.xLabel > 0)
            }
         }
      });
   }
   else {
      expStackChart.data.datasets = stackedDataset;
      expStackChart.update();
   }

   const expRankingFragment = document.createDocumentFragment();
   expRanking.sort((a, b) => b.sumExp - a.sumExp);

   for (let rank = 0; rank < expRanking.length; rank++) {
      if (rank === 10) break;
      const data = expRanking[rank];
      const tr = document.createElement('tr');

      const tdRank = document.createElement('td');
      tdRank.className = 'td_name';
      tdRank.textContent = rank + 1;
      tr.appendChild(tdRank);

      const tdName = document.createElement('td');
      tdName.className = 'td_name';
      const raw = SHIP_DATA.find(v => v.id === data.id);
      tdName.textContent = raw ? raw.name : '不明';
      tr.appendChild(tdName);

      const tdSumExp = document.createElement('td');
      tdSumExp.textContent = Number(data.sumExp).toLocaleString();
      tr.appendChild(tdSumExp);

      const tdExpRate = document.createElement('td');
      tdExpRate.textContent = allCount ? (100 * data.sumExp / allSumExp).toFixed(1) + '%' : '-';
      tr.appendChild(tdExpRate);

      expRankingFragment.appendChild(tr);
   }
   document.getElementById('ship_exp_ranking_tbody').innerHTML = '';
   document.getElementById('ship_exp_ranking_tbody').appendChild(expRankingFragment);
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

/**
 * 装備種別初期化
 */
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
         data.type2 = 10;
         data.items = ITEM_DATA.filter(i => i.type === type || i.type === 26);
         data.sort = ['asw'];
      }
      else if (type === 27) {
         // 小バルジに大バルジを含める
         data.name = '追加装甲(中型 / 大型)';
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
         data.sort.push('asw');
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
   document.getElementById('btn_kan_bunseki_parent').classList.remove('d-none');
   document.getElementById('kan_bunseki_parent').classList.add('d-none');

   enabledShareButton();

   if (!ITEM_TYPES_LIST.length) {
      initItemTypes();
   }

   // 所持装備
   const stockItems = readOnlyMode ? readOnlyItems : loadPlaneStock();

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
 * 艦娘テーブル ヘッダークリック時(ソートする)
 * @param {*} $this
 */
function ship_header_table_tr_Clicked($this) {
   // デフォルトのソート項目
   let sortKey = 'index';
   let isAsc = true;

   shipSortKey = 'index';
   isAscShip = true;

   if ($this.hasClass('asc')) {
      $this.removeClass('asc selected');
   }
   else if ($this.hasClass('desc')) {
      $this.removeClass('desc');
      $this.addClass('asc');
      sortKey = $this[0].dataset.sortkey;
      shipSortKey = $this[0].dataset.sortkey;
   }
   else {
      $('.header .ship_table_td_status').removeClass('desc asc selected');
      $this.addClass('desc selected');
      sortKey = $this[0].dataset.sortkey;
      shipSortKey = $this[0].dataset.sortkey;
      isAsc = false;
      isAscShip = false;
   }

   sortShipTable(sortKey, isAsc);
}

/**
 * 艦娘テーブルをソート
 * @param {string} sortKey 
 * @param {boolean} isAsc 
 */
function sortShipTable(sortKey, isAsc) {
   const parent = document.getElementById('ship_table_tbody');
   if (!parent) {
      return;
   }
   const trs = parent.getElementsByClassName('ship_table_tr');
   const containers = Array.prototype.slice.call(trs);

   containers.sort((a, b) => (isAsc ? -1 : 1) * (castInt(b.dataset[sortKey]) - castInt(a.dataset[sortKey])));
   for (var i = 0; i < containers.length; i++) {
      parent.appendChild(parent.removeChild(containers[i]))
   }
}

/**
 * 艦娘一覧内　クリック
 * @param {*} $this
 */
function ship_detail_container_Clicked($this) {
   if (readOnlyMode) {
      inform_danger('現在、閲覧モードのため更新はできません');
      return;
   }
   const stocks = loadShipStock();
   const shipId = castInt($this[0].dataset.shipId);
   const uniqueId = castInt($this[0].dataset.uniqueId, -1);
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

   if (uniqueId >= 0) {
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
      else {
         document.getElementById('ship_luck').value = raw.luck;
         document.getElementById('ship_luck_range').value = raw.luck;

         document.getElementById('btn_update_ship')['disabled'] = true;
         document.getElementById('btn_delete_ship')['disabled'] = true;
      }
   }
   else {
      document.getElementById('ship_luck').value = raw.luck;
      document.getElementById('ship_luck_range').value = raw.luck;

      document.getElementById('btn_update_ship')['disabled'] = true;
      document.getElementById('btn_delete_ship')['disabled'] = true;
   }

   if (setting.favoriteShip.includes(shipId)) {
      document.getElementById('toggle_fav_ship').classList.add('fav');
      document.getElementById('add_favorite').classList.add('d-none');
      document.getElementById('remove_favorite').classList.remove('d-none');
   }
   else {
      document.getElementById('toggle_fav_ship').classList.remove('fav');
      document.getElementById('add_favorite').classList.remove('d-none');
      document.getElementById('remove_favorite').classList.add('d-none');
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

      if (setting.favoriteShip.includes(shipId)) {
         document.getElementById('toggle_fav_ship').classList.add('fav');
         document.getElementById('add_favorite').classList.add('d-none');
         document.getElementById('remove_favorite').classList.remove('d-none');
      }
      else {
         document.getElementById('toggle_fav_ship').classList.remove('fav');
         document.getElementById('add_favorite').classList.remove('d-none');
         document.getElementById('remove_favorite').classList.add('d-none');
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
   inform_success(raw.name + 'が着任しました');
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

      saveLocalStorage('shipStock', stockShips);
      inform_success('更新されました');
      // 再描画
      initShipList();
   }
}

/**
 * 艦娘 除籍クリック
 */
function btn_delete_ship_Clicked() {
   const uniqueId = castInt(document.getElementById('modal_ship_edit').dataset.editShipId);

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
      inform_success('除籍されました');
      // 再描画
      initShipList();
   }
   else {
      inform_success('除籍に失敗しました。既に除籍されています');
   }
   $('#modal_ship_remove_confirm').modal('close');
   $('#modal_ship_edit').modal('close');
}


/**
 * 装備一覧内　装備クリック
 * @param {*} $this
 */
function item_container_Clicked($this) {
   if (readOnlyMode) {
      inform_danger('現在、閲覧モードのため更新はできません');
      return;
   }

   const itemId = castInt($this[0].dataset.itemId);
   const item = ITEM_DATA.find(v => v.id === itemId);
   const stock = loadPlaneStock().find(v => v.id === itemId);

   if (!item) {
      inform_danger('装備取得に失敗しました');
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

   if (setting.favoritePlane.includes(itemId)) {
      document.getElementById('toggle_fav_item').classList.add('fav');
      document.getElementById('add_fav_item').classList.add('d-none');
      document.getElementById('remove_fav_item').classList.remove('d-none');
   }
   else {
      document.getElementById('toggle_fav_item').classList.remove('fav');
      document.getElementById('add_fav_item').classList.remove('d-none');
      document.getElementById('remove_fav_item').classList.add('d-none');
   }

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
   $('#item_stock_inputs input[type="number"]:not(#remodel_all)').each((i, e) => {
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
   $('#item_stock_inputs input[type="number"]:not(#remodel_all)').each((i, e) => {
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
   inform_success('所持数を更新しました');
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
      inform_success('所持艦娘情報を更新しました');
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
   const textbox = document.getElementById('input_url');
   const url = textbox.value.trim();

   if (!url) {
      return;
   }
   // 所持装備チェック
   else if (readEquipmentJson(url)) {
      initItemList();
      inform_success('所持装備の反映に成功しました');
      textbox.value = "";
   }
   else if (readShipJson(url)) {
      initShipList();
      initExpTable();
      inform_success('所持艦娘の反映に成功しました');
      textbox.value = "";
   }
   else {
      inform_danger('入力値の読み込みに失敗しました');
   }
}

/**
 * 艦隊晒し用コード出力
 */
function outputKantaiSarashiCode() {
   let success = false;
   const shipStock = readOnlyMode ? readOnlyShips : loadShipStock();
   if (shipStock && shipStock.length) {
      const text = []

      for (const ship of FIRST_SHIPS) {
         const stocks = shipStock.filter(v => ship.versions.includes(v.id));
         const origRaw = SHIP_DATA.find(v => v.id === ship.id);
         if (stocks && origRaw) {
            const levels = [];
            for (const stock of stocks) {
               const raw = SHIP_DATA.find(v => v.id === stock.id);
               if (stock && stock.details.length && raw) {
                  for (const detail of stock.details) {
                     levels.push({ lv: detail.lv, ver: raw.ver + 1 });
                  }
               }
            }
            levels.sort((a, b) => b.lv - a.lv);
            text.push((origRaw.api === 699 ? 645 : origRaw.api) + ':' + levels.map(v => `${v.lv}.${v.ver}`).join(','));
         }
      }

      const result = ".2|" + text.join('|');
      document.getElementById('kantai_sarashi_link').href = 'http://kancolle-calc.net/kanmusu_list.html?data=' + encode64(result);
      success = true;
   }

   if (success) {
      document.getElementById('btn_kantai_sarashi_parent').classList.add('d-none');
      document.getElementById('kantai_sarashi_link_parent').classList.remove('d-none');
      inform_success('出力しました');
   }
   else {
      inform_warning('出力に失敗しました。艦娘の反映を行ってください');
   }
}

/**
 * 艦隊分析スプレ用コード変換
 */
function outputKantaiBunsekiCode() {
   let success = false;
   const shipStock = readOnlyMode ? readOnlyShips : loadShipStock();
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

      document.getElementById('kan_bunseki_code').value = "[" + text.join(',') + "]";
      document.getElementById('kan_bunseki_code').nextElementSibling.classList.add('active');
      success = true;
   }

   const itemStock = readOnlyMode ? readOnlyItems : loadPlaneStock();
   if (itemStock && itemStock.length && itemStock.some(v => v.num.some(x => x > 0))) {
      const text = []
      for (const item of itemStock) {
         for (let remodel = 0; remodel < item.num.length; remodel++) {
            const stock = item.num[remodel];
            for (let i = 0; i < stock; i++) {
               text.push(`{"id":${item.id},"lv":${remodel}}`);
            }
         }
      }

      document.getElementById('kan_bunseki_code_item').value = "[" + text.join(',') + "]";
      document.getElementById('kan_bunseki_code_item').nextElementSibling.classList.add('active');
      success = true;
   }

   if (success) {
      document.getElementById('btn_kan_bunseki_parent').classList.add('d-none');
      document.getElementById('kan_bunseki_parent').classList.remove('d-none');
      inform_success('出力しました');
   }
   else {
      inform_warning('出力に失敗しました。艦娘、装備の反映を行ってください');
   }
}

/**
 * 数値配列の合計値を返却(処理速度優先)
 * @param {number[]} array 数値配列
 * @returns {number} 合計値
 */
function getArraySum(array) {
   let sum = 0;
   let i = array.length;
   while (i--) {
      sum += array[i];
   }
   return sum;
}

/**
 * 艦隊装備情報の一意keyを取得 失敗時null
 * @returns
 */
async function requestURLKey() {
   const shipStock = loadShipStock();
   const itemStock = loadPlaneStock();

   let shipsData = '';
   let itemsData = '';
   let key = null;

   // 圧縮処理
   if (shipStock && shipStock.length) {
      // 情報圧縮
      const postShips = [];
      for (const data of shipStock) {
         if (!data.details.length) {
            continue;
         }
         const postShip = [data.id, []];
         for (const detail of data.details) {
            // id, Lv, 経験値, 改修値, 海域の順
            postShip[1].push([detail.id, detail.lv, detail.exp, detail.st, detail.area]);
         }
         postShips.push(postShip);
      }

      shipsData = utf8_to_b64(JSON.stringify(postShips));
   }
   if (itemStock && itemStock.length && itemStock.some(v => v.num.some(x => x > 0))) {
      // 情報圧縮
      const postItems = [];
      for (const item of itemStock) {
         let postItem = [item.id, []];
         let sum = getArraySum(item.num);
         if (sum) {
            for (const count of item.num) {
               sum -= count;
               postItem[1].push(count);

               // 全体所持数格納し終わったらその時点で終了
               if (sum <= 0) break;
            }
         }
         else {
            postItem = [item.id];
         }

         postItems.push(postItem);
      }
      itemsData = utf8_to_b64(JSON.stringify(postItems));
   }

   if (!shipsData && !itemsData) {
      inform_danger('艦娘、装備情報が登録されていません');
      return key;
   }

   const db = firebase.database().ref('stocks')
   const newRef = db.push();
   await newRef.set({ ships: shipsData, items: itemsData, date: formatDate(new Date(), 'yy/MM/dd HH:mm:ss') }, (error) => {
      if (error) {
         console.log(error);
         inform_danger('共有URLの発行に失敗しました');
      }
      else {
         key = newRef.key;
      }
      newRef.off();
   });

   return key;
}

/**
 * 共有用URL生成
 */
async function createSharedURL() {
   if (readOnlyMode) {
      inform_danger('現在、閲覧モードのため本機能は利用できません');
      return;
   }
   // 連打できないように
   document.getElementById('btn_share_fleet_process').classList.remove('d-none');
   document.getElementById('btn_share_fleet_parent').classList.add('d-none');
   document.getElementById('btn_share_fleet')['disabled'] = true;

   const key = await requestURLKey();
   if (!key) {
      // 終わり
      enabledShareButton();
      return;
   }

   await postURLData(MYURL + 'manager/?id=' + key)
      .then(json => {
         if (json.error || !json.shortLink) {
            inform_danger('共有URLの発行に失敗しました');
            enabledShareButton();
         }
         else {
            document.getElementById('share_url').value = json.shortLink;
            document.getElementById('share_url').nextElementSibling.classList.add('active');
            document.getElementById('btn_share_fleet_parent').nextElementSibling.classList.remove('d-none');
            document.getElementById('btn_share_fleet_process').classList.add('d-none');
            inform_success('共有URLの発行に成功しました');

            if (setting.createdURLs) {
               setting.createdURLs.push({ key: getUniqueId(), url: json.shortLink, date: formatDate(new Date(), 'yy/MM/dd HH:mm:ss') });
               saveSetting();
               initURLs();
            }
         }
      })
      .catch(error => {
         inform_danger('共有URLの発行に失敗しました');
         enabledShareButton();
      });
}

/**
 * 共有発行ボタン活性化セット
 */
function enabledShareButton() {
   document.getElementById('btn_share_fleet_parent').classList.remove('d-none');
   document.getElementById('btn_share_fleet_parent').nextElementSibling.classList.add('d-none');
   document.getElementById('btn_share_fleet_process').classList.add('d-none');
   document.getElementById('btn_share_fleet')['disabled'] = false;
}

/**
 * 発行URLリスト
 */
function initURLs() {
   if (!setting.createdURLs) {
      return;
   }

   const fragment = document.createDocumentFragment();
   for (const data of setting.createdURLs) {
      const box = createDiv('general_box px-3 py-2 mx-2 my-2 d-flex');
      const titleBody = createDiv('align-self-center');
      titleBody.textContent = '20' + data.date + 'の編成';
      box.appendChild(titleBody);

      const linkbuttonBody = createDiv('align-self-center ml-3');
      const linkbutton = document.createElement('button');
      linkbutton.className = 'waves-effect waves-light btn-small btn_link';
      linkbutton.textContent = '展開';
      linkbutton.dataset.url = data.url;
      linkbuttonBody.appendChild(linkbutton);
      box.appendChild(linkbuttonBody);

      const buttonBody = createDiv('align-self-center ml-2');
      const button = document.createElement('button');
      button.className = 'waves-effect waves-light btn-small red btn_delete_url';
      button.dataset.uniqueId = data.key;
      button.textContent = '削除';
      buttonBody.appendChild(button);

      box.appendChild(buttonBody);
      fragment.appendChild(box);
   }

   document.getElementById('created_url_list').innerHTML = '';
   document.getElementById('created_url_list').appendChild(fragment);
}

/**
 * URL削除クリック
 * @param {*} $this
 */
function btn_delete_url_Clicked($this) {
   const key = $this[0].dataset.uniqueId;

   if (setting.createdURLs && setting.createdURLs.find(v => v.key === key)) {
      document.getElementById('btn_delete_url_commit').dataset.key = key;
      $('#modal_url_remove_confirm').modal('open');
   }
}

/**
 * URL削除クリック
 */
function btn_delete_url_commit_Clicked() {
   const uniqueId = document.getElementById('btn_delete_url_commit').dataset.key;
   setting.createdURLs = setting.createdURLs.filter(v => v.key !== uniqueId);
   saveSetting();
   initURLs();

   inform_success('削除しました');

   $('#modal_url_remove_confirm').modal('close');
}

/**
 * Twitter共有
 */
async function btn_twitter_Clicked() {
   if (readOnlyMode) {
      inform_danger('現在、閲覧モードのため本機能は利用できません');
      return;
   }

   // 連打できないように
   if (document.getElementById('btn_twitter').classList.contains('disabled')) {
      return;
   }
   document.getElementById('btn_twitter').classList.add('disabled');

   // key取得
   const key = await requestURLKey();
   if (!key) {
      document.getElementById('btn_twitter').classList.remove('disabled');
      return;
   }

   const url = MYURL + 'manager/?id=' + key;
   let shortURL = url;
   let result = false;

   await postURLData(url).then(json => {
      if (json.error || !json.shortLink) console.log(json);
      else {
         result = true;
         shortURL = json.shortLink;
      }
   }).catch(error => console.error(error));

   if (result) {

      if (setting.createdURLs) {
         setting.createdURLs.push({ key: getUniqueId(), url: shortURL, date: formatDate(new Date(), 'yy/MM/dd HH:mm:ss') });
         saveSetting();
         initURLs();
      }

      window.open('https://twitter.com/share?url=' + shortURL);
   }
   else {
      document.getElementById('btn_twitter').classList.remove('disabled');
      inform_danger('共有URLの生成に失敗しました。');
   }
}

/**
 * URLデータ内idから外部情報を展開
 */
function readURLData(id) {
   try {
      const ref = firebase.database().ref('/stocks/' + id);
      ref.once('value').then((snapshot) => {
         const stock = snapshot.val();
         readOnlyShips = [];
         readOnlyItems = [];

         // 整合性チェック -艦娘
         if (stock && stock.ships) {
            const ships = JSON.parse(b64_to_utf8(stock.ships));
            if (ships && ships.length) {
               // 圧縮状態から展開
               for (const ship of ships) {
                  const details = ship[1];
                  if (!details.length || details.find(v => v.length !== 5)) {
                     // データ形式があわないためスキップ
                     continue;
                  }
                  // データ展開
                  readOnlyShips.push({
                     id: ship[0],
                     details: details.map(v => {
                        return { id: v[0], lv: v[1], exp: v[2], st: v[3], area: v[4] }
                     })
                  });
               }
            }
         }

         // 整合性チェック -装備
         if (stock && stock.items) {
            const items = JSON.parse(b64_to_utf8(stock.items));
            if (items && items.length) {
               // 圧縮状態から展開
               for (const item of items) {
                  const itemStock = { id: item[0], num: [] };
                  // 改修0～MAX毎の個数格納
                  for (let remodel = 0; remodel <= 10; remodel++) {
                     if (item[1] && remodel < item[1].length) {
                        itemStock.num.push(item[1][remodel]);
                     }
                     else {
                        itemStock.num.push(0);
                     }
                  }
                  readOnlyItems.push(itemStock);
               }
            }
         }

         if (!stock || ((!stock.ships || !readOnlyShips.length) && (!stock.items || !readOnlyItems.length))) {
            // 両データとも0件
            inform_warning('艦娘、装備情報の復元ができませんでした。パラメータが違うか、データが削除されています');
         }
         else {
            document.getElementById('readonly_mode').classList.remove('d-none');
            document.getElementById('btn_exit_readonly').classList.remove('d-none');
            readOnlyMode = true;
         }

         ref.off();

         initItemList();
         initShipList();
      });
   } catch (error) {
      // データ読込失敗(データ削除済 or 適当なID)
      inform_warning('艦娘、装備情報の復元ができませんでした。パラメータが違うか、データが削除されています');
      quitReadonlyMode();
   }
}

/**
 * レベルによる上昇のステータスを取得
 * @param {number} lv レベル
 * @param {number} max Lv99時のステータス
 * @param {number} min 初期値
 * @returns
 */
function getLevelStatus(lv, max, min) {
   if (lv === 99 && max > 0) {
      return max;
   }
   else if (max > 0) {
      // Lv99以外 算出可能な場合
      return Math.floor((max - min) * (lv / 99) + min);
   }
   else {
      // 算出不可
      return 0;
   }
}

/**
 * 閲覧専用モードの終了
 */
function quitReadonlyMode() {
   document.getElementById('readonly_mode').classList.add('d-none');
   document.getElementById('btn_exit_readonly').classList.add('d-none');
   readOnlyMode = false;
   readOnlyShips = null;
   readOnlyItems = null;
   initShipList();
   initItemList();
   initExpTable();
   inform_success('閲覧モードを終了しました');
}

/**
 * お気に入りクリック 艦載機
 * @param {JQuery} $this
 */
function item_fav_Clicked($this) {
   const itemId = castInt(document.getElementById('edit_item_id').dataset.itemId);
   if ($this.hasClass('fav')) {
      // お気に入り解除
      setting.favoritePlane = setting.favoritePlane.filter(v => v !== itemId);
      $this.removeClass('fav');
      document.getElementById('add_fav_item').classList.remove('d-none');
      document.getElementById('remove_fav_item').classList.add('d-none');
   }
   else {
      // お気に入り登録
      setting.favoritePlane.push(itemId);
      $this.addClass('fav');
      document.getElementById('add_fav_item').classList.add('d-none');
      document.getElementById('remove_fav_item').classList.remove('d-none');
   }

   saveSetting();
}

/**
 * お気に入りクリック 艦娘
 * @param {JQuery} $this
 */
function ship_fav_Clicked($this) {
   const shipId = castInt($('#modal_ship_edit').find('.version_radio:checked')[0].dataset.shipId);
   if ($this.hasClass('fav')) {
      // お気に入り解除
      setting.favoriteShip = setting.favoriteShip.filter(v => v !== shipId);
      $this.removeClass('fav');
      document.getElementById('add_favorite').classList.remove('d-none');
      document.getElementById('remove_favorite').classList.add('d-none');
   }
   else {
      // お気に入り登録
      setting.favoriteShip.push(shipId);
      $this.addClass('fav');
      document.getElementById('add_favorite').classList.add('d-none');
      document.getElementById('remove_favorite').classList.remove('d-none');
   }

   saveSetting();
}
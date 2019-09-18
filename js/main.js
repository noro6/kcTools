/*==================================
    グローバル
==================================*/

// 機体選択画面の返却先
let $target = undefined;

// 基本の艦載機データ群(基地用ソート済み)
let basicSortedPlanes = [];

// 熟練を最初からMaxにする機体カテゴリ
const levelMaxCate = [1, 4, 5, 7, 8, 102, 103];

// 搭載数が基地で最大4の機体カテゴリ つまり偵察機
const reconnaissances = [4, 5, 8, 104];

// 熟練度 >> 選択時、内部熟練度を 120 として計算するもの
let prof120 = [1, 4, 5, 7, 8, 102, 103, 104];

// ドラッグした要素が範囲外かどうかフラグ
let isOut = false;

let chartData = null;

// 直前のデータ
let prevData = [];

// 防空モード
let isDefenseMode = false;

// 戦闘回数
let battleCount = 1;

// arrayとdiffArray内に1つでも同じ値がある場合true
const isContain = (array, diffArray) => { for (const value1 of array) for (const value2 of diffArray) if (value1 === value2) return true; return false; }

let timer = false;

const imgUrl = "https://noro6.github.io/kcTools";
//const imgUrl = ".";

/*==================================
    描画用
==================================*/
/**
 * 画面初期化 構築
 * @param {*} callback
 */
function initAll(callback) {

  // 競合回避
  $.widget.bridge('uibutton', $.ui.button);
  $.widget.bridge('uitooltip', $.ui.tooltip);

  // 機体カテゴリ初期化
  setPlaneType($('#planeSelect_select'), planeType.filter(v => v.id > 0).map(v => v.id));

  // デフォ機体群定義
  $('#planeSelect_select').find('option').each(function () {
    basicSortedPlanes = basicSortedPlanes.concat(planeData.filter(v => Math.abs(v.type) == Number($(this).val())));
  });

  // 艦種初期化
  $('.shipType_select').empty();
  $('.shipType_select').append('<option value="0">全て</option>');
  setShipType(shipType.filter(v => v.id < 15).map(v => v.id));

  // 敵艦種初期化
  $('.enemyType_select').empty();
  $('.enemyType_select').append('<option value="0">全て</option>');
  setEnemyType(enemyType.filter(v => v.id > 0).map(v => v.id));

  let planes = [];
  $('#planeSelect_select').find('option').each(function () {
    planes = planes.concat(planeData.filter(v => Math.abs(v.type) == Number($(this).val())));
  });
  createPlaneTable($('.plane_table'), planes);
  createShipTable($('.ship_table'), [0]);
  createEnemyTable($('.enemy_table'), [0]);

  // 改修値選択欄生成
  let text = '';
  for (let i = 0; i <= 10; i++) {
    if (i == 0) text += '<option class="IMP_option" value="0" selected>★0</option>';
    else if (i == 10) text += '<option class="IMP_option" value="10">★max</option>';
    else text += '<option class="IMP_option" value="' + i + '">★' + i + '</option>';
  }
  $('.IMP_select').append(text);

  // 熟練度選択欄
  text = `
  <a class="dropdown-item prof_item"><img class="prof_option" alt=">>" data-prof="7" src="` + imgUrl + `/img/util/prof7.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option" alt="///" data-prof="6" src="` + imgUrl + `/img/util/prof6.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option" alt="//" data-prof="5" src="` + imgUrl + `/img/util/prof5.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option" alt="/" data-prof="4" src="` + imgUrl + `/img/util/prof4.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option" alt="|||" data-prof="3" src="` + imgUrl + `/img/util/prof3.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option" alt="||" data-prof="2" src="` + imgUrl + `/img/util/prof2.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option" alt="|" data-prof="1" src="` + imgUrl + `/img/util/prof1.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option" alt="" data-prof="0" src="` + imgUrl + `/img/util/prof0.png"></a>
  `;
  $('.prof_select').next().append(text);

  // 基地航空隊 複製
  $('.lb_tab').html($('#lb_item1').html());
  $('.baseNo').each((i, e) => { $(e).text('第' + (i + 1) + '基地航空隊') });
  // 基地航空隊 第1基地航空隊第1中隊複製
  $('.lb_plane').html($('#lb_item1').find('.lb_plane:first').html());

  // 基地簡易ビュー複製
  $('#lb_info_table tbody').find('tr').each((i, e) => {
    $(e).html($('#lb_info_table tbody tr:first').html()).css('background-color', '#bbb');
    $(e).find('.col0').text('第' + (i + 1) + '基地航空隊');
  });

  // 艦娘　操作盤複製
  $base = $('#friendFleet_item1').find('.ship_ope:first').clone();
  $base.find('.minToggleBtn').remove();
  $('.ship_ope:not(:first)').prepend($base.html());
  // スロット欄複製
  $('.ship_tab_main').html($('#friendFleet_item1').find('.ship_tab_main:first').html());
  // 艦娘 機体欄複製
  $('.ship_plane_parent').html($('#friendFleet_item1').find('.ship_plane_parent:first').html());

  // 敵艦複製
  $('.battle_content').html($('.battle_content:first').html());
  $('.battle_content').each(function (i) {
    $(this).find('.battleNo').text(i + 1);
    if (i > 0) $(this).addClass('d-none');
  });

  // 戦闘回数初期化
  $('#battleCount').val(1);

  // 結果表示戦闘初期化
  $('#displayBattle').val(1);

  // 撃墜テーブルヘッダフッタ生成
  text = '';
  let text1 = '';
  let text2 = '';
  let text3 = '';
  for (let index = 1; index <= 10; index++) {
    text += '<td class="td_battle battle' + index + '">' + index + '戦目</td>';
    text1 += '<td class="td_battle battle' + index + ' fap"></td>';
    text2 += '<td class="td_battle battle' + index + ' eap"></td>';
    text3 += '<td class="td_battle battle' + index + ' cond"></td>';
  }
  $('#shootDownTable').find('.tr_header').append(text);
  $('.tr_fap').append(text1);
  $('.tr_eap').append(text2);
  $('.tr_cond').append(text3);

  // 詳細設定
  let maxAA = 0;
  text = '';
  for (const plane of planeData) if (plane.AA > maxAA) maxAA = plane.AA;
  for (let index = 0; index < maxAA; index++) text += '<option value="' + index + '">' + index + '</option>';
  $('#dispMoreThanxAA').append(text);

  $('[data-toggle="tooltip"]').tooltip();
  $('.enemy_ap').tooltip('disable')
  $('[data-toggle="popover"]').popover();

  // 基地欄簡易化するかどうか
  if ($('#lb_tab_select').css('display') != 'none' && $('#lb_item1').attr('class').indexOf('tab-pane') == -1) {
    $('.lb_tab').addClass('tab-pane fade');
    $('.lb_tab:first').addClass('show active');
    $('#lb_item1').addClass('active');
  }

  callback();
}

/**
 * カテゴリコードから艦載機配列を返却
 * @param {number} type
 * @returns {number} 艦載機オブジェクト配列 0を渡した場合は全て
 */
function getPlanes(type) {

  let planes = [];
  if (type == 0) planes = basicSortedPlanes.concat();
  else planes = planeData.filter(v => Math.abs(Number(v.type)) == Math.abs(Number(type)));

  return planes;
}

/**
 * 機体カテゴリコードからcssクラスを返却
 * @param {number} typeCd
 * @returns {string} cssクラス名
 */
function getPlaneCss(typeCd) {
  let return_css = "";
  switch (typeCd) {
    case 1:
      return_css = "css_fighter";
      break;
    case -1:
      return_css = "css_cb_night_aircraft";
      break;
    case 2:
      return_css = "css_torpedo_bomber";
      break;
    case -2:
      return_css = "css_cb_night_aircraft";
      break;
    case 3:
      return_css = "css_dive_bomber";
      break;
    case 4:
    case 9:
    case 104:
      return_css = "css_cb_reconnaissance";
      break;
    case 5:
    case 6:
    case 7:
    case 8:
      return_css = "css_sp";
      break;
    case 101:
    case 103:
      return_css = "css_lb_attack_aircraft";
      break;
    case -101:
      return_css = "css_lb_asw_aircraft";
      break;
    case 102:
      return_css = "css_lb_fighter";
      break;
    default:
      break;
  }
  return return_css;
}


/**
 * 引数 dom を持つ艦娘が何番目か返却する
 * @param {JqueryDomObject} $element .ship_tab 内のいずれかJDOM
 * @returns {number} 艦娘の配置番号
 */
function getParentShipNo($element) {
  const $shipTab = $element.closest('.ship_tab');
  if ($shipTab.attr('class')) {
    return Number($shipTab.find('.ship_tab_main').attr('id').replace(/ship_plane_content_/g, ''));
  }
  else return NaN;
}

/**
 * 機体カテゴリ選択欄に、配列から選択可能データを生成
 * @param {JqueryDomObject} $select 設置する対象の select
 * @param {Array.<number>} 展開する機体カテゴリidの配列
 */
function setPlaneType($select, array) {
  $select.empty();
  $select.append('<option value="0">全て</option>');
  let exist = false;

  // 陸上機判定
  for (const v of [100, 101, 102, 103, 104]) {
    exist = array.indexOf(v) != -1;
    if (exist) break;
  }
  if (exist) {
    $select.append('<optgroup label="陸上機" id="optg_lb">');
    exist = false;
  }

  // 艦上機判定
  for (const v of [1, 2, 3, 4, 9]) {
    exist = array.indexOf(v) != -1;
    if (exist) break;
  }
  if (exist) {
    $select.append('<optgroup label="艦上機" id="optg_cb">');
    exist = false;
  }

  // 水上機判定
  for (const v of [5, 6, 7, 8]) {
    exist = array.indexOf(v) != -1;
    if (exist) break;
  }
  if (exist) {
    $select.append('<optgroup label="水上機" id="optg_sp">');
    exist = false;
  }

  let html = '';
  for (const v of planeType) {
    if (array.indexOf(v.id) != -1) {
      html = '<option value="' + v.id + '">' + v.name + '</option>';
      $select.find('#' + ([1, 2, 3, 4, 9].indexOf(v.id) != -1 ? 'optg_cb' : [5, 6, 7, 8].indexOf(v.id) != -1 ? 'optg_sp' : 'optg_lb')).append(html);
    }
  }
}

/**
 * 艦種選択欄に、配列から選択可能データを生成
 * @param {Array.<number>} 展開する艦種ID 配列
 */
function setShipType(array) {
  let html = '';
  for (const v of shipType) if (array.indexOf(v.id) != -1) html += '<option value="' + v.id + '">' + v.name + '</option>';
  $('.shipType_select').append(html);
}

/**
 * 敵艦種選択欄に、配列から選択可能データを生成
 * @param {Array.<number>} 展開する艦種ID 配列
 */
function setEnemyType(array) {
  let html = '';
  for (const v of enemyType) if (array.indexOf(v.id) != -1) html += '<option value="' + v.id + '">' + v.name + '</option>';
  $('.enemyType_select').append(html);
}

/**
 * 引数で渡された .lb_plane 要素をクリアする
 * @param {JqueryDomObject} $div クリアする .lb_plane .ship_div
 */
function clearPlaneDiv($div) {
  // 選択状況をリセット
  $div.removeClass(getPlaneCss($div.data('type')));
  $div.removeData();
  $div.find('.plane_img').attr('src', './img/e/undefined.png').attr('alt', '');
  $div.find('.cur_move').removeClass('cur_move');
  $div.find('.plane_name_span').text('機体を選択');
  $div.find('select').val('0').change();
  $div.find('.IMP_select').prop('disabled', true).addClass('IMP_select_disabled');
  $div.find('.prof_select').attr('src', imgUrl + '/img/util/prof0.png').attr('alt', '').data('prof', 0);
}

/**
 * 第1引数で渡された lb_plane に第2引数で渡された 機体データ入り要素のデータを挿入する 新規選択時限定
 * @param {JqueryDomObject} $div
 * @param {JqueryDomObject} $original
 */
function setLBPlaneDiv($div, $original) {
  const result = setPlaneDiv($div, $original);

  let slot = Number($original.data('slot'));
  // 搭載数初期値 偵察機系は4
  if (slot >= 0) $div.find('.slot').val(slot);
  else if (reconnaissances.indexOf($original.data('type')) != -1) $div.find('.slot').val(4);
  else if (!result) $div.find('.slot').val(0);
  else $div.find('.slot').val(18);
}

/**
 * 第1引数で渡された xx_plane に第2引数で渡された 機体データ入り要素のデータを挿入する
 * @param {JqueryDomObject} $div xx_plane xxは現状 ship または lb
 * @param {JqueryDomObject} $original 機体情報保持要素
 * @returns {boolean} 機体データ挿入が成功したかどうか
 */
function setPlaneDiv($div, $original) {
  const id = Number($original.attr('id') ? $original.attr('id') : $original.data('id'));
  const type = $original.data('type');
  const plane = getPlanes(type).find(v => v.id == id);

  if (!id) {
    clearPlaneDiv($div);
    return false;
  }

  // 機体が装備できるのかどうかチェック
  const shipID = $div.closest('.ship_tab').data('id')
  if (shipID && !checkInvalidEquipment(shipID, plane)) {
    clearPlaneDiv($div);
    return false;
  }

  $div
    // デザイン
    .removeClass(getPlaneCss($div.data('type')))
    .addClass(getPlaneCss(type))
    // 機体データ取得
    .data('id', id)
    .data('type', type);

  $div.find('.plane_name_span').text(plane.abbr ? plane.abbr : plane.name).attr('title', plane.abbr ? plane.name : '');
  $div.find('.plane_img').attr('src', './img/e/Type' + plane.type + '.png').attr('alt', plane.type);
  $div.find('.plane_img').parent().addClass('cur_move');

  // 改修の有効無効設定
  const $IMPInput = $div.find('.IMP_select');
  $IMPInput.prop('disabled', !plane.IMP).removeClass('IMP_select_disabled');
  if ($IMPInput.prop('disabled')) $IMPInput.val('0').addClass('IMP_select_disabled');;

  // 熟練度初期値 戦闘機系は最初から熟練Maxで 陸偵熟練は||
  let prof = 0;
  if (levelMaxCate.indexOf(type) != -1) prof = 7;
  else if (id == 312) prof = 2;
  // 特定熟練度を保持していた場合
  if ($original.data('prof')) prof = $original.data('prof');
  $div.find('.prof_select').attr('src', imgUrl + '/img/util/prof' + prof + '.png').data('prof', prof);

  // 特定の改修値を保持していた場合
  if ($original.data('IMP')) $IMPInput.val($original.data('IMP'));

  return true;
}

/**
 * 第1引数のidの艦娘が第2引数の艦載機を装備できるかどうか
 * @param {number} shipID 艦娘id
 * @param {Object} plane 艦載機オブジェクト data.js参照
 * @returns {boolean} 装備できるなら true
 */
function checkInvalidEquipment(shipID, plane) {
  const ship = shipData.find(v => v.id == shipID);
  const basicCanEquip = typelink_Ship_Equip.find(v => v.type == ship.type);
  const special = specialLink_ship_equipment.find(v => v.shipId == ship.id);
  let canEquip = [];
  if (basicCanEquip) {
    for (const v of basicCanEquip.e_type) canEquip.push(v);
    if (special) for (const i of special.equipmentTypes) canEquip.push(i);
  }

  // 基本装備可能リストにない場合
  if (canEquip.indexOf(Math.abs(plane.type)) == -1) {
    // 敗者復活 (特別装備可能idに引っかかっていないか)
    if (special && special.equipmentIds.indexOf(plane.id) > -1) return true;
    console.log(ship.name + 'に' + plane.name + 'は装備不可');
    return false;
  }

  return true;
}

/**
 * 第1引数で渡された .ship_tab に第2引数で渡された 艦娘データを挿入する
 * @param {JqueryDomObject} $div 艦娘タブ (ship_tab)
 * @param {number} id
 */
function setShipDiv($div, id) {
  const ship = shipData.find(v => v.id === id);
  $div.data('id', ship.id)
  $div.find('.ship_name_span').text(ship.name);
  $div.find('.btnRemoveShip').prop('disabled', false);

  $div.find('.ship_plane').each(function (i) {
    const $this = $(this);

    // 既に装備されている装備が不適切なら自動的にはずす
    const $plane =
      $('<div>')
        .data('id', $this.data('id'))
        .data('type', $this.data('type'))
        .data('IMP', $this.find('.IMP_select').val())
        .data('prof', $this.find('.prof_select').data('prof'));
    if ($this.data('id')) setPlaneDiv($this, $plane);

    $this.find('.slot').val('0');
    if (i < ship.slot.length) {
      $this.parent().removeClass('d-none');
      $this.find('.slot').val(ship.slot[i]);
    }
    else $this.parent().addClass('d-none');
  });
}

/**
 * 指定した ship_tab をクリアする
 * @param {JqueryDomObject} $div クリアする .ship_tab
 */
function clearShipDiv($div) {
  // 選択状況をリセット
  $div.removeData();
  $div.find('.ship_name_span').text('艦娘を選択');
  $div.find('.ship_plane_parent').find('.slot').val('0');
}

/**
 * 第1引数で渡された .enemy_content に第2引数で渡されたidの敵艦データを挿入する
 * @param {JqueryDomObject} $div 敵艦タブ (enemy_content)
 * @param {number} id
 */
function setEnemyDiv($div, id) {
  const enemy = createEnemyObject(id);
  $div.data('id', enemy.id)
  $div.find('.enemy_name_span').html(drawEnemyGradeColor(enemy.name));

  if (enemy.ap > 0) {
    $div.find('.enemy_ap').text(enemy.ap);
  }
  else if (enemy.lbAp > 0) {
    $div.find('.enemy_ap').text('(' + enemy.lbAp + ')');
  }

  if (id == -1) {
    // 直接入力選択時はちょっとレイアウト変更
    $div.find('.enemy_name_span:first').addClass('d-none');
    $div.find('.enemy_ap').addClass('d-none');
    $div.find('.direct_enemy_name').removeClass('d-none');
    $div.find('.direct_enemy_ap').removeClass('d-none');
  }
  else {
    $div.find('.enemy_name_span:first').removeClass('d-none');
    $div.find('.enemy_ap').removeClass('d-none');
    $div.find('.direct_enemy_name').addClass('d-none');
    $div.find('.direct_enemy_ap').addClass('d-none');
  }

  $div.find('.btnRemoveEnemy').prop('disabled', false);

  // 複製の必要あるかどうか
  if (!$div.next().attr('class') && $div.parent().find('.enemy_content').length < 10) {
    // 複製して追加
    const $clone = $div.clone();
    // 複製したやつは初期化
    clearEnemyDiv($clone);
    $div.parent().append($clone);
  }
}

/**
 * 指定した enemy_content をクリアする
 * @param {JqueryDomObject} $div クリアする .enemy_content
 */
function clearEnemyDiv($div) {
  // 削除してもいいなら消すゾ
  if ($div.next().attr('class')) {
    // 消した後新規行いるよ
    if ($div.parent().find('.enemy_content').length == 10 && $div.parent().find('.enemy_content:last').data('id')) {
      // 複製して追加
      const $clone = $div.clone();
      // 複製したやつは初期化
      clearEnemyDiv($clone);
      $div.parent().append($clone);
    }
    $div.remove();
  }
  else {
    // 選択状況をリセット
    $div.removeData();
    $div.find('.enemy_name_span').text('敵艦を選択');
    $div.find('.enemy_name_span:first').removeClass('d-none');
    $div.find('.enemy_ap').removeClass('d-none').text(0);
    $div.find('.direct_enemy_name').addClass('d-none');
    $div.find('.direct_enemy_ap').addClass('d-none');
    $div.find('.enemy_ap_form').val('0');
  }
}

/**
 * 値が増加した場合緑に、減少した場合赤に、色を変えつつ値を変更する
 * @param {JqueryDomObject} $inline
 * @param {number} pre 変更前の値
 * @param {number} cur 変更後の値
 * @param {boolean} reverse 赤緑判定を反転する場合 true を指定
 */
function drawChangeValue($inline, pre, cur, reverse) {
  if (pre != cur) {
    $inline.text(cur).stop();
    if (reverse) $inline.css('color', cur < pre ? '#0c5' : cur > pre ? '#f00' : '#000');
    else $inline.css('color', cur > pre ? '#0c5' : cur < pre ? '#f00' : '#000');
    $inline.delay(500).animate({ 'color': '#000' }, 1000);
  }
}

/**
 * 渡された敵艦名にflagshipやelite文字が含まれていれば色を塗ってあげる
 * @param {string} enemyName
 * @returns {string} 色付き敵艦名
 */
function drawEnemyGradeColor(enemyName) {
  if (enemyName.indexOf('elite') > -1) {
    enemyName = enemyName.replace('elite', '<span class="text-danger">elite</span>');
  }
  else if (enemyName.indexOf('改flagship') > -1) {
    enemyName = enemyName.replace('flagship', '<span class="text-primary">flagship</span>');
  }
  else if (enemyName.indexOf('flagship') > -1) {
    enemyName = enemyName.replace('flagship', '<span class="text-warning">flagship</span>');
  }
  return enemyName;
}

/**
 * 引数で渡された table 要素(要 tbody )に plans 配列から値を展開
 * @param {JqueryDomObject} $table
 * @param {Array.<Object>} planes
 */
function createPlaneTable($table, planes) {
  const $tbody = $table.find('.plane_tbody');
  const cutOffAA = Number($('#dispMoreThanxAA').val());
  let insertHtml = `
  <div class="plane_thead d-flex bg-white py-2">
    <div class="plane_td_type" id="th_default" data-order="asc">
        <img class="img-size-25" src="./img/e/undefined.png" alt="種">
    </div>
    <div class="pl-1 plane_td_name" id="th_name" data-order="asc">装備名</div>
    <div class="ml-auto plane_td_aa" id="th_aa" data-order="asc">対空</div>
    <div class="plane_td_range" id="th_range" data-order="asc">半径</div>
  </div>
  `;

  const max_i = planes.length;
  for (let i = 0; i < max_i; i++) {
    const plane = planes[i];
    // 対空:0 の艦攻艦爆を除く
    if ($('#dispMoreThan0AA').prop('checked') && [2, 3].indexOf(Math.abs(plane.type)) > -1 && plane.AA == 0 && plane.id < 10000) continue;
    else if (!$('#dispMoreThan0AA').prop('checked') && plane.id > 10000) continue;

    const nmAA = plane.AA + 1.5 * plane.IP;
    const defAA = plane.AA + plane.IP + 2.0 * plane.AB;
    // 対空一定値以下の戦闘機系を除く
    if ($('#dispMoreThanxAASwitch').prop('checked') && cutOffAA >= plane.AA && [1, 7, 102, 103].indexOf(Math.abs(plane.type)) > -1) continue;

    const needTooltip = plane.AB > 0 || plane.IP > 0;

    insertHtml += `
    <div class="plane d-flex plane_tr py-2 py-lg-1" id="` + plane.id + `" data-type="` + plane.type + `">
        <div class="plane_td_td_type align-self-center"><img class="img-size-25" src="./img/e/Type`+ plane.type + `.png" alt="` + plane.type + `"></div>
        <div class="pl-1 plane_td_name align-self-center">`+ plane.name + `</div>
        <div class="ml-auto plane_td_aa align-self-center
        ` + (needTooltip ?
        'text_existTooltip" data-toggle="tooltip" title="出撃時:' + nmAA + ' , 防空時:' + defAA + '"'
        : '"') + `>
          ` + plane.AA + `
        </div>
        <div class="plane_td_range align-self-center">`+ plane.range + `</div>
    </div>
    `;
  }

  document.getElementById('plane_table_tbody').innerHTML = insertHtml;
  $tbody.find('.text_existTooltip').tooltip();

  // 機体選択モーダル内のボタン非活性
  $('#planeSelectModal_btnRemove').prop('disabled', true);
}

/**
 * 引数で渡された table 要素(要 tbody )に ship 配列から値を展開
 * @param {JqueryDomObject} $table
 * @param {Array.<number>} type
 */
function createShipTable($table, type) {
  const $tbody = $table.find('.ship_tbody');
  const c_ship = shipData.concat();
  let dispData = [];
  let insertHtml = '';

  // 艦種ソート後、改造元idソート
  for (const typeObj of shipType) {
    const tmp = c_ship.filter(v => v.type == typeObj.id);
    tmp.sort((a, b) => a.orig > b.orig ? 1 : -1);
    dispData = dispData.concat(tmp);
  }

  for (const ship of dispData) {

    // 艦種絞り込み
    if (type[0] != 0 && type.indexOf(ship.type) == -1) continue;
    if ($('#dispFinalOnly').prop('checked') && !ship.final) continue;

    let slotText = '<div class="ml-auto ship_td_slot">' + (0 < ship.slot.length ? ship.slot[0] : '') + '</div>';
    for (let index = 1; index < 5; index++) slotText += '<div class="ship_td_slot">' + (index < ship.slot.length ? ship.slot[index] : '') + '</div>';

    insertHtml += `
    <div class="ship d-flex ship_tr py-2 py-lg-1" id="` + ship.id + `">
        <div class="pl-1 ship_td_name">` + ship.name + `</div>`
      + slotText + `
    </div>`;
  }
  $tbody.find('.ship').remove();
  $tbody.append(insertHtml);

  // 艦隊選択モーダル内のボタン非活性
  $('#shipSelectModal_btnRemove').prop('disabled', true);
}

/**
 * 引数で渡された table 要素(要 tbody )に enemy 配列から値を展開
 * @param {JqueryDomObject} $table 展開先テーブル
 * @param {Array.<number>} type type[0] == 0 は全て選択時
 */
function createEnemyTable($table, type) {
  const $tbody = $table.find('tbody');
  const c_enemy = enemyData.concat();
  let dispData = [];
  let insertHtml = '';

  // 第1艦種(type[0]行目)順で取得後、無印idソート
  for (const typeObj of enemyType) {
    const tmp = c_enemy.filter(x => x.type[0] == typeObj.id);
    dispData = dispData.concat(tmp.sort((a, b) => a.orig > b.orig ? 1 : a.orig < b.orig ? -1 : a.id - b.id));
  }

  for (const enemy of dispData) {

    // 艦種で絞る
    if (type[0] != 0 && !isContain(type, enemy.type)) continue;

    let ap = 0;
    let lbAp = 0;
    for (let i = 0; i < enemy.aa.length; i++) {
      if (!enemy.isSpR) ap += Math.floor(enemy.aa[i] * Math.sqrt(enemy.slot[i]));
      else lbAp += Math.floor(enemy.aa[i] * Math.sqrt(enemy.slot[i]));
    };
    lbAp += ap;

    insertHtml += `
    <tr class="border-bottom enemy" data-id="` + enemy.id + `">
        <td width="60%" class="pl-2 enemy_draggable">` + drawEnemyGradeColor(enemy.name) + `</td>
        <td width="15%" class="text-center">`+ ap + `</td>
        <td width="25%" class="text-center">`+ lbAp + `</td>
    </tr>`;
  }
  $tbody.html(insertHtml);

  // 艦隊選択モーダル内のボタン非活性
  $('#enemySelectModal_btnCommit').prop('disabled', true);
  $('#enemySelectModal_btnRemove').prop('disabled', true);
}

/**
 * グラフの描画を行う
 * 確保を100%とした、120%上限あたりの各100分率をグラフ化
 */
function drawResultBar() {
  // グラフ描画域リセット
  $('#resultChart').html('');

  const data = Object.create(chartData);
  // それぞれのフェーズにおける制空ボーダーの配列を生成
  const border = data.enemy.map(eap => getBorder(eap));
  const divBase = border.map(value => value[0] == 0 ? 1 : value[0]);
  const mainData = data.own.map((ap, i) => ap / divBase[i] * 100);
  const phaseList = isDefenseMode ? ['防空'] : ['基地1 1波', '基地1 2波', '基地2 1波', '基地2 2波', '基地3 1波', '基地3 2波', '', '本隊'];
  const svgPadding = { left: 70, right: 20, bottom: 30, top: 20 };
  const svgMargin = { left: 0, right: 0, bottom: 0, top: 0 };
  const barWidth = 12;
  const svgWidth = $('#resultChart').width() - svgMargin.left - svgMargin.right;
  const svgHeight = 1.8 * barWidth * (mainData.length) + svgPadding.top + svgPadding.bottom;
  const maxRange = 110;
  const borderColor = getBarColor(1.0);
  const backColor = getBarColor(0.4);

  const xScale = d3.scaleLinear()
    .domain([0, maxRange])
    .range([svgPadding.left, svgWidth - svgPadding.right]);
  const yScale = d3.scaleBand()
    .rangeRound([svgPadding.top, svgHeight - svgPadding.bottom])
    .domain(phaseList);

  // 直前データとの整合性チェック
  if (prevData.length != mainData.length) {
    prevData.length = 0;
    for (const i of mainData) prevData.push(0);
  }

  // グラフエリア生成
  const svg = d3.select('#resultChart').append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  // x軸
  svg.append('g')
    .attr('class', 'axis x_axis')
    .style('color', '#333')
    .style('font-size', '.75em')
    .attr(
      'transform',
      'translate(0,' + (svgHeight - svgPadding.top) + ')'
    )
    .call(
      d3.axisBottom(xScale)
        .tickValues([100, 50, 100 / 4.5, 100 / 9])
        .tickFormat((d, i) => airStatus[i].abbr)
        .tickSize(-svgHeight + svgPadding.top + svgPadding.bottom - 15)
    );

  // y軸
  svg.append('g')
    .attr('class', 'axis y_axis')
    .style('color', '#333')
    .style('font-size', '.8em')
    .attr("transform", "translate(" + svgPadding.left + ",-6)") // ちょっと上に移動 -6
    .call(d3.axisLeft(yScale));

  // ツールチップ生成
  $('.tooltip_resultBar').remove();
  const tooltip = d3.select("body").append("div").attr("class", "tooltip_resultBar px-3 pt-1");

  // 各種バー描画
  svg.selectAll('svg')
    .data(mainData)
    .enter()
    .append('rect')
    .attr('x', xScale(0))
    .attr('y', (d, i) => yScale(phaseList[i]))
    .attr('width', (d, i) => xScale(prevData[i] > maxRange ? maxRange : prevData[i]) - xScale(0))
    .attr('height', barWidth)
    .style('fill', (d, i) => backColor[getAirStatusIndex(data.own[i], data.enemy[i])])
    .style('stroke', (d, i) => borderColor[getAirStatusIndex(data.own[i], data.enemy[i])])
    .on('mouseover', function (d, i) {
      d3.select(this)
        .attr('style', 'fill:' + getBarColor(0.8)[getAirStatusIndex(data.own[i], data.enemy[i])])
        .style('stroke', borderColor[getAirStatusIndex(data.own[i], data.enemy[i])]);

      // 確率表示
      let addText = '';
      let isFirst = true;

      if (!isDefenseMode) {
        const target = data.rate[i];
        for (const key of Object.keys(target)) {
          if ((target[key] + ' %') != '0 %') {
            addText += isFirst ? '' : ' / '
            addText += airStatus.find(v => v.id == key).abbr + '(' + target[key] + '%)';
            isFirst = false;
          }
        }
      }

      // ボーダー表示
      let addText2 = '';
      const ap = data.own[i];
      airStatus.forEach((val, index) => {
        const sub = ap - border[i][index];
        if (index != airStatus.length - 1) {
          addText2 += `
                        <tr`+ (sub > 0 ? ' class="font-weight-bold"' : '') + `>
                            <td class="text-right">` + val.abbr + `:</td>
                            <td>` + border[i][index] + `</td>
                            <td>(` + (sub > 0 ? '+' + sub : sub == 0 ? '± 0' : '-' + (-sub)) + `)</td>
                        </tr>`;
        }
      });

      let infoText = `
                <div class="text-center mb-2">`
        + (isDefenseMode ? `防空(合計値)` : (i < 7 ? `第` + Math.floor(i / 2 + 1) + `基地航空隊　第` + ((i % 2) + 1) + `波` : `本隊`)) +
        `</div>
                <div class="text-center font-weight-bold">` + airStatus[getAirStatusIndex(ap, data.enemy[i])].name + `</div>
                <table class="table table-sm mb-1">
                    <tbody>
                        <tr>
                            <td colspan="3" class="text-center">`+ addText + `</td>
                        </tr>
                        <tr class="border-top border-secondary">
                            <td class="text-right">制空値:</td>
                            <td>` + ap + `</td><td></td>
                        </tr>
                        ` + addText2 + `
                    </tbody>
                </table>`;

      tooltip
        .style("visibility", "visible")
        .html(infoText)
        .style("top", (d3.event.pageY - 250) + "px")
        .style("left", (d3.event.pageX + 15) + "px");
    })
    .on('mouseout', function (d, i) {
      d3.select(this)
        .attr('style', 'fill:' + backColor[getAirStatusIndex(data.own[i], data.enemy[i])])
        .style('stroke', borderColor[getAirStatusIndex(data.own[i], data.enemy[i])]);
      tooltip.style("visibility", "hidden");
    })
    .transition()
    .ease(d3.easePolyOut)
    .duration(800)
    .attr('width', d => (d > maxRange ? xScale(maxRange) : xScale(d)) - xScale(0));

  prevData = mainData.concat();
}

/**
 * グラフ描画用のカラーコードを返却する
 * @param {number} opacity
 * @returns {Array.<string>} 色コードのリスト index:0 から順に、確保,優勢,均衡,劣勢,喪失 の色
 */
function getBarColor(opacity) {
  return [
    'rgba(60, 170, 30,' + opacity + ')',
    'rgba(140, 205, 150,' + opacity + ')',
    'rgba(230, 230, 20,' + opacity + ')',
    'rgba(255, 150, 50,' + opacity + ')',
    'rgba(247, 80, 80,' + opacity + ')'
  ];
}

/*==================================
    オブジェクト操作
==================================*/
/**
 * 基地航空隊 中隊オブジェクト生成
 * @param {JqueryDomObject} $lb_plane 生成元 lb_plane
 * @param {number} index 第何中隊
 * @returns 生成物
 */
function createLBPlaneObject($lb_plane) {
  const id = Number($lb_plane.data('id'));
  const type = Number($lb_plane.data('type'));
  // undefined来る可能性あり
  const plane = getPlanes(type).find(v => v.id == id);

  // スロット数不正チェック
  const slotVal = $lb_plane.find('.slot').val();
  let inputSlot = Number(slotVal);
  if (slotVal.length == 0) inputSlot = 0;
  else if (inputSlot > 18) {
    inputSlot = 18;
    $lb_plane.find('.slot').val(inputSlot);
  }
  else if (inputSlot < 0) {
    inputSlot = 0;
    $lb_plane.find('.slot').val(0);
  }


  const lbPlane = {
    id: 0, name: '', type: 0, AA: 0, AB: 0, IP: 0, LOS: 0, ap: 0, range: 999, cost: 0,
    slot: inputSlot,
    IMP: Number($lb_plane.find('.IMP_select').val()),
    level: Number($lb_plane.find('.prof_select').data('prof'))
  }

  if (plane) {
    lbPlane.id = plane.id;
    lbPlane.name = plane.name;
    lbPlane.type = plane.type;
    lbPlane.AA = plane.AA;
    lbPlane.AB = plane.AB;
    lbPlane.IP = plane.IP;
    lbPlane.LOS = plane.LOS;
    lbPlane.range = plane.range;
    lbPlane.cost = plane.cost;
    lbPlane.ap = getAirPower_lb(lbPlane);
  }

  return lbPlane;
}

/**
 * 艦娘 装備オブジェクト生成
 * @param {JqueryDomObject} $ship_plane 生成元 ship_plane
 * @param {number} shipNo 何隻目の艦か
 * @param {number} index 何番目のスロか
 * @returns 生成物
 */
function createFleetPlaneObject($ship_plane, shipNo, index) {
  const id = Number($ship_plane.data('id'));
  const type = Number($ship_plane.data('type') ? $ship_plane.data('type') : 0);
  // undefined来る可能性あり
  const plane = getPlanes(type).find(v => v.id == id);

  // スロット数不正チェック
  const raw = $ship_plane.find('.slot').val();
  let inputSlot = Number(raw);

  if (raw.length == 0) inputSlot = 0;
  else if (inputSlot > 9999) {
    inputSlot = 9999;
    // スロット数表示修正
    $ship_plane.find('.slot').val(inputSlot);
  }
  else if (inputSlot < 0) {
    inputSlot = 0;
    // スロット数表示修正
    $ship_plane.find('.slot').val(inputSlot);
  }

  const shipPlane = {
    fleetNo: shipNo,
    slotNo: index,
    id: 0, name: '-', type: 0, AA: 0, ap: 0,
    IMP: Number($ship_plane.find('.IMP_select').val()),
    level: Number($ship_plane.find('.prof_select').data('prof')),
    slot: inputSlot,
    origSlot: inputSlot,
    origAp: 0,
  }

  if (plane) {
    shipPlane.id = plane.id;
    shipPlane.name = !plane.abbr ? plane.name : plane.abbr;
    shipPlane.type = plane.type;
    shipPlane.AA = plane.AA;
    shipPlane.ap = updateAp(shipPlane);
    shipPlane.origAp = shipPlane.ap;
  }

  return shipPlane;
}

/**
 * 引数の id から敵オブジェクトを生成
 * @param {number} id 敵ID  -1 の場合は直接入力とする
 * @returns {Object} 敵オブジェクト
 */
function createEnemyObject(id) {
  const tmp = enemyData.find(v => v.id == id);
  const enemy = { id: id, type: 0, name: '', slots: [], aa: [], orgSlots: [], isSpR: false, ap: 0, lbAp: 0 };

  if (id != 0) {
    enemy.id = tmp.id;
    enemy.type = tmp.type;
    enemy.name = tmp.name;
    enemy.slots = tmp.slot.concat();
    enemy.aa = tmp.aa.concat();
    enemy.orgSlots = tmp.slot.concat();
    enemy.isSpR = tmp.isSpR;
    enemy.ap = 0;
    enemy.lbAp = 0;

    updateEnemyAp(enemy);
  }
  return enemy
}

/*==================================
    計算
==================================*/
/**
 * 制空値を比較し、制空状態の index を返却
 * @param {number} x ベース制空値
 * @param {number} y 比較対象制空値
 * @returns {number} 制空状態 index (0:確保 1:優勢...)
 */
function getAirStatusIndex(x, y) {
  const border = getBorder(y);
  for (let i = 0; i < border.length; i++) if (x >= border[i]) return x != 0 ? i : 4;
}

/**
 * 引数の制空値から、必要な制空状態のボーダーを返却
 * @param {number} enemyAp 基準制空値
 * @returns {Array.<number>} 制空状態ボーダーのリスト [確保ボーダー, 優勢ボーダー, ...]
 */
function getBorder(enemyAp) {
  if (enemyAp == 0) return [0, 0, 0, 0, 0];
  return [
    enemyAp * 3,
    Math.ceil(enemyAp * 1.5),
    Math.floor(enemyAp / 1.5) + 1,
    Math.floor(enemyAp / 3) + 1,
    0
  ];
}

/**
 * 計算
 */
function caluclate() {
  // 各種オブジェクト生成
  let landBaseData = [];
  let friendFleetData = [];
  let enemyFleetData = [];
  chartData = { own: [], enemy: [], rate: [] };

  console.time('caluclate');

  // 基地情報更新 3.305908203125ms
  console.time('updateLandBaseInfo');
  updateLandBaseInfo(landBaseData);
  //console.log(landBaseData);
  console.timeEnd('updateLandBaseInfo');

  // 艦隊情報更新 5.05590820312ms
  console.time('updateFriendFleetInfo');
  updateFriendFleetInfo(friendFleetData);
  console.log(friendFleetData);
  console.timeEnd('updateFriendFleetInfo');

  // 敵艦情報更新 0.612060546875ms
  console.time('updateEnemyFleetInfo');
  updateEnemyFleetInfo(enemyFleetData);
  //console.log(enemyFleetData);
  console.timeEnd('updateEnemyFleetInfo');

  // メイン計算
  startCaluclate(landBaseData, friendFleetData, enemyFleetData);

  //各状態確率計算 61.307861328125ms
  console.time('rateCaluclate');
  chartData.rate = rateCaluclate(1000, landBaseData, friendFleetData, enemyFleetData);
  console.timeEnd('rateCaluclate');

  // 結果表示 3.75830078125ms
  console.time('drawResultBar');
  drawResultBar();
  console.timeEnd('drawResultBar');

  // おおよそ 70.23974609375ms (rate 20000回試行)
  console.timeEnd('caluclate');
  console.log('');

  // 後始末
  landBaseData = null;
  friendFleetData = null;
  enemyFleetData = null;
  chartData = null;
}

/**
 * 基地航空隊入力情報更新
 * 値の表示と制空値、半径計算も行う
 * @param {Array.<Object>} landBaseData
 */
function updateLandBaseInfo(landBaseData) {
  const tmpLbPlanes = [];
  let sumFuel = 0;
  let sumAmmo = 0;
  let sumBauxite = 0;

  $('.lb_tab').each((index, element) => {
    const $lb_tab = $(element);
    tmpLbPlanes.length = 0;
    const lbNo = index + 1;
    let tmpLandBaseDatum = { baseNo: lbNo, planes: [], ap: 0, mode: -1 };

    // 出撃 or 防空
    tmpLandBaseDatum.mode = Number($lb_tab.find('.ohuda_select').val());

    // 基地航空隊 各種制空値表示
    $lb_tab.find('.lb_plane').each((i, e) => {
      const slotNo = i + 1;
      // 基地航空機オブジェクト生成
      const lbPlaneData = createLBPlaneObject($(e), i);
      // 格納
      tmpLandBaseDatum.planes.push(lbPlaneData);

      // 個別制空値表示
      const $target_td = $('#lb_info_row' + lbNo).find('.col' + slotNo);
      const prevAp = Number($target_td.text());
      drawChangeValue($target_td, prevAp, lbPlaneData.ap);

      // 航空隊制空値加算
      tmpLandBaseDatum.ap += lbPlaneData.ap;

      // 出撃コスト加算
      if (tmpLandBaseDatum.mode > 0) {
        sumFuel += lbPlaneData.id == 0 ? 0 : Math.ceil(lbPlaneData.slot * (lbPlaneData.type == 101 ? 1.5 : 1.0));
        sumAmmo += lbPlaneData.id == 0 ? 0 : lbPlaneData.type == 101 ? Math.floor(lbPlaneData.slot * 0.7) : Math.ceil(lbPlaneData.slot * 0.6);
      }
      sumBauxite += lbPlaneData.cost * (reconnaissances.indexOf(lbPlaneData.type) == -1 ? 18 : 4);
    });

    // 機体がないなら待機にする
    let isEmpty = true;
    for (const plane of tmpLandBaseDatum.planes) if (plane.id > 0) isEmpty = false;
    if (isEmpty) {
      tmpLandBaseDatum.mode = -1;
      $lb_tab.find('.ohuda_select').val(-1);
    }

    // 出撃、配備コスト
    const $resourceArea = $lb_tab.find('.resource');
    const $fuel = $resourceArea.find('.fuel');
    const $ammo = $resourceArea.find('.ammo');
    const $bauxite = $resourceArea.find('.bauxite');
    drawChangeValue($fuel, Number($fuel.text()), sumFuel, true);
    drawChangeValue($ammo, Number($ammo.text()), sumAmmo, true);
    drawChangeValue($bauxite, Number($bauxite.text()), sumBauxite, true);
    sumFuel = 0;
    sumAmmo = 0;
    sumBauxite = 0;

    // 偵察機による補正考慮
    getUpdateLBAirPower(tmpLandBaseDatum);

    // 総制空値
    let $target_td = $('#lb_info_row' + lbNo).find('.col5');
    drawChangeValue($target_td, Number($target_td.text()), tmpLandBaseDatum.ap);
    let $targetSpan = $lb_tab.find('.ap');
    drawChangeValue($targetSpan, Number($targetSpan.text()), tmpLandBaseDatum.ap);

    // 半径
    $target_td = $('#lb_info_row' + lbNo).find('.col6');
    const range = getRange(tmpLandBaseDatum);
    drawChangeValue($target_td, Number($target_td.text()), range);
    $targetSpan = $lb_tab.find('.range');
    drawChangeValue($targetSpan, Number($targetSpan.text()), range);

    // 待機部隊は黒塗り
    $target_td.parent().css({ 'background-color': tmpLandBaseDatum.mode != -1 ? '#fff' : '#bbb' });

    // 生成した第X航空隊データを格納
    landBaseData.push(tmpLandBaseDatum);
  });
}

/**
 * 制空値を返す -基地航空隊
 * @param {Object} lb_plane
 * @returns 引数の lb_plane オブジェクトの持つ制空値
 */
function getAirPower_lb(lb_plane) {
  if (lb_plane.id == 0) return 0;
  const type = lb_plane.type;
  const taiku = lb_plane.AA;
  const AB = lb_plane.AB;
  const IP = lb_plane.IP;
  const IMP = lb_plane.IMP;
  const level = lb_plane.level;
  const slot = lb_plane.slot;

  let sumPower = 0.0;

  // 艦戦 夜戦 水戦 陸戦 局戦
  if ([1, -1, 7, 102, 103].indexOf(type) != -1) {
    //防空時
    if (isDefenseMode) sumPower = (0.2 * IMP + taiku + IP + 2.0 * AB) * Math.sqrt(slot);
    //出撃時
    else sumPower = (0.2 * IMP + taiku + 1.5 * IP) * Math.sqrt(slot);

    switch (level) {
      case 2:
        sumPower += 2;
        break;
      case 3:
        sumPower += 5;
        break;
      case 4:
        sumPower += 9;
        break;
      case 5:
        sumPower += 14;
        break;
      case 6:
        sumPower += 14;
        break;
      case 7:
        sumPower += 22;
        break;
      default:
        break;
    }
  }
  // 水爆
  else if ([6].indexOf(type) != -1) {
    sumPower = 1.0 * taiku * Math.sqrt(slot);
    switch (level) {
      case 2:
        sumPower += 1;
        break;
      case 3:
        sumPower += 1;
        break;
      case 4:
        sumPower += 1;
        break;
      case 5:
        sumPower += 3;
        break;
      case 6:
        sumPower += 3;
        break;
      case 7:
        sumPower += 6;
        break;
      default:
        break;
    }
  }
  // 艦爆
  else if ([3].indexOf(type) != -1) {
    sumPower = 1.0 * (0.25 * IMP + taiku) * Math.sqrt(slot);
  }
  // そのた
  else sumPower = 1.0 * taiku * Math.sqrt(slot);

  // 内部熟練度ボーナス
  if (slot > 0) {
    switch (level) {
      case 1:
        sumPower += Math.sqrt(10 / 10);
        break;
      case 2:
        sumPower += Math.sqrt(25 / 10);
        break;
      case 3:
        sumPower += Math.sqrt(40 / 10);
        break;
      case 4:
        sumPower += Math.sqrt(55 / 10);
        break;
      case 5:
        sumPower += Math.sqrt(70 / 10);
        break;
      case 6:
        sumPower += Math.sqrt(85 / 10);
        break;
      case 7:
        sumPower += Math.sqrt((prof120.indexOf(Math.abs(type)) > -1 ? 120 : 100) / 10);
        break;
      default:
        break;
    }
  }

  sumPower = slot > 0 ? Math.floor(sumPower) : 0;
  return sumPower;
}


/**
 * 偵察機による制空値補正を行う
 * @param {Object} landBaseDatum 補正を行う landBaseDatum オブジェクト
 * @returns
 */
function getUpdateLBAirPower(landBaseDatum) {
  const baseAP = landBaseDatum.ap
  // 搭載機全ての補正パターンを比較し、最大を返す。Listにすべての補正パターンを保持
  const resultAirPowerList = [landBaseDatum.ap];
  let reslutAP = landBaseDatum.ap;

  for (const plane of landBaseDatum.planes) {
    // 出撃時補正
    if (!isDefenseMode && plane.type == 104) {
      // 陸上偵察機補正
      resultAirPowerList.push(baseAP * (plane.LOS == 9 ? 1.18 : plane.LOS == 8 ? 1.15 : 1.00));
    }
    // 防空時補正
    else if (isDefenseMode) {
      if (plane.type == 104) {
        // 陸上偵察機補正
        resultAirPowerList.push(baseAP * (plane.LOS == 9 ? 1.24 : 1.18));
      }
      else if (plane.type == 4) {
        // 艦上偵察機補正
        resultAirPowerList.push(baseAP * (plane.LOS > 8 ? 1.3 : 1.2));
      }
      else if ([5, 8].indexOf(plane.type) > -1) {
        // 水上偵察機補正
        resultAirPowerList.push(baseAP * (plane.LOS > 8 ? 1.16 : plane.LOS == 8 ? 1.13 : 1.1));
      }
    }
  }
  // 補正が最大だったものに更新
  for (const value of resultAirPowerList) {
    reslutAP = reslutAP < value ? value : reslutAP;
  }

  landBaseDatum.ap = Math.floor(reslutAP);
}

/**
 * 引数の航空隊の行動半径を返却
 * @param {Object} landBaseDatum 補正を行う landBaseDatum オブジェクト
 * @returns　行動半径(補正後)
 */
function getRange(landBaseDatum) {
  let minRange = 999;
  let maxLOS = 1;
  for (const plane of landBaseDatum.planes) minRange = plane.range < minRange ? plane.range : minRange;

  // 最も足の長い偵察機の半径を取得
  for (const plane of landBaseDatum.planes) {
    if ([4, 5, 8, 104].indexOf(plane.type) != -1) maxLOS = maxLOS < plane.range ? plane.range : maxLOS;
  }

  if (maxLOS < 999 && maxLOS > minRange) return Math.round(minRange + Math.min(Math.sqrt(maxLOS - minRange), 3));
  else return minRange == 999 ? 0 : minRange;
}

/**
 * 制空値を返す -艦娘
 * @param {Object} plane
 * @returns 引数の plane オブジェクトの持つ制空値
 */
function updateAp(plane) {
  if (plane.id == 0) return 0;
  const type = plane.type;
  const taiku = plane.AA;
  const IMP = plane.IMP;
  const level = plane.level;
  const slot = plane.slot;

  let sumPower = 0.0;

  // 艦戦 夜戦 水戦
  if ([1, -1, 7].indexOf(type) != -1) {
    sumPower = (0.2 * IMP + taiku) * Math.sqrt(slot);
    switch (level) {
      case 2:
        sumPower += 2;
        break;
      case 3:
        sumPower += 5;
        break;
      case 4:
        sumPower += 9;
        break;
      case 5:
        sumPower += 14;
        break;
      case 6:
        sumPower += 14;
        break;
      case 7:
        sumPower += 22;
        break;
      default:
        break;
    }
  }
  // 水爆
  else if ([6].indexOf(type) != -1) {
    sumPower = 1.0 * taiku * Math.sqrt(slot);
    switch (level) {
      case 2:
        sumPower += 1;
        break;
      case 3:
        sumPower += 1;
        break;
      case 4:
        sumPower += 1;
        break;
      case 5:
        sumPower += 3;
        break;
      case 6:
        sumPower += 3;
        break;
      case 7:
        sumPower += 6;
        break;
      default:
        break;
    }
  }
  // 艦爆
  else if ([3].indexOf(type) != -1) {
    sumPower = 1.0 * (0.25 * IMP + taiku) * Math.sqrt(slot);
  }
  // そのた
  else sumPower = 1.0 * taiku * Math.sqrt(slot);

  // 内部熟練度ボーナス
  if (slot > 0) {
    switch (level) {
      case 1:
        sumPower += Math.sqrt(10 / 10);
        break;
      case 2:
        sumPower += Math.sqrt(25 / 10);
        break;
      case 3:
        sumPower += Math.sqrt(40 / 10);
        break;
      case 4:
        sumPower += Math.sqrt(55 / 10);
        break;
      case 5:
        sumPower += Math.sqrt(70 / 10);
        break;
      case 6:
        sumPower += Math.sqrt(85 / 10);
        break;
      case 7:
        sumPower += Math.sqrt((prof120.indexOf(Math.abs(type)) > -1 ? 120 : 100) / 10);
        break;
      default:
        break;
    }
  }

  sumPower = slot > 0 ? Math.floor(sumPower) : 0;
  return sumPower;
}

/**
 * 艦娘入力情報更新
 * 値の表示と制空値計算も行う
 * @param {Array.<Object>} friendFleetData
 */
function updateFriendFleetInfo(friendFleetData) {
  const tmpFriendFleet = [];

  // テーブルいったん全て削除
  $('#shootDownTable tbody').html('');

  $('.ship_tab').each((index, element) => {
    const $this = $(element);
    const shipNo = index + 1;

    // 非表示なら飛ばす
    if ($this.attr('class').indexOf('d-none') > -1) return;

    tmpFriendFleet.length = 0;

    let slotNo = 0;
    $this.find('.ship_plane').each((i, e) => {
      const $ship_plane = $(e);
      // draggable部分は飛ばす
      if ($ship_plane.attr('class').indexOf('ui-draggable') > 0) return;

      // 機体オブジェクト生成
      const planeObj = createFleetPlaneObject($(e), shipNo, slotNo++);
      tmpFriendFleet.push(planeObj);
    });

    // 艦娘横の制空値表示など
    const txtAP = $this.find('.ap');
    const prevAp = Number(txtAP.text());
    let sumAp = 0;
    let exist = false;
    let planeCount = 0;
    // 総制空値と艦載機の有無チェック
    for (const v of tmpFriendFleet) {
      sumAp += v.ap;
      if (!exist && v.id > 0) exist = true;
      if (v.id > 0 && v.slot > 0) planeCount++;
    }
    drawChangeValue(txtAP, prevAp, sumAp);

    if (planeCount > 0) {
      // 撃墜テーブル生成
      let i = 0;
      let text = '';
      let shipId = Number($this.data('id')) ? Number($this.data('id')) : 0;
      const ship = shipId ? shipData.find(v => v.id == shipId) : null;
      if (ship) planeCount = ship.slot.length;
      let shipName_td = `
      <td rowspan="`+ planeCount + `" class="td_name align-middle border border-bottom border-secondary">
          <div class="td_name_content text-wrap">`+ (ship ? ship.name : '未指定') + `</div>
      </td>
      `;
      for (i = 0; i < tmpFriendFleet.length; i++) {
        const plane = tmpFriendFleet[i];
        // 艦娘未指定の場合 搭載数 0 または艦載機未装備 のスロットは表示しない
        if (!ship && (plane.id == 0 || plane.slot == 0)) continue;
        // 艦娘の場合 スロット以上は作らない
        if (ship && i == ship.slot.length) break;

        let battle_td = '';
        for (let index = 1; index <= 10; index++) battle_td += '<td class="td_battle battle' + index + ' align-middle">' + (plane.id > 0 ? plane.slot : '') + '</td>';

        text += `
        <tr class="slot` + i + ` shipNo` + shipNo + `" data-rowindex="` + shipNo + `">
        `+ shipName_td + `
          <td class="td_plane_name align-middle">`+ plane.name + `</td>
          `+ battle_td + `
        </tr>
        `;

        shipName_td = '';
      }
      $('#shootDownTable_tbody').append(text);
    }
    // 代入
    if (exist) friendFleetData.push(tmpFriendFleet.concat());
  });

  for (let i = 1; i <= 12; i++) {
    $('#shootDownTable_tbody').find('.shipNo' + i + ':last').find('td').css('border-bottom-color', '#6c757d');
  }
}

/**
 * 指定した艦隊の総制空値を返す
 * @param {Array.<Object>} friendFleetData
 * @returns 総制空値
 */
function getFriendFleetAirPower(friendFleetData) {
  let sumAP = 0;
  for (const ships of friendFleetData) for (const ship of ships) sumAP += ship.ap;
  return sumAP;
}

/**
 * 敵艦隊入力情報更新
 * @param {Array.<Object>} enemyFleetData
 */
function updateEnemyFleetInfo(enemyFleetData) {
  let tmpEnemyFleet = [];
  let sumAp = 0;

  $('.battle_content').each(function () {

    // 非表示なら飛ばす
    if ($(this).attr('class').indexOf('d-none') > -1) return;

    tmpEnemyFleet = [];
    sumAp = 0;

    // 敵情報取得
    $(this).find('.enemy_content').each(function () {
      const enemyId = $(this).data('id');
      if (isNaN(enemyId)) return true;
      const tmpEnemy = createEnemyObject(enemyId);

      // 直接入力の制空値を代入
      if (enemyId == -1) {
        const directAP = $(this).find('.enemy_ap_form').val();
        // 直接制空値不正チェック
        let inputAp = Number(directAP);
        if (directAP.length == 0) inputAp = 0;
        else {
          inputAp = inputAp > 9999 ? 9999 : inputAp < 0 ? 0 : inputAp;
          // スロット数表示修正
          $(this).find('.enemy_ap_form').val(inputAp);
        }

        tmpEnemy.ap = inputAp;
        tmpEnemy.lbAp = inputAp;
      }

      tmpEnemyFleet.push(tmpEnemy);
      sumAp += tmpEnemy.ap;
    });

    // 制空値表示
    $enmAp = $(this).find('.enemySumAP');
    drawChangeValue($enmAp, $enmAp.text(), sumAp, true);

    enemyFleetData.push(tmpEnemyFleet);
  });
}

/**
 * 指定した敵艦隊オブジェクトの総制空値を返す(基地)
 * @param {Array.<Object>} enemyFleet
 * @returns 総制空値(基地)
 */
function getEnemyFleetLandBaseAirPower(enemyFleet) {
  let sumAP = 0;
  for (const enemy of enemyFleet) sumAP += enemy.lbAp;
  return sumAP;
}

/**
 * 指定した敵艦隊オブジェクトの総制空値を返す(通常)
 * @param {Array.<Object>} enemyFleet
 * @returns 総制空値
 */
function getEnemyFleetAirPower(enemyFleet) {
  let sumAP = 0;
  for (const enemy of enemyFleet) sumAP += enemy.ap;
  return sumAP;
}

/**
 * 敵機撃墜処理(チャート表示用 5割固定)
 * @param {Array.<Object>} enemyFleet
 * @param {number} ap
 */
function ShootDownforChart(enemyFleet, ap) {
  const elbap = getEnemyFleetLandBaseAirPower(enemyFleet);

  chartData.own.push(ap);
  if (enemyFleet.length == 0) {
    chartData.enemy.push(0);
    return;
  }
  chartData.enemy.push(elbap);

  const airCond = getAirStatusIndex(ap, elbap);
  for (const enemy of enemyFleet) {
    enemy.slots.forEach((slot, i) => {
      enemy.slots[i] -= getShootDownSlotHalf(airCond, slot);
    })
    updateEnemyAp(enemy);
  }
}

/**
 * 敵機撃墜処理 (繰り返し用)
 * @param {Array.<Object>} enemyFleet
 * @param {number} ap
 */
function ShootDown(enemyFleet, ap) {
  const elbap = getEnemyFleetLandBaseAirPower(enemyFleet);
  const airCond = getAirStatusIndex(ap, elbap);
  const max_i = enemyFleet.length;
  for (let i = 0; i < max_i; i++) {
    const enemy = enemyFleet[i];
    const max_j = enemy.slots.length;
    for (let j = 0; j < max_j; j++) {
      let slot = enemy.slots[j];
      enemy.slots[j] -= getShootDownSlot(airCond, slot);
    }
    updateEnemyAp(enemy);
  }
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜数はランダム
 * @param {Number} airStateIndex 制空状態インデックス
 * @param {Number} slot 撃墜前搭載数
 * @returns {Number} 撃墜後搭載数
 */
function getShootDownSlot(airStateIndex, slot) {
  const downRate = airStatus[airStateIndex].rate + 1;
  return Math.floor(slot * (0.65 * Math.floor(Math.random() * downRate) + 0.35 * Math.floor(Math.random() * downRate)) / 10);
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜率は中央値固定
 * @param {Number} airStateIndex 制空状態インデックス
 * @param {Number} slot 撃墜前搭載数
 * @returns {Number} 撃墜後搭載数
 */
function getShootDownSlotHalf(airStateIndex, slot) {
  const downRate = airStatus[airStateIndex].rate;
  return Math.floor(slot * (0.65 * downRate / 2.0 + 0.35 * downRate / 2.0) / 10);
}

/**
 * 指定された敵オブジェクトが持つ制空値を再計算する
 * @param {Object} enemy 再計算する敵オブジェクト
 */
function updateEnemyAp(enemy) {
  if (enemy.id == -1) return;
  enemy.ap = 0;
  enemy.lbAp = 0;
  enemy.aa.forEach((aa, i) => {
    if (!enemy.isSpR) enemy.ap += Math.floor(aa * Math.sqrt(enemy.slots[i]));
    else enemy.lbAp += Math.floor(aa * Math.sqrt(enemy.slots[i]));
  });
  enemy.lbAp += enemy.ap;
}

/**
 * 道中被撃墜(中央値,チャート用)
 * @param {Array.<Object>} friendFleetData 味方艦隊
 * @param {number} eap 敵制空値
 * @param {number} index 何戦目か
 */
function ShootDownHalfFF(friendFleetData, eap, index) {
  let ap = getFriendFleetAirPower(friendFleetData);
  const airCond = getAirStatusIndex(ap, eap);
  $('#shootDownTable').find('.fap.battle' + (index + 1)).text(ap);
  $('#shootDownTable').find('.eap.battle' + (index + 1)).text(eap);
  $('#shootDownTable').find('.cond.battle' + (index + 1)).text(airStatus[airCond].abbr);
  for (const ship of friendFleetData) {
    for (const plane of ship) {
      // 直前の搭載数をテーブルに反映
      $('#shootDownTable_tbody').find('.shipNo' + plane.fleetNo + '.slot' + plane.slotNo + ' .battle' + (index + 1)).text(plane.id > 0 ? plane.slot : '');
      if (plane.slot == 0) continue;
      let slot = plane.slot;
      plane.slot -= getShootDownSlotHalfFF(airCond, slot);
      plane.ap = updateAp(plane);
    }
  }
}

/**
 * 道中被撃墜
 * @param {Array.<Object>} friendFleetData 味方艦隊
 * @param {number} eap 敵制空値
 */
function ShootDownFF(friendFleetData, eap) {
  let ap = getFriendFleetAirPower(friendFleetData);
  const airCond = getAirStatusIndex(ap, eap);
  for (const ship of friendFleetData) {
    for (const plane of ship) {
      if (plane.slot == 0) continue;
      let slot = plane.slot;
      plane.slot -= getShootDownSlotFF(airCond, slot);
      plane.ap = updateAp(plane);
    }
  }
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜数はランダム
 * @param {Number} airStateIndex 制空状態インデックス
 * @param {Number} slot 撃墜前搭載数
 * @returns {Number} 撃墜後搭載数
 */
function getShootDownSlotFF(airStateIndex, slot) {
  const downRate = 11 - airStatus[airStateIndex].rate;
  return Math.floor(slot * (downRate / 4 + Math.floor(Math.random() * (downRate * 100 / 3 + 1)) / 100) / 10);
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜率は中央値固定
 * @param {Number} airStateIndex 制空状態インデックス
 * @param {Number} slot 撃墜前搭載数
 * @returns {Number} 撃墜後搭載数
 */
function getShootDownSlotHalfFF(airStateIndex, slot) {
  const downRate = 11 - airStatus[airStateIndex].rate;
  return Math.floor(slot * (downRate / 4 + Math.floor(downRate * 100 / 3) / 200) / 10);
}

/**
 * メイン計算処理
 */
function startCaluclate(landBaseData, friendFleetData, enemyFleetData) {
  // 計算する戦闘
  let mainBattle = (Number($('#displayBattle').val()) - 1);
  mainBattle = mainBattle < enemyFleetData.length ? mainBattle : enemyFleetData.length - 1;
  let eap = 0;
  const enemyFleet = enemyFleetData[mainBattle].concat();

  if (isDefenseMode) {
    let sumAP = 0;
    for (let index = 0; index < 3; index++) if (landBaseData[index].mode != -1) sumAP += landBaseData[index].ap;
    chartData.own.push(sumAP);
    chartData.enemy.push(getEnemyFleetAirPower(enemyFleet));
  }
  else {
    for (let index = 0; index < 3; index++) {
      let lbAp = landBaseData[index].ap;
      if (landBaseData[index].mode > 0) {
        // 第一波
        ShootDownforChart(enemyFleet, lbAp);
      }
      else {
        // 空データ挿入
        chartData.own.push(0);
        chartData.enemy.push(0);
      }

      if (landBaseData[index].mode == 2) {
        // 第二波
        ShootDownforChart(enemyFleet, lbAp);
      }
      else {
        // 空データ挿入
        chartData.own.push(0);
        chartData.enemy.push(0);
      }
    }

    chartData.own.push(0);
    chartData.enemy.push(0);

    // 撃墜テーブルの関係ない戦闘を非表示に
    $('#shootDownTable').find('td').removeClass('d-none');
    for (let index = battleCount + 1; index <= 10; index++) {
      $('#shootDownTable').find('.battle' + index).addClass('d-none');
    }

    // 道中戦闘(中央値) 結果表示戦闘の直前までの戦闘を行う
    for (let battle = 0; battle < mainBattle; battle++) {
      const enemyAp = getEnemyFleetAirPower(enemyFleetData[battle]);
      ShootDownHalfFF(friendFleetData, enemyAp, battle)
    }

    eap = getEnemyFleetAirPower(enemyFleet);
    fap = getFriendFleetAirPower(friendFleetData);
    chartData.own.push(fap);
    chartData.enemy.push(eap);

    // 結果表示戦闘含、以降の残戦闘を行う(撃墜テーブル表示用)
    for (let index = mainBattle; index < battleCount; index++) {
      const enemyAp = getEnemyFleetAirPower(enemyFleetData[index]);
      ShootDownHalfFF(friendFleetData, enemyAp, index)
    }
  }
}

/**
 * 各種制空状態確率計算
 * @param {number} maxCount 試行回数
 * @returns {Array.<Object>} 各種制空状態確率
 */
function rateCaluclate(maxCount, landBaseData, friendFleetData, enemyFleetData) {
  // 計算する戦闘
  let mainBattle = (Number($('#displayBattle').val()) - 1);
  mainBattle = mainBattle < enemyFleetData.length ? mainBattle : enemyFleetData.length - 1;
  const shipCache = friendFleetData.concat();
  const dist = [];
  for (let i = 0; i < 8; i++) dist.push([0, 0, 0, 0, 0]);
  const enemyCache = enemyFleetData[mainBattle].concat();
  const lbAps = [];
  const lbModes = [];
  for (const landBase of landBaseData) {
    lbAps.push(landBase.ap);
    lbModes.push(landBase.mode);
  }

  for (let count = 0; count < maxCount; count++) {
    // 自軍補給
    for (const ship of shipCache) {
      for (const plane of ship) {
        plane.slot = plane.origSlot;
        plane.ap = plane.origAp;
      }
    }

    // 敵機補給
    for (const enemy of enemyCache) {
      enemy.slots = enemy.orgSlots.concat();
      updateEnemyAp(enemy);
    }

    for (let j = 0; j < 3; j++) {
      let lbAp = lbAps[j];
      if (lbModes[j] > 0) {
        // 第一波
        dist[j * 2][getAirStatusIndex(lbAp, getEnemyFleetLandBaseAirPower(enemyCache))]++;
        ShootDown(enemyCache, lbAp);
      }

      if (lbModes[j] == 2) {
        // 第二波
        dist[j * 2 + 1][getAirStatusIndex(lbAp, getEnemyFleetLandBaseAirPower(enemyCache))]++;
        ShootDown(enemyCache, lbAp);
      }
    }

    // 道中戦闘
    for (let index = 0; index < mainBattle; index++) {
      const enemyAp = getEnemyFleetAirPower(enemyFleetData[index]);
      ShootDownFF(shipCache, enemyAp)
    }

    // 本隊
    dist[7][getAirStatusIndex(getFriendFleetAirPower(shipCache), getEnemyFleetAirPower(enemyCache))]++;
  }

  for (const wave of dist) {
    for (let index = 0; index < wave.length; index++) {
      wave[index] = Math.floor(wave[index] / maxCount * 10000) / 100;
    }
  }
  return dist;
}

/*==================================
    メイン
==================================*/
$(function () {
  // 画面初期化
  initAll(() => {
    // 終わったらLoading画面お片付け
    $('#loadingSpinner').fadeOut(200);
    $('#main').delay(180).fadeIn(200, () => {
      // グラフエリア初期化
      caluclate();
    });
    $('footer').delay(180).fadeIn(200);
  });

  // イベント貼り付けなど
  $(window).keyup(function (e) {
    if (e.keyCode == 17) $('#copyPlane').prop('checked', !$('#copyPlane').prop('checked'));
  });

  // 基地札変更時
  $(document).on('change', '.ohuda_select', function () {
    if ($(this).val() == 0) {
      // 防空モード開始
      isDefenseMode = true;
      // 出撃中の部隊は防空に
      $('.ohuda_select').each(function () { if (Number($(this).val()) > 0) $(this).val(0); })
    }
    else if ($(this).val() > 0) {
      // 防空モード終了
      isDefenseMode = false;
      // 防空中の部隊は集中に
      $('.ohuda_select').each(function () { if (Number($(this).val()) == 0) $(this).val(2); })
    }

    caluclate()
  });

  // 基地航空隊リセットボタン
  $(document).on('click', '.btnResetLB', function () {
    $(this).closest('.lb_tab').find('.lb_plane').each((i, e) => { clearPlaneDiv($(e)); });
    $(this).blur();
    caluclate();
  });
  $(document).on('focus', '.slot', function () {
    // 全選択してあげる
    $(this).select();
  })
  $(document).on('input', '.slot', function () {
    // 入力検証 -> 数値 かつ 0 以上　違ってたら勝手に0にして続行　空白は据え置く(0扱い)
    const value = $(this).val();
    var regex = new RegExp(/^[0-9]+$/);
    if (value.length > 0 && !regex.test(value)) $(this).val(0);
    caluclate();
  });
  $(document).on('click', '.IMP_select', caluclate);

  // 艦娘装備リセットボタン
  $(document).on('click', '.btnResetShip', function () {
    $(this).closest('.ship_tab').find('.ship_plane').each((i, e) => { clearPlaneDiv($(e)); });
    $(this).blur();
    caluclate();
  });

  $(document).on('focus', '.enemy_ap_form', function () {
    // 全選択してあげる
    $(this).select();
  })
  $(document).on('input', '.enemy_ap_form', function () {
    // 入力検証 -> 数値 かつ 0 以上 9999 以下　違ってたら勝手に0にして続行　空白は据え置く(0扱い)
    const value = $(this).val();
    var regex = new RegExp(/^[0-9]+$/);
    if (value.length > 0 && !regex.test(value)) $(this).val(0);
    caluclate();
  });

  // 目次クリックで移動
  $(document).on('click', '.sidebar-sticky a[href^="#"]', function () {
    const speed = 300;
    const href = $(this).attr("href");
    const target = $(href == "#" || href == "" ? 'html' : href);
    const position = target.offset().top - 60;
    $('body,html').animate({ scrollTop: position }, speed, 'swing');
    return false;
  });

  // ページトップへボタン
  $('.btn-goPageTop').on('click', function () {
    $(this).blur();
    $('body,html').animate({ scrollTop: 0 }, 300, 'swing');
  });

  // 折り畳み格納時
  $(document).on('hide.bs.collapse', '.collapse', function () {
    $(this).prev().find('.oi-chevron-bottom')
      .removeClass('oi-chevron-bottom')
      .addClass('oi-chevron-top');
  });

  // 折り畳み展開時
  $(document).on('show.bs.collapse', '.collapse', function () {
    $(this).prev().find('.oi-chevron-top')
      .removeClass('oi-chevron-top')
      .addClass('oi-chevron-bottom');
  });

  // コンテンツ入れ替え設定
  Sortable.create($('#main_contents')[0], {
    handle: '.content_title',
    delay: 100,
    animation: 150,
    scroll: true,
    onStart: function () {
      $('body,html').animate({ scrollTop: 0 }, 200, 'swing');
      // 開始時にいったん全部最小化
      $('.collapse_content').each(function () {
        if ($(this).attr('class').indexOf('show') != -1) {
          $(this).addClass('tmpHide').collapse('hide');
        }
      });
    },
    onEnd: function () {
      const org = [];
      const $parent = $('#li_index');
      $parent.find('li').each((i, e) => { org.push($(e).clone()) });
      $parent.empty();
      $('#main_contents > div').each((i, e) => {
        for (const $target of org) {
          if ($target.attr('id') == 'li_' + $(e).attr('id')) {
            $parent.append($target);
            continue;
          }
        }
      });

      // 一時閉じていたやつは終了時に展開
      $('.tmpHide').collapse('show');
    }
  });

  // ホバーされたものだけdraggeble設定追加 敵艦
  $(document).on({
    'mouseenter': function () {
      if ($(this).attr('class').indexOf('ui-draggable-handle') == -1) {
        $(this).draggable({
          scroll: false,
          helper: 'clone',
          distance: 10,
          start: (e, ui) => {
            $helper = $(ui.helper);
            $helper
              .addClass('enemy_helper py-1 px-3')
              .removeClass('border-bottom')
              .width($('.enemy').width() - 40)
              .html($helper.find('td:eq(0)').html());
          }
        });
      }
    }
  }, '#enemySelect_content .enemy');

  // 基地機体入れ替え設定
  $('.lb_plane').draggable({
    delay: 100,
    helper: 'clone',
    handle: '.plane_img:not([alt=""])',
    zIndex: 1000,
    start: function (e, ui) {
      $(ui.helper).css('width', 310);
    },
    stop: function () {
      const $plane = $(this).closest('.lb_plane');
      if (isOut) {
        // 選択状況をリセット
        clearPlaneDiv($plane);
        $plane.css('opacity', '0.0');
        isOut = false;
      }
      $plane.animate({ 'opacity': '1.0' }, 500);

      caluclate();
    }
  });
  // 機体をドラッグしてきた時の処理
  $('.lb_plane').droppable({
    accept: ".lb_plane",
    hoverClass: "lb_plane-hover",
    tolerance: "pointer",
    drop: function (event, ui) {
      const $this = $(this);
      const $original = ui.draggable;
      const $insertdiv =
        $('<div>')
          .data('id', $original.data('id'))
          .data('type', $original.data('type'))
          .data('IMP', $original.find('.IMP_select').val())
          .data('prof', $original.find('.prof_select').data('prof'))
          .data('slot', $original.find('.slot').val());
      const $destination =
        $('<div>')
          .data('id', $this.data('id'))
          .data('type', $this.data('type'))
          .data('IMP', $this.find('.IMP_select').val())
          .data('prof', $this.find('.prof_select').data('prof'))
          .data('slot', $this.find('.slot').val());

      setLBPlaneDiv($(this), $insertdiv);
      if (!$('#copyPlane').prop('checked')) setLBPlaneDiv($original, $destination);
    }
  });

  // 範囲外に機体を持って行ったときを拾う
  $('#lb_content_main').droppable({
    accept: ".lb_plane",
    tolerance: "pointer",
    over: (event, ui) => {
      ui.helper.animate({ 'opacity': '1.0' }, 100);
      isOut = false;
    },
    out: (event, ui) => {
      ui.helper.animate({ 'opacity': '0.2' }, 100);
      isOut = true;
    }
  });

  // 艦娘 機体入れ替え設定
  $('.ship_plane_draggable').draggable({
    delay: 100,
    helper: 'clone',
    handle: 'img:first',
    zIndex: 1000,
    start: function (e, ui) {
      $(ui.helper)
        .addClass('ship_plane ' + getPlaneCss(Number($(ui.helper).find('.plane_img').attr('alt'))))
        .css('width', 310);
    },
    stop: function () {
      const $plane = $(this).closest('.ship_plane');
      if (isOut) {
        // 選択状況をリセット
        clearPlaneDiv($plane);
        $plane.css('opacity', '0.0');
        isOut = false;
      }
      $plane.animate({ 'opacity': '1.0' }, 500);

      caluclate();
    }
  });

  // 艦娘 機体受け入れ設定
  $('.ship_tab_main .ship_plane').droppable({
    accept: ".ship_plane_draggable",
    hoverClass: "ship_plane-hover",
    tolerance: "pointer",
    over: function (e, ui) {
      const $original = ui.draggable.closest('.ship_plane');
      const shipID = Number($(this).closest('.ship_tab').data('id'));
      const planeID = Number($original.data('id'));
      const type = Number($original.data('type'));
      // 挿入先が装備不可だった場合暗くする
      if (shipID && planeID && type && !checkInvalidEquipment(shipID, getPlanes(type).find(v => v.id == planeID))) {
        ui.helper.stop().animate({ 'opacity': '0.2' }, 100);
        $(this).removeClass('ship_plane-hover');
        isOut = true;
      }
      else {
        ui.helper.stop().animate({ 'opacity': '1.0' }, 100);
        isOut = false;
      }
    },
    drop: function (event, ui) {
      // 機体入れ替え
      if (ui.draggable.closest('.ship_plane').data('id')) {
        const $this = $(this);
        const $original = ui.draggable.closest('.ship_plane');
        const $insertdiv =
          $('<div>')
            .data('id', $original.data('id'))
            .data('type', $original.data('type'))
            .data('IMP', $original.find('.IMP_select').val())
            .data('prof', $original.find('.prof_select').data('prof'));
        const $destination =
          $('<div>')
            .data('id', $this.data('id'))
            .data('type', $this.data('type'))
            .data('IMP', $this.find('.IMP_select').val())
            .data('prof', $this.find('.prof_select').data('prof'));

        // 挿入先が装備不可だった場合中止
        let shipID = Number($this.closest('.ship_tab').data('id'));
        let planeID = Number($insertdiv.data('id'));
        let type = Number($insertdiv.data('type'));
        if (shipID && planeID && type && !checkInvalidEquipment(shipID, getPlanes(type).find(v => v.id == planeID))) return;
        // 挿入OK
        setPlaneDiv($this, $insertdiv);
        if (!$('#copyPlane').prop('checked')) setPlaneDiv($original, $destination);
      }
    }
  });
  // 範囲外に機体を持って行ったときを拾う
  $('.ship_tab > div').droppable({
    accept: ".ship_plane_draggable",
    tolerance: "pointer",
    over: function (event, ui) {
      ui.helper.stop().animate({ 'opacity': '1.0' }, 100);
      isOut = false;
    },
    out: function (event, ui) {
      ui.helper.stop().animate({ 'opacity': '0.2' }, 100);
      isOut = true;
    }
  });

  // 敵艦　戦闘順番 入れ替え設定
  Sortable.create($('.battle_container')[0], {
    handle: '.sortable_handle',
    animation: 150,
    onEnd: function () {
      // 何戦目か整合性取る
      $('.battle_content').each((i, e) => { $(e).find('.battleNo').text(i + 1); });
      caluclate();
    }
  });

  // 敵艦をドラッグしてきた時の処理
  $('.battle_content').droppable({
    accept: ".enemy",
    tolerance: "pointer",
    hoverClass: 'enemyFleet_item-hover',
    drop: function (event, ui) {
      setEnemyDiv($(this).find('.enemy_content:last'), ui.draggable.data('id'));
      caluclate();
    }
  });

  // 熟練度を選択時
  $(document).on('click', '.prof_item', function () {
    const $orig = $(this).find('.prof_option');
    $(this).parent().prev().attr('src', $orig.attr('src')).attr('alt', $orig.attr('alt')).data('prof', $orig.data('prof'));
    caluclate();
  });

  // 機体カテゴリ変更時 応じた機体を table に展開
  $(document).on('change', '#planeSelect_select', function () {
    // 選択時のカテゴリ
    let selectedType = Number($(this).val());
    // ベース機体一覧
    let org = getPlanes(selectedType);

    // 現状のカテゴリ
    let dispType = [];
    $(this).find('option').each(function () { dispType.push(Number($(this).val())); })

    // 特定の艦娘が選ばれている場合の調整
    if ($target && $target.attr('class').indexOf('ship_plane') != -1 && $target.closest('.ship_tab').data('id')) {
      const ship = shipData.find(v => v.id == $target.closest('.ship_tab').data('id'));
      const basicCanEquip = typelink_Ship_Equip.find(v => v.type == ship.type);
      const special = specialLink_ship_equipment.find(v => v.shipId == ship.id);
      dispType = basicCanEquip.e_type.concat();

      // 試製景雲削除
      org = org.filter(v => v.id != 151);

      // 特別装備可能な装備カテゴリ対応
      if (special && special.equipmentTypes.length > 0) dispType = dispType.concat(special.equipmentTypes);

      // 特別装備可能な装備対応
      if (special && special.equipmentIds.length > 0) {
        let addPlane = {};
        for (const id of special.equipmentIds) {
          addPlane = planeData.find(v => v.id == id);
          dispType.push(addPlane.type);

          // もしまだ追加されてないなら追加
          if (!org.find(v => v.id == id)) org.push(addPlane);
        }
      }

      // 重複を切る
      dispType = dispType.filter((x, i, self) => self.indexOf(x) === i);
      dispType.sort((a, b) => a - b);

      // 装備可能カテゴリ表示変更
      setPlaneType($(this), dispType)
      $(this).val(selectedType);
    }

    // カテゴリ一覧にないもの除外
    org = org.filter(v => dispType.indexOf(Math.abs(v.type)) > -1);

    // ソート反映
    const $target_table_div = $(this).parent().nextAll('.plane_table_content');
    const sorted = $target_table_div.find('.sorted');
    if (sorted.attr('class')) {
      const isAsc = sorted.attr('class').indexOf('asc') != -1;
      switch (sorted.attr('id')) {
        case 'th_name':
          if (isAsc) org.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
          else org.sort((a, b) => -(a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
          break;
        case 'th_aa':
          if (isAsc) org.sort((a, b) => a.AA - b.AA);
          else org.sort((a, b) => b.AA - a.AA);
          break;
        case 'th_range':
          if (isAsc) org.sort((a, b) => a.range - b.range);
          else org.sort((a, b) => b.range - a.range);
          break;
        default:
          org.sort((a, b) => a.type - b.type);
          break;
      }
    }
    createPlaneTable($target_table_div.find('.plane_table'), org);
  });

  // 機体テーブル ヘッダクリック列でソート
  $(document).on('click', '.plane_thead div', function () {
    const $parent = $(this).closest('.plane_table');
    const sortKey = $(this).attr('id');
    const order = $(this).data('order');
    const nextOrder = order == 'asc' ? 'desc' : 'asc';

    // 順序反転
    $('.plane_thead div').removeClass('sorted')
    $(this).parent().find('div').removeData().removeClass('asc desc');

    if (sortKey != 'th_default') {
      $(this).data('order', nextOrder);
      $(this).addClass('sorted ' + nextOrder);
    }

    // 再度カテゴリ検索をかけて反映する
    $('#planeSelect_select').change();
  });

  // 機体選択ボタンクリック -> モーダル展開
  $(document).on('click', '.plane_name', function () {
    // 機体選択画面の結果を返却するターゲットのdiv要素を取得
    $target = $(this).closest('.lb_plane');
    if (!$target.attr('class')) $target = $(this).closest('.ship_plane');

    const selectedID = Number($target.data('id'));
    let selectedType = $target.data('type');
    selectedType = (!selectedType ? 0 : Math.abs(Number(selectedType)));
    const $modalBody = $('#planeSelectModal').find('.modal-body');

    let prevTypeId = $('#planeSelect_select').val();

    // 艦娘から展開した場合、陸上機は出さない
    if ($target.attr('class').indexOf('ship_plane') != -1) {
      selectedType = selectedType > 99 ? 0 : selectedType;
      $modalBody.find('#optg_lb').remove();
      if (prevTypeId > 100) prevTypeId = 0;
    }
    else {
      // 機体カテゴリ初期化
      setPlaneType($('#planeSelect_select'), planeType.filter(v => v.id > 0).map(v => v.id));
    }

    $('#planeSelect_select').val(prevTypeId).change();

    if (selectedID) {
      // 選択機体あれば
      $modalBody.find('#' + selectedID).addClass('plane-selected');
      $('#planeSelectModal_btnRemove').prop('disabled', false);
    }
    else {
      $('#planeSelectModal_btnRemove').prop('disabled', true);
    }

    // 調整終了、モーダル展開
    $('#planeSelectModal').modal('show');
  });

  // 機体選択画面(モーダル)　機体をクリック時
  $('#planeSelectModal').on('click', '.plane', function () {
    if ($target.attr('class').indexOf('lb_plane') != -1) {
      // 基地航空隊に機体セット
      setLBPlaneDiv($target, $(this));
      // お札が待機になってるなら集中または防空に変更
      $target.closest('.lb_tab').find('.ohuda_select').val(isDefenseMode ? 0 : 2);
    }
    // 艦娘に機体セット
    else if ($target.attr('class').indexOf('ship_plane') != -1) setPlaneDiv($target, $(this));

    $('#planeSelectModal').modal('hide');
  });

  // はずすボタンクリック(機体選択モーダル内)
  $('#planeSelectModal_btnRemove').on('click', function () {
    if ($(this).prop('disabled')) return false;

    // 選択状況をリセット
    clearPlaneDiv($target);

    $('#planeSelectModal').modal('hide');
  });

  // 表示隻数更新
  $('.dispShipCount').change(function () {
    const displayCount = $(this).val();
    $(this).closest('.friendFleet_tab').find('.ship_tab').each(function (i) {
      if (i < displayCount) $(this).removeClass('d-none');
      else $(this).addClass('d-none');
    });

    caluclate();
  })

  // 艦娘名横のはずすをクリック
  $(document).on('click', '.btnRemoveShip', function () {
    clearShipDiv($(this).closest('.ship_tab'));
    $(this).prop('disabled', true);
    caluclate();
  });

  // 艦娘最小化クリック
  $(document).on('click', '.minToggleBtn', function () {
    // todo 最小化時のツールチップ生成
  });

  // 艦娘名をクリック -> 艦娘選択モーダル展開
  $(document).on('click', '.ship_name_span', function () {
    $target = $(this).closest('.ship_tab');
    const selectedID = $target.data('id');
    const $modalBody = $('#shipSelectModal').find('.modal-body');

    // 選択艦娘ピックアップ
    if (selectedID) {
      $modalBody.find('#' + selectedID).addClass('ship-selected');
      $('#shipSelectModal_btnRemove').prop('disabled', false);
    }
    else $('#shipSelectModal_btnRemove').prop('disabled', true);

    $('#shipSelectModal').modal('show');
  });

  // 艦種変更時 応じた艦娘を table に展開
  $('#shipSelectModal').on('change', '.shipType_select', function () {
    createShipTable($('.ship_table'), [Number($(this).val())]);
  });

  // 艦娘選択画面(モーダル)　艦娘をクリック時
  $('#shipSelectModal').on('click', '.ship', function () {
    // 艦娘セット
    setShipDiv($target, Number($(this).attr('id')));

    // 機体選択欄展開
    $target.find('.btn-toggleContent_hide').removeClass('btn-toggleContent_hide').addClass('btn-toggleContent_show')
    $target.find('.ship_tab_main').collapse('show');

    $('#shipSelectModal').modal('hide');
  });

  // 最終改造状態の未表示クリック
  $('#dispFinalOnly').click(() => { createShipTable($('.ship_table'), [Number($('.shipType_select').val())]); })

  // はずすボタンクリック(機体選択モーダル内)
  $('#shipSelectModal_btnRemove').on('click', function () {
    if ($(this).prop('disabled')) return false;

    // 選択状況をリセット
    clearShipDiv($target);

    $('#shipSelectModal').modal('hide');
  });

  // 戦闘回数変更
  $('#battleCount').change(function () {
    battleCount = Number($(this).val());
    $('.battle_content').each(function (i) {
      if (i < battleCount) $(this).removeClass('d-none');
      else $(this).addClass('d-none');
    });

    // 結果表示セレクト調整
    $('#displayBattle').find('option').each((i, e) => {
      if (i < battleCount) $(e).prop('disabled', false).removeClass('d-none');
      else $(e).prop('disabled', true).addClass('d-none');
    });

    $('#displayBattle').val(battleCount);

    caluclate();
  });

  // X戦目の横リセットをクリック
  $(document).on('click', '.btnResetBattle', function () {
    const $tmp = $(this).closest('.battle_content');
    $tmp.find('.enemy_content:not(:first)').remove();
    clearEnemyDiv($tmp.find('.enemy_content'));
    $(this).blur();
    caluclate();
  });

  // 敵艦名をクリック -> 敵艦選択モーダル展開
  $(document).on('click', '.enemy_name_span', function () {
    $target = $(this).closest('.enemy_content');
    const selectedID = $target.data('id');
    const $modalBody = $('#enemySelectModal').find('.modal-body');

    // モーダル生成処理
    $modalBody.html($('#enemySelect_content').html());

    // カテゴリ初期選択処理
    if (selectedID > 0) $modalBody.find('.enemyType_select').val(enemyData.find(v => v.id == selectedID).type).change();
    else $modalBody.find('.enemyType_select').val(0).change();

    // 選択艦娘ピックアップ
    if (selectedID) {
      const $selected = $modalBody.find('#' + selectedID)
      $selected.addClass('enemy-selected');
      $modalBody.find('tbody').prepend($selected.clone());
      $selected.remove();
      $('#enemySelectModal_btnRemove').prop('disabled', false);
    }
    else {
      $('#enemySelectModal_btnRemove').prop('disabled', true);
    }

    $('#enemySelectModal').modal('show');
  });

  // 敵艦種変更時 応じた敵艦を table に展開
  $(document).on('change', '.enemyType_select', function () {
    createEnemyTable($(this).parent().next().find('.enemy_table'), [Number($(this).val())]);
  });

  // 敵艦選択画面(モーダル)　敵艦名をクリック時
  $('#enemySelectModal').on('click', '.modal-body .enemy', function () {
    $('#enemySelectModal').find('.enemy').removeClass('enemy-selected');
    $(this).addClass('enemy-selected');
    // OKボタン活性化
    $('#enemySelectModal_btnCommit').prop('disabled', false);
  });

  // 編成ボタンクリック(敵艦選択モーダル内)
  $('#enemySelectModal_btnCommit').on('click', function () {
    if ($(this).prop('disabled')) return false;

    if (!$('.enemy-selected').attr('class')) {
      $('#enemySelectModal_btnCommit').prop('disabled', true);
      return false;
    }

    // 敵艦セット
    setEnemyDiv($target, Number($('.enemy-selected').data('id')));

    $('#enemySelectModal').modal('hide');
  });

  // はずすボタンクリック(敵艦選択モーダル内)
  $('#enemySelectModal_btnRemove').on('click', function () {
    if ($(this).prop('disabled')) return false;

    // 選択状況をリセット
    clearEnemyDiv($target);

    $('#enemySelectModal').modal('hide');
  });

  // 設定変更
  $('#dispMoreThan0AA').click(() => { $('#planeSelect_select').change(); });
  $('#dispMoreThanxAASwitch').click(() => { $('#planeSelect_select').change(); });
  $('#dispMoreThanxAA').change(() => { $('#planeSelect_select').change(); });
  $('#innerProfSetting .custom-control-input').click(function () {
    // クリックされた type
    const clickedType = Number($(this).attr('id').replace('prof120_', ''));
    if ($(this).prop('checked') && prof120.indexOf(clickedType) == -1) prof120.push(clickedType);
    else if (!$(this).prop('checked') && prof120.indexOf(clickedType) != -1) prof120 = prof120.filter(v => v != clickedType);
    caluclate();
  });
  $('#displayBattle').change(caluclate);

  $(document).on({
    mouseenter: function () {
      // 横全部ぬりぬり
      const rowIndex = Number($(this).closest('tr').data('rowindex'));
      $(this).closest('tr').addClass('bg-light');
      $('#shootDownTable_tbody').find('.shipNo' + rowIndex + ':first').find('.td_name').addClass('bg-light');
    },
    mouseleave: function () {
      const rowIndex = Number($(this).closest('tr').data('rowindex'));
      $(this).closest('tr').removeClass('bg-light');
      $('#shootDownTable_tbody').find('.shipNo' + rowIndex + ':first').find('.td_name').removeClass('bg-light');
    }
  }, '#shootDownTable_tbody td')

  // 機体選択モーダル終了時
  $('#planeSelectModal').on('hide.bs.modal', () => {
    $target = undefined;
    caluclate();
  });
  // 艦娘選択モーダル終了時
  $('#shipSelectModal').on('hide.bs.modal', () => {
    $target = undefined;
    caluclate();
  });
  // 艦娘選択モーダル終了時
  $('#enemySelectModal').on('hide.bs.modal', () => {
    $target = undefined;
    caluclate();
  });

  // スマホメニュー展開
  $('#menu-small').click(() => {
    $('#smartMenuModal').find('.modal-body').html($('#Navbar').html());
    $('#smartMenuModal').find('.mt-5').removeClass('mt-5').addClass('mt-3');
    $('#smartMenuModal').modal('show');
  });
  // スマホメニューから移動
  $(document).on('click', '#smartMenuModal a[href^="#"]', function () {
    const speed = 300;
    const href = $(this).attr("href");
    const target = $(href == "#" || href == "" ? 'html' : href);
    const position = target.offset().top - 60;
    $('body,html').animate({ scrollTop: position }, speed, 'swing');
    setTimeout(() => { $('#smartMenuModal').modal('hide'); }, 220);
    return false;
  });

  // 画面サイズ変更時
  $(window).resize(function () {
    if (timer !== false) {
      clearTimeout(timer);
    }

    timer = setTimeout(function () {
      if ($('#lb_tab_select').css('display') != 'none' && $('#lb_item1').attr('class').indexOf('tab-pane') == -1) {
        $('.lb_tab').addClass('tab-pane fade');
        $('.lb_tab:first').tab('show')
      }
      else if ($('#lb_tab_select').css('display') == 'none' && $('#lb_item1').attr('class').indexOf('tab-pane') != -1) {
        $('.lb_tab').removeClass('tab-pane fade').show().fadeIn();
      }
    }, 50);
  });
});
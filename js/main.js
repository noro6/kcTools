/*==================================
    グローバルっぽい変数
==================================*/
// 機体選択画面の返却先
let $target = undefined;

// 熟練を最初からMaxにする機体カテゴリ
const levelMaxCate = [1, 4, 5, 7, 8, 102, 103];

// 搭載数が基地で最大4の機体カテゴリ つまり偵察機
const reconnaissances = [4, 5, 8, 104];

// ドラッグした要素が範囲外かどうかフラグ
let isOut = false;

// 結果表示バー用データ
const chartData =
{
  friend: [],
  enemy: [],
  rate: [{}]
};
let prevData = [];
let enemyFleet = [];

// 基地リスト
let lbList = [{}];
// 基地データ
const lbData = {
  ap: [0, 0, 0],
  status: [0, 0, 0]
}

// 味方艦隊リスト
let friendFleetList = [{}];

// 艦隊総制空値
let mainAp = 0;

// 防空モード
let isDefenseMode = false;

// arrayとdiffArray内に1つでも同じ値がある場合true
const isContain = (array, diffArray) => { for (const value1 of array) for (const value2 of diffArray) if (value1 === value2) return true; return false; }

/*==================================
    デバッグ用
==================================*/

// 敵idリスト
const enmList = [118, 235, /*735*/];

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
  setPlaneType($('.planeSelect_select'), planeType.filter(v => v.id > 0).map(v => v.id));

  // 艦種初期化
  $('.shipType_select').empty();
  $('.shipType_select').append('<option value="0">全て</option>');
  setShipType(shipType.filter(v => v.id < 15).map(v => v.id));

  // 敵艦種初期化
  $('.enemyType_select').empty();
  $('.enemyType_select').append('<option value="0">全て</option>');
  setEnemyType(enemyType.filter(v => v.id > 0).map(v => v.id));

  createPlaneTable($('.plane_table'), planeData);
  createShipTable($('.ship_table'), [0]);

  // 改修値選択欄生成
  let text = '';
  for (let i = 0; i <= 10; i++) {
    if (i == 0) text += '<option class="remodel__option" value="0" selected></option>';
    else if (i == 10) text += '<option class="remodel__option" value="10">★max</option>';
    else text += '<option class="remodel__option" value="' + i + '">★+' + i + '</option>';
  }
  $('.remodel_select').append(text);

  // 熟練度選択欄
  text = `
    <option class="prof prof__yellow" value="7">>></option>
    <option class="prof prof__yellow" value="6">///</option>
    <option class="prof prof__yellow" value="5">//</option>
    <option class="prof prof__yellow" value="4">/</option>
    <option class="prof prof__blue" value="3">|||</option>
    <option class="prof prof__blue" value="2">||</option>
    <option class="prof prof__blue" value="1">|</option>
    <option class="prof" value="0" selected></option>
  `;
  $('.prof_select').append(text);

  // 基地航空隊 複製
  $('.lb_tab').html($('#lb_item1').html());
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

  // 艦隊簡易ビュー複製
  $('.fleet_info_table tbody tr').html($('.fleet_info_table tbody tr:first').html());

  // 詳細設定
  let maxAA = 0;
  text = '';
  for (const plane of planeData) if (plane.AA > maxAA) maxAA = plane.AA;
  for (let index = 0; index < maxAA; index++) text += '<option value="' + index + '">' + index + '</option>';
  $('#dispMoreThanxAA').append(text);

  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="popover"]').popover();

  callback();
}

/**
 * カテゴリコードから艦載機配列を返却
 * @param {number} type
 * @returns {Array.<Object>} 艦載機オブジェクト配列
 */
function getPlanes(type) {
  return type == 0 ? planeData.concat() : planeData.filter(v => Math.abs(Number(v.type)) == Math.abs(Number(type)));
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
  $div.find('.slot').val('0');
  $div.find('.remodel_select').prop('disabled', true);
}

/**
 * 第1引数で渡された lb_plane に第2引数で渡された 機体データ入り要素のデータを挿入する
 * @param {JqueryDomObject} $div
 * @param {JqueryDomObject} $original
 */
function setLbPlaneDiv($div, $original) {
  setPlaneDiv($div, $original);

  // 搭載数初期値 偵察機系は4
  if ($.inArray($original.data('type'), reconnaissances) != -1) $div.find('.slot').val('4').change();
  else $div.find('.slot').val('18').change();

  // お札が待機になってるなら集中に変更
  const $lb_ope = $div.closest('.lb_tab_main').prev();
  if ($lb_ope.find('.active span').text() == '待機') {
    $lb_ope.find('label').removeClass('active');
    $lb_ope.find('.multiAtk').addClass('active');
  }
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
  const $remodelInput = $div.find('.remodel_select');
  $remodelInput.prop('disabled', !plane.remodel);
  if ($remodelInput.prop('disabled')) $remodelInput.val('0');

  // 熟練度初期値 戦闘機系は最初から熟練Maxで
  const $profInput = $div.find('.prof_select');
  if (levelMaxCate.indexOf(type) != -1) $profInput.val('7');
  else $profInput.val('0');

  // 特定の改修値、熟練度を保持していた場合
  if ($original.data('remodel')) $remodelInput.val($original.data('remodel'));
  if ($original.data('prof')) $profInput.val($original.data('prof'));

  // 熟練度selectの色反映
  $profInput.change();

  // 艦娘非選択で次の入力欄が隠れていたら出す
  if ($div.closest('.ship_tab').attr('class') && !shipID) {
    if ($div.parent().next().attr('class')) $div.parent().next().removeClass('d-none');
    else {
      // 次の入力欄表示
      let cur = getParentShipNo($div);
      if (cur && cur < 12) $('#ship_plane_content_' + ++cur).closest('.ship_tab').removeClass('d-none');
    }
  }
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
        .data('remodel', $this.find('.remodel_select').val())
        .data('prof', $this.find('.prof_select').val());
    if ($this.data('id')) setPlaneDiv($this, $plane);

    $this.find('.slot').val('0');
    if (i < ship.slot.length) {
      $this.parent().removeClass('d-none');
      $this.find('.slot').val(ship.slot[i]);
    }
    else $this.parent().addClass('d-none');
  });

  // テーブルにも反映
  const shipNo = getParentShipNo($div);;
  $('.fleet_info_table').find('#fleet_info_row' + shipNo).find('.col0').text(ship.name);
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

  // テーブルにも反映
  const shipNo = getParentShipNo($div);;
  $('.fleet_info_table').find('#fleet_info_row' + shipNo).find('.col0').text('未選択');
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
 * 引数で渡された table 要素(要 tbody )に plans 配列から値を展開
 * @param {JqueryDomObject} $table
 * @param {Array.<Object>} planes
 */
function createPlaneTable($table, planes) {
  const $tbody = $table.find('tbody');
  const cutOffAA = Number($('#dispMoreThanxAA').val());
  let insertHtml = '';

  for (const plane of planes) {
    // 対空:0 の艦攻艦爆を除く
    if ($('#dispMoreThan0AA').prop('checked') && [2, 3].indexOf(Math.abs(plane.type)) > -1 && plane.AA == 0 && plane.id < 10000) continue;
    else if (!$('#dispMoreThan0AA').prop('checked') && plane.id > 10000) continue;

    const nmAA = plane.AA + 1.5 * plane.geigeki;
    const defAA = plane.AA + plane.geigeki + 2.0 * plane.taibaku;
    // 対空一定値以下の戦闘機系を除く
    if ($('#dispMoreThanxAASwitch').prop('checked') && cutOffAA >= plane.AA && [1, 7, 102, 103].indexOf(Math.abs(plane.type)) > -1) continue;

    let abbrAA = '';
    if (plane.taibaku > 0 || plane.geigeki > 0) {
      abbrAA = `<abbr title="出撃時:` + nmAA + ` , 防空時:` + defAA + `">` + plane.AA + `</abbr>`;
    }

    insertHtml += `
    <tr class="border-bottom plane" id="` + plane.id + `" data-type="` + plane.type + `">
        <td width="8%"><img src="./img/e/Type`+ plane.type + `.png" class="img-size-25" alt="` + plane.type + `"></td>
        <td width="62%">`+ plane.name + `</td>
        <td class="text-center" width="15%">`+ (abbrAA ? abbrAA : plane.AA) + `</td>
        <td class="text-center" width="15%">`+ plane.range + `</td>
    </tr>
    `;
  }

  $tbody.html(insertHtml);

  // 機体選択モーダル内のボタン非活性
  $('#planeSelectModal_btnCommitPlane').prop('disabled', true);
  $('#planeSelectModal_btnRemovePlane').prop('disabled', true);
}

/**
 * 引数で渡された table 要素(要 tbody )に ship 配列から値を展開
 * @param {JqueryDomObject} $table
 * @param {Array.<number>} type
 */
function createShipTable($table, type) {
  const $tbody = $table.find('tbody');
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

    let slotText = '';
    for (let index = 0; index < 5; index++) slotText += '<td class="text-center td_slot' + index + '">' + (index < ship.slot.length ? ship.slot[index] : '') + '</td>';

    insertHtml += `
    <tr class="border-bottom ship" id="` + ship.id + `">
        <td>` + ship.name + `</td>`
      + slotText + `
    </tr>`;
  }
  $tbody.html(insertHtml);

  // 艦隊選択モーダル内のボタン非活性
  $('#shipSelectModal_btnCommitShip').prop('disabled', true);
  $('#shipSelectModal_btnRemoveShip').prop('disabled', true);
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
    <tr class="border-bottom enemy" id="` + enemy.id + `">
        <td width="60%">` + enemy.name + `</td>
        <td width="20%" class="text-center">`+ ap + `</td>
        <td width="20%" class="text-center">`+ lbAp + `</td>
    </tr>`;
  }
  $tbody.html(insertHtml);

  // 艦隊選択モーダル内のボタン非活性
  $('#enemySelectModal_btnCommitShip').prop('disabled', true);
  $('#enemySelectModal_btnRemoveShip').prop('disabled', true);
}

/**
 * グラフの描画を行う
 * 確保を100%とした、120%上限あたりの各100分率をグラフ化
 * @param {Object} data
 */
function drawResultBar(data) {
  // グラフ描画域リセット
  $('#resultChart').html('');

  // それぞれのフェーズにおける制空ボーダーの配列を生成
  const border = data.enemy.map(eap => getBorder(eap));
  const divBase = border.map(value => value[0] == 0 ? 1 : value[0]);
  const mainData = data.friend.map((ap, i) => ap / divBase[i] * 100);
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
  const tooltip = d3.select("body").append("div").attr("class", "tooltip_resultBar px-3");

  // 各種バー描画
  svg.selectAll('svg')
    .data(mainData)
    .enter()
    .append('rect')
    .attr('x', xScale(0))
    .attr('y', (d, i) => yScale(phaseList[i]))
    .attr('width', (d, i) => xScale(prevData[i] > maxRange ? maxRange : prevData[i]) - xScale(0))
    .attr('height', barWidth)
    .style('fill', (d, i) => backColor[getAirStatusIndex(data.friend[i], data.enemy[i])])
    .style('stroke', (d, i) => borderColor[getAirStatusIndex(data.friend[i], data.enemy[i])])
    .on('mouseover', function (d, i) {
      d3.select(this)
        .attr('style', 'fill:' + getBarColor(0.8)[getAirStatusIndex(data.friend[i], data.enemy[i])])
        .style('stroke', borderColor[getAirStatusIndex(data.friend[i], data.enemy[i])]);

      // 確率表示
      let addText = '';
      let isFirst = true;

      if (!isDefenseMode) {
        const target = chartData.rate[i];

        for (const key of Object.keys(target)) {
          if (target[key] != '0 %') {
            addText += isFirst ? '' : ' / '
            addText += key + '( ' + target[key] + ' )';
            isFirst = false;
          }
        }
      }

      // ボーダー表示
      let addText2 = '';
      const ap = data.friend[i];
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
                <table class="table table-sm table-borderless mb-1">
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
        .style("top", (d3.event.pageY - 60) + "px")
        .style("left", ($('#resultChart').offset().left + (d > maxRange ? xScale(maxRange) : xScale(d)) + 15) + "px");
    })
    .on('mouseout', function (d, i) {
      d3.select(this)
        .attr('style', 'fill:' + backColor[getAirStatusIndex(data.friend[i], data.enemy[i])])
        .style('stroke', borderColor[getAirStatusIndex(data.friend[i], data.enemy[i])]);
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
 * 引数の id から敵オブジェクトを生成
 * @param {number} id 敵ID
 * @returns {Object} 敵オブジェクト
 */
function createEnemyObject(id) {
  const tmp = enemyData.find(v => v.id == id);
  const enemy =
  {
    id: tmp.id,
    type: tmp.type,
    name: tmp.name,
    slots: tmp.slot.concat(),
    aa: tmp.aa.concat(),
    orgSlots: tmp.slot.concat(),
    isSpR: tmp.isSpR,
    ap: 0,
    lbAp: 0
  }
  updateEnemyAp(enemy);
  return enemy
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
 * 撃墜処理(チャート表示用 5割固定)
 * @param {Array.<Object>} enemyFleet
 * @param {number} ap
 */
function ShootDownforChart(enemyFleet, ap) {
  const elbap = getEnemyFleetLandBaseAirPower(enemyFleet);

  chartData.friend.push(ap);
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
 * 撃墜処理 (繰り返し用)
 * @param {Array.<Object>} enemyFleet
 * @param {number} ap
 */
function ShootDown(enemyFleet, ap) {
  const elbap = getEnemyFleetLandBaseAirPower(enemyFleet);
  const airCond = getAirStatusIndex(ap, elbap);
  for (const enemy of enemyFleet) {
    for (let j = 0; j < enemy.slots.length; j++) {
      let slot = enemy.slots[j];
      enemy.slots[j] -= getShootDownSlot(airCond, slot);
    }
    updateEnemyAp(enemy);
  }
}

/**
 * 敵IDのリストから敵艦隊を生成する
 * @param {Array.<number>} enmList 敵艦IDリスト
 * @returns {Array.<Object>} 敵艦隊オブジェクト配列
 */
function getEnemyFleet(enmList) {
  const selectedEnemy = [];
  for (const id of enmList) selectedEnemy.push(createEnemyObject(id));
  return selectedEnemy;
}


/**
 * 指定された敵オブジェクトが持つ制空値を再計算する
 * @param {Object} enemy 再計算する敵オブジェクト
 */
function updateEnemyAp(enemy) {
  enemy.ap = 0;
  enemy.lbAp = 0;
  enemy.aa.forEach((aa, i) => {
    if (!enemy.isSpR) enemy.ap += Math.floor(aa * Math.sqrt(enemy.slots[i]));
    else enemy.lbAp += Math.floor(aa * Math.sqrt(enemy.slots[i]));
  });
  enemy.lbAp += enemy.ap;
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
  console.time('caluclate');

  // 基地情報更新
  console.time('updateLandBaseInfo');
  updateLandBaseInfo();
  console.timeEnd('updateLandBaseInfo');

  // 艦隊情報更新
  console.time('updateFriendFleetInfo');
  updateFriendFleetInfo()
  console.timeEnd('updateFriendFleetInfo');

  // 敵艦情報更新


  // メイン計算
  startCaluclate();

  // 結果表示
  console.time('drawResultBar');
  drawResultBar(chartData);
  console.timeEnd('drawResultBar');

  console.timeEnd('caluclate');

  console.log('');
}


/**
 * 基地航空隊 中隊オブジェクト生成
 * @param {JqueryDomObject} $lb_plane 生成元 lb_plane
 * @param {number} index 第何中隊
 * @returns 生成物
 */
function createLBPlaneObject($lb_plane, index) {
  const id = Number($lb_plane.data('id'));
  const type = Number($lb_plane.data('type') ? $lb_plane.data('type') : 0);
  // undefined来る可能性あり
  const plane = getPlanes(type).find(v => v.id == id);

  // スロット数不正チェック
  let inputSlot = Number($lb_plane.find('.slot').val());
  if ($lb_plane.find('.slot').val().length == 0) inputSlot = 0;
  else {
    inputSlot = inputSlot > 18 ? 18 : inputSlot < 0 ? 0 : inputSlot;
    // スロット数表示修正
    $lb_plane.find('.slot').val(inputSlot);
  }

  const lbPlane = {
    baseNo: $lb_plane.closest('.lb_tab').attr('id').slice(-1) - 1,
    num: index % 4,
    id: 0,
    name: '',
    type: 0,
    AA: 0,
    taibaku: 0,
    geigeki: 0,
    ap: 0,
    remodel: Number($lb_plane.find('.remodel_select').val()),
    level: Number($lb_plane.find('.prof_select').val()),
    slot: inputSlot,
    range: 999,
    cost: 0
  }

  if (plane) {
    lbPlane.id = plane.id;
    lbPlane.name = plane.name;
    lbPlane.type = plane.type;
    lbPlane.AA = plane.AA;
    lbPlane.taibaku = plane.taibaku;
    lbPlane.geigeki = plane.geigeki;
    lbPlane.range = plane.range;
    lbPlane.cost = plane.cost;
    lbPlane.ap = getAirPower_lb(lbPlane);
  }

  return lbPlane;
}

/**
 * 基地航空隊入力情報更新
 * 値の表示と制空値、半径計算も行う
 */
function updateLandBaseInfo() {
  const tmpLbPlanes = [];
  let sumFuel = 0;
  let sumAmmo = 0;
  let sumBauxite = 0;
  lbList.length = 0;

  // 出撃 or 防空
  $('.lb_ope').each((i, e) => {
    const lbNo = $(e).parent().attr('id').slice(-1) - 1;
    const ope = $(e).find('.active').text().trim();
    switch (ope) {
      case '集中':
        lbData.status[lbNo] = 2;
        break;
      case '単発':
        lbData.status[lbNo] = 1;
        break;
      case '防空':
        lbData.status[lbNo] = 0;
        break;
      default:
        lbData.status[lbNo] = -1;
        break;
    }
  });

  // 基地航空隊 各種制空値表示
  $('.lb_plane').each((i, e) => {
    // 基地航空機オブジェクト生成
    const lbObject = createLBPlaneObject($(e), i);

    // 一時格納
    tmpLbPlanes.push(lbObject);

    // 個別制空値表示
    const no = i % 4;
    const $target_td = $('#lb_info_row' + (lbObject.baseNo + 1)).find('.col' + (no + 1));
    const prevAp = Number($target_td.text()) ? Number($target_td.text()) : 0;

    // 制空値　第1航空隊が来たら代入、他は加算
    lbData.ap[lbObject.baseNo] = no == 0 ? lbObject.ap : lbData.ap[lbObject.baseNo] + lbObject.ap;

    // 各種制空値反映
    drawChangeValue($target_td, prevAp, lbObject.ap);

    // 待機部隊は黒塗り
    $target_td.parent().css({ 'background-color': lbData.status[lbObject.baseNo] != -1 ? '#fff' : '#bbb' });

    // 出撃コスト加算
    sumFuel += lbObject.id == 0 ? 0 : Math.ceil(lbObject.slot * (lbObject.type == 101 ? 1.5 : 1.0));
    sumAmmo += lbObject.id == 0 ? 0 : lbObject.type == 101 ? Math.floor(lbObject.slot * 0.7) : Math.ceil(lbObject.slot * 0.6);
    sumBauxite += lbObject.cost * (reconnaissances.indexOf(lbObject.type) == -1 ? 18 : 4);

    if (i % 4 == 3) {
      // 出撃、配備コスト
      const $resourceArea = $(e).closest('.lb_tab').find('.resource');
      const $fuel = $resourceArea.find('.fuel');
      const $ammo = $resourceArea.find('.ammo');
      const $bauxite = $resourceArea.find('.bauxite');
      drawChangeValue($fuel, Number($fuel.text()), sumFuel, true);
      drawChangeValue($ammo, Number($ammo.text()), sumAmmo, true);
      drawChangeValue($bauxite, Number($bauxite.text()), sumBauxite, true);
      sumFuel = 0;
      sumAmmo = 0;
      sumBauxite = 0;

      // 格納
      lbList.push(tmpLbPlanes.concat());

      tmpLbPlanes.length = 0;
    }
  });

  // 各隊総制空値、半径の表示
  for (let i = 0; i < lbData.ap.length; i++) {
    // 総制空値
    let $target_td = $('#lb_info_row' + (i + 1)).find('.col5');
    drawChangeValue($target_td, Number($target_td.text()), lbData.ap[i]);

    // 半径
    $target_td = $('#lb_info_row' + (i + 1)).find('.col6');
    const range = getRange(i);
    drawChangeValue($target_td, Number($target_td.text()), range);
  }
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
  const taibaku = lb_plane.taibaku;
  const geigeki = lb_plane.geigeki;
  const remodel = lb_plane.remodel;
  const level = lb_plane.level;
  const slot = lb_plane.slot;

  let sumPower = 0.0;

  // 艦戦 夜戦 水戦 陸戦 局戦
  if ([1, -1, 7, 102, 103].indexOf(type) != -1) {
    //防空時
    if (isDefenseMode) sumPower = (0.2 * remodel + taiku + geigeki + 2.0 * taibaku) * Math.sqrt(slot);
    //出撃時
    else sumPower = (0.2 * remodel + taiku + 1.5 * geigeki) * Math.sqrt(slot);

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
    sumPower = 1.0 * (0.25 * remodel + taiku) * Math.sqrt(slot);
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
        sumPower += Math.sqrt(($('#prof120_' + Math.abs(type)).prop('checked') ? 120 : 100) / 10);
        break;
      default:
        break;
    }
  }

  sumPower = slot > 0 ? Math.floor(sumPower) : 0;
  return sumPower;
}

/**
 * 引数の航空隊の行動半径を返却
 * @param {number} index 返す航空隊のインデックス
 * @returns　行動半径(補正後)
 */
function getRange(index) {
  let shortestRange = 999;
  let longestTeisatu = 1;
  for (const lbObject of lbList[index]) shortestRange = lbObject.range < shortestRange ? lbObject.range : shortestRange;

  // 最も足の長い偵察機の半径を取得
  for (const lbObject of lbList[index]) {
    if ([4, 5, 8, 104].indexOf(lbObject.type) != -1) {
      longestTeisatu = longestTeisatu < lbObject.range ? lbObject.range : longestTeisatu;
    }
  }

  if (longestTeisatu < 999 && longestTeisatu > shortestRange) return Math.round(shortestRange + Math.min(Math.sqrt(longestTeisatu - shortestRange), 3));
  else return shortestRange == 999 ? 0 : shortestRange;
}

/**
 * 艦娘 装備オブジェクト生成
 * @param {JqueryDomObject} $ship_plane 生成元 ship_plane
 * @param {number} index 何番目のスロか
 * @returns 生成物
 */
function createFleetPlaneObject($ship_plane, index) {
  const id = Number($ship_plane.data('id'));
  const type = Number($ship_plane.data('type') ? $ship_plane.data('type') : 0);
  // undefined来る可能性あり
  const plane = getPlanes(type).find(v => v.id == id);
  // スロット数不正チェック
  let inputSlot = Number($ship_plane.find('.slot').val());
  inputSlot = inputSlot > 9999 ? 9999 : inputSlot < 0 ? 0 : inputSlot;
  // スロット数表示修正
  $ship_plane.find('.slot').val(inputSlot);

  const shipPlane = {
    fleetNo: $ship_plane.closest('.ship_tab_main').attr('id').slice(-1),
    slotNo: index,
    id: 0,
    name: '',
    type: 0,
    AA: 0,
    ap: 0,
    remodel: Number($ship_plane.find('.remodel_select').val()),
    level: Number($ship_plane.find('.prof_select').val()),
    slot: inputSlot,
  }

  if (plane) {
    shipPlane.id = plane.id;
    shipPlane.name = plane.name;
    shipPlane.type = plane.type;
    shipPlane.AA = plane.AA;
    shipPlane.ap = getAirPower_fleet(shipPlane);
  }

  return shipPlane;
}

/**
 * 制空値を返す -艦娘
 * @param {Object} plane
 * @returns 引数の plane オブジェクトの持つ制空値
 */
function getAirPower_fleet(plane) {
  if (plane.id == 0) return 0;
  const type = plane.type;
  const taiku = plane.AA;
  const remodel = plane.remodel;
  const level = plane.level;
  const slot = plane.slot;

  let sumPower = 0.0;

  // 艦戦 夜戦 水戦
  if ([1, -1, 7].indexOf(type) != -1) {
    sumPower = (0.2 * remodel + taiku) * Math.sqrt(slot);
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
    sumPower = 1.0 * (0.25 * remodel + taiku) * Math.sqrt(slot);
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
        sumPower += Math.sqrt(($('#prof120_' + Math.abs(type)).prop('checked') ? 120 : 100) / 10);
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
 */
function updateFriendFleetInfo() {
  const tmpFFPlanes = [];
  let prevShipNo = 1;
  let slotNo = 0;
  friendFleetList.length = 0;
  mainAp = 0;

  // テーブルいったん非表示
  $('.fleet_info_table').find('tbody tr').addClass('d-none');

  // 各種制空値表示
  $('.ship_plane').each((i, e) => {
    // 非表示部分、D & D クローン部分は飛ばす
    if ($(e).closest('.ship_tab').attr('class').indexOf('d-none') != -1 || !$(e).closest('.ship_tab_main').attr('id')) return;
    const shipNo = getParentShipNo($(e));
    // 次の艦娘に移りそうなのでぶっ込んで初期化
    if (prevShipNo != shipNo) {
      // 総制空値
      const txtAP = $('#ship_plane_content_' + prevShipNo).closest('.ship_tab').find('.ap');
      const prevAp = Number(txtAP.text()) ? Number(txtAP.text()) : 0;
      let curAP = 0;
      for (const v of tmpFFPlanes) curAP += v.ap;
      drawChangeValue(txtAP, prevAp, curAP);
      friendFleetList.push(tmpFFPlanes.concat());
      prevShipNo = shipNo;
      tmpFFPlanes.length = 0;
      slotNo = 0;
    }

    // 機体オブジェクト生成
    const ffPlaneObj = createFleetPlaneObject($(e), ++slotNo);
    tmpFFPlanes.push(ffPlaneObj);

    // 個別制空値表示
    const $target_td = $('.fleet_info_table').find('#fleet_info_row' + shipNo).find('.col' + slotNo);
    const prevAp = Number($target_td.text());

    // テーブル表示させる
    $('.fleet_info_table').find('#fleet_info_row' + shipNo).removeClass('d-none');

    // 各種制空値反映
    drawChangeValue($target_td, prevAp, ffPlaneObj.ap);
  });

  // 総制空値表示
  for (const fleet of friendFleetList) {
    let sumAp = 0;
    const apList = fleet.map(v => v.ap);

    // 1艦隊の総制空値
    for (const ap of apList) sumAp += ap;

    let $target_td = $('.fleet_info_table').find('#fleet_info_row' + fleet[0].fleetNo).find('.col6');
    drawChangeValue($target_td, Number($target_td.text()), sumAp);
    mainAp += sumAp;
  }
}

/**
 * 計算前の初期化作業
 * @param {boolean} isAll 全て初期化するかどうか
 */
function initCaluclate(isAll) {
  enemyFleet = getEnemyFleet(enmList);
  if (isAll) {
    chartData.friend = [];
    chartData.enemy = [];
  }
}

/**
 * メイン計算処理
 */
function startCaluclate() {
  initCaluclate(true);
  let eap = 0;

  if (isDefenseMode) {
    let sumAP = 0;
    for (let index = 0; index < 3; index++) if (lbData.status[index] != -1) sumAP += lbData.ap[index];
    chartData.friend.push(sumAP);
    chartData.enemy.push(getEnemyFleetAirPower(enemyFleet));
  }
  else {
    for (let index = 0; index < 3; index++) {
      let lbAp = lbData.ap[index];
      if (lbData.status[index] > 0) {
        // 第一波
        ShootDownforChart(enemyFleet, lbAp);
      }
      else {
        // 空データ挿入
        chartData.friend.push(0);
        chartData.enemy.push(0);
      }

      if (lbData.status[index] == 2) {
        // 第二波
        ShootDownforChart(enemyFleet, lbAp);
      }
      else {
        // 空データ挿入
        chartData.friend.push(0);
        chartData.enemy.push(0);
      }
    }

    chartData.friend.push(0);
    chartData.enemy.push(0);

    eap = getEnemyFleetAirPower(enemyFleet);
    chartData.friend.push(mainAp);
    chartData.enemy.push(eap);

    // 各状態確率計算
    console.time('rateCaluclate');
    chartData.rate = rateCaluclate();
    console.timeEnd('rateCaluclate');
  }
}

/**
 * 各種制空状態確率計算
 */
function rateCaluclate() {
  const maxCount = 20000;
  const dist = [{}, {}, {}, {}, {}, {}, {}, {}];
  const cache = enemyFleet;
  dist.forEach(object => {
    airStatus.forEach(value => { object[value.abbr] = 0 });
  });

  initCaluclate(false);
  for (let count = 0; count < maxCount; count++) {
    // 敵機補給
    for (const enemy of cache) {
      enemy.slots = enemy.orgSlots.concat();
      updateEnemyAp(enemy);
    }

    for (let j = 0; j < 3; j++) {
      let lbAp = lbData.ap[j];
      if (lbData.status[j] > 0) {
        // 第一波
        dist[j * 2][airStatus[getAirStatusIndex(lbAp, getEnemyFleetLandBaseAirPower(cache))].abbr]++;
        ShootDown(cache, lbAp);
      }

      if (lbData.status[j] == 2) {
        // 第二波
        dist[j * 2 + 1][airStatus[getAirStatusIndex(lbAp, getEnemyFleetLandBaseAirPower(cache))].abbr]++;
        ShootDown(cache, lbAp);
      }
    }

    // 本隊
    dist[7][airStatus[getAirStatusIndex(mainAp, getEnemyFleetAirPower(cache))].abbr]++;
  }
  for (const obj of dist) {
    for (const key of Object.keys(obj)) {
      obj[key] = Math.floor((obj[key] / maxCount * 10000)) / 100 + ' %';
    }
  }

  return dist;
}

/*==================================
    メイン
==================================*/
$(() => {
  // 画面初期化
  initAll(() => {
    // 終わったらLoading画面お片付け
    $('#loadingSpinner').fadeOut(200);
    $('#main').delay(180).fadeIn(200, () => {
      // グラフエリア初期化
      startCaluclate();
      drawResultBar(chartData);
    });
    $('footer').delay(180).fadeIn(200);
  });

  // イベント貼り付けなど
  // 出撃系札
  $(document).on('click', '.lb_ope_basic', function () {
    isDefenseMode = false;
    // 自分とこの防空とりやめ
    $(this).next().find('.btnDefLB.active').removeClass('active');

    // ほかで防空していた部隊は待機にする
    $('.btnDefLB.active').removeClass('active').parent().prev().find('.wait').addClass('active');

    caluclate();
  });
  // 防空札
  $(document).on('click', '.btnDefLB', function () {
    isDefenseMode = true;
    // 出撃している部隊は待機にする
    $('.lb_ope_basic').find('.multiAtk.active').removeClass('active').nextAll('.wait').addClass('active');
    $('.lb_ope_basic').find('.singleAtk.active').removeClass('active').nextAll('.wait').addClass('active');

    // 自分のところだけ防空
    $(this).parent().prev().find('.active').removeClass('active');
    $(this).addClass('active').blur();
    caluclate();
  });
  // 基地航空隊リセットボタン
  $(document).on('click', '.btnResetLB', function () {
    $(this).closest('.lb_tab').find('.lb_plane').each((i, e) => { clearPlaneDiv($(e)); });
    $(this).blur();
    caluclate();
  });
  $(document).on('input', '.slot', function () {
    // 入力検証 -> 数値 かつ 0 以上　違ってたら勝手に0にして続行　空白は据え置く(0扱い)
    const value = $(this).val();
    var regex = new RegExp(/^[0-9]+$/);
    if (value.length > 0 && !regex.test(value)) $(this).val(0);
    caluclate();
  });
  $(document).on('click', '.remodel_select', caluclate);
  $(document).on('click', '.prof_select', caluclate);

  // 艦娘装備リセットボタン
  $(document).on('click', '.btnResetShip', function () {
    $(this).closest('.ship_tab').find('.ship_plane').each((i, e) => { clearPlaneDiv($(e)); });
    $(this).blur();
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

  // 折り畳みボタン
  $('.btn_toggleContent').on('click', function () {
    $(this).toggleClass('btn-toggleContent_show').toggleClass('btn-toggleContent_hide').blur();
  });

  // コンテンツ入れ替え設定
  $('#main_contents').sortable({
    helper: 'clone',
    handle: '.content_title',
    start: (e, ui) => { $(ui.helper).removeClass('border-bottom').addClass('border px-3'); },
    stop: () => {
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
    }
  });

  // 基地機体入れ替え設定
  $('.lb_tab_main').sortable({
    delay: 100,
    scroll: false,
    placeholder: "lb_plane-drag",
    forcePlaceholderSize: true,
    tolerance: "pointer",
    handle: 'img',
    stop: function (event, ui) {
      if (isOut) {
        // 選択状況をリセット
        clearPlaneDiv(ui.item);
        $(this).sortable('cancel');
        ui.item.css('opacity', '0.0');
        isOut = false;
      }
      ui.item.animate({ 'opacity': '1.0' }, 500);

      caluclate();
    }
  });
  // 範囲外に機体を持って行ったときを拾う
  $('#lb_content_main').droppable({
    accept: ".lb_plane",
    tolerance: "pointer",
    over: (event, ui) => {
      ui.draggable.animate({ 'opacity': '1.0' }, 100);
      isOut = false;
    },
    out: (event, ui) => {
      ui.draggable.animate({ 'opacity': '0.2' }, 100);
      isOut = true;
    }
  });
  // 機体をドラッグしてきた時の処理
  $('.lb_plane').droppable({
    accept: ".plane",
    hoverClass: "lb_plane-hover",
    tolerance: "pointer",
    drop: function (event, ui) {
      setLbPlaneDiv($(this), ui.draggable);
      caluclate();
    }
  });

  // 艦娘 機体入れ替え設定
  $('.ship_plane_draggable').draggable({
    delay: 100,
    helper: 'clone',
    scroll: false,
    handle: 'img:not([alt=""])',
    zIndex: 1000,
    start: function (e, ui) {
      $(ui.helper)
        .addClass('ship_plane ' + getPlaneCss(Number($(ui.helper).find('.plane_img').attr('alt'))))
        .css('width', $('.ship_plane_draggable').width());
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
        ui.helper.stop().animate({ 'opacity': '0.8' }, 100);
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
        const $tmpdiv =
          $('<div>')
            .data('id', $original.data('id'))
            .data('type', $original.data('type'))
            .data('remodel', $original.find('.remodel_select').val())
            .data('prof', $original.find('.prof_select').val());
        const $destination =
          $('<div>')
            .data('id', $this.data('id'))
            .data('type', $this.data('type'))
            .data('remodel', $this.find('.remodel_select').val())
            .data('prof', $this.find('.prof_select').val());

        // 挿入先が装備不可だった場合中止
        let shipID = Number($this.closest('.ship_tab').data('id'));
        let planeID = Number($original.data('id'));
        let type = Number($original.data('type'));
        if (shipID && planeID && type && !checkInvalidEquipment(shipID, getPlanes(type).find(v => v.id == planeID))) return;
        // 挿入OK
        setPlaneDiv($this, $tmpdiv);

        // 交換元に装備不可の装備が来た場合こっちだけ省く
        shipID = Number($original.closest('.ship_tab').data('id'));
        planeID = Number($this.data('id'));
        type = Number($this.data('type'));
        if (shipID && planeID && type && !checkInvalidEquipment(shipID, getPlanes(type).find(v => v.id == planeID))) return;
        // 交換OK
        setPlaneDiv($original, $destination);
      }
      caluclate();
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

  // 熟練度を選択時
  $('.prof_select').on('change', function () {
    const prof = $(this).val();
    if (prof >= 4) $(this).addClass('prof__yellow').removeClass('prof__blue');
    else if (prof > 0) $(this).addClass('prof__blue').removeClass('prof__yellow');
    else $(this).removeClass('prof__blue prof__yellow');
  });

  // 機体カテゴリ変更時 応じた機体を table に展開
  $(document).on('change', '.planeSelect_select', function () {
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
  $(document).on('click', '.plane_table_ td', function () {
    const $parent = $(this).closest('.plane_table_content');
    const sortKey = $(this).attr('id');
    const order = $(this).data('order');
    const nextOrder = order == 'asc' ? 'desc' : 'asc';

    // 順序反転
    $('.plane_table_ td').removeClass('sorted')
    $(this).parent().find('td').removeData().removeClass('asc desc');

    if (sortKey == 'th_default') return;

    $(this).data('order', nextOrder);
    $(this).addClass('sorted ' + nextOrder);

    // 再度カテゴリ検索をかけて反映する
    $parent.prevAll('.planeTypeSelect').find('.planeSelect_select').change();
  });

  // ホバーされたものだけdraggeble設定追加
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
              .addClass('plane_helper')
              .removeClass('border-bottom')
              .width($('.plane').width());
            $helper.html($helper.find('td:eq(0)').html() + $helper.find('td:eq(1)').html());
          }
        });
      }
    }
  }, '.card-body .plane');

  // 機体選択ボタンクリック -> モーダル展開
  $(document).on('click', '.plane_name_span', function () {
    $('#planeSelectModal').modal('handleUpdate')
    // 機体選択画面の結果を返却するターゲットのdiv要素を取得
    $target = $(this).closest('.lb_plane');
    if (!$target.attr('class')) $target = $(this).closest('.ship_plane');

    const selectedID = Number($target.data('id'));
    let selectedType = $target.data('type');
    selectedType = (!selectedType ? 0 : Math.abs(Number(selectedType)));
    const $modalBody = $('#planeSelectModal').find('.modal-body');

    // モーダル生成処理
    $modalBody.html($('#lbPlaneSelect_content').html());

    // 艦娘から展開した場合、陸上機は出さない
    if ($target.attr('class').indexOf('ship_plane') != -1) {
      selectedType = selectedType > 99 ? 0 : selectedType;
      $modalBody.find('#optg_lb').remove();
    }

    // カテゴリ初期選択処理
    $('#planeSelectModal').find('.planeSelect_select').val(selectedType).change();

    // 選択機体ピックアップ
    if (selectedID) {
      const $selected = $modalBody.find('#' + selectedID)
      $selected.addClass('plane-selected');
      $modalBody.find('tbody').prepend($selected.clone());
      $selected.remove();
      $('#planeSelectModal_btnRemovePlane').prop('disabled', false);
    }
    else {
      $('#planeSelectModal_btnRemovePlane').prop('disabled', true);
    }

    // 調整終了、モーダル展開
    $('#planeSelectModal').modal('show');
  });

  // 機体選択画面(モーダル)　機体をクリック時
  $('#planeSelectModal').on('click', '.modal-body .plane', function () {
    $('.modal-body').find('.plane').removeClass('plane-selected');
    $(this).addClass('plane-selected');
    // OKボタン活性化
    $('#planeSelectModal_btnCommitPlane').prop('disabled', false);
  });

  // 機体選択画面(モーダル)　機体をダブルクリック時
  $('#planeSelectModal').on('dblclick', '.modal-body .plane', () => {
    // 基地航空隊に機体セット
    if ($target.attr('class').indexOf('lb_plane') != -1) setLbPlaneDiv($target, $('.plane-selected'));
    else if ($target.attr('class').indexOf('ship_plane') != -1) setPlaneDiv($target, $('.plane-selected'));

    $('#planeSelectModal').modal('hide');
  });

  // OKボタンクリック(機体選択モーダル内)
  $('#planeSelectModal_btnCommitPlane').on('click', function () {
    if ($(this).prop('disabled')) return false;

    if (!$('.plane-selected').attr('class')) {
      $('#planeSelectModal_btnCommitPlane').prop('disabled', true);
      return false;
    }

    // 基地航空隊に機体セット
    if ($target.attr('class').indexOf('lb_plane') != -1) setLbPlaneDiv($target, $('.plane-selected'));
    else if ($target.attr('class').indexOf('ship_plane') != -1) setPlaneDiv($target, $('.plane-selected'));

    $('#planeSelectModal').modal('hide');
  });

  // はずすボタンクリック(機体選択モーダル内)
  $('#planeSelectModal_btnRemovePlane').on('click', function () {
    if ($(this).prop('disabled')) return false;

    // 選択状況をリセット
    clearPlaneDiv($target);

    $('#planeSelectModal').modal('hide');
  });

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

  // 艦娘名横のはずすをクリック
  $(document).on('click', '.btnRemoveShip', function () {
    clearShipDiv($(this).closest('.ship_tab'));
    $(this).prop('disabled', true);
    caluclate();
  })

  // 艦娘最小化クリック
  $(document).on('click', '.minToggleBtn', function () {
    // todo 最小化時のツールチップ生成
  })

  // 艦娘名をクリック -> 艦娘選択モーダル展開
  $(document).on('click', '.ship_name_span', function () {
    $target = $(this).closest('.ship_tab');
    const selectedID = $target.data('id');
    const $modalBody = $('#shipSelectModal').find('.modal-body');

    // カテゴリ初期選択処理
    if (selectedID) $modalBody.find('.shipType_select').val(shipData.find(v => v.id == selectedID).type).change();
    else $modalBody.find('.shipType_select').val(0).change();

    // 選択艦娘ピックアップ
    if (selectedID) {
      const $selected = $modalBody.find('#' + selectedID)
      $selected.addClass('ship-selected');
      $modalBody.find('tbody').prepend($selected.clone());
      $selected.remove();
      $('#shipSelectModal_btnRemoveShip').prop('disabled', false);
    }
    else {
      $('#shipSelectModal_btnRemoveShip').prop('disabled', true);
    }

    $('#shipSelectModal').modal('show');
  });

  // 艦種変更時 応じた艦娘を table に展開
  $('#shipSelectModal').on('change', '.shipType_select', function () {
    createShipTable($('.ship_table'), [Number($(this).val())]);
  });

  // 艦娘選択画面(モーダル)　艦娘をクリック時
  $('#shipSelectModal').on('click', '.modal-body .ship', function () {
    $('#shipSelectModal').find('.ship').removeClass('ship-selected');
    $(this).addClass('ship-selected');
    // OKボタン活性化
    $('#shipSelectModal_btnCommitShip').prop('disabled', false);
  });

  // 艦娘選択画面(モーダル)　艦娘をダブルクリック時
  $('#shipSelectModal').on('dblclick', '.modal-body .ship', () => {
    // 艦娘セット
    setShipDiv($target, Number($('.ship-selected').attr('id')));

    // 機体選択欄展開
    $target.find('.btn-toggleContent_hide').removeClass('btn-toggleContent_hide').addClass('btn-toggleContent_show')
    $target.find('.ship_tab_main').collapse('show')

    // 次の入力欄表示
    let cur = getParentShipNo($target);
    if (cur) $('#ship_plane_content_' + ++cur).closest('.ship_tab').removeClass('d-none');

    $('#shipSelectModal').modal('hide');
  });

  // 最終改造状態の未表示クリック
  $('#dispFinalOnly').click(() => { createShipTable($('.ship_table'), [Number($('.shipType_select').val())]); })

  // 編成ボタンクリック(艦娘選択モーダル内)
  $('#shipSelectModal_btnCommitShip').on('click', function () {
    if ($(this).prop('disabled')) return false;

    if (!$('.ship-selected').attr('class')) {
      $('#shipSelectModal_btnCommitShip').prop('disabled', true);
      return false;
    }

    // 艦娘セット
    setShipDiv($target, Number($('.ship-selected').attr('id')));

    // 機体選択欄展開
    $target.find('.btn-toggleContent_hide').removeClass('btn-toggleContent_hide').addClass('btn-toggleContent_show')
    $target.find('.ship_tab_main').collapse('show')

    // 次の入力欄展開
    let cur = getParentShipNo($target);
    if (cur) $('#ship_plane_content_' + ++cur).closest('.ship_tab').removeClass('d-none');

    $('#shipSelectModal').modal('hide');
  });

  // はずすボタンクリック(機体選択モーダル内)
  $('#shipSelectModal_btnRemoveShip').on('click', function () {
    if ($(this).prop('disabled')) return false;

    // 選択状況をリセット
    clearShipDiv($target);

    $('#shipSelectModal').modal('hide');
  });

  // 敵艦名をクリック -> 敵艦選択モーダル展開
  $(document).on('click', '.enemy_name_span', function () {
    $target = $(this).closest('.enemy_tab');
    const selectedID = $target.data('id');
    const $modalBody = $('#enemySelectModal').find('.modal-body');

    // カテゴリ初期選択処理
    if (selectedID) $modalBody.find('.enemyType_select').val(enemyData.find(v => v.id == selectedID).type).change();
    else $modalBody.find('.enemyType_select').val(0).change();

    // 選択艦娘ピックアップ
    if (selectedID) {
      const $selected = $modalBody.find('#' + selectedID)
      $selected.addClass('enemy-selected');
      $modalBody.find('tbody').prepend($selected.clone());
      $selected.remove();
      $('#enemySelectModal_btnRemoveShip').prop('disabled', false);
    }
    else {
      $('#enemySelectModal_btnRemoveShip').prop('disabled', true);
    }

    $('#enemySelectModal').modal('show');
  });

  // 敵艦種変更時 応じた敵艦を table に展開
  $('#enemySelectModal').on('change', '.enemyType_select', function () {
    createEnemyTable($('.enemy_table'), [Number($(this).val())]);
  });

  // 設定変更
  $('#dispMoreThan0AA').click(() => { $('.planeSelect_select').change(); });
  $('#dispMoreThanxAASwitch').click(() => { $('.planeSelect_select').change(); });
  $('#dispMoreThanxAA').change(() => { $('.planeSelect_select').change(); });
  $('#innerProfSetting .custom-control-input').click(caluclate);


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
  })
});
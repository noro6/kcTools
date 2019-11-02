/*==================================
    定数
==================================*/
// 入力され得る搭載数の最大値
const MAX_SLOT = 99;

// 自軍st1撃墜テーブル
const SHOOT_DOWN_TABLE = [];

// 上記平均テーブル
const SHOOT_DOWN_TABLE_AVE = [];

// 敵st1撃墜テーブル
const SHOOT_DOWN_TABLE_ENEMY = [];

// 制空状態テーブル
const AIR_STATUS_TABLE = [];

// 熟練を最初からMaxにする機体カテゴリ
const INITIAL_MAX_LEVEL_PLANE = [1, 4, 5, 7, 8, 102, 103];

// 搭載数が基地で最大4の機体カテゴリもとい偵察機
const RECONNAISSANCES = [4, 5, 8, 104];

// シミュレーション最大回数
const MAX_SIMULATE_COUNT = 100000;

// 各種リソース置き場
const RESOURCE_URL = ".";

// 画像置き場 プリロード用
const IMAGES = {};

/*==================================
    グローバル変数
==================================*/

// 各種モーダルの値返却先
let $target = undefined;

// 確認モーダルのモード
let confirmType = undefined;

// 基本の艦載機データ群(基地用ソート済み)
let basicSortedPlanes = [];

// ドラッグ要素範囲外フラグ
let isOut = false;

// 防空モードフラグ
let isDefMode = false;

// 交戦回数
let battleCount = 1;

// 結果表示戦闘
let displayBattle = 1;

// 画面サイズ変更用タイマー
let timer = false;

// 機体プリセット
let planePreset = [];

// 熟練度 >> 選択時、内部熟練度を 120 として計算するもの
let initialProf120Plane = [1, 4, 5, 7, 8, 102, 103, 104];

// 結果チャート用データ
let chartData = null;

// 直近チャートデータ
let prevData = [];

/*==================================
    汎用メソッド
==================================*/

/**
 * arrayとdiffArray内に1つでも同じ値がある場合true
 * @param {Array} array
 * @param {Array} diffArray
 * @returns
 */
function isContain(array, diffArray) {
  for (const value1 of array) for (const value2 of diffArray) if (value1 === value2) return true; return false;
}

/**
 * 配列をシャッフルする (Fisher-Yates shuffle)
 * @param {Array} array
 */
function shuffleArray(array) {
  const length = array.length;
  for (var i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}

/*==================================
    描画用
==================================*/
/**
 * メイン画面初期化処理
 * 初期DOM構築 事前計算 等
 * @param {*} callback
 */
function initialize(callback) {
  let text = '';

  // console.time('initialize');
  // 競合回避
  $.widget.bridge('uibutton', $.ui.button);
  $.widget.bridge('uitooltip', $.ui.tooltip);

  // バージョンチェック
  const localVersion = loadLocalStrage('version');
  const serverVersion = CHANGE_LOG[CHANGE_LOG.length - 1];
  if (!localVersion || localVersion != serverVersion.id) {
    for (const v of serverVersion.changes) text += `<div class="mt-3">・${v}</div>`;

    // 変更通知
    $('#modal_version_inform').find('#version').text(serverVersion.id);
    $('#modal_version_inform').find('.modal-body').html(text);
    $('#modal_version_inform').modal('show');
  }

  // 画像のプリロード
  for (const type of PLANE_TYPE) {
    const img = new Image();
    img.src = './img/type/type' + type.id + '.png';
    IMAGES["type" + type.id] = img;
  }

  // 機体カテゴリ初期化
  setPlaneType($('#planeSelect_select'), PLANE_TYPE.filter(v => v.id > 0).map(v => v.id));

  // デフォ機体群定義
  $('#planeSelect_select').find('option').each(function () {
    basicSortedPlanes = basicSortedPlanes.concat(PLANE_DATA.filter(v => Math.abs(v.type) === Number($(this).val())));
  });

  // 艦種初期化
  $('#shipType_select').empty();
  $('#shipType_select').append('<option value="0">全て</option>');
  setShipType(SHIP_TYPE.filter(v => v.id < 15).map(v => v.id));

  // 敵艦種初期化
  $('#enemyType_select').empty();
  $('#enemyType_select').append('<option value="0">全て</option>');
  setEnemyType(ENEMY_TYPE.filter(v => v.id > 0).map(v => v.id));

  let planes = [];
  $('#planeSelect_select').find('option').each(function () {
    planes = planes.concat(PLANE_DATA.filter(v => Math.abs(v.type) === Number($(this).val())));
  });
  createPlaneTable(planes);
  createShipTable($('.ship_table'), [0]);
  createEnemyTable($('.enemy_table'), [0]);

  // 改修値選択欄生成
  text = '';
  for (let i = 0; i <= 10; i++) {
    if (i === 0) text += '<div class="remodel_item" data-remodel="0" ><i class="fas fa-star"></i>+0</div>';
    else if (i === 10) text += '<div class="remodel_item" data-remodel="10"><i class="fas fa-star"></i>max</div>';
    else text += '<div class="remodel_item" data-remodel="' + i + '"><i class="fas fa-star"></i>+' + i + '</div>';
  }
  $('.remodel_select').next().append(text);

  // 熟練度選択欄
  text = `
  <a class="dropdown-item prof_item"><img class="prof_option prof_yellow" alt=">>" data-prof="7" src="./img/util/prof7.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option prof_yellow" alt="///" data-prof="6" src="./img/util/prof6.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option prof_yellow" alt="//" data-prof="5" src="./img/util/prof5.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option prof_yellow" alt="/" data-prof="4" src="./img/util/prof4.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option prof_blue" alt="|||" data-prof="3" src="./img/util/prof3.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option prof_blue" alt="||" data-prof="2" src="./img/util/prof2.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option prof_blue" alt="|" data-prof="1" src="./img/util/prof1.png"></a>
  <a class="dropdown-item prof_item"><img class="prof_option prof_none" alt="" data-prof="0" src="./img/util/prof0.png"></a>
  `;
  $('.prof_select').next().append(text);

  // 基地航空隊 複製
  $('.lb_tab').html($('#lb_item1').html());
  $('.baseNo').each((i, e) => { $(e).text('第' + (i + 1) + '基地航空隊') });
  // 基地航空隊 第1基地航空隊第1中隊複製
  $('.lb_plane').html($('#lb_item1').find('.lb_plane:first').html());

  // 基地簡易ビュー複製
  text = $('#lb_info_table tbody').html();
  for (let i = 0; i < 2; i++) $('#lb_info_table tbody').append(text);
  $('.lb_info_tr').each((i, e) => {
    $(e).addClass('lb_info_lb_' + (Math.floor(i / 4) + 1));
    $(e).find('.info_name').text('第' + (Math.floor(i / 4) + 1) + '基地航空隊');
  });
  $('#lb_info_table tbody').prepend('<tr class="info_warning"><td colspan="6" class="px-3">全ての航空隊が待機に設定されています。</td></tr>');

  // 艦娘　複製
  $('.ship_tab').html($('.ship_tab:first').html());
  // 艦娘　複製 スロット欄複製
  $('.ship_plane').html($('#friendFleet_item1').find('.ship_plane:first').html());
  // id付けなおす
  $('.ship_tab').each((i, e) => { $(e).attr('id', 'shipNo_' + (i + 1)); });
  // 表示隻数初期化
  $('#display_ship_count').val(2);

  // 敵艦複製
  $('.battle_content').html($('.battle_content:first').html());
  $('.battle_content').each((i, e) => {
    $(e).find('.battle_no').text(i + 1);
    if (i > 0) $(e).addClass('d-none');
  });

  // 戦闘回数初期化
  $('#battle_count').val(1);
  $('#landBase_target').val(1);

  // 海域選択初期化
  $('#world_select').val(1);
  createMapSelect();
  createNodeSelect();

  // 熟練度非活性
  $('.remodel_select').prop('disabled', true);

  // 結果表示バー複製
  $('.progress_area').html($('.progress_area:first').html());
  $('.progress_area').each((i, e) => {
    $(e).find('.result_bar').attr('id', 'result_bar_' + (i + 1))
    if (i < 6) $(e).find('.progress_label').text(`基地${(Math.floor(i / 2) + 1)} ${((i % 2) + 1)}派目`);
    if (i == 6) $(e).find('.progress_label').text('本隊');
    if (i == 7) $(e).find('.progress_label').text('防空');
  });

  // 制空状態割合テーブル複製
  text = $('#rate_table').find('thead').html();
  for (let index = 0; index <= 7; index++) $('#rate_table tbody').append(text);
  $('#rate_table tbody').find('tr').each((i, e) => {
    const lb_num = Math.floor(i / 2) + 1;
    const wave = i % 2 + 1;
    $(e).attr('id', 'rate_row_' + (i + 1));
    if (i < 6) $(e).find('.rate_td_name').text(`第${lb_num}基地航空隊 第${wave}波`);
    else if (i === 6) $(e).find('.rate_td_name').text('本隊');
    else if (i === 7) $(e).find('.rate_td_name').text('防空');

    if (i % 2 === 0) $(e).addClass('rate_tr_border_top');
    else if (i >= 6) $(e).addClass('rate_tr_border_top rate_tr_border_bottom');
  });


  // 撃墜テーブルヘッダフッタ10戦分生成
  text = '';
  let text1 = '';
  let text2 = '';
  let text3 = '';
  for (let index = 1; index <= 10; index++) {
    text += `<td class="td_battle battle${index}">${index}戦目</td>`;
    text1 += `<td class="td_battle battle${index} fap"></td>`;
    text2 += `<td class="td_battle battle${index} eap"></td>`;
    text3 += `<td class="td_battle battle${index} cond"></td>`;
  }
  $('#shoot_down_table').find('.tr_header').append(text + '<td class="td_battle battle_end">出撃後</td>');
  $('.tr_fap').append(text1 + '<td class="td_battle battle_end fap"></td>');
  $('.tr_eap').append(text2 + '<td class="td_battle battle_end eap"></td>');
  $('.tr_cond').append(text3 + '<td class="td_battle battle_end cond"></td>');

  // 詳細設定
  $('.enemy_ap').tooltip('disable')
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="popover"]').popover();

  // localStrage の値を処理
  // 自動計算するかどうかlocalStrageから読み込み　なければ自動計算する
  const autoCaluclate = loadLocalStrage('autoCaluclate');
  if (autoCaluclate !== null) $('#auto_caluclate').prop('checked', autoCaluclate);
  else $('#auto_caluclate').prop('checked', true);
  auto_caluclate_Clicked();

  // シミュレート回数をLocalStrageから読み込み　なければ5000
  const count = loadLocalStrage('simulateCount');
  if (count) $('#calucCount').val(count);
  else $('#calucCount').val(5000);

  // 表示形式をlocalStrageから読み込み　なければ single
  const displayMode = loadLocalStrage('modalDisplayMode');
  if (displayMode) {
    Object.keys(displayMode).forEach((key) => {
      $(`#${key} .toggle_display_type[data-mode="${displayMode[key]}"]`).addClass('selected');
    });
  }
  else $('.toggle_display_type[data-mode="single"]').addClass('selected');

  // 基地欄タブ化するかどうか
  if ($('#lb_tab_select').css('display') != 'none' && $('#lb_item1').attr('class').indexOf('tab-pane') === -1) {
    $('.lb_tab').addClass('tab-pane fade');
    $('.lb_tab:first').addClass('show active');
    $('#lb_item1').addClass('active');
  }

  // 更新履歴
  text = '';
  for (const ver of CHANGE_LOG) {
    text += `<div class="my-2"><span class="pr-3"><u>v${ver.id}</u></span>`;
    if (serverVersion.id === ver.id) text += `<span class="badge badge-pill badge-danger">New</span>`;
    for (const value of ver.changes) text += `<div class="ml-3 font_size_12">・${value}</div>`;
    text += `</div>`;
  }
  $('#site_history_body').html(text);

  // console.timeEnd('initialize');

  // console.time('事前計算');

  // 事前計算 -各種制空値のボーダー配列生成
  const max_ap = 2000;
  for (let i = 0; i <= max_ap; i++) {
    const tmp = [];
    for (let j = 0; j < max_ap; j++) {
      if (i === 0 && j === 0) tmp[j] = 5;
      else if (i >= 3 * j) tmp[j] = 0;
      else if (2 * i >= 3 * j) tmp[j] = 1;
      else if (3 * i > 2 * j) tmp[j] = 2;
      else if (3 * i > j) tmp[j] = 3;
      else tmp[j] = 4;
    }
    AIR_STATUS_TABLE.push(tmp);
  }

  // 自軍撃墜テーブル
  const downRate = [[7, 15], [20, 45], [30, 75], [45, 105], [65, 150]];
  const downRateLen = downRate.length;
  for (let slot = 0; slot <= MAX_SLOT; slot++) {
    const tmpA = [];
    for (let i = 0; i < downRateLen; i++) {
      const tmpB = [];
      for (let j = downRate[i][0]; j <= downRate[i][1]; j++) tmpB.push(Math.floor(slot * j / 256));

      shuffleArray(tmpB);
      tmpA.push(tmpB);
    }
    SHOOT_DOWN_TABLE.push(tmpA);
  }

  // 自軍撃墜テーブル 平均値
  for (let i = 0; i <= MAX_SLOT; i++) {
    SHOOT_DOWN_TABLE_AVE.push(SHOOT_DOWN_TABLE[i].map(v => {
      let sum = 0;
      for (const value of v) sum += value;
      return sum / v.length;
    }));
  }

  // 敵撃墜テーブル
  let enemyMaxSlot = 0;
  const enemyLen = ENEMY_DATA.length;
  for (let i = 0; i < enemyLen; i++) {
    const slotLen = ENEMY_DATA[i].slot.length;
    for (let j = 0; j < slotLen; j++) {
      if (enemyMaxSlot < ENEMY_DATA[i].slot[j]) enemyMaxSlot = ENEMY_DATA[i].slot[j];
    }
  }
  for (let slot = 0; slot <= enemyMaxSlot; slot++) {
    const tmpA = [];
    const airLen = AIR_STATUS.length;
    for (let i = 0; i < airLen; i++) {
      const tmpB = [];
      const rand_max = AIR_STATUS[i].rate;
      for (let x = rand_max; x >= 0; x--) {
        for (let y = 0; y <= rand_max; y++) {
          const value = Math.floor(slot * (0.65 * x + 0.35 * y) / 10);
          tmpB.push(value);
        }
      }

      shuffleArray(tmpB);
      tmpA.push(tmpB);
    }
    SHOOT_DOWN_TABLE_ENEMY.push(tmpA);
  }

  // console.timeEnd('事前計算');
  callback();
}

/**
 * カテゴリコードから艦載機配列を返却
 * @param {number} type
 * @returns {number} 艦載機オブジェクト配列 0を渡した場合は全て
 */
function getPlanes(type) {

  let planes = [];
  if (type === 0) planes = basicSortedPlanes.concat();
  else planes = PLANE_DATA.filter(v => Math.abs(Number(v.type)) === Math.abs(Number(type)));

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
    return Number($shipTab.attr('id').replace(/shipNo_/g, ''));
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
  for (const v of PLANE_TYPE) {
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
  for (const v of SHIP_TYPE) if (array.indexOf(v.id) != -1) html += '<option value="' + v.id + '">' + v.name + '</option>';
  $('#shipType_select').append(html);
}

/**
 * 敵艦種選択欄に、配列から選択可能データを生成
 * @param {Array.<number>} 展開する艦種ID 配列
 */
function setEnemyType(array) {
  let html = '';
  for (const v of ENEMY_TYPE) if (array.indexOf(v.id) != -1) html += '<option value="' + v.id + '">' + v.name + '</option>';
  $('#enemyType_select').append(html);
}

/**
 * 引数で渡された .xx_plane 要素をクリアする
 * @param {JqueryDomObject} $div クリアする .lb_plane .ship_plane
 */
function clearPlaneDiv($div) {
  // 選択状況をリセット
  $div.removeClass(getPlaneCss($div.data('type')));
  $div.removeData();
  $div.find('.plane_img').attr('src', './img/type/undefined.png').attr('alt', '');
  $div.find('.cur_move').removeClass('cur_move');
  $div.find('.drag_handle').removeClass('drag_handle');
  $div.find('.plane_name_span').text('機体を選択');
  $div.find('select').val('0').change();
  $div.find('.remodel_select').prop('disabled', true).addClass('remodel_disabled');
  $div.find('.prof_select').attr('src', RESOURCE_URL + '/img/util/prof0.png').attr('alt', '').data('prof', 0);
  $div.find('.btn_remove_plane').addClass('opacity0');
}

/**
 * 第1引数で渡された lb_plane に第2引数で渡された 機体データ入り要素のデータを挿入する 新規選択時限定
 * @param {JqueryDomObject} $div
 * @param {JqueryDomObject} $original
 */
function setLBPlaneDiv($div, $original) {
  const id = Number($original.data('planeid'));
  const plane = PLANE_DATA.find(v => v.id === id);
  const result = setPlaneDiv($div, $original);

  let slot = Number($original.data('slot'));
  // 搭載数初期値 偵察機系は4
  if (slot >= 0) $div.find('.slot').text(slot);
  else if (RECONNAISSANCES.indexOf(plane.type) != -1) $div.find('.slot').text(4);
  else if (!result) $div.find('.slot').text(0);
  else $div.find('.slot').text(18);
}

/**
 * 第1引数で渡された xx_plane に第2引数で渡された 機体データ入り要素のデータを挿入する
 * @param {JqueryDomObject} $div xx_planeを指定。xxは現状 ship または lb
 * @param {JqueryDomObject} $original 機体情報保持要素、data要素にplaneidを指定する
 * @returns {boolean} 機体データ挿入が成功したかどうか
 */
function setPlaneDiv($div, $original) {
  const id = Number($original.data('planeid'));
  const plane = PLANE_DATA.find(v => v.id === id);

  if (!id) {
    clearPlaneDiv($div);
    return false;
  }
  const type = plane.type;

  if ($div.closest('.ship_tab').attr('class')) {
    let shipId = Number($div.closest('.ship_tab').data('shipid'));
    // 機体が装備できるのかどうかチェック
    if (!checkInvalidPlane((shipId ? shipId : 0), plane)) {
      clearPlaneDiv($div);
      return false;
    }
  }

  $div
    // デザイン
    .removeClass(getPlaneCss($div.data('type')))
    .addClass(getPlaneCss(type))
    // 機体データ取得
    .data('planeid', id)
    .data('type', type);

  $div.find('.plane_name_span').text(plane.abbr ? plane.abbr : plane.name).attr('title', plane.abbr ? plane.name : '');
  $div.find('.plane_img').attr('src', './img/type/type' + plane.type + '.png').attr('alt', plane.type);
  $div.find('.plane_img').parent().addClass('cur_move drag_handle');
  $div.find('.plane_name').addClass('drag_handle');
  $div.find('.btn_remove_plane').removeClass('opacity0');

  // 改修の有効無効設定
  const $remodelInput = $div.find('.remodel_select');
  $remodelInput.prop('disabled', !plane.imp).removeClass('remodel_disabled');
  if ($remodelInput.prop('disabled')) {
    $remodelInput.addClass('remodel_disabled');
    $remodelInput.find('.remodel_value').text(0);
  }

  // 熟練度初期値 戦闘機系は最初から熟練Maxで 陸偵熟練は||
  let prof = 0;
  if (INITIAL_MAX_LEVEL_PLANE.indexOf(Math.abs(type)) != -1) prof = 7;
  else if (id === 312) prof = 2;
  // 特定熟練度を保持していた場合
  if ($original.data('prof')) prof = $original.data('prof');
  $div.find('.prof_select')
    .attr('src', RESOURCE_URL + '/img/util/prof' + prof + '.png')
    .data('prof', prof)
    .removeClass('prof_yellow prof_blue prof_none');
  if (prof > 3) $div.find('.prof_select').addClass('prof_yellow');
  else if (prof > 0) $div.find('.prof_select').addClass('prof_blue');
  else $div.find('.prof_select').addClass('prof_none');

  // 特定の改修値を保持していた場合
  if ($original.data('imp')) $remodelInput.data('remodel', $original.data('imp'));

  return true;
}

/**
 * 第1引数のidの艦娘が第2引数の艦載機を装備できるかどうか
 * 基地ならtrue 艦娘未指定なら基地機体以外true
 * @param {number} shipID 艦娘id(基地航空隊:-1 艦娘未指定:0 艦娘:艦娘id)
 * @param {Object} plane 艦載機オブジェクト data.js参照
 * @returns {boolean} 装備できるなら true
 */
function checkInvalidPlane(shipID, plane) {
  if (shipID === -1) return true;
  if (shipID === 0 && Math.abs(plane.type) > 100) return false;
  else if (shipID === 0) return true;
  const ship = SHIP_DATA.find(v => v.id === shipID);
  const basicCanEquip = LINK_SHIP_EQUIPMENT.find(v => v.type === ship.type);
  const special = SPECIAL_LINK_SHIP_EQUIPMENT.find(v => v.shipId === ship.id);
  let canEquip = [];
  if (basicCanEquip) {
    for (const v of basicCanEquip.e_type) canEquip.push(v);
    if (special) for (const i of special.equipmentTypes) canEquip.push(i);
  }

  // 基本装備可能リストにない場合
  if (canEquip.indexOf(Math.abs(plane.type)) === -1) {
    // 敗者復活 (特別装備可能idに引っかかっていないか)
    if (special && special.equipmentIds.indexOf(plane.id) > -1) return true;
    return false;
  }

  return true;
}

/**
 * 第1引数で渡された .ship_tab に第2引数で渡された 艦娘データを挿入する
 * @param {JqueryDomObject} $div 艦娘タブ (.ship_tab)
 * @param {number} id 艦娘id
 */
function setShipDiv($div, id) {
  const ship = SHIP_DATA.find(v => v.id === id);
  $div.data('shipid', ship.id)
  $div.find('.ship_name_span').text(ship.name);

  $div.find('.ship_plane').each(function (i) {
    const $this = $(this);

    const $plane =
      $('<div>')
        .data('planeid', $this.data('planeid'))
        .data('type', $this.data('type'))
        .data('imp', $this.find('.remodel_select').data('remodel'))
        .data('prof', $this.find('.prof_select').data('prof'));
    // 既に装備されている装備を装備しなおそうとする -> 不適切なら自動的にはずれる
    if ($div.data('shipid')) setPlaneDiv($this, $plane);

    $this.find('.slot').text(0);
    $this.find('.slot_input').attr('max', 99);
    $this.find('.slot_range').attr('max', 99);
    if (i < ship.slot.length) {
      $this.removeClass('d-none').addClass('d-flex');
      $this.find('.slot').text(ship.slot[i]);
      $this.find('.slot_input').attr('max', ship.slot[i]);
      $this.find('.slot_range').attr('max', ship.slot[i]);
    }
    else $this.removeClass('d-flex').addClass('d-none');
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
  $div.find('.ship_plane').each((i, e) => {
    const $this = $(e);
    clearPlaneDiv($this);
    $this.find('.slot').text(0);
    $this.find('.slot_input').attr('max', 99);
    $this.find('.slot_range').attr('max', 99);
    if (i < 4) $this.removeClass('d-none').addClass('d-flex');
    else $this.removeClass('d-flex').addClass('d-none');
  });
}

/**
 * 第1引数で渡された .enemy_content に第2引数で渡されたidの敵艦データを挿入する
 * @param {JqueryDomObject} $div 敵艦タブ (enemy_content)
 * @param {number} id
 */
function setEnemyDiv($div, id) {
  const $parent = $div.parent();
  const enemy = createEnemyObject(id);
  $div.data('enemyid', enemy.id)
  $div.find('.enemy_name_span').html(drawEnemyGradeColor(enemy.name));

  if (enemy.ap > 0) {
    $div.find('.enemy_ap').text(enemy.ap);
  }
  else if (enemy.lbAp > 0) {
    $div.find('.enemy_ap').text('(' + enemy.lbAp + ')');
  }

  if (id === -1) {
    // 直接入力選択時はちょっとレイアウト変更
    $div.find('.enemy_ap').addClass('d-none');
    $div.find('.direct_enemy_ap').removeClass('d-none');
  }
  else {
    $div.find('.enemy_ap').removeClass('d-none');
    $div.find('.direct_enemy_ap').addClass('d-none');
  }

  // 複製の必要あるかどうか
  if (!$div.next().attr('class') && $div.parent().find('.enemy_content').length < 10) {
    // 複製して追加
    const $clone = $div.clone();
    // 複製したやつは初期化
    clearEnemyDiv($clone);
    $div.parent().append($clone);
  }

  // インデックス振り直し
  $parent.find('.enemy_content').each((i, e) => {
    $(e).find('.enemy_index').text(i + 1);
  });
}

/**
 * 指定した enemy_content をクリアする
 * @param {JqueryDomObject} $div クリアする .enemy_content
 */
function clearEnemyDiv($div) {
  const $parent = $div.parent();
  // クリア対象の下にまだenemy_content要素があるなら削除
  if ($div.next().attr('class')) {
    // 一番下の行まで埋まってた場合は、最下部に新規行を挿入
    if ($parent.find('.enemy_content').length === 10 && $parent.find('.enemy_content:last').data('enemyid')) {
      // 複製して追加
      const $clone = $div.clone();
      // 複製したやつは初期化
      clearEnemyDiv($clone);
      $parent.append($clone);
    }
    $div.remove();
  }
  else {
    // 選択状況をリセット
    $div.removeData();
    $div.find('.enemy_name_span').text('敵艦を選択');
    $div.find('.enemy_ap').removeClass('d-none').text(0);
    $div.find('.direct_enemy_ap').addClass('d-none');
    $div.find('.enemy_ap_form').val('0');
  }

  // インデックス振り直し
  $parent.find('.enemy_content').each((i, e) => {
    $(e).find('.enemy_index').text(i + 1);
  });
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
function createPlaneTable(planes) {
  const $modal = $('#modal_plane_select').find('.modal-dialog');
  const $tbody = $('#plane_tbody');
  const target = document.querySelector('#plane_tbody');
  const fragment = document.createDocumentFragment();
  const imgWidth = 25;
  const imgHeight = 25;
  const displayMode = $modal.find('.toggle_display_type.selected').data('mode');

  if (displayMode === "multi") {
    $modal.addClass('modal-xl');
    $tbody.addClass('d-flex flex-wrap');
    $tbody.prev().addClass('d-none').removeClass('d-flex');
  }
  else {
    $modal.removeClass('modal-xl');
    $tbody.removeClass('d-flex flex-wrap');
    $tbody.prev().addClass('d-flex').removeClass('d-none');
  }

  const max_i = planes.length;
  let prevType = 0;
  for (let i = 0; i < max_i; i++) {
    const plane = planes[i];
    const nmAA = plane.AA + 1.5 * plane.IP;
    const defAA = plane.AA + plane.IP + 2.0 * plane.AB;
    const needTooltip = plane.AB > 0 || plane.IP > 0;

    // ラップ
    const $planeDiv = document.createElement('div');
    $planeDiv.className = `plane plane_tr d-flex py-2 py-lg-1${(displayMode === "multi" ? ' tr_multiMode' : '')}`;
    $planeDiv.dataset.planeid = plane.id;
    $planeDiv.dataset.type = plane.type;

    // アイコン用ラッパー
    const $iconDiv = document.createElement('div');
    $iconDiv.className = 'align-self-center size-25';

    // アイコン
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    cvs.width = imgWidth;
    cvs.height = imgHeight;
    ctx.drawImage(IMAGES['type' + plane.type], 0, 0, imgWidth, imgHeight);

    // 機体名
    const $nameDiv = document.createElement('div');
    $nameDiv.className = 'pl-1 plane_td_name align-self-center';
    $nameDiv.textContent = plane.name;

    // 対空
    const $aaDiv = document.createElement('div');
    $aaDiv.className = 'ml-auto plane_td_aa align-self-center ' + (needTooltip ? 'text_existTooltip' : '');
    if (needTooltip) {
      $aaDiv.dataset.toggle = 'tooltip';
      $aaDiv.title = '出撃時:' + nmAA + ' , 防空時:' + defAA;
    }
    $aaDiv.textContent = plane.AA;

    // 半径
    const $rangeDiv = document.createElement('div');
    $rangeDiv.className = 'plane_td_range align-self-center';
    $rangeDiv.textContent = plane.range;

    // 複数表示時カテゴリ分け
    if (displayMode === "multi" && prevType != plane.type) {
      const $type = document.createElement('div');
      $type.className = 'w-100 font_size_12 font_color_777 mt-2';
      $type.textContent = PLANE_TYPE.find(v => v.id === plane.type).name;
      fragment.appendChild($type);
    }

    $iconDiv.appendChild(cvs);
    $planeDiv.appendChild($iconDiv);
    $planeDiv.appendChild($nameDiv);
    if (displayMode === "single") {
      $planeDiv.appendChild($aaDiv);
      $planeDiv.appendChild($rangeDiv);
    }

    fragment.appendChild($planeDiv);
    prevType = plane.type;
  }

  target.innerHTML = '';
  target.appendChild(fragment);

  $tbody.find('.text_existTooltip').tooltip();

  // 機体選択モーダル内のボタン非活性
  $('#modal_plane_select_btn_remove').prop('disabled', true);
}

/**
 * 引数で渡された table 要素(要 tbody )に ship 配列から値を展開
 * @param {JqueryDomObject} $table
 * @param {Array.<number>} type
 */
function createShipTable($table, type) {
  const $modal = $('#modal_ship_select').find('.modal-dialog');
  const $tbody = $table.find('.ship_tbody');
  const c_ship = SHIP_DATA.concat();
  let dispData = [];
  let insertHtml = '';
  let prevType = 0;
  const displayMode = $modal.find('.toggle_display_type.selected').data('mode');

  // 艦種ソート後、改造元idソート
  for (const typeObj of SHIP_TYPE) {
    const tmp = c_ship.filter(v => v.type === typeObj.id);
    tmp.sort((a, b) => a.orig > b.orig ? 1 : a.orig === b.orig ? (a.id > b.id ? 1 : -1) : -1);
    dispData = dispData.concat(tmp);
  }

  if (displayMode === "multi") {
    $modal.addClass('modal-xl');
    $tbody.addClass('d-flex flex-wrap');
    $('.ship_thead').addClass('d-none').removeClass('d-flex');
  }
  else {
    $modal.removeClass('modal-xl');
    $tbody.removeClass('d-flex flex-wrap');
    $('.ship_thead').addClass('d-flex').removeClass('d-none');
  }

  for (const ship of dispData) {
    // 艦種絞り込み
    if (type[0] != 0 && type.indexOf(ship.type) === -1) continue;
    if ($('#dispFinalOnly').prop('checked') && !ship.final) continue;

    let slotText = '<div class="ml-auto ship_td_slot">' + (0 < ship.slot.length ? ship.slot[0] : '') + '</div>';
    for (let index = 1; index < 5; index++) slotText += '<div class="ship_td_slot">' + (index < ship.slot.length ? ship.slot[index] : '') + '</div>';

    // 複数表示時カテゴリ分け
    if (displayMode === "multi" && prevType != ship.type) {
      insertHtml += `
        <div class="w-100 font_size_12 font_color_777 mt-3">
          ${SHIP_TYPE.find(v => v.id === ship.type).name}
        </div>`;
    }

    insertHtml += `
    <div class="ship ship_tr d-flex py-2 py-lg-1${(displayMode === "multi" ? ' tr_multiMode' : '')}" data-shipid="${ship.id}">
        <div class="td_index text-primary font_size_11 align-self-center">${Math.floor(ship.id)}</div>
        <div class="pl-1 ship_td_name align-self-center">${ship.name}</div>
        ${displayMode === "single" ? slotText : ''}
    </div>`;

    prevType = ship.type;
  }
  $tbody.children('div:not(:first)').remove();
  $tbody.append(insertHtml);

  // 艦隊選択モーダル内のボタン非活性
  $('#modal_ship_select_btn_remove').prop('disabled', true);
}

/**
 * 敵艦入力欄を生成
 * @param {number} count 生成する個数
 */
function createEnemyInput(count) {
  battleCount = count;
  $('.battle_content').each((i, e) => {
    if (i < battleCount) $(e).removeClass('d-none');
    else $(e).addClass('d-none');
  });

  // 基地派遣セレクト調整
  $('#landBase_target').find('option').each((i, e) => {
    if (i < battleCount) $(e).prop('disabled', false).removeClass('d-none');
    else $(e).prop('disabled', true).addClass('d-none');
  });
  // 最終戦闘に基地派遣(自動)
  $('#landBase_target').val(battleCount);

  // 結果表示セレクト調整
  $('#display_battle_tab').find('.nav-link').each((i, e) => {
    $(e).removeClass('active');
    if (i < battleCount) $(e).parent().removeClass('d-none');
    else $(e).parent().addClass('d-none');
  });
  $('#display_battle_tab').find('[data-disp="' + battleCount + '"]').addClass('active');
  displayBattle = battleCount;
}

/**
 * 引数で渡された table 要素(要 tbody )に enemy 配列から値を展開
 * @param {JqueryDomObject} $table 展開先テーブル
 * @param {Array.<number>} type type[0] === 0 は全て選択時
 */
function createEnemyTable($table, type) {
  const $modal = $('#modal_enemy_select').find('.modal-dialog');
  const $tbody = $table.find('.enemy_tbody');
  const c_enemy = ENEMY_DATA.concat();
  let dispData = [];
  let insertHtml = '';
  let prevType = 0;
  const displayMode = $modal.find('.toggle_display_type.selected').data('mode');

  // 第1艦種(type[0]行目)順で取得後、無印idソート
  for (const typeObj of ENEMY_TYPE) {
    const tmp = c_enemy.filter(x => x.type[0] === typeObj.id);
    dispData = dispData.concat(tmp.sort((a, b) => a.orig > b.orig ? 1 : a.orig < b.orig ? -1 : a.id - b.id));
  }

  if (displayMode === "multi") {
    $modal.addClass('modal-xl');
    $tbody.addClass('d-flex flex-wrap');
    $('.enemy_thead').addClass('d-none').removeClass('d-flex');
  }
  else {
    $modal.removeClass('modal-xl');
    $tbody.removeClass('d-flex flex-wrap');
    $('.enemy_thead').addClass('d-flex').removeClass('d-none');
  }

  let index = 1;
  for (const enemy of dispData) {
    // 艦種で絞る
    if (type[0] != 0 && !isContain(type, enemy.type)) continue;

    let ap = 0;
    let lbAp = 0;
    const len = enemy.aa.length;
    for (let i = 0; i < len; i++) {
      if (!enemy.isSpR) ap += Math.floor(enemy.aa[i] * Math.sqrt(enemy.slot[i]));
      else lbAp += Math.floor(enemy.aa[i] * Math.sqrt(enemy.slot[i]));
    };
    lbAp += ap;

    // 複数表示時カテゴリ分け
    if (displayMode === "multi" && enemy.id === -1) {
      insertHtml += '<div class="w-100 font_size_12 font_color_777 mt-3">直接入力</div>';
    }
    else if (displayMode === "multi" && prevType != enemy.type[0]) {
      insertHtml += `
      <div class="w-100 font_size_12 font_color_777 mt-3">
        ${ENEMY_TYPE.find(v => v.id === enemy.type[0]).name}
      </div>`;
      prevType = enemy.type[0];
    }

    insertHtml += `
    <div class="enemy enemy_tr d-flex py-2${(displayMode === "multi" ? ' tr_multiMode' : '')}" data-enemyid="${enemy.id}">
      <div class="td_index text-primary font_size_11 align-self-center">${index++}</div>
      <div class="ml-1 enemy_td_name align-self-center">${drawEnemyGradeColor(enemy.name)}</div>
      ${displayMode === "single" ? '<div class="ml-auto enemy_td_ap">' + ap + '</div>' : ''}
      ${displayMode === "single" ? '<div class="enemy_td_lbAp">' + lbAp + '</div>' : ''}
    </div>`;
  }

  $tbody.children('div:not(:first)').remove();
  $tbody.append(insertHtml);

  // 艦隊選択モーダル内のボタン非活性
  $('#modal_enemy_select_btn_remove').prop('disabled', true);
}

/**
 * 結果表示を行う
 */
function drawResult() {
  // 初期化
  $('#rate_table tbody').find('.rate_tr').addClass('d-none');
  $('.progress_area').addClass('d-none').removeClass('d-flex');
  const data = Object.create(chartData);
  const len = data.own.length;
  for (let i = 0; i < len; i++) {
    const ap = data.own[i];
    const eap = data.enemy[i];
    const rates = data.rate[i];
    const border = getAirStatusBorder(eap);
    let status = getAirStatusIndex(ap, eap);
    // 描画対象先の行インデックス 防空8、本隊だけ7、他は連番(0は一応ヘッダのため1から)
    let targetRowIndex = isDefMode ? 8 : len === 1 ? 7 : i + 1;
    const $target_bar = $('#result_bar_' + targetRowIndex);
    const $target_tr = $('#rate_row_' + targetRowIndex);
    let width = 0;
    let visible = false;

    // 制空状態毎に基準widthに対する比率を出す
    if (status == 4) width = ap / border[3] * 100 * 0.1;
    else if (status == 3) width = ap / border[2] * 100 * 0.2;
    else if (status == 2) width = ap / border[1] * 100 * 0.45;
    else if (status <= 1) width = ap / border[0] * 100 * 0.9;

    // 結果表示バーの描画
    const prevStatus = $target_bar.data('airstatus');
    $target_bar
      .removeClass('bar_status' + prevStatus)
      .addClass('bar_status' + status)
      .css({ 'width': (width > 100 ? 100 : width) + '%', })
      .data('airstatus', status);

    // 各制空状態比率の描画
    $target_tr.find('.rate_td_ap').text(ap);
    $target_tr.find('.rate_td_eap').text(eap);
    for (let j = 0; j < rates.length; j++) {
      if (rates[j] > 0) {
        $target_tr.find('.rate_td_status' + j).text(rates[j] + '%');
        visible = true;
      }
      else $target_tr.find('.rate_td_status' + j).text('-');
    }

    // データなしの行はバー、比率ともに非表示
    if (visible || (isDefMode && targetRowIndex === 8)) {
      $target_tr.removeClass('d-none');
      $target_bar.closest('.progress_area').addClass('d-flex').removeClass('d-none');
    }

    // // 基地派遣のあった戦闘は敵制空値修正
    // if (i === Number($('#landBase_target').val())) {
    //   $('#shoot_down_table').find('.eap.battle' + (index + 1)).text(eap);
    //   $('#shoot_down_table').find('.cond.battle' + (index + 1)).text(AIR_STATUS[airStatusIndex].abbr).addClass(airStatusColor);
    // }
  }
}

/**
 * 機体プリセットを生成、展開
 */
function loadPlanePreset() {
  // ローカルストレージ読み込み
  planePreset = loadLocalStrage('planePreset');

  // ローカルストレージに存在しなかった場合初期プリセットを生成
  if (!planePreset) {
    planePreset = [
      { id: 0, name: '陸戦1 陸攻3', planes: [225, 186, 186, 186] },
      { id: 1, name: '陸攻4', planes: [169, 169, 169, 169] },
      { id: 2, name: '防空', planes: [54, 175, 175, 175] },
      { id: 3, name: 'FBA', planes: [94, 100, 157, 54] },
      { id: 4, name: '上位艦戦キャリア', planes: [56, 336, 157, 339] },
    ];
  }

  const parentId = Number($('#modal_plane_preset').data('parentid'));
  let presetText = '';
  const len = planePreset.length;
  for (let index = 0; index < len; index++) {
    const preset = planePreset[index];
    let infoText = `
      <div class="preset_td preset_td_info text-danger cur_help ml-auto" data-toggle="tooltip" data-boundary="window" 
        title="全ての装備が展開できません" data-delay='{"show": 300, "hide": 0}'>
        <i class="fas fa-exclamation-triangle"></i>
      </div>
    `;
    let i = 0;
    for (const planeId of preset.planes) {
      if (checkInvalidPlane(parentId, PLANE_DATA.find(v => v.id === planeId))) {
        infoText = `
        <div class="preset_td preset_td_info text-warning cur_help ml-auto" data-toggle="tooltip" data-boundary="window" 
          title="展開できない装備が含まれています" data-delay='{"show": 300, "hide": 0}'>
          <i class="fas fa-exclamation-triangle"></i>
        </div>
      `;
        i++;
      }
      if (i === preset.planes.length) infoText = '';
    }

    presetText += `
      <div class="preset_tr d-flex px-1 py-2 my-1 w-100 cur_pointer" data-presetid="${preset.id}">
        <div class="preset_td text-primary">${index + 1}.</div>
        <div class="preset_td ml-2">${preset.name}</div>
          ${infoText}
      </div>
    `;
  }

  $('.preset_tr').removeClass('preset_selected');
  $('.preset_tbody').html(presetText);
  $('#preset_preview_name')
    .val('左のプリセット一覧をクリック')
    .prop('disabled', true);
  $('.preset_preview_tbody').html('');
  $('#btn_commit_preset').prop('disabled', true);
  $('#btn_delete_preset').prop('disabled', true);
  $('#btn_expand_preset').prop('disabled', true);
  $('.preset_td_info').tooltip();
}

/**
 * 機体プリセットモーダルに引数のプリセットのプレビューを表示する
 * @param {Object} preset { id:x, name:'', planes:[] }構造のオブジェクト
 */
function drawPlanePresetPreview(preset) {
  let text = '';
  // 展開する機体のリスト
  let planes = [];

  $('#btn_expand_preset').prop('disabled', preset === undefined);
  $('#btn_delete_preset').prop('disabled', preset === undefined);

  if (preset) {
    $('#preset_preview_name').val(preset.name);
    for (const id of preset.planes) planes.push(PLANE_DATA.find(v => v.id === id));
  }
  else {
    // プリセットが見つからなかったので新規登録画面呼び出し
    $('#preset_preview_name').val('');

    $target.find('.' + ($target.attr('class').indexOf('lb_tab') === -1 ? 'ship_plane' : 'lb_plane')).each((i, e) => {
      if ($(e).attr('class').indexOf('d-none') > -1) return;
      const plane = PLANE_DATA.find(v => v.id === $(e).data('planeid'));
      if (plane) planes.push(plane);
    });

    if (planes.length === 0) {
      text = `
      <div class="alert alert-danger px-1">
        <div>機体が装備されていません。</div>
        <div>お手数ですが、一度この画面を閉じ、記録したい装備構成にしてから再度この画面を開いてください。</div>
      </div>
      `;
    }
  }

  const parentId = Number($('#modal_plane_preset').data('parentid'));
  const warningIcon = `
    <div class="preset_preview_td_info ml-2 text-warning cur_help" data-toggle="tooltip" title="展開先に不適合な装備です">
      <i class="fas fa-exclamation-triangle"></i>
    </div>
  `;
  for (const plane of planes) {
    const needWarning = !checkInvalidPlane(parentId, plane);
    text += `
    <div class="preset_preview_tr d-flex justify-content-start border-bottom" data-planeid="`+ plane.id + `">
      <div class="preset_preview_td_type"><img class="img-size-25" src="./img/type/type`+ plane.type + `.png"></div>
      <div class="preset_preview_td_name ml-1 py-2">`+ plane.name + `</div>
      ` + (needWarning ? warningIcon : '') + `
    </div>
    `;
  }

  $('#btn_commit_preset').prop('disabled', true);
  $('#preset_preview_name').prop('disabled', planes.length === 0);
  $('.preset_preview_tbody').html(text);
  $('.preset_preview_td_info').tooltip();
}

/**
 * 機体プリセット更新
 */
function updatePlanePreset() {
  const presetId = Number($('.preset_selected').data('presetid'));
  const planeIds = [];
  $('.preset_preview_tr').each((i, e) => planeIds.push(Number($(e).data('planeid'))));

  let max_id = 0;
  for (const preset of planePreset) if (max_id < preset.id) max_id = preset.id;
  const newPreset = {
    id: (presetId === -1 ? max_id + 1 : presetId),
    name: $('#preset_preview_name').val().replace(/^\s+|\s+$/g, ''),
    planes: planeIds
  }

  planePreset = planePreset.filter(v => v.id != presetId);
  planePreset.push(newPreset);
  planePreset.sort((a, b) => a.id - b.id);
  // ローカルストレージ保存
  saveLocalStrage('planePreset', planePreset);
}

/**
 * 機体プリセット削除
 */
function deletePlanePreset() {
  const presetId = Number($('.preset_selected').data('presetid'));
  planePreset = planePreset.filter(v => v.id != presetId);
  planePreset.sort((a, b) => a.id - b.id);
  // ローカルストレージ保存
  saveLocalStrage('planePreset', planePreset);
}

/**
 * 海域選択欄生成
 */
function createMapSelect() {
  let text = '';
  const world = Number($('#world_select').val());
  const maps = MAP_DATA.filter(v => v.world === world)
  const len = maps.length;
  for (let index = 0; index < len; index++) {
    text += `
      <option value="${maps[index].map}">
        ${world === 99 ? 'E' : world}-${maps[index].map}.${maps[index].name}
      </option>
    `;
  }
  $('#map_select').html(text);
  $('#map_select').change();
  $('#enemy_pattern_tbody').html('');
  $('#btn_expand_enemies').prop('disabled', true);
}

/**
 * マス情報を生成
 */
function createNodeSelect() {
  const world = Number($('#world_select').val());
  const map = Number($('#map_select').val());
  const nodes = ENEMY_PATTERN.filter(v => v.world === world && v.map === map)
  const len = nodes.length;
  let text = '';
  for (let index = 0; index < len; index++) {
    text += `
    <div class="node_tr d-flex px-1 py-2 w-100 cur_pointer" data-node="${nodes[index].name}">
      <div class="align-self-center node_index text-primary">${index + 1}.</div>
      <div class="align-self-center ml-2">${nodes[index].name}</div>
    </div>
  `;
  }
  $('#node_tbody').html(text);
  $('#enemy_pattern_tbody').html('');
  $('#btn_expand_enemies').prop('disabled', true);
}

/**
 * 選択されている海域情報から敵艦隊を表示する
 */
function createEnemyPattern() {
  const world = Number($('#world_select').val());
  const map = Number($('#map_select').val());
  const node = $('.node_selected').data('node');
  const enemies = ENEMY_PATTERN.find(v => v.world === world && v.map === map && v.name === node).enemies;
  const len = enemies.length;
  let text = '';
  for (let index = 0; index < len; index++) {
    const enemy = ENEMY_DATA.find(v => v.id === enemies[index]);
    text += `
      <div class="enemy_pattern_tr mx-2 d-flex border-bottom" data-enemyid="${enemy.id}">
        <div class="enemy_pattern_td enemy_pattern_name align-self-center">
          ${drawEnemyGradeColor(enemy.name)}
        </div>
      </div>
      `;
  }
  $('#enemy_pattern_tbody').html(text);
  $('#btn_expand_enemies').prop('disabled', false);
}

/*==================================
    Web Strage
==================================*/

/**
 * local Strage からデータ取得(Json.parse済)
 * @param {string} key key
 * @returns データ(Json.parse済) 存在しない、または失敗したら null
 */
function loadLocalStrage(key) {
  if (!window.localStorage) return null;
  try {
    return JSON.parse(window.localStorage.getItem(key));
  } catch (error) {
    return null;
  }
}


/**
 * local Strage にデータ格納
 * @param {string} key
 * @param {Object} data 格納する生データ
 * @returns
 */
function saveLocalStrage(key, data) {
  if (!window.localStorage) return false;
  window.localStorage.setItem(key, JSON.stringify(data));
  return true;
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
  // 制空双方2000以下なら事前計算テーブルから制空状態取得
  if (x < 2000 && y < 2000) return AIR_STATUS_TABLE[x][y];
  else {
    const border = getAirStatusBorder(y);
    const len = border.length;
    for (let i = 0; i < len; i++) if (x >= border[i]) return x != 0 ? i : 4;
  }
}

/**
 * 引数の制空値から、必要な制空状態のボーダーを返却
 * @param {number} enemyAp 基準制空値
 * @returns {Array.<number>} 制空状態ボーダーのリスト [確保ボーダー, 優勢ボーダー, ...]
 */
function getAirStatusBorder(enemyAp) {
  if (enemyAp === 0) return [0, 0, 0, 0, 0];
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
  $target = undefined;

  // 自動計算しない場合
  if (!$('#auto_caluclate').prop('checked')) {
    // 準備状態でない場合、準備状態に移行し終了
    if (!$('#btn_caluclate').hasClass('caluclate_ready')) {
      $('#btn_caluclate').addClass('caluclate_ready').removeClass('caluclate_end');
      return true;
    }
    // 準備状態だった場合、シミュレート開始ボタンが押されていなければ終了
    else if (!$('#btn_caluclate').hasClass('caluclate_start')) return true;

    // 待機状態に戻す
    $('#btn_caluclate').removeClass('caluclate_ready caluclate_start').addClass('caluclate_end');
  }

  // 各種オブジェクト生成
  let landBaseData = [];
  let friendFleetData = [];
  let enemyFleetData = [];
  chartData = { own: [], enemy: [], rate: [] };

  // console.time('caluclate');

  // 計算前初期化等
  caluclateInit();

  // 基地情報更新
  // console.time('updateLandBaseInfo');
  updateLandBaseInfo(landBaseData);
  //console.log(landBaseData);
  // console.timeEnd('updateLandBaseInfo');

  // 艦隊情報更新
  // console.time('updateFriendFleetInfo');
  updateFriendFleetInfo(friendFleetData);
  //console.log(friendFleetData);
  // console.timeEnd('updateFriendFleetInfo');

  // 敵艦情報更新
  // console.time('updateEnemyFleetInfo');
  updateEnemyFleetInfo(enemyFleetData);
  //console.log(enemyFleetData);
  // console.timeEnd('updateEnemyFleetInfo');

  // メイン計算
  // console.time('mainCaluclate');
  mainCaluclate(landBaseData, friendFleetData, enemyFleetData);
  // console.timeEnd('mainCaluclate');

  //各状態確率計算
  // console.time('rateCaluclate');
  chartData.rate = rateCaluclate(landBaseData, friendFleetData, enemyFleetData);
  // console.timeEnd('rateCaluclate');

  //console.log(chartData);

  // 結果表示
  // console.time('drawResult');
  drawResult();
  // console.timeEnd('drawResult');
  // console.timeEnd('caluclate');
  // console.log('');

  // 後始末
  landBaseData = null;
  friendFleetData = null;
  enemyFleetData = null;
}

function caluclateInit() {

  // テーブルいったん全てリセット
  $('#ship_info_table tbody').html('');
  $('#shoot_down_table tbody').html('');
  $('#shoot_down_table').find('td').removeClass('airStatus0 airStatus1 airStatus2 airStatus3 airStatus4');

  // 防空時
  if (isDefMode) {
    // 艦娘情報非表示
    $('#ship_info').addClass('d-none');
    $('#shoot_down_table_content').addClass('d-none');
    $('#friendFleet').addClass('d-none');

    // 戦闘回数固定
    $('#battle_count_content').addClass('d-none').removeClass('d-flex');
    $('#battle_count').val(1);
    createEnemyInput(1);
  }
  else {
    $('#ship_info').removeClass('d-none');
    $('#shoot_down_table_content').removeClass('d-none');
    $('#friendFleet').removeClass('d-none');
    $('#battle_count_content').removeClass('d-none').addClass('d-flex');
  }
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
  let ng_range_text = '';

  $('.lb_tab').each((index, element) => {
    const $lb_tab = $(element);
    tmpLbPlanes.length = 0;
    const lbNo = index + 1;
    let tmpLandBaseDatum = { baseNo: lbNo, planes: [], ap: 0, mode: -1 };

    // 基地航空隊 各種制空値表示
    $lb_tab.find('.lb_plane').each((i, e) => {
      const slotNo = i + 1;
      // 基地航空機オブジェクト生成
      const lbPlaneData = createLBPlaneObject($(e), i);
      // 格納
      tmpLandBaseDatum.planes.push(lbPlaneData);

      // 個別表示
      const $lb_slot = $('.lb_info_lb_' + lbNo + '.slot' + slotNo);
      let $target_td = $lb_slot.find('.info_plane');
      let prevAp = 0;
      // 装備名
      const planeName = lbPlaneData.abbr ? lbPlaneData.abbr : lbPlaneData.name;
      $target_td.text(planeName ? planeName : '-');
      // 搭載数
      $target_td = $lb_slot.find('.info_slot');
      prevAp = Number($target_td.text());
      drawChangeValue($target_td, prevAp, lbPlaneData.slot);
      if (!planeName) $target_td.text('');

      // 制空値
      $target_td = $lb_slot.find('.info_ap');
      prevAp = Number($target_td.text());
      drawChangeValue($target_td, prevAp, lbPlaneData.ap);
      if (!planeName) $target_td.text('');

      // 航空隊制空値加算
      tmpLandBaseDatum.ap += lbPlaneData.ap;

      // 出撃コスト加算
      sumFuel += lbPlaneData.id === 0 ? 0 : Math.ceil(lbPlaneData.slot * (lbPlaneData.type === 101 ? 1.5 : 1.0));
      sumAmmo += lbPlaneData.id === 0 ? 0 : lbPlaneData.type === 101 ? Math.floor(lbPlaneData.slot * 0.7) : Math.ceil(lbPlaneData.slot * 0.6);
      sumBauxite += lbPlaneData.cost * (RECONNAISSANCES.indexOf(lbPlaneData.type) === -1 ? 18 : 4);
    });

    // 機体がないなら待機以外選択できないようにしとく
    let isEmpty = true;
    for (const plane of tmpLandBaseDatum.planes) if (plane.id > 0) isEmpty = false;
    if (isEmpty) {
      tmpLandBaseDatum.mode = -1;
      $lb_tab.find('.ohuda_select').val(-1);
      $lb_tab.find('.ohuda_select option').each((i, e) => {
        if (Number($(e).val()) !== -1) $(e).prop('disabled', true);
      });
    }
    else $lb_tab.find('.ohuda_select option').prop('disabled', false);

    // 出撃 or 防空
    tmpLandBaseDatum.mode = Number($lb_tab.find('.ohuda_select').val());

    // 出撃、配備コスト
    const $resourceArea = $lb_tab.find('.resource');
    const $bauxite = $resourceArea.find('.bauxite');
    let $fuel = $resourceArea.find('.fuel');
    let $ammo = $resourceArea.find('.ammo');
    if (tmpLandBaseDatum.mode < 1) {
      sumFuel = 0;
      sumAmmo = 0;
    }
    drawChangeValue($fuel, Number($fuel.text()), sumFuel, true);
    drawChangeValue($ammo, Number($ammo.text()), sumAmmo, true);
    drawChangeValue($bauxite, Number($bauxite.text()), sumBauxite, true);
    sumFuel = 0;
    sumAmmo = 0;
    sumBauxite = 0;

    // 偵察機による補正考慮
    getUpdateLBAirPower(tmpLandBaseDatum);

    // 総制空値
    const $target_lb = $('.lb_info_lb_' + lbNo);
    let $target_td = $target_lb.find('.info_sumAp');
    drawChangeValue($target_td, Number($target_td.text()), tmpLandBaseDatum.ap);
    let $targetSpan = $lb_tab.find('.ap');
    drawChangeValue($targetSpan, Number($targetSpan.text()), tmpLandBaseDatum.ap);

    // 半径
    const range = getRange(tmpLandBaseDatum);
    $target_td = $target_lb.find('.info_range');
    drawChangeValue($target_td, Number($target_td.text()), range);
    $targetSpan = $lb_tab.find('.range');
    drawChangeValue($targetSpan, Number($targetSpan.text()), range);

    // 半径が足りていないなら文言追加
    if (tmpLandBaseDatum.mode > 0) {
      $('#battle_container').find('.enemy_range').each((i, e) => {
        if (i === Number($('#landBase_target').val()) - 1 && range < Number($(e).text())) {
          ng_range_text += (ng_range_text.length ? ',' : '') + (index + 1);
        }
      });
    }

    // 待機部隊は非表示
    if (tmpLandBaseDatum.mode != -1) $target_lb.removeClass('d-none');
    else $target_lb.addClass('d-none');

    // 生成した第X航空隊データを格納
    landBaseData.push(tmpLandBaseDatum);
  });

  // 全部待機かどうか
  const visiblePlaneCount = $('#lb_info_table tbody .lb_info_tr:not(.d-none)').length;
  $('#lb_info').removeClass('col-lg-8 col-xl-7').addClass('col-lg-6');
  if (visiblePlaneCount > 0) {
    $('#lb_info_table tbody').find('.info_defAp').remove();
    if (isDefMode) {
      // 総制空値合計
      let sumAp = 0;
      let sumAp_ex = 0;
      let rocketCount = 0;

      for (const v of landBaseData) {
        sumAp += v.ap;
        for (const plane of v.planes) if ([350, 351, 352].indexOf(plane.id) > -1) rocketCount++;
      }
      // 対重爆時補正 ロケット0機:0.5、1機:0.8、2機:1.1、3機異常:1.2
      sumAp_ex = (rocketCount === 0 ? 0.5 : rocketCount === 1 ? 0.8 : rocketCount === 2 ? 1.1 : 1.3) * sumAp;

      // 防空時は半径の後ろの最終防空時制空値を表示　半径は非表示
      $('#lb_info').addClass('col-lg-8 col-xl-7').removeClass('col-lg-6');
      $('#lb_info_table').find('.info_range').addClass('d-none');
      $('#lb_info_table').find('.info_defAp').removeClass('d-none');
      $('#lb_info_table tbody').find('.lb_info_tr:first').append(`
        <td class="info_defAp" rowspan="${visiblePlaneCount}">${sumAp}</td>
        <td class="info_defAp" rowspan="${visiblePlaneCount}">${Math.floor(sumAp_ex)}</td>
      `);
    }
    else {
      $('#lb_info_table').find('.info_range').removeClass('d-none');
      $('#lb_info_table thead').find('.info_defAp').addClass('d-none');
    }
    $('#lb_info_table .info_warning').addClass('d-none');

    // 半径足りませんよ表示
    $('.ng_range').text(ng_range_text);
    if (ng_range_text.length) $('.lb_range_warning').removeClass('d-none');
    else $('.lb_range_warning').addClass('d-none');
  }
  else $('#lb_info_table .info_warning').removeClass('d-none');
}

/**
 * 基地航空隊 中隊オブジェクト生成
 * @param {JqueryDomObject} $lb_plane 生成元 lb_plane
 * @returns 生成物
 */
function createLBPlaneObject($lb_plane) {
  const id = Number($lb_plane.data('planeid'));
  const type = Number($lb_plane.data('type'));
  // undefined来る可能性あり
  const plane = getPlanes(type).find(v => v.id === id);

  // スロット数不正チェック
  const slotVal = $lb_plane.find('.slot').text();
  let inputSlot = Number(slotVal);
  if (slotVal.length === 0) inputSlot = 0;
  else if (inputSlot > 18) {
    inputSlot = 18;
    $lb_plane.find('.slot').text(inputSlot);
  }
  else if (inputSlot < 0) {
    inputSlot = 0;
    $lb_plane.find('.slot').text(0);
  }

  const lbPlane = {
    id: 0, name: '', abbr: '', type: 0, AA: 0, AB: 0, IP: 0, LOS: 0, ap: 0, range: 999, cost: 0,
    slot: inputSlot,
    imp: Number($lb_plane.find('.remodel_select').data('remodel')),
    level: Number($lb_plane.find('.prof_select').data('prof'))
  }

  if (plane) {
    lbPlane.id = plane.id;
    lbPlane.name = plane.name;
    lbPlane.abbr = plane.abbr;
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
 * 制空値を返す -基地航空隊
 * @param {Object} lb_plane
 * @returns 引数の lb_plane オブジェクトの持つ制空値
 */
function getAirPower_lb(lb_plane) {
  if (lb_plane.id === 0) return 0;
  const type = lb_plane.type;
  const taiku = lb_plane.AA;
  const AB = lb_plane.AB;
  const IP = lb_plane.IP;
  const imp = lb_plane.imp;
  const level = lb_plane.level;
  const slot = lb_plane.slot;

  let sumPower = 0.0;

  // 艦戦 夜戦 水戦 陸戦 局戦
  if ([1, -1, 7, 102, 103].indexOf(type) != -1) {
    //防空時
    if (isDefMode) sumPower = (0.2 * imp + taiku + IP + 2.0 * AB) * Math.sqrt(slot);
    //出撃時
    else sumPower = (0.2 * imp + taiku + 1.5 * IP) * Math.sqrt(slot);

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
    sumPower = 1.0 * (0.25 * imp + taiku) * Math.sqrt(slot);
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
        sumPower += Math.sqrt((initialProf120Plane.indexOf(Math.abs(type)) > -1 ? 120 : 100) / 10);
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
  const apList = [landBaseDatum.ap];
  let reslutAP = landBaseDatum.ap;

  for (const plane of landBaseDatum.planes) {
    // 出撃時補正
    if (!isDefMode && plane.type === 104) {
      // 陸上偵察機補正
      apList.push(baseAP * (plane.LOS === 9 ? 1.18 : plane.LOS === 8 ? 1.15 : 1.00));
    }
    // 防空時補正
    else if (isDefMode) {
      if (plane.type === 104) {
        // 陸上偵察機補正
        apList.push(baseAP * (plane.LOS === 9 ? 1.24 : 1.18));
      }
      else if (plane.type === 4) {
        // 艦上偵察機補正
        apList.push(baseAP * (plane.LOS > 8 ? 1.3 : 1.2));
      }
      else if ([5, 8].indexOf(plane.type) > -1) {
        // 水上偵察機補正
        apList.push(baseAP * (plane.LOS > 8 ? 1.16 : plane.LOS === 8 ? 1.13 : 1.1));
      }
    }
  }
  // 補正が最大だったものに更新
  for (const value of apList) {
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
  else return minRange === 999 ? 0 : minRange;
}

/**
 * 制空値を返す -艦娘
 * @param {Object} plane
 * @returns 引数の plane オブジェクトの持つ制空値
 */
function updateAp(plane) {
  if (plane.id === 0 || !plane.canBattle) return 0;
  // 基本制空値 + ボーナス制空値
  return Math.floor(plane.AA * Math.sqrt(Math.ceil(plane.slot)) + plane.bonusAp);
}


/**
 * 改修値を考慮した対空値を返却
 * @param {Object} plane
 * @param {number} prevAp 補正前の対空値
 * @returns {number} 改修値込みの対空値
 */
function getBonusAA(plane, prevAp) {
  if (plane.id === 0) return 0;
  const type = plane.type;
  const taiku = prevAp;
  const imp = plane.imp;

  let aa = 0.0;

  // 艦戦 夜戦 水戦
  if ([1, -1, 7].indexOf(type) != -1) aa = 0.2 * imp + taiku;
  // 艦爆
  else if ([3].indexOf(type) != -1) aa = 0.25 * imp + taiku;
  // そのた
  else aa = taiku;

  return aa;
}

/**
 * 装備熟練度、内部熟練度による制空ボーナスを返却
 * @returns 制空ボーナス値
 */
function getBonusAp(plane) {
  if (plane.id === 0 || plane.slot === 0) return 0;
  const type = plane.type;
  const level = plane.level;
  let sumPower = 0.0;

  // 艦戦 夜戦 水戦
  if ([1, -1, 7].indexOf(type) != -1) {
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

  // 内部熟練度ボーナス
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
      sumPower += Math.sqrt((initialProf120Plane.indexOf(Math.abs(type)) > -1 ? 120 : 100) / 10);
      break;
    default:
      break;
  }
  return sumPower;
}

/**
 * 艦娘入力情報更新
 * 値の表示と制空値計算も行う
 * @param {Array.<Object>} friendFleetData
 */
function updateFriendFleetInfo(friendFleetData) {
  const tmpFriendFleet = [];
  let fleetAp = 0;

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
    fleetAp += sumAp;

    if (planeCount > 0) {
      // 撃墜テーブル及び情報テーブル生成
      let i = 0;
      let text = '';
      let info_table_text = '';
      let shipId = Number($this.data('shipid')) ? Number($this.data('shipid')) : 0;
      const ship = shipId ? SHIP_DATA.find(v => v.id === shipId) : null;
      // 艦娘が設定されているならその装備枠の数だけ表示 それ以外は入力された装備の数だけ
      if (ship) planeCount = ship.slot.length;

      let shipName_td = `
      <td rowspan="${planeCount}" class="td_name align-middle">
          <div class="td_name_content text-wrap">${ship ? ship.name : '未指定'}</div>
      </td>
      `;

      let info_name_td = `<td class="info_name" rowspan="${planeCount}">${ship ? ship.name : '未指定'}</td>`;
      let info_sumAp_td = `<td class="info_sumAp" rowspan="${planeCount}">${sumAp}</td>`;

      const len = tmpFriendFleet.length;
      for (i = 0; i < len; i++) {
        const plane = tmpFriendFleet[i];
        // 艦娘未指定の場合 搭載数 0 または艦載機未装備 のスロットは表示しない
        if (!ship && (plane.id === 0 || plane.slot === 0)) continue;
        // 艦娘の場合 スロット以上は作らない
        if (ship && i === ship.slot.length) break;

        // 撃墜テーブル 10戦闘分
        let battle_td = '';
        for (let index = 1; index <= 10; index++) {
          battle_td += `<td class="td_battle battle${index} align-middle"></td>`;
        }
        // 撃墜テーブル内容
        text += `
        <tr class="slot${i} shipNo${shipNo}" data-rowindex="${shipNo}">
          ${shipName_td}
          <td class="td_plane_name text-nowrap align-middle">${plane.name}</td>
          ${battle_td}
          <td class="td_battle battle_end align-middle"></td>
        </tr>
        `;
        shipName_td = '';

        // 情報テーブル内容
        info_table_text += `
          <tr class="ship_info_tr slot${i + 1}">
            ${info_name_td}
            <td class="info_plane">${plane.name}</td>
            <td class="info_slot">${plane.slot}</td>
            <td class="info_ap">${plane.ap}</td>
            ${info_sumAp_td}
            </tr>
        `;
        info_name_td = '';
        info_sumAp_td = '';
      }
      $('#shoot_down_table_tbody').append(text);
      $('#ship_info_table tbody').append(info_table_text);
      // 最下部のtdに下線
      $('#ship_info_table tbody tr:last()').find('td').addClass('last_slot');
    }
    else if ($('#shoot_down_table_tbody tr').length === 0) {
      let battle_td = '';
      for (let index = 1; index <= 10; index++) battle_td += `<td class="td_battle battle${index} align-middle"></td>`;
      let text = `
        <tr class="slot0 shipNo0">
          <td class="td_name align-middle">
            <div class="td_name_content">未選択</div>
          </td>
          <td class="td_plane_name text-nowrap align-middle text-center">-</td>
            ${battle_td}
          <td class="td_battle battle_end align-middle"></td>
        </tr>
      `;
      $('#shoot_down_table_tbody').append(text);
    }

    // 代入
    if (exist) friendFleetData.push(tmpFriendFleet.concat());
  });

  const rowsCount = $('#ship_info_table tbody tr').length;
  if (rowsCount) {
    // 艦娘情報テーブル　艦隊総制空値列追加
    let fleetApText = `<td class="info_fleetAp" rowspan="${rowsCount}">${fleetAp}</td>`;
    $('.ship_info_tr:first()').append(fleetApText);
  }
  else $('#ship_info_table tbody').append('<tr class="info_warning"><td colspan="6" class="px-3">装備、搭載数が設定されていません。</td></tr>');
}


/**
 * 艦娘 装備オブジェクト生成
 * @param {JqueryDomObject} $ship_plane 生成元 ship_plane
 * @param {number} shipNo 何隻目の艦か
 * @param {number} index 何番目のスロか
 * @returns 生成物
 */
function createFleetPlaneObject($ship_plane, shipNo, index) {
  const id = Number($ship_plane.data('planeid'));
  const type = Number($ship_plane.data('type') ? $ship_plane.data('type') : 0);
  // undefined来る可能性あり
  const plane = getPlanes(type).find(v => v.id === id);

  // スロット数不正チェック
  const raw = $ship_plane.find('.slot').text();
  let inputSlot = Number(raw);

  if (raw.length === 0) inputSlot = 0;
  else if (inputSlot > MAX_SLOT) {
    inputSlot = MAX_SLOT;
    // スロット数表示修正
    $ship_plane.find('.slot').text(inputSlot);
  }
  else if (inputSlot < 0) {
    inputSlot = 0;
    // スロット数表示修正
    $ship_plane.find('.slot').text(inputSlot);
  }

  const shipPlane = {
    fleetNo: shipNo,
    slotNo: index,
    id: 0, name: '-', type: 0, AA: 0, ap: 0, bonusAp: 0, canBattle: true,
    imp: Number($ship_plane.find('.remodel_select').data('remodel')),
    level: Number($ship_plane.find('.prof_select').data('prof')),
    slot: inputSlot,
    origSlot: inputSlot,
    origAp: 0,
  }

  if (plane) {
    shipPlane.id = plane.id;
    shipPlane.name = !plane.abbr ? plane.name : plane.abbr;
    shipPlane.type = plane.type;
    shipPlane.canBattle = RECONNAISSANCES.indexOf(plane.type) === -1;
    shipPlane.AA = getBonusAA(shipPlane, plane.AA);
    shipPlane.bonusAp = getBonusAp(shipPlane);
    shipPlane.ap = updateAp(shipPlane);
    shipPlane.origAp = shipPlane.ap;
  }

  return shipPlane;
}

/**
 * 指定した艦隊の総制空値を返す
 * @param {Array.<Object>} friendFleetData
 * @returns 総制空値
 */
function getFriendFleetAP(friendFleetData) {
  let sumAP = 0;
  const max_i = friendFleetData.length;
  for (let i = 0; i < max_i; i++) {
    const ships = friendFleetData[i];
    const max_j = ships.length;
    for (let j = 0; j < max_j; j++) sumAP += ships[j].ap;
  }
  return sumAP;
}

/**
 * 敵艦隊入力情報更新
 * @param {Array.<Object>} enemyFleetData
 */
function updateEnemyFleetInfo(enemyFleetData) {
  let tmpEnemyFleet = [];
  let sumAp = 0;
  let sumLBAp = 0;

  $('.battle_content').each(function () {

    // 非表示なら飛ばす
    if ($(this).attr('class').indexOf('d-none') > -1) return;

    tmpEnemyFleet = [];
    sumAp = 0;
    sumLBAp = 0;

    // 敵情報取得
    $(this).find('.enemy_content').each(function () {
      const enemyId = $(this).data('enemyid');
      if (isNaN(enemyId)) return true;
      const tmpEnemy = createEnemyObject(enemyId);

      // 直接入力の制空値を代入
      if (enemyId === -1) {
        const directAP = $(this).find('.enemy_ap_form').val();
        // 直接制空値不正チェック
        let inputAp = Number(directAP);
        if (directAP.length === 0) inputAp = 0;
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
      sumLBAp += tmpEnemy.lbAp;
    });

    // 制空値表示
    let $enmAp = $(this).find('.enemy_sum_ap');
    drawChangeValue($enmAp, $enmAp.text(), sumAp, true);
    $enmAp = $(this).find('.enemy_sum_lbap');
    drawChangeValue($enmAp, $enmAp.text(), sumLBAp, true);
    $enmAp = $(this).find('.enemy_range');
    if (!Number($enmAp.text())) $enmAp.addClass('font_color_ccc');
    else $enmAp.removeClass('font_color_ccc');

    enemyFleetData.push(tmpEnemyFleet);
  });
}

/**
 * 引数の id から敵オブジェクトを生成
 * @param {number} id 敵ID  -1 の場合は直接入力とする
 * @returns {Object} 敵オブジェクト
 */
function createEnemyObject(id) {
  const tmp = ENEMY_DATA.find(v => v.id === id);
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

/**
 * 指定した敵艦隊オブジェクトの総制空値を返す(基地)
 * @param {Array.<Object>} enemyFleet
 * @returns 総制空値(基地)
 */
function getEnemyFleetLBAP(enemyFleet) {
  let sumAP = 0;
  const i_max = enemyFleet.length;
  for (let i = 0; i < i_max; i++) {
    sumAP += enemyFleet[i].lbAp;
  }
  return sumAP;
}

/**
 * 指定した敵艦隊オブジェクトの総制空値を返す(通常)
 * @param {Array.<Object>} enemyFleet
 * @returns 総制空値
 */
function getEnemyFleetAP(enemyFleet) {
  let sumAP = 0;
  const i_max = enemyFleet.length;
  for (let i = 0; i < i_max; i++) {
    sumAP += enemyFleet[i].ap;
  }
  return sumAP;
}

/**
 * 敵機撃墜処理(チャート表示用 中央値固定)
 * @param {number} airStatus 制空状態
 * @param {Array.<Object>} enemyFleet 撃墜される敵
 */
function shootDownHalf(airStatus, enemyFleet) {
  for (const enemy of enemyFleet) {
    enemy.slots.forEach((slot, i) => {
      enemy.slots[i] = Math.ceil(slot) - getShootDownSlotHalf(airStatus, slot);
    })
    updateEnemyAp(enemy);
  }
}

/**
 * 敵機撃墜処理 (繰り返し用)
 * @param {number} airStatusIndex 制空状態
 * @param {Array.<Object>} enemyFleet 撃墜対象の敵艦隊
 */
function shootDownEnemy(airStatusIndex, enemyFleet) {
  const max_i = enemyFleet.length;
  for (let i = 0; i < max_i; i++) {
    const enemy = enemyFleet[i];
    const max_j = enemy.slots.length;
    for (let j = 0; j < max_j; j++) {
      let slot = enemy.slots[j];
      enemy.slots[j] -= getShootDownSlot(airStatusIndex, slot);
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
  // 撃墜テーブルから撃墜数を取得
  const range = SHOOT_DOWN_TABLE_ENEMY[slot][airStateIndex].length;
  return SHOOT_DOWN_TABLE_ENEMY[slot][airStateIndex][Math.floor(Math.random() * range)];
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜率は中央値固定
 * @param {Number} airStateIndex 制空状態インデックス
 * @param {Number} slot 撃墜前搭載数
 * @returns {Number} 撃墜後搭載数
 */
function getShootDownSlotHalf(airStateIndex, slot) {
  const avg_rate = AIR_STATUS[airStateIndex].rate / 2;
  return slot * (0.65 * avg_rate + 0.35 * avg_rate) / 10;
}

/**
 * 指定された敵オブジェクトが持つ制空値を再計算する
 * @param {Object} enemy 再計算する敵オブジェクト
 */
function updateEnemyAp(enemy) {
  if (enemy.id === -1) return;
  enemy.ap = 0;
  enemy.lbAp = 0;
  const max_i = enemy.aa.length
  for (let i = 0; i < max_i; i++) {
    if (!enemy.isSpR) enemy.ap += Math.floor(enemy.aa[i] * Math.sqrt(Math.floor(enemy.slots[i])));
    else enemy.lbAp += Math.floor(enemy.aa[i] * Math.sqrt(Math.floor(enemy.slots[i])));
  }
  enemy.lbAp += enemy.ap;
}

/**
 * 道中被撃墜(中央値,チャート用)
 * @param {Array.<Object>} friendFleetData 味方艦隊
 * @param {number} eap 敵制空値
 * @param {number} index 何戦目か
 */
function shootDownHalfFriend(friendFleetData, eap, index) {
  let ap = getFriendFleetAP(friendFleetData);
  const airStatusIndex = getAirStatusIndex(ap, eap);
  const airStatusColor = 'airStatus' + airStatusIndex;
  // 彼我制空
  $('#shoot_down_table').find('.fap.battle' + (index + 1)).text(ap);
  $('#shoot_down_table').find('.eap.battle' + (index + 1)).text(eap);
  $('#shoot_down_table').find('.cond.battle' + (index + 1)).text(AIR_STATUS[airStatusIndex].abbr).addClass(airStatusColor);
  for (const ship of friendFleetData) {
    for (const plane of ship) {
      // 直前の搭載数をテーブルに反映
      $('#shoot_down_table_tbody')
        .find('.shipNo' + plane.fleetNo + '.slot' + plane.slotNo + ' .battle' + (index + 1))
        .text(plane.id > 0 ? Math.ceil(plane.slot) : '');
      if (plane.slot === 0 || !plane.canBattle) continue;
      let slot = plane.slot;
      plane.slot -= getShootDownSlotHalfFF(airStatusIndex, slot);
      plane.ap = updateAp(plane);
    }
  }
}

/**
 * 道中被撃墜
 * @param {number} airStatusIndex 制空状態
 * @param {Array.<Object>} friendFleetData 味方艦隊
 */
function shootDownFriend(airStatusIndex, friendFleetData) {
  const len = friendFleetData.length
  for (let i = 0; i < len; i++) {
    const ship = friendFleetData[i];
    const shipLen = ship.length;
    for (let j = 0; j < shipLen; j++) {
      const plane = ship[j];
      if (plane.slot === 0 || !plane.canBattle) continue;
      let slot = plane.slot;
      plane.slot -= getShootDownSlotFF(airStatusIndex, slot);
      plane.ap = updateAp(plane);
    }
  }
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜数はランダム
 * @param {Number} airStateIndex 制空状態インデックス
 * @param {Number} slot 撃墜前搭載数
 * @returns {Number} 撃墜後搭載数(整数)
 */
function getShootDownSlotFF(airStateIndex, slot) {
  // 撃墜テーブルから撃墜数を取得
  const range = SHOOT_DOWN_TABLE[slot][airStateIndex].length;
  return SHOOT_DOWN_TABLE[slot][airStateIndex][Math.floor(Math.random() * range)];
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜率は中央値固定
 * @param {Number} airStateIndex 制空状態インデックス
 * @param {Number} slot 撃墜前搭載数
 * @returns {Number} 撃墜後搭載数(小数があり得る)
 */
function getShootDownSlotHalfFF(airStateIndex, slot) {
  return SHOOT_DOWN_TABLE_AVE[Math.ceil(slot)][airStateIndex];
}

/**
 * メイン計算処理
 */
function mainCaluclate(landBaseData, friendFleetData, enemyFleetData) {
  // 計算する戦闘 (配列のindexとして使うので表示値 - 1)
  let mainBattle = (displayBattle - 1);
  let lbAttackBattle = (Number($('#landBase_target').val()) - 1);

  mainBattle = mainBattle < enemyFleetData.length ? mainBattle : enemyFleetData.length - 1;

  let eap = 0;

  // 防空モードの時は完全に別
  if (isDefMode) {
    let sumAP = 0;
    const enemyFleet = enemyFleetData[lbAttackBattle].concat();
    for (let index = 0; index < 3; index++) if (landBaseData[index].mode != -1) sumAP += landBaseData[index].ap;
    chartData.own.push(sumAP);
    chartData.enemy.push(getEnemyFleetAP(enemyFleet));
  }
  else {
    // 撃墜テーブルの関係ない戦闘を非表示に(5戦目まではレイアウトがダサいので出す)
    $('#shoot_down_table').find('td').removeClass('d-none');
    for (let index = battleCount + 1; index <= 10; index++) {
      if (index <= 5) continue;
      $('#shoot_down_table').find('.battle' + index).addClass('d-none');
    }

    // 全ての戦闘回す
    for (let battle = 0; battle < battleCount; battle++) {
      const enemyFleet = enemyFleetData[battle];
      // 基地航空隊を派遣した戦闘
      if (battle === lbAttackBattle) {
        // 基地航空隊による制空削りを行う
        caluclateLandBasePhase(landBaseData, enemyFleet, mainBattle === lbAttackBattle);
      }

      // 計算結果に詳細表示する戦闘
      if (battle === mainBattle) {
        fap = getFriendFleetAP(friendFleetData);
        eap = getEnemyFleetAP(enemyFleet);
        chartData.own.push(fap);
        chartData.enemy.push(eap);
      }

      // st1撃墜
      shootDownHalfFriend(friendFleetData, getEnemyFleetAP(enemyFleet), battle);
    }

    // 出撃リザルト
    $('#shoot_down_table').find('.fap.battle_end').text(getFriendFleetAP(friendFleetData));
    for (const ship of friendFleetData) {
      for (const plane of ship) {
        $('#shoot_down_table_tbody')
          .find('.shipNo' + plane.fleetNo + '.slot' + plane.slotNo + ' .battle_end')
          .text(plane.id > 0 ? Math.ceil(plane.slot) : '');
      }
    }
  }
}

/**
 * 指定された敵艦隊に対して基地攻撃を行う
 * @param {*} landBaseData 基地データ
 * @param {*} enemyFleet 被害者の会
 * @param {boolean} needChart チャート描画用のデータが必要かどうか
 */
function caluclateLandBasePhase(landBaseData, enemyFleet, needChart) {
  for (let index = 0; index < 3; index++) {
    let lbAp = landBaseData[index].ap;
    if (landBaseData[index].mode > 0) {
      // 第一波
      const elbap = getEnemyFleetLBAP(enemyFleet);
      if (needChart) {
        chartData.own.push(lbAp);
      }
      shootDownHalf(getAirStatusIndex(lbAp, elbap), enemyFleet);
    }
    else if (needChart) {
      // 待機なので空データ挿入
      chartData.own.push(0);
    }

    if (landBaseData[index].mode === 2) {
      // 第二波
      const elbap = getEnemyFleetLBAP(enemyFleet);
      if (needChart) {
        chartData.own.push(lbAp);
      }
      shootDownHalf(getAirStatusIndex(lbAp, elbap), enemyFleet);
    }
    else if (needChart) {
      // 単発なので空データ挿入
      chartData.own.push(0);
    }
  }
}

/**
 * 各種制空状態確率計算
 * @returns {Array.<Object>} 各種制空状態確率
 */
function rateCaluclate(landBaseData, friendFleetData, enemyFleetData) {
  let maxCount = 1;
  // 計算回数取得
  if (Number($('#calucCount').val())) {
    maxCount = Number($('#calucCount').val());
  }
  else $('#calucCount').val(1);
  // 計算する戦闘
  let mainBattle = (displayBattle - 1);
  let lbAttackBattle = (Number($('#landBase_target').val()) - 1);
  const shipCache = friendFleetData.concat();
  let enemyApDist = [0, 0, 0, 0, 0, 0, 0];
  let returnDist = [];
  const lbDist = [];
  const mainDist = [0, 0, 0, 0, 0, 0];
  const lbAps = [];
  const lbModes = [];

  mainBattle = mainBattle < enemyFleetData.length ? mainBattle : enemyFleetData.length - 1;
  for (let i = 0; i < 6; i++) lbDist.push([0, 0, 0, 0, 0, 0]);
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

    // 結果表示戦闘まで道中含めてブン回す
    for (let battle = 0; battle <= mainBattle; battle++) {
      const enemyFleet = enemyFleetData[battle].concat();

      if (battle === lbAttackBattle) {
        // 基地に撃墜されていた敵機補給
        for (const enemy of enemyFleet) {
          enemy.slots = enemy.orgSlots.concat();
          updateEnemyAp(enemy);
        }

        // 基地航空隊による敵攻撃
        for (let j = 0; j < 3; j++) {
          let lbAp = lbAps[j];

          if (lbModes[j] > 0) {
            // 第一波
            let wave1 = j * 2;
            const eap = getEnemyFleetLBAP(enemyFleet);
            enemyApDist[wave1] += eap;
            const airStatusIndex = getAirStatusIndex(lbAp, eap)
            if (lbAttackBattle === mainBattle) lbDist[wave1][airStatusIndex]++;
            shootDownEnemy(airStatusIndex, enemyFleet);
          }

          if (lbModes[j] === 2) {
            // 第二波
            let wave2 = j * 2 + 1;
            const eap = getEnemyFleetLBAP(enemyFleet);
            enemyApDist[wave2] += eap;
            const airStatusIndex = getAirStatusIndex(lbAp, eap);
            if (lbAttackBattle === mainBattle) lbDist[wave2][airStatusIndex]++;
            shootDownEnemy(airStatusIndex, enemyFleet);
          }
        }
      }

      if (battle === mainBattle) {
        const eap = getEnemyFleetAP(enemyFleet);
        enemyApDist[6] += eap;
        mainDist[getAirStatusIndex(getFriendFleetAP(shipCache), eap)]++;
      }
      else {
        // st1撃墜
        shootDownFriend(getAirStatusIndex(getFriendFleetAP(shipCache), getEnemyFleetAP(enemyFleet)), shipCache);
      }
    }
  }

  // 基地を派遣した戦闘だった場合、基地の結果を放り込む
  if (lbAttackBattle === mainBattle) {
    returnDist = lbDist.concat();
  }
  returnDist.push(mainDist);

  for (const wave of returnDist) {
    const len = wave.length;
    for (let index = 0; index < len; index++) {
      wave[index] = Math.floor(wave[index] / maxCount * 10000) / 100;
    }
  }

  chartData.enemy = enemyApDist.map(v => Math.round(v / maxCount));
  if (isDefMode) chartData.enemy[0] = chartData.enemy[6];

  return returnDist;
}

/*==================================
    イベント処理
==================================*/

/**
 * シミュレート開始ボタンクリック
 */
function btn_caluclate_Clicked() {
  // 準備状態だった場合のみ計算開始とする
  const $this = $('#btn_caluclate');
  if ($this.hasClass('caluclate_ready')) {
    $this.addClass('caluclate_start');
    caluclate();
  }
}

/**
 * サイドバークリック時
 * @param {JqueryDomObject} $this 
 */
function sidebar_Clicked($this) {
  const speed = 300;
  const href = $this.attr("href");
  const target = $(href === "#" || href === "" ? 'html' : href);
  const position = target.offset().top - 60;
  $('body,html').animate({ scrollTop: position }, speed, 'swing');
  return false;
}

/**
 * 大コンテンツ入れ替えモード起動ボタンクリック時
 */
function btn_content_trade_Clicked() {
  $('body,html').animate({ scrollTop: 0 }, 200, 'swing');
  $('.btn_content_trade').addClass('d-none').removeClass('d-table');
  $('.btn_commit_trade').addClass('d-table').removeClass('d-none');
  $('.btn_cllapse').addClass('d-none').removeClass('d-table');
  // 開始時にいったん全部最小化、handle追加
  $('.collapse_content').each(function () {
    $(this).parent().addClass('trade_enabled');
    if ($(this).attr('class').indexOf('show') != -1) {
      $(this).addClass('tmpHide').collapse('hide');
    }
  });
}

/**
 * 大コンテンツ入れ替え処理終了時
 */
function main_contents_Sortable_End() {
  const org = [];
  const $parent = $('#li_index');
  $parent.find('li').each((i, e) => { org.push($(e).clone()) });
  $parent.empty();
  $('#main_contents > div').each((i, e) => {
    for (const $target of org) {
      if ($target.attr('id') === 'li_' + $(e).attr('id')) {
        $parent.append($target);
        continue;
      }
    }
  });
}

/**
 * 大コンテンツ入れ替え完了クリック時
 */
function commit_content_order() {
  // 動作中はキャンセル
  if ($('#landBase_content').hasClass('collapsing')) return false;

  // 一時閉じていたやつは終了時に展開 -> 機体ドラッグ時位置ずれバグあり　要検証
  $('.tmpHide').collapse('show');
  // handle解除
  $('.trade_enabled').removeClass('trade_enabled');
  $('.btn_content_trade').removeClass('d-none').addClass('d-table');
  $('.btn_commit_trade').removeClass('d-table').addClass('d-none');
  $('.btn_cllapse').removeClass('d-none').addClass('d-table');
}

/**
 * 基地航空隊出撃札変更時
 * @param {JqueryDomObject} $this
 */
function ohuda_Changed($this) {
  const ohudaValue = Number($this.val());
  if (ohudaValue === 0) {
    // 防空モード開始
    isDefMode = true;
    // 出撃中の部隊は防空に
    $('.ohuda_select').each((i, event) => { if (Number($(event).val()) > 0) $(event).val(0); })
  }
  else if (ohudaValue > 0) {
    // 防空モード終了
    isDefMode = false;
    // 防空中の部隊は集中に
    $('.ohuda_select').each((i, event) => { if (Number($(event).val()) === 0) $(event).val(2); })
  }

  caluclate();
}

/**
 * 改修値変更時
 * @param {JqueryDomObject} $this
 */
function remodelSelect_Changed($this) {
  const remodel = $this.find('.remodel_item_selected').data('remodel');
  $this.removeClass('remodel_item_selected');
  $this.find('.remodel_select').data('remodel', remodel);
  $this.find('.remodel_value').text(remodel);
  caluclate();
}

/**
 * 熟練度変更時
 * @param {JqueryDomObject} $this
 */
function proficiency_Changed($this) {
  const $orig = $this.find('.prof_option');
  const $targetSelect = $this.parent().prev();
  const prof = $orig.data('prof');
  $targetSelect
    .attr('src', $orig.attr('src'))
    .attr('alt', $orig.attr('alt'))
    .data('prof', prof)
    .removeClass('prof_yellow prof_blue prof_none');
  if (prof > 3) $targetSelect.addClass('prof_yellow');
  else if (prof > 0) $targetSelect.addClass('prof_blue');
  else $targetSelect.addClass('prof_none');
  caluclate();
}

/**
 * 搭載数調整欄展開時
 * @param {JqueryDomObject} $this
 */
function slot_select_parent_Show($this) {
  const preSlot = Number($this.find('.slot').text());
  $this.find('.slot_input').val(preSlot);
  $this.find('.slot_range').val(preSlot);
}

/**
 * 搭載数調整欄 レンジバー変更時
 * @param {JqueryDomObject} $this
 */
function slot_range_Changed($this) {
  $this.closest('.slot_select_parent').find('.slot').text($this.val());
  $this.prev().val($this.val());
}
/**
 * 搭載数調整欄 搭載数入力欄変更時
 * @param {JqueryDomObject} $this
 */
function slot_input_Changed($this) {
  // 入力検証 -> 数値 かつ 0 以上 max 以下　違ってたら修正
  const value = $this.val();
  const max = Number($this.attr('max'));
  const regex = new RegExp(/^[0-9]+$/);

  if (!regex.test(value)) $this.val(0);
  else if (value > max) $this.val(max);
  else if (value > 0) $this.val(Number(value));

  $this.closest('.slot_select_parent').find('.slot').text(value);
  $this.next().val(value);
}

/**
 * 搭載数調整欄終了時
 * @param {JqueryDomObject} $this
 */
function slot_select_parent_Close($this) {
  $this.find('.slot').text($this.find('.slot_input').val());
  caluclate();
}

/**
 * 基地リセットボタン押下時
 * @param {JqueryDomObject} $this
 */
function btn_reset_landBase_Clicked($this) {
  $this.closest('.lb_tab').find('.lb_plane').each((i, e) => {
    $(e).find('.slot').text(0);
    clearPlaneDiv($(e));
  });
  $this.blur();
  caluclate();
}

/**
 * 基地航空隊 機体ドラッグ終了時
 * @param {JqueryDomObject} $this
 */
function lb_plane_DragEnd($this) {
  const $plane = $this.closest('.lb_plane');
  if (isOut) {
    // 選択状況をリセット
    clearPlaneDiv($plane);
    $plane.css('opacity', '0.0');
    isOut = false;
  }
  $plane.animate({ 'opacity': '1.0' }, 500);
  caluclate();
}

/**
 * 基地欄へ機体ドロップ時
 * @param {JqueryDomObject} $this
 * @param {*} ui
 */
function lb_plane_Drop($this, ui) {
  const $original = ui.draggable;
  const $insertdiv =
    $('<div>')
      .data('planeid', $original.data('planeid'))
      .data('type', $original.data('type'))
      .data('imp', $original.find('.remodel_select').data('remodel'))
      .data('prof', $original.find('.prof_select').data('prof'))
      .data('slot', $original.find('.slot').text());
  const $destination =
    $('<div>')
      .data('planeid', $this.data('planeid'))
      .data('type', $this.data('type'))
      .data('imp', $this.find('.remodel_select').data('remodel'))
      .data('prof', $this.find('.prof_select').data('prof'))
      .data('slot', $this.find('.slot').text());

  setLBPlaneDiv($this, $insertdiv);
  if (!$('#copy_plane').prop('checked')) setLBPlaneDiv($original, $destination);
}

/**
 * 艦娘リセットボタン押下時
 * @param {JqueryDomObject} $this
 */
function btn_reset_ship_Clicked($this) {
  clearShipDiv($this.closest('.ship_tab'));
  caluclate();
}

/**
 * 艦娘 機体ドラッグ開始時
 * @param {*} ui
 */
function ship_plane_DragStart(ui) {
  $(ui.helper)
    .addClass('ship_plane ' + getPlaneCss(Number($(ui.helper).find('.plane_img').attr('alt'))))
    .css('width', 320);
  $(ui.helper).find('.slot_select_parent').remove();
  $(ui.helper).find('.btn_remove_plane').remove();
  $(ui.helper).find('.prof_select_parent').addClass('mr-2');
}

/**
 * 艦娘 機体ドラッグ終了時
 * @param {JqueryDomObject} $this
 */
function ship_plane_DragEnd($this) {
  const $plane = $this.closest('.ship_plane');
  if (isOut) {
    // 選択状況をリセット
    clearPlaneDiv($plane);
    $plane.css('opacity', '0.0');
    isOut = false;
  }
  $plane.animate({ 'opacity': '1.0' }, 500);

  caluclate();
}

/**
 * 艦娘 機体がドロップ対象上に位置
 * @param {JqueryDomObject} $this ドロップ対象 (!= ドラッグ中機体)
 * @param {*} ui
 */
function ship_plane_DragOver($this, ui) {
  const $original = ui.draggable.closest('.ship_plane');
  const shipID = Number($this.closest('.ship_tab').data('shipid'));
  const planeID = Number($original.data('planeid'));
  const type = Number($original.data('type'));
  // 挿入先が装備不可だった場合暗くする
  if (shipID && planeID && type && !checkInvalidPlane(shipID, getPlanes(type).find(v => v.id === planeID))) {
    ui.helper.stop().animate({ 'opacity': '0.2' }, 100);
    $this.removeClass('ship_plane-hover');
    isOut = true;
  }
  else {
    ui.helper.stop().animate({ 'opacity': '1.0' }, 100);
    isOut = false;
  }
}

/**
 * 艦娘欄へ機体ドロップ時
 * @param {JqueryDomObject} $this
 * @param {*} ui
 */
function ship_plane_Drop($this, ui) {
  // 機体入れ替え
  if (ui.draggable.closest('.ship_plane').data('planeid')) {
    const $original = ui.draggable.closest('.ship_plane');
    const $insertdiv =
      $('<div>')
        .data('planeid', $original.data('planeid'))
        .data('type', $original.data('type'))
        .data('imp', $original.find('.remodel_select').data('remodel'))
        .data('prof', $original.find('.prof_select').data('prof'));
    const $destination =
      $('<div>')
        .data('planeid', $this.data('planeid'))
        .data('type', $this.data('type'))
        .data('imp', $this.find('.remodel_select').data('remodel'))
        .data('prof', $this.find('.prof_select').data('prof'));

    // 挿入先が装備不可だった場合中止
    let shipID = Number($this.closest('.ship_tab').data('shipid'));
    let planeID = Number($insertdiv.data('planeid'));
    let type = Number($insertdiv.data('type'));
    if (shipID && planeID && type && !checkInvalidPlane(shipID, getPlanes(type).find(v => v.id === planeID))) return;
    // 挿入OK
    setPlaneDiv($this, $insertdiv);
    if (!$('#copy_plane').prop('checked')) setPlaneDiv($original, $destination);
  }
}

/**
 * 敵制空値直接入力時
 * @param {JqueryDomObject} $this
 */
function enemy_ap_form_Input($this) {
  // 入力検証 -> 数値 かつ 0 以上 9999 以下　違ってたら勝手に0にして続行　空白は据え置く(0扱い)
  const value = $this.val();
  const regex = new RegExp(/^[0-9]+$/);
  if (value.length > 0 && !regex.test(value)) $this.val(0);
  caluclate();
}

/**
 * 機体選択欄 機体カテゴリ変更時
 * @param {JqueryDomObject} $this
 */
function planeTypeSelect_Changed($this) {
  // 選択時のカテゴリ
  let selectedType = Number($this.val());
  // ベース機体一覧
  let org = getPlanes(selectedType);

  // 現状のカテゴリ
  let dispType = [];
  $this.find('option').each(function () { dispType.push(Number($(this).val())); })

  // 特定の艦娘が選ばれている場合の調整
  if ($target && $target.attr('class').indexOf('ship_plane') != -1 && $target.closest('.ship_tab').data('shipid')) {
    const ship = SHIP_DATA.find(v => v.id === $target.closest('.ship_tab').data('shipid'));
    const basicCanEquip = LINK_SHIP_EQUIPMENT.find(v => v.type === ship.type);
    const special = SPECIAL_LINK_SHIP_EQUIPMENT.find(v => v.shipId === ship.id);
    dispType = basicCanEquip.e_type.concat();

    // 試製景雲削除
    org = org.filter(v => v.id != 151);

    // 特別装備可能な装備カテゴリ対応
    if (special && special.equipmentTypes.length > 0) dispType = dispType.concat(special.equipmentTypes);

    // 特別装備可能な装備対応
    if (special && special.equipmentIds.length > 0) {
      let addPlane = {};
      for (const id of special.equipmentIds) {
        addPlane = PLANE_DATA.find(v => v.id === id);
        dispType.push(addPlane.type);

        // もしまだ追加されてないなら追加
        if (!org.find(v => v.id === id)) org.push(addPlane);
      }
    }

    // 重複を切る
    dispType = dispType.filter((x, i, self) => self.indexOf(x) === i);
    dispType.sort((a, b) => a - b);

    // 装備可能カテゴリ表示変更
    setPlaneType($this, dispType)
    $this.val(selectedType);
  }

  // カテゴリ一覧にないもの除外
  org = org.filter(v => dispType.indexOf(Math.abs(v.type)) > -1);

  // ソート反映
  const $target_table_div = $('.plane_table_content');
  const sorted = $target_table_div.find('.sorted');
  const displayMode = $('#modal_plane_select').find('.toggle_display_type.selected').data('mode');
  if (displayMode === 'single' && sorted.data('order')) {
    const isAsc = sorted.data('order').indexOf('asc') != -1;
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
  createPlaneTable(org);
}

/**
 * 基地機体はずすボタンクリック時
 * @param {JqueryDomObject} $this
 */
function btn_remove_lb_plane_Clicked($this) {
  clearPlaneDiv($this.closest('.lb_plane'));
  caluclate();
}

/**
 * 機体選択欄 ヘッダクリック時
 * @param {JqueryDomObject} $this
 */
function plane_thead_Clicked($this) {
  const sortKey = $this.attr('id');
  const order = $this.data('order');
  const nextOrder = order === 'asc' ? 'desc' : 'asc';

  // 順序反転
  $('.plane_thead div').removeClass('sorted');
  $('.plane_thead').find('.fas:not(.fa-sort)').addClass('d-none');
  $('.plane_thead').find('.fa-sort').removeClass('d-none');
  $this.parent().find('div').removeData();

  if (sortKey != 'th_default') {
    $this
      .data('order', nextOrder)
      .addClass('sorted');
    $this.find('.fas:first')
      .removeClass('d-none fa-sort-' + (order === 'asc' ? 'up' : 'down'))
      .addClass('fa-sort-' + (order === 'asc' ? 'down' : 'up'));
    $this.find('.fa-sort').addClass('d-none');
  }

  // 再度カテゴリ検索をかけて反映する
  $('#planeSelect_select').change();
}

/**
 * 各種選択欄　表示形式クリック時
 * @param {JqueryDomObject} $this
 */
function toggle_display_type_Clicked($this) {
  const $parentModal = $this.closest('.modal');
  $parentModal.find('.toggle_display_type').removeClass('selected');
  $this.addClass('selected');

  let saveDate = loadLocalStrage('modalDisplayMode');
  if (!saveDate) {
    saveDate = {
      'modal_plane_select': 'single',
      'modal_ship_select': 'single',
      'modal_enemy_select': 'single'
    };
  }

  saveDate[$parentModal.attr('id')] = $this.data('mode');
  saveLocalStrage('modalDisplayMode', saveDate);
  $parentModal.find('select').change();
}

/**
 * 機体名クリック時 (モーダル展開処理)
 * @param {JqueryDomObject} $this
 */
function plane_name_Clicked($this) {
  // 機体選択画面の結果を返却するターゲットのdiv要素を取得
  $target = $this.closest('.lb_plane');
  if (!$target.attr('class')) $target = $this.closest('.ship_plane');

  const selectedID = Number($target.data('planeid'));
  let selectedType = $target.data('type');
  selectedType = (!selectedType ? 0 : Math.abs(Number(selectedType)));
  const $modalBody = $('#modal_plane_select').find('.modal-body');

  let prevTypeId = $('#planeSelect_select').val();

  if ($target.attr('class').indexOf('ship_plane') != -1) {
    // 艦娘から展開した場合、陸上機は非表示とし、選択されていたら全てにする
    selectedType = selectedType > 99 ? 0 : selectedType;
    $modalBody.find('#optg_lb').remove();
    if (prevTypeId > 100) prevTypeId = 0;
  }
  else {
    // 機体カテゴリ一覧初期化
    setPlaneType($('#planeSelect_select'), PLANE_TYPE.filter(v => v.id > 0).map(v => v.id));
  }

  $('#planeSelect_select').val(prevTypeId).change();
  $('#modal_plane_select_btn_remove').prop('disabled', selectedID > 0);
  $('#modal_plane_select').modal('show');
}

/**
 * モーダル内機体選択時
 * @param {JqueryDomObject} $this
 */
function modal_plane_Selected($this) {
  if ($target.attr('class').indexOf('lb_plane') != -1) {
    // 基地航空隊に機体セット
    setLBPlaneDiv($target, $this);
    // お札が待機になってるなら集中または防空に変更
    $target.closest('.lb_tab').find('.ohuda_select').val(isDefMode ? 0 : 2);
  }
  // 艦娘に機体セット
  else if ($target.attr('class').indexOf('ship_plane') != -1) setPlaneDiv($target, $this);

  $('#modal_plane_select').modal('hide');
}

/**
 * モーダル内機体はずすクリック時
 * @param {JqueryDomObject} $this
 */
function modal_plane_select_btn_remove_Clicked($this) {
  if ($this.prop('disabled')) return false;
  clearPlaneDiv($target);
  $('#modal_plane_select').modal('hide');
}

/**
 * 機体プリセット展開クリック時
 * @param {JqueryDomObject} $this
 */
function btn_plane_preset_Clicked($this) {
  let parentId = -1;
  $target = $this.closest('.lb_tab');
  if (!$target.attr('class')) {
    // 艦娘が展開先である場合
    $target = $this.closest('.ship_tab');
    parentId = $target.data('shipid') ? Number($target.data('shipid')) : 0;
  }
  $('#modal_plane_preset').data('parentid', parentId);
  loadPlanePreset();
  $('#modal_plane_preset').modal('show');
  $this.blur();
}

/**
 * 機体プリセット内 プリセット一覧名クリック
 * @param {JqueryDomObject} $this
 */
function preset_tr_Clicked($this) {
  const preset = planePreset.find(v => v.id === Number($this.data('presetid')));
  $('.preset_tr').removeClass('preset_selected');
  $this.addClass('preset_selected');
  drawPlanePresetPreview(preset);
}

/**
 * 機体プリセット内 プリセット名変更時
 * @param {JqueryDomObject} $this
 */
function preset_preview_name_Changed($this) {
  if ($('#btn_commit_preset').prop('disabled')) $('#btn_commit_preset').prop('disabled', false);
  if ($this.val().length === 0) $('#btn_commit_preset').prop('disabled', true);
}

/**
 * 機体プリセット内 プリセット保存クリック時
 * @param {JqueryDomObject} $this
 */
function btn_commit_preset_Clicked($this) {
  $this.prop('disabled', true);
  // プリセット変更 & 保存
  updatePlanePreset();
  loadPlanePreset();
}

/**
 * 機体プリセット内 プリセット削除クリック時
 * @param {JqueryDomObject} $this
 */
function btn_delete_preset_Clicked($this) {
  $this.prop('disabled', true);
  deletePlanePreset();
  loadPlanePreset();
}

/**
 * 機体プリセット内 プリセット展開クリック時
 */
function btn_expand_preset_Clicked() {
  const presetId = Number($('.preset_selected').data('presetid'));
  const preset = planePreset.find(v => v.id === presetId);
  if (preset) {
    // プリセット展開
    if ($target.attr('class').indexOf('lb_tab') != -1) {
      $target.find('.lb_plane').each((i, e) => setLBPlaneDiv($(e), $('<div>').data('planeid', preset.planes[i])));
      // お札が待機になってるなら集中または防空に変更
      $target.find('.ohuda_select').val(isDefMode ? 0 : 2);
    }
    else {
      $target.find('.ship_plane').each((i, e) => {
        setPlaneDiv($(e), $('<div>').data('planeid', preset.planes[i]));
      });
    }
  }
  $('#modal_plane_preset').modal('hide');
}

/**
 * 表示隻数変更時
 * @param {JqueryDomObject} $this
 */
function display_ship_count_Changed($this) {
  const displayCount = $this.val();
  $this.closest('.friendFleet_tab').find('.ship_tab').each((i, e) => {
    if (i < displayCount) $(e).removeClass('d-none');
    else $(e).addClass('d-none');
  });

  caluclate();
}

/**
 * 艦娘機体はずすボタンクリック時
 * @param {JqueryDomObject} $this
 */
function btn_remove_ship_plane_Clicked($this) {
  clearPlaneDiv($this.closest('.ship_plane'));
  caluclate();
}

/**
 * 艦娘一覧モーダル展開クリック時
 * @param {JqueryDomObject} $this
 */
function ship_name_span_Clicked($this) {
  $target = $this.closest('.ship_tab');
  const selectedID = $target.data('shipid');

  // 選択艦娘がいるなら
  if (selectedID) {
    $('#modal_ship_select_btn_remove').prop('disabled', false);
  }
  else $('#modal_ship_select_btn_remove').prop('disabled', true);
  $('#shipType_select').change();
  $('#modal_ship_select').modal('show');
}

/**
 * 艦娘一覧モーダル 艦娘クリック時
 * @param {JqueryDomObject} $this
 */
function modal_ship_Selected($this) {
  setShipDiv($target, Number($this.data('shipid')));
  $('#modal_ship_select').modal('hide');
}

/**
 * 艦娘一覧モーダルはずすクリック時
 * @param {JqueryDomObject} $this
 */
function modal_ship_select_btn_remove_Clicked($this) {
  if ($this.prop('disabled')) return false;
  clearShipDiv($target);
  $('#modal_ship_select').modal('hide');
}

/**
 * 戦闘回数変更時
 * @param {JqueryDomObject} $this
 */
function battle_count_Changed($this) {
  // 敵入力欄生成
  createEnemyInput(Number($this.val()));
  caluclate();
}

/**
 * 戦闘回数変更時
 * @param {JqueryDomObject} $this
 */
function btn_reset_battle_Clicked($this) {
  const $tmp = $this.closest('.battle_content');
  $tmp.find('.enemy_content:not(:first)').remove();
  clearEnemyDiv($tmp.find('.enemy_content'));
  $this.blur();
  caluclate();
}

/**
 * 敵艦名クリック時
 * @param {JqueryDomObject} $this
 */
function enemy_name_Clicked($this) {
  $target = $this.closest('.enemy_content');
  const selectedID = $target.data('enemyid');
  $('#enemyType_select').change();
  if (selectedID) $('#modal_enemy_select_btn_remove').prop('disabled', false);
  else $('#modal_enemy_select_btn_remove').prop('disabled', true);
  $('#modal_enemy_select').modal('show');
}

/**
 * 敵一覧モーダル 敵艦名クリック時
 * @param {JqueryDomObject} $this
 */
function modal_enemy_Selected($this) {
  // 敵艦セット
  setEnemyDiv($target, Number($this.data('enemyid')));
  $('#modal_enemy_select').modal('hide');
}

/**
 * 敵一覧モーダル 敵はずすクリック時
 * @param {JqueryDomObject} $this
 */
function modal_enemy_select_btn_remove($this) {
  if ($this.prop('disabled')) return false;
  // 選択状況をリセット
  clearEnemyDiv($target);
  $('#modal_enemy_select').modal('hide');
}

/**
 * 海域一覧クリック時
 * @param {JqueryDomObject} $this
 */
function btn_enemy_preset_Clicked($this) {
  $target = $this.closest('.battle_content');
  $('#modal_enemy_pattern').modal('show');
  $this.blur();
}

/**
 * 敵編成一覧名クリック時
 * @param {JqueryDomObject} $this
 */
function node_tr_Clicked($this) {
  $('.node_tr').removeClass('node_selected');
  $this.addClass('node_selected');
  createEnemyPattern();
}

/**
 * 敵編成展開クリック時
 */
function btn_expand_enemies() {
  const world = Number($('#world_select').val());
  const map = Number($('#map_select').val());
  const node = $('.node_selected').data('node');
  const pattern = ENEMY_PATTERN.find(v => v.world === world && v.map === map && v.name === node);
  const enemies = pattern.enemies;

  // 元の敵編成解除
  $target.find('.enemy_content:not(:first)').remove();
  clearEnemyDiv($target.find('.enemy_content'));

  // 敵展開
  for (const id of enemies) setEnemyDiv($target.find('.enemy_content:last()'), id);
  // 半径
  $target.find('.enemy_range').text(pattern.range);

  $('#modal_enemy_pattern').modal('hide');
}

/**
 * 撃墜表マウスin
 * @param {JqueryDomObject} $this
 */
function shoot_down_table_tbody_MouseEnter($this) {
  const rowIndex = Number($this.closest('tr').data('rowindex'));
  $this.closest('tr').addClass('bg-light');
  $('#shoot_down_table_tbody').find('.shipNo' + rowIndex + ':first').find('.td_name').addClass('bg-light');
}

/**
 * 撃墜表マウスleave
 * @param {JqueryDomObject} $this
 */
function shoot_down_table_tbody_MouseLeave($this) {
  const rowIndex = Number($this.closest('tr').data('rowindex'));
  $this.closest('tr').removeClass('bg-light');
  $('#shoot_down_table_tbody').find('.shipNo' + rowIndex + ':first').find('.td_name').removeClass('bg-light');
}

/**
 * グラフマウスin
 * @param {JqueryDomObject} $this
 */
function progress_area_MouseEnter($this) {
  const $bar = $this.find('.result_bar');
  const status = Number($bar.data('airstatus'));
  const rowIndex = Number($bar.attr('id').replace('result_bar_', ''));
  if (status !== NaN) {
    $bar.addClass('bar_ex_status' + status);
    $('#rate_row_' + rowIndex).addClass('bg_status' + status);
  }
}

/**
 * グラフマウスleave
 * @param {JqueryDomObject} $this
 */
function progress_area_MouseLeave($this) {
  const $bar = $this.find('.result_bar');
  const status = Number($bar.data('airstatus'));
  const rowIndex = Number($bar.attr('id').replace('result_bar_', ''));
  if (status !== NaN) {
    $bar.removeClass('bar_ex_status' + status);
    $('#rate_row_' + rowIndex).removeClass('bg_status' + status);
  }
}

/**
 * 表示戦闘タブ変更時
 * @param {JqueryDomObject} $this
 */
function display_battle_tab_Changed($this) {
  displayBattle = Number($this.find('.nav-link').data('disp'));
  caluclate();
}

/**
 * 内部熟練度120計算機体カテゴリ変更時
 * @param {JqueryDomObject} $this
 */
function innerProfSetting_Clicked($this) {
  const clickedType = Number($this.attr('id').replace('prof120_', ''));
  if ($this.prop('checked') && initialProf120Plane.indexOf(clickedType) === -1) initialProf120Plane.push(clickedType);
  else if (!$this.prop('checked') && initialProf120Plane.indexOf(clickedType) != -1) initialProf120Plane = initialProf120Plane.filter(v => v != clickedType);
  caluclate();
}

/**
 * シミュレート回数変更時
 * @param {JqueryDomObject} $this
 */
function calucCount_Changed($this) {
  // 入力検証 -> 数値 かつ 0 以上 max 以下　違ってたら修正
  const value = $this.val();
  const max = MAX_SIMULATE_COUNT;
  const min = 0;
  const regex = new RegExp(/^[0-9]+$/);

  if (!regex.test(value)) $this.val(min);
  else if (value > max) $this.val(max);
  else if (value < min) $this.val(min);
  else if (value > 0) $this.val(Number(value));

  // ローカルストレージへ保存
  saveLocalStrage('simulateCount', $this.val());
}

/**
 * 自動計算チェックボックス変更時
 */
function auto_caluclate_Clicked() {
  if ($('#auto_caluclate').prop('checked')) $('#btn_caluclate').addClass('d-none');
  else $('#btn_caluclate').removeClass('d-none');

  saveLocalStrage('autoCaluclate', $('#auto_caluclate').prop('checked'));
}

/**
 * 設定削除クリック時
 */
function btn_reset_localStrage_Clicked() {
  const $modal = $('#modal_confirm');
  $modal.find('.modal-body').html(`
    <div>ブラウザに保存されている、以下の設定を削除します。</div>
    <div class="mt-3 ml-2">・装備プリセット情報</div>
    <div class="ml-2">・その他UI情報（シミュレート回数、装備一覧などの表示形式、etc...）</div>
    <div class="mt-3">よろしければ、OKボタンを押してください。</div>
  `);
  confirmType = "deleteLocalStrage";
  $modal.modal('show');
}

/**
 * 確認ダイアログOKボタンクリック時
 */
function modal_confirm_ok_Clicked() {
  switch (confirmType) {
    case "deleteLocalStrage":
      window.localStorage.clear();
      break;
    default:
      break;
  }
  confirmType = undefined;
  $('#modal_confirm').modal('hide');
}

/**
 * スマホメニュー展開時
 */
function menu_small_Clicked() {
  $('#modal_smart_menu').find('.modal-body').html($('#Navbar').html());
  $('#modal_smart_menu').find('.mt-5').removeClass('mt-5').addClass('mt-3');
  $('#modal_smart_menu').modal('show');
}

/**
 * スマホメニューから移動
 * @param {JqueryDomObject} $this
 */
function smart_menu_modal_link_Clicked($this) {
  const speed = 300;
  const href = $this.attr("href");
  const target = $(href === "#" || href === "" ? 'html' : href);
  const position = target.offset().top - 60;
  $('body,html').animate({ scrollTop: position }, speed, 'swing');
  setTimeout(() => { $('#modal_smart_menu').modal('hide'); }, 220);
  return false;
}

/*==================================
    イベントハンドラ
==================================*/
$(function () {
  // 画面初期化
  initialize(() => {
    $('#loading_back').fadeOut(400);
    caluclate();
  });

  $(window).keyup(function (e) { if (e.keyCode === 17) $('#copy_plane').prop('checked', !$('#copy_plane').prop('checked')); });
  $('.modal').on('hide.bs.modal', caluclate);
  $('.modal').on('show.bs.modal', function () { $('.btn_preset').tooltip('hide') });
  $('.slot_select_parent').on('show.bs.dropdown', function () { slot_select_parent_Show($(this)); });
  $('.slot_select_parent').on('hide.bs.dropdown', function () { slot_select_parent_Close($(this)); });
  $('.remodel_select_parent').on('show.bs.dropdown', function () { $(this).find('.remodel_item_selected').removeClass('remodel_item_selected'); });
  $('.remodel_select_parent').on('hide.bs.dropdown', function () { remodelSelect_Changed($(this)); });
  $('#modal_version_inform').on('hide.bs.modal', () => { if ($('#alreadyRead').prop('checked')) saveLocalStrage('version', $('#version').text()); });
  $(document).on('show.bs.collapse', '.collapse', function () { $(this).prev().find('.fa-chevron-up').removeClass('fa-chevron-up').addClass('fa-chevron-down'); });
  $(document).on('hide.bs.collapse', '.collapse', function () { $(this).prev().find('.fa-chevron-down').removeClass('fa-chevron-down').addClass('fa-chevron-up'); });
  $(document).on('shown.bs.collapse', '.collapse', function () { $(this).removeClass('tmpHide'); });
  $(document).on('click', '#btn_caluclate', btn_caluclate_Clicked);
  $(document).on('focus', '.slot_input', function () { $(this).select(); });
  $(document).on('input', '.slot_input', function () { slot_input_Changed($(this)); });
  $(document).on('input', '.slot_range', function () { slot_range_Changed($(this)); });
  $(document).on('click', '.remodel_item', function () { $(this).addClass('remodel_item_selected'); });
  $(document).on('click', '.prof_item', function () { proficiency_Changed($(this)); });
  $(document).on('click', '.plane_name', function () { plane_name_Clicked($(this)); });
  $(document).on('click', '.btn_plane_preset', function () { btn_plane_preset_Clicked($(this)); });
  $(document).on('click', '.sidebar-sticky a[href^="#"]', function () { sidebar_Clicked($(this)); });
  $(document).on('click', '.toggle_display_type', function () { toggle_display_type_Clicked($(this)); });
  $(document).on('click', '.btn_content_trade', btn_content_trade_Clicked);
  $(document).on('click', '.btn_commit_trade', commit_content_order);
  $('#landBase_content').on('change', '.ohuda_select', function () { ohuda_Changed($(this)); });
  $('#landBase_content').on('click', '.btn_remove_plane', function () { btn_remove_lb_plane_Clicked($(this)); });
  $('#landBase_content').on('click', '.btn_reset_landBase', function () { btn_reset_landBase_Clicked($(this)); });
  $('#friendFleet_content').on('change', '.display_ship_count', function () { display_ship_count_Changed($(this)); });
  $('#friendFleet_content').on('click', '.btn_reset_ship', function () { btn_reset_ship_Clicked($(this)); });
  $('#friendFleet_content').on('click', '.ship_name_span', function () { ship_name_span_Clicked($(this)); });
  $('#friendFleet_content').on('click', '.btn_remove_plane', function () { btn_remove_ship_plane_Clicked($(this)); });
  $('#enemyFleet_content').on('focus', '.enemy_ap_form', function () { $(this).select(); });
  $('#enemyFleet_content').on('input', '.enemy_ap_form', function () { enemy_ap_form_Input($(this)); });
  $('#enemyFleet_content').on('click', '.enemy_name', function () { enemy_name_Clicked($(this)); });
  $('#enemyFleet_content').on('click', '.btn_reset_battle', function () { btn_reset_battle_Clicked($(this)); });
  $('#enemyFleet_content').on('click', '.btn_enemy_preset', function () { btn_enemy_preset_Clicked($(this)); });
  $('#enemyFleet_content').on('change', '#battle_count', function () { battle_count_Changed($(this)); });
  $('#enemyFleet_content').on('change', '#landBase_target', caluclate);
  $('#result_content').on('click', '#display_battle_tab .nav-item', function () { display_battle_tab_Changed($(this)); });
  $('#config_content').on('focus', '#calucCount', function () { $(this).select(); });
  $('#config_content').on('input', '#calucCount', function () { calucCount_Changed($(this)); });
  $('#config_content').on('click', '#btn_reset_localStrage', btn_reset_localStrage_Clicked);
  $('#config_content').on('click', '#innerProfSetting .custom-control-input', function () { innerProfSetting_Clicked($(this)); });
  $('#config_content').on('click', '#auto_caluclate', auto_caluclate_Clicked);
  $('#modal_plane_select').on('click', '.plane', function () { modal_plane_Selected($(this)); });
  $('#modal_plane_select').on('click', '.btn_remove', function () { modal_plane_select_btn_remove_Clicked($(this)); });
  $('#modal_plane_select').on('click', '.plane_thead div', function () { plane_thead_Clicked($(this)); });
  $('#modal_plane_select').on('change', '#planeSelect_select', function () { planeTypeSelect_Changed($(this)); });
  $('#modal_plane_preset').on('input', '#preset_preview_name', function () { preset_preview_name_Changed($(this)); });
  $('#modal_plane_preset').on('click', '.preset_tr', function () { preset_tr_Clicked($(this)); });
  $('#modal_plane_preset').on('click', '.btn_commit_preset', function () { btn_commit_preset_Clicked($(this)); });
  $('#modal_plane_preset').on('click', '.btn_delete_preset', function () { btn_delete_preset_Clicked($(this)); });
  $('#modal_plane_preset').on('click', '.btn_expand_preset', btn_expand_preset_Clicked);
  $('#modal_ship_select').on('change', '#shipType_select', function () { createShipTable($('.ship_table'), [Number($(this).val())]); });
  $('#modal_ship_select').on('click', '.ship', function () { modal_ship_Selected($(this)); });
  $('#modal_ship_select').on('click', '.btn_remove', function () { modal_ship_select_btn_remove_Clicked($(this)); });
  $('#modal_ship_select').on('click', '#dispFinalOnly', () => { createShipTable($('.ship_table'), [Number($('#shipType_select').val())]); })
  $('#modal_enemy_select').on('click', '.modal-body .enemy', function () { modal_enemy_Selected($(this)); });
  $('#modal_enemy_select').on('click', '.btn_remove', function () { modal_enemy_select_btn_remove($(this)); });
  $('#modal_enemy_select').on('change', '#enemyType_select', function () { createEnemyTable($('.enemy_table'), [Number($(this).val())]); });
  $('#modal_enemy_pattern').on('click', '.node_tr', function () { node_tr_Clicked($(this)); });
  $('#modal_enemy_pattern').on('change', '#map_select', createNodeSelect);
  $('#modal_enemy_pattern').on('change', '#node_select', createEnemyPattern);
  $('#modal_enemy_pattern').on('change', '#world_select', createMapSelect);
  $('#modal_enemy_pattern').on('click', '#btn_expand_enemies', btn_expand_enemies);
  $('#modal_confirm').on('click', '.btn_ok', modal_confirm_ok_Clicked);
  $('#modal_smart_menu').on('click', 'a[href^="#"]', function () { smart_menu_modal_link_Clicked($(this)); });
  $('#menu-small').click(menu_small_Clicked);
  $(document).on({
    mouseenter: function () { shoot_down_table_tbody_MouseEnter($(this)); },
    mouseleave: function () { shoot_down_table_tbody_MouseLeave($(this)); }
  }, '#shoot_down_table_tbody td');
  $(document).on({
    mouseenter: function () { progress_area_MouseEnter($(this)); },
    mouseleave: function () { progress_area_MouseLeave($(this)); }
  }, '.progress_area');

  // 画面サイズ変更
  $(window).resize(function () {
    if (timer !== false) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      if ($('#lb_tab_select').css('display') != 'none' && $('#lb_item1').attr('class').indexOf('tab-pane') === -1) {
        $('.lb_tab').addClass('tab-pane fade');
        $('.lb_tab:first').tab('show')
      }
      else if ($('#lb_tab_select').css('display') === 'none' && $('#lb_item1').attr('class').indexOf('tab-pane') != -1) {
        $('.lb_tab').removeClass('tab-pane fade').show().fadeIn();
      }
    }, 50);
  });

  // ドラッグ & ドロップ処理
  Sortable.create($('#main_contents')[0], {
    handle: '.trade_enabled',
    animation: 150,
    scroll: true,
    onEnd: main_contents_Sortable_End
  });

  $('.lb_plane').draggable({
    delay: 100,
    helper: 'clone',
    handle: '.drag_handle',
    zIndex: 1000,
    start: function (e, ui) { $(ui.helper).css('width', 320); },
    stop: function () { lb_plane_DragEnd($(this)); }
  });
  $('.lb_plane').droppable({
    accept: ".lb_plane",
    hoverClass: "lb_plane-hover",
    tolerance: "pointer",
    drop: function (e, ui) { lb_plane_Drop($(this), ui); }
  });
  $('#landBase_content_main').droppable({
    accept: ".lb_plane",
    tolerance: "pointer",
    over: (e, ui) => {
      ui.helper.animate({ 'opacity': '1.0' }, 100);
      isOut = false;
    },
    out: (e, ui) => {
      ui.helper.animate({ 'opacity': '0.2' }, 100);
      isOut = true;
    }
  });

  $('.ship_plane_draggable').draggable({
    delay: 100,
    helper: 'clone',
    handle: '.drag_handle',
    zIndex: 1000,
    start: function (e, ui) { ship_plane_DragStart(ui); },
    stop: function () { ship_plane_DragEnd($(this)); }
  });
  $('.ship_plane').droppable({
    accept: ".ship_plane_draggable",
    hoverClass: "ship_plane-hover",
    tolerance: "pointer",
    over: function (e, ui) { ship_plane_DragOver($(this), ui); },
    drop: function (e, ui) { ship_plane_Drop($(this), ui); }
  });
  $('.ship_tab > div').droppable({
    accept: ".ship_plane_draggable",
    tolerance: "pointer",
    over: function (e, ui) {
      ui.helper.stop().animate({ 'opacity': '1.0' }, 100);
      isOut = false;
    },
    out: function (e, ui) {
      ui.helper.stop().animate({ 'opacity': '0.2' }, 100);
      isOut = true;
    }
  });

  Sortable.create($('#battle_container')[0], {
    handle: '.sortable_handle',
    animation: 150,
    onEnd: function () {
      // 何戦目か整合性取る
      $('.battle_content').each((i, e) => { $(e).find('.battle_no').text(i + 1); });
      caluclate();
    }
  });
  $('.battle_content').droppable({
    accept: ".enemy",
    tolerance: "pointer",
    hoverClass: 'enemyFleet_item-hover',
    drop: function (event, ui) {
      setEnemyDiv($(this).find('.enemy_content:last'), ui.draggable.data('enemyid'));
      caluclate();
    }
  });
});
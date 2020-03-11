// https://closure-compiler.appspot.com/home
/*==================================
    定数
==================================*/
// 入力され得る搭載数の最大値
const MAX_SLOT = 99;

// 熟練を最初からMaxにする機体カテゴリ
const INITIAL_MAX_LEVEL_PLANE = [1, 4, 5, 7, 8, 102, 103];

// 画像置き場 プリロード用
const IMAGES = {};

/*==================================
    グローバル変数
==================================*/

// 自軍st1撃墜テーブル
let SHOOT_DOWN_TABLE;

// 敵st1撃墜テーブル
let SHOOT_DOWN_TABLE_ENEMY;

// 制空状態テーブル
let AIR_STATUS_TABLE;

// 各種モーダルの値返却先
let $target = null;

// 確認モーダルのモード
let confirmType = null;

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

// イベント発生用タイマー
let timer = false;

// 機体プリセット
let planePreset = null;

// 熟練度 >> 選択時、内部熟練度を 120 として計算するもの
let initialProf120Plane = [1, 4, 5, 7, 8, 102, 103, 104];

// 結果チャート用データ
let chartData = null;

// controlキー状態
let isCtrlPress = false;

// 編成プリセット
let presets = null;

// メモリ解放用タイマー
let releaseTimer = null;

// 設定データ
let setting = null;

// 配備機体数
let usedPlane = [];

/*
  プリセットメモ
  全体: [0:id, 1:名前, 2:基地プリセット, 3:艦隊プリセット, 4:敵艦プリセット, 5:メモ]
  基地: [0:機体群, 1:札群]
  艦隊: [0: id, 1: plane配列, 2: 配属位置]
  機体: [0:id, 1:熟練, 2:改修値, 3:搭載数, 4:スロット位置]
  敵艦: [0:戦闘位置, 1:enemyId配列(※ 直接入力時は負値で制空値), 2:マスid]

  在庫メモ
  [0:id, 1:[0:未改修数, 1:★1数, ... 10:★MAX数]]
*/
/*==================================
    汎用
==================================*/
/**
 * arrayとdiffArray内に1つでも同じ値がある場合true
 * @param {Array} array
 * @param {Array} diffArray
 * @returns 同じ値が1つでも両配列に存在すればtrue
 */
function isContain(array, diffArray) {
  for (const value1 of array) {
    for (const value2 of diffArray) {
      if (value1 === value2) return true;
    }
  }
  return false;
}

/**
 * 配列のシャッフル (Fisher-Yates shuffle)
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

/**
 * 数値へキャスト(整数)
 * 失敗時は第二引数の値　未指定時は0
 * @param {String} input 入力文字
 * @param {number} alt　変換失敗時代替値
 * @returns {number} 変換数値(整数)
 */
function castInt(input, alt = 0) {
  const val = parseInt(input);
  if (!isNaN(val)) return val;
  return alt;
}

/**
 * 数値へキャスト(小数)
 * 失敗時は第二引数の値　未指定時は0
 * @param {string} input 入力文字
 * @param {number} alt　変換失敗時代替値
 * @returns {number} 変換数値(小数)
 */
function castFloat(input, alt = 0) {
  const val = parseFloat(input);
  if (!isNaN(val)) return val;
  return alt;
}

/**
 * Base64 エンコード (url-safe)
 * @param {string} input
 * @returns {string}
 */
function utf8_to_b64(input) {
  try {
    let output = LZString.compressToEncodedURIComponent(input);
    return output;
  } catch (error) {
    return "";
  }
}

/**
 * Base64 デコード (url-safe)
 * @param {string} input
 * @returns {string}
 */
function b64_to_utf8(input) {
  try {
    return LZString.decompressFromEncodedURIComponent(input);
  } catch (error) {
    return "";
  }
}

/**
 * 指定したinputのvalueをクリップボードにコピー
 * @param {JqueryDomObject} $this inputタグ id 持ち限定
 * @returns {boolean} 成功したらtrue
 */
function copyInputTextToClipboard($this) {
  try {
    if (!$this.attr('id')) return false;
    const t = document.getElementById($this.attr('id'));
    t.select();
    return document.execCommand('copy');
  } catch (error) {
    return false;
  }
}

/**
 * urlパラメータ読み込み
 * @returns パラメータ配列
 */
function getUrlParams() {
  const value = location.search;
  if (value === "") return {};
  const retVal = {};
  for (const str of value.slice(1).split('&')) {
    const set = str.split('=');
    retVal[set[0]] = set[1];
  }

  // 読み込んだら掃除
  window.history.replaceState("", "", location.pathname);
  return retVal;
}

/**
 * 数値配列の合計値を返却(処理速度優先)
 * @param {Array<number>} array 数値配列
 * @returns {number} 合計値
 */
function getArraySum(array) {
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i];
  }
  return sum;
}

/*==================================
    値/オブジェクト 作成・操作・取得等
==================================*/

/**
 * 事前計算テーブルがメモリになければ生成
 */
function setPreCalculateTable() {

  // 制空ボーダーテーブル
  if (!AIR_STATUS_TABLE) {
    AIR_STATUS_TABLE = [];
    const max_ap = 2000;
    for (let i = 0; i <= max_ap; i++) {
      const tmp = [];
      for (let j = 0; j <= max_ap; j++) {
        if (i === 0 && j === 0) tmp[j] = 5;
        else if (i >= 3 * j) tmp[j] = 0;
        else if (2 * i >= 3 * j) tmp[j] = 1;
        else if (3 * i > 2 * j) tmp[j] = 2;
        else if (3 * i > j) tmp[j] = 3;
        else {
          tmp[j] = 4;
          break;
        }
      }
      AIR_STATUS_TABLE.push(tmp);
    }
  }

  // 自軍撃墜テーブル
  if (!SHOOT_DOWN_TABLE) {
    SHOOT_DOWN_TABLE = [];
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
  }

  // 敵撃墜テーブル
  if (!SHOOT_DOWN_TABLE_ENEMY) {
    SHOOT_DOWN_TABLE_ENEMY = [];
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
  }

  // メモリ解放タイマー設定
  window.clearTimeout(releaseTimer);
  // 3分おきに重いメモリ解放
  releaseTimer = setTimeout(function () {
    AIR_STATUS_TABLE = null;
    SHOOT_DOWN_TABLE = null;
    SHOOT_DOWN_TABLE_ENEMY = null;
  }, 180000);
}

/**
 * 艦載機カテゴリで艦載機をフィルタし返却
 * @param {number} type カテゴリ　0の場合、全艦載機
 * @returns {number} 艦載機データ
 */
function getPlanes(type) {
  let planes = [];
  if (type === 0) planes = basicSortedPlanes.concat();
  else planes = PLANE_DATA.filter(v => Math.abs(castInt(v.type)) === Math.abs(castInt(type)));
  return planes;
}

/**
 * 機体カテゴリからcssクラスを返却
 * @param {number} typeCd カテゴリコード
 * @returns {string} cssクラス名
 */
function getPlaneCss(typeCd) {
  const typeData = PLANE_TYPE.find(v => v.id === castInt(typeCd));
  return typeData ? typeData.css : '';
}

/**
 * 熟練度レベルから文字を返却
 * @param {number} remode 熟練度lv
 * @returns {string}
 */
function getProfString(remodel) {
  switch (remodel) {
    case 1:
      return "|";
    case 2:
      return "||";
    case 3:
      return "|||";
    case 4:
      return "/";
    case 5:
      return "//";
    case 6:
      return "///";
    case 7:
      return ">>";
  }
  return "";
}

/**
 * 第1引数のidの艦娘に対する第2引数の艦載機の適正 装備可能ならtrue
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
  if (!canEquip.includes(Math.abs(plane.type))) {
    // 敗者復活 (特別装備可能idに引っかかっていないか)
    return special && special.equipmentIds.includes(plane.id);
  }

  // 試製景雲チェック
  if (plane.id === 151) {
    if (!special) return false;
    return special.equipmentIds.includes(plane.id);
  }

  return true;
}

/**
 * 数値入力バリデーション
 * @param {string} value 入力文字列
 * @param {number} max 最大値
 * @param {string} min 最小値　未指定時0
 * @returns {number} 検証結果数値
 */
function validateInputNumber(value, max, min = 0) {
  const regex = new RegExp(/^[0-9]+$/);
  let ret = 0;

  if (!regex.test(value)) ret = min;
  else if (value > max) ret = max;
  else if (value < min) ret = min;
  else ret = castInt(value);

  return ret;
}

/*==================================
    DOM 操作
==================================*/
/**
 * メイン画面初期化処理
 * 初期DOM構築 事前計算 等
 * @param {*} callback コールバック
 */
function initialize(callback) {
  let fragment = document.createDocumentFragment();
  let text = '';

  // URLパラメータチェック
  const params = getUrlParams();

  // 競合回避
  $.widget.bridge('uibutton', $.ui.button);
  $.widget.bridge('uitooltip', $.ui.tooltip);

  // 機体カテゴリ画像のプリロード
  for (let i = 0; i < PLANE_TYPE.length; i++) {
    const img = new Image();
    const id = PLANE_TYPE[i].id;
    img.src = './img/type/type' + id + '.png';
    IMAGES["type" + id] = img;

    if (i === PLANE_TYPE.length - 1) {
      // 最後の画像読み込みが終わったら所持装備欄初期表示
      img.addEventListener('load', () => {
        $('#loading_info').text('画像データ読み込み完了');
        setPlaneStockTable();
        $('#loading_text').addClass('load_end_text');
        $('#loading_text').text('完了');
        $('#loading_back').addClass('load_end');
        $('#loading_line').addClass('loading_line_expand');

        if ($('#modal_version_inform').find('.modal-body').html()) {
          // バージョン変更通知
          $('#modal_version_inform').modal('show');
        }
        setTimeout(() => {
          $('#loading_back').remove();
        }, 1000);
      }, false);
    }
  }
  // 艦娘画像のプリロード
  for (let i = 0; i < SHIP_DATA.length; i++) {
    const img = new Image();
    const id = SHIP_DATA[i].id;
    img.src = './img/ship/' + id + '.png';
    IMAGES["ship" + id] = img;
  }
  // 敵画像のプリロード
  for (let i = 0; i < ENEMY_DATA.length; i++) {
    const img = new Image();
    const id = ENEMY_DATA[i].id;
    img.src = './img/enemy/' + id + '.png';
    IMAGES["enemy" + id] = img;
  }

  // 設定データ読み込み
  setting = loadLocalStrage('setting');
  if (!setting) {
    setting = {
      version: '0.0.0',
      simulateCount: 5000,
      autoSave: true,
      defaultProf: null,
      emptySlotInvisible: false,
      inStockOnly: false,
      visibleEquiped: false,
      visibleFinal: true,
      visibleImage: true,
      enemyDisplayImage: true,
      copyToClipbord: false,
      airRaidMax: true,
      displayMode: {
        'modal_plane_select': 'single',
        'modal_ship_select': 'single',
        'modal_enemy_select': 'single'
      },
      orderBy: {
        'modal_plane_select': ['default', 'desc'],
      }
    };
  }

  // バージョンチェック
  const serverVersion = CHANGE_LOG[CHANGE_LOG.length - 1];
  document.getElementById('latest_version').textContent = serverVersion.id;
  if (setting.version !== serverVersion.id) {
    fragment = document.createDocumentFragment();
    for (const v of serverVersion.changes) {
      // 変更通知
      const $change_wrap = document.createElement('div');
      $change_wrap.className = 'mt-3';

      const $badge_wrap = document.createElement('div');

      const $badge = document.createElement('span');
      $badge.className = 'mr-1 pt-1 badge badge-pill badge-' + (v.type === 0 ? 'success' : v.type === 1 ? 'info' : 'danger');
      $badge.textContent = (v.type === 0 ? '新規' : v.type === 1 ? '変更' : '修正');

      const $title_text = document.createElement('span');
      $title_text.innerHTML = v.title;

      $badge_wrap.appendChild($badge);
      $badge_wrap.appendChild($title_text);
      $change_wrap.appendChild($badge_wrap);

      if (v.content) {
        const $content = document.createElement('div');
        $content.className = 'font_size_12 pl-3';
        $content.innerHTML = v.content;

        $change_wrap.appendChild($content);
      }

      fragment.appendChild($change_wrap);
    }

    document.getElementById('version').textContent = serverVersion.id;
    document.getElementById('version_inform_body').appendChild(fragment);

    // 1.5.0対応 散らばったデータ削除
    deleteLocalStrage('version');
    deleteLocalStrage('autoSave');
    deleteLocalStrage('simulateCount');
    deleteLocalStrage('emptySlotInvisible');
    deleteLocalStrage('modalDisplayMode');
    deleteLocalStrage('defaultProf');

    const planeStock = loadLocalStrage('planeStock');
    if (planeStock && planeStock.length > 0 && !planeStock[0].num.length) {
      deleteLocalStrage('planeStock');
    }
  }

  // 機体カテゴリ初期化
  setPlaneType($('#plane_type_select'), PLANE_TYPE.filter(v => v.id > 0).map(v => v.id));
  setPlaneType($('#stock_type_select'), PLANE_TYPE.filter(v => v.id > 0).map(v => v.id));

  // デフォ機体群定義
  $('#plane_type_select').find('option').each(function () {
    basicSortedPlanes = basicSortedPlanes.concat(PLANE_DATA.filter(v => Math.abs(v.type) === castInt($(this).val())));
  });

  // 艦種初期化
  setShipType(SHIP_TYPE.filter(v => v.id < 15).map(v => v.id));
  // 敵艦種初期化
  setEnemyType(ENEMY_TYPE.filter(v => v.id > 0).map(v => v.id));

  let planes = [];
  $('#plane_type_select').find('option').each(function () {
    planes = planes.concat(PLANE_DATA.filter(v => Math.abs(v.type) === castInt($(this).val())));
  });
  createPlaneTable(planes);

  // 艦娘画像表示
  $('#display_ship_img').prop('checked', setting.visibleImage);
  // 最終状態のみ表示
  $('#display_final').prop('checked', setting.visibleFinal);
  createShipTable([0]);
  createEnemyTable([0]);

  // 改修値選択欄生成
  text = '';
  for (let i = 0; i <= 10; i++) {
    text += `<div class="remodel_item" data-remodel="${i}"><i class="fas fa-star"></i>`;
    if (i === 10) text += 'max</div>';
    else text += `+${i}</div>`;
  }
  $('.remodel_select').next().append(text);

  // 熟練度選択欄
  text = $('.prof_select:first').next().html();
  $('.prof_select').next().html(text);

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

  // 艦娘　複製
  $('.ship_tab').html($('.ship_tab:first').html());
  // 艦娘　複製 スロット欄複製
  $('.ship_plane').html($('#friendFleet_item1').find('.ship_plane:first').html());
  // id付けなおす
  $('.ship_tab').each((i, e) => {
    $(e).attr('id', 'shipNo_' + (i + 1));
    $(e).find('.ship_disabled').attr('id', 'disabled_ship_' + (i + 1));
    $(e).find('.ship_disabled_label').attr('for', 'disabled_ship_' + (i + 1));
  });
  // 表示隻数初期化
  $('.display_ship_count').val(2);
  // 連合艦隊チェック初期化
  $('#union_fleet').prop('checked', true);

  // 敵艦隊欄複製
  text = $('#battle_container').html();
  for (let index = 1; index < 10; index++) $('#battle_container').append(text);
  $('.battle_content').each((i, e) => {
    $(e).find('.battle_no').text(i + 1);
    if (i > 0) $(e).addClass('d-none');

    $(e).find('.custom-control-input').attr('id', 'grand_' + i);
    $(e).find('.custom-control-label').attr('for', 'grand_' + i);
  });

  // 戦闘回数初期化
  $('#battle_count').val(1);
  $('#landBase_target').val(1);

  // 海域選択初期化
  createMapSelect();
  createNodeSelect();

  // 結果欄欄チェック初期化
  $('#display_bar').prop('checked', true);
  $('#display_land_base_result').prop('checked', true);
  $('#display_fleet_result').prop('checked', true);
  $('#display_enemy_table').prop('checked', true);

  // 熟練度非活性
  $('.remodel_select').prop('disabled', true);

  // 結果表示バー複製
  $('.progress_area').html($('.progress_area:first').html());
  $('.progress_area').each((i, e) => {
    $(e).find('.result_bar').attr('id', 'result_bar_' + (i + 1));
    if (i < 6) $(e).find('.progress_label').text(`基地${(Math.floor(i / 2) + 1)} ${((i % 2) + 1)}波目`);
    if (i === 6) $(e).find('.progress_label').text('本隊');
    if (i === 7) $(e).find('.progress_label').text('防空');
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
  $('#shoot_down_table').find('.tr_header').append(text + '<td class="td_battle battle_end">出撃後</td><td class="td_battle battle_death">全滅率</td>');
  $('.tr_fap').append(text1 + '<td class="td_battle battle_end fap font_size_11" colspan="2"></td>');
  $('.tr_eap').append(text2 + '<td class="td_battle battle_end eap" rowspan="2" colspan="2"></td>');
  $('.tr_cond').append(text3);

  // 戦闘結果表示タブ10戦分生成
  text = '';
  for (let index = 1; index <= 10; index++) {
    text += `
      <li class="nav-item ${index === 1 ? '' : 'd-none'}">
        <a class="nav-link ${index === 1 ? 'active' : ''}" data-toggle="tab" data-disp="${index}" href="#">${index}戦目</a>
      </li>`;
  }
  $('#display_battle_tab').html(text);

  // 制空状態割合テーブル複製
  text = $('#rate_table').find('thead').html();
  for (let index = 0; index <= 7; index++) $('#rate_table tbody').append(text);
  $('#rate_table tbody').find('tr').each((i, e) => {
    const lb_num = Math.floor(i / 2) + 1;
    const wave = i % 2 + 1;
    $(e).attr('id', 'rate_row_' + (i + 1));
    if (i < 6) $(e).find('.rate_td_name').html(`<span class="mr-1">第${lb_num}基地</span><span class="text-nowrap">${wave}波目</span>`);
    else if (i === 6) $(e).find('.rate_td_name').text('本隊');
    else if (i === 7) $(e).find('.rate_td_name').text('防空');

    if (i % 2 === 0) $(e).addClass('rate_tr_border_top');
    else if (i >= 6) $(e).addClass('rate_tr_border_top rate_tr_border_bottom');
  });

  // 詳細設定 初期熟練度欄複製
  text = $('#init_prof_parent').html();
  const types = PLANE_TYPE.filter(v => v.id > 0 && v.id !== 104);
  for (const type of types) {
    $('#init_prof_parent').append(text);
    const $last = $('#init_prof_parent').find('.type_name:last');
    $last.text(type.abbr);
    $last.closest('.init_prof')[0].dataset.typeid = type.id;
  }
  $('#init_prof_parent').find('.init_prof:first').remove();

  if (!setting.defaultProf) {
    setting.defaultProf = [];
    for (const type of types) {
      const d = { id: 0, prof: 0 };
      d.id = type.id;
      d.prof = INITIAL_MAX_LEVEL_PLANE.includes(type.id) ? 7 : 0;
      setting.defaultProf.push(d);
    }
    saveLocalStrage('setting', setting);
  }

  for (const v of setting.defaultProf) {
    proficiency_Changed($('.init_prof[data-typeid="' + v.id + '"').find('.prof_option[data-prof="' + v.prof + '"]').parent(), true);
  }

  // tooltip起動
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="popover"]').popover();

  // シミュレート回数
  if (setting.simulateCount) $('#calculate_count').val(setting.simulateCount);
  else $('#calculate_count').val(5000);

  // 内部熟練度120
  if (setting.initialProf120) {
    initialProf120Plane = setting.initialProf120;
  }
  for (const type of initialProf120Plane) {
    $('#prof120_' + type).prop('checked', true);
  }

  // 表示形式(一列/複数列)
  if (setting.displayMode) {
    Object.keys(setting.displayMode).forEach((key) => {
      $(`#${key} .toggle_display_type[data-mode="${setting.displayMode[key]}"]`).addClass('selected');
    });
  }
  else $('.toggle_display_type[data-mode="single"]').addClass('selected');
  // ソート
  if (!setting.orderBy) {
    setting.orderBy = { 'modal_plane_select': ['default', 'desc'] };
  }
  Object.keys(setting.orderBy).forEach((key) => {
    $(`#${key} .sort_select`).val(setting.orderBy[key][0]);
    $(`#${key} .order_` + setting.orderBy[key][1]).prop('checked', true);
  });
  // 自動保存
  $('#auto_save').prop('checked', setting.autoSave);
  // クリップボード保存
  $('#clipbord_mode').prop('checked', setting.copyToClipbord);
  // 空襲被害最大
  if (!setting.hasOwnProperty('airRaidMax')) setting.airRaidMax = true;
  $('#air_raid_max').prop('checked', setting.airRaidMax);
  // 空スロット表示
  $('#empty_slot_invisible').prop('checked', setting.emptySlotInvisible);
  // 在庫有のみ表示
  $('#disp_in_stock').prop('checked', setting.inStockOnly);
  // 配備済み表示
  $('#disp_equiped').prop('checked', setting.visibleEquiped);
  // 敵艦表示形式
  $('#enemy_dispmay_image').prop('checked', setting.enemyDisplayImage);
  // 敵艦表示形式
  $('#enemy_dispmay_text').prop('checked', !setting.enemyDisplayImage);
  $('#plane_word').val('');
  $('#ship_word').val('');
  $('#enemy_word').val('');
  $('#stock_word').val('');

  // おまかせ配備初期選択
  $('#modal_auto_expand').find('.custom-control-input').prop('checked', false);
  $('#btn_start_auto_expand').prop('disabled', true);
  $('#mode_1').prop('checked', true);
  $('#dest_ap').val(100);
  $('#dest_range').val(6);

  // URLパラメータチェック
  let existParam = false;
  if (params.hasOwnProperty("d")) {
    expandMainPreset(decordPreset(params.d));
    existParam = true;
  }
  else if (params.hasOwnProperty("predeck") || params.hasOwnProperty("lb")) {
    if (params.hasOwnProperty("predeck")) {
      const deck = readDeckBuilder(params.predeck);
      if (deck) expandMainPreset(deck, deck[0][0].length > 0, true, false);
      existParam = true;
    }
    if (params.hasOwnProperty("lb")) {
      try {
        const lbData = JSON.parse(decodeURIComponent(params.lb));
        if (lbData.length >= 2) expandMainPreset([lbData, [], []], true, false, false);
        existParam = true;
      }
      catch (error) {
      }
    }
  }

  if (!existParam && setting.autoSave) {
    // パラメータがないなら自動保存データをlocalStrageから読み込み
    const autoSaveData = loadLocalStrage('autoSaveData');
    expandMainPreset(decordPreset(autoSaveData));
  }

  // 基地欄タブ化するかどうか
  if ($('#lb_tab_select').css('display') !== 'none' && !$('#lb_item1').attr('class').includes('tab-pane')) {
    $('.lb_tab').addClass('tab-pane fade');
    $('.baseNo').removeClass('cur_move sortable_handle');
    $('.lb_tab:first').addClass('show active');
    $('#lb_item1').addClass('active');
  }

  // 更新履歴
  fragment = document.createDocumentFragment();
  let verIndex = 0;
  for (const ver of CHANGE_LOG) {
    const $ver_parent = document.createElement('div');
    $ver_parent.className = 'my-3 ver_log border-bottom';

    const $ver_title = document.createElement('div');
    $ver_title.className = 'py-2';
    $ver_title.textContent = 'v' + ver.id;

    if (serverVersion.id === ver.id) {
      const $ver_new = document.createElement('span');
      $ver_new.className = 'ml-2 pt-1 badge badge-pill badge-danger';
      $ver_new.textContent = 'New';
      $ver_title.appendChild($ver_new);
    }

    $ver_parent.appendChild($ver_title);

    for (let i = 0; i < ver.changes.length; i++) {
      const v = ver.changes[i];
      const logId = 'log_' + verIndex++ + '_' + i;

      const $history_header = document.createElement('div');
      $history_header.className = 'py-2 px-2 d-flex collapsed history_item history_item_no_content';

      const $history_badge_wrap = document.createElement('div');
      $history_badge_wrap.className = 'd-flex flex-nowrap align-self-center';

      const $history_badge_div = document.createElement('div');
      $history_badge_div.className = 'align-self-center';

      const $history_badge = document.createElement('span');
      $history_badge.className = 'mr-2 pt-1 badge badge-pill badge-' + (v.type === 0 ? 'success' : v.type === 1 ? 'info' : 'danger');
      $history_badge.textContent = (v.type === 0 ? '新規' : v.type === 1 ? '変更' : '修正');

      const $history_title = document.createElement('div');
      $history_title.className = 'align-self-center';
      $history_title.innerHTML = v.title;

      $history_badge_div.appendChild($history_badge);
      $history_badge_wrap.appendChild($history_badge_div);
      $history_badge_wrap.appendChild($history_title);
      $history_header.appendChild($history_badge_wrap);
      $ver_parent.appendChild($history_header);

      // 更新詳細内容がある場合、クリックで出てくる感じに
      if (v.content) {
        $history_header.dataset.toggle = 'collapse';
        $history_header.dataset.target = '#' + logId;
        $history_header.classList.remove('history_item_no_content');

        const $history_content_wrap = document.createElement('div');
        $history_content_wrap.id = logId;
        $history_content_wrap.className = 'border-top collapse history_content';

        const $history_content = document.createElement('div');
        $history_content.className = 'pl-3 py-2 font_size_12';
        $history_content.innerHTML = v.content;

        $history_content_wrap.appendChild($history_content);
        $ver_parent.appendChild($history_content_wrap);
      }

      fragment.appendChild($ver_parent);
    }
  }

  const $last_update = document.createElement('div');
  $last_update.className = 'mt-2 font_size_12';
  $last_update.textContent = LAST_UPDATE_DATE;
  fragment.appendChild($last_update);

  document.getElementById('site_history_body').appendChild(fragment);

  // サイト案内たちは閉じておく
  $('#site_information').find('.collapse_content').collapse('hide');

  $('#loading_info').text('初期計算中');
  callback();
}

/**
 * 機体カテゴリselectタグに、第2引数配列からoptionタグを生成
 * @param {JqueryDomObject} $select 設置する対象の select
 * @param {Array.<number>} 展開する機体カテゴリid配列
 */
function setPlaneType($select, array) {
  $select.empty();
  $select.append('<option value="0">全て</option>');
  let exist = false;
  // 陸上機判定
  for (const v of [100, 101, 102, 103, 104]) {
    exist = array.includes(v);
    if (exist) break;
  }
  if (exist) {
    $select.append('<optgroup label="陸上機" id="optg_lb">');
    exist = false;
  }
  // 艦上機判定
  for (const v of [1, 2, 3, 4, 9]) {
    exist = array.includes(v);
    if (exist) break;
  }
  if (exist) {
    $select.append('<optgroup label="艦上機" id="optg_cb">');
    exist = false;
  }
  // 水上機判定
  for (const v of [5, 6, 7, 8]) {
    exist = array.includes(v);
    if (exist) break;
  }
  if (exist) {
    $select.append('<optgroup label="水上機" id="optg_sp">');
    exist = false;
  }
  let html = '';
  for (const v of PLANE_TYPE) {
    if (array.includes(v.id)) {
      html = '<option value="' + v.id + '">' + v.name + '</option>';
      $select.find('#' + ([1, 2, 3, 4, 9].includes(v.id) ? 'optg_cb' : [5, 6, 7, 8].includes(v.id) ? 'optg_sp' : 'optg_lb')).append(html);
    }
  }
}

/**
 * 艦種selectタグに、第二引数配列からoptionタグを生成
 * @param {Array.<number>} 展開する艦種id配列
 */
function setShipType(array) {
  let html = '';
  for (const v of SHIP_TYPE) if (array.includes(v.id)) html += `<option value="${v.id}">${v.name}</option>`;
  $('#ship_type_select').append(html);
}

/**
 * 敵艦種selectタグに、第二引数配列からoptionタグを生成
 * @param {Array.<number>} 展開する艦種id配列
 */
function setEnemyType(array) {
  let html = '';
  for (const v of ENEMY_TYPE) if (array.includes(v.id)) html += `<option value="${v.id}">${v.name}</option>`;
  $('#enemy_type_select').append(html);
}

/**
 * 引数で渡された .xx_plane 内艦載機データをクリアする
 * @param {JqueryDomObject} $div クリアする .lb_plane .ship_plane
 */
function clearPlaneDiv($div) {
  // 選択状況をリセット
  $div.removeClass(getPlaneCss($div[0].dataset.type));
  $div[0].dataset.planeid = '';
  $div[0].dataset.type = '';
  $div.find('.plane_img').attr('src', './img/type/undefined.png').attr('alt', '');
  $div.find('.cur_move').removeClass('cur_move');
  $div.find('.drag_handle').removeClass('drag_handle');
  $div.find('.plane_name_span').text('機体を選択');
  $div.find('select').val('0').change();
  $div.find('.remodel_select').prop('disabled', true).addClass('remodel_disabled');
  $div.find('.remodel_value').text(0);
  $div.find('.prof_select').attr('src', './img/util/prof0.png').attr('alt', '').data('prof', 0);
  $div.find('.btn_remove_plane').addClass('opacity0');
}
/**
 * 引数で渡された要素内の艦載機を全てクリアする
 * @param {JqueryDomObject} $div クリア対象 .contents または #landBase #friendFleet
 */
function clearPlaneDivAll($div) {
  if ($div.attr('id') === 'landBase') {
    $('.lb_plane').each((i, e) => setLBPlaneDiv($(e)));
    $('#modal_collectively_setting').modal('hide');
  }
  else if ($div.attr('id') === 'friendFleet') {
    $('.ship_plane').each((i, e) => clearPlaneDiv($(e)));
  }
}

/**
 * 第1引数で渡された lb_plane要素 に対し第2引数の機体オブジェクト（{id, prof, slot, remodel} 指定）を挿入する
 * @param {JqueryDomObject} $div 挿入先
 * @param {Object} lbPlane 機体データオブジェクト データがない場合はClear処理として動作
 */
function setLBPlaneDiv($div, lbPlane = { id: 0, slot: 0, remodel: 0 }) {
  const id = castInt(lbPlane.id);
  const plane = PLANE_DATA.find(v => v.id === id);
  const result = setPlaneDiv($div, lbPlane);
  if (!lbPlane.hasOwnProperty('slot')) lbPlane.slot = 0;

  // 搭載数最大値　基本は18
  let maxSlot = 18;
  if (result && plane && RECONNAISSANCES.includes(plane.type)) maxSlot = 4;
  $div.find('.slot_input').attr('max', maxSlot);
  $div.find('.slot_range').attr('max', maxSlot);

  let initSlot = lbPlane.slot;
  if (initSlot === 0 || initSlot > maxSlot) initSlot = maxSlot;
  if (!result) initSlot = 0;

  $div.find('.slot').text(initSlot);
}

/**
 * 第1引数で渡された xx_plane に第2引数の機体オブジェクト（{id, prof, remodel} 指定）を搭載する
 * @param {JqueryDomObject} $div xx_planeを指定。xxは現状 ship または lb
 * @param {JqueryDomObject} $original 機体オブジェクト（{id, prof, remodel} 指定）
 * @param {boolean} 搭載数の変更を許可するかどうか
 * @returns {boolean} 搭載が成功したかどうか
 */
function setPlaneDiv($div, inputPlane = { id: 0, remodel: 0, prof: -1 }, canEditSlot = false) {
  // 機体じゃなさそうなモノが渡されたらとりあえずクリア
  if (!inputPlane.id) {
    clearPlaneDiv($div);
    return false;
  }

  // 渡された機体の基本データ取得
  const plane = PLANE_DATA.find(v => v.id === inputPlane.id);
  // 未定義の機体だった場合もクリア
  if (!plane) {
    clearPlaneDiv($div);
    return false;
  }

  // 渡された機体の不足プロパティセット
  if (!inputPlane.hasOwnProperty('remodel')) inputPlane.remodel = 0;
  if (!inputPlane.hasOwnProperty('prof')) inputPlane.prof = -1;

  if ($div.closest('.ship_tab').hasClass('ship_tab')) {
    // 搭載先が艦娘の場合、機体が装備できるのかどうかチェック
    let shipId = castInt($div.closest('.ship_tab')[0].dataset.shipid);
    if (!checkInvalidPlane(shipId, plane)) {
      clearPlaneDiv($div);
      return false;
    }

    // 日進の大型飛行艇処理
    if (plane.type === 8 && (shipId === 1490 || shipId === 386)) {
      if (inputPlane.hasOwnProperty('slot')) inputPlane.slot = 1;
      else inputPlane["slot"] = 1;
      canEditSlot = true;
    }
  }

  $div
    .removeClass(getPlaneCss($div[0].dataset.type))
    .addClass(getPlaneCss(plane.type));
  $div[0].dataset.planeid = plane.id;
  $div[0].dataset.type = plane.type;
  $div.find('.plane_name_span').text(plane.abbr ? plane.abbr : plane.name).attr('title', plane.abbr ? plane.name : '');
  $div.find('.plane_img').attr('src', './img/type/type' + plane.type + '.png').attr('alt', plane.type);
  $div.find('.plane_img').parent().addClass('cur_move drag_handle');
  $div.find('.plane_name').addClass('drag_handle');
  $div.find('.btn_remove_plane').removeClass('opacity0');

  // 改修の有効無効設定
  const $remodelInput = $div.find('.remodel_select');
  $remodelInput.prop('disabled', !plane.canRemodel).removeClass('remodel_disabled');
  if (!plane.canRemodel) {
    // 改修無効の機体
    $remodelInput.addClass('remodel_disabled');
    $remodelInput.find('.remodel_value').text(0);
  }
  else {
    // 改修値セット 基本は0
    $remodelInput.find('.remodel_value').text(Math.min(inputPlane.remodel, 10));
  }

  // 熟練度初期値 陸偵熟練は||
  let prof = 0;
  // デフォルト熟練度
  let tmpDefault = setting.defaultProf.find(v => v.id === Math.abs(plane.type));
  if (tmpDefault) prof = tmpDefault.prof;
  if (plane.id === 312) prof = 2;
  // 特定熟練度を保持していた場合
  if (inputPlane.prof >= 0) prof = inputPlane.prof;
  const $prof_select = $div.find('.prof_select');
  $prof_select
    .attr('src', './img/util/prof' + prof + '.png')
    .removeClass('prof_yellow prof_blue prof_none');
  $prof_select[0].dataset.prof = prof;
  if (prof > 3) $div.find('.prof_select').addClass('prof_yellow');
  else if (prof > 0) $div.find('.prof_select').addClass('prof_blue');
  else $div.find('.prof_select').addClass('prof_none');

  // 搭載数を変更する
  if (canEditSlot) {
    if (!inputPlane.hasOwnProperty('slot')) inputPlane.slot = 0;
    $div.find('.slot').text(inputPlane.slot);
  }

  // 搭載成功
  return true;
}

/**
 * 第1引数で渡された .ship_tab に第2引数で渡された 艦娘データを挿入する
 * @param {JqueryDomObject} $div 艦娘タブ (.ship_tab)
 * @param {number} id 艦娘id
 */
function setShipDiv($div, id) {
  const ship = SHIP_DATA.find(v => v.id === id);
  if (!ship) return;
  $div[0].dataset.shipid = ship.id;
  $div.find('.ship_img').attr('src', './img/ship/' + id + '.png');
  $div.find('.ship_img').removeClass('d-none');
  $div.find('.ship_name_span').text(ship.name);
  $div.find('.ship_plane').each((i, e) => {
    const $this = $(e);
    const plane = {
      id: castInt($this[0].dataset.planeid),
      remodel: castInt($this.find('.remodel_value').text()),
      prof: castInt($this.find('.prof_select')[0].dataset.prof),
    };
    // 既に装備されている装備を装備しなおそうとする -> 不適切なら自動的にはずれる
    if ($div[0].dataset.shipid) setPlaneDiv($this, plane);

    $this.find('.slot').text(0);
    $this.find('.slot_ini').data('ini', 0);
    if (i < ship.slot.length) {
      $this.removeClass('d-none').addClass('d-flex');
      $this.find('.slot').text(ship.slot[i]);
      $this.find('.slot_ini').data('ini', ship.slot[i]);
    }
    else {
      clearPlaneDiv($this);
      $this.removeClass('d-flex').addClass('d-none');
    }
  });
}

/**
 * 指定した ship_tab をクリアする
 * @param {JqueryDomObject} $div クリアする .ship_tab
 */
function clearShipDiv($div) {
  // 選択状況をリセット
  $div[0].dataset.shipid = '';
  $div.find('.ship_img').addClass('d-none');
  $div.find('.ship_img').attr('src', './img/ship/0.png');
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
 * 艦娘を全て解除する。表示隻数も変更する
 * @param {number} displayCount 表示隻数　デフォルト2
 */
function clearShipDivAll(displayCount = 2) {
  $('.ship_tab').each((i, e) => clearShipDiv($(e)));
  $('.display_ship_count').each((i, e) => {
    $(e).val(displayCount);
    display_ship_count_Changed($(e), true);
  });
}

/**
 * 第1引数で渡された .enemy_content に第2引数で渡されたidの敵艦データを挿入する
 * @param {JqueryDomObject} $div 敵艦タブ (enemy_content)
 * @param {number} id 敵艦id
 * @param {number} ap 直接入力時指定(id === -1時)
 */
function setEnemyDiv($div, id, ap = 0) {
  if (!$div) return;
  const $parent = $div.parent();
  const enemy = createEnemyObject(id);

  // 空の敵艦が帰ってきたら中止
  if (enemy.id === 0) return;

  $div[0].dataset.enemyid = enemy.id;
  $div.find('.enemy_name_span').html(drawEnemyGradeColor(enemy.name));

  let displayAp = 0;
  if (id === -1 && ap > 0) displayAp = ap;
  else if (enemy.ap > 0) displayAp = enemy.ap;
  else if (enemy.lbAp > 0) displayAp = '(' + enemy.lbAp + ')';
  $div.find('.enemy_ap').text(displayAp);

  // ドラッグ可能要素設定
  $div.find('.enemy_index').addClass('drag_handle cur_move');
  $div.find('.enemy_name_span').addClass('drag_handle');

  // 敵入力欄追加の必要あるかどうか (セット欄に隣接した別contentがない場合)
  const maxEnemyInput = castInt($div.closest('.battle_content').find('.cell_type').val()) === CELL_TYPE.grand ? 12 : 6;
  if (!$div.next().hasClass('enemy_content') && $div.parent().find('.enemy_content').length < maxEnemyInput) {
    // 複製して追加
    const $clone = $div.clone();
    // 複製したやつは初期化
    clearEnemyDiv($clone);
    $div.parent().append($clone);
  }
  // インデックス振り直し
  $parent.find('.enemy_content').each((i, e) => { $(e).find('.enemy_index').text(i + 1); });

  // ドラッグ設定
  if (isDefMode) return;
  $div.draggable({
    delay: 100,
    helper: 'clone',
    handle: '.drag_handle',
    zIndex: 1000,
    start: (e, ui) => {
      $(ui.helper).find('.enemy_ap_select_parent').addClass('d-none');
      $(ui.helper).removeClass('enemy_content py-1');
      $(ui.helper)
        .css('backgroundColor', '#fff')
        .css('border', '2px solid #ccc')
        .css('border-radius', '.25rem');
    },
    stop: function () {
      if (isOut || (!isCtrlPress && !$('#drag_drop_copy').prop('checked'))) {
        clearEnemyDiv($div);
        isOut = false;
      }
      calculate();
    }
  });
}

/**
 * 指定した enemy_content をクリアする
 * @param {JqueryDomObject} $div クリアする .enemy_content
 */
function clearEnemyDiv($div) {
  const $parent = $div.parent();

  // ドラッグハンドル除去
  $div.find('.drag_handle').removeClass('drag_handle cur_move');

  const maxEnemyInput = castInt($div.closest('.battle_content').find('.cell_type').val()) === CELL_TYPE.grand ? 12 : 6;

  // クリア対象の下にまだenemy_content要素があるなら削除
  if ($div.next().attr('class')) {
    // 一番下の行まで埋まってた場合は、最下部に新規行を挿入
    if ($parent.find('.enemy_content').length === maxEnemyInput && $parent.find('.enemy_content:last')[0].dataset.enemyid) {
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
    $div[0].dataset.enemyid = '';
    $div.find('.enemy_name_span').text('敵艦を選択');
    $div.find('.enemy_ap').text(0);
  }

  // インデックス振り直し
  $parent.find('.enemy_content').each((i, e) => {
    $(e).find('.enemy_index').text(i + 1);
  });
}

/**
 * 全敵艦解除 戦闘数も変更(指定可能 デフォルト1)
 * @param {number} count 初期戦闘数 デフォルト1
 */
function clearEnemyDivAll(count = 1) {
  $('.battle_content').each((i, e) => {
    $(e)[0].dataset.celldata = '';
    $(e).find('.enemy_content:not(:first)').remove();
    clearEnemyDiv($(e).find('.enemy_content'));
  });
  $('#battle_count').val(count);
  createEnemyInput(count);

  $('#air_raid_enemies').find('.enemy_content:not(:first)').remove();
  clearEnemyDiv($('#air_raid_enemies').find('.enemy_content'));
}

/**
 * 値が増加した場合緑に、減少した場合赤に、色を変えつつ値を変更する
 * @param {HTMLElement} node
 * @param {number} pre 変更前の値
 * @param {number} cur 変更後の値
 * @param {boolean} reverse 赤緑判定を反転する場合 true を指定
 */
function drawChangeValue(node, pre, cur, reverse) {
  if (castInt(pre) !== castInt(cur)) {
    $inline = $(node);
    $inline.text(cur).stop();
    if (reverse) $inline.css('color', cur < pre ? '#0c5' : cur > pre ? '#f00' : '#000');
    else $inline.css('color', cur > pre ? '#0c5' : cur < pre ? '#f00' : '#000');
    $inline.delay(500).animate({ 'color': '#000' }, 1000);
  }
}

/**
 * 渡された敵艦名にflagshipやelite文字が含まれていれば色を塗ったspanのHtmlTextとして返却
 * @param {string} enemyName
 * @returns {string} 色付き敵艦名
 */
function drawEnemyGradeColor(enemyName) {
  if (enemyName.includes('elite')) {
    enemyName = enemyName.replace('elite', '<span class="text-danger">elite</span>');
  }
  else if (enemyName.includes('改flagship')) {
    enemyName = enemyName.replace('flagship', '<span class="text-primary">flagship</span>');
  }
  else if (enemyName.includes('flagship')) {
    enemyName = enemyName.replace('flagship', '<span class="text-warning">flagship</span>');
  }
  return enemyName;
}

/**
 * 機体一覧に plans 配列から値を展開
 * @param {Array.<Object>} planes
 */
function createPlaneTable(planes) {
  const $modal = $('#modal_plane_select').find('.modal-dialog');
  const $tbody = $('#plane_tbody');
  const target = document.getElementById('plane_tbody');
  const fragment = document.createDocumentFragment();
  const imgWidth = 25;
  const imgHeight = 25;
  const displayMode = $modal.find('.toggle_display_type.selected').data('mode');
  const planeStock = loadPlaneStock();
  const dispInStock = setting.inStockOnly;
  const dispEquiped = setting.visibleEquiped;
  const sortKey = $('#plane_sort_select').val();

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

  if (dispInStock) {
    $('#disp_equiped').closest('div').removeClass('d-none');
    $('#disp_in_stock').prop('checked', true);
  }
  else {
    $('#disp_equiped').closest('div').addClass('d-none');
    $('#disp_in_stock').prop('checked', false);
  }

  const max_i = planes.length;
  let prevType = 0;
  let maxRemodelLevel = 0;
  let enabledCount = 0;
  let stockNumber = 0;

  for (let i = 0; i < max_i; i++) {
    const plane = planes[i];
    const nmAA = plane.antiAir + 1.5 * plane.interception;
    const defAA = plane.antiAir + plane.interception + 2.0 * plane.antiBomber;
    const needTooltip = plane.antiBomber > 0 || plane.interception > 0;

    // 使用済み機体チェック
    if (dispInStock && planeStock) {
      const stock = planeStock.find(v => v.id === plane.id);
      const used = usedPlane.find(v => v.id === plane.id);
      // 使用済み数
      const usedNum = used ? getArraySum(used.num) : 0;
      // 初期所持数
      stockNumber = stock ? getArraySum(stock.num) : 0;
      // 未所持 または 全て配備済みかつ配備済みは非表示 の場合表示しない
      if (stockNumber <= 0 || (!dispEquiped && usedNum >= stockNumber)) continue;
      // 利用可能数
      enabledCount = stockNumber - usedNum;
      for (let j = 10; j >= 0; j--) {
        if (used) stock.num[j] -= used.num[j];
        if (stock.num[j] > 0) {
          maxRemodelLevel = j;
          break;
        }
      }
    }

    // ラップ
    const $planeDiv = document.createElement('div');
    $planeDiv.className = `plane plane_tr d-flex py-2 py-lg-1${displayMode === "multi" ? ' tr_multi' : ''}`;
    $planeDiv.dataset.planeid = plane.id;
    $planeDiv.dataset.type = plane.type;
    $planeDiv.dataset.remodel = maxRemodelLevel;
    if (dispInStock && dispEquiped && enabledCount <= 0) {
      $planeDiv.classList.remove('plane_tr', 'plane');
      $planeDiv.classList.add('plane_tr_disabled');
    }

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

    // 残り個数
    const $stockDiv = document.createElement('div');
    $stockDiv.className = 'ml-1 plane_td_stock align-self-center';
    $stockDiv.textContent = '×' + (enabledCount > 0 ? enabledCount : 0);

    // 対空
    const $aaDiv = document.createElement('div');
    $aaDiv.className = 'ml-auto plane_td_basic align-self-center ' + (needTooltip ? 'text_existTooltip' : '');
    if (needTooltip) {
      $aaDiv.dataset.toggle = 'tooltip';
      $aaDiv.title = '出撃時:' + nmAA + ' , 防空時:' + defAA;
    }
    $aaDiv.textContent = plane.antiAir;

    // 半径
    const $rangeDiv = document.createElement('div');
    $rangeDiv.className = 'plane_td_basic align-self-center';
    $rangeDiv.textContent = plane.radius;

    // 複数表示時分割
    if (displayMode === "multi" && prevType !== plane.type && sortKey === 'default') {
      const $typeDiv = document.createElement('div');
      $typeDiv.className = 'd-flex w-100 mt-3 mb-1';

      const $type = document.createElement('div');
      $type.className = 'font_size_12 font_color_777 align-self-center';
      $type.textContent = PLANE_TYPE.find(v => v.id === plane.type).name;

      const $typeLine = document.createElement('div');
      $typeLine.className = 'flex-grow-1 border-bottom align-self-center mx-2';

      $typeDiv.appendChild($type);
      $typeDiv.appendChild($typeLine);

      fragment.appendChild($typeDiv);
    }

    $iconDiv.appendChild(cvs);
    $planeDiv.appendChild($iconDiv);
    $planeDiv.appendChild($nameDiv);
    if (enabledCount > 0 || (dispInStock && dispEquiped)) $planeDiv.appendChild($stockDiv);
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
}

/**
 * 所持機体テーブル読み込み
 */
function setPlaneStockTable() {
  const target = document.getElementById('plane_stock_tbody');
  const fragment = document.createDocumentFragment();
  const imgWidth = 24;
  const imgHeight = 24;
  const planes = PLANE_DATA.filter(v => v.id > 0);
  const planeStock = loadPlaneStock();

  const max_i = planes.length;
  for (let i = 0; i < max_i; i++) {
    const plane = planes[i];
    const nmAA = plane.antiAir + 1.5 * plane.interception;
    const defAA = plane.antiAir + plane.interception + 2.0 * plane.antiBomber;
    const stock = planeStock.find(v => v.id === plane.id);

    // ラップ
    const $planeDiv = document.createElement('div');
    $planeDiv.className = `stock_tr py-1 d-flex type_` + Math.abs(plane.type);
    $planeDiv.dataset.planeid = plane.id;

    // アイコン用ラッパー
    const $iconDiv = document.createElement('div');
    $iconDiv.className = 'stock_td_type align-self-center';

    // アイコン
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    cvs.width = imgWidth;
    cvs.height = imgHeight;
    ctx.drawImage(IMAGES['type' + plane.type], 0, 0, imgWidth, imgHeight);

    // 機体名
    const $name = document.createElement('div');
    $name.className = 'stock_td_name font_size_14 text-left align-self-center';
    $name.textContent = plane.name;

    // 対空
    const $aa = document.createElement('div');
    $aa.className = 'stock_td_aa align-self-center';
    $aa.textContent = nmAA + (defAA != nmAA ? ' ( ' + defAA + ' )' : '');

    // 半径
    const $range = document.createElement('div');
    $range.className = 'stock_td_range align-self-center';
    $range.textContent = plane.radius;

    // 個数
    const $stock = document.createElement('div');
    $stock.className = 'stock_td_stock align-self-center px-2';
    $stock.textContent = stock ? getArraySum(stock.num) : 99;

    $iconDiv.appendChild(cvs);
    $planeDiv.appendChild($iconDiv);
    $planeDiv.appendChild($name);
    $planeDiv.appendChild($aa);
    $planeDiv.appendChild($range);
    $planeDiv.appendChild($stock);

    fragment.appendChild($planeDiv);
  }

  target.innerHTML = '';
  target.appendChild(fragment);

  $('#stock_type_select').change();
}

/**
 * 引数で渡された ship 配列から値を展開
 * @param {Array.<number>} type
 */
function createShipTable(type) {
  const $modal = $('#modal_ship_select').find('.modal-dialog');
  const $tbody = $('#ship_tbody');
  const target = document.getElementById('ship_tbody');
  const fragment = document.createDocumentFragment();
  const imgWidth = 120;
  const imgHeight = 30;
  let dispData = [];
  let prevType = 0;
  const displayMode = $modal.find('.toggle_display_type.selected').data('mode');
  const visibleFinal = $('#display_final').prop('checked');
  const searchWord = $('#ship_word').val().trim();

  setting.visibleFinal = visibleFinal;
  saveLocalStrage('setting', setting);

  // 艦種ソート後、改造元idソート
  for (const typeObj of SHIP_TYPE) {
    const tmp = SHIP_DATA.filter(v => v.type === typeObj.id);
    tmp.sort((a, b) => a.orig > b.orig ? 1 : a.orig === b.orig ? (a.id > b.id ? 1 : -1) : -1);
    dispData = dispData.concat(tmp);
  }

  if (displayMode === "multi") {
    $modal.addClass('modal-xl');
    $tbody.addClass('d-flex flex-wrap');
    $('#ship_thead').addClass('d-none').removeClass('d-flex');
  }
  else {
    $modal.removeClass('modal-xl');
    $tbody.removeClass('d-flex flex-wrap');
    $('#ship_thead').addClass('d-flex').removeClass('d-none');
  }

  for (const ship of dispData) {
    // 艦種絞り込み
    if (type[0] !== 0 && !type.includes(ship.type)) continue;
    if (visibleFinal && !ship.final) continue;
    if (searchWord && !ship.name.includes(searchWord)) continue;

    // ラッパー
    const $shipDiv = document.createElement('div');
    $shipDiv.className = 'ship ship_tr d-flex ' + (displayMode === "multi" ? 'tr_multi' : 'py-1');
    $shipDiv.dataset.shipid = ship.id;

    // アイコンラッパー
    const $iconDiv = document.createElement('div');
    $iconDiv.className = 'ml-1 align-self-center pt-1';
    // アイコン
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    cvs.width = imgWidth;
    cvs.height = imgHeight;
    ctx.drawImage(IMAGES['ship' + ship.id], 0, 0, imgWidth, imgHeight);

    $iconDiv.appendChild(cvs);

    // ID 名称 ラッパー
    const $infoDiv = document.createElement('div');
    $infoDiv.className = 'ml-1 align-self-center';
    // ID
    const $idDiv = document.createElement('div');
    $idDiv.className = 'text-primary font_size_11';
    $idDiv.textContent = 'ID : ' + (ship.id > 1000 ? ship.orig + 'b' : ship.id);
    // 名称
    const $nameDiv = document.createElement('div');
    $nameDiv.textContent = ship.name;

    $infoDiv.appendChild($idDiv);
    $infoDiv.appendChild($nameDiv);

    // 複数表示時カテゴリ分け
    if (displayMode === "multi" && prevType !== ship.type) {
      const $typeDiv = document.createElement('div');
      $typeDiv.className = 'w-100 d-flex mt-3';

      const $type = document.createElement('div');
      $type.className = 'font_size_12 font_color_777 align-self-center';
      $type.textContent = SHIP_TYPE.find(v => v.id === ship.type).name;

      const $typeLine = document.createElement('div');
      $typeLine.className = 'flex-grow-1 border-bottom align-self-center mx-2';

      $typeDiv.appendChild($type);
      $typeDiv.appendChild($typeLine);

      fragment.appendChild($typeDiv);
    }

    $shipDiv.appendChild($iconDiv);
    $shipDiv.appendChild($infoDiv);

    // スロットたち
    if (displayMode === "single") {
      for (let index = 0; index < 5; index++) {
        const $slotDiv = document.createElement('div');
        $slotDiv.className = 'ship_td_slot font_size_12 align-self-center ' + (index === 0 ? 'ml-auto' : '');
        $slotDiv.textContent = (index < ship.slot.length ? ship.slot[index] : '');

        $shipDiv.appendChild($slotDiv);
      }
    }

    fragment.appendChild($shipDiv);
    prevType = ship.type;
  }

  target.innerHTML = '';
  target.appendChild(fragment);
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
 * @param {Array.<number>} type type[0] === 0 は全て選択時
 */
function createEnemyTable(type) {
  const $modal = $('#modal_enemy_select').find('.modal-dialog');
  const $tbody = $('#enemy_tbody');
  const target = document.getElementById('enemy_tbody');
  const fragment = document.createDocumentFragment();
  const imgWidth = 128;
  const imgHeight = 32;
  let dispData = [];
  let prevType = 0;
  const displayMode = $modal.find('.toggle_display_type.selected').data('mode');
  const searchWord = $('#enemy_word').val().trim();

  // 第1艦種(type[0]行目)順で取得後、無印idソート（イロハ級のみ）
  for (const typeObj of ENEMY_TYPE) {
    const tmp = ENEMY_DATA.filter(x => x.type[0] === typeObj.id && x.type[0] < 100);
    dispData = dispData.concat(tmp.sort((a, b) => a.orig > b.orig ? 1 : a.orig < b.orig ? -1 : a.id - b.id));
  }

  // IDソート(姫系)
  for (const typeObj of ENEMY_TYPE) {
    const tmp = ENEMY_DATA.filter(x => x.type[0] === typeObj.id && x.type[0] >= 100);
    dispData = dispData.concat(tmp.sort((a, b) => a.id > b.id ? 1 : -1));
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

  for (const enemy of dispData) {
    // 艦種で絞る
    if (type[0] !== 0 && !isContain(type, enemy.type)) continue;
    // 検索語句で絞る
    if (searchWord && !enemy.name.includes(searchWord)) continue;

    let ap = 0;
    let lbAp = 0;
    const len = enemy.slot.length;
    for (let i = 0; i < len; i++) {
      const plane = ENEMY_PLANE_DATA.find(v => v.id === enemy.eqp[i]);
      if (!plane) continue;
      if (plane.type !== 5) ap += Math.floor(plane.antiAir * Math.sqrt(enemy.slot[i]));
      else lbAp += Math.floor(plane.antiAir * Math.sqrt(enemy.slot[i]));
    };
    lbAp += ap;

    // ラッパー
    const $enemyDiv = document.createElement('div');
    $enemyDiv.className = 'enemy enemy_tr d-flex ' + (displayMode === "multi" ? 'enemy_tr_multi' : '');
    $enemyDiv.dataset.enemyid = enemy.id;

    // アイコンラッパー
    const $iconDiv = document.createElement('div');
    $iconDiv.className = 'ml-1 align-self-center pt-1_5';
    // アイコン
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    cvs.width = imgWidth;
    cvs.height = imgHeight;
    ctx.drawImage(IMAGES['enemy' + enemy.id], 0, 0, imgWidth, imgHeight);

    $iconDiv.appendChild(cvs);

    // ID 名称 ラッパー
    const $infoDiv = document.createElement('div');
    $infoDiv.className = 'ml-1 align-self-center';
    // ID
    const $idDiv = document.createElement('div');
    $idDiv.className = 'text-primary font_size_11';
    $idDiv.textContent = 'ID : ' + (enemy.id + 1500);
    // 名称
    const $nameDiv = document.createElement('div');
    $nameDiv.className = 'font_size_12';
    $nameDiv.innerHTML = drawEnemyGradeColor(enemy.name);

    $infoDiv.appendChild($idDiv);
    $infoDiv.appendChild($nameDiv);

    // 複数表示時カテゴリ分け
    if (displayMode === "multi" && prevType !== enemy.type[0] && enemy.id !== -1) {
      const $typeDiv = document.createElement('div');
      $typeDiv.className = 'w-100 d-flex mt-3';

      const $type = document.createElement('div');
      $type.className = 'font_size_12 font_color_777 align-self-center';
      $type.textContent = ENEMY_TYPE.find(v => v.id === enemy.type[0]).name;

      const $typeLine = document.createElement('div');
      $typeLine.className = 'flex-grow-1 border-bottom align-self-center mx-2';

      $typeDiv.appendChild($type);
      $typeDiv.appendChild($typeLine);

      fragment.appendChild($typeDiv);

      prevType = enemy.type[0];
    }

    $enemyDiv.appendChild($iconDiv);
    $enemyDiv.appendChild($infoDiv);

    // 制空値
    if (displayMode === "single") {
      const $apDiv = document.createElement('div');
      $apDiv.className = 'ml-auto align-self-center enemy_td_ap';
      $apDiv.textContent = ap;

      const $lbapDiv = document.createElement('div');
      $lbapDiv.className = 'enemy_td_lbAp align-self-center';
      $lbapDiv.textContent = lbAp;

      $enemyDiv.appendChild($apDiv);
      $enemyDiv.appendChild($lbapDiv);
    }

    fragment.appendChild($enemyDiv);
  }
  target.innerHTML = '';
  target.appendChild(fragment);

  // 艦隊選択モーダル内のボタン非活性
  $('#modal_enemy_select').find('.btn_remove').prop('disabled', true);
}

/**
 * 機体プリセットを生成、展開
 */
function loadPlanePreset() {
  const $modal = $('#modal_plane_preset');
  // strage 読み込み
  planePreset = loadLocalStrage('planePreset');

  // strage に存在しなかった場合初期プリセットを展開
  if (!planePreset) {
    planePreset = DEFAULT_PLANE_PRESET.concat();
  }

  const parentId = castInt($('#modal_plane_preset').data('parentid'));
  let presetText = '';
  const len = planePreset.length;
  for (let index = 0; index < len; index++) {
    const preset = planePreset[index];
    let infoText = `
      <div class="preset_td preset_td_info text-danger cur_help ml-auto" data-toggle="tooltip" data-boundary="window"
        title="全ての装備が展開できません。">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
    `;
    let i = 0;
    for (const planeId of preset.planes) {
      if (checkInvalidPlane(parentId, PLANE_DATA.find(v => v.id === planeId))) {
        infoText = `
        <div class="preset_td preset_td_info text-warning cur_help ml-auto" data-toggle="tooltip" data-boundary="window"
          title="展開できない装備が含まれています。">
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

  // アラート非表示
  $modal.find('.alert').addClass('d-none');
  $modal.find('.preset_tr').removeClass('preset_selected');
  $modal.find('.preset_tbody').html(presetText);
  $modal.find('.preset_name')
    .val('左のプリセット一覧をクリック')
    .prop('disabled', true);
  $modal.find('.is-invalid').removeClass('is-invalid');
  $modal.find('.is-valid').removeClass('is-valid');
  $modal.find('.preset_preview_tbody').html('');
  $modal.find('.btn:not(.btn_cancel)').prop('disabled', true);
  $('.preset_td_info').tooltip();
}

/**
 * 機体プリセット詳細欄に引数のプリセットデータを展開
 * 第一引数にデータがなかった場合は新規作成として DOM 構築を行う
 * @param {Object} preset { id:x, name:'', planes:[] }構造のオブジェクト
 */
function drawPlanePresetPreview(preset) {
  let text = '';
  // 展開する機体のリスト
  let planes = [];
  const $modal = $('#modal_plane_preset');
  const parentId = castInt($('#modal_plane_preset').data('parentid'));

  // アラート非表示
  $modal.find('.alert').addClass('d-none');
  if (preset) {
    $modal.find('.preset_name').val(preset.name);
    for (const id of preset.planes) planes.push(PLANE_DATA.find(v => v.id === id));
  }
  else {
    // プリセットが見つからなかったので新規登録画面呼び出し
    $modal.find('.preset_name').val('');

    $target.find('.' + ($target.attr('class').includes('lb_tab') ? 'lb_plane' : 'ship_plane')).each((i, e) => {
      if ($(e).attr('class').includes('d-none')) return;
      const plane = PLANE_DATA.find(v => v.id === castInt($(e)[0].dataset.planeid));
      if (plane) planes.push(plane);
    });

    if (planes.length === 0) $modal.find('.alert').removeClass('d-none');
  }

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
  $modal.find('.btn_expand_preset').prop('disabled', !preset);
  $modal.find('.btn_delete_preset').prop('disabled', !preset);
  $modal.find('.btn_commit_preset').prop('disabled', true);
  $modal.find('.preset_name').prop('disabled', planes.length === 0);
  $modal.find('.is-invalid').removeClass('is-invalid');
  $modal.find('.is-valid').removeClass('is-valid');
  $modal.find('.preset_preview_tbody').html(text);
  $modal.find('.preset_preview_td_info').tooltip();
}

/**
 * 機体プリセット更新
 */
function updatePlanePreset() {
  const presetId = castInt($('.preset_selected').data('presetid'));
  const planeIds = [];
  $('.preset_preview_tr').each((i, e) => planeIds.push(castInt($(e)[0].dataset.planeid)));

  let max_id = 0;
  for (const preset of planePreset) if (max_id < preset.id) max_id = preset.id;
  const newPreset = {
    id: (presetId === -1 ? max_id + 1 : presetId),
    name: $('#modal_plane_preset').find('.preset_name').val().replace(/^\s+|\s+$/g, ''),
    planes: planeIds
  };

  planePreset = planePreset.filter(v => v.id !== presetId);
  planePreset.push(newPreset);
  planePreset.sort((a, b) => a.id - b.id);
  // ローカルストレージ保存
  saveLocalStrage('planePreset', planePreset);
}

/**
 * 機体プリセット削除
 */
function deletePlanePreset() {
  const presetId = castInt($('.preset_selected').data('presetid'));
  planePreset = planePreset.filter(v => v.id !== presetId);
  planePreset.sort((a, b) => a.id - b.id);
  // ローカルストレージ保存
  saveLocalStrage('planePreset', planePreset);
}

/**
 * 海域選択欄生成
 */
function createMapSelect() {
  let text = '';
  for (const w of WORLD_DATA) {
    const world = w.world;
    const maps = MAP_DATA.filter(m => Math.floor(m.area / 10) === world);
    text += `<optgroup label="${w.name}">`;
    for (const m of maps) {
      const map = m.area % 10;
      text += `<option value="${m.area}">${world > 1000 ? 'E' : world}-${map} : ${m.name}</option>`;
    }
  }
  $('#map_select').html(text);
}

/**
 * マス情報を生成
 */
function createNodeSelect() {
  const area = castInt($('#map_select').val());
  let lv = -1;
  if (area < 1000) {
    $('#select_difficulty_div').addClass('d-none');
  }
  else {
    $('#select_difficulty_div').removeClass('d-none');
    lv = castInt($('#select_difficulty').val());
  }

  // マップ設定
  $('#map_img').attr('src', './img/map/' + area + '.png');

  let patterns = ENEMY_PATTERN.filter(v => v.area === area && v.lv === lv);
  // 重複は切る
  patterns = patterns.filter((x, i, self) => self.findIndex(v => v.node === x.node) === i);

  // 空襲はてっぺん
  patterns.sort((a, b) => {
    if (a.node == '空襲' && b.node == '空襲') return 0;
    else if (a.node == '空襲') return -1;
    else if (b.node == '空襲') return 1;
    else return 0;
  });
  const len = patterns.length;
  let text = '';
  let text2 = '';
  for (let index = 0; index < len; index++) {
    const nodeName = patterns[index].node;
    const coords = patterns[index].coords;
    text += `
    <div class="d-flex node_tr justify-content-center py-2 w-100 cur_pointer" data-node="${nodeName}">
      <div class="align-self-center">${nodeName}</div>
    </div>
  `;

    // クリック座標設定
    if (coords !== '') {
      text2 += `<area class="node" title="${nodeName}" coords="${coords}" shape="rect">`;
    }
  }

  $('#node_tbody').html(text);
  $('#clickable_nodes').html(text2);
  $('#enemy_pattern_tbody').html('');
  $('#enemy_pattern_select').html('<li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#">編成1</a></li>');
  $('#enemy_pattern_air_power').text('0');
  $('#enemy_display_mode_parent').addClass('d-none').removeClass('d-flex');
  $('#btn_expand_enemies').prop('disabled', true);
}

/**
 * 選択されている海域情報から敵艦隊を表示する
 * @param {number} patternNo パターン番号 未指定時は0
 */
function createEnemyPattern(patternNo = 0) {
  const area = castInt($('#map_select').val());
  const node = $('.node_selected').data('node');
  let lv = -1;
  if (area < 1000) $('#select_difficulty_div').addClass('d-none');
  else {
    $('#select_difficulty_div').removeClass('d-none');
    lv = castInt($('#select_difficulty').val());
  }

  // 敵艦隊一覧生成
  let text = '';
  let sumAp = 0;
  let sumFreetAntiAir = 0;
  const patterns = ENEMY_PATTERN.filter(v => v.area === area && v.node === node && v.lv === lv);
  const pattern = patterns[patternNo];
  const enemies = pattern.enemies;
  const enemiesLength = enemies.length;
  for (let index = 0; index < enemiesLength; index++) {
    const enemy = ENEMY_DATA.find(v => v.id === enemies[index]);
    const enemyObj = createEnemyObject(enemy.id);
    sumAp += enemyObj.ap;
    sumFreetAntiAir += enemyObj.aabo;
    text += `
    <div class="enemy_pattern_tr mx-1 d-flex border-bottom" data-enemyid="${enemy.id}">
      <div class="mr-1 align-self-center enemy_pattern_tr_image">
        <img src="./img/enemy/${enemy.id}.png" class="enemy_img">
      </div>
      <div class="align-self-center enemy_pattern_tr_text">
        <div class="font_size_11 text-primary">ID: ${enemy.id + 1500}</div>
        <div>${drawEnemyGradeColor(enemy.name)}</div>
      </div>
    </div>
    `;
  }

  // 陣形補正
  const formation = FORMATION.find(v => v.id === pattern.form);
  // 艦隊防空値 [陣形補正 * 各艦の艦隊対空ボーナス値の合計] * 2
  const fleetAntiAir = Math.floor(formation.correction * sumFreetAntiAir) * 2;

  $('#enemy_pattern_anti_air').text(fleetAntiAir);
  $('#enemy_pattern_formation').text(formation.name);


  // 編成パターンタブ生成
  if (patternNo === 0) {
    let tabText = '';
    for (let i = 0; i < patterns.length; i++) {
      tabText += `
      <li class="nav-item">
        <a class="nav-link ${i === 0 ? 'active' : ''}" data-toggle="tab" data-disp="${i}" href="#">
          ${(patterns[i].remarks ? patterns[i].remarks : '編成' + (i + 1))}
          </a>
      </li>
      `;
    }
    $('#enemy_pattern_select').html(tabText);
  }

  const borders = getAirStatusBorder(sumAp);
  $('#enemy_pattern_tbody').html(text);
  $('#enemy_pattern_air_power').text(sumAp);
  $('#enemy_pattern_status0').text(borders[0]);
  $('#enemy_pattern_status1').text(borders[1]);
  $('#enemy_pattern_status2').text(borders[2]);
  $('#enemy_pattern_status3').text(borders[3]);
  $('#btn_expand_enemies').prop('disabled', false);


  // 表示形式切り替えの有効無効と表示形式
  if (enemiesLength > 6) {
    $('#enemy_display_mode_parent').removeClass('d-none').addClass('d-flex');
    if (setting.enemyDisplayImage) {
      $('#enemy_pattern_tbody').find('.enemy_pattern_tr_text').addClass('d-none');
    }
    else {
      $('#enemy_pattern_tbody').find('.enemy_pattern_tr_image').addClass('d-none');
    }
  }
  else {
    $('#enemy_display_mode_parent').addClass('d-none').removeClass('d-flex');
  }
}

/**
 * 編成プリセット読み込み
 */
function loadMainPreset() {
  const $modal = $('#modal_main_preset');
  // strage 読み込み
  presets = loadLocalStrage('presets');
  // strage に存在しなかった場合
  if (!presets) presets = [];

  let text = '';
  const len = presets.length;
  for (let index = 0; index < len; index++) {
    const preset = presets[index];
    text += `
      <div class="preset_tr d-flex px-1 py-2 my-1 w-100 cur_pointer" data-presetid="${preset[0]}">
        <div class="preset_td text-primary">${index + 1}.</div>
        <div class="preset_td ml-2">${preset[1]}</div>
      </div>
    `;
  }

  $modal.find('.preset_selected').removeClass('preset_selected');
  $modal.find('.is-invalid').removeClass('is-invalid');
  $modal.find('.is-valid').removeClass('is-valid');
  $modal.find('.preset_tbody').html(text);
  $modal.find('.preset_name').val('').prop('disabled', true);
  $modal.find('.btn:not(.btn_cancel)').prop('disabled', true);
  $modal.find('.btn_commit_preset_header').addClass('d-none');
  $modal.find('.btn_commit_preset_header').tooltip('hide');
  $modal.find('.btn_output_url').prop('disabled', false);
  $modal.find('.btn_output_deck').prop('disabled', false);
  $modal.find('#preset_remarks').prop('disabled', true).val('');
  $modal.find('.preset_data').data('presetid', 0);
  $('#main_preset_load_tab').find('input').val('');
}

/**
 * 編成プリセット詳細欄に引数のプリセットデータを展開
 * 第一引数にデータがなかった場合は新規作成とする
 * @param {Array} preset プリセット
 */
function drawMainPreset(preset) {
  const $modal = $('#modal_main_preset');
  $modal.find('.btn_expand_preset').prop('disabled', !preset);
  $modal.find('.btn_delete_preset').prop('disabled', !preset);

  if (preset) {
    $modal.find('.preset_data').data('presetid', preset[0]);
    $modal.find('.preset_name').val(preset[1]);
    $modal.find('.btn_commit_preset').text('編成変更');
    $modal.find('.btn_commit_preset').prop('disabled', false);
    $modal.find('.btn_commit_preset_header').removeClass('d-none');
    $modal.find('.btn_commit_preset_header').prop('disabled', false);
    $modal.find('#preset_remarks').val(preset[3]);
  }
  else {
    // プリセットが見つからなかったので新規登録
    let maxId = 0;
    for (const preset of presets) if (maxId < preset[0]) maxId = preset[0];
    $modal.find('.preset_data').data('presetid', castInt(maxId) + 1);
    $modal.find('.btn_commit_preset').text('新規登録');
    $modal.find('.btn_commit_preset').prop('disabled', true);
    $modal.find('.btn_commit_preset_header').addClass('d-none');
    $modal.find('.preset_name').val('');
    $modal.find('#preset_remarks').val('');
  }

  $modal.find('.is-invalid').removeClass('is-invalid');
  $modal.find('.is-valid').removeClass('is-valid');
  $modal.find('.preset_name').prop('disabled', false);
  $modal.find('#preset_remarks').prop('disabled', false);
  $modal.find('.alert').addClass('hide').removeClass('show');
}

/**
 * 編成プリセット 新規登録 / 更新処理
 */
function updateMainPreset() {
  // プリセット生成
  const preset = createPreset();
  // 同idを持つプリセットがあれば上書き
  let isUpdate = false;
  for (let index = 0; index < presets.length; index++) {
    if (presets[index][0] === preset[0]) {
      presets[index] = preset;
      isUpdate = true;
      break;
    }
  }
  // 更新がなかったら新規登録
  if (!isUpdate) presets.push(preset);
  saveLocalStrage('presets', presets);

  $('#modal_main_preset').find('.task').text(isUpdate ? '編成更新' : '新規登録');
  $('#modal_main_preset').find('.alert').removeClass('hide').addClass('show');
}

/**
 * プリセット名 メモのみ変更
 */
function updateMainPresetName() {
  const preset = presets.find(v => v[0] === castInt($('#modal_main_preset').find('.preset_data').data('presetid')));
  if (preset) {
    let presetName = $('#modal_main_preset').find('.preset_name').val().trim();
    // 空はないが念のため空が来た場合
    if (presetName.length === 0) {
      const today = new Date();
      presetName = `preset-${today.getFullYear() + '' + today.getMonth() + 1 + '' + today.getDate()}`;
    }
    preset[1] = presetName;
    preset[3] = $('#preset_remarks').val().trim();
  }
  saveLocalStrage('presets', presets);

  $('#modal_main_preset').find('.task').text('更新');
  $('#modal_main_preset').find('.alert').removeClass('hide').addClass('show');
}

/**
 * 指定したidのプリセットデータを展開する
 * @param {Object} preset 展開対象プリセット(デコード済)
 * @param {boolean} isResetLandBase データ未指定の際、基地航空隊をリセットする
 * @param {boolean} isResetFriendFleet データ未指定の際、艦隊をリセットする
 * @param {boolean} isResetEnemyFleet データ未指定の際、敵艦隊をリセットする
 */
function expandMainPreset(preset, isResetLandBase = true, isResetFriendFleet = true, isResetEnemyFleet = true) {
  if (!preset) return;
  try {
    // 基地航空隊展開
    $('.lb_plane').each((i, e) => {
      const landBase = preset[0];
      if (!landBase || landBase.length === 0) return;
      const raw = landBase[0].find(v => v[4] === i);
      if (raw && raw.length !== 0) {
        const plane = { id: raw[0], prof: raw[1], remodel: raw[2], slot: raw[3] };
        setLBPlaneDiv($(e), plane);
      }
      else if (isResetLandBase) setLBPlaneDiv($(e));
    });
    $('.ohuda_select').each((i, e) => {
      const landBase = preset[0];
      // disabled 解除
      $(e).find('option').prop('disabled', false);
      if (landBase && landBase.length !== 0) $(e).val(castInt(landBase[1][i], -1));
      else $(e).val(-1);

      ohuda_Changed($(e), true);
    });

    if (isResetFriendFleet) {
      // 艦娘クリア
      clearShipDivAll(6);
      let shipCountFleet1 = 0;
      let shipCountFleet2 = 0;
      // 艦娘展開
      $('.ship_tab').each((i, e) => {
        const ship = preset[1].find(v => v[2] === i);
        if (!ship) return;
        setShipDiv($(e), ship[0]);
        $(e).find('.ship_plane').each((j, e) => {
          const raw = ship[1].find(v => v[4] === j);
          if (raw && !$(e).hasClass('d-none')) {
            const plane = { id: raw[0], prof: raw[1], remodel: raw[2], slot: raw[3] };
            setPlaneDiv($(e), plane, true);
          }
        });
        if (i <= 6) shipCountFleet1 = (i + 1);
        else shipCountFleet2 = (i + 1) - 6;
      });
      shipCountFleet1 = Math.min(Math.max(shipCountFleet1, 2), 6);
      $('#friendFleet_item1').find('.display_ship_count').val(shipCountFleet1 % 2 === 1 ? shipCountFleet1 + 1 : shipCountFleet1);
      display_ship_count_Changed($('#friendFleet_item1').find('.display_ship_count'), true);
      shipCountFleet2 = Math.min(Math.max(shipCountFleet2, 2), 6);
      $('#friendFleet_item2').find('.display_ship_count').val(shipCountFleet2 % 2 === 1 ? shipCountFleet2 + 1 : shipCountFleet2);
      display_ship_count_Changed($('#friendFleet_item2').find('.display_ship_count'), true);
    }

    // 敵艦展開
    let battle = 1;
    for (let index = 0; index < preset[2].length; index++) {
      if (battle < preset[2][index][0] + 1) battle = preset[2][index][0] + 1;
    }
    battle = Math.min(battle, 10);
    // クリア
    if (preset[2].length !== 0 || isResetEnemyFleet) {
      clearEnemyDivAll(battle);
      $('#battle_count').val(battle);
    }
    $(isDefMode ? '#air_raid_enemies' : '.battle_content').each((i, e) => {
      const enemyFleet = preset[2].find(v => v[0] === i);
      if (enemyFleet) {
        if (enemyFleet.length >= 3) $(e)[0].dataset.celldata = enemyFleet[2];
        else $(e)[0].dataset.celldata = '';

        if (enemyFleet.length >= 4) {
          if (isDefMode) {
            const cellType = castInt(enemyFleet[3]);
            $(e).find('.cell_type').val([0, 5].includes(cellType) ? 5 : 3);
          }
          else {
            $(e).find('.cell_type').val(enemyFleet[3]);
          }
        }
        else $(e).find('.cell_type').val(1);
        if (enemyFleet.length >= 5) $(e).find('.formation').val(enemyFleet[4]);
        else $(e).find('.formation').val(1);

        for (const id of enemyFleet[1]) {
          if (id > 0) setEnemyDiv($(e).find('.enemy_content:last()'), id);
          // 負値の場合は直接入力の制空値
          else if (id < 0) setEnemyDiv($(e).find('.enemy_content:last()'), -1, -(id));
        }
      }
    });

  } catch (error) {
    // 全てクリアしておく
    $('.ohuda_select').val(-1);
    $('.lb_plane').each((i, e) => { setLBPlaneDiv($(e)); });
    clearShipDivAll(6);
    clearEnemyDivAll(1);
    $('#battle_count').val(1);

    // エラー通知
    const $modal = $('#modal_confirm');
    $modal.find('.modal-body').html(`
      <div class="px-2">
        <div>一度、ブラウザに保存された本サイトの設定を削除してみてください。「詳細設定」欄の最下部の設定削除ボタンから削除が可能です。</div>
        <div class="h6 mt-4">症状が改善しない場合</div>
        <div class="px-2">
          申し訳ありません、お手数ですが、どのような操作を行った際にこの画面が表示されたか
          <a href="https://odaibako.net/u/noro_006" target="_blank">こちら</a>までご報告いただければ幸いです。
        </div>
        <div class="mt-2 px-2">報告を頂き次第、可能な限り早期のバグフィックスに努めます。</div>
        <div class="mt-3 px-2 font_size_8 font_color_fff">message : ${error.message}</div>
        <div class="px-2 font_size_8 font_color_fff">stack : ${error.stack}</div>
      </div>
    `);
    confirmType = "Error";
    $modal.modal('show');
  }
}

/**
 * 基地航空隊プリセットを生成し返却
 * @returns {Array} 基地プリセット
 */
function createLandBasePreset() {
  const landBasePreset = [[], []];
  $('.ohuda_select').each((i, e) => { landBasePreset[1].push(castInt($(e).val())); });
  $('.lb_plane:not(.ui-draggable-dragging)').each((i, e) => {
    const $e = $(e);
    const plane = [
      castInt($e[0].dataset.planeid),
      castInt($e.find('.prof_select')[0].dataset.prof),
      castInt($e.find('.remodel_value').text()),
      castInt($e.find('.slot').text()),
      i
    ];
    // 装備があれば追加
    if (plane[0] !== 0) landBasePreset[0].push(plane);
  });

  return landBasePreset;
}

/**
 * 艦隊プリセットを生成し返却
 * @returns {Array} 艦隊プリセット
 */
function createFriendFleetPreset() {
  const friendFleetPreset = [];
  let shipIndex = 0;
  $('.ship_tab').each((i, e) => {
    // 第2艦隊の開始を検知
    if (i === 6) shipIndex = 6;
    // 非表示なら飛ばす
    if ($(e).attr('class').includes('d-none')) return;

    const ship = [castInt($(e)[0].dataset.shipid), [], shipIndex];
    $(e).find('.ship_plane:not(.ui-draggable-dragging)').each((j, ce) => {
      const $ce = $(ce);
      const plane = [
        castInt($ce[0].dataset.planeid),
        castInt($ce.find('.prof_select')[0].dataset.prof),
        castInt($ce.find('.remodel_value').text()),
        castInt($ce.find('.slot').text()),
        j
      ];
      // 装備されていない場合飛ばす
      if (plane[0] !== 0) ship[1].push(plane);
    });

    // 艦娘か機体が1件でもあれば追加
    if (ship[0] !== 0 || ship[1].length !== 0) {
      friendFleetPreset.push(ship);
      // インクリメント
      shipIndex++;
    }
  });

  return friendFleetPreset;
}

/**
 * 敵艦隊プリセットを生成し返却
 * @returns {Array} 敵艦隊プリセット
 */
function createEnemyFleetPreset() {
  const enemyFleetPreset = [];
  $(isDefMode ? '#air_raid_enemies' : '.battle_content').each((i, e) => {
    // 非表示なら飛ばす
    if ($(e).attr('class').includes('d-none')) return;
    const enemyFleet = [i, [], $(e)[0].dataset.celldata, castInt($(e).find('.cell_type').val()), castInt($(e).find('.formation').val())];
    $(e).find('.enemy_content').each((j, ce) => {
      const enemyId = castInt($(ce)[0].dataset.enemyid);
      const ap = castInt($(ce).find('.enemy_ap').text());
      // id:0 の場合飛ばす
      if (enemyId === 0) return;
      if (enemyId > 0) enemyFleet[1].push(enemyId);
      // ※直接入力なら制空値を負値にして格納
      else if (ap > 0) enemyFleet[1].push(-ap);
    });

    // 空じゃなければ追加
    if (enemyFleet[1].length !== 0) enemyFleetPreset.push(enemyFleet);
  });
  return enemyFleetPreset;
}

/**
 * 現在の入力状況からプリセットデータを生成、返却する
 * @param {boolean} isFull trueの場合名前　メモ情報を付加し、プリセットはエンコード済みで返す
 * @returns {Object} プリセット
 */
function createPreset() {
  // プリセット名
  let presetName = $('#modal_main_preset').find('.preset_name').val().trim();
  if (presetName.length === 0) presetName = ``;
  const preset = [
    castInt($('#modal_main_preset').find('.preset_data').data('presetid')),
    presetName,
    encordPreset(),
    $('#preset_remarks').val().trim()
  ];

  return preset;
}


/**
 * 現在の入力状況からbase64エンコード済みプリセットデータを生成、返却する
 * @returns {string} エンコード済プリセットデータ
 */
function encordPreset() {
  try {
    // 現在のプリセットを取得し、オブジェクトを文字列化
    const preset = [
      createLandBasePreset(),
      createFriendFleetPreset(),
      createEnemyFleetPreset()
    ];
    const dataString = JSON.stringify(preset);
    const b64 = utf8_to_b64(dataString);
    const utf8 = b64_to_utf8(b64);
    // 複号までチェック
    JSON.parse(utf8);

    return b64;
  }
  catch (error) {
    // 失敗時は空のプリセットデータ
    const emp = [[], [], []];
    return utf8_to_b64(JSON.stringify(emp));
  }
}

/**
 * 渡したinput値からプリセットデータを生成
 * @param {string} input
 * @returns {array} 基地 艦隊 敵艦プリセット 失敗時空プリセット[[],[],[]]
 */
function decordPreset(input) {
  try {
    const str = b64_to_utf8(input);
    const preset = JSON.parse(str);
    return preset;
  }
  catch (error) {
    return [[], [], []];
  }
}

/**
 * 指定したidのプリセットデータを削除する
 * @param {number} id 削除対象プリセットid
 */
function deleteMainPreset(id) {
  presets = presets.filter(v => v[0] !== id);
  presets.sort((a, b) => a[0] - b[0]);
  saveLocalStrage('presets', presets);
  const $modal = $('#modal_main_preset');
  $modal.find('.alert').removeClass('hide').addClass('show');
  $modal.find('.task').text('削除');
  loadMainPreset();
}

/**
 * デッキビルダーフォーマットデータからプリセットを生成
 * f(leet)*は艦隊、s(hip)*は船、i(item)*は装備でixは拡張スロット、rfは改修、masは熟練度
 * @param {string} deck [基地プリセット, 艦隊プリセット, []]
 * @returns {object} プリセットデータとして返却 失敗時null
 */
function readDeckBuilder(deck) {
  if (!deck) return null;
  try {
    deck = decodeURIComponent(deck).trim('"');
    const obj = JSON.parse(deck);

    const fleets = [];
    const landBase = [[], [-1, -1, -1]];
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (key === "version" || !value) return;

      // 基地データ抽出
      if (key.indexOf("a") === 0 && value.hasOwnProperty("items")) {
        // 航空隊番号
        const lbIndex = castInt(key.replace('a', '')) - 1;
        // 札設定
        landBase[1][lbIndex] = value.hasOwnProperty("mode") ? (value.mode === 1 ? 2 : value.mode === 2 ? 0 : -1) : -1;

        Object.keys(value.items).forEach((i) => {
          const i_ = value.items[i];
          if (!i_ || !i_.hasOwnProperty("id")) return;

          // スロット番号
          const planeIndex = castInt(i.replace('i', '')) - 1 + lbIndex * 4;

          // 装備プロパティの抽出
          const plane = [0, 0, 0, 18, planeIndex];
          Object.keys(i_).forEach((key) => {
            if (key === "id") plane[0] = castInt(i_[key]);
            else if (key === "mas") plane[1] = castInt(i_[key]);
            else if (key === "rf") plane[2] = castInt(i_[key]);
          });

          landBase[0].push(plane);
        });
      }

      // 艦隊データ抽出
      if (key.indexOf("f") === 0) {
        // 艦隊番号
        const fleetNo = castInt(key.replace('f', '')) - 1;

        // 艦娘の抽出
        const fleet = [fleetNo, []];
        Object.keys(value).forEach((s) => {
          const s_ = value[s];
          if (!s_ || !s_.hasOwnProperty('items')) return;

          // マスタデータと照合
          const shipData = SHIP_DATA.find(v => v.deckid === castInt(s_.id));
          if (!shipData) return;

          // 装備の抽出
          const ship = [shipData.id, [], (castInt(s.replace('s', '')) - 1 + 6 * fleetNo)];
          Object.keys(s_.items).forEach((i) => {
            const i_ = s_.items[i];
            if (!i_ || !i_.hasOwnProperty("id")) return;

            // マスタデータと照合
            if (!PLANE_DATA.find(v => v.id === castInt(i_.id))) return;

            // スロット番号
            const planeIndex = castInt(i.replace('i', '')) - 1;

            // 装備プロパティの抽出
            const plane = [0, 0, 0, shipData.slot[planeIndex], planeIndex];
            Object.keys(i_).forEach((i_key) => {
              if (i_key === "id") plane[0] = castInt(i_[i_key]);
              else if (i_key === "mas") plane[1] = castInt(i_[i_key]);
              else if (i_key === "rf") plane[2] = castInt(i_[i_key]);
            });

            ship[1].push(plane);
          });

          fleet[1].push(ship);
        });
        fleets.push(fleet);
      }
    });


    // 第1、第2艦隊のみに絞る
    const fleet1 = fleets.find(v => v[0] === 0)[1];
    if (fleets.length >= 2) {
      const fleet2 = fleets.find(v => v[0] === 1)[1];
      const marge = fleet1.concat(fleet2);
      return [landBase, marge, []];
    }
    else return [landBase, fleet1, []];

  } catch (error) {
    return null;
  }
}


/**
 * 指定プリセットをデッキビルダーフォーマットに変換
 * デッキフォーマット {version: 4, f1: {s1: {id: '100', items:{i1:{id:1, rf: 4, mas:7},{i2:{id:3, rf: 0}}...,ix:{id:43}}}, s2:{}...},...}（2017/2/3更新）
 * デッキフォーマット {version: 4.2, f1: {}, s2:{}...}, a1:{mode:1, items:{i1:{id:1, rf: 4, mas:7}}}（2019/12/5更新）
 * @param {string} デッキビルダー形式データ
 */
function convertToDeckBuikder() {
  try {
    const fleet = createFriendFleetPreset();
    const landBase = createLandBasePreset();
    const obj = {
      version: 4,
      f1: {},
      f2: {},
      a1: { mode: 0, items: {} },
      a2: { mode: 0, items: {} },
      a3: { mode: 0, items: {} }
    };

    // 基地データ
    for (const plane of landBase[0]) {
      obj["a" + (Math.floor(plane[4] / 4) + 1)].items["i" + (Math.floor(plane[4] % 4) + 1)] = { id: plane[0], rf: plane[2], mas: plane[1] };
    }
    for (let index = 0; index < landBase[1].length; index++) {
      const mode = landBase[1][index];
      obj["a" + (index + 1)].mode = mode > 0 ? 1 : mode === 0 ? 2 : 0;
    }


    // 艦隊データ
    for (let index = 0; index < fleet.length; index++) {
      const ship = fleet[index];
      const shipData = SHIP_DATA.find(v => v.id === ship[0]);
      if (!shipData) continue;

      // 装備機体群オブジェクト生成
      const planes = { i1: null, i2: null, i3: null, i4: null, i5: null };
      for (const plane of ship[1]) {
        const i = { id: plane[0], rf: plane[2], mas: plane[1] };
        planes["i" + castInt(plane[4] + 1)] = i;
      }

      const s = { id: `${shipData.deckid}`, lv: 99, luck: -1, items: planes };
      const shipIndex = ship[2];
      if (shipIndex < 6) obj.f1["s" + ((shipIndex % 6) + 1)] = s;
      else obj.f2["s" + ((shipIndex % 6) + 1)] = s;
    }

    return JSON.stringify(obj);
  } catch (error) {
    return "";
  }
}

/**
 * 指定文字列を読み込み、planeStockに反映させる　失敗時false
 * @param {string} input
 */
function readEquipmentJson(input) {
  try {
    const jsonData = JSON.parse(input);
    const planeStock = loadPlaneStock();
    // いったん全ての装備を0にする
    for (const v of planeStock) {
      v.num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    for (const obj of jsonData) {
      // 装備データかチェック
      if (!obj.hasOwnProperty('api_slotitem_id')) return false;
      if (!obj.hasOwnProperty('api_level')) return false;

      const planeId = obj.api_slotitem_id;
      const remodel = obj.api_level;
      const stock = planeStock.find(v => v.id === planeId);
      if (stock) stock.num[remodel]++;
    }

    planeStock.sort((a, b) => a.id - b.id);
    saveLocalStrage('planeStock', planeStock);
    setting.inStockOnly = true;
    saveLocalStrage('setting', setting);
  } catch (error) {
    return false;
  }
  return true;
}

/**
 * 機体在庫読み込み　未定義の場合は初期化したものを返却
 */
function loadPlaneStock() {
  let planeStock = loadLocalStrage('planeStock');

  if (!planeStock || !planeStock.length) {
    const initStock = [];
    for (const plane of PLANE_DATA) {
      const stock = { id: plane.id, num: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
      initStock.push(stock);
    }
    planeStock = initStock.concat();
    saveLocalStrage('planeStock', planeStock);
  }

  return planeStock;
}

/**
 * 結果表示を行う
 */
function drawResult() {
  // 初期化
  $('#rate_table tbody').find('.rate_tr').addClass('d-none disabled_tr');
  $('.progress_area').addClass('d-none disabled_bar').removeClass('d-flex');
  const data = Object.create(chartData);
  const len = data.own.length;
  for (let i = 0; i < len; i++) {
    const ap = data.own[i];
    const eap = data.enemy[i];
    const rates = data.rate[i];
    const border = getAirStatusBorder(eap);
    let status = isDefMode ? getAirStatusIndex(ap, eap) : data.rate[i].indexOf(Math.max.apply({}, data.rate[i]));
    let width = 0;
    let visible = false;
    // 描画対象先の行インデックス 防空8、本隊だけ7、他は連番(0は一応ヘッダのため1から)
    let targetRowIndex = isDefMode ? 8 : len === 1 ? 7 : i + 1;
    const $target_bar = $('#result_bar_' + targetRowIndex);
    const $target_tr = $('#rate_row_' + targetRowIndex);

    // 制空状態毎に基準widthに対する比率
    if (status === 4) width = ap / border[3] * 100 * 0.1;
    else if (status === 3) width = ap / border[2] * 100 * 0.2;
    else if (status === 2) width = ap / border[1] * 100 * 0.45;
    else if (status <= 1) width = ap / border[0] * 100 * 0.9;

    // 基地(含防空) && 双方制空0の場合確保にしてバーは最大
    if (status === 5 && (targetRowIndex < 7 || targetRowIndex === 8)) {
      status = 0;
      width = 100;
    }
    // 本隊の場合は撃墜テーブルに従う
    else if (status === 5) {
      const abbr = $('#shoot_down_table').find('.cond.battle' + displayBattle).text();
      const airStatus = AIR_STATUS.find(v => v.abbr === abbr);
      if (airStatus) status = airStatus.id;
      if (status === 0) width = 100;
    }

    // 結果表示バーの描画
    const prevStatus = $target_bar.data('airstatus');
    $target_bar
      .removeClass('bar_status' + prevStatus)
      .addClass('bar_status' + status)
      .css({ 'width': (width > 100 ? 100 : width) + '%', })
      .data('airstatus', status);

    // 各制空状態比率の描画
    $target_tr.find('.rate_td_ap').text(ap);
    let text = `<span class="mr-1">${eap}</span><span class="text-nowrap">( `;
    for (let j = 0; j < border.length - 1; j++) {
      if (j !== 0) text += ' / ';
      if (border[j] <= ap) text += '<b>' + border[j] + '</b>';
      else text += border[j];
    }
    $target_tr.find('.rate_td_eap').html(text + ' )</span>');

    for (let j = 0; j < rates.length; j++) {
      $target_tr.find('.rate_td_status' + j).text('-');
      if (isDefMode) $target_tr.find('.rate_td_status' + status).text('100 %');
      else if (rates[j] > 0) {
        const rate = rates[j] * 100;
        $target_tr.find('.rate_td_status' + j).text((rate === 100 ? 100 : rate.toFixed(2)) + ' %');
        visible = true;
      }
    }

    // データなしの行はバー、比率ともに非表示
    if (visible || (isDefMode && targetRowIndex === 8)) {
      $target_tr.removeClass('d-none disabled_tr');
      $target_bar.closest('.progress_area').addClass('d-flex').removeClass('d-none disabled_bar');
    }
  }

  let sumBauxiteAvg = 0;
  let sumBauxiteMax = 0;
  let sumBauxiteMin = 0;
  const calculateCount = castInt($('#calculate_count').val());
  // 出撃後スロット平均、全滅率の表示
  for (let index = 0; index < chartData.slots.length; index++) {
    const s = chartData.slots[index];
    const deathRate = s.deathRate * 100;
    const node_tr = document.getElementsByClassName('slot' + s.slot + ' shipNo' + s.shipNo)[0];
    if (!node_tr) continue;
    const initSlot = castInt(node_tr.getElementsByClassName('battle1')[0].textContent);
    if (!node_tr.getElementsByClassName('battle1')[0].textContent) continue;
    const text = `<div class="text-left"><div>最大残数：${s.max}</div><div>最小残数：${s.min}</div><div>全滅回数：${s.death} / ${calculateCount}</div><div></div>`;

    const node_battle_end = node_tr.getElementsByClassName('battle_end')[0];
    node_battle_end.textContent = Math.round(s.avg);
    node_battle_end.dataset.toggle = 'tooltip';
    node_battle_end.dataset.html = 'true';
    node_battle_end.title = text;

    const node_battle_death = node_tr.getElementsByClassName('battle_death')[0];
    node_battle_death.textContent = (s.deathRate === 0 ? '-' : deathRate >= 10 ? deathRate.toFixed(1) + ' %' : deathRate.toFixed(2) + ' %');
    node_battle_death.dataset.toggle = 'tooltip';
    node_battle_death.dataset.html = 'true';
    node_battle_death.title = text;

    // 1戦目との差分から平均ボーキ消費量を算出
    if (initSlot > 0) {
      sumBauxiteAvg += 5 * (initSlot - s.avg);
      sumBauxiteMax += 5 * (initSlot - s.max);
      sumBauxiteMin += 5 * (initSlot - s.min);
    }
  }

  // 平均ボーキ消費量
  $('.battle_end.fap').html('<img src="./img/util/bauxite.png" class="img-size-18" alt="ボーキサイト"> 消費');
  $('.battle_end.eap').html(sumBauxiteMax + ' ~ ' + sumBauxiteMin + ' ( ' + sumBauxiteAvg.toFixed(1) + ' )');

  $('#shoot_down_table_tbody .battle_end').tooltip();
  $('#shoot_down_table_tbody .battle_death').tooltip();

  // 敵艦搭載数推移
  for (let i = 0; i < chartData.enSlots.length; i++) {
    const s = chartData.enSlots[i];
    const node_tr = document.getElementsByClassName('enemy_no_' + s[0] + ' slot_' + s[1])[0];
    const avg = (s[2] / calculateCount);
    node_tr.getElementsByClassName('td_avg_slot')[0].textContent = (avg === 0 ? '0' : avg.toFixed(1));
    node_tr.getElementsByClassName('td_max_slot')[0].textContent = s[3];
    node_tr.getElementsByClassName('td_min_slot')[0].textContent = s[4];
  }
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
 * @param {string} key キー名
 * @param {Object} data 格納する生データ
 * @returns
 */
function saveLocalStrage(key, data) {
  if (!window.localStorage || key.length === 0) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    window.localStorage.removeItem(key);
    return false;
  }
}
/**
 * local Strage 特定データ消去
 * @param {String} key 消去対象key
 */
function deleteLocalStrage(key) {
  if (!window.localStorage || key.length === 0) return false;
  window.localStorage.removeItem(key);
  return true;
}

/*==================================
    計算用処理
==================================*/
/**
 * 制空値を比較し、制空状態の index を返却
 * @param {number} x ベース制空値
 * @param {number} y 比較対象制空値
 * @returns {number} 制空状態 index (0:確保 1:優勢...)
 */
function getAirStatusIndex(x, y) {
  // 味方艦隊2000以下なら事前計算テーブルから制空状態取得
  if (x <= 2000) {
    const max = AIR_STATUS_TABLE[x].length - 1;
    if (y < max) return AIR_STATUS_TABLE[x][y];
    return AIR_STATUS_TABLE[x][max];
  }
  else {
    const border = getAirStatusBorder(y);
    const len = border.length;
    for (let i = 0; i < len; i++) if (x >= border[i]) return x !== 0 ? i : 4;
  }
}

/**
 * 制空値を比較し、制空状態の index を返却 基地航空隊用(双方制空0の時確保:0になるだけ)
 * @param {number} x ベース制空値
 * @param {number} y 比較対象制空値
 * @returns {number} 制空状態 index (0:確保 1:優勢...)
 */
function getLBAirStatusIndex(x, y) {
  if (x === 0 && y === 0) return 0;
  return getAirStatusIndex(x, y);
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
function calculate() {
  // 各種オブジェクト生成
  const objectData = { landBaseData: [], friendFleetData: [], battleData: [] };

  // 計算前初期化
  calculateInit(objectData);

  // メイン計算
  mainCalculate(objectData);

  // 各状態確率計算
  rateCalculate(objectData);

  // 結果表示
  drawResult();
}

/**
 * 計算前初期化 anti-JQuery
 * @param {Object} objectData 計算用各種データ
 * @returns {boolean} シミュレーションを開始するならtrue
 */
function calculateInit(objectData) {
  // テーブルいったん全てリセット
  document.getElementById('ship_info_table').getElementsByTagName('tbody')[0].innerHTML = "";
  document.getElementById('shoot_down_table').getElementsByTagName('tbody')[0].innerHTML = "";
  document.getElementById('enemy_shoot_down_table').getElementsByTagName('tbody')[0].innerHTML = "";
  document.getElementById('input_summary').value = '';
  for (const node of document.getElementById('shoot_down_table').getElementsByTagName('tfoot')[0].getElementsByClassName('td_battle')) {
    node.innerHTML = "";
  }
  for (const d of document.getElementById('shoot_down_table').getElementsByTagName('td')) {
    d.classList.remove('airStatus0', 'airStatus1', 'airStatus2', 'airStatus3', 'airStatus4');
  }

  // 防空時
  if (isDefMode) {
    // 艦娘 & 一般敵情報非表示
    document.getElementById('ship_info').classList.add('d-none');
    document.getElementById('shoot_down_table_content').classList.add('d-none');
    document.getElementById('friendFleet').classList.add('d-none');
    document.getElementById('normal_enemies').classList.add('d-none');
    document.getElementById('display_battle_tab').classList.add('d-none');
    // 基地空襲敵欄表示
    document.getElementById('air_raid_enemies').classList.remove('d-none');

    // 戦闘回数固定
    const node = document.getElementById('battle_count_content');
    node.classList.add('d-none');
    node.classList.remove('d-flex');
  }
  else {
    // 艦娘情報表示
    document.getElementById('ship_info').classList.remove('d-none');
    document.getElementById('shoot_down_table_content').classList.remove('d-none');
    document.getElementById('friendFleet').classList.remove('d-none');
    document.getElementById('normal_enemies').classList.remove('d-none');
    document.getElementById('display_battle_tab').classList.remove('d-none');
    // 基地空襲敵欄非表示
    document.getElementById('air_raid_enemies').classList.add('d-none');

    const node = document.getElementById('battle_count_content');
    node.classList.add('d-flex');
    node.classList.remove('d-none');
  }

  // 機体使用数テーブル初期化
  usedPlane = [];

  // 基地情報更新
  updateLandBaseInfo(objectData.landBaseData);

  // 艦隊情報更新
  updateFriendFleetInfo(objectData.friendFleetData);

  // 敵艦情報更新
  updateEnemyFleetInfo(objectData.battleData);

  // 自動保存する場合
  if (document.getElementById('auto_save')['checked']) {
    saveLocalStrage('autoSaveData', encordPreset());
    setting.autoSave = true;
    saveLocalStrage('setting', setting);
  }

  // 空スロット表示可否
  setting.emptySlotInvisible = document.getElementById('empty_slot_invisible').checked;
  saveLocalStrage('setting', setting);

  // チャートデータ初期化
  chartData = { own: [], enemy: [], rate: [], slots: [], enSlots: [] };

  // 事前計算テーブルチェック
  setPreCalculateTable();

  return true;
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
  let summary_text = '';
  const targetBattle = castInt(document.getElementById('landBase_target').value);

  const nodes_lb_tab = document.getElementsByClassName('lb_tab');
  for (let index = 0; index < nodes_lb_tab.length; index++) {
    const node_lb_tab = nodes_lb_tab[index];
    const lbNo = index + 1;
    let tmpLandBaseDatum = { baseNo: lbNo, planes: [], ap: 0, mode: -1 };
    tmpLbPlanes.length = 0;

    summary_text = '第' + lbNo + '基地航空隊：';

    // 基地航空隊 各種制空値表示
    const node_lb_planes = node_lb_tab.getElementsByClassName('lb_plane');
    for (let i = 0; i < node_lb_planes.length; i++) {
      const node_lb_plane = node_lb_planes[i];
      const slotNo = i + 1;
      if (i >= 4) break;
      // 基地航空機オブジェクト生成
      const planeData = createLBPlaneObject(node_lb_plane, i);
      // 格納
      tmpLandBaseDatum.planes.push(planeData);

      // 個別表示
      const node = document.getElementsByClassName('lb_info_lb_' + lbNo + ' slot' + slotNo)[0];
      let node_td = node.getElementsByClassName('info_plane')[0];
      let prevAp = 0;
      // 装備名
      const planeName = (planeData.abbr ? planeData.abbr : planeData.name) + (planeData.remodel !== 0 ? '★' + planeData.remodel : '');
      node_td.classList = 'info_plane ' + getPlaneCss(planeData.type).replace('css', 'shoot_table');
      node_td.textContent = (planeName ? planeName + ' ' + getProfString(planeData.level) : '-');
      // 搭載数
      node_td = node.getElementsByClassName('info_slot')[0];
      prevAp = castInt(node_td.textContent);
      drawChangeValue(node_td, prevAp, planeData.slot);
      if (!planeName) node_td.textContent = '';

      // 制空値
      node_td = node.getElementsByClassName('info_ap')[0];
      prevAp = castInt(node_td.textContent);
      drawChangeValue(node_td, prevAp, planeData.ap);
      if (!planeName) node_td.textContent = '';

      // 航空隊制空値加算
      tmpLandBaseDatum.ap += planeData.ap;

      // 出撃コスト加算
      sumFuel += planeData.id === 0 ? 0 : Math.ceil(planeData.slot * (planeData.type === 101 ? 1.5 : 1.0));
      sumAmmo += planeData.id === 0 ? 0 : planeData.type === 101 ? Math.floor(planeData.slot * 0.7) : Math.ceil(planeData.slot * 0.6);
      sumBauxite += planeData.cost * (RECONNAISSANCES.includes(planeData.type) ? 4 : 18);

      summary_text += ' ' + (planeName ? planeName + ' ' + getProfString(planeData.level) : '') + ',';
    }
    summary_text += '\n';

    // 機体がないなら待機以外選択できないようにしとく
    let isEmpty = true;
    for (const plane of tmpLandBaseDatum.planes) if (plane.id > 0) isEmpty = false;
    if (isEmpty) {
      tmpLandBaseDatum.mode = -1;
      node_lb_tab.getElementsByClassName('ohuda_select')[0].value = '-1';
      for (const node_option of node_lb_tab.getElementsByClassName('ohuda_select')[0].getElementsByTagName('option')) {
        if (castInt(node_option.value, -1) !== -1) node_option['disabled'] = true;
      }
    }
    else {
      for (const node_option of node_lb_tab.getElementsByClassName('ohuda_select')[0].getElementsByTagName('option')) {
        node_option['disabled'] = false;
      }
    }
    // 出撃 or 防空
    tmpLandBaseDatum.mode = castInt(node_lb_tab.getElementsByClassName('ohuda_select')[0].value);

    // 出撃、配備コスト
    const node_resource = node_lb_tab.getElementsByClassName('resource')[0];
    const node_bauxite = node_resource.getElementsByClassName('bauxite')[0];
    let node_fuel = node_resource.getElementsByClassName('fuel')[0];
    let node_ammo = node_resource.getElementsByClassName('ammo')[0];
    if (tmpLandBaseDatum.mode < 1) {
      sumFuel = 0;
      sumAmmo = 0;
    }
    drawChangeValue(node_fuel, castInt(node_fuel.textContent), sumFuel, true);
    drawChangeValue(node_ammo, castInt(node_ammo.textContent), sumAmmo, true);
    drawChangeValue(node_bauxite, castInt(node_bauxite.textContent), sumBauxite, true);
    sumFuel = 0;
    sumAmmo = 0;
    sumBauxite = 0;

    // 偵察機による補正考慮
    getUpdateLBAirPower(tmpLandBaseDatum);

    // 総制空値
    const node_trs = document.getElementsByClassName('lb_info_lb_' + lbNo);
    let node_target_td = node_trs[0].getElementsByClassName('info_sumAp')[0];
    drawChangeValue(node_target_td, castInt(node_target_td.textContent), tmpLandBaseDatum.ap);
    let node_span = node_lb_tab.getElementsByClassName('ap')[0];
    drawChangeValue(node_span, castInt(node_span.textContent), tmpLandBaseDatum.ap);

    // 半径
    const range = getRange(tmpLandBaseDatum);
    node_target_td = node_trs[0].getElementsByClassName('info_range')[0];
    drawChangeValue(node_target_td, castInt(node_target_td.textContent), range);
    node_span = node_lb_tab.getElementsByClassName('range')[0];
    drawChangeValue(node_span, castInt(node_span.textContent), range);

    // 半径が足りていないなら文言追加
    if (tmpLandBaseDatum.mode > 0) {
      const node = document.getElementById('battle_container').getElementsByClassName('enemy_range');
      if (node.length >= targetBattle - 1 && castInt(node[(targetBattle - 1)].textContent) > range) {
        ng_range_text += (ng_range_text.length ? ',' : '') + (index + 1);
      }
    }

    for (const node_tr of node_trs) {
      // 待機部隊は非表示
      if (tmpLandBaseDatum.mode !== -1) {
        node_tr.classList.remove('d-none');
      }
      else node_tr.classList.add('d-none');
    }

    // 生成した第X航空隊データを格納
    landBaseData.push(tmpLandBaseDatum);

    // 待機 or 機体なしの場合飛ばす
    if (tmpLandBaseDatum.mode !== -1 && tmpLandBaseDatum.planes.length) {
      document.getElementById('input_summary').value += summary_text.trim() + '\n';
    }
  }

  // 全部待機かどうか
  let visiblePlaneCount = 0;
  const node_tr = document.getElementById('lb_info_table').getElementsByTagName('tbody')[0].getElementsByClassName('lb_info_tr');
  for (const node of node_tr) if (!node.classList.contains('d-none')) visiblePlaneCount++;
  document.getElementById('lb_info').classList.remove('col-lg-8', 'col-xl-7');
  document.getElementById('lb_info').classList.add('col-lg-6');
  if (visiblePlaneCount > 0) {
    $('#lb_info_table tbody').find('.info_defAp').remove();
    for (const h of document.getElementById('lb_info_table').getElementsByTagName('tbody')[0].getElementsByClassName('info_defAp')) h.remove();
    if (isDefMode) {
      // 総制空値合計
      let sumAp = 0;
      let sumAp_ex = 0;
      let rocketCount = 0;

      // 対高高度爆撃機の数を取得
      for (const v of landBaseData) {
        if (v.mode === -1) continue;
        sumAp += v.ap;
        for (const plane of v.planes) if (ROCKETS.includes(plane.id)) rocketCount++;
      }
      // 対重爆時補正 ロケット0機:0.5、1機:0.8、2機:1.1、3機異常:1.2
      sumAp_ex = (rocketCount === 0 ? 0.5 : rocketCount === 1 ? 0.8 : rocketCount === 2 ? 1.1 : 1.2) * sumAp;

      // 防空時は半径の後ろの最終防空時制空値を表示　半径は非表示
      document.getElementById('lb_info').classList.add('col-lg-8', 'col-xl-7');
      document.getElementById('lb_info').classList.remove('col-lg-6');
      const node_table = document.getElementById('lb_info_table');
      for (const node of node_table.getElementsByClassName('info_range')) node.classList.add('d-none');
      for (const node of node_table.getElementsByClassName('info_defAp')) node.classList.remove('d-none');

      for (const node_tr of node_table.getElementsByClassName('lb_info_tr')) {
        if (!node_tr.classList.contains('d-none')) {
          let node_td = document.createElement('td');
          node_td.className = 'info_defAp';
          node_td.rowSpan = visiblePlaneCount;
          node_td.textContent = sumAp;
          node_tr.appendChild(node_td);

          node_td = document.createElement('td');
          node_td.className = 'info_defAp info_defApEx';
          node_td.rowSpan = visiblePlaneCount;
          node_td.textContent = Math.floor(sumAp_ex);
          node_tr.appendChild(node_td);

          break;
        }
      }

    }
    else {
      const node_table = document.getElementById('lb_info_table');
      for (const node of node_table.getElementsByClassName('info_range')) node.classList.remove('d-none');
      for (const node of node_table.getElementsByClassName('info_defAp')) node.classList.add('d-none');
    }

    // 半径足りませんよ表示
    document.getElementById('ng_range').textContent = ng_range_text;
    document.getElementById('lb_info_table').getElementsByClassName('info_warning')[0].classList.add('d-none');
    if (ng_range_text.length) document.getElementById('lb_range_warning').classList.remove('d-none');
    else document.getElementById('lb_range_warning').classList.add('d-none');

    document.getElementById('input_summary').value += '\n';
  }
  else {
    document.getElementById('lb_info_table').getElementsByClassName('info_warning')[0].classList.remove('d-none');
    document.getElementById('lb_range_warning').classList.add('d-none');
  }
}

/**
 * 基地航空隊 中隊オブジェクト生成
 * @param {HTMLElement} node 生成元 lb_plane
 * @returns 機体オブジェクト
 */
function createLBPlaneObject(node) {
  const id = castInt(node.dataset.planeid);
  const type = castInt(node.dataset.type);
  // undefined来る可能性あり
  const plane = getPlanes(type).find(v => v.id === id);

  // スロット数不正チェック
  const node_slot = node.getElementsByClassName('slot')[0];
  const slotVal = node_slot.textContent;
  let inputSlot = castInt(slotVal);
  if (slotVal.length === 0) inputSlot = 0;
  else if (inputSlot > 18) {
    inputSlot = 18;
    node_slot.textContent = inputSlot;
  }
  else if (inputSlot < 0) {
    inputSlot = 0;
    node_slot.textContent = "0";
  }

  const lbPlane = {
    id: 0, name: '', abbr: '', type: 0, antiAir: 0, antiBomber: 0, interception: 0, scout: 0, ap: 0, radius: 999, cost: 0,
    slot: inputSlot,
    remodel: castInt(node.getElementsByClassName('remodel_value')[0].textContent),
    level: castInt(node.getElementsByClassName('prof_select')[0].dataset.prof),
    avoid: 0
  };

  if (plane) {
    lbPlane.id = plane.id;
    lbPlane.name = plane.name;
    lbPlane.abbr = plane.abbr;
    lbPlane.type = plane.type;
    if (RECONNAISSANCES.includes(lbPlane.type) && lbPlane.slot > 4) {
      node_slot.textContent = 4;
      lbPlane.slot = 4;
    }
    lbPlane.antiAir = plane.antiAir;
    lbPlane.antiBomber = plane.antiBomber;
    lbPlane.interception = plane.interception;
    lbPlane.scout = plane.scout;
    lbPlane.radius = plane.radius;
    lbPlane.cost = plane.cost;
    lbPlane.ap = getAirPower_lb(lbPlane);
    lbPlane.avoid = plane.avoid;

    // 機体使用数テーブル更新
    let usedData = usedPlane.find(v => v.id === plane.id);
    if (usedData) usedData.num[lbPlane.remodel]++;
    else {
      usedData = { id: plane.id, num: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
      usedData.num[lbPlane.remodel]++;
      usedPlane.push(usedData);
    }
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
  const antiAir = lb_plane.antiAir;
  const antiBomber = lb_plane.antiBomber;
  const interception = lb_plane.interception;
  const remodel = lb_plane.remodel;
  const level = lb_plane.level;
  const slot = lb_plane.slot;

  let sumPower = 0.0;

  // 艦戦 夜戦 水戦 陸戦 局戦
  if ([1, -1, 7, 102, 103].includes(type)) {
    //防空時
    if (isDefMode) sumPower = (0.2 * remodel + antiAir + interception + 2.0 * antiBomber) * Math.sqrt(slot);
    //出撃時
    else sumPower = (0.2 * remodel + antiAir + 1.5 * interception) * Math.sqrt(slot);

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
  else if ([6].includes(type)) {
    sumPower = 1.0 * antiAir * Math.sqrt(slot);
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
  else if ([3].includes(type)) {
    sumPower = 1.0 * (0.25 * remodel + antiAir) * Math.sqrt(slot);
  }
  // 陸攻
  else if ([101].includes(type)) {
    sumPower = 1.0 * (0.5 * Math.sqrt(remodel) + antiAir) * Math.sqrt(slot);
  }
  // そのた
  else sumPower = 1.0 * antiAir * Math.sqrt(slot);

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
        sumPower += Math.sqrt((initialProf120Plane.includes(Math.abs(type)) ? 120 : 100) / 10);
        break;
      default:
        break;
    }
  }

  sumPower = slot > 0 ? Math.floor(sumPower) : 0;
  return sumPower;
}


/**
 * その機体の制空補正値を返却
 * @param {*} plane
 * @param {boolean} [isDeffence=false] 防空時の補正が必要な場合true
 * @returns 補正倍率
 */
function getReconnaissancesAdjust(plane, isDeffence = false) {
  // 出撃時補正
  if (!isDeffence && plane.type === 104) {
    // 陸上偵察機補正
    return (plane.scout === 9 ? 1.18 : plane.scout === 8 ? 1.15 : 1.00);
  }
  // 防空時補正
  else if (isDeffence) {
    if (plane.type === 104) {
      // 陸上偵察機補正
      return (plane.scout === 9 ? 1.24 : 1.18);
    }
    else if (plane.type === 4) {
      // 艦上偵察機補正
      return (plane.scout > 8 ? 1.3 : 1.2);
    }
    else if ([5, 8].includes(plane.type)) {
      // 水上偵察機補正
      return (plane.scout > 8 ? 1.16 : plane.scout === 8 ? 1.13 : 1.1);
    }
  }

  return 1.0;
}

/**
 * 偵察機による制空値補正を行う
 * @param {Object} landBaseDatum 補正を行う landBaseDatum オブジェクト
 */
function getUpdateLBAirPower(landBaseDatum) {
  const baseAP = landBaseDatum.ap;
  // 搭載機全ての補正パターンを比較し、最大を返す。Listにすべての補正パターンを保持
  const apList = [landBaseDatum.ap];
  let reslutAP = landBaseDatum.ap;

  for (const plane of landBaseDatum.planes) {
    // 補正値を乗算して格納
    apList.push(baseAP * getReconnaissancesAdjust(plane, isDefMode));
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
  let maxLos = 1;
  for (const plane of landBaseDatum.planes) minRange = plane.radius < minRange ? plane.radius : minRange;

  // 最も足の長い偵察機の半径を取得
  for (const plane of landBaseDatum.planes) {
    if ([4, 5, 8, 104].includes(plane.type)) maxLos = maxLos < plane.radius ? plane.radius : maxLos;
  }

  if (maxLos < 999 && maxLos > minRange) return Math.round(minRange + Math.min(Math.sqrt(maxLos - minRange), 3));
  else return minRange === 999 ? 0 : minRange;
}

/**
 * 制空値を返す -艦娘
 * @param {Object} plane
 * @returns 引数の plane オブジェクトの持つ制空値
 */
function updateAp(plane) {
  if (plane.id === 0 || !plane.canBattle || plane.slot === 0) return 0;
  if (plane.slot <= 0) {
    plane.slot = 0;
    return 0;
  }
  // 基本制空値 + ボーナス制空値
  return Math.floor(plane.antiAir * Math.sqrt(plane.slot) + plane.bonusAp);
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
  const remodel = plane.remodel;
  let aa = 0;

  // 艦戦 夜戦 水戦
  if (FIGHTERS.includes(Math.abs(type))) aa = 0.2 * remodel + prevAp;
  // 艦爆
  else if (type === 3) aa = 0.25 * remodel + prevAp;
  // 陸攻
  else if (type === 101) aa = 0.5 * Math.sqrt(remodel) + prevAp;
  // そのた
  else aa = prevAp;

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
  if ([1, -1, 7].includes(type)) {
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
  else if ([6].includes(type)) {
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
      sumPower += Math.sqrt((initialProf120Plane.includes(Math.abs(type)) ? 120 : 100) / 10);
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
  const shipPlanes = [];
  let fleetAp = 0;
  let fleetAps = [0, 0];
  let summary_text = '';
  let node_ship_tabs = null;

  // 連合艦隊モードかどうか
  const isUnionFleet = $('#union_fleet').prop('checked');

  if (isUnionFleet) {
    // 連合艦隊モードの場合、全艦を対象とする
    node_ship_tabs = document.getElementsByClassName('ship_tab');
  }
  else {
    // 非連合艦隊モードの場合、表示されている艦隊を対象とする
    node_ship_tabs = $('.friendFleet_tab.show.active')[0].getElementsByClassName('ship_tab');
  }

  for (let index = 0; index < node_ship_tabs.length; index++) {
    const node_ship_tab = node_ship_tabs[index];
    const shipNo = index + 1;

    // 非表示 / 無効 なら飛ばす
    if (node_ship_tab.classList.contains('d-none') || node_ship_tab.getElementsByClassName('ship_disabled')[0].checked) continue;
    shipPlanes.length = 0;

    let slotNo = 0;
    for (const node_ship_plane of node_ship_tab.getElementsByClassName('ship_plane')) {
      // draggable部分 非表示部分は飛ばす
      if (node_ship_plane.classList.contains('ui-draggable')) continue;
      // 機体オブジェクト生成
      const planeObj = createFleetPlaneObject(node_ship_plane, shipNo, slotNo++);
      shipPlanes.push(planeObj);
    }

    // 艦娘横の制空値など反映
    const node_ap = node_ship_tab.getElementsByClassName('ap')[0];
    const prevAp = castInt(node_ap.textContent);
    let sumAp = 0;
    let exist = false;
    let planeCount = 0;
    // 総制空値と艦載機の有無チェック
    for (const v of shipPlanes) {
      sumAp += v.ap;
      if (!exist && v.id > 0) exist = true;
      if (v.id > 0 && v.slot > 0) planeCount++;
    }
    drawChangeValue(node_ap, prevAp, sumAp);
    fleetAps[shipNo <= 6 ? 0 : 1] += sumAp;
    fleetAp += sumAp;

    if (planeCount > 0) {
      // 撃墜テーブル & 入力情報テーブル生成
      let shipId = castInt(node_ship_tab.dataset.shipid);
      const ship = shipId ? SHIP_DATA.find(v => v.id === shipId) : null;

      const shoot_fragment = document.createDocumentFragment();
      const info_fragment = document.createDocumentFragment();

      let isFirst = true;
      // 表示スロット設定
      const invisibleEmptySlot = document.getElementById('empty_slot_invisible').checked;
      if (ship && !invisibleEmptySlot) planeCount = ship.slot.length;

      summary_text = (ship ? ship.name : '未指定') + '：';

      for (let i = 0; i < shipPlanes.length; i++) {
        const plane = shipPlanes[i];
        const planeName = plane.name;
        // 艦娘未指定の場合 搭載数 0 または艦載機未装備 のスロットは表示しない
        if (!ship && (plane.id === 0 || plane.slot === 0)) continue;
        // 艦娘の場合 スロット以上は作らない
        if (ship && i === ship.slot.length) break;
        // 掲示板用
        summary_text += ' ' + planeName + ' ' + getProfString(plane.level) + ',';
        // 艦娘でも被搭載スロットを表示しない場合は抜ける
        if (ship && invisibleEmptySlot && (plane.id === 0 || plane.slot === 0)) continue;

        const backCss = getPlaneCss(plane.type).replace('css', 'shoot_table');
        // 撃墜テーブル構築
        const node_battle_tr = document.createElement('tr');
        node_battle_tr.className = `slot${i} shipNo${shipNo}`;
        node_battle_tr.dataset.rowindex = shipNo;
        node_battle_tr.dataset.css = backCss + '_hover';
        if (isFirst) {
          const node_ship_name_td = document.createElement('td');
          node_ship_name_td.rowSpan = planeCount;
          node_ship_name_td.className = 'td_name align-middle';
          node_ship_name_td.textContent = ship ? ship.name : '未指定';
          node_battle_tr.appendChild(node_ship_name_td);
        }
        const node_plane_name_td = document.createElement('td');
        node_plane_name_td.className = 'pl-1 td_plane_name align-middle ' + backCss;
        node_plane_name_td.textContent = planeName;
        node_battle_tr.appendChild(node_plane_name_td);

        // 撃墜テーブル 10戦闘分
        for (let j = 1; j <= 10; j++) {
          const node_battle_td = document.createElement('td');
          node_battle_td.className = `td_battle battle${j} align-middle`;
          node_battle_tr.appendChild(node_battle_td);
        }

        const node_battle_end_td = document.createElement('td');
        node_battle_end_td.className = 'td_battle battle_end align-middle';
        node_battle_tr.appendChild(node_battle_end_td);

        const node_battle_death_td = document.createElement('td');
        node_battle_death_td.className = 'td_battle battle_death align-middle';
        node_battle_tr.appendChild(node_battle_death_td);

        shoot_fragment.appendChild(node_battle_tr);

        // 入力情報テーブル構築
        const node_info_tr = document.createElement('tr');
        node_info_tr.className = `ship_info_tr slot${i + 1}`;

        if (isFirst) {
          const node_info_name_td = document.createElement('td');
          node_info_name_td.rowSpan = planeCount;
          node_info_name_td.className = 'info_name';
          node_info_name_td.textContent = ship ? ship.name : '未指定';
          node_info_tr.appendChild(node_info_name_td);
        }

        const node_info_plane_name_td = document.createElement('td');
        node_info_plane_name_td.className = 'info_plane ' + backCss;

        const infoPlaneName = (plane.abbr ? plane.abbr : plane.name) + (plane.remodel !== 0 ? '★' + plane.remodel : '');
        node_info_plane_name_td.textContent = (infoPlaneName ? infoPlaneName : planeName) + ' ' + getProfString(plane.level);
        node_info_tr.appendChild(node_info_plane_name_td);

        const node_info_info_slot_td = document.createElement('td');
        node_info_info_slot_td.className = 'info_slot';
        node_info_info_slot_td.textContent = plane.slot;
        node_info_tr.appendChild(node_info_info_slot_td);

        const node_info_info_ap_td = document.createElement('td');
        node_info_info_ap_td.className = 'info_ap';
        node_info_info_ap_td.textContent = plane.ap;
        node_info_tr.appendChild(node_info_info_ap_td);

        if (isFirst) {
          const node_info_sumAp_td = document.createElement('td');
          node_info_sumAp_td.rowSpan = planeCount;
          node_info_sumAp_td.className = 'info_sumAp';
          node_info_sumAp_td.textContent = sumAp;
          node_info_tr.appendChild(node_info_sumAp_td);
        }

        info_fragment.appendChild(node_info_tr);

        isFirst = false;
      }
      document.getElementById('shoot_down_table_tbody').appendChild(shoot_fragment);

      const node_info_tbody = document.getElementById('ship_info_table').getElementsByTagName('tbody')[0];
      node_info_tbody.appendChild(info_fragment);

      const node_info_trs = node_info_tbody.getElementsByTagName('tr');
      if (node_info_trs.length > 0) {
        for (const node_tr of node_info_trs[node_info_trs.length - 1].getElementsByTagName('td')) {
          // 最下部のtdに下線
          node_tr.classList.add('last_slot');
        }
      }

      document.getElementById('input_summary').value += summary_text.slice(0, -1) + '\n';
    }
    else if (document.getElementById('shoot_down_table_tbody').getElementsByTagName('tr').length === 0) {
      const node_battle_tr = document.createElement('tr');
      node_battle_tr.className = 'slot0 shipNo0';

      const node_ship_name_td = document.createElement('td');
      node_ship_name_td.className = 'td_name align-middle';
      node_ship_name_td.textContent = '未選択';
      node_battle_tr.appendChild(node_ship_name_td);

      const node_plane_name_td = document.createElement('td');
      node_plane_name_td.className = 'td_plane_name text-nowrap align-middle text-center';
      node_plane_name_td.textContent = '-';
      node_battle_tr.appendChild(node_plane_name_td);

      for (let j = 1; j <= 10; j++) {
        const node_battle_td = document.createElement('td');
        node_battle_td.className = `td_battle battle${j} align-middle`;
        node_battle_tr.appendChild(node_battle_td);
      }

      const node_battle_end_td = document.createElement('td');
      node_battle_end_td.className = 'td_battle battle_end align-middle';
      node_battle_end_td.textContent = fleetAp;
      node_battle_tr.appendChild(node_battle_end_td);

      document.getElementById('shoot_down_table_tbody').appendChild(node_battle_tr);
    }

    // 代入
    if (exist) friendFleetData.push(shipPlanes.concat());
  }

  if (isUnionFleet) {
    for (let index = 0; index < fleetAps.length; index++) {
      document.getElementsByClassName('fleet_ap')[index].textContent = fleetAps[index];
    }
  }
  else {
    $('.friendFleet_tab.show.active')[0].getElementsByClassName('fleet_ap')[0].textContent = fleetAps[0];
  }

  const ship_info_tbody = document.getElementById('ship_info_table').getElementsByTagName('tbody')[0];
  const rowsCount = ship_info_tbody.getElementsByTagName('tr').length;
  if (rowsCount) {
    // 艦娘情報テーブル　艦隊総制空値列追加
    const node_info_fleetAp = document.createElement('td');
    node_info_fleetAp.className = 'info_fleetAp';
    node_info_fleetAp.rowSpan = rowsCount;
    node_info_fleetAp.textContent = fleetAp;

    ship_info_tbody.getElementsByClassName('ship_info_tr')[0].appendChild(node_info_fleetAp);

    $('#ship_info_table').find('.info_warning').addClass('d-none');
    document.getElementById('ship_info_table').getElementsByClassName('info_warning')[0].classList.add('d-none');
  }
  else document.getElementById('ship_info_table').getElementsByClassName('info_warning')[0].classList.remove('d-none');

  // 掲示板用高さ調整
  const $textarea = $('#input_summary');
  const lines = ($textarea.val() + '\n').match(/\n/g).length;
  $textarea.height(castInt($textarea.css('lineHeight')) * lines + 2);
  $textarea.text($textarea.text().trim());
}


/**
 * 艦娘 装備オブジェクト生成
 * @param {HTMLElement} $ship_plane 生成元 ship_plane
 * @param {number} shipNo 何隻目の艦か
 * @param {number} index 何番目のスロか
 * @returns 生成物
 */
function createFleetPlaneObject(node, shipNo, index) {
  const id = castInt(node.dataset.planeid);
  const type = castInt(node.dataset.type);
  // undefined来る可能性あり
  const plane = getPlanes(type).find(v => v.id === id);

  // スロット数不正チェック
  const raw = node.getElementsByClassName('slot')[0].textContent;
  let inputSlot = castInt(raw);
  if (raw.length === 0) inputSlot = 0;
  else if (inputSlot > MAX_SLOT) {
    inputSlot = MAX_SLOT;
    // スロット数表示修正
    node.getElementsByClassName('slot')[0].textContent = inputSlot;
  }
  else if (inputSlot < 0) {
    inputSlot = 0;
    // スロット数表示修正
    node.getElementsByClassName('slot')[0].textContent = inputSlot;
  }

  const shipPlane = {
    fleetNo: shipNo,
    slotNo: index,
    id: 0, name: '-', type: 0, antiAir: 0, ap: 0, bonusAp: 0, canBattle: false, canAttack: false,
    remodel: castInt(node.getElementsByClassName('remodel_value')[0].textContent),
    level: castInt(node.getElementsByClassName('prof_select')[0].dataset.prof),
    slot: inputSlot,
    origSlot: inputSlot,
    origAp: 0,
    avoid: 0
  };

  if (plane) {
    shipPlane.id = plane.id;
    shipPlane.name = !plane.abbr ? plane.name : plane.abbr;
    shipPlane.type = plane.type;
    shipPlane.canBattle = !RECONNAISSANCES.includes(plane.type);
    shipPlane.canAttack = ATTACKERS.includes(plane.type);
    shipPlane.antiAir = getBonusAA(shipPlane, plane.antiAir);
    shipPlane.bonusAp = getBonusAp(shipPlane);
    shipPlane.ap = updateAp(shipPlane);
    shipPlane.origAp = shipPlane.ap;
    shipPlane.avoid = plane.avoid;

    // 機体使用数テーブル更新
    let usedData = usedPlane.find(v => v.id === plane.id);
    if (usedData) usedData.num[shipPlane.remodel]++;
    else {
      usedData = { id: plane.id, num: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
      usedData.num[shipPlane.remodel]++;
      usedPlane.push(usedData);
    }
  }

  return shipPlane;
}

/**
 * 指定した艦隊の総制空値を返す
 * @param {Array.<Object>} friendFleetData
 * @param {number} cellType 戦闘マスタイプ(1: 通常 2: 敵連合)
 * @returns 総制空値
 */
function getFriendFleetAP(friendFleetData, cellType) {
  let sumAP = 0;
  const max_i = friendFleetData.length;
  for (let i = 0; i < max_i; i++) {
    const ships = friendFleetData[i];
    const max_j = ships.length;
    if (ships[0].fleetNo > 6 && cellType !== CELL_TYPE.grand) continue;
    for (let j = 0; j < max_j; j++) sumAP += ships[j].ap;
  }
  return sumAP;
}

/**
 * 敵艦隊入力情報更新
 * @param {Array.<Object>} battleData
 */
function updateEnemyFleetInfo(battleData) {
  let battleInfo = null;
  let sumAp = 0;
  let sumLBAp = 0;
  let sumAntiAirBonus = 0;
  let aawList = [];
  let map = "999-1";
  let cells = "";
  let isMixed = false;

  for (let node_battle_content of document.getElementsByClassName('battle_content')) {

    // 防空時は専用のフォームから。
    if (isDefMode) node_battle_content = document.getElementById('air_raid_enemies');
    if (isDefMode && battleData.length > 0) break;

    // 非表示なら飛ばす
    if (node_battle_content.classList.contains('d-none')) continue;

    // stage2・・・通常 弱回避補正 中回避補正
    battleInfo = { enemies: [], cellType: 0, stage2: [[[], []], [[], []], [[], []], [[], []], [[], []]] };
    sumAp = 0;
    sumLBAp = 0;
    sumAntiAirBonus = 0;
    aawList = [];

    // マス情報格納
    battleInfo.cellType = castInt(node_battle_content.getElementsByClassName('cell_type')[0].value);

    // 敵情報取得
    let enemyNo = 0;
    for (const node_enemy_content of node_battle_content.getElementsByClassName('enemy_content')) {
      let enemyId = castInt(node_enemy_content.dataset.enemyid);
      const enm = createEnemyObject(enemyId);

      // 未入力、非表示の敵なら飛ばす
      if (enemyId === 0 || node_enemy_content.classList.contains('d-none')) continue;
      // 直接入力の制空値を代入
      if (enemyId === -1) {
        const node_enemy_ap = node_enemy_content.getElementsByClassName('enemy_ap')[0];
        let inputAp = castInt(node_enemy_ap.textContent);
        enm.ap = inputAp;
        enm.lbAp = inputAp;
        enm.origAp = inputAp;
        enm.origLbAp = inputAp;
      }

      battleInfo.enemies.push(enm);
      sumAp += enm.ap;
      sumLBAp += enm.lbAp;

      // 加重対空格納
      aawList.push(enm.aaw);

      // stage2用 割合撃墜係数テーブル
      if (battleInfo.cellType === CELL_TYPE.grand) {
        // 連合補正
        if (enemyNo < 6) {
          battleInfo.stage2[0][0].push(enm.aaw * 0.8 / 400);
          battleInfo.stage2[1][0].push(Math.floor(enm.aaw * 0.6) * 0.8 / 400);
          battleInfo.stage2[2][0].push(Math.floor(enm.aaw * 0.6) * 0.8 / 400);
          battleInfo.stage2[3][0].push(Math.floor(enm.aaw * 0.5) * 0.8 / 400);
          battleInfo.stage2[4][0].push(Math.floor(enm.aaw * 0.5) * 0.8 / 400);
        }
        else {
          battleInfo.stage2[0][0].push(enm.aaw * 0.48 / 400);
          battleInfo.stage2[1][0].push(Math.floor(enm.aaw * 0.6) * 0.48 / 400);
          battleInfo.stage2[2][0].push(Math.floor(enm.aaw * 0.6) * 0.48 / 400);
          battleInfo.stage2[3][0].push(Math.floor(enm.aaw * 0.5) * 0.48 / 400);
          battleInfo.stage2[4][0].push(Math.floor(enm.aaw * 0.5) * 0.48 / 400);
        }
      }
      else {
        battleInfo.stage2[0][0].push(enm.aaw / 400);
        battleInfo.stage2[1][0].push(Math.floor(enm.aaw * 0.6) / 400);
        battleInfo.stage2[2][0].push(Math.floor(enm.aaw * 0.6) / 400);
        battleInfo.stage2[3][0].push(Math.floor(enm.aaw * 0.5) / 400);
        battleInfo.stage2[4][0].push(Math.floor(enm.aaw * 0.5) / 400);
      }

      // 艦隊防空ボーナス加算
      sumAntiAirBonus += enm.aabo;
      enemyNo++;
    }

    // 陣形補正
    const formation = FORMATION.find(v => v.id === castInt(node_battle_content.getElementsByClassName('formation')[0].value));
    const aj1 = formation ? formation.correction : 1.0;

    // 艦隊防空値 [陣形補正 * 各艦の艦隊対空ボーナス値の合計]
    const fleetAntiAir = Math.floor(aj1 * sumAntiAirBonus);

    // stage2用 固定撃墜値テーブル
    for (let index = 0; index < battleInfo.stage2[0][0].length; index++) {
      const aaw = aawList[index];
      if (battleInfo.cellType === CELL_TYPE.grand) {
        // 連合補正
        if (index < 6) {
          battleInfo.stage2[0][1].push(Math.floor((aaw + fleetAntiAir * 2) * 0.8 / 10.6));
          battleInfo.stage2[1][1].push(Math.floor((Math.floor(aaw * 0.6) + fleetAntiAir * 2) * 0.8 / 10.6));
          battleInfo.stage2[2][1].push(Math.floor((Math.floor(aaw * 0.6) + Math.floor(fleetAntiAir * 0.7) * 2) * 0.8 / 10.6));
          battleInfo.stage2[3][1].push(Math.floor((Math.floor(aaw * 0.5) + Math.floor(fleetAntiAir * 0.7) * 2) * 0.8 / 10.6));
          battleInfo.stage2[4][1].push(Math.floor((Math.floor(aaw * 0.5) + Math.floor(fleetAntiAir * 0.5) * 2) * 0.8 / 10.6));
        }
        else {
          battleInfo.stage2[0][1].push(Math.floor((aaw + fleetAntiAir * 2) * 0.48 / 10.6));
          battleInfo.stage2[1][1].push(Math.floor((Math.floor(aaw * 0.6) + fleetAntiAir * 2) * 0.48 / 10.6));
          battleInfo.stage2[2][1].push(Math.floor((Math.floor(aaw * 0.6) + Math.floor(fleetAntiAir * 0.7) * 2) * 0.48 / 10.6));
          battleInfo.stage2[3][1].push(Math.floor((Math.floor(aaw * 0.5) + Math.floor(fleetAntiAir * 0.7) * 2) * 0.48 / 10.6));
          battleInfo.stage2[4][1].push(Math.floor((Math.floor(aaw * 0.5) + Math.floor(fleetAntiAir * 0.5) * 2) * 0.48 / 10.6));
        }
      }
      else {
        battleInfo.stage2[0][1].push(Math.floor((aaw + fleetAntiAir * 2) / 10.6));
        battleInfo.stage2[1][1].push(Math.floor((Math.floor(aaw * 0.6) + fleetAntiAir * 2) / 10.6));
        battleInfo.stage2[2][1].push(Math.floor((Math.floor(aaw * 0.6) + Math.floor(fleetAntiAir * 0.7) * 2) / 10.6));
        battleInfo.stage2[3][1].push(Math.floor((Math.floor(aaw * 0.5) + Math.floor(fleetAntiAir * 0.7) * 2) / 10.6));
        battleInfo.stage2[4][1].push(Math.floor((Math.floor(aaw * 0.5) + Math.floor(fleetAntiAir * 0.5) * 2) / 10.6));
      }
    }

    // stage2 撃墜失敗用データ付与
    const len = battleInfo.stage2.length;
    const enemyCount = battleInfo.stage2[0][0].length;
    for (let index = 0; index < enemyCount; index++) {
      for (let index = 0; index < len; index++) battleInfo.stage2[index][0].push(0);
      for (let index = 0; index < len; index++) battleInfo.stage2[index][1].push(0);
    }
    if (battleInfo.stage2[0][0].length < 1) for (let index = 0; index < len; index++) battleInfo.stage2[index][0].push(0);
    if (battleInfo.stage2[0][1].length < 1) for (let index = 0; index < len; index++) battleInfo.stage2[index][1].push(0);

    // 制空値表示
    let node = node_battle_content.getElementsByClassName('enemy_sum_ap')[0];
    drawChangeValue(node, node.textContent, sumAp, true);
    node = node_battle_content.getElementsByClassName('enemy_sum_lbap')[0];
    drawChangeValue(node, node.textContent, sumLBAp, true);
    node = node_battle_content.getElementsByClassName('enemy_range')[0];
    if (!castInt(node.textContent)) node.parentNode.classList.add('d-none');
    else node.parentNode.classList.remove('d-none');

    node = node_battle_content.getElementsByClassName('fleet_AA')[0];
    drawChangeValue(node, node.textContent, fleetAntiAir * 2, true);

    // 航路情報を取得　なければ手動
    const mapInfo = !node_battle_content.dataset.celldata ? map.replace('-', '') + "_手動" : node_battle_content.dataset.celldata;
    let world = mapInfo.split('_')[0].slice(0, -1);
    world = world > 1000 ? "E-" : world + "-";
    const area = world + mapInfo.split('_')[0].slice(-1);
    const cellText = mapInfo.split('_')[1];
    if (map === "999-1") map = area;
    else if (!isMixed && map !== area) isMixed = true;
    cells += (!cells ? cellText : " → " + cellText);

    battleData.push(battleInfo);
  }

  if (!isDefMode) {
    if (map.includes('999-')) document.getElementById('route').value = "海域未指定";
    else document.getElementById('route').value = !isMixed ? map + "：" + cells : "別海域のセルが混在しています。";
  }

  // 敵艦載機撃墜テーブル構築
  const enemies = battleData[isDefMode ? 0 : displayBattle - 1].enemies.filter(v => v.slots.length > 0);
  const shoot_fragment = document.createDocumentFragment();
  let enemyNo = 0;
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (enemy.isSpR || !enemy.slots.length) continue;
    let enemy_name_td_text = '';
    const enemy_fragment = document.createDocumentFragment();

    for (let j = 0; j < enemy.slots.length; j++) {
      const plane = ENEMY_PLANE_DATA.find(v => v.id === enemy.eqp[j]);
      if (!plane) continue;
      const slotNum = enemy.slots[j];
      const backCss = getPlaneCss(plane.type).replace('css', 'shoot_table');
      const isLastSlot = j === enemy.slots.length - 1 ? ' last_slot' : '';

      // tr定義
      const node_tr = document.createElement('tr');
      node_tr.className = 'enemy_no_' + enemyNo + ' slot_' + j;
      node_tr.dataset.rowindex = enemyNo;
      node_tr.dataset.css = backCss + '_hover';

      enemy_name_td_text += '<img src="./img/plane/' + plane.id + '.png" class="img-size-36" title="' + plane.name + '">';

      const node_plane_name_td = document.createElement('td');
      node_plane_name_td.className = 'pl-1 td_plane_name align-middle ' + backCss + isLastSlot;
      node_plane_name_td.textContent = plane.name;
      node_tr.appendChild(node_plane_name_td);

      const node_init_td = document.createElement('td');
      node_init_td.className = 'td_init_slot align-middle' + isLastSlot;
      node_init_td.textContent = slotNum;
      node_tr.appendChild(node_init_td);

      const node_avg_td = document.createElement('td');
      node_avg_td.className = 'td_avg_slot align-middle' + isLastSlot;
      node_avg_td.textContent = slotNum;
      node_tr.appendChild(node_avg_td);

      const node_max_td = document.createElement('td');
      node_max_td.className = 'td_max_slot align-middle' + isLastSlot;
      node_max_td.textContent = slotNum;
      node_tr.appendChild(node_max_td);

      const node_min_td = document.createElement('td');
      node_min_td.className = 'td_min_slot align-middle' + isLastSlot;
      node_min_td.textContent = slotNum;
      node_tr.appendChild(node_min_td);

      enemy_fragment.appendChild(node_tr);
    }

    // 敵艦名 搭載機体画像
    const node_enemy_name_td = document.createElement('td');
    node_enemy_name_td.rowSpan = enemy.slots.length;
    node_enemy_name_td.className = 'td_name align-middle last_slot';
    node_enemy_name_td.innerHTML = '<div>' + drawEnemyGradeColor(enemy.name) + '</div><div>' + enemy_name_td_text + '</div>';
    enemy_fragment.firstChild.insertBefore(node_enemy_name_td, enemy_fragment.firstChild.firstChild);

    shoot_fragment.appendChild(enemy_fragment);

    enemyNo++;
  }

  if (!shoot_fragment.childNodes.length) {
    const node_tr = document.createElement('tr');
    const node_td = document.createElement('td');
    node_td.colSpan = 6;
    node_td.className = 'font_size_11';
    node_td.textContent = '戦闘機、攻撃機を搭載した敵艦のいない戦闘です。';
    node_tr.appendChild(node_td);

    shoot_fragment.appendChild(node_tr);
  }

  document.getElementById('enemy_shoot_down_tbody').appendChild(shoot_fragment);
}

/**
 * 引数の id から敵オブジェクトを生成
 * @param {number} id 敵ID  -1 の場合は直接入力とする
 * @returns {Object} 敵オブジェクト
 */
function createEnemyObject(id) {
  const tmp = ENEMY_DATA.find(v => v.id === id);
  const enemy = { id: 0, type: 0, name: '', slots: [], antiAir: [], eqp: [], orgSlots: [], isSpR: false, ap: 0, lbAp: 0, origAp: 0, origLbAp: 0, aaw: 0, aabo: 0 };

  if (id !== 0 && tmp) {
    for (const id of tmp.eqp) {
      const plane = ENEMY_PLANE_DATA.find(v => v.id === id);
      if (plane) {
        enemy.antiAir.push(plane.antiAir);
        if (plane.type === 5 && !enemy.isSpR) enemy.isSpR = true;
      }
    }
    enemy.id = tmp.id;
    enemy.type = tmp.type;
    enemy.name = tmp.name;
    enemy.eqp = tmp.eqp.concat();
    enemy.slots = tmp.slot.concat();
    enemy.orgSlots = tmp.slot.concat();
    enemy.aaw = tmp.aaw;
    enemy.aabo = tmp.aabo;
    enemy.ap = 0;
    enemy.lbAp = 0;
    updateEnemyAp(enemy);
    enemy.origAp = enemy.ap;
    enemy.origLbAp = enemy.lbAp;
  }
  return enemy;
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
    for (let i = 0; i < enemy.slots.length; i++) {
      const slot = enemy.slots[i];
      enemy.slots[i] = slot - Math.floor(getShootDownSlotHalf(airStatus, slot));
    }
    updateEnemyAp(enemy);
  }
}

/**
 * 敵機撃墜処理 (繰り返し用)
 * @param {number} index 制空状態
 * @param {Array.<Object>} enemyFleet 撃墜対象の敵艦隊
 */
function shootDownEnemy(index, enemyFleet) {
  const max_i = enemyFleet.length;
  for (let i = 0; i < max_i; i++) {
    const enemy = enemyFleet[i];
    const max_j = enemy.slots.length;
    for (let j = 0; j < max_j; j++) {
      let slot = enemy.slots[j];
      enemy.slots[j] -= getShootDownSlot(index, slot);
    }
    updateEnemyAp(enemy);
  }
}

/**
 * 引数の制空状態、搭載数をもとに撃墜数を返却 撃墜数はランダム
 * @param {number} index 制空状態インデックス
 * @param {number} slot 撃墜前搭載数
 * @returns {number} 撃墜数
 */
function getShootDownSlot(index, slot) {
  // 撃墜テーブルから撃墜数を取得
  const range = SHOOT_DOWN_TABLE_ENEMY[slot][index].length;
  return SHOOT_DOWN_TABLE_ENEMY[slot][index][Math.floor(Math.random() * range)];
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜率は中央値固定
 * @param {number} index 制空状態インデックス
 * @param {number} slot 撃墜前搭載数
 * @returns {number} 撃墜後搭載数
 */
function getShootDownSlotHalf(index, slot) {
  const avg_rate = AIR_STATUS[index].rate / 2;
  return slot * avg_rate / 10;
}

/**
 * 指定された敵オブジェクトが持つ制空値を再計算する
 * @param {Object} enemy 再計算する敵オブジェクト
 */
function updateEnemyAp(enemy) {
  if (enemy.id === -1) return;
  enemy.ap = 0;
  enemy.lbAp = 0;
  const max_i = enemy.antiAir.length;
  for (let i = 0; i < max_i; i++) {
    if (!enemy.isSpR) enemy.ap += Math.floor(enemy.antiAir[i] * Math.sqrt(Math.floor(enemy.slots[i])));
    else enemy.lbAp += Math.floor(enemy.antiAir[i] * Math.sqrt(Math.floor(enemy.slots[i])));
  }
  enemy.lbAp += enemy.ap;
}

/**
 * 道中被撃墜(中央値,チャート用)
 * @param {Array.<Object>} friendFleetData 味方艦隊
 * @param {number} eap 敵制空値
 * @param {number} index 何戦目か
 * @param {number} battleInfo 戦闘情報(enemies: 敵id羅列 stage2: st2撃墜テーブル cellType: 戦闘タイプ)
 */
function shootDownHalfFriend(friendFleetData, eap, index, battleInfo) {
  const ap = getFriendFleetAP(friendFleetData, battleInfo.cellType);
  let airStatusIndex = getAirStatusIndex(ap, eap);
  for (const ship of friendFleetData) {
    for (const plane of ship) {
      // 直前の搭載数をテーブルに反映
      $('#shoot_down_table_tbody')
        .find('.shipNo' + plane.fleetNo + '.slot' + plane.slotNo + ' .battle' + (index + 1))
        .text(plane.id > 0 ? Math.round(plane.slot) : '');
      // 0スロ || 非戦闘機体 || (敵通常マス && 第2艦隊)　は飛ばす
      if (plane.slot === 0 || !plane.canBattle || (plane.fleetNo > 6 && battleInfo.cellType !== CELL_TYPE.grand) || battleInfo.cellType === CELL_TYPE.night) continue;
      // 双方制空0(airStatusIndex === 5)の場合、制空権確保となるので変更
      if (airStatusIndex === 5) airStatusIndex = 0;

      // 平均で
      const range = battleInfo.stage2[plane.avoid][0].length;
      let sumSlotResult = 0;
      for (let i = 0; i < 1000; i++) {
        let tmpSlot = plane.slot;
        // st1
        tmpSlot -= getShootDownSlotFF(airStatusIndex, Math.round(tmpSlot));
        if (plane.canAttack && battleInfo.cellType <= CELL_TYPE.grand) {
          // 割合撃墜
          tmpSlot -= Math.floor(battleInfo.stage2[plane.avoid][0][Math.floor(Math.random() * range)] * tmpSlot);
          // 固定撃墜
          tmpSlot -= battleInfo.stage2[plane.avoid][1][Math.floor(Math.random() * range)];
        }
        sumSlotResult += tmpSlot > 0 ? tmpSlot : 0;
      }

      plane.slot = sumSlotResult / 1000;

      plane.ap = updateAp(plane);
    }
  }

  // 彼我制空
  $('#shoot_down_table').find('.eap.battle' + (index + 1)).text(eap);
}

/**
 * 道中被撃墜
 * @param {number} airStatusIndex 制空状態
 * @param {Array.<Object>} friendFleetData 味方艦隊
 * @param {number} battleInfo 戦闘情報(enemies: 敵id羅列 stage2: st2撃墜テーブル cellType: 戦闘タイプ)
 */
function shootDownFriend(airStatusIndex, friendFleetData, battleInfo) {
  const len = friendFleetData.length;
  for (let i = 0; i < len; i++) {
    const ship = friendFleetData[i];
    const shipLen = ship.length;
    for (let j = 0; j < shipLen; j++) {
      const plane = ship[j];
      // 0機スロ, 非制空争い機, 通常戦闘で味方第二艦隊の機体　のものはスキップ
      if (plane.slot <= 0 || !plane.canBattle || (plane.fleetNo > 6 && battleInfo.cellType === 1)) continue;
      // 双方制空0(airStatusIndex === 5)の場合、制空権確保となるので変更
      if (airStatusIndex === 5) airStatusIndex = 0;
      // st1撃墜
      plane.slot -= getShootDownSlotFF(airStatusIndex, plane.slot);
      // st2撃墜
      if (plane.canAttack && battleInfo.cellType <= CELL_TYPE.grand) {
        const range = battleInfo.stage2[plane.avoid][0].length;
        // 割合撃墜
        plane.slot -= Math.floor(battleInfo.stage2[plane.avoid][0][Math.floor(Math.random() * range)] * plane.slot);
        // 固定撃墜
        plane.slot -= battleInfo.stage2[plane.avoid][1][Math.floor(Math.random() * range)];
      }
      // 制空値再計算
      plane.ap = updateAp(plane);
    }
  }
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜数はランダム
 * @param {number} index 制空状態インデックス
 * @param {number} slot 撃墜前搭載数
 * @returns {number} 撃墜後搭載数(整数)
 */
function getShootDownSlotFF(index, slot) {
  // 撃墜テーブルから撃墜数を取得
  const downTable = SHOOT_DOWN_TABLE[slot][index];
  return downTable[Math.floor(Math.random() * downTable.length)];
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜率は中央値固定
 * @param {number} index 制空状態インデックス
 * @param {number} slot 撃墜前搭載数
 * @returns {number} 撃墜後搭載数(小数があり得る)
 */
function getShootDownSlotHalfFF(index, slot) {
  const downTable = SHOOT_DOWN_TABLE[Math.ceil(slot)][index];
  let sum = 0;
  for (const v of downTable) sum += v;
  return sum / downTable.length;
}

/**
 * メイン計算処理
 * @param {Object} objectData
 */
function mainCalculate(objectData) {
  const landBaseData = objectData.landBaseData;
  const friendFleetData = objectData.friendFleetData;
  const battleData = objectData.battleData;
  // 計算する戦闘 (配列のindexとして使うので表示値 - 1)
  let mainBattle = isDefMode ? 0 : (displayBattle - 1);
  const lbAttackBattle = (castInt($('#landBase_target').val()) - 1);

  mainBattle = mainBattle < battleData.length ? mainBattle : battleData.length - 1;

  // 防空モードの時は完全に別
  if (isDefMode) {
    let sumAP = 0;
    for (let index = 0; index < 3; index++) if (landBaseData[index].mode !== -1) sumAP += landBaseData[index].ap;

    // 高高度爆撃してくる敵艦が含まれていた場合か、マス高高度爆撃
    let isChanged = false;
    for (const enemyFleet of battleData) {
      for (const enemy of enemyFleet.enemies) {
        if (enemyFleet.cellType === 5) {
          sumAP = castInt($('.info_defApEx').text());
          isChanged = true;
          break;
        }
      }
      if (isChanged) break;
    }

    chartData.own.push(sumAP);
  }
  else {
    // 撃墜テーブルの関係ない戦闘を非表示に(5戦目まではレイアウトがダサいので出す)
    $('#shoot_down_table').find('td').removeClass('d-none');
    for (let index = battleCount + 1; index <= 10; index++) {
      $('#shoot_down_table').find('.battle' + index).addClass('d-none');
    }

    // 全ての戦闘回す
    for (let battle = 0; battle < battleCount; battle++) {
      const enemyFleet = battleData[battle].enemies;
      const cellType = battleData[battle].cellType;
      // 基地航空隊を派遣した戦闘
      if (battle === lbAttackBattle) {
        // 基地航空隊による制空削りを行う
        calculateLandBasePhase(landBaseData, enemyFleet, mainBattle === lbAttackBattle);
      }

      // 計算結果に詳細表示する戦闘
      if (battle === mainBattle) {
        fap = getFriendFleetAP(friendFleetData, cellType);
        eap = getEnemyFleetAP(enemyFleet);
        chartData.own.push(fap);
        chartData.enemy.push(eap);
      }

      // st1撃墜 & st2撃墜
      shootDownHalfFriend(friendFleetData, getEnemyFleetAP(enemyFleet), battle, battleData[battle]);
    }
  }
}

/**
 * 指定された敵艦隊に対して基地攻撃を行う
 * @param {*} landBaseData 基地データ
 * @param {*} enemyFleet 被害者の会
 * @param {boolean} needChart チャート描画用のデータが必要かどうか
 */
function calculateLandBasePhase(landBaseData, enemyFleet, needChart) {
  for (let index = 0; index < 3; index++) {
    let lbAp = landBaseData[index].ap;
    if (landBaseData[index].mode > 0) {
      // 第一波
      const elbap = getEnemyFleetLBAP(enemyFleet);
      if (needChart) {
        chartData.own.push(lbAp);
        chartData.enemy.push(elbap);
      }
      shootDownHalf(getLBAirStatusIndex(lbAp, elbap), enemyFleet);
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
        chartData.enemy.push(elbap);
      }
      shootDownHalf(getLBAirStatusIndex(lbAp, elbap), enemyFleet);
    }
    else if (needChart) {
      // 単発なので空データ挿入
      chartData.own.push(0);
    }
  }
}

/**
 * 各種制空状態確率計算
 * @param {Object} objectData
 * @returns {Array.<Object>} 各種制空状態確率
 */
function rateCalculate(objectData) {
  const landBaseData = objectData.landBaseData;
  const friendFleetData = objectData.friendFleetData;
  const battleData = objectData.battleData;
  let maxCount = castInt($('#calculate_count').val());
  $('#calculate_count').val(maxCount === 0 ? ++maxCount : maxCount);

  const lbAttackBattle = isDefMode ? 0 : (castInt($('#landBase_target').val()) - 1);
  const fleet = friendFleetData.concat();
  const fleetLen = fleet.length;
  const battleInfo = battleData.concat();
  // 計算する戦闘
  let mainBattle = isDefMode ? 0 : (displayBattle - 1);

  // 基地戦闘の各フェーズ敵制空値
  let enemyApDist = [0, 0, 0, 0, 0, 0, 0];
  const fleetASDist = [0, 0, 0, 0, 0, 0];
  const landBaseAps = [];
  const landBaseModes = [];
  const landBaseASDist = [];
  let returnDist = [];
  let slotResults = [];
  let avgMainAps = [];
  // 敵スロット明細 (各戦闘毎に以下データ [敵スロット番号, sum, max, min])
  let enemySlotResult = [];
  const maxBattle = isDefMode ? 1 : battleCount;
  const defAp = chartData.own[0];

  mainBattle = mainBattle < battleData.length ? mainBattle : battleData.length - 1;
  for (let i = 0; i < 6; i++) landBaseASDist.push([0, 0, 0, 0, 0, 0]);
  for (const landBase of landBaseData) {
    landBaseAps.push(landBase.ap);
    landBaseModes.push(landBase.mode);
  }

  for (let i = 0; i < fleetLen; i++) for (let j = 0; j < fleet[i].length; j++) slotResults.push(new Array(maxCount));
  for (let i = 0; i < maxBattle; i++) avgMainAps.push(0);
  // 表示戦闘の敵スロット保持用テーブル準備
  for (let i = 0; i < battleInfo[mainBattle].enemies.length; i++) {
    const enemy = battleInfo[mainBattle].enemies[i];
    if (enemy.isSpR || enemy.slots.length === 0) continue;
    const enemyNo = enemySlotResult.length === 0 ? 0 : enemySlotResult[enemySlotResult.length - 1][0] + 1;
    for (let j = 0; j < enemy.slots.length; j++) {
      enemySlotResult.push([enemyNo, j, 0, 0, 999]);
    }
  }

  // 自軍補給
  for (const ship of fleet) {
    for (const plane of ship) {
      plane.slot = plane.origSlot;
      plane.ap = plane.origAp;
    }
  }

  for (let count = 0; count < maxCount; count++) {
    // 敵機補給
    for (const enemy of battleInfo[lbAttackBattle].enemies) {
      enemy.slots = enemy.orgSlots.concat();
      enemy.ap = enemy.origAp;
      enemy.lbAp = enemy.origLbAp;
    }

    // 基地派遣戦闘の敵艦載機を削っておく
    calculateLandBase(landBaseAps, landBaseModes, battleInfo[lbAttackBattle].enemies, enemyApDist, landBaseASDist);

    // 最終戦闘まで道中含めてブン回す
    for (let battle = 0; battle < maxBattle; battle++) {
      const enemies = battleInfo[battle].enemies;
      const cellType = battleInfo[battle].cellType;
      const fap = isDefMode ? defAp : getFriendFleetAP(fleet, cellType);
      const eap = getEnemyFleetAP(enemies);
      const airIndex = getAirStatusIndex(fap, eap);

      if (battle === mainBattle) fleetASDist[airIndex]++;

      avgMainAps[battle] += fap;

      // st1撃墜 & st2撃墜
      shootDownFriend(airIndex, fleet, battleInfo[battle]);

      // 表示戦闘の敵搭載数記録
      if (battle === mainBattle) {
        // 本隊の分のst1起こす
        shootDownEnemy(airIndex, enemies);
        let index = 0;
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          if (enemy.isSpR) continue;
          const slots = enemy.slots;
          for (let j = 0; j < slots.length; j++) {
            const slotValue = slots[j];
            const slotResult = enemySlotResult[index++];
            // 合計値
            slotResult[2] += slotValue;
            // 最大値更新
            if (slotResult[3] < slotValue) slotResult[3] = slotValue;
            // 最小値更新
            if (slotResult[4] > slotValue) slotResult[4] = slotValue;
          }

          // 補給
          enemy.slots = enemy.orgSlots.concat();
          enemy.ap = enemy.origAp;
          enemy.lbAp = enemy.origLbAp;
        }
      }
    }

    // 自艦隊各種スロット清算、補給
    for (let i = 0; i < fleetLen; i++) {
      const ship = fleet[i];
      const shipLen = ship.length;
      for (let j = 0; j < shipLen; j++) {
        slotResults[i * 5 + j][count] = ship[j].slot;
        ship[j].slot = ship[j].origSlot;
        ship[j].ap = ship[j].origAp;
      }
    }
  }

  // 撃墜テーブルの敵制空値を修正(基地攻撃のあった戦闘が対象)
  const shootDownEnemyAp = enemyApDist.map(v => Math.round(v / maxCount));
  const ap = castInt($('#shoot_down_table').find('.fap.battle' + (lbAttackBattle + 1)).text());
  const enemyAp = castInt(shootDownEnemyAp[6]);
  if (ap > 0 || enemyAp > 0) {
    $('#shoot_down_table').find('.eap.battle' + (lbAttackBattle + 1)).text(enemyAp);
    $('#shoot_down_table').find('.cond.battle' + (lbAttackBattle + 1)).text(AIR_STATUS[getAirStatusIndex(ap, enemyAp)].abbr);
  }

  // 基地を派遣した戦闘が表示対象の戦闘だった場合、基地の結果を放り込む
  if (lbAttackBattle === mainBattle) {
    returnDist = landBaseASDist.concat();

    // 結果表示戦闘と基地戦闘が一致していたらチャート用データも置き換える
    chartData.enemy = shootDownEnemyAp;
  }

  returnDist.push(fleetASDist);

  // 各種制空状態割合を算出
  for (const wave of returnDist) {
    const len = wave.length;
    for (let index = 0; index < len; index++) {
      wave[index] = wave[index] / maxCount;
    }
  }

  // 防空時
  if (isDefMode) {
    chartData.enemy[0] = chartData.enemy[6];
    returnDist[0] = returnDist[6];
  }

  // 出撃後スロット数の統計
  let n = 0;
  for (let i = 0; i < fleetLen; i++) {
    for (let j = 0; j < fleet[i].length; j++) {
      const s = slotResults[n++];
      const tmp =
      {
        shipNo: fleet[i][j].fleetNo,
        slot: fleet[i][j].slotNo,
        max: Math.max.apply({}, s),
        min: Math.min.apply({}, s),
        avg: s.reduce((t, v) => t + v) / maxCount,
        death: s.filter(v => v === 0).length,
        deathRate: 0,
      };
      tmp.deathRate = tmp.death / s.length;
      chartData.slots.push(tmp);
    }
  }

  // 各戦闘平均制空値
  for (let i = 0; i < maxBattle; i++) {
    const avgAp = Math.round(avgMainAps[i] / maxCount);
    const eap = castInt($('#shoot_down_table').find('.eap.battle' + (i + 1)).text());
    const airIndex = getAirStatusIndex(avgAp, eap);
    $('#shoot_down_table').find('.fap.battle' + (i + 1)).text(avgAp);
    $('#shoot_down_table').find('.cond.battle' + (i + 1)).text(AIR_STATUS[airIndex].abbr).addClass('airStatus' + airIndex);
  }
  if (!isDefMode) chartData.own[chartData.own.length - 1] = Math.round(avgMainAps[mainBattle] / maxCount);

  chartData.rate = returnDist.concat();

  chartData.enSlots = enemySlotResult.concat();
}

/**
 * 指定された敵艦隊に対して基地攻撃を行う。
 * 各種開始時敵制空値を加算する
 * @param {*} landBaseAps 基地制空値一覧
 * @param {*} landBaseModes 基地お札一覧
 * @param {*} enemyFleet 被害者の会
 * @param {*} enemyApDist 各フェーズ開始時敵制空値格納
 * @param {*} landBaseASDist 各フェーズ航空状態格納
 */
function calculateLandBase(landBaseAps, landBaseModes, enemyFleet, enemyApDist, landBaseASDist) {
  for (let j = 0; j < 3; j++) {
    const lbAp = landBaseAps[j];

    if (landBaseModes[j] > 0) {
      // 出撃第一波
      let wave1 = j * 2;
      const eap = getEnemyFleetLBAP(enemyFleet);
      enemyApDist[wave1] += eap;
      // 双方制空値0の場合は確保扱い
      const airStatusIndex = getLBAirStatusIndex(lbAp, eap);
      landBaseASDist[wave1][airStatusIndex]++;
      shootDownEnemy(airStatusIndex, enemyFleet);
    }

    if (landBaseModes[j] === 2) {
      // 出撃第二波
      let wave2 = j * 2 + 1;
      const eap = getEnemyFleetLBAP(enemyFleet);
      enemyApDist[wave2] += eap;
      const airStatusIndex = getLBAirStatusIndex(lbAp, eap);
      landBaseASDist[wave2][airStatusIndex]++;
      shootDownEnemy(airStatusIndex, enemyFleet);
    }
  }

  // 出撃時 → 本隊戦における制空値 / 防空時 →　生
  enemyApDist[6] += isDefMode ? getEnemyFleetLBAP(enemyFleet) : getEnemyFleetAP(enemyFleet);
}


/**
 * 自動配備
 */
function autoExpand() {
  if ($('#mode_1').prop('checked')) {
    // 出撃モード
    isDefMode = false;
    autoExpandNormal();
  }
  else if ($('#mode_2').prop('checked') || $('#mode_3').prop('checked')) {
    // 防空モード
    isDefMode = true;
    autoExpandDefense();
  }

  calculate();
}

/**
 * 出撃時おまかせ配備
 */
function autoExpandNormal() {
  // 機体在庫
  const planeStock = loadPlaneStock();
  // 基地航空隊への艦戦の許可
  const allowFighter = $('#allow_fighter').prop('checked');
  // 自動配備対象
  const lb1 = $('#auto_land_base_1').prop('checked');
  const lb2 = $('#auto_land_base_2').prop('checked');
  const lb3 = $('#auto_land_base_3').prop('checked');
  const fleet = $('#auto_fleet').prop('checked');

  // 自動配備対象外のスロットから、装備されている機体を在庫から除く
  if (!lb1) {
    $('#lb_item1').find('.lb_plane').each((i, e) => {
      const stockData = planeStock.find(v => v.id === castInt($(e)[0].dataset.planeid));
      const remodel = castInt($(e).find('.remodel_value').text());
      if (stockData) stockData.num[remodel]--;
    });
  }
  if (!lb2) {
    $('#lb_item2').find('.lb_plane').each((i, e) => {
      const stockData = planeStock.find(v => v.id === castInt($(e)[0].dataset.planeid));
      const remodel = castInt($(e).find('.remodel_value').text());
      if (stockData) stockData.num[remodel]--;
    });
  }
  if (!lb3) {
    $('#lb_item3').find('.lb_plane').each((i, e) => {
      const stockData = planeStock.find(v => v.id === castInt($(e)[0].dataset.planeid));
      const remodel = castInt($(e).find('.remodel_value').text());
      if (stockData) stockData.num[remodel]--;
    });
  }

  // 本隊自動配備処理
  if (fleet) autoFleetExpand(planeStock);

  $('.ship_tab').find('.ship_plane').each((i, e) => {
    const stockData = planeStock.find(v => v.id === castInt($(e)[0].dataset.planeid));
    const remodel = castInt($(e).find('.remodel_value').text());
    if (stockData) stockData.num[remodel]--;
  });

  if (lb1 || lb2 || lb3) {
    // 利用可能機体群
    const planes = [];
    const minRange = castInt($('#dest_range').val());
    for (const stock of planeStock) {
      if (getArraySum(stock.num) <= 0) continue;
      const plane = PLANE_DATA.find(v => v.id === stock.id);
      // 半径足切り
      if (plane.radius < minRange) continue;
      // 対潜哨戒機足切り
      if (plane.type === -101) continue;
      // 艦戦非許容時艦戦足切り
      if (!allowFighter && Math.abs(plane.type) === 1) continue;
      // カテゴリ毎に分けて格納(艦戦系は合同)
      const typeName = 'type' + Math.abs(FIGHTERS.includes(plane.type) ? 1 : plane.type);
      if (!planes.hasOwnProperty(typeName)) planes[typeName] = [];

      // 在庫一斉追加
      for (let i = 0; i < stock.num.length; i++) {
        for (let j = 0; j < stock.num[i]; j++) {
          const planeData = {
            id: plane.id,
            type: plane.type,
            antiAir: (plane.antiAir + 1.5 * plane.interception),
            torpedo: plane.torpedo,
            bomber: plane.bomber,
            remodel: i,
          }
          planeData.antiAir = getBonusAA(planeData, planeData.antiAir);
          planes[typeName].push(planeData);
        }
      }
    }
    // 優先度ソート
    Object.keys(planes).forEach((key) => {
      // 艦戦系は出撃時対空値 → 半径ソート
      if (key === 'type1') {
        planes[key].sort((a, b) => { return a.antiAir === b.antiAir ? b.radius - a.radius : b.antiAir - a.antiAir; });
      }
      // 攻撃機系は雷装　→　対空ソート
      else if (key === 'type2') {
        planes[key].sort((a, b) => { return a.torpedo === b.torpedo ? b.radius - a.radius : b.torpedo - a.torpedo; });
      }
      // 陸攻は34型 → 雷装 → 対空ソート
      else if (key === 'type101') {
        planes[key].sort((a, b) => {
          if (a.id === 186 && b.id === 186) return b.antiAir - a.antiAir;
          else if (a.id === 186) return -1;
          else if (b.id === 186) return 1;
          else return a.torpedo === b.torpedo ? b.radius - a.radius : b.torpedo - a.torpedo;
        });
      }
      // 爆撃機系は爆装　→　対空ソート
      else if (['type3', 'type6'].includes(key)) {
        planes[key].sort((a, b) => { return a.bomber === b.bomber ? b.antiAir - a.antiAir : b.bomber - a.bomber; });
      }
      // 偵察機系は偵察　→　対空ソート
      else if (['type4', 'type5', 'type8', 'type104'].includes(key)) {
        planes[key].sort((a, b) => { return a.scout === b.scout ? b.antiAir - a.antiAir : b.scout - a.scout; });
      }
    });

    if (lb1) {
      const selectedPlanes = autoLandBaseExpand(planes);
      $('#lb_item1').find('.lb_plane').each((i, e) => { setLBPlaneDiv($(e), selectedPlanes[i]); });
      $('#lb_item1').find('.ohuda_select').val(selectedPlanes.length > 0 ? 2 : -1);
    }
    if (lb2) {
      const selectedPlanes = autoLandBaseExpand(planes);
      $('#lb_item2').find('.lb_plane').each((i, e) => { setLBPlaneDiv($(e), selectedPlanes[i]); });
      $('#lb_item2').find('.ohuda_select').val(selectedPlanes.length > 0 ? 2 : -1);
    }
    if (lb3) {
      const selectedPlanes = autoLandBaseExpand(planes);
      $('#lb_item3').find('.lb_plane').each((i, e) => { setLBPlaneDiv($(e), selectedPlanes[i]); });
      $('#lb_item3').find('.ohuda_select').val(selectedPlanes.length > 0 ? 2 : -1);
    }
  }
}

/**
 * 艦娘 目標制空値を満たすような配備
 */
function autoFleetExpand(planeStock) {
  // 目標制空値を取得
  const destAp = castInt($('#dest_ap').val());
  const $ship = $('.ship_tab[data-shipid!=""]');
  const allowFBA = !$('#no_FBA').prop('checked');

  // 利用可能機体群
  const planes = [];
  for (const stock of planeStock) {
    // 97艦攻 99艦爆 96艦戦 瑞雲 は無限
    if ([16, 19, 23, 26].includes(stock.id)) stock.num = [60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (getArraySum(stock.num) <= 0) continue;
    const plane = PLANE_DATA.find(v => v.id === stock.id);
    // 基地機体足切り
    if (plane.type > 100) continue;
    // カテゴリ毎に分けて格納(艦戦系は合同)
    const typeName = 'type' + Math.abs(FIGHTERS.includes(plane.type) ? '1' : plane.type);
    if (!planes.hasOwnProperty(typeName)) planes[typeName] = [];

    // 在庫一斉追加
    for (let i = 0; i < stock.num.length; i++) {
      for (let j = 0; j < stock.num[i]; j++) {
        const planeData = {
          id: plane.id,
          type: plane.type,
          antiAir: (plane.antiAir + 1.5 * plane.interception),
          torpedo: plane.torpedo,
          bomber: plane.bomber,
          avoid: plane.avoid,
          remodel: i,
          stock: 1
        }
        planeData.antiAir = getBonusAA(planeData, planeData.antiAir);
        planes[typeName].push(planeData);
      }
    }
  }
  // 優先度ソート
  Object.keys(planes).forEach((key) => {
    // 艦戦系は対空値ソート
    if (key === 'type1') {
      planes[key].sort((a, b) => b.antiAir - a.antiAir);
    }
    // 艦攻系は雷装値ソート
    else if (key === 'type2') {
      planes[key].sort((a, b) => a.torpedo === b.torpedo ? b.antiAir - a.antiAir : b.torpedo - a.torpedo);
    }
    // 爆装系は回避 → 爆装値ソート
    else if (['type3', 'type6'].includes(key)) {
      planes[key].sort((a, b) => a.avoid === b.avoid ? b.bomber - a.bomber : b.avoid - a.avoid);
    }
  });

  // 艦娘オブジェクト作成
  let fleetData = [];
  let orderIndex = 0;
  $ship.each((i, e) => {
    const ship = SHIP_DATA.find(v => v.id === castInt($(e)[0].dataset.shipid));
    if (ship) {
      const shipSlots = [];
      $(e).find('.ship_plane:not(.d-none)').each((i2, e2) => {
        const slotCount = castInt($(e2).find('.slot').text());
        const isLocked = $(e2).find('.plane_unlock').hasClass('d-none');
        const slotData = {
          shipId: ship.id,
          shipType: ship.type,
          slotNo: i2,
          num: slotCount,
          plane: { id: 0, ap: 0 },
          order: orderIndex++,
          num_: slotCount,
          slotId: 'ship' + i + '_slot' + i2,
          isLock: isLocked,
          lockedPlane: null
        };

        if (isLocked) {
          const inputPlane = PLANE_DATA.find(v => v.id === castInt($(e2)[0].dataset.planeid));
          if (inputPlane) {
            const inputRemodel = castInt($(e2).find('.remodel_value').text());
            slotData.lockedPlane = { id: inputPlane.id, remodel: inputRemodel };
            // ロック済み機体があれば在庫から減らしておく
            Object.keys(planes).forEach((key) => {
              const deleteTraget = planes[key].findIndex(v => v.id === inputPlane.id && v.remodel === inputRemodel);
              if (deleteTraget > -1) {
                planes[key].splice(deleteTraget, 1);
              }
            });
          }
        }
        else if (slotCount === 0) {
          slotData.isLock = true;
        }

        // 空母以外は戦闘機系用にダミースロット数激減(20機以下の場合) 
        if (![1, 2, 3].includes(ship.type)) {
          slotData.num_ = slotCount - 100;
        }
        // 空母も小スロットは艦戦優先度上げる
        else if (slotCount < 10) {
          slotData.num_ = slotCount - 100;
        }
        shipSlots.push(slotData);
      });

      fleetData = fleetData.concat(shipSlots);
    }
  });

  // 攻撃機
  const atackers = [2, 6];
  let sumAp = 0;

  // 大スロ順に攻撃機積む(ダミースロットソート)
  fleetData.sort((a, b) => b.num_ - a.num_);
  for (const slotData of fleetData) {
    let equiped = false;
    for (let type of atackers) {
      // 装備ロックしていたらそいつを適用
      if (slotData.isLock) {
        if (slotData.lockedPlane) {
          const planeObj = getShipPlaneObject(slotData.num, slotData.lockedPlane);
          slotData.plane = planeObj;
          sumAp += planeObj.ap;
        }
        equiped = true;
        break;
      }

      // 空母の2スロ目は艦爆を試行
      const shipType = slotData.shipType;
      if (allowFBA && ([1, 2, 3].includes(shipType)) && slotData.slotNo === 1) type = 3;
      for (const plane of planes['type' + type]) {
        if (plane.stock <= 0) continue;
        if (checkInvalidPlane(slotData.shipId, PLANE_DATA.find(v => v.id === plane.id))) {
          const planeObj = getShipPlaneObject(slotData.num, plane);
          slotData.plane = planeObj;
          sumAp += planeObj.ap;
          plane.stock--;
          equiped = true;
          break;
        }
        else break;
      }
      if (equiped) break;
    }
  }

  // 全艦娘搭載数の昇順に並び替え(重巡級、戦艦級は搭載の反転値がソート基準となっている)
  fleetData.sort((a, b) => { return a.num_ === b.num_ ? b.slotNo - a.slotNo : a.num_ - b.num_; });
  const baseSumAp = sumAp;
  // 戦闘機の搭載が確定したスロット
  const fighterSlot = [];
  // 搭載が確定した艦載機 fighterSlot と連動
  let decidePlaneObjs = [];
  let tmpStockData = [];

  for (let i = 0; i < fleetData.length; i++) {
    // 制空を満たしたら終了
    if (sumAp >= destAp) break;

    // ロック済み機体飛ばし
    if (fleetData[i].isLock) continue;

    // 変更を戻す
    decidePlaneObjs = [];
    tmpStockData = [];
    for (const plane of planes['type1']) {
      tmpStockData.push({ id: plane.id, remodel: plane.remodel, antiAir: plane.antiAir, stock: plane.stock });
    }

    sumAp = baseSumAp;

    // 搭載確定スロに追加
    fighterSlot.push(fleetData[i]);
    // 搭載確定スロの降順に強艦戦を搭載した際の制空値を判定
    for (let j = fighterSlot.length - 1; j >= 0; j--) {
      const slotData = fighterSlot[j];
      let equiped = false;
      for (const plane of tmpStockData) {
        if (plane.stock <= 0) continue;
        if (checkInvalidPlane(slotData.shipId, PLANE_DATA.find(v => v.id === plane.id))) {
          const planeObj = getShipPlaneObject(slotData.num, plane);
          const prevAp = slotData.plane.ap;
          if (prevAp < planeObj.ap) {
            // 搭載確定機体に追加
            decidePlaneObjs.push(planeObj);
            sumAp += planeObj.ap - prevAp;
            plane.stock--;
            equiped = true;
            break;
          }
        }
        if (equiped) break;
      }
      // 搭載する機体がないよ！ → 今ある機体をそのまま確定
      if (!equiped) {
        decidePlaneObjs.push(slotData.plane);
      }
    }
  }

  // 確定処理
  let equipedCount = 0;
  const decidePlaneCount = decidePlaneObjs.length;
  for (let i = 0; i < fleetData.length; i++) {
    if (fleetData[i].isLock) continue;
    if (equipedCount >= decidePlaneCount) break;

    // 確定機体ズの後ろから搭載
    fleetData[i].plane = decidePlaneObjs[(decidePlaneCount - 1) - equipedCount++];
  }

  // 元の順に戻す
  fleetData.sort((a, b) => a.order - b.order);

  // 実際に搭載
  orderIndex = 0;
  $ship.each((i, e) => {
    $(e).find('.ship_plane:not(.d-none)').each((i2, e2) => {
      const slotData = fleetData.find(v => v.slotId === ('ship' + i + '_slot' + i2));
      if (slotData) {
        setPlaneDiv($(e2), slotData.plane);
        orderIndex++;
      }
      else setPlaneDiv($(e2));
    });
  });
}

/**
 * 基地航空隊 出撃時 目標制空値を満たすような機体idを4つ取得する
 */
function autoLandBaseExpand(planes) {
  // 敵の制空値を取得
  const destAp = castInt($('#dest_ap').val());

  // 基地航空隊の攻撃機優先順位
  const atackers = [101, 2, 3, 6, 9];
  // スロット
  const equipList = [
    { id: 0, ap: 0, remodel: 0 },
    { id: 0, ap: 0, remodel: 0 },
    { id: 0, ap: 0, remodel: 0 },
    { id: 0, ap: 0, remodel: 0 }
  ];
  // スロット数
  const slotNumber = equipList.length;

  let sumAp = 0;
  let isMax = false;

  // 攻撃機系上位最大4つ取ってくる
  const selectedAtackers = [];
  for (const type of atackers) {
    const planeList = planes['type' + type];
    if (!planeList || planeList.length === 0) continue;
    for (let i = 0; i < planeList.length; i++) {
      const plane = planeList[i];
      selectedAtackers.push(plane);
      isMax = selectedAtackers.length === slotNumber;
      if (isMax) break;
    }
    if (isMax) break;
  }

  // スロット下から攻撃機搭載
  for (let i = 0; i < selectedAtackers.length; i++) {
    const plane = getLandBasePlaneObject(selectedAtackers[i]);
    equipList[(equipList.length - 1) - i] = plane;
    sumAp += plane.ap;
  }

  // 満載かつ制空が足りてるなら終了
  if (isMax && sumAp >= destAp) {
    const selectedPlanes = [];
    for (const v of equipList) {
      selectedPlanes.push({ id: v.id, remodel: v.remodel });

      // 在庫から減らす
      for (const plane of selectedPlanes) {
        Object.keys(planes).forEach((key) => {
          const deleteTraget = planes[key].findIndex(v => v.id === plane.id && v.remodel === plane.remodel);
          if (deleteTraget > -1) {
            planes[key].splice(deleteTraget, 1);
          }
        });
      }
    }
    return selectedPlanes;
  }

  // 艦戦系上位4つ取ってくる
  const selectedFighters = [];
  isMax = false;
  const planeList = planes['type1'];
  if (planeList) {
    for (let i = 0; i < planeList.length; i++) {
      const plane = planeList[i];
      selectedFighters.push(plane);
      isMax = selectedFighters.length === slotNumber;
      if (isMax) break;
    }
  }

  // 制空値を満たすまで艦戦系を追加
  for (let i = 0; i < selectedFighters.length; i++) {
    // 元の機体の制空値
    const prevAp = equipList[i].ap;
    const newPlane = getLandBasePlaneObject(selectedFighters[i]);
    // 元の制空値を上回るなら搭載
    if (prevAp < newPlane.ap) {
      equipList[i] = newPlane;
      sumAp += equipList[i].ap - prevAp;
    }
    if (sumAp >= destAp) break;
  }

  const selectedPlanes = [];
  for (const v of equipList) {
    if (v) selectedPlanes.push({ id: v.id, remodel: v.remodel });
  }
  // 在庫から減らす
  for (const plane of selectedPlanes) {
    Object.keys(planes).forEach((key) => {
      const deleteTraget = planes[key].findIndex(v => v.id === plane.id && v.remodel === plane.remodel);
      if (deleteTraget > -1) {
        planes[key].splice(deleteTraget, 1);
      }
    });
  }
  return selectedPlanes;
}

/**
 * 基地スロットオブジェクト返却
 * @param {number} id 機体id
 */
function getLandBasePlaneObject(plane) {
  const lbPlane = { id: 0, type: 0, antiAir: 0, antiBomber: 0, interception: 0, scout: 0, ap: 0, slot: 18, remodel: 0, level: 0 };
  const rawPlane = PLANE_DATA.find(v => v.id === plane.id);
  lbPlane.id = plane.id;
  lbPlane.type = plane.type;
  if (RECONNAISSANCES.includes(lbPlane.type) && lbPlane.slot > 4) lbPlane.slot = 4;
  lbPlane.antiAir = rawPlane.antiAir;
  lbPlane.antiBomber = rawPlane.antiBomber;
  lbPlane.interception = rawPlane.interception;
  lbPlane.scout = rawPlane.scout;
  lbPlane.remodel = plane.remodel;
  lbPlane.level = setting.defaultProf.find(v => v.id === Math.abs(plane.type)).prof;
  lbPlane.ap = getAirPower_lb(lbPlane);

  return lbPlane;
}

/**
 * 艦娘スロットオブジェクト返却
 * @param {number} shipId 艦娘ID
 * @param {number} slotCount 搭載数
 * @param {number} inputPlane 機体
 */
function getShipPlaneObject(slotCount, inputPlane) {
  const plane = PLANE_DATA.find(v => v.id === inputPlane.id);
  const shipPlane = { id: 0, type: 0, antiAir: 0, ap: 0, bonusAp: 0, remodel: 0, level: 0, slot: slotCount, canBattle: true };
  shipPlane.id = plane.id;
  shipPlane.name = plane.name;
  shipPlane.type = plane.type;
  shipPlane.canBattle = !RECONNAISSANCES.includes(plane.type);
  shipPlane.remodel = inputPlane.remodel;
  shipPlane.antiAir = getBonusAA(shipPlane, plane.antiAir);
  shipPlane.level = setting.defaultProf.find(v => v.id === Math.abs(plane.type)).prof;
  shipPlane.bonusAp = getBonusAp(shipPlane);
  shipPlane.ap = updateAp(shipPlane);

  return { id: shipPlane.id, ap: shipPlane.ap, remodel: shipPlane.remodel, name: shipPlane.name };
}

/**
 * 防空時おまかせ配備
 */
function autoExpandDefense() {
  // 自動配備対象
  const lb1 = $('#auto_land_base_1').prop('checked');
  const lb2 = $('#auto_land_base_2').prop('checked');
  const lb3 = $('#auto_land_base_3').prop('checked');

  // 基地いったん全解除
  $('.lb_plane').each((i, e) => { setLBPlaneDiv($(e)) });

  // 参加部隊数
  let count = 0;
  if (lb1) count++;
  if (lb2) count++;
  if (lb3) count++;

  if (count > 0) {
    const lbData = autoLandBaseExpandDef(count);

    if (lb1) {
      const planes = lbData[0].planes;
      $('#lb_item1').find('.lb_plane').each((i, e) => { setLBPlaneDiv($(e), planes[i]); });
      $('#lb_item1').find('.ohuda_select').val(0);
    }
    if (lb2) {
      const planes = lbData[lb1 ? 1 : 0].planes;
      $('#lb_item2').find('.lb_plane').each((i, e) => { setLBPlaneDiv($(e), planes[i]); });
      $('#lb_item2').find('.ohuda_select').val(0);
    }
    if (lb3) {
      const planes = lbData[lb1 && lb2 ? 2 : lb1 || lb2 ? 1 : 0].planes;
      $('#lb_item3').find('.lb_plane').each((i, e) => { setLBPlaneDiv($(e), planes[i]); });
      $('#lb_item3').find('.ohuda_select').val(0);
    }
  }
}

/**
 * 基地航空隊 防空　おまかせ配備
 * @param {number} count 参加部隊数
 */
function autoLandBaseExpandDef(count) {
  // 目標制空値
  const destAp = castInt($('#dest_ap').val());
  // 機体在庫
  const planeStock = loadPlaneStock();
  // 重爆フラグ
  const isHeavyDef = $('#mode_3').prop('checked');
  // 利用可能機体群 最大12機取得
  let planes = [];
  const recons = [];
  const maxSlot = 4 * count;
  for (const stock of planeStock) {
    // 96艦戦、零式水偵無印は無限
    if (stock.id === 25 || stock.id === 19) stock.num = [maxSlot, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (getArraySum(stock.num) <= 0) continue;
    const plane = PLANE_DATA.find(v => v.id === stock.id);
    // 偵察機系のみ別
    if (RECONNAISSANCES.includes(plane.type)) {
      // 水偵は無限
      for (let i = 10; i >= 0; i--) {
        if (stock.num[i] < 1) continue;
        const v = {
          id: plane.id,
          antiAir: plane.antiAir,
          type: plane.type,
          adjust: 1,
          scout: plane.scout,
          remodel: i
        };
        v.adjust = getReconnaissancesAdjust(v, true);
        for (let j = 0; j < stock.num[i]; j++) {
          recons.push(v);
        }
      }
    }
    else {
      for (let i = 10; i >= 0; i--) {
        if (stock.num[i] < 1) continue;
        const v = {
          id: plane.id,
          type: plane.type,
          remodel: i,
          antiAir: (plane.antiAir + plane.interception + 2.0 * plane.antiBomber),
          interception: plane.interception,
          antiBomber: plane.antiBomber,
          isRocket: 0
        };
        v.antiAir = getBonusAA(v, v.antiAir);
        if (v.antiAir === 0) continue;
        for (let j = 0; j < stock.num[i]; j++) {
          // オブジェクトの値のみコピー
          planes.push(Object.assign({}, v));
        }
      }
    }
  }

  // 高高度防空　ロケット上位3つだけ最優先 → 残りは対空ソート
  if (isHeavyDef) {
    // 通常の対空値ソート
    planes.sort((a, b) => b.antiAir - a.antiAir);
    // 上位3つのロケット戦闘機のフラグを上げる
    for (let i = 0; i < 3; i++) {
      const index = planes.findIndex(v => v.isRocket === 0 && ROCKETS.includes(v.id));
      if (index > -1) planes[index].isRocket = 1;
    }
    // あげたフラグでソート
    planes.sort((a, b) => b.isRocket - a.isRocket);
  }
  else {
    // 対空値ソート
    planes.sort((a, b) => { return a.antiAir === b.antiAir ? b.radius - a.radius : b.antiAir - a.antiAir; });
  }
  // 偵察機ソート(艦偵 陸偵 水偵)
  recons.sort((a, b) => { return b.adjust === a.adjust ? b.scout - a.scout : b.adjust - a.adjust; });
  // スロット総数の上位機体取得
  planes = planes.filter((v, i) => i < count * 4);

  // 装備リスト
  const equipList = [];
  // 初期化
  for (let i = 0; i < count; i++) {
    const ini = { ap: 0, planes: [] };
    for (let j = 0; j < 4; j++) ini.planes.push({ id: 0 });
    equipList.push(ini);
  }

  // 全航空隊総制空値
  let sumAp = 0;
  let rocketCount = 0;

  // 4つ毎に取得 → 偵察機補正チェック
  for (let i = 0; i < count; i++) {
    // 本ユニット
    let unit = { ap: 0, planes: [] };
    // 偵察機搭載時用仮ユニット
    const unit_sub = { ap: 0, planes: [] };

    // 最大4つ取得
    for (let j = 0; j < 4; j++) {
      const plane = planes[j];
      const planeObj = getLandBasePlaneObject(plane);
      unit.planes.push(planeObj);
      unit.ap += planeObj.ap;
      unit_sub.planes.push(planeObj);
      unit_sub.ap += planeObj.ap;

      sumAp += planeObj.ap;

      // 重爆空襲時補正
      if (isHeavyDef) {
        if (ROCKETS.includes(plane.id)) rocketCount++;
        // 対重爆時補正 ロケット0機:0.5、1機:0.8、2機:1.1、3機異常:1.2
        const sumAp_ = Math.floor((rocketCount === 0 ? 0.5 : rocketCount === 1 ? 0.8 : rocketCount === 2 ? 1.1 : 1.2) * sumAp);
        if (sumAp_ >= destAp) break;
      }
      else if (sumAp >= destAp) break;
    }

    // 仮ユニットにて下位機体を偵察機に変更してみる (4スロ未満かつ制空が足りている場合は不要、ロケット戦闘機は3機確定で搭載されるので上書きされない)
    if (recons.length > i && !(unit_sub.planes.length < 3 && sumAp >= destAp)) {
      const plane = recons[i];
      const planeObj = getLandBasePlaneObject(plane);
      const changeSlotIndex = Math.min(unit_sub.planes.length, 3);
      let prevPlane = unit_sub.planes[changeSlotIndex];
      if (!prevPlane) prevPlane = { id: 0, ap: 0 };
      const prevAp = prevPlane.ap;

      unit_sub.planes[changeSlotIndex] = planeObj;
      unit_sub.ap += planeObj.ap - prevAp;

      getUpdateLBAirPower(unit_sub);
    }

    // 制空が上昇する場合、または依然として目標制空値を満たす場合は仮ユニットの方を採用
    if (unit_sub.ap >= unit.ap || unit_sub.ap >= destAp) {
      const prevAp = unit.ap;
      unit = unit_sub;
      // 全航空隊総制空値更新
      sumAp += unit_sub.ap - prevAp;
    }

    // 本ユニットセット
    const planeCount = unit.planes.length;
    if (planeCount !== 4) {
      for (let index = 0; index < 4 - planeCount; index++) {
        unit.planes.push({ id: 0, ap: 0 });
      }
    }
    equipList[i] = unit;

    // 使用した装備削除
    for (const plane of unit.planes) {
      let isFirst = true;
      planes = planes.filter((v) => {
        if (isFirst && v.id === plane.id) {
          isFirst = false;
          return false;
        }
        return true;
      });
    }

    if (isHeavyDef) {
      // 対重爆時補正 ロケット0機:0.5、1機:0.8、2機:1.1、3機異常:1.2
      const sumAp_ = Math.floor((rocketCount === 0 ? 0.5 : rocketCount === 1 ? 0.8 : rocketCount === 2 ? 1.1 : 1.2) * sumAp);
      if (sumAp_ >= destAp) break;
    }
    else if (sumAp >= destAp) break;
  }

  return equipList;
}

/*==================================
    イベント処理
==================================*/

/**
 * 各種モーダル終了時イベント
 * @param {JqueryDomObject} $this
 */
function modal_Closed($this) {
  // いらないオブジェクト参照をやめさせる
  switch ($this.attr('id')) {
    case "modal_plane_select":
    case "modal_ship_select":
    case "modal_enemy_select":
    case "modal_enemy_pattern":
    case "modal_collectively_setting":
      $target = null;
      calculate();
      break;
    case "modal_plane_preset":
      $target = null;
      planePreset = null;
      calculate();
      break;
    case "modal_main_preset":
      presets = null;
      calculate();
      break;
    default:
      break;
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
 * @param {JqueryDomObject} $this
 */
function btn_content_trade_Clicked($this) {
  $('body,html').animate({ scrollTop: 0 }, 200, 'swing');
  $('.btn_commit_trade').addClass('d-table').removeClass('d-none');
  $('.round_button:not(.btn_commit_trade)').addClass('d-none').removeClass('d-table');
  // 開始時にいったん全部最小化、handle追加
  $('#main_contents').find('.collapse_content').each(function () {
    $(this).parent().addClass('trade_enabled');
    if ($(this).attr('class').includes('show')) {
      $(this).addClass('tmpHide').collapse('hide');
    }
  });
  $this.blur();
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
    for (const $div of org) {
      if ($div.attr('id') === 'li_' + $(e).attr('id')) {
        $parent.append($div);
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
  $('.btn_commit_trade').removeClass('d-table').addClass('d-none');
  $('.round_button:not(.btn_commit_trade)').removeClass('d-none').addClass('d-table');
}

/**
 * 一括設定クリック時
 * @param {JqueryDomObject} $this
 */
function btn_ex_setting_Clicked($this) {
  const parentId = $this.closest('.contents').attr('id');
  const $modal = $('#modal_collectively_setting');

  $modal.find('.btn').removeClass('d-none');
  $modal.data('target', parentId);
  switch (parentId) {
    case 'landBase':
      $modal.find('.modal-title').text('一括設定　-基地航空隊-');
      $modal.find('.btn_remove_ship_all').addClass('d-none');
      $modal.find('.btn_remove_enemy_all').addClass('d-none');
      $modal.find('.btn_slot_default').addClass('d-none');
      $modal.find('.coll_slot_range').attr('max', 18).data('target', parentId);
      break;
    case 'friendFleet':
      $modal.find('.modal-title').text('一括設定　-艦娘-');
      $modal.find('.btn_remove_enemy_all').addClass('d-none');
      $modal.find('.coll_slot_range').attr('max', 99).data('target', parentId);
      break;
    default:
      break;
  }

  $modal.modal('show');
}

/**
 * 基地空襲を起こす
 */
function btn_air_raid_Clicked() {
  $('.lb_tab').each((i, e) => {
    let isOk = false;
    $(e).find('.lb_plane').each((i, e2) => {
      const sub = setting.airRaidMax ? 4 : Math.ceil(Math.random() * 4);
      const currentSlot = castInt($(e2).find('.slot').text());
      if (!isOk && currentSlot > 1) {
        $(e2).find('.slot').text((currentSlot - sub) < 1 ? 1 : currentSlot - sub);
        isOk = true;
      }
    });
  });

  calculate();
}

/**
 * 基地補給
 */
function btn_supply_Clicked() {
  $('.lb_tab').each((i, e) => {
    $(e).find('.lb_plane').each((i, e2) => {
      $(e2).find('.slot').text(18);
    });
  });

  calculate();
}


/**
 * コンテンツキャプチャクリック
 * @param {JqueryDomObject} $this
 */
function btn_capture_Clicked($this) {
  const $targetContent = $this.closest('.contents');
  $targetContent.width(1000);

  // 基地横並びに。
  $targetContent.find('.lb_tab').removeClass('tab-pane fade');

  // レンダリングできなさそうなやつを置換 or 非表示
  const $no_captures = $targetContent.find('.no_capture:not(.d-none)');
  $no_captures.addClass('d-none');
  $targetContent.find('.round_button').addClass('d-none').removeClass('d-table');
  $targetContent.find('.custom-checkbox').addClass('d-none');

  // レンダリングズレ修正
  $targetContent.find('.custom-select').addClass('pt-0');
  $targetContent.find('.custom-select option').addClass('d-none');
  $targetContent.find('.form-control').addClass('pt-0');
  $targetContent.find('.general_box').addClass('general_box_capture');

  const prevY = window.pageYOffset;

  html2canvas($targetContent[0], {
    onrendered: function (canvas) {
      const imgData = canvas.toDataURL();

      // クリップボードコピー
      if ($('#clipbord_mode').prop('checked') && typeof ClipboardItem === "function") {
        try {
          canvas.toBlob(blob => {
            navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
          });
        } catch (error) {
          downloadImage(imgData);
        }
      }
      else {
        downloadImage(imgData);
      }

      // 戻す
      $targetContent.find('.custom-checkbox').removeClass('d-none');
      $targetContent.find('.round_button:not(.btn_commit_trade)').removeClass('d-none').addClass('d-table');
      $no_captures.removeClass('d-none');

      $targetContent.find('.custom-select').removeClass('pt-0');
      $targetContent.find('.custom-select option').removeClass('d-none');
      $targetContent.find('.form-control').removeClass('pt-0');
      $targetContent.find('.general_box').removeClass('general_box_capture');

      $targetContent.width("");
      if ($('#lb_tab_select').css('display') !== 'none' && !$('#lb_item1').attr('class').includes('tab-pane')) {
        $('.lb_tab').addClass('tab-pane fade');
        $('.lb_tab:first').tab('show');
      }
      window.scrollTo(0, prevY);
    }
  });
}

/**
 * 保存処理
 * @param {*} data 
 */
function downloadImage(data) {
  const now = new Date();
  const month = ('0' + (now.getMonth() + 1)).slice(-2);
  const date = ('0' + now.getDate()).slice(-2);
  const hours = ('0' + now.getHours()).slice(-2);
  const minutes = ('0' + now.getMinutes()).slice(-2);
  const sec = ('0' + now.getSeconds()).slice(-2);
  const fname = 'screenshot_' + now.getFullYear() + month + date + hours + minutes + sec + '.jpg';

  if (window.navigator.msSaveBlob) {
    const encdata = atob(data.replace(/^.*,/, ''));
    const outdata = new Uint8Array(encdata.length);
    for (var i = 0; i < encdata.length; i++) {
      outdata[i] = encdata.charCodeAt(i);
    }
    const blob = new Blob([outdata], ["image/png"]);
    window.navigator.msSaveOrOpenBlob(blob, fname);
  } else {
    const a = document.getElementById("getImage");
    a.href = data;
    a.download = fname;
    a.click();
  }
}

/**
 * コンテンツ一括解除クリック
 * @param {JqueryDomObject} $this
 */
function btn_reset_content_Clicked($this) {
  const parentId = $this.closest('.contents').attr('id');
  switch (parentId) {
    case 'landBase':
      $('.lb_plane').each((i, e) => setLBPlaneDiv($(e)));
      isDefMode = false;
      break;
    case 'friendFleet':
      clearShipDivAll();
      break;
    case 'enemyFleet':
      clearEnemyDivAll();
      break;
    default:
      break;
  }
  calculate();
}

/**
 * 全艦載機解除クリック
 * @param {JqueryDomObject} $this
 */
function btn_remove_plane_all_Clicked($this) {
  const $targetContent = $('#' + $('#modal_collectively_setting').data('target'));
  clearPlaneDivAll($targetContent);
}

/**
 * 全艦娘解除クリック
 */
function btn_remove_ship_all_Clicked() {
  clearShipDivAll();
  $('#modal_collectively_setting').modal('hide');
}

/**
 * 搭載数最大クリック
 * @param {JqueryDomObject} $this
 */
function btn_slot_max_Clicked($this) {
  const $targetContent = $('#' + $('#modal_collectively_setting').data('target'));
  if ($targetContent.attr('id') === 'landBase') {
    $('.coll_slot_range').val(18);
  }
  else if ($targetContent.attr('id') === 'friendFleet') {
    $('.coll_slot_range').val(99);
  }

  coll_slot_range_Changed($('.coll_slot_range'));
}

/**
 * 搭載数初期値クリック
 * @param {JqueryDomObject} $this
 */
function btn_slot_default_Clicked($this) {
  const $targetContent = $('#' + $('#modal_collectively_setting').data('target'));
  if ($targetContent.attr('id') === 'friendFleet') {
    $targetContent.find('.ship_plane').each((i, e) => {
      $(e).find('.slot').text($(e).find('.slot_ini').data('ini'));
    });
  }
}

/**
 * 搭載数最小クリック
 */
function btn_slot_min_Clicked() {
  $('.coll_slot_range').val(0);
  coll_slot_range_Changed($('.coll_slot_range'));
}

/**
 * 一括変更搭載数レンジ変更
 * @param {JqueryDomObject} $this
 */
function coll_slot_range_Changed($this) {
  const $targetContent = $('#' + $('#modal_collectively_setting').data('target'));
  let value = castInt($this.val());
  value = value > castInt($this.attr('max')) ? castInt($this.attr('max')) : value;
  if ($targetContent.attr('id') === 'landBase') {
    $targetContent.find('.lb_plane').each((i, e) => $(e).find('.slot').text(value));
  }
  else if ($targetContent.attr('id') === 'friendFleet') {
    $targetContent.find('.ship_plane').each((i, e) => $(e).find('.slot').text(value));
  }

  $('.coll_slot_input').val(value);
}

/**
 * 一括変更搭載数直接変更
 * @param {JqueryDomObject} $this
 */
function coll_slot_input_Changed($this) {
  // 入力検証 -> 数値 かつ 0 以上 max 以下　違ってたら修正
  let value = validateInputNumber($this.val(), castInt($('.coll_slot_range').attr('max')));

  $this.val(value);
  $('.coll_slot_range').val(value);
  coll_slot_range_Changed($('.coll_slot_range'));
}

/**
 * 一括改修値変更クリック
 * @param {JqueryDomObject} $this
 */
function btn_remodel_Clicked($this) {
  const $targetContent = $('#' + $('#modal_collectively_setting').data('target'));
  const remodel = castInt($this[0].dataset.remodel);
  if ($targetContent.attr('id') === 'landBase') {
    $targetContent.find('.lb_plane').each((i, e) => $(e).find('.remodel_select:not(.remodel_disabled)').find('.remodel_value').text(remodel));
  }
  else if ($targetContent.attr('id') === 'friendFleet') {
    $targetContent.find('.ship_plane').each((i, e) => $(e).find('.remodel_select:not(.remodel_disabled)').find('.remodel_value').text(remodel));
  }
}

/**
 * 戦闘機のみ熟練度最大クリック
 */
function btn_fighter_prof_max_Clicked() {
  const $targetContent = $('#' + $('#modal_collectively_setting').data('target'));
  if ($targetContent.attr('id') === 'landBase') {
    $targetContent.find('.lb_plane').each((i, e) => {
      if (FIGHTERS.includes(Math.abs(castInt($(e)[0].dataset.type)))) {
        proficiency_Changed($(e).find('.prof_option[data-prof="7"]').parent(), true);
      }
    });
  }
  else if ($targetContent.attr('id') === 'friendFleet') {
    $targetContent.find('.ship_plane').each((i, e) => {
      if (FIGHTERS.includes(Math.abs(castInt($(e)[0].dataset.type)))) {
        proficiency_Changed($(e).find('.prof_option[data-prof="7"]').parent(), true);
      }
    });
  }
}

/**
 * 熟練度ボタンクリック
 * @param {JqueryDomObject} $this
 */
function btn_prof_Clicked($this) {
  const $targetContent = $('#' + $('#modal_collectively_setting').data('target'));
  const prof = $this[0].dataset.prof;
  if ($targetContent.attr('id') === 'landBase') {
    $targetContent.find('.lb_plane').each((i, e) => {
      proficiency_Changed($(e).find('.prof_option[data-prof="' + prof + '"]').parent(), true);
    });
  }
  else if ($targetContent.attr('id') === 'friendFleet') {
    $targetContent.find('.ship_plane').each((i, e) => {
      proficiency_Changed($(e).find('.prof_option[data-prof="' + prof + '"]').parent(), true);
    });
  }
}

/**
 * 基地航空隊出撃札変更時
 * @param {JqueryDomObject} $this
 * @param {boolean} cancelCalculate 計算を起こさない場合true 規定値false
 */
function ohuda_Changed($this, cancelCalculate = false) {
  const ohudaValue = castInt($this.val(), -1);
  if (ohudaValue === 0) {
    // 防空モード開始
    isDefMode = true;
    // 出撃中の部隊は防空に -> 待機に
    $('.ohuda_select').each((i, e) => { if (castInt($(e).val()) > 0) $(e).val(-1); });
  }
  else if (ohudaValue === -1) {
    let isDef = false;
    // 全て待機になっている場合防空モード終了
    $('.ohuda_select').each((i, e) => { if (castInt($(e).val()) === 0) isDef = true; });
    isDefMode = isDef;
  }
  else {
    // 防空モード終了
    isDefMode = false;
    // 防空中の部隊は集中に -> 待機に
    $('.ohuda_select').each((i, e) => { if (castInt($(e).val()) === 0) $(e).val(-1); });
  }

  if (!cancelCalculate) calculate();
}


function plane_lock_Clicked($this) {
  $this.addClass('d-none');
  $this.closest('.ship_plane').find('.plane_unlock').removeClass('d-none');
}

function plane_unlock_Clicked($this) {
  $this.addClass('d-none');
  $this.closest('.ship_plane').find('.plane_lock').removeClass('d-none');
}

/**
 * 改修値変更時
 * @param {JqueryDomObject} $this
 */
function remodelSelect_Changed($this) {
  const remodel = Math.min(castInt($this.find('.remodel_item_selected').data('remodel')), 10);
  $this.removeClass('remodel_item_selected');
  $this.find('.remodel_value').text(remodel);
  calculate();
}

/**
 * 熟練度変更時
 * @param {JqueryDomObject} $this .prof_item
 * @param {boolean} cancelCalculate 計算を起こさせない場合true 未指定時 false
 */
function proficiency_Changed($this, cancelCalculate = false) {
  const $orig = $this.find('.prof_option');
  const $targetSelect = $this.parent().prev();
  const prof = $orig[0].dataset.prof;
  $targetSelect
    .attr('src', $orig.attr('src'))
    .attr('alt', $orig.attr('alt'))
    .removeClass('prof_yellow prof_blue prof_none');
  $targetSelect[0].dataset.prof = prof;
  if (prof > 3) $targetSelect.addClass('prof_yellow');
  else if (prof > 0) $targetSelect.addClass('prof_blue');
  else $targetSelect.addClass('prof_none');

  if (!cancelCalculate) calculate();
}

/**
 * 初期熟練度変更時
 * @param {JqueryDomObject} $this
 */
function init_proficiency_Changed($this) {
  proficiency_Changed($this, true);

  // localStrage更新
  const prof = castInt($this.find('.prof_option')[0].dataset.prof);
  const tmp = setting.defaultProf.find(v => v.id === castInt($this.closest('.init_prof')[0].dataset.typeid));
  tmp.prof = prof;
  saveLocalStrage('setting', setting);
}

/**
 * 搭載数調整欄展開時
 * @param {JqueryDomObject} $this
 */
function slot_select_parent_Show($this) {
  const preSlot = castInt($this.find('.slot').text());
  $this.find('.slot_input').val(preSlot);
  $this.find('.slot_range').val(preSlot);
}

/**
 * 搭載数調整欄 レンジバー変更時
 * @param {JqueryDomObject} $this
 */
function slot_range_Changed($this) {
  const $slotArea = $this.closest('.slot_select_parent');
  $slotArea.find('.slot').text($this.val());
  $slotArea.find('.slot_input').val($this.val());
}

/**
 * 搭載数調整欄 搭載数入力欄変更時
 * @param {JqueryDomObject} $this
 */
function slot_input_Changed($this) {
  // 入力検証 -> 数値 かつ 0 以上 max 以下　違ってたら修正
  const value = validateInputNumber($this.val(), castInt($this.attr('max')));

  $this.val(value);
  $this.closest('.slot_select_parent').find('.slot').text(value);
  $this.next().val(value);
}

/**
 * 搭載数調整欄 初期ボタンクリック
 * @param {JqueryDomObject} $this
 */
function slot_ini_Clicked($this) {
  const $slotArea = $this.closest('.slot_select_parent');
  const defaultValue = $this.data('ini');
  $slotArea.find('.slot').text(defaultValue);
  $slotArea.find('.slot_input').val(defaultValue);
  $slotArea.find('.slot_range').val(defaultValue);
}

/**
 * 搭載数調整欄終了時
 * @param {JqueryDomObject} $this
 */
function slot_select_parent_Close($this) {
  let inputSlot = castInt($this.find('.slot_input').val());
  let maxSlot = castInt($this.find('.slot_input').attr('max'));
  $this.find('.slot').text(inputSlot > maxSlot ? maxSlot : inputSlot);
  calculate();
}

/**
 * 基地リセットボタン押下時
 * @param {JqueryDomObject} $this
 */
function btn_reset_landBase_Clicked($this) {
  $this.closest('.lb_tab').find('.lb_plane').each((i, e) => {
    $(e).find('.slot').text(0);
    setLBPlaneDiv($(e));
  });
  $this.blur();
  calculate();
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
  calculate();
}

/**
 * 基地欄へ機体ドロップ時
 * @param {JqueryDomObject} $this
 * @param {*} ui
 */
function lb_plane_Drop($this, ui) {
  const $original = ui.draggable;
  const insertPlane =
  {
    id: castInt($original[0].dataset.planeid),
    remodel: castInt($original.find('.remodel_value')[0].textContent),
    prof: castInt($original.find('.prof_select')[0].dataset.prof),
    slot: castInt($original.find('.slot').text())
  };
  const prevPlane = {
    id: castInt($this[0].dataset.planeid),
    remodel: castInt($this.find('.remodel_value')[0].textContent),
    prof: castInt($this.find('.prof_select')[0].dataset.prof),
    slot: castInt($this.find('.slot').text())
  };

  setLBPlaneDiv($this, insertPlane);

  // 交換
  if (!isCtrlPress && !$('#drag_drop_copy').prop('checked')) {
    setLBPlaneDiv($original, prevPlane);
  }
}

/**
 * 艦娘リセットボタン押下時
 * @param {JqueryDomObject} $this
 */
function btn_reset_ship_Clicked($this) {
  $this.closest('.ship_tab').find('.ship_plane').each((i, e) => { clearPlaneDiv($(e)) });
  calculate();
}

/**
 * 艦娘 機体ドラッグ開始時
 * @param {*} ui
 */
function ship_plane_DragStart(ui) {
  $(ui.helper)
    .addClass('ship_plane ' + getPlaneCss(castInt($(ui.helper).find('.plane_img').attr('alt'))))
    .css('width', 320);
  $(ui.helper).find('.slot_select_parent').remove();
  $(ui.helper).find('.btn_remove_plane').remove();
  $(ui.helper).find('.plane_lock').remove();
  $(ui.helper).find('.plane_unlock').remove();
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

  calculate();
}

/**
 * 艦娘 機体がドロップ対象上に位置
 * @param {JqueryDomObject} $this ドロップ対象 (!= ドラッグ中機体)
 * @param {*} ui
 */
function ship_plane_DragOver($this, ui) {
  const $original = ui.draggable.closest('.ship_plane');
  const shipID = castInt($this.closest('.ship_tab')[0].dataset.shipid);
  const planeID = castInt($original[0].dataset.planeid);
  const type = castInt($original[0].dataset.type);
  // 挿入先が装備不可だった場合暗くする
  if (!checkInvalidPlane(shipID, getPlanes(type).find(v => v.id === planeID))) {
    ui.helper.stop().animate({ 'opacity': '0.2' }, 100);
    $this.removeClass('plane_draggable_hover');
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
  if (ui.draggable.closest('.ship_plane')[0].dataset.planeid) {
    const $original = ui.draggable.closest('.ship_plane');
    const insertPlane = {
      id: castInt($original[0].dataset.planeid),
      remodel: castInt($original.find('.remodel_value')[0].textContent),
      prof: castInt($original.find('.prof_select')[0].dataset.prof)
    };
    const prevPlane = {
      id: castInt($this[0].dataset.planeid),
      remodel: castInt($this.find('.remodel_value')[0].textContent),
      prof: castInt($this.find('.prof_select')[0].dataset.prof)
    };

    // 挿入先が装備不可だった場合中止
    let shipID = castInt($this.closest('.ship_tab')[0].dataset.shipid);
    if (!checkInvalidPlane(shipID, PLANE_DATA.find(v => v.id === insertPlane.id))) return;

    // 挿入
    setPlaneDiv($this, insertPlane);

    if (!isCtrlPress && !$('#drag_drop_copy').prop('checked')) {
      // 交換を行う
      setPlaneDiv($original, prevPlane);
    }
  }
}

/**
 * 戦闘形式変更時
 * @param {JqueryDomObject} $this
 */
function cell_type_Changed($this) {
  const $paerntContent = $this.closest('.battle_content');
  const cellType = castInt($this.val());
  $paerntContent.find('.enemy_content').each((i, e) => {
    if (cellType !== CELL_TYPE.grand && i > 5) $(e).addClass('d-none').removeClass('d-flex');
    else $(e).removeClass('d-none').addClass('d-flex');
  });

  const $lastEnemy = $paerntContent.find('.enemy_content:last');
  if ($lastEnemy.hasClass('ui-draggable')) {
    const id = castInt($lastEnemy[0].dataset.enemyid);
    const ap = castInt($lastEnemy.text());
    setEnemyDiv($lastEnemy, id, ap);
  }

  const $formation = $paerntContent.find('.formation');
  const prevVal = castInt($formation.val());
  $formation.find('option').each((i, e) => {
    if (cellType !== CELL_TYPE.grand) {
      if ($(e).val() < 10) $(e).removeClass('d-none');
      if ($(e).val() > 10) $(e).addClass('d-none');
      if (prevVal > 10) $formation.val(prevVal - 10);
    }
    if (cellType === CELL_TYPE.grand) {
      if ($(e).val() < 10) $(e).addClass('d-none');
      if ($(e).val() > 10) $(e).removeClass('d-none');
      if (prevVal === 1 || prevVal === 2 || prevVal === 3) $formation.val(prevVal + 10);
      else if (prevVal === 4) $formation.val(14);
    }
  });

  calculate();
}

/**
 * 敵制空値調整欄終了時
 * @param {JqueryDomObject} $this
 */
function enemy_ap_select_parent_Show($this) {
  // 敵艦選択時は変更不可
  const enemyId = castInt($this.closest('.enemy_content')[0].dataset.enemyid);
  $this.find('.dropdown-header').text(enemyId !== -1 ? '敵艦に「直接入力」を指定した場合編集できます。' : '制空値を入力');
  $this.find('.enemy_ap_input').prop('disabled', enemyId !== -1);
}

/**
 * 敵制空値直接入力時
 * @param {JqueryDomObject} $this
 */
function enemy_ap_input_Changed($this) {
  // 入力検証 -> 数値 かつ 0 以上 max 以下　違ってたら修正
  const value = validateInputNumber($this.val(), castInt($this.attr('max')));
  $this.val(value);
  $this.closest('.enemy_ap_select_parent').find('.enemy_ap').text(value);
}

/**
 * 敵制空値調整欄終了時
 * @param {JqueryDomObject} $this
 */
function enemy_ap_select_parent_Close($this) {
  $this.find('.enemy_ap').text($this.find('.enemy_ap_input').val());
  calculate();
}

/**
 * 機体選択欄 機体カテゴリ変更時
 */
function plane_type_select_Changed() {
  const $this = $('#plane_type_select');
  // 選択時のカテゴリ
  let selectedType = castInt($this.val());
  // ベース機体一覧
  let org = getPlanes(selectedType);
  // 検索語句
  let searchWord = $('#plane_word').val().trim();
  // 現状のカテゴリ
  let dispType = [];
  $this.find('option').each(function () { dispType.push(castInt($(this).val())); });

  // 特定の艦娘が選ばれている場合の調整
  if ($target && $target.attr('class').includes('ship_plane') && $target.closest('.ship_tab')[0].dataset.shipid) {
    const ship = SHIP_DATA.find(v => v.id === castInt($target.closest('.ship_tab')[0].dataset.shipid));
    const basicCanEquip = LINK_SHIP_EQUIPMENT.find(v => v.type === ship.type);
    const special = SPECIAL_LINK_SHIP_EQUIPMENT.find(v => v.shipId === ship.id);
    dispType = basicCanEquip.e_type.concat();
    if (special) dispType = dispType.concat(special.equipmentTypes);

    if (!dispType || !dispType.includes(selectedType)) {
      selectedType = 0;
      org = getPlanes(selectedType);
    }

    // 試製景雲削除
    org = org.filter(v => v.id !== 151);

    // 特別装備可能な装備カテゴリ対応
    if (special && special.equipmentTypes.length > 0) dispType = dispType.concat(special.equipmentTypes);

    // 重複を切る
    dispType = dispType.filter((x, i, self) => self.indexOf(x) === i);
    dispType.sort((a, b) => a - b);

    // カテゴリ一覧にないもの除外
    org = org.filter(v => dispType.includes(Math.abs(v.type)));

    // 特別装備可能な装備対応
    if (special && special.equipmentIds.length > 0) {
      for (const id of special.equipmentIds) {
        const plane = PLANE_DATA.find(v => v.id === id);
        dispType.push(plane.type);

        // もしまだ追加されてないなら追加
        if (!org.find(v => v.id === id) && (selectedType === 0 || selectedType === plane.type)) org.push(plane);
      }
    }

    // 装備可能カテゴリ表示変更
    setPlaneType($this, dispType);
    $this.val(selectedType);
  }
  else {
    // カテゴリ一覧にないもの除外
    org = org.filter(v => dispType.includes(Math.abs(v.type)));
  }

  if (searchWord) {
    searchWord = searchWord.replace('601', '六〇一');
    searchWord = searchWord.replace('634', '六三四');
    searchWord = searchWord.replace('931', '九三一');
    searchWord = searchWord.replace('22', '二二');
    searchWord = searchWord.replace('34', '三四');
    searchWord = searchWord.replace('96', '九六');
    searchWord = searchWord.replace('97', '九七');
    searchWord = searchWord.replace('99', '九九');
    org = org.filter(v => v.name.includes(searchWord) || v.abbr.includes(searchWord));
  }

  // ソート反映
  const sortKey = $('#plane_sort_select').val();
  const isAsc = $('#plane_asc').prop('checked');

  $('#plane_asc').prop('disabled', false);
  $('#plane_desc').prop('disabled', false);
  switch (sortKey) {
    case 'battle_anti_air':
      if (isAsc) org.sort((a, b) => (a.antiAir + 1.5 * a.interception) - (b.antiAir + 1.5 * b.interception));
      else org.sort((a, b) => (b.antiAir + 1.5 * b.interception) - (a.antiAir + 1.5 * a.interception));
      break;
    case 'defense_anti_air':
      if (isAsc) org.sort((a, b) => (a.antiAir + a.interception + 2.0 * a.antiBomber) - (b.antiAir + b.interception + 2.0 * b.antiBomber));
      else org.sort((a, b) => (b.antiAir + b.interception + 2.0 * b.antiBomber) - (a.antiAir + a.interception + 2.0 * a.antiBomber));
      break;
    case 'radius':
      if (isAsc) org.sort((a, b) => a.radius - b.radius);
      else org.sort((a, b) => b.radius - a.radius);
      break;
    case 'default':
      $('#plane_asc').prop('disabled', true);
      $('#plane_desc').prop('disabled', true);
      break;
    default:
      if (isAsc) org.sort((a, b) => a[sortKey] - b[sortKey]);
      else org.sort((a, b) => b[sortKey] - a[sortKey]);
      break;
  }

  createPlaneTable(org);
}

/**
 * 検索語句が変更された(機体)
 */
function plane_word_TextChanged() {
  if (timer !== false) clearTimeout(timer);
  timer = setTimeout(function () { plane_type_select_Changed(); }, 250);
}

/**
 * 在庫有のみ表示クリック時
 */
function disp_in_stock_Checked_Chenged() {
  setting.inStockOnly = $('#disp_in_stock').prop('checked');
  saveLocalStrage('setting', setting);
  plane_type_select_Changed();
}

/**
 * 配備済みも表示クリック時
 */
function disp_equiped_Checked_Chenged() {
  setting.visibleEquiped = $('#disp_equiped').prop('checked');
  saveLocalStrage('setting', setting);
  plane_type_select_Changed();
}

/**
 * 基地機体はずすボタンクリック時
 * @param {JqueryDomObject} $this
 */
function btn_remove_lb_plane_Clicked($this) {
  const $plane = $this.closest('.lb_plane');
  clearPlaneDiv($plane);
  $plane.find('.slot').text(0);
  $plane.find('.slot_input').attr('max', 0);
  $plane.find('.slot_range').attr('max', 0);

  calculate();
}

/**
 * 各種選択欄　表示形式クリック時
 * @param {JqueryDomObject} $this
 */
function toggle_display_type_Clicked($this) {
  const $parentModal = $this.closest('.modal');
  $parentModal.find('.toggle_display_type').removeClass('selected');
  $this.addClass('selected');

  setting.displayMode[$parentModal.attr('id')] = $this.data('mode');
  saveLocalStrage('setting', setting);
  $parentModal.find('select').change();
}

/**
 * 各種選択欄　ソート変更時
 * @param {JqueryDomObject} $this
 */
function sort_Changed($this) {
  const $parentModal = $this.closest('.modal');
  const sortKey = $parentModal.find('.sort_select').val();
  const isAsc = $parentModal.find('.order_asc').prop('checked');
  setting.orderBy[$parentModal.attr('id')] = [sortKey, isAsc ? 'asc' : 'desc'];

  saveLocalStrage('setting', setting);
  $parentModal.find('select:first').change();
}

/**
 * 機体名クリック時 (モーダル展開処理)
 * @param {JqueryDomObject} $this
 */
function plane_name_Clicked($this) {
  // 機体選択画面の結果を返却するターゲットのdiv要素を取得
  $target = $this.closest('.lb_plane');
  if (!$target.attr('class')) $target = $this.closest('.ship_plane');

  const selectedID = castInt($target[0].dataset.planeid);
  let selectedType = Math.abs(castInt($target[0].dataset.type));
  const $modalBody = $('#modal_plane_select').find('.modal-body');

  let prevTypeId = $('#plane_type_select').val();

  if ($target.attr('class').includes('ship_plane')) {
    // 艦娘から展開した場合、陸上機は非表示とし、選択されていたら全てにする
    selectedType = selectedType > 99 ? 0 : selectedType;
    $modalBody.find('#optg_lb').remove();
    if (prevTypeId > 100) prevTypeId = 0;
  }
  else {
    // 機体カテゴリ一覧初期化
    setPlaneType($('#plane_type_select'), PLANE_TYPE.filter(v => v.id > 0).map(v => v.id));
  }

  $('#plane_type_select').val(prevTypeId).change();
  $('#modal_plane_select').find('.btn_remove').prop('disabled', selectedID === 0);
  $('#modal_plane_select').modal('show');
}

/**
 * モーダル内機体選択時
 * @param {JqueryDomObject} $this
 */
function modal_plane_Selected($this) {
  const plane = { id: castInt($this[0].dataset.planeid), remodel: castInt($this[0].dataset.remodel) };
  if ($target.attr('class').includes('lb_plane')) {
    // 基地航空隊に機体セット
    setLBPlaneDiv($target, plane);
    // お札が待機になってるなら集中または防空に変更
    $target.closest('.lb_tab').find('.ohuda_select').val(isDefMode ? 0 : 2);
  }
  // 艦娘に機体セット
  else if ($target.attr('class').includes('ship_plane')) setPlaneDiv($target, plane);

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
    parentId = castInt($target[0].dataset.shipid);
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
function plane_preset_tr_Clicked($this) {
  const preset = planePreset.find(v => v.id === castInt($this.data('presetid')));
  $('.preset_tr').removeClass('preset_selected');
  $this.addClass('preset_selected');
  drawPlanePresetPreview(preset);
}

/**
 * プリセット名変更時
 * @param {JqueryDomObject} $this
 */
function preset_name_Changed($this) {
  // 入力検証　全半40文字くらいで
  const input = $this.val().trim();
  const $btn = $this.closest('.modal-body').find('.btn_commit_preset');
  const $btn2 = $this.closest('.modal-body').find('.btn_commit_preset_header');
  if (input.length > 40) {
    $this.addClass('is-invalid');
    $btn.prop('disabled', true);
    $btn2.prop('disabled', true);
  }
  else if (input.length === 0) {
    $this.addClass('is-invalid');
    $btn.prop('disabled', true);
    $btn2.prop('disabled', true);
  }
  else {
    $this.removeClass('is-invalid');
    $this.addClass('is-valid');
    $btn.prop('disabled', false);
    $btn2.prop('disabled', false);
  }
  $('#modal_main_preset').find('.btn_commit_preset_header').tooltip('hide');
}

/**
 * 機体プリセット内 プリセット保存クリック時
 * @param {JqueryDomObject} $this
 */
function btn_commit_plane_preset_Clicked($this) {
  $this.prop('disabled', true);
  // プリセット変更 & 保存
  updatePlanePreset();
  loadPlanePreset();
}

/**
 * 機体プリセット内 プリセット削除クリック時
 * @param {JqueryDomObject} $this
 */
function btn_delete_plane_preset_Clicked($this) {
  $this.prop('disabled', true);
  deletePlanePreset();
  loadPlanePreset();
}

/**
 * 機体プリセット内 プリセット展開クリック時
 */
function btn_expand_plane_preset_Clicked() {
  const presetId = castInt($('.preset_selected').data('presetid'));
  const preset = planePreset.find(v => v.id === presetId);
  if (preset) {
    // プリセット展開
    if ($target.attr('class').includes('lb_tab')) {
      $target.find('.lb_plane').each((i, e) => {
        const plane = new Object();
        plane.id = preset.planes[i];
        setLBPlaneDiv($(e), plane);
      });
      // お札が待機になってるなら集中または防空に変更
      $target.find('.ohuda_select').val(isDefMode ? 0 : 2);
    }
    else {
      $target.find('.ship_plane').each((i, e) => {
        const plane = new Object();
        plane.id = preset.planes[i];
        setPlaneDiv($(e), plane);
      });
    }
  }
  $('#modal_plane_preset').modal('hide');
}

/**
 * 表示隻数変更時
 * @param {JqueryDomObject} $this .display_ship_count
 * @param {boolean} cancelCalculate 計算を行わない場合はtrue
 */
function display_ship_count_Changed($this, cancelCalculate = false) {
  const displayCount = $this.val();
  $this.closest('.friendFleet_tab').find('.ship_tab').each((i, e) => {
    if (i < displayCount) $(e).removeClass('d-none');
    else $(e).addClass('d-none');
  });

  if (!cancelCalculate) calculate();
}

/**
 * 艦娘機体はずすボタンクリック時
 * @param {JqueryDomObject} $this
 */
function btn_remove_ship_plane_Clicked($this) {
  clearPlaneDiv($this.closest('.ship_plane'));
  calculate();
}

/**
 * 艦隊表示変更時
 */
function fleet_select_tab_Clicked() {
  if (!$('#union_fleet').prop('checked')) calculate();
}

/**
 * 艦娘無効クリック
 * @param {JqueryDomObject} $this
 */
function ship_disabled_Changed($this) {
  if ($this.prop('checked')) {
    $this.closest('.ship_tab').addClass('opacity4');
  }
  else {
    $this.closest('.ship_tab').removeClass('opacity4');
  }
  calculate();
}

/**
 * 艦娘一覧モーダル展開クリック時
 * @param {JqueryDomObject} $this
 */
function ship_name_span_Clicked($this) {
  $target = $this.closest('.ship_tab');
  const selectedID = castInt($target[0].dataset.shipid);

  // 選択艦娘がいるなら
  if (selectedID) {
    $('#modal_ship_select').find('.btn_remove').prop('disabled', false);
  }
  else $('#modal_ship_select').find('.btn_remove').prop('disabled', true);
  $('#ship_type_select').change();
  $('#modal_ship_select').modal('show');
}


/**
 * 検索語句が変更された(艦娘)
 */
function ship_word_TextChanged() {
  if (timer !== false) clearTimeout(timer);
  timer = setTimeout(function () { createShipTable([castInt($('#ship_type_select').val())]); }, 250);
}

/**
 * 艦娘一覧モーダル 艦娘クリック時
 * @param {JqueryDomObject} $this
 */
function modal_ship_Selected($this) {
  setShipDiv($target, castFloat($this[0].dataset.shipid));
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
  createEnemyInput(castInt($this.val()));
  calculate();
}

/**
 * 戦闘全体リセット時
 * @param {JqueryDomObject} $this
 */
function btn_reset_battle_Clicked($this) {
  const $tmp = isDefMode ? $('#air_raid_enemies') : $this.closest('.battle_content');
  $tmp[0].dataset.celldata = '';
  $tmp.find('.enemy_content:not(:first)').remove();
  clearEnemyDiv($tmp.find('.enemy_content'));
  $this.blur();
  calculate();
}

/**
 * 検索語句が変更された(敵艦)
 */
function enemy_word_TextChanged() {
  if (timer !== false) clearTimeout(timer);
  timer = setTimeout(function () { createEnemyTable([castInt($('#enemy_type_select').val())]); }, 250);
}

/**
 * 敵艦名クリック時
 * @param {JqueryDomObject} $this
 */
function enemy_name_Clicked($this) {
  $target = $this.closest('.enemy_content');
  const selectedID = castInt($target[0].dataset.enemyid);
  $('#enemy_type_select').change();
  if (selectedID !== 0) $('#modal_enemy_select').find('.btn_remove').prop('disabled', false);
  else $('#modal_enemy_select').find('.btn_remove').prop('disabled', true);
  $('#modal_enemy_select').modal('show');
}

/**
 * 敵一覧モーダル 敵艦名クリック時
 * @param {JqueryDomObject} $this
 */
function modal_enemy_Selected($this) {
  // 敵艦セット
  setEnemyDiv($target, castInt($this[0].dataset.enemyid));
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
  if (isDefMode) $target = $('#air_raid_enemies');
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
 * 敵編成パターン名クリック時
 * @param {JqueryDomObject} $this
 */
function pattern_Changed($this) {
  const pattern = castInt($this.find('.nav-link').data('disp'), -1);
  if (pattern < 0) return;
  createEnemyPattern(pattern);
}

/**
 * 敵艦表示モード変更時
 * @param {JqueryDomObject} $this
 */
function enemy_display_mode_Changed($this) {
  setting.enemyDisplayImage = $this.attr('id').includes('enemy_dispmay_image');
  saveLocalStrage('setting', setting);
  const pattern = castInt($('#enemy_pattern_select').find('.nav-link.active').data('disp'));
  if (pattern > 0) createEnemyPattern(pattern);
  else createEnemyPattern();
}

/**
 * マップ上のセルクリック時
 * @param {JqueryDomObject} $this
 */
function node_Clicked($this) {
  $('.node_tr').removeClass('node_selected');
  const $targetNode = $('.node_tr[data-node="' + $this.attr('title') + '"');
  $targetNode.addClass('node_selected');
  $targetNode[0].scrollIntoView(true);
  createEnemyPattern();
}

/**
 * 敵編成展開クリック時
 */
function btn_expand_enemies() {
  const area = castInt($('#map_select').val());
  const node = $('.node_selected').data('node');
  const patternNo = castInt($('#enemy_pattern_select').find('.nav-link.active').data('disp'));
  let lv = -1;
  if (area >= 1000) {
    lv = castInt($('#select_difficulty').val());
  }

  const pattern = ENEMY_PATTERN.filter(v => v.area === area && v.node === node && v.lv === lv)[patternNo];

  // 展開対象が空襲なら防空モードに乗っ取り
  if (!isDefMode && node === '空襲') {
    isDefMode = true;
    // みんな防空に 
    $('.ohuda_select').each((i, e) => { $(e).val(0); });
    $target = $('#air_raid_enemies');
  }
  else if (isDefMode && node !== '空襲') {
    isDefMode = false;
    $('.ohuda_select').each((i, e) => { if (castInt($(e).val()) === 0) $(e).val(-1); });
    $target = $('.battle_content:first');
  }

  // 元の敵編成解除
  if ($target.find('.enemy_content:not(:first)').length) {
    $target.find('.enemy_content:not(:first)').remove();
  }
  clearEnemyDiv($target.find('.enemy_content'));

  // 戦闘マス情報
  $target.find('.cell_type').val(isDefMode && pattern.type !== 5 ? 3 : pattern.type);
  // 陣形
  $target.find('.formation').val(pattern.form);

  // 敵展開
  for (const id of pattern.enemies) setEnemyDiv($target.find('.enemy_content:last()'), id);
  // 半径
  $target.find('.enemy_range').text(pattern.radius);

  // 進行航路情報を付与
  $target[0].dataset.celldata = area + "_" + pattern.node + (pattern.remarks ? '(' + pattern.remarks + ')' : '');

  $('#modal_enemy_pattern').modal('hide');
}

/**
 * 撃墜表マウスin
 * @param {JqueryDomObject} $this
 */
function shoot_down_table_tbody_MouseEnter($this) {
  const $tr = $this.closest('tr');
  const rowIndex = castInt($tr[0].dataset.rowindex);
  const css = $tr[0].dataset.css;
  $tr.addClass('bg-light');
  $tr.find('.td_plane_name').addClass(css);
  $('#shoot_down_table_tbody').find('.shipNo' + rowIndex + ':first').find('.td_name').addClass('bg-light');
}

/**
 * 撃墜表マウスleave
 * @param {JqueryDomObject} $this
 */
function shoot_down_table_tbody_MouseLeave($this) {
  const $tr = $this.closest('tr');
  const rowIndex = castInt($tr[0].dataset.rowindex);
  const css = $tr[0].dataset.css;
  $tr.removeClass('bg-light');
  $tr.find('.td_plane_name').removeClass(css);
  $('#shoot_down_table_tbody').find('.shipNo' + rowIndex + ':first').find('.td_name').removeClass('bg-light');
}

/**
 * グラフマウスin
 * @param {JqueryDomObject} $this
 */
function progress_area_MouseEnter($this) {
  const $bar = $this.find('.result_bar');
  const status = castInt($bar.data('airstatus'));
  const rowIndex = castInt($bar.attr('id').replace('result_bar_', ''));
  $bar.addClass('bar_ex_status' + status);
  $('#rate_row_' + rowIndex).addClass('bg_status' + status);
}

/**
 * グラフマウスleave
 * @param {JqueryDomObject} $this
 */
function progress_area_MouseLeave($this) {
  const $bar = $this.find('.result_bar');
  const status = castInt($bar.data('airstatus'));
  const rowIndex = castInt($bar.attr('id').replace('result_bar_', ''));
  $bar.removeClass('bar_ex_status' + status);
  $('#rate_row_' + rowIndex).removeClass('bg_status' + status);
}

/**
 * 確率テーブルマウスin
 * @param {JqueryDomObject} $this
 */
function rate_table_MouseEnter($this) {
  const rowIndex = castInt($this.closest('tr').attr('id').replace('rate_row_', ''));
  const $bar = $('#result_bar_' + rowIndex);
  const status = castInt($bar.data('airstatus'));
  $bar.addClass('bar_ex_status' + status);
  $('#rate_row_' + rowIndex).addClass('bg_status' + status);
}

/**
 * 確率テーブルマウスLeave
 * @param {JqueryDomObject} $this
 */
function rate_table_MouseLeave($this) {
  const rowIndex = castInt($this.closest('tr').attr('id').replace('rate_row_', ''));
  const $bar = $('#result_bar_' + rowIndex);
  const status = castInt($bar.data('airstatus'));
  $bar.removeClass('bar_ex_status' + status);
  $('#rate_row_' + rowIndex).removeClass('bg_status' + status);
}

/**
 * 敵撃墜表マウスin
 * @param {JqueryDomObject} $this
 */
function enemy_shoot_down_table_tbody_MouseEnter($this) {
  const $tr = $this.closest('tr');
  const rowIndex = castInt($tr[0].dataset.rowindex);
  const css = $tr[0].dataset.css;
  $tr.addClass('bg-light');
  $tr.find('.td_plane_name').addClass(css);
  $('#enemy_shoot_down_tbody').find('.enemy_no_' + rowIndex + ':first').find('.td_name').addClass('bg-light');
}

/**
 * 敵撃墜表マウスleave
 * @param {JqueryDomObject} $this
 */
function enemy_shoot_down_table_tbody_MouseLeave($this) {
  const $tr = $this.closest('tr');
  const rowIndex = castInt($tr[0].dataset.rowindex);
  const css = $tr[0].dataset.css;
  $tr.removeClass('bg-light');
  $tr.find('.td_plane_name').removeClass(css);
  $('#enemy_shoot_down_tbody').find('.enemy_no_' + rowIndex + ':first').find('.td_name').removeClass('bg-light');
}

/**
 * 表示戦闘タブ変更時
 * @param {JqueryDomObject} $this
 */
function display_battle_tab_Changed($this) {
  displayBattle = castInt($this.find('.nav-link').data('disp'));
  calculate();
}

/**
 * 表示物変更時
 */
function display_result_Changed() {
  if ($('#display_land_base_result').prop('checked')) {
    for (let i = 1; i < 7; i++) {
      $('#rate_row_' + i + ':not(.disabled_tr)').removeClass('d-none');
      $('#result_bar_' + i).closest('.progress_area:not(.disabled_bar)').removeClass('d-none').addClass('d-flex');
    }
  }
  else {
    for (let i = 1; i < 7; i++) {
      $('#rate_row_' + i + ':not(.disabled_tr)').addClass('d-none');
      $('#result_bar_' + i).closest('.progress_area:not(.disabled_bar)').addClass('d-none').removeClass('d-flex');
    }
  }

  if ($('#display_fleet_result').prop('checked')) {
    $('#rate_row_7:not(.disabled_tr)').removeClass('d-none');
    $('#result_bar_7').closest('.progress_area:not(.disabled_bar)').removeClass('d-none').addClass('d-flex');
  }
  else {
    $('#rate_row_7:not(.disabled_tr)').addClass('d-none');
    $('#result_bar_7').closest('.progress_area:not(.disabled_bar)').addClass('d-none').removeClass('d-flex');
  }

  if ($('#display_bar').prop('checked')) {
    $('#result_bar_parent').removeClass('d-none');
  }
  else {
    $('#result_bar_parent').addClass('d-none');
  }

  if ($('#display_enemy_table').prop('checked')) {
    $('#enemy_shoot_down_table_parent').removeClass('d-none');
  }
  else {
    $('#enemy_shoot_down_table_parent').addClass('d-none');
  }
}

/**
 * 内部熟練度120計算機体カテゴリ変更時
 * @param {JqueryDomObject} $this
 */
function innerProfSetting_Clicked($this) {
  const clickedType = castInt($this.attr('id').replace('prof120_', ''));
  if ($this.prop('checked') && !initialProf120Plane.includes(clickedType)) {
    initialProf120Plane.push(clickedType);
  }
  else if (!$this.prop('checked') && initialProf120Plane.includes(clickedType)) {
    initialProf120Plane = initialProf120Plane.filter(v => v !== clickedType);
  }

  setting.initialProf120 = initialProf120Plane.sort((a, b) => a - b);
  saveLocalStrage('setting', setting);

  calculate();
}

/**
 * シミュレート回数変更時
 * @param {JqueryDomObject} $this
 */
function calculate_count_Changed($this) {
  // 入力検証 -> 数値 かつ 0 以上 max 以下　違ってたら修正
  const value = validateInputNumber($this.val(), 100000);

  $this.val(value);
  setting.simulateCount = value;
  // ローカルストレージへ保存
  saveLocalStrage('setting', setting);
}

/**
 * 自動保存クリック時
 */
function auto_save_Clicked() {
  setting.autoSave = $('#auto_save').prop('checked');
  saveLocalStrage('setting', setting);
  if (!setting.autoSave) deleteLocalStrage('autoSaveData');
}

/**
 * クリップボード保存チェック
 */
function clipbord_mode_Clicked() {
  // 未対応の場合強制 false
  if (typeof ClipboardItem !== "function") {
    $('#clipbord_mode').prop('checked', false);
    $('#cant_use_clipbord').removeClass('d-none');
  }

  setting.copyToClipbord = $('#clipbord_mode').prop('checked');
  saveLocalStrage('setting', setting);
}

/**
 * 空襲被害最大
 */
function air_raid_max_Clicked() {
  setting.airRaidMax = $('#air_raid_max').prop('checked');
  saveLocalStrage('setting', setting);
}

/**
 * 設定削除クリック時
 */
function btn_reset_localStrage_Clicked() {
  const $modal = $('#modal_confirm');
  $modal.find('.modal-body').html(`
    <div>ブラウザに保存された設定を削除します。</div>
    <div class="mt-3">登録されている編成プリセット、装備プリセット、各種詳細設定値などが削除されます。</div>
    <div class="mt-3">よろしければ、OKボタンを押してください。</div>
  `);
  confirmType = "deleteLocalStrageAll";
  $modal.modal('show');
}

/**
 * 所持テーブルカテゴリ変更時
 */
function stock_type_select_Changed() {
  const displayType = Math.abs(castInt($('#stock_type_select').val()));
  let searchWord = $('#stock_word').val().trim();
  if (searchWord) {
    searchWord = searchWord.replace('601', '六〇一');
    searchWord = searchWord.replace('634', '六三四');
    searchWord = searchWord.replace('931', '九三一');
    searchWord = searchWord.replace('22', '二二');
    searchWord = searchWord.replace('34', '三四');
    searchWord = searchWord.replace('96', '九六');
    searchWord = searchWord.replace('97', '九七');
    searchWord = searchWord.replace('99', '九九');
  }

  $('.stock_tr').each((i, e) => {
    // カテゴリになければ非表示
    if (displayType > 0 && !$(e).hasClass('type_' + displayType)) {
      $(e).addClass('d-none').removeClass('d-flex');
    }
    // 名前がなければ非表示
    else if (searchWord && !$(e).find('.stock_td_name').text().includes(searchWord)) {
      $(e).addClass('d-none').removeClass('d-flex');
    }
    else {
      $(e).addClass('d-flex').removeClass('d-none');
    }
  });
}

/**
 * 所持装備情報読み込みクリック
 */
function btn_load_equipment_json_Clicked() {
  const inputData = $('#input_equipment_json').val().trim();

  if (readEquipmentJson(inputData)) {
    setPlaneStockTable();
    $('#input_equipment_json').val('');
    $('#input_equipment_json').removeClass('is-invalid').addClass('is-valid');
  }
  else {
    $('#input_equipment_json').addClass('is-invalid').removeClass('is-valid');
    $('#input_equipment_json').nextAll('.invalid-feedback').text('装備情報の読み込みに失敗しました。入力されたデータ形式が正しくない可能性があります。');
  }
}

/**
 * 装備情報テキスト変更時
 * @param {*} $this
 */
function input_equipment_json_Changed($this) {
  // 入力検証　0文字はアウト
  const input = $this.val().trim();
  const $btn = $('#btn_load_equipment_json');
  if (input.length === 0) {
    $this.addClass('is-invalid').removeClass('is-valid');
    $this.nextAll('.invalid-feedback').text('データが入力されていません。');
    $btn.prop('disabled', true);
  }
  else {
    $this.removeClass('is-invalid');
    $btn.prop('disabled', false);
  }
}


/**
 * 所持数全リセット
 */
function btn_stock_all_clear_Clicked() {
  const $modal = $('#modal_confirm');
  $modal.find('.modal-body').html(`
    <div>所持機体情報をリセットします。</div>
    <div class="mt-3">現在保存されている所持装備情報が削除され、全ての機体の所持数が0となります。</div>
    <div class="mt-3">よろしければ、OKボタンを押してください。</div>
  `);
  confirmType = "resetStock";
  $modal.modal('show');
}


/**
 * 検索語句が変更された(所持機体)
 */
function stock_word_TextChanged() {
  if (timer !== false) clearTimeout(timer);
  timer = setTimeout(function () { stock_type_select_Changed() }, 250);
}

/**
 * 所持機体名クリック
 * @param {JqueryDomObject} $this
 */
function stock_tr_Clicked($this) {
  const $modal = $('#modal_plane_stock');
  const $tr = $modal.find('.plane_status_tr');
  const plane = PLANE_DATA.find(v => v.id === castInt($this.data('planeid')));
  const planeStock = loadPlaneStock();
  const stockData = planeStock.find(v => v.id === plane.id);

  $modal.find('.stock_num').each((i, e) => {
    $(e).val(stockData.num[i]);
    if (i > 0) $(e).prop('disabled', !plane.canRemodel);
  });
  $tr.find('.plane_status_anti_air').text(plane.antiAir);
  $tr.find('.plane_status_torpedo').text(plane.torpedo);
  $tr.find('.plane_status_bomber').text(plane.bomber);
  $tr.find('.plane_status_radius').text(plane.radius);
  $tr.find('.plane_status_interception').text(plane.interception);
  $tr.find('.plane_status_anti_bomber').text(plane.antiBomber);
  $tr.find('.plane_status_avoid').text(AVOID_TYPE.find(v => v.id === plane.avoid).name);
  $modal.find('#edit_id').text(plane.id);
  $modal.find('.plane_status_name').text(plane.name);
  $modal.find('#stock_sum').val(getArraySum(stockData.num));
  $modal.find('.img_plane_card').attr('src', 'img/plane/' + plane.id + '.png');
  $modal.modal('show');
}

/**
 * 所持数変更時
 * @param {JqueryDomObject} $this
 */
function stock_Changed($this) {
  let inputValue = castInt($this.val());
  // 全体総数
  let sum = 0;
  $('.stock_num').each((i, e) => {
    sum += castInt($(e).val());
  });
  // 99超えたら補正
  if (sum > 99) {
    inputValue -= (sum - 99);
    sum = 99;
  }

  $this.val(validateInputNumber(inputValue, 99));
  $('#stock_sum').val(sum);
}

/**
 * 所持機体数保存クリック
 */
function btn_save_stock_Clicked() {
  const planeStock = loadPlaneStock();
  const planeId = castInt($('#edit_id').text());

  const numArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  $('.stock_num').each((i, e) => {
    numArray[i] = castInt($(e).val());
  });

  planeStock.find(v => v.id === planeId).num = numArray;
  saveLocalStrage('planeStock', planeStock);

  $('#modal_plane_stock').modal('hide');
  setPlaneStockTable();
}

/**
 * 所持数リセットボタンクリック
 */
function btn_stock_reset_Clicked() {
  $('#modal_plane_stock').find('.stock_num').val('0');
  $('#modal_plane_stock').find('#stock_sum').val('0');
}

/**
 * 確認ダイアログOKボタンクリック時
 */
function modal_confirm_ok_Clicked() {
  switch (confirmType) {
    case "deleteLocalStrage":
      window.localStorage.clear();
      break;
    case "resetStock":
      deleteLocalStrage('planeStock');
      setPlaneStockTable();
      break;
    case "Error":
      break;
    default:
      break;
  }
  confirmType = null;
  $('#modal_confirm').modal('hide');
}

/**
 * 編成保存・展開ボタンクリック
 */
function btn_preset_all_Clicked() {
  loadMainPreset();
  $('#modal_main_preset').modal('show');
}

/**
 * おまかせボタンクリック
 */
function btn_auto_expand_Clicked() {
  $('#alert_auto_expand').addClass('d-none');
  $('#modal_auto_expand').modal('show');
}

/**
 * Twitterボタンクリック
 */
function btn_twitter_Clicked() {
  window.open('https://twitter.com/share?url=https://noro6.github.io/kcTools/?d=' + encordPreset());
}

/**
 * デッキビルダーボタンクリック
 */
function btn_deckBuilder_Clicked() {
  window.open('http://kancolle-calc.net/deckbuilder.html?predeck=' + convertToDeckBuikder());
}

/**
 * 機体プリセット内 プリセット一覧名クリック
 * @param {JqueryDomObject} $this
 */
function main_preset_tr_Clicked($this) {
  $('.preset_tr').removeClass('preset_selected');
  $this.addClass('preset_selected');
  drawMainPreset(presets.find(v => v[0] === castInt($this.data('presetid'))));
}

/**
 * プリセットメモ変更時
 * @param {JqueryDomObject} $this
 */
function preset_remarks_Changed($this) {
  // 入力検証　全半40文字くらいで
  const input = $this.val().trim();
  const $btn = $this.closest('.modal-body').find('.btn_commit_preset');
  const $btn2 = $this.closest('.modal-body').find('.btn_commit_preset_header');
  if (input.length > 400) {
    $this.addClass('is-invalid');
    $btn.prop('disabled', true);
    $btn2.prop('disabled', true);
  }
  else {
    $this.removeClass('is-invalid');
    $this.addClass('is-valid');
    $btn.prop('disabled', false);
    $btn2.prop('disabled', false);
  }
}

/**
 * 編成取り込みデータテキスト変更時
 * @param {JqueryDomObject} $this
 */
function input_deck_Changed($this) {
  // 入力検証　0文字はアウト
  const input = $this.val().trim();
  const $btn = $this.closest('.modal-body').find('.btn_load_deck');
  if (input.length === 0) {
    $this.addClass('is-invalid').removeClass('is-valid');
    $this.nextAll('.invalid-feedback').text('データが入力されていません。');
    $btn.prop('disabled', true);
  }
  else {
    $this.removeClass('is-invalid');
    $btn.prop('disabled', false);
  }
}

/**
 * 共有データ文字列欄クリック時
 * @param {JqueryDomObject} $this
 */
function output_data_Clicked($this) {
  if (!$this.hasClass('is-valid')) return;
  if (copyInputTextToClipboard($this)) $this.nextAll('.valid-feedback').text('クリップボードにコピーしました。');
}

/**
 * 共有データテキスト変更時
 * @param {JqueryDomObject} $this
 */
function output_data_Changed($this) {
  $this.removeClass('is-valid');
}

/**
 * 編成プリセット保存ボタンクリック
 */
function btn_commit_main_preset_Clicked() {
  // 新規登録 or 更新処理
  updateMainPreset();
  // 再読み込み
  loadMainPreset();
}

/**
 * 編成プリセット名変更ボタンクリック
 */
function btn_commit_preset_header_Clicked() {
  // プリセット名のみ更新処理
  updateMainPresetName();
  // 再読み込み
  loadMainPreset();
}

/**
 * 編成プリセット削除ボタンクリック
 */
function btn_delete_main_preset_Clicked() {
  const presetId = castInt($('#modal_main_preset').find('.preset_data').data('presetid'));
  deleteMainPreset(presetId);
}

/**
 * デッキビルダーデータ読み込みクリック
 */
function btn_load_deck_Clicked() {
  const inputData = $('#input_deck').val().trim();
  const preset = readDeckBuilder(inputData);

  if (preset) {
    expandMainPreset(preset, preset[0][0].length > 0, true, false);
    $('#input_deck').removeClass('is-invalid').addClass('is-valid');
  }
  else {
    $('#input_deck').addClass('is-invalid').removeClass('is-valid');
    $('#input_deck').nextAll('.invalid-feedback').text('編成の読み込みに失敗しました。入力されたデータの形式が正しくない可能性があります。');
  }
}

/**
 * 共有URL生成ボタンクリック
 */
function btn_output_url_Clicked() {
  try {
    const $output = $('#output_url');
    $output.val(location.protocol + "//" + location.hostname + location.pathname + "?d=" + encordPreset());
    $output.nextAll('.valid-feedback').text('生成しました。上記URLをクリックするとクリップボードにコピーされます。');
    $output.removeClass('is-invalid').addClass('is-valid');
  } catch (error) {
    $('#output_url').addClass('is-invalid').removeClass('is-valid');
    return;
  }
}

/**
 * デッキビルダー形式生成ボタンクリック
 */
function btn_output_deck_Clicked() {
  const dataString = convertToDeckBuikder();
  const $output = $('#output_deck');
  $('#output_deck').val(dataString);
  if (dataString) {
    $output.nextAll('.valid-feedback').text('生成しました。上記文字列をクリックするとクリップボードにコピーされます。');
    $output.removeClass('is-invalid').addClass('is-valid');
  }
  else $output.addClass('is-invalid').removeClass('is-valid');
}

/**
 * 編成プリセット展開クリック時
 */
function btn_expand_main_preset_Clicked() {
  // 展開するプリセット
  const preset = presets.find(v => v[0] === castInt($('#modal_main_preset').find('.preset_data').data('presetid')));
  expandMainPreset(decordPreset(preset[2]));
  $('#modal_main_preset').modal('hide');
}

/**
 * オート配備開始クリック時
 */
function btn_start_auto_expand_Clicked() {
  // 必須チェック
  if (!$('#auto_land_base_1').prop('checked') &&
    !$('#auto_land_base_2').prop('checked') &&
    !$('#auto_land_base_3').prop('checked') &&
    !$('#auto_fleet').prop('checked')) {
    $('#alert_auto_expand').text('配備対象を選択してください。');
    $('#alert_auto_expand').removeClass('alert-success d-none').addClass('alert-danger');
  }
  else {
    autoExpand();
    $('#alert_auto_expand').text('おまかせ艦載機配備が完了しました。');
    $('#alert_auto_expand').addClass('alert-success').removeClass('alert-danger d-none');
  }
}

/**
 * 出撃形式変更時
 */
function battle_mode_Clicked() {
  // 出撃の場合
  if ($('#mode_1').prop('checked')) {
    $('#auto_fleet').closest('div').removeClass('d-none');
    $('#dest_range_parent').removeClass('d-none');
    $('#details_parent').removeClass('d-none');
  }
  // 防空の場合
  else {
    $('#auto_fleet').prop('checked', false);
    $('#auto_fleet').closest('div').addClass('d-none');
    $('#dest_range_parent').addClass('d-none');
    $('#details_parent').addClass('d-none');
  }
}

/**
 * オート配備対象選択時
 */
function expand_target_Clicked() {
  $('#alert_auto_expand').addClass('d-none');
  $('#btn_start_auto_expand').prop('disabled', false);
  // 基地にチェックがない場合
  if (!$('#auto_land_base_1').prop('checked') && !$('#auto_land_base_2').prop('checked') && !$('#auto_land_base_3').prop('checked')) {
    $('#dest_range').prop('disabled', true);
    // さらに本隊にもチェックがない場合
    if (!$('#auto_fleet').prop('checked')) $('#btn_start_auto_expand').prop('disabled', true);
  }
  else $('#dest_range').prop('disabled', false);
}

/**
 * 目標制空値入力時
 * @param {JqueryDomObject} $this
 */
function dest_ap_Changed($this) {
  // 入力検証 -> 数値 かつ 0 以上 max 以下　違ってたら修正
  $this.val(validateInputNumber($this.val(), castInt($this.attr('max'))));
}

/**
 * 簡易計算機敵制空値入力時
 * @param {JqueryDomObject} $this
 */
function simple_enemy_ap_Changed($this) {
  // 入力検証 -> 数値 かつ 0 以上 max 以下　違ってたら修正
  const value = validateInputNumber($this.val(), castInt($this.attr('max')));
  $this.val(value);

  const borders = getAirStatusBorder(value);
  for (let i = 0; i < borders.length; i++) {
    $('#border_' + i).text(borders[i]);
  }
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

/**
 * バージョン通知閉じたとき
 */
function varsion_Closed() {
  if ($('#alreadyRead').prop('checked')) {
    setting.version = $('#version').text();
    saveLocalStrage('setting', setting);
  }
}

/**
 * 使い方クリック時
 */
function site_manual_Clicked() {
  $('#site_abstract_content').collapse('show');
  setTimeout(() => { window.scrollTo(0, $('#site_abstract').offset().top - 20); }, 300);
}

/*==================================
    イベントハンドラ
==================================*/
$(function () {
  // 画面初期化
  initialize(() => { calculate(); });

  // イベント貼り付け
  $('#modal_version_inform').on('hide.bs.modal', varsion_Closed);
  $('.modal').on('hide.bs.modal', function () { modal_Closed($(this)); });
  $('.modal').on('show.bs.modal', function () { $('.btn_preset').tooltip('hide'); });
  $('.slot_select_parent').on('show.bs.dropdown', function () { slot_select_parent_Show($(this)); });
  $('.slot_select_parent').on('hide.bs.dropdown', function () { slot_select_parent_Close($(this)); });
  $('.remodel_select_parent').on('hide.bs.dropdown', function () { remodelSelect_Changed($(this)); });
  $('.remodel_select_parent').on('show.bs.dropdown', function () { $(this).find('.remodel_item_selected').removeClass('remodel_item_selected'); });
  $(document).keyup(function (e) { if (isCtrlPress && e.keyCode === 17) isCtrlPress = false; });
  $(document).keydown(function (e) { if (!isCtrlPress && e.keyCode === 17) isCtrlPress = true; });
  $(document).on('show.bs.dropdown', '.enemy_ap_select_parent', function () { enemy_ap_select_parent_Show($(this)); });
  $(document).on('hide.bs.dropdown', '.enemy_ap_select_parent', function () { enemy_ap_select_parent_Close($(this)); });
  $(document).on('show.bs.collapse', '.collapse', function () { $(this).prev().find('.fa-chevron-up').removeClass('fa-chevron-up').addClass('fa-chevron-down'); });
  $(document).on('hide.bs.collapse', '.collapse', function () { $(this).prev().find('.fa-chevron-down').removeClass('fa-chevron-down').addClass('fa-chevron-up'); });
  $(document).on('shown.bs.collapse', '.collapse', function () { $(this).removeClass('tmpHide'); });
  $(document).on('focus', '.slot_input', function () { $(this).select(); });
  $(document).on('input', '.slot_input', function () { slot_input_Changed($(this)); });
  $(document).on('input', '.slot_range', function () { slot_range_Changed($(this)); });
  $(document).on('click', '.slot_ini', function () { slot_ini_Clicked($(this)); });
  $(document).on('click', '.remodel_item', function () { $(this).addClass('remodel_item_selected'); });
  $(document).on('click', '.plane_name', function () { plane_name_Clicked($(this)); });
  $(document).on('click', '.btn_plane_preset', function () { btn_plane_preset_Clicked($(this)); });
  $(document).on('click', '.toggle_display_type', function () { toggle_display_type_Clicked($(this)); });
  $(document).on('click', '.btn_air_raid', function () { btn_air_raid_Clicked($(this)); });
  $(document).on('click', '.btn_supply', function () { btn_supply_Clicked($(this)); });
  $(document).on('click', '.btn_capture', function () { btn_capture_Clicked($(this)); });
  $(document).on('click', '.btn_reset_content', function () { btn_reset_content_Clicked($(this)); });
  $(document).on('click', '.btn_content_trade', function () { btn_content_trade_Clicked($(this)); });
  $(document).on('click', '.btn_commit_trade', commit_content_order);
  $(document).on('click', '.btn_ex_setting', function () { btn_ex_setting_Clicked($(this)); });
  $(document).on('click', '.btn_remove_plane_all', function () { btn_remove_plane_all_Clicked($(this)); });
  $(document).on('click', '.btn_remove_ship_all', btn_remove_ship_all_Clicked);
  $(document).on('click', '.btn_slot_max', function () { btn_slot_max_Clicked($(this)); });
  $(document).on('click', '.btn_slot_default', function () { btn_slot_default_Clicked($(this)); });
  $(document).on('click', '.btn_slot_min', btn_slot_min_Clicked);
  $(document).on('input', '.coll_slot_range', function () { coll_slot_range_Changed($(this)); });
  $(document).on('input', '.coll_slot_input', function () { coll_slot_input_Changed($(this)); });
  $(document).on('focus', '.coll_slot_input', function () { $(this).select(); });
  $(document).on('click', '.btn_remodel', function () { btn_remodel_Clicked($(this)); });
  $(document).on('click', '.btn_fighter_prof_max', btn_fighter_prof_max_Clicked);
  $(document).on('click', '.btn_prof', function () { btn_prof_Clicked($(this)); });
  $(document).on('click', '.plane_lock', function () { plane_lock_Clicked($(this)); });
  $(document).on('click', '.plane_unlock', function () { plane_unlock_Clicked($(this)); });
  $(document).on('input', '.preset_name', function () { preset_name_Changed($(this)); });
  $(document).on('blur', '.preset_name', function () { preset_name_Changed($(this)); });
  $('#landBase_content').on('change', '.ohuda_select', function () { ohuda_Changed($(this)); });
  $('#landBase_content').on('click', '.btn_remove_plane', function () { btn_remove_lb_plane_Clicked($(this)); });
  $('#landBase_content').on('click', '.btn_reset_landBase', function () { btn_reset_landBase_Clicked($(this)); });
  $('#landBase_content').on('click', '.prof_item', function () { proficiency_Changed($(this)); });
  $('#friendFleet_content').on('change', '.display_ship_count', function () { display_ship_count_Changed($(this)); });
  $('#friendFleet_content').on('click', '.btn_reset_ship', function () { btn_reset_ship_Clicked($(this)); });
  $('#friendFleet_content').on('click', '.ship_name_span', function () { ship_name_span_Clicked($(this)); });
  $('#friendFleet_content').on('click', '.btn_remove_plane', function () { btn_remove_ship_plane_Clicked($(this)); });
  $('#friendFleet_content').on('click', '.prof_item', function () { proficiency_Changed($(this)); });
  $('#friendFleet_content').on('click', '.ship_disabled', function () { ship_disabled_Changed($(this)); });
  $('#friendFleet_content').on('click', '#union_fleet', calculate);
  $('#friendFleet_content .nav-link[data-toggle="tab"]').on('shown.bs.tab', fleet_select_tab_Clicked);
  $('#enemyFleet_content').on('change', '.cell_type', function () { cell_type_Changed($(this)); });
  $('#enemyFleet_content').on('change', '.formation', calculate);
  $('#enemyFleet_content').on('focus', '.enemy_ap_input', function () { $(this).select(); });
  $('#enemyFleet_content').on('input', '.enemy_ap_input', function () { enemy_ap_input_Changed($(this)); });
  $('#enemyFleet_content').on('input', '.enemy_ap_range', function () { enemy_ap_range_Changed($(this)); });
  $('#enemyFleet_content').on('click', '.enemy_name', function () { enemy_name_Clicked($(this)); });
  $('#enemyFleet_content').on('click', '.btn_reset_battle', function () { btn_reset_battle_Clicked($(this)); });
  $('#enemyFleet_content').on('click', '.btn_enemy_preset', function () { btn_enemy_preset_Clicked($(this)); });
  $('#enemyFleet_content').on('change', '#battle_count', function () { battle_count_Changed($(this)); });
  $('#enemyFleet_content').on('change', '#landBase_target', calculate);
  $('#result_content').on('click', '#display_battle_tab .nav-item', function () { display_battle_tab_Changed($(this)); });
  $('#result_content').on('click', '#empty_slot_invisible', calculate);
  $('#result_content').on('click', '#display_setting .custom-control-input', display_result_Changed);
  $('#config_content').on('focus', '#calculate_count', function () { $(this).select(); });
  $('#config_content').on('input', '#calculate_count', function () { calculate_count_Changed($(this)); });
  $('#config_content').on('click', '#btn_reset_localStrage', btn_reset_localStrage_Clicked);
  $('#config_content').on('click', '#innerProfSetting .custom-control-input', function () { innerProfSetting_Clicked($(this)); });
  $('#config_content').on('click', '#auto_save', auto_save_Clicked);
  $('#config_content').on('click', '#clipbord_mode', clipbord_mode_Clicked);
  $('#config_content').on('click', '#air_raid_max', air_raid_max_Clicked);
  $('#config_content').on('click', '.dropdown-item', function () { init_proficiency_Changed($(this)); });
  $('#plane_stock').on('change', '#stock_type_select', function () { stock_type_select_Changed($(this)); });
  $('#plane_stock').on('click', '.stock_tr', function () { stock_tr_Clicked($(this)); });
  $('#plane_stock').on('click', '#btn_load_equipment_json', btn_load_equipment_json_Clicked);
  $('#plane_stock').on('input', '#input_equipment_json', function () { input_equipment_json_Changed($(this)); });
  $('#plane_stock').on('focus', '#input_equipment_json', function () { $(this).select(); });
  $('#plane_stock').on('click', '#btn_stock_all_clear', btn_stock_all_clear_Clicked);
  $('#plane_stock').on('input', '#stock_word', stock_word_TextChanged);
  $('#modal_plane_select').on('click', '.plane', function () { modal_plane_Selected($(this)); });
  $('#modal_plane_select').on('click', '.btn_remove', function () { modal_plane_select_btn_remove_Clicked($(this)); });
  $('#modal_plane_select').on('change', '#plane_type_select', plane_type_select_Changed);
  $('#modal_plane_select').on('click', '#disp_in_stock', disp_in_stock_Checked_Chenged);
  $('#modal_plane_select').on('click', '#disp_equiped', disp_equiped_Checked_Chenged);
  $('#modal_plane_select').on('input', '#plane_word', plane_word_TextChanged);
  $('#modal_plane_select').on('change', '#plane_sort_select', function () { sort_Changed($(this)); });
  $('#modal_plane_select').on('click', '#plane_asc', function () { sort_Changed($(this)); });
  $('#modal_plane_select').on('click', '#plane_desc', function () { sort_Changed($(this)); });
  $('#modal_plane_preset').on('click', '.preset_tr', function () { plane_preset_tr_Clicked($(this)); });
  $('#modal_plane_preset').on('click', '.btn_commit_preset', function () { btn_commit_plane_preset_Clicked($(this)); });
  $('#modal_plane_preset').on('click', '.btn_delete_preset', function () { btn_delete_plane_preset_Clicked($(this)); });
  $('#modal_plane_preset').on('click', '.btn_expand_preset', btn_expand_plane_preset_Clicked);
  $('#modal_ship_select').on('change', '#ship_type_select', function () { createShipTable([castInt($(this).val())]); });
  $('#modal_ship_select').on('click', '.ship', function () { modal_ship_Selected($(this)); });
  $('#modal_ship_select').on('click', '.btn_remove', function () { modal_ship_select_btn_remove_Clicked($(this)); });
  $('#modal_ship_select').on('click', '#display_final', () => { createShipTable([castInt($('#ship_type_select').val())]); });
  $('#modal_ship_select').on('input', '#ship_word', ship_word_TextChanged);
  $('#modal_enemy_select').on('click', '.modal-body .enemy', function () { modal_enemy_Selected($(this)); });
  $('#modal_enemy_select').on('click', '.btn_remove', function () { modal_enemy_select_btn_remove($(this)); });
  $('#modal_enemy_select').on('change', '#enemy_type_select', function () { createEnemyTable([castInt($(this).val())]); });
  $('#modal_enemy_select').on('input', '#enemy_word', enemy_word_TextChanged);
  $('#modal_enemy_pattern').on('click', '.node_tr', function () { node_tr_Clicked($(this)); });
  $('#modal_enemy_pattern').on('change', '#map_select', createNodeSelect);
  $('#modal_enemy_pattern').on('change', '#node_select', createEnemyPattern);
  $('#modal_enemy_pattern').on('change', '#select_difficulty', createNodeSelect);
  $('#modal_enemy_pattern').on('click', '#btn_expand_enemies', btn_expand_enemies);
  $('#modal_enemy_pattern').on('click', '.node', function () { node_Clicked($(this)) });
  $('#modal_enemy_pattern').on('click', '#enemy_pattern_select .nav-item', function () { pattern_Changed($(this)) });
  $('#modal_enemy_pattern').on('click', 'input[name="enemy_display_mode"]', function () { enemy_display_mode_Changed($(this)) });
  $('#modal_main_preset').on('click', '.preset_tr', function () { main_preset_tr_Clicked($(this)); });
  $('#modal_main_preset').on('click', '.btn_commit_preset', btn_commit_main_preset_Clicked);
  $('#modal_main_preset').on('click', '.btn_commit_preset_header', btn_commit_preset_header_Clicked);
  $('#modal_main_preset').on('click', '.btn_delete_preset', btn_delete_main_preset_Clicked);
  $('#modal_main_preset').on('click', '.btn_load_deck', btn_load_deck_Clicked);
  $('#modal_main_preset').on('input', '#preset_remarks', function () { preset_remarks_Changed($(this)); });
  $('#modal_main_preset').on('input', '#input_deck', function () { input_deck_Changed($(this)); });
  $('#modal_main_preset').on('focus', '#input_deck', function () { $(this).select(); });
  $('#modal_main_preset').on('click', '.btn_output_url', btn_output_url_Clicked);
  $('#modal_main_preset').on('click', '.btn_output_deck', btn_output_deck_Clicked);
  $('#modal_main_preset').on('focus', '#output_url', function () { $(this).select(); });
  $('#modal_main_preset').on('focus', '#output_deck', function () { $(this).select(); });
  $('#modal_main_preset').on('input', '#output_url', function () { output_data_Changed($(this)); });
  $('#modal_main_preset').on('input', '#output_deck', function () { output_data_Changed($(this)); });
  $('#modal_main_preset').on('click', '#output_url', function () { output_data_Clicked($(this)); });
  $('#modal_main_preset').on('click', '#output_deck', function () { output_data_Clicked($(this)); });
  $('#modal_main_preset').on('click', '.btn_expand_preset', btn_expand_main_preset_Clicked);
  $('#modal_auto_expand').on('click', '#btn_start_auto_expand', btn_start_auto_expand_Clicked);
  $('#modal_auto_expand').on('click', '#expand_target .custom-control-input', expand_target_Clicked);
  $('#modal_auto_expand').on('click', '#auto_battle_mode .custom-control-input', battle_mode_Clicked);
  $('#modal_auto_expand').on('input', '#simple_enemy_ap', function () { simple_enemy_ap_Changed($(this)); });
  $('#modal_auto_expand').on('input', '#dest_ap', function () { dest_ap_Changed($(this)); });
  $('#modal_auto_expand').on('input', '#dest_range', function () { dest_ap_Changed($(this)); });
  $('#modal_plane_stock').on('input', '.stock_num', function () { stock_Changed($(this)); });
  $('#modal_plane_stock').on('click', '#btn_save_stock', btn_save_stock_Clicked);
  $('#modal_plane_stock').on('click', '#btn_stock_reset', btn_stock_reset_Clicked);
  $('#modal_confirm').on('click', '.btn_ok', modal_confirm_ok_Clicked);
  $('#btn_preset_all').click(btn_preset_all_Clicked);
  $('#btn_auto_expand').click(btn_auto_expand_Clicked);
  $('#btn_twitter').click(btn_twitter_Clicked);
  $('#btn_deckBuilder').click(btn_deckBuilder_Clicked);
  $('#menu-small').click(menu_small_Clicked);
  $('#site_manual').click(site_manual_Clicked);
  $('#result_content').on({
    mouseenter: function () { shoot_down_table_tbody_MouseEnter($(this)); },
    mouseleave: function () { shoot_down_table_tbody_MouseLeave($(this)); }
  }, '#shoot_down_table_tbody td');
  $('#result_content').on({
    mouseenter: function () { progress_area_MouseEnter($(this)); },
    mouseleave: function () { progress_area_MouseLeave($(this)); }
  }, '.progress_area');
  $('#result_content').on({
    mouseenter: function () { rate_table_MouseEnter($(this)); },
    mouseleave: function () { rate_table_MouseLeave($(this)); }
  }, '#rate_table tbody td');
  $('#result_content').on({
    mouseenter: function () { enemy_shoot_down_table_tbody_MouseEnter($(this)); },
    mouseleave: function () { enemy_shoot_down_table_tbody_MouseLeave($(this)); }
  }, '#enemy_shoot_down_tbody td');
  $('.sidebar-sticky a[href^="#"]').click(function () { return sidebar_Clicked($(this)); });
  $('#site_information a[href^="#"]').click(function () { return sidebar_Clicked($(this)); });
  $('#modal_smart_menu a[href^="#"]').click(function () { return smart_menu_modal_link_Clicked($(this)); });

  // 画面サイズ変更
  $(window).resize(function () {
    if (timer !== false) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      if ($('#lb_tab_select').css('display') !== 'none' && !$('#lb_item1').attr('class').includes('tab-pane')) {
        $('.lb_tab').addClass('tab-pane fade');
        $('.lb_tab:first').tab('show');
        $('.baseNo').removeClass('sortable_handle cur_move');
      }
      else if ($('#lb_tab_select').css('display') === 'none' && $('#lb_item1').attr('class').includes('tab-pane')) {
        $('.lb_tab').removeClass('tab-pane fade').show().fadeIn();
        $('.baseNo').addClass('sortable_handle cur_move');
      }
    }, 50);
  });

  /*==================================
      ドラッグ & ドロップ
  ==================================*/
  Sortable.create($('#main_contents')[0], {
    handle: '.trade_enabled',
    animation: 200,
    scroll: true,
  });
  Sortable.create($('#battle_result')[0], {
    handle: '.drag_handle',
    animation: 200,
    scroll: true,
  });
  Sortable.create($('#lb_tab_parent')[0], {
    handle: '.sortable_handle',
    animation: 200,
    onEnd: function () {
      // 第何航空隊か整合性取る
      $('.lb_tab').each((i, e) => {
        $(e).attr('id', 'lb_item' + (i + 1));
        $(e).find('.baseNo').text('第' + (i + 1) + '基地航空隊');
      });
      calculate();
    }
  });
  $('.fleet_tab').each((i, e) => {
    Sortable.create($(e)[0], {
      handle: '.sortable_handle',
      animation: 200,
      scroll: true,
      onEnd: function () {
        // 艦何番目か整合性取る
        $('.ship_tab').each((i, e) => {
          $(e).attr('id', 'shipNo_' + (i + 1));
        });
        calculate();
      }
    });
  });

  $('.lb_plane').draggable({
    delay: 100,
    helper: 'clone',
    handle: '.drag_handle',
    zIndex: 1000,
    start: function (e, ui) {
      $(ui.helper).css('width', 320);
      $(ui.helper).find('.dropdown-menu').remove();
    },
    stop: function () { lb_plane_DragEnd($(this)); }
  });
  $('.lb_plane').droppable({
    accept: ".lb_plane",
    hoverClass: "plane_draggable_hover",
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
    cursorAt: { left: 55 },
    start: function (e, ui) { ship_plane_DragStart(ui); },
    stop: function () { ship_plane_DragEnd($(this)); }
  });
  $('.ship_plane').droppable({
    accept: ".ship_plane_draggable",
    hoverClass: "plane_draggable_hover",
    tolerance: "pointer",
    over: function (e, ui) { ship_plane_DragOver($(this), ui); },
    drop: function (e, ui) { ship_plane_Drop($(this), ui); }
  });
  $('.friendFleet_tab').droppable({
    accept: ".ship_plane_draggable",
    tolerance: "pointer",
    over: function (e, ui) {
      isOut = false;
      ui.helper.stop().animate({ 'opacity': '1.0' }, 100);
    },
    out: function (e, ui) {
      isOut = true;
      ui.helper.stop().animate({ 'opacity': '0.2' }, 100);
    }
  });

  Sortable.create($('#battle_container')[0], {
    handle: '.sortable_handle',
    animation: 150,
    onEnd: function () {
      // 何戦目か整合性取る
      $('.battle_content').each((i, e) => { $(e).find('.battle_no').text(i + 1); });
      calculate();
    }
  });

  $('.battle_content').droppable({
    accept: ".enemy_draggable",
    hoverClass: 'hover_enemy_content',
    tolerance: "pointer",
    drop: function (e, ui) {
      const id = castInt(ui.draggable[0].dataset.enemyid);
      const ap = castInt(ui.draggable.find('.enemy_ap').text());
      setEnemyDiv($(this).find('.enemy_content:last'), id, ap);
    }
  });

  $('#enemyFleet_content').droppable({
    accept: ".enemy_draggable",
    tolerance: "pointer",
    over: function (e, ui) {
      isOut = false;
      ui.helper.stop().animate({ 'opacity': '1.0' }, 100);
    },
    out: function (e, ui) {
      isOut = true;
      ui.helper.stop().animate({ 'opacity': '0.2' }, 100);
    }
  });

  $('.sample_plane').draggable({
    delay: 100,
    scroll: false,
    handle: '.drag_handle',
    zIndex: 1000,
    revert: true,
    cursorAt: { top: 10 }
  });
});
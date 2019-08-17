/*==================================
    グローバルっぽい変数
==================================*/
// 機体選択画面の返却先
let $target = undefined;

// 熟練を最初からMaxにする機体カテゴリ
const levelMaxCate = [1, 4, 5, 7, 8, 102, 103];

// 搭載数が基地で最大4の機体カテゴリ
const reconnaissances = [4, 5, 8, 104];

// ドラッグした要素が範囲外かどうかフラグ
let isOut = false;

// 軽空母のみ
const lightCarrier = enemyData.filter(mainData => mainData[1] == 1);

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

// 防空モード
let isDefenseMode = false;

/*==================================
    デバッグ用
==================================*/
// 処理速度計測用
let startTime = Date.now();

// 敵idリスト
const enmList = [618, 735, /*735*/];

// 基地とりあえず
const lbData = {
  ap: [0, 0, 0],
  status: [0, 0, 0]
}
// 本隊とりあえず
const mainAp = 139;

let calcCount = 0;

/*==================================
    関数
==================================*/
/**
 * 機体カテゴリ選択欄に、配列から選択可能データを生成
 * @param {string} groupName グループ名 (陸上機 とか 艦載機)
 * @param {Array.<number>} 展開する機体カテゴリid
 */
function setPlaneCategory(groupName, array) {
  let addElements = '';
  for (const value of Object.keys(planeCategory)) if (array.indexOf(planeCategory[value]) != -1) addElements += '<option value="' + planeCategory[value] + '">' + value + '</option>';
  $('.planeSelect_select').append('<optgroup label="' + groupName + '" id="' + groupName + '">');
  $('#' + groupName).append(addElements);
}

/**
 * カテゴリコードから艦載機配列を返却
 * @param {string} category
 * @returns {Array.<Object>} 艦載機オブジェクト配列
 */
function getPlanes(category) {
  switch (category) {
    case "0":
      let all = []
        .concat(cbFighters)
        .concat(cbTorpedoBombers)
        .concat(cbDiveBombers)
        .concat(cbReconnaissances)
        .concat(spReconnaissances)
        .concat(spBombers)
        .concat(spFighters)
        .concat(lgFlyingBoats)
        .concat(jetBombers)
        .concat(lbAttackAircrafts)
        .concat(lbInterceptors)
        .concat(lbFighters)
        .concat(lbReconnaissances);
      return all;
    case "1":
      return cbFighters;
    case "2":
      return cbTorpedoBombers;
    case "3":
      return cbDiveBombers;
    case "4":
      return cbReconnaissances;
    case "5":
      return spReconnaissances;
    case "6":
      return spBombers;
    case "7":
      return spFighters;
    case "8":
      return lgFlyingBoats;
    case "9":
      return jetBombers;
    case "101":
      return lbAttackAircrafts;
    case "102":
      return lbInterceptors;
    case "103":
      return lbFighters;
    case "104":
      return lbReconnaissances;
    default:
      return [{}];
  }
}

/**
 * 機体カテゴリコードからcssクラスを返却
 * @param {number} categoryCd
 * @returns {string} cssクラス名
 */
function getPlaneCss(categoryCd) {
  let return_css = "";
  switch (categoryCd) {
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
 * 艦種選択欄に、配列から選択可能データを生成
 * @param {Array.<number>} 展開する艦種ID 配列
 */
function setShipCategory(array) {
  let addElements = '';
  for (const value of Object.keys(shipCategory)) if (array.indexOf(shipCategory[value]) != -1) addElements += '<option value="' + shipCategory[value] + '">' + value + '</option>';
  $('.shipcategory_select').append(addElements);
}

// 引数で渡された lb_plane 要素をクリアする
function clearLbPlaneDiv($div) {
  // 選択状況をリセット
  $div.removeClass(getPlaneCss($div.data('category')));
  $div.removeData();
  $div.attr('id', '');
  $div.find('.lb_plane_img').attr('src', './img/e/undefined.png');
  $div.find('.plane_name_span').text('機体を選択');
  $div.find('select').val('0').change();
}

/**
 * 第1引数で渡された lb_plane に第2引数で渡された 機体データ入り要素のデータを挿入する
 * @param {JqueryDomObject} $div
 * @param {JqueryDomObject} $original
 */
function setLbPlaneDiv($div, $original) {

  const category = $original.data('category');
  $div
    // デザイン
    .removeClass(getPlaneCss($div.data('category')))
    .addClass(getPlaneCss(category))
    // 機体データ取得
    .attr('id', $original.attr('id'))
    .data('name', $original.data('name'))
    .data('aa', $original.data('aa'))
    .data('range', $original.data('dist'))
    .data('category', category)
    .data('geigeki', $original.data('geigeki'))
    .data('taibaku', $original.data('taibaku'));

  $div.find('.plane_name_span').text($original.data('name'));
  $div.find('.lb_plane_img').attr('src', './img/e/category' + category + '.png');

  // 改修の有効無効設定
  let $remodelInput = $div.find('.remodel_select');
  $remodelInput.prop('disabled', !$original.data('remodel'));
  if ($remodelInput.prop('disabled')) $remodelInput.val('0');

  // 熟練度初期値 戦闘機系は最初から熟練Maxで
  if ($.inArray(category, levelMaxCate) != -1) $div.find('.prof__select').val('7').change();
  else $div.find('.prof__select').val('0').change();

  // 搭載数初期値 偵察機系は4
  if ($.inArray(category, reconnaissances) != -1) $div.find('.slot').val('4').change();
  else $div.find('.slot').val('18').change();

  // お札が待機になってるなら集中に変更
  const $lb_ope = $div.parents('.lb_tab_main').prev();
  if ($lb_ope.find('.active span').text() == '待機') {
    $lb_ope.find('label').removeClass('active');
    $lb_ope.find('.multiAttack').addClass('active');
  }
}

/**
 * 第1引数で渡された ship_tab に第2引数で渡された 艦娘データを挿入する
 * @param {JqueryDomObject} $div
 * @param {JqueryDomObject} $original
 */
function setShipDiv($div, $original) {

}

/**
 * 変更前の値と変更後の値に応じて、色を変えつつ値を変更する
 * @param {JqueryDomObject} $inline
 * @param {number} pre 変更前の値
 * @param {number} cur 変更後の値
 */
function drawChangeValue($inline, pre, cur) {
  if (pre != cur) {
    $inline
      .text(cur)
      .stop()
      .css('color', cur > pre ? '#0c5' : cur < pre ? '#f00' : '#000')
      .delay(500)
      .animate({ 'color': '#000' }, 1000);
  }
}

/**
 * 引数で渡された table 要素(要 tbody )に plans 配列から値を展開
 * @param {JqueryDomObject} $table
 * @param {Array.<Object>} planes
 */
function createPlaneTable($table, planes) {
  const $tbody = $table.find('tbody');
  let insertHtml = '';

  for (const plane of planes) {
    insertHtml += `
    <tr class="border-bottom plane" id="` + plane.id + `" data-name="` + plane.name + `" data-aa="` + plane.AA + `" data-dist="` + plane.dist + `" data-category="` + plane.category + `" data-remodel="` + plane.remodel + `" data-geigeki="` + plane.geigeki + `" data-taibaku="` + plane.taibaku + `">
        <td width="8%"><img src="./img/e/category`+ plane.category + `.png" class="img-size-25" alt="` + plane.category + `"></td>
        <td width="62%">`+ plane.name + `</td>
        <td class="text-center" width="15%">`+ plane.AA + `</td>
        <td class="text-center" width="15%">`+ plane.dist + `</td>
    </tr>
    `;
  }

  $tbody.html(insertHtml);

  // 機体選択モーダル内のボタン非活性
  $('#planeSelectModal_btnCommitPlane').prop('disabled', true);
  $('#planeSelectModal_btnRemovePlane').prop('disabled', true);
}

/**
 * 引数で渡された table 要素(要 tbody )に ships 配列から値を展開
 * @param {JqueryDomObject} $table
 * @param {Array.<number>} category
 */
function createShipTable($table, category) {
  const $tbody = $table.find('tbody');
  let insertHtml = '';

  for (const ship of shipData) {

    // 艦種絞り込み
    if (category[0] != 0 && category.indexOf(ship.category) == -1) continue;
    if ($('#dispFinalOnly').prop('checked') && !ship.final) continue;

    let slotText = '';
    for (let index = 0; index < 5; index++) slotText += '<td class="text-center td_slot' + index + '" width="10%">' + (index < ship.slot.length ? ship.slot[index] : '') + '</td>';

    insertHtml += `
    <tr class="border-bottom ship" id="` + ship.id + `" data-name="` + ship.name + `" data-final="` + ship.final + `" data-category="` + ship.category + `">
        <td width="50%">` + ship.name + `</td>`
      + slotText + `
    </tr>`;
  }
  $tbody.html(insertHtml);

  // 艦隊選択モーダル内のボタン非活性
  $('#shipSelectModal_btnCommitPlane').prop('disabled', true);
  $('#shipSelectModal_btnRemovePlane').prop('disabled', true);
}

// 画面初期化用メソッド
function initAll(callback) {

  // 競合回避
  $.widget.bridge('uibutton', $.ui.button);
  $.widget.bridge('uitooltip', $.ui.tooltip);

  // 艦娘データソート -艦種
  shipData.sort((a, b) => { return a.category < b.category ? -1 : a.category > b.category ? 1 : 0; });

  // 機体カテゴリ初期化
  $('.planeSelect_select').empty();
  $('.planeSelect_select').append('<option value="0">全て</option>');
  setPlaneCategory('艦載機', [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  setPlaneCategory('陸上機', [101, 102, 103, 104]);

  // 艦種初期化
  $('.shipcategory_select').empty();
  $('.shipcategory_select').append('<option value="0">全て</option>');
  setShipCategory([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])

  // 全データ展開
  createPlaneTable($('.plane_table'), getPlanes('0'));
  createShipTable($('.ship_table'), [0]);

  // 改修値選択欄生成
  let text = '';
  for (let i = 0; i <= 10; i++) {
    if (i == 0) text += '<option class="remodel__option" value="0" selected></option>';
    else if (i == 10) text += '<option class="remodel__option" value="10">max</option>';
    else text += '<option class="remodel__option" value="' + i + '">' + i + '</option>';
  }
  $('.remodel_select').append(text);

  // 熟練度選択欄生成
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
  $('.prof__select').append(text);

  // 基地航空隊 第1基地航空隊操作盤複製
  $('.lb_ope').html($('#lb_item1').find('.lb_ope').html());
  // 基地航空隊 第1基地航空隊第1中隊複製
  $('.lb_plane').html($('#lb_item1').find('.lb_plane:first').html());

  // 艦娘　操作盤複製
  $('.ship_ope').html($('#ship_item1').find('.ship_ope').html());
  // 艦娘 機体欄複製
  $('.ship_plane').html($('#ship_item1').find('.ship_plane:first').html());


  callback();
}

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
 * 引数の id から敵オブジェクトを生成
 * @param {number} id 敵ID
 * @returns {Object} 敵オブジェクト
 */
function createEnemyObject(id) {
  const mainData = enemyData.filter(x => x[0] == id)[0];
  const enemy =
  {
    id: mainData[0],
    cate: mainData[1],
    name: mainData[2],
    aa: mainData[3].concat(),
    slots: mainData[4].concat(),
    orgSlots: mainData[4].concat(),
    e_cate: mainData[5],
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
    enemy.slots.forEach(function (slot, i) {
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
  enemy.aa.forEach(function (aa, i) {
    if (enemy.e_cate[i] == 0) {
      enemy.ap += Math.floor(aa * Math.sqrt(enemy.slots[i]));
    }
    else if (enemy.e_cate[i] == 1) {
      enemy.lbAp += Math.floor(aa * Math.sqrt(enemy.slots[i]));
    }
    else { }
  });
  enemy.lbAp += enemy.ap;
}

/*=================
    チャート関連
=================*/
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
  const mainData = data.friend.map(function (ap, i) { return ap / divBase[i] * 100; });
  const phaseList = isDefenseMode ? ['防空'] : ['基地1 第1波', '基地1 第2波', '基地2 第1波', '基地2 第2波', '基地3 第1波', '基地3 第2波', '', '本隊'];
  const svgPadding = { left: 80, right: 20, bottom: 30, top: 20 };
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
        .tickFormat((d, i) => { return airStatus[i].abbr; })
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
  const tooltip = d3.select("body").append("div").attr("class", "tooltip_resultBar px-3");

  // 各種バー描画
  svg.selectAll('svg')
    .data(mainData)
    .enter()
    .append('rect')
    .attr('x', function (d) { return xScale(0); })
    .attr('y', function (d, i) { return yScale(phaseList[i]); })
    .attr('width', function (d, i) { return xScale(prevData[i] > maxRange ? maxRange : prevData[i]) - xScale(0); })
    .attr('height', barWidth)
    .style('fill', function (d, i) { return backColor[getAirStatusIndex(data.friend[i], data.enemy[i])]; })
    .style('stroke', function (d, i) { return borderColor[getAirStatusIndex(data.friend[i], data.enemy[i])]; })
    .on('mouseover', function (d, i) {
      d3.select(this)
        .attr('style', 'fill:' + getBarColor(0.8)[getAirStatusIndex(data.friend[i], data.enemy[i])])
        .style('stroke', function () { return borderColor[getAirStatusIndex(data.friend[i], data.enemy[i])]; });

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
      airStatus.forEach(function (val, index) {
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
        .style('stroke', function () { return borderColor[getAirStatusIndex(data.friend[i], data.enemy[i])]; });
      tooltip.style("visibility", "hidden");
    })
    .transition()
    .ease(d3.easePolyOut)
    .duration(800)
    .attr('width', function (d) { return (d > maxRange ? xScale(maxRange) : xScale(d)) - xScale(0); });

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
    計算
==================================*/

/**
 * 計算
 */
function caluclate() {
  startTime = Date.now();

  // 基地情報更新
  let st = Date.now();
  updateLandBaseInfo();
  console.log('updateLandBaseInfo end : ' + (Date.now() - st) + ' msec.');

  // 艦隊情報更新


  // 敵艦情報更新


  // メイン計算
  startCaluclate();

  // 結果表示
  st = Date.now();
  drawResultBar(chartData);
  console.log('drawResultBar end : ' + (Date.now() - st) + ' msec.');

  console.log('caluclate end : ' + (Date.now() - startTime) + ' msec.');
}


/**
 * 基地航空隊 中隊オブジェクト生成
 * @param {JqueryDomObject} $lb_plane 生成元 lb_plane
 * @param {number} index 第何中隊
 * @returns 生成物
 */
function createLBPlaneObject($lb_plane, index) {
  return lbPlane = {
    baseNo: $lb_plane.parents('.lb_tab').attr('id').slice(-1) - 1,
    num: index % 4,
    category: $lb_plane.data('category') ? $lb_plane.data('category') : 0,
    ap: getAirPower($lb_plane),
    range: $lb_plane.data('range') ? $lb_plane.data('range') : 999
  }
}

/**
 * 基地航空隊入力情報更新
 * 値の表示と制空値、半径計算も行う
 */
function updateLandBaseInfo() {
  // 出撃 or 防空
  $('.lb_ope').each(function () {
    const lbNo = $(this).parent().attr('id').slice(-1) - 1;
    const ope = $(this).find('.active').text().trim();
    switch (ope) {
      case '集中':
        lbData.status[lbNo] = 2;
        break;
      case '単発':
        lbData.status[lbNo] = 1;
        break;
      default:
        lbData.status[lbNo] = 0;
        break;
    }
  });

  const tmpLbPlanes = [];
  lbList.length = 0;

  // 基地航空隊 各種制空値表示
  $('.lb_plane').each(function (index) {

    // 基地航空機オブジェクト生成
    const lbObject = createLBPlaneObject($(this), index);

    // 格納
    tmpLbPlanes.push(lbObject);
    if (index % 4 == 3) {
      lbList.push(tmpLbPlanes.concat());
      tmpLbPlanes.length = 0;
    }

    // 個別制空値表示
    const no = index % 4;
    const $target_td = $('#lb_info_table_row' + (lbObject.baseNo + 1) + '_col' + (no + 1));
    const prevAp = Number($target_td.text());

    // 制空値　第1航空隊が来たら代入、他は加算
    lbData.ap[lbObject.baseNo] = no == 0 ? lbObject.ap : lbData.ap[lbObject.baseNo] + lbObject.ap;

    // 各種制空値反映
    drawChangeValue($target_td, prevAp, lbObject.ap);
  });

  // 各隊総制空値、半径の表示
  for (let i = 0; i < lbData.ap.length; i++) {
    // 総制空値
    let $target_td = $('#lb_info_table_row' + (i + 1) + '_col5');
    drawChangeValue($target_td, Number($target_td.text()), lbData.ap[i]);

    // 半径
    $target_td = $('#lb_info_table_row' + (i + 1) + '_col6');
    const range = getRange(i);
    drawChangeValue($target_td, Number($target_td.text()), range);
  }
}

/**
 * 制空値を返す -基地航空隊
 * @param {JqueryDomObject} $lb_plane
 * @returns 引数の lb_plane オブジェクトの持つ制空値
 */
function getAirPower($lb_plane) {
  if (!$lb_plane.attr('id')) return 0;
  const category = $lb_plane.data('category');
  const taiku = $lb_plane.data('aa');
  const taibaku = $lb_plane.data('taibaku');
  const geigeki = $lb_plane.data('geigeki');
  const remodel = $lb_plane.find('.remodel_select').val();
  const level = Number($lb_plane.find('.prof__select').val());
  const slot = Number($lb_plane.find('.slot').val());

  let sumPower = 0.0;

  // 艦戦 夜戦 水戦 陸戦 局戦
  if ([1, -1, 7, 102, 103].indexOf(category) != -1) {
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
  else if ([6].indexOf(category) != -1) {
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
  else if ([3].indexOf(category) != -1) {
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
        sumPower += Math.sqrt(($('#prof120_' + Math.abs(category)).prop('checked') ? 120 : 100) / 10);
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
    if ([4, 5, 8, 104].indexOf(lbObject.category) != -1) {
      console.log(lbObject);
      longestTeisatu = longestTeisatu < lbObject.range ? lbObject.range : longestTeisatu;
    }
  }

  if (longestTeisatu < 999 && longestTeisatu > shortestRange) return Math.round(shortestRange + Math.min(Math.sqrt(longestTeisatu - shortestRange), 3));
  else return shortestRange == 999 ? 0 : shortestRange;
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
  let st = Date.now();
  initCaluclate(true);
  let eap = 0;

  if (isDefenseMode) {
    let sumAP = 0;
    for (const ap of lbData.ap) sumAP += ap;
    chartData.friend.push(sumAP);
    chartData.enemy.push(getEnemyFleetAirPower(enemyFleet));

    console.log('startCaluclate end : ' + (Date.now() - st) + ' msec.');
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

    console.log('startCaluclate end : ' + (Date.now() - st) + ' msec.');

    st = Date.now();
    // 各状態確率計算
    chartData.rate = rateCaluclate();
    console.log('rateCaluclate end : ' + (Date.now() - st) + ' msec.');

  }
}

/**
 * 各種制空状態確率計算
 */
function rateCaluclate() {
  let st = Date.now();
  const maxCount = 5000;
  const dist = [{}, {}, {}, {}, {}, {}, {}, {}];
  dist.forEach(function (object) {
    airStatus.forEach(function (value) { object[value.abbr] = 0 });
  });

  initCaluclate(false);
  for (let count = 0; count < maxCount; count++) {
    // 敵機補給
    for (const enemy of enemyFleet) {
      enemy.slots = enemy.orgSlots.concat();
      updateEnemyAp(enemy);
    }

    for (let j = 0; j < 3; j++) {
      let lbAp = lbData.ap[j];
      if (lbData.status[j] > 0) {
        // 第一波
        dist[j * 2][airStatus[getAirStatusIndex(lbAp, getEnemyFleetLandBaseAirPower(enemyFleet))].abbr]++;
        ShootDown(enemyFleet, lbAp);
      }

      if (lbData.status[j] == 2) {
        // 第二波
        dist[j * 2 + 1][airStatus[getAirStatusIndex(lbAp, getEnemyFleetLandBaseAirPower(enemyFleet))].abbr]++;
        ShootDown(enemyFleet, lbAp);
      }
    }

    // 本隊
    dist[7][airStatus[getAirStatusIndex(mainAp, getEnemyFleetAirPower(enemyFleet))].abbr]++;
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
$(function () {
  // 画面初期化
  initAll(function () {
    // 終わったらLoading画面お片付け
    $('#loadingSpinner').remove();
    $('#main').removeClass('d-none');

    // グラフエリア初期化
    startCaluclate();
    drawResultBar(chartData);

  });


  $('[data-toggle="tooltip"]').tooltip();

  // イベント貼り付けなど
  // 出撃系札
  $(document).on('click', '.lb_ope_basic', function () {
    isDefenseMode = false;
    $('.btnDefLB').removeClass('active');
    caluclate();
  });
  // 防空札
  $(document).on('click', '.btnDefLB', function () {
    isDefenseMode = true;
    $('.lb_ope_basic label').removeClass('active');
    $('.btnDefLB').addClass('active');
    caluclate();
    $(this).blur();
  });
  // 基地航空隊リセットボタン
  $(document).on('click', '.btnResetLB', function () {
    $(this).parents('.lb_tab').find('.lb_plane').each(function () { clearLbPlaneDiv($(this)); });
    $(this).blur();
    caluclate();
  });
  $(document).on('input', '.plane input.slot', function () {
    const value = $(this).val();
    if ($(this).val() < 0 || $(this).val() > 9999) $(this).val(value.slice(0, -1))
    else caluclate();
  });
  $(document).on('click', '.lb_plane select', caluclate);
  $('#setting_content .custom-checkbox').click(caluclate);

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
    revert: 100,
    helper: 'clone',
    handle: '.content_title',
    start: function (e, ui) {
      $(ui.helper).removeClass('border-bottom');
    },
    stop: function (e, ui) {
      const org = [];
      const $parent = $('#li_index');
      $parent.find('li').each(function () { org.push($(this).clone()) });
      $parent.empty();
      $('#main_contents > div').each(function () {
        for (const $target of org) {
          if ($target.attr('id') == 'li_' + $(this).attr('id')) {
            $parent.append($target);
            continue;
          }
        }
      });
    }
  });

  // 基地入れ替え設定
  $('div.lb_tab_main').sortable({
    delay: 100,
    scroll: false,
    placeholder: "lb_plane-drag",
    forcePlaceholderSize: true,
    tolerance: "pointer",
    handle: 'img',
    stop: function (event, ui) {
      if (isOut) {
        // 選択状況をリセット
        clearLbPlaneDiv(ui.item);
        $(this).sortable('cancel');
        ui.item.css('opacity', '0.0');
      }
      ui.item.animate({ 'opacity': '1.0' }, 500);

      caluclate();
    }
  });
  // 範囲外に機体を持って行ったときを拾う
  $('div#lb_content_main').droppable({
    accept: ".lb_plane",
    tolerance: "pointer",
    over: function (event, ui) {
      ui.draggable.animate({ 'opacity': '1.0' }, 100);
      isOut = false;
    },
    out: function (event, ui) {
      ui.draggable.animate({ 'opacity': '0.2' }, 100);
      isOut = true;
    }
  });
  // 機体をドラッグしてきた時の処理
  $('div.lb_plane').droppable({
    accept: ".plane",
    hoverClass: "lb_plane-hover",
    tolerance: "pointer",
    drop: function (event, ui) {
      setLbPlaneDiv($(this), ui.draggable);
      caluclate();
    }
  });

  // 基地航空隊　熟練度を選択時
  $('.prof__select').on('change', function () {
    const prof = $(this).val();
    if (prof >= 4) {
      $(this).addClass('prof__yellow').removeClass('prof__blue');
    }
    else if (prof > 0) {
      $(this).addClass('prof__blue').removeClass('prof__yellow');
    }
    else {
      $(this).removeClass('prof__blue').removeClass('prof__yellow');
    }
  });

  // 機体カテゴリ変更時 応じた機体を table に展開
  $(document).on('change', '.planeSelect_select', function () {
    createPlaneTable($(this).parent().next().find('.plane_table'), getPlanes($(this).val()));
  });

  // 機体テーブル ヘッダクリック列でソート
  $(document).on('click', '.plane_table_ td', function () {
    const $parent = $(this).parents('.plane_table_content');
    const sortKey = $(this).attr('id');
    const selectedCategory = $parent.prev().find('.planeSelect_select').val();
    const org = getPlanes(selectedCategory).concat();
    const order = $(this).data('order');
    const nextOrder = order == 'asc' ? 'desc' : 'asc';

    switch (sortKey) {
      case 'th_name':
        if (order == 'desc') org.sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
        else org.sort((a, b) => { return -(a.name < b.name ? -1 : a.name > b.name ? 1 : 0); });
        break;
      case 'th_aa':
        if (order == 'desc') org.sort((a, b) => { return a.AA - b.AA; });
        else org.sort((a, b) => { return b.AA - a.AA; });
        break;
      case 'th_range':
        if (order == 'desc') org.sort((a, b) => { return a.dist - b.dist; });
        else org.sort((a, b) => { return b.dist - a.dist; });
        break;
      default:
        // 通常出力(ソート解除)
        break;
    }

    createPlaneTable($parent.find('.plane_table'), org);

    $('.plane_table_ td').removeClass('sorted')

    // 順序反転
    $(this).parent().find('td').removeData().removeClass('asc desc');

    if (sortKey == 'th_default') return;

    $(this).data('order', nextOrder);
    $(this).addClass('sorted ' + nextOrder);
  });

  // ホバーされたものだけdraggeble設定追加
  $(document).on({
    'mouseenter': function () {
      if ($(this).attr('class').indexOf('ui-draggable-handle') == -1) {
        $(this).draggable({
          scroll: false,
          helper: 'clone',
          distance: 10,
          start: function (e, ui) {
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
    // 機体選択画面の結果を返却するターゲットのdiv要素を取得
    $target = $(this).closest('.lb_plane');
    const selectedID = $target.attr('id');
    const selectedCategory = Math.abs($target.data('category'));
    const $modalBody = $('#planeSelectModal .modal-body');

    // モーダル生成処理
    $modalBody.html($('#planeSelect__content').html());

    // カテゴリ初期選択処理
    if (selectedCategory) {
      $modalBody.find('.planeSelect_select').val(selectedCategory).change();
    }
    else {
      $modalBody.find('.planeSelect_select').val($('.card-body .planeSelect_select').val()).change();
    }

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
    $('.modal-body .plane').removeClass('plane-selected');
    $(this).addClass('plane-selected');
    // OKボタン活性化
    $('#planeSelectModal_btnCommitPlane').prop('disabled', false);
  });

  // 機体選択画面(モーダル)　機体をダブルクリック時
  $('#planeSelectModal').on('dblclick', '.modal-body .plane', function () {
    // 機体セット
    setLbPlaneDiv($target, $('.plane-selected'));
    $('#planeSelectModal').modal('hide');
  });

  // OKボタンクリック(機体選択モーダル内)
  $('#planeSelectModal_btnCommitPlane').on('click', function () {
    if ($(this).prop('disabled')) return false;

    if (!$('.plane-selected').attr('class')) {
      $('#planeSelectModal_btnCommitPlane').prop('disabled', true);
      return false;
    }

    // 機体セット
    setLbPlaneDiv($target, $('.plane-selected'));

    $('#planeSelectModal').modal('hide');
    caluclate();
  });

  // はずすボタンクリック(機体選択モーダル内)
  $('#planeSelectModal_btnRemovePlane').on('click', function () {
    if ($(this).prop('disabled')) return false;

    // 選択状況をリセット
    clearLbPlaneDiv($target);

    $('#planeSelectModal').modal('hide');
    caluclate();
  });

  // 艦娘選択モーダル展開
  $(document).on('click', '.ship_name_span', function () {
    $target = $(this).closest('.ship_tab');
    $('#shipSelectModal').modal('show');
  });

  // 艦種変更時 応じた艦娘を table に展開
  $('#shipSelectModal').on('change', '.shipcategory_select', function () {
    createShipTable($('.ship_table'), [Number($(this).val())]);
  });

  // 艦娘選択画面(モーダル)　艦娘をクリック時
  $('#shipSelectModal').on('click', '.modal-body .ship', function () {
    $('.modal-body .ship').removeClass('ship-selected');
    $(this).addClass('ship-selected');
    // OKボタン活性化
    $('#shipSelectModal_btnCommitPlane').prop('disabled', false);
  });

  $('#dispFinalOnly').click(function () { createShipTable($('.ship_table'), [Number($('.shipcategory_select').val())]); })

  // OKボタンクリック(艦娘選択モーダル内)
  $('#shipSelectModal_btnCommitPlane').on('click', function () {
    if ($(this).prop('disabled')) return false;

    if (!$('.ship-selected').attr('class')) {
      $('#shipSelectModal_btnCommitPlane').prop('disabled', true);
      return false;
    }

    // 機体セット
    setShipDiv($target, $('.ship-selected'));

    $('#shipSelectModal').modal('hide');
    caluclate();
  });

  // スマホメニュー展開
  $('#menu-small').click(function () {
    $('#smartMenuModal .modal-body').html($('#Navbar').html());
    $('#smartMenuModal .mt-5').removeClass('mt-5').addClass('mt-3');
    $('#smartMenuModal').modal('show');
  });
  // スマホメニューから移動
  $(document).on('click', '#smartMenuModal a[href^="#"]', function () {
    const speed = 300;
    const href = $(this).attr("href");
    const target = $(href == "#" || href == "" ? 'html' : href);
    const position = target.offset().top - 60;
    $('body,html').animate({ scrollTop: position }, speed, 'swing');
    setTimeout(function () { $('#smartMenuModal').modal('hide'); }, 220);
    return false;
  })
});
/* 機体選択画面の返却先 */
var $target = undefined;

/* 熟練を最初からMaxにする機体カテゴリ */
var levelMaxCate = [1, 4, 5, 7, 8, 102, 103];

/* 搭載数が基地で最大4の機体カテゴリ */
var reconnaissances = [4, 5, 8, 104];

/* ドラッグした要素が範囲外かどうかフラグ */
var isOut = false;

/* 艦上機カテゴリ */
var cbPlaneCate = [
    { val: 1, name: "艦上戦闘機" },
    { val: 2, name: "艦上攻撃機" },
    { val: 3, name: "艦上爆撃機" },
    { val: 4, name: "艦上偵察機" },
    { val: 5, name: "水上偵察機" },
    { val: 6, name: "水上爆撃機" },
    { val: 7, name: "水上戦闘機" },
    { val: 8, name: "大型飛行艇" },
    { val: 9, name: "噴式爆撃機" }
];

/* 基地用機カテゴリ */
var lbPlaneCate = [
    { val: 101, name: "陸上攻撃機" },
    { val: 102, name: "陸軍戦闘機" },
    { val: 103, name: "局地戦闘機" },
    { val: 104, name: "陸上偵察機" }
];

/* 艦上戦闘機 : 1 */
var cbFighters = [
    { id: 19, category: 1, name: "九六式艦戦", AA: 2, dist: 3, remodel: true },
    { id: 20, category: 1, name: "零式艦戦21型", AA: 5, dist: 7, remodel: true },
    { id: 21, category: 1, name: "零式艦戦52型", AA: 6, dist: 6, remodel: true },
    { id: 22, category: 1, name: "試製烈風 後期型", AA: 10, dist: 5, remodel: false },
    { id: 53, category: 1, name: "烈風一一型", AA: 12, dist: 5, remodel: false },
    { id: 55, category: 1, name: "紫電改二", AA: 9, dist: 3, remodel: false },
    { id: 56, category: 1, name: "震電改", AA: 15, dist: 2, remodel: false },
    { id: 96, category: 1, name: "零式艦戦21型(熟練)", AA: 8, dist: 7, remodel: true },
    { id: 109, category: 1, name: "零式艦戦52型丙(六〇一空)", AA: 9, dist: 6, remodel: true },
    { id: 110, category: 1, name: "烈風(六〇一空)", AA: 11, dist: 5, remodel: true },
    { id: 152, category: 1, name: "零式艦戦52型(熟練)", AA: 9, dist: 6, remodel: true },
    { id: 153, category: 1, name: "零式艦戦52型丙(付岩井小隊)", AA: 10, dist: 6, remodel: true },
    { id: 155, category: 1, name: "零式艦戦21型(付岩本小隊)", AA: 9, dist: 7, remodel: false },
    { id: 156, category: 1, name: "零式艦戦52型甲(付岩本小隊)", AA: 11, dist: 6, remodel: true },
    { id: 157, category: 1, name: "零式艦戦53型(岩本隊)", AA: 12, dist: 6, remodel: true },
    { id: 158, category: 1, name: "Bf109T改", AA: 8, dist: 2, remodel: false },
    { id: 159, category: 1, name: "Fw190T改", AA: 10, dist: 3, remodel: false },
    { id: 181, category: 1, name: "零式艦戦32型", AA: 5, dist: 5, remodel: true },
    { id: 182, category: 1, name: "零式艦戦32型(熟練)", AA: 8, dist: 5, remodel: true },
    { id: 184, category: 1, name: "Re.2001 OR改", AA: 6, dist: 4, remodel: true },
    { id: 189, category: 1, name: "Re.2005 改", AA: 11, dist: 3, remodel: false },
    { id: 197, category: 1, name: "F4F-3", AA: 4, dist: 4, remodel: true },
    { id: 198, category: 1, name: "F4F-4", AA: 5, dist: 4, remodel: true },
    { id: 205, category: 1, name: "F6F-3", AA: 8, dist: 5, remodel: true },
    { id: 206, category: 1, name: "F6F-5", AA: 10, dist: 5, remodel: true },
    { id: 228, category: 1, name: "九六式艦戦改", AA: 4, dist: 4, remodel: false },
    { id: 249, category: 1, name: "Fulmar", AA: 3, dist: 4, remodel: false },
    { id: 252, category: 1, name: "Seafire Mk.III改", AA: 9, dist: 4, remodel: false },
    { id: 254, category: 1, name: "F6F-3N", AA: 8, dist: 5, remodel: false },
    { id: 255, category: 1, name: "F6F-5N", AA: 10, dist: 5, remodel: false },
    { id: 271, category: 1, name: "紫電改四", AA: 10, dist: 4, remodel: false },
    { id: 335, category: 1, name: "烈風改(試製艦載型)", AA: 10, dist: 5, remodel: false },
    { id: 336, category: 1, name: "烈風改二", AA: 13, dist: 5, remodel: false },
    { id: 338, category: 1, name: "烈風改二戊型", AA: 11, dist: 5, remodel: false },
    { id: 339, category: 1, name: "烈風改二戊型(一航戦/熟練)", AA: 12, dist: 6, remodel: false }
];

/* 艦上攻撃機 : 2 */
var cbTorpedoBombers = [
    { id: 16, category: 2, name: "九七式艦攻", AA: 0, dist: 4, remodel: true },
    { id: 17, category: 2, name: "天山", AA: 0, dist: 5, remodel: true },
    { id: 18, category: 2, name: "流星", AA: 0, dist: 6, remodel: false },
    { id: 52, category: 2, name: "流星改", AA: 0, dist: 6, remodel: false },
    { id: 82, category: 2, name: "九七式艦攻(九三一空)", AA: 0, dist: 4, remodel: true },
    { id: 83, category: 2, name: "天山(九三一空)", AA: 0, dist: 5, remodel: false },
    { id: 93, category: 2, name: "九七式艦攻(友永隊)", AA: 1, dist: 4, remodel: false },
    { id: 94, category: 2, name: "天山一二型(友永隊)", AA: 1, dist: 5, remodel: false },
    { id: 98, category: 2, name: "九七式艦攻(熟練)", AA: 0, dist: 4, remodel: false },
    { id: 112, category: 2, name: "天山(六〇一空)", AA: 0, dist: 5, remodel: false },
    { id: 113, category: 2, name: "流星(六〇一空)", AA: 0, dist: 6, remodel: false },
    { id: 143, category: 2, name: "九七式艦攻(村田隊)", AA: 1, dist: 4, remodel: false },
    { id: 144, category: 2, name: "天山(村田隊)", AA: 1, dist: 5, remodel: false },
    { id: 188, category: 2, name: "Re.2001 G改", AA: 4, dist: 3, remodel: false },
    { id: 196, category: 2, name: "TBD", AA: 0, dist: 4, remodel: false },
    { id: 242, category: 2, name: "Swordfish", AA: 0, dist: 3, remodel: false },
    { id: 243, category: 2, name: "Swordfish Mk.II(熟練)", AA: 0, dist: 3, remodel: false },
    { id: 244, category: 2, name: "Swordfish Mk.III(熟練)", AA: 0, dist: 3, remodel: false },
    { id: 256, category: 2, name: "TBF", AA: 1, dist: 6, remodel: false },
    { id: 257, category: 2, name: "TBM-3D", AA: 1, dist: 6, remodel: false },
    { id: 302, category: 2, name: "九七式艦攻(九三一空/熟練)", AA: 0, dist: 4, remodel: false },
    { id: 342, category: 2, name: "流星改(一航戦)", AA: 2, dist: 6, remodel: false },
    { id: 343, category: 2, name: "流星改(一航戦/熟練)", AA: 3, dist: 6, remodel: false },
    { id: 344, category: 2, name: "九七式艦攻改 試製三号戊型(空六号電探改装備機)", AA: 0, dist: 4, remodel: false },
    { id: 345, category: 2, name: "九七式艦攻改(熟練) 試製三号戊型(空六号電探改装備機)", AA: 0, dist: 4, remodel: false }
];

/* 艦上爆撃機 : 3 */
var cbDiveBombers = [
    { id: 23, category: 3, name: "九九式艦爆", AA: 0, dist: 4, remodel: false },
    { id: 24, category: 3, name: "彗星", AA: 0, dist: 4, remodel: false },
    { id: 57, category: 3, name: "彗星一二型甲", AA: 0, dist: 5, remodel: false },
    { id: 60, category: 3, name: "零式艦戦62型(爆戦)", AA: 4, dist: 4, remodel: true },
    { id: 64, category: 3, name: "Ju87C改", AA: 0, dist: 4, remodel: false },
    { id: 97, category: 3, name: "九九式艦爆(熟練)", AA: 1, dist: 4, remodel: false },
    { id: 99, category: 3, name: "九九式艦爆(江草隊)", AA: 0, dist: 4, remodel: false },
    { id: 100, category: 3, name: "彗星(江草隊)", AA: 1, dist: 5, remodel: false },
    { id: 111, category: 3, name: "彗星(六〇一空)", AA: 0, dist: 5, remodel: false },
    { id: 148, category: 3, name: "試製南山", AA: 1, dist: 5, remodel: false },
    { id: 154, category: 3, name: "零式艦戦62型(爆戦/岩井隊)", AA: 7, dist: 5, remodel: true },
    { id: 195, category: 3, name: "SBD", AA: 2, dist: 4, remodel: false },
    { id: 219, category: 3, name: "零式艦戦63型(爆戦)", AA: 5, dist: 4, remodel: true },
    { id: 233, category: 3, name: "F4U-1D", AA: 7, dist: 6, remodel: false },
    { id: 248, category: 3, name: "Skua", AA: 2, dist: 4, remodel: false },
    { id: 277, category: 3, name: "FM-2", AA: 6, dist: 4, remodel: false },
    { id: 291, category: 3, name: "彗星二二型(六三四空)", AA: 1, dist: 5, remodel: false },
    { id: 292, category: 3, name: "彗星二二型(六三四空/熟練)", AA: 2, dist: 6, remodel: false },
    { id: 305, category: 3, name: "Ju87C改二(KMX搭載機)", AA: 0, dist: 4, remodel: false },
    { id: 306, category: 3, name: "Ju87C改二(KMX搭載機/熟練)", AA: 0, dist: 4, remodel: false },
    { id: 316, category: 3, name: "Re.2001 CB改", AA: 4, dist: 3, remodel: false },
    { id: 319, category: 3, name: "彗星一二型(六三四空/三号爆弾搭載機)", AA: 3, dist: 5, remodel: false },
    { id: 320, category: 3, name: "彗星一二型(三一号光電管爆弾搭載機)", AA: 0, dist: 5, remodel: false }
];

/* 艦上偵察機 : 4 */
var cbReconnaissances = [
    { id: 54, category: 4, name: "彩雲", AA: 0, dist: 8, remodel: true },
    { id: 61, category: 4, name: "二式艦上偵察機", AA: 1, dist: 5, remodel: true },
    { id: 151, category: 4, name: "試製景雲(艦偵型)", AA: 0, dist: 8, remodel: true },
    { id: 212, category: 4, name: "彩雲(東カロリン空)", AA: 0, dist: 8, remodel: false },
    { id: 273, category: 4, name: "彩雲(偵四)", AA: 2, dist: 7, remodel: false }
];

/* 水上偵察機 : 5 */
var spReconnaissances = [
    { id: 25, category: 5, name: "零式水上偵察機", AA: 1, dist: 7, remodel: true },
    { id: 59, category: 5, name: "零式水上観測機", AA: 2, dist: 3, remodel: false },
    { id: 102, category: 5, name: "九八式水上偵察機(夜偵)", AA: 0, dist: 6, remodel: false },
    { id: 115, category: 5, name: "Ar196改", AA: 1, dist: 3, remodel: false },
    { id: 118, category: 5, name: "紫雲", AA: 0, dist: 4, remodel: false },
    { id: 163, category: 5, name: "Ro.43水偵", AA: 1, dist: 3, remodel: true },
    { id: 171, category: 5, name: "OS2U", AA: 1, dist: 3, remodel: false },
    { id: 238, category: 5, name: "零式水上偵察機11型乙", AA: 1, dist: 7, remodel: false },
    { id: 239, category: 5, name: "零式水上偵察機11型乙(熟練)", AA: 1, dist: 7, remodel: false },
    { id: 304, category: 5, name: "S9 Osprey", AA: 1, dist: 3, remodel: false }
];

/* 水上爆撃機 : 6 */
var spBombers = [
    { id: 26, category: 6, name: "瑞雲", AA: 2, dist: 5, remodel: true },
    { id: 62, category: 6, name: "試製晴嵐", AA: 0, dist: 4, remodel: false },
    { id: 79, category: 6, name: "瑞雲(六三四空)", AA: 2, dist: 5, remodel: true },
    { id: 80, category: 6, name: "瑞雲12型", AA: 3, dist: 5, remodel: false },
    { id: 81, category: 6, name: "瑞雲12型(六三四空)", AA: 3, dist: 5, remodel: false },
    { id: 194, category: 6, name: "Laté 298B", AA: 1, dist: 4, remodel: false },
    { id: 207, category: 6, name: "瑞雲(六三一空)", AA: 1, dist: 5, remodel: false },
    { id: 208, category: 6, name: "晴嵐(六三一空)", AA: 0, dist: 4, remodel: false },
    { id: 237, category: 6, name: "瑞雲(六三四空/熟練)", AA: 4, dist: 5, remodel: true },
    { id: 322, category: 6, name: "瑞雲改二(六三四空)", AA: 4, dist: 5, remodel: true },
    { id: 323, category: 6, name: "瑞雲改二(六三四空/熟練)", AA: 5, dist: 5, remodel: false }
];

/* 水上戦闘機 : 7 */
var spFighters = [
    { id: 164, category: 7, name: "Ro.44水上戦闘機", AA: 2, dist: 3, remodel: true },
    { id: 165, category: 7, name: "二式水戦改", AA: 3, dist: 4, remodel: true },
    { id: 215, category: 7, name: "Ro.44水上戦闘機bis", AA: 3, dist: 3, remodel: true },
    { id: 216, category: 7, name: "二式水戦改(熟練)", AA: 5, dist: 4, remodel: true },
    { id: 217, category: 7, name: "強風改", AA: 5, dist: 3, remodel: true }
];

/* 大型飛行艇 : 8 */
var lgFlyingBoats = [
    { id: 138, category: 8, name: "二式大艇", AA: 0, dist: 20, remodel: false },
    { id: 178, category: 8, name: "PBY-5A Catalina", AA: 0, dist: 10, remodel: false }
];

/* 噴式爆撃機 : 9 */
var jetBombers = [
    { id: 199, category: 9, name: "噴式景雲改", AA: 6, dist: 3, remodel: false },
    { id: 200, category: 9, name: "橘花改", AA: 12, dist: 2, remodel: false }
];

/* 陸上攻撃機 : 101 */
var lbAttackAircrafts = [
    { id: 168, category: 101, name: "九六式陸攻", AA: 1, dist: 8, remodel: false },
    { id: 169, category: 101, name: "一式陸攻", AA: 2, dist: 9, remodel: false },
    { id: 170, category: 101, name: "一式陸攻(野中隊)", AA: 3, dist: 9, remodel: false },
    { id: 180, category: 101, name: "一式陸攻 二二型甲", AA: 3, dist: 10, remodel: false },
    { id: 186, category: 101, name: "一式陸攻 三四型", AA: 4, dist: 8, remodel: false },
    { id: 187, category: 101, name: "銀河", AA: 3, dist: 9, remodel: false },
    { id: 224, category: 101, name: "爆装一式戦 隼III型改(55戦隊)", AA: 6, dist: 5, remodel: false },
    { id: 269, category: 101, name: "試製東海", AA: 0, dist: 8, remodel: false },
    { id: 270, category: 101, name: "東海(九〇一空)", AA: 0, dist: 8, remodel: false }
];

/* 陸軍戦闘機 : 102 */
var lbInterceptors = [
    { id: 176, category: 102, name: "三式戦 飛燕", AA: 8, dist: 3, remodel: false },
    { id: 177, category: 102, name: "三式戦 飛燕(飛行第244戦隊)", AA: 9, dist: 4, remodel: true },
    { id: 185, category: 102, name: "三式戦 飛燕一型丁(キ61-I 丁)", AA: 9, dist: 4, remodel: true },
    { id: 218, category: 102, name: "四式戦 疾風", AA: 10, dist: 5, remodel: false },
    { id: 221, category: 102, name: "一式戦 隼II型", AA: 6, dist: 6, remodel: true },
    { id: 222, category: 102, name: "一式戦 隼III型甲", AA: 7, dist: 6, remodel: true },
    { id: 223, category: 102, name: "一式戦 隼III型甲(54戦隊)", AA: 8, dist: 7, remodel: false },
    { id: 225, category: 102, name: "一式戦 隼II型(64戦隊)", AA: 11, dist: 7, remodel: false },
    { id: 250, category: 102, name: "Spitfire Mk.I", AA: 7, dist: 4, remodel: false },
    { id: 251, category: 102, name: "Spitfire Mk.V", AA: 9, dist: 5, remodel: false },
    { id: 253, category: 102, name: "Spitfire Mk.IX(熟練)", AA: 10, dist: 4, remodel: false }
];

/* 局地戦闘機 : 103 */
var lbFighters = [
    { id: 175, category: 103, name: "雷電", AA: 6, dist: 2, remodel: false },
    { id: 201, category: 103, name: "紫電一一型", AA: 8, dist: 3, remodel: true },
    { id: 202, category: 103, name: "紫電二一型 紫電改", AA: 9, dist: 4, remodel: false },
    { id: 263, category: 103, name: "紫電改(三四三空) 戦闘301", AA: 11, dist: 4, remodel: false },
    { id: 333, category: 103, name: "烈風改", AA: 10, dist: 4, remodel: false },
    { id: 334, category: 103, name: "烈風改(三五二空/熟練)", AA: 11, dist: 4, remodel: false }
];

/* 陸上偵察機 : 104 */
var lbReconnaissances = [
    { id: 311, category: 104, name: "二式陸上偵察機", AA: 3, dist: 8, remodel: false },
    { id: 312, category: 104, name: "二式陸上偵察機(熟練)", AA: 3, dist: 9, remodel: false }
];

/* 機体カテゴリ選択欄に配列から値を生成 */
function setPlaneCategory(groupName, array) {
    $('.planeSelect__select').append('<optgroup label="' + groupName + '" id="' + groupName + '">');
    $.each(array, function (index, element) {
        $('#' + groupName).append('<option value="' + element.val + '">' + element.name + '</a>');
    });
}

/* 機体を選択欄に展開 */
function setPlanes(array) {
    $('.planes__container').empty();
    $.each(array, function (index, plane) {
        $('.planes__container').append(
            '<div class="plane row w-100 ' + getPlaneCss(plane) + '" data-no="' + plane.id + '" data-cate="' + plane.category + '"  data-name="' + plane.name + '" data-aa="' + plane.AA + '" data-dist="' + plane.dist + '" data-remodel="' + plane.remodel + '" data-checked="false">' +
            '<span class="col-8 col-md-6 col-lg-7">' + plane.name + '</span>' +
            '<span class="col text-center">' + plane.AA + '</span>' +
            '<span class="col text-center">' + plane.dist + '</span>' +
            '</div>'
        );
    });

    $('#planeSelect__content div.plane').draggable({
        helper: 'clone',
        start: function (event, ui) {
            $(this).remove('.text-center');
        },
        stop: function (e, ui) {
            $(this).attr('style', 'position: relative;');
        }
    });
}

/* 引数に渡されたカテゴリに紐づく配列を返却 */
function getPlanes(category) {
    switch (category) {
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

/* 選択されている機体カテゴリ用のスタイルクラスを返却 */
function getPlaneCss(plane) {
    var return_css = "";
    switch (plane.category) {
        case 1:
        case 102:
            return_css = "css_fighter";
            if (plane.id == 254 || plane.id == 255 || plane.id == 338 || plane.id == 339) {
                /* 夜間戦闘機 */
                return_css = "css_cb_night_aircraft";
            }
            break;
        case 2:
            return_css = "css_torpedo_bomber";
            if (plane.id == 257 || plane.id == 344 || plane.id == 345) {
                /* 夜間攻撃機 */
                return_css = "css_cb_night_aircraft";
            }
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
            if (plane.id == 269 || plane.id == 270) {
                /* 対潜哨戒機 */
                return_css = "css_lb_asw_aircraft";
            }
            else if (plane.id == 224) {
                /* 爆装一式戦 */
                return_css = "css_fighter";
            }
            else {
                return_css = "css_lb_attack_aircraft";
            }
            break;
        default:
            break;
    }
    return return_css;
}

/* 引数で渡された lb_plane__div 要素をクリアする */
function clearLbPlaneDiv($div) {
    /* 選択状況をリセット */
    $div.removeData();
    $div.find('button').text('機体を選択');
    $div.find('select').val('0').change();

    /* 選択した対象のスタイルを適用 */
    $div.removeClass(function (index, className) {
        return (className.match(/\bcss_\S+/g) || []).join(' ');
    });
}

/* 第1引数で渡された lb_plane__div に第2引数で渡された 機体データ入り要素のデータを挿入する */
function setLbPlaneDiv($div, $original) {

    /* 複製対象のスタイルを適用 */
    $div
        .removeClass(function (index, className) { return (className.match(/\bcss_\S+/g) || []).join(' '); })
        .addClass($original.attr('class').match(/\bcss_\S+/g))

        /* 機体データ取得 */
        .data('name', $original.data('name'))
        .data('aa', $original.data('aa'))
        .data('dist', $original.data('dist'))
        .data('category', $original.data('cate'))
        .find('button').text($original.data('name'));

    /* 改修の有効無効設定 */
    var $remodelInput = $div.find('.remodel_select');
    $remodelInput.prop('disabled', !$original.data('remodel'));
    if ($remodelInput.prop('disabled')) {
        $remodelInput.val('0');
    }

    /* 熟練度初期値 戦闘機系は最初から熟練Maxで */
    if ($.inArray($original.data('cate'), levelMaxCate) != -1) {
        $div.find('.prof__select').val('7').change();
    }
    else {
        $div.find('.prof__select').val('0').change();
    }

    /* 搭載数初期値 偵察機系は4 */
    if ($.inArray($original.data('cate'), reconnaissances) != -1) {
        $div.find('.slot').val('4').change();
    }
    else {
        $div.find('.slot').val('18').change();
    }
}

/* 画面初期化用メソッド */
function initAll() {
    /* 機体カテゴリ初期化 */
    $('.planeSelect__select').empty();
    setPlaneCategory('艦載機', cbPlaneCate);
    setPlaneCategory('陸上機', lbPlaneCate);

    setPlanes(cbFighters);

    /* 基地航空隊 第1基地航空隊第1中隊を複製 */
    var org = $('#lb_item1').children('div').html();
    $('.lb_plane__div').each(function () {
        $(this).html(org);
    });
}

$(function () {

    /* 画面初期化 */
    initAll();

    /* インデックス移動 */
    $('.sidebar-sticky a[href^="#"]').on('click', function () {
        var speed = 300;
        var href = $(this).attr("href");
        var target = $(href == "#" || href == "" ? 'html' : href);
        var position = target.offset().top - 60;
        $('body,html').animate({ scrollTop: position }, speed, 'swing');
        return false;
    });

    /* ページトップへボタン */
    $('.btn-goPageTop').on('click', function () {
        $(this).blur();
        $('body,html').animate({ scrollTop: 0 }, 300, 'swing');
    });

    /* 折り畳みボタン */
    $('.btn_toggleContent').on('click', function () {
        $(this).toggleClass('btn-toggleContent_show').toggleClass('btn-toggleContent_hide').blur();
    });

    /* 基地入れ替え設定 */
    $('div.lb_tab').sortable({
        delay: 100,
        scroll: false,
        placeholder: "lb_plane__div-drag",
        forcePlaceholderSize: true,
        tolerance: "pointer",
        stop: function (event, ui) {
            if (isOut) {
                /* 選択状況をリセット */
                clearLbPlaneDiv(ui.item);
                $(this).sortable('cancel');
            }
        }
    });
    /* 範囲外に機体を持って行ったときを拾う */
    $('div.lb_tab').droppable({
        accept: ".plane, .lb_plane__div",
        tolerance: "pointer",
        over: function () { isOut = false; },
        out: function () { isOut = true; }
    });
    /* 機体をドラッグしてきた時の処理 */
    $('div.lb_plane__div').droppable({
        accept: ".plane",
        hoverClass: "lb_plane__div-plane-hover",
        tolerance: "pointer",
        drop: function (event, ui) { setLbPlaneDiv($(this), ui.draggable); }
    });

    /* 基地航空隊　熟練度を選択時 */
    $('.prof__select').on('change', function () {
        var prof = $(this).val();
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

    /* 機体カテゴリ変更時 応じた機体をリストに展開 */
    $(document).on('change', '.planeSelect__select', function () {
        $('.btnSort').removeClass('btnSort_desc').removeClass('btnSort_asc');
        $('.planeSelect__select').val($(this).val());
        setPlanes(getPlanes($(this).val()));
    });

    /* ソート */
    $(document).on('click', '.btnSort', function () {
        var sortedData = getPlanes($('.planeSelect__select').val());
        var $btnSort = $(this);
        var clickedClass = $btnSort.attr('class');
        var selectedName = $('.plane-selected').data('name'); // ソート前に選択されていた機体名

        if (clickedClass.indexOf('btnSort_desc') == -1 && clickedClass.indexOf('btnSort_asc') == -1) {
            /* 降順に */
            $('.btnSort').removeClass('btnSort_desc').removeClass('btnSort_asc');
            $btnSort.addClass('btnSort_desc');
            sortedData = sortedData.sort(function (a, b) {
                switch ($($btnSort).text()) {
                    case "機体名":
                        return a.name > b.name ? -1 : a.name < b.name ? 1 : 0;
                    case "対空":
                        return a.AA > b.AA ? -1 : a.AA < b.AA ? 1 : 0;
                    case "半径":
                        return a.dist > b.dist ? -1 : a.dist < b.dist ? 1 : 0;
                }
            });
        }
        else if (clickedClass.indexOf('btnSort_desc') > -1) {
            /* 降順 -> 昇順に */
            $('.btnSort').removeClass('btnSort_desc').removeClass('btnSort_asc');
            $btnSort.addClass('btnSort_asc');
            sortedData = sortedData.sort(function (a, b) {
                switch ($($btnSort).text()) {
                    case "機体名":
                        return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
                    case "対空":
                        return a.AA > b.AA ? 1 : a.AA < b.AA ? -1 : 0;
                    case "半径":
                        return a.dist > b.dist ? 1 : a.dist < b.dist ? -1 : 0;
                }
            });
        }
        else {
            /* ID昇順に(デフォルトのソート) */
            $('.btnSort').removeClass('btnSort_desc').removeClass('btnSort_asc');
            sortedData = sortedData.sort(function (a, b) {
                return a.id > b.id ? 1 : a.id < b.id ? -1 : 0;
            });
        }

        setPlanes(sortedData);

        if (selectedName) {
            $('.modal-body').find('div[data-name="' + selectedName + '"]').addClass('plane-selected');
        }
    });


    /* 機体選択ボタンクリック -> モーダル展開 */
    $('.btn-SearchPlane').on('click', function () {
        /* 機体選択画面の結果を返却するターゲットのdiv要素を取得 */
        $target = $(this).closest('.lb_plane__div');
        var selectedCategory = $target.data('category');
        var selectedName = $target.data('name');
        var $modalBody = $('.modal-body');

        /* モーダル生成処理 */
        $modalBody.empty().append($('#planeSelect__content').html());
        $('#btnCommitPlane').prop('disabled', true);
        $('#btnRemovePlane').prop('disabled', true);

        if (selectedCategory) {
            /* 既存のデータがあればカテゴリをそれに合わせる */
            $('.planeSelect__select').prop('value', selectedCategory).change();
        }
        else {
            /* 既存データがなければ機体選択リストのカテゴリ選択値を流用 */
            $modalBody.find('.planeSelect__select').prop('value', $('#planeSelect__content').find('.planeSelect__select').val()).change();
        }

        if (selectedName) {
            var $tmp = $modalBody.find('div[data-name="' + selectedName + '"]');
            var $tmpParent = $tmp.parent();

            /* 既存のデータがあればあらかじめ選択状態にする */
            $tmp.addClass('plane-selected mb-3');

            /* ついでに、てっぺんに持ってくる */
            $tmp.remove();
            $tmpParent.prepend($tmp);

            $('#btnRemovePlane').prop('disabled', false);
        }

        /* 調整終了、モーダル展開 */
        $('#planeSelectModal').modal('show');
    });

    /* 機体選択画面(モーダル)　機体をクリック時 */
    $(document).on('click', '.modal-body .plane', function () {
        var $clickedPlane = $(this);
        $clickedPlane.data('checked', !$clickedPlane.data('checked'));
        $('.modal-body .plane').removeClass('plane-selected');
        if ($clickedPlane.data('checked')) {
            $clickedPlane.addClass('plane-selected');
            /* OKボタン活性化 */
            $('#btnCommitPlane').prop('disabled', false);
        }
    });

    /* OKボタンクリック(モーダル内) */
    $('#btnCommitPlane').on('click', function () {
        if ($(this).prop('disabled')) return false;

        /* 機体セット */
        setLbPlaneDiv($target, $('.plane-selected'));

        $('#planeSelectModal').modal('hide');
    });

    /* はずすボタンクリック(モーダル内) */
    $('#btnRemovePlane').on('click', function () {
        if ($(this).prop('disabled')) return false;

        /* 選択状況をリセット */
        clearLbPlaneDiv($target);

        $('#planeSelectModal').modal('hide');
    });
});
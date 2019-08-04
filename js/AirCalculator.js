/*==================================
    定数
==================================*/
/* 機体選択画面の返却先 */
var $target = undefined;

/* 熟練を最初からMaxにする機体カテゴリ */
const levelMaxCate = [1, 4, 5, 7, 8, 102, 103];

/* 搭載数が基地で最大4の機体カテゴリ */
const reconnaissances = [4, 5, 8, 104];

/* ドラッグした要素が範囲外かどうかフラグ */
var isOut = false;

/* 機体カテゴリ */
const planeCategory = {
    '艦上戦闘機': 1,
    '艦上攻撃機': 2,
    '艦上爆撃機': 3,
    '艦上偵察機': 4,
    '水上偵察機': 5,
    '水上爆撃機': 6,
    '水上戦闘機': 7,
    '大型飛行艇': 8,
    '噴式爆撃機': 9,
    '陸上攻撃機': 101,
    '陸軍戦闘機': 102,
    '局地戦闘機': 103,
    '陸上偵察機': 104
}

/* 艦上戦闘機 : 1 */
const cbFighters = [
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
    { id: 254, category: -1, name: "F6F-3N", AA: 8, dist: 5, remodel: false },
    { id: 255, category: -1, name: "F6F-5N", AA: 10, dist: 5, remodel: false },
    { id: 271, category: 1, name: "紫電改四", AA: 10, dist: 4, remodel: false },
    { id: 335, category: 1, name: "烈風改(試製艦載型)", AA: 10, dist: 5, remodel: false },
    { id: 336, category: 1, name: "烈風改二", AA: 13, dist: 5, remodel: false },
    { id: 338, category: -1, name: "烈風改二戊型", AA: 11, dist: 5, remodel: false },
    { id: 339, category: -1, name: "烈風改二戊型(一航戦/熟練)", AA: 12, dist: 6, remodel: false }
];

/* 艦上攻撃機 : 2 */
const cbTorpedoBombers = [
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
    { id: 257, category: -2, name: "TBM-3D", AA: 1, dist: 6, remodel: false },
    { id: 302, category: 2, name: "九七式艦攻(九三一空/熟練)", AA: 0, dist: 4, remodel: false },
    { id: 342, category: 2, name: "流星改(一航戦)", AA: 2, dist: 6, remodel: false },
    { id: 343, category: 2, name: "流星改(一航戦/熟練)", AA: 3, dist: 6, remodel: false },
    { id: 344, category: -2, name: "九七式艦攻改 試製三号戊型(空六号電探改装備機)", AA: 0, dist: 4, remodel: false },
    { id: 345, category: -2, name: "九七式艦攻改(熟練) 試製三号戊型(空六号電探改装備機)", AA: 0, dist: 4, remodel: false }
];

/* 艦上爆撃機 : 3 */
const cbDiveBombers = [
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
const cbReconnaissances = [
    { id: 54, category: 4, name: "彩雲", AA: 0, dist: 8, remodel: true },
    { id: 61, category: 4, name: "二式艦上偵察機", AA: 1, dist: 5, remodel: true },
    { id: 151, category: 4, name: "試製景雲(艦偵型)", AA: 0, dist: 8, remodel: true },
    { id: 212, category: 4, name: "彩雲(東カロリン空)", AA: 0, dist: 8, remodel: false },
    { id: 273, category: 4, name: "彩雲(偵四)", AA: 2, dist: 7, remodel: false }
];

/* 水上偵察機 : 5 */
const spReconnaissances = [
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
const spBombers = [
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
const spFighters = [
    { id: 164, category: 7, name: "Ro.44水上戦闘機", AA: 2, dist: 3, remodel: true },
    { id: 165, category: 7, name: "二式水戦改", AA: 3, dist: 4, remodel: true },
    { id: 215, category: 7, name: "Ro.44水上戦闘機bis", AA: 3, dist: 3, remodel: true },
    { id: 216, category: 7, name: "二式水戦改(熟練)", AA: 5, dist: 4, remodel: true },
    { id: 217, category: 7, name: "強風改", AA: 5, dist: 3, remodel: true }
];

/* 大型飛行艇 : 8 */
const lgFlyingBoats = [
    { id: 138, category: 8, name: "二式大艇", AA: 0, dist: 20, remodel: false },
    { id: 178, category: 8, name: "PBY-5A Catalina", AA: 0, dist: 10, remodel: false }
];

/* 噴式爆撃機 : 9 */
const jetBombers = [
    { id: 199, category: 9, name: "噴式景雲改", AA: 6, dist: 3, remodel: false },
    { id: 200, category: 9, name: "橘花改", AA: 12, dist: 2, remodel: false }
];

/* 陸上攻撃機 : 101 */
const lbAttackAircrafts = [
    { id: 168, category: 101, name: "九六式陸攻", AA: 1, dist: 8, remodel: false },
    { id: 169, category: 101, name: "一式陸攻", AA: 2, dist: 9, remodel: false },
    { id: 170, category: 101, name: "一式陸攻(野中隊)", AA: 3, dist: 9, remodel: false },
    { id: 180, category: 101, name: "一式陸攻 二二型甲", AA: 3, dist: 10, remodel: false },
    { id: 186, category: 101, name: "一式陸攻 三四型", AA: 4, dist: 8, remodel: false },
    { id: 187, category: 101, name: "銀河", AA: 3, dist: 9, remodel: false },
    { id: 224, category: 101, name: "爆装一式戦 隼III型改(55戦隊)", AA: 6, dist: 5, remodel: false },
    { id: 269, category: -101, name: "試製東海", AA: 0, dist: 8, remodel: false },
    { id: 270, category: -101, name: "東海(九〇一空)", AA: 0, dist: 8, remodel: false }
];

/* 陸軍戦闘機 : 102 */
const lbInterceptors = [
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
const lbFighters = [
    { id: 175, category: 103, name: "雷電", AA: 6, dist: 2, remodel: false },
    { id: 201, category: 103, name: "紫電一一型", AA: 8, dist: 3, remodel: true },
    { id: 202, category: 103, name: "紫電二一型 紫電改", AA: 9, dist: 4, remodel: false },
    { id: 263, category: 103, name: "紫電改(三四三空) 戦闘301", AA: 11, dist: 4, remodel: false },
    { id: 333, category: 103, name: "烈風改", AA: 10, dist: 4, remodel: false },
    { id: 334, category: 103, name: "烈風改(三五二空/熟練)", AA: 11, dist: 4, remodel: false }
];

/* 陸上偵察機 : 104 */
const lbReconnaissances = [
    { id: 311, category: 104, name: "二式陸上偵察機", AA: 3, dist: 8, remodel: false },
    { id: 312, category: 104, name: "二式陸上偵察機(熟練)", AA: 3, dist: 9, remodel: false }
];

/* 制空状態オブジェクト */
const airStatus = [
    { name: '制空権確保', abbr: '確保', rate: 10 },
    { name: '航空優勢', abbr: '優勢', rate: 8 },
    { name: '航空均衡', abbr: '均衡', rate: 6 },
    { name: '航空劣勢', abbr: '劣勢', rate: 4 },
    { name: '制空権喪失', abbr: '喪失', rate: 1 },
];

/* 敵艦データ */
const enemyData = [
    [510, 1, "light_", [2], [18], [0]],
    [523, 1, "light_1", [5], [24], [0]],
    [762, 1, "light_1_w", [10, 4], [26, 23], [0, 0]],
    [776, 1, "light_1_vw", [10, 8, 8], [26, 23, 23], [0, 0, 0]],
    [777, 1, "light_1_b", [11, 5, 6], [26, 23, 23], [0, 0, 0]],
    [560, 1, "light_2", [5], [22], [0]],
    [763, 1, "light_2_w", [10, 4], [32, 29], [0, 0]],
    [764, 1, "light_2_r", [12, 5], [32, 29], [0, 0]],
    [734, 1, "light__v2_1", [8, 5, 8], [22, 22, 22], [0, 0, 0]],
    [765, 1, "light__v2_1_vw", [8, 10, 4], [28, 24, 18], [0, 0, 0]],
    [778, 1, "light__v2_1_b", [11, 5, 6, 6], [28, 24, 18, 18], [0, 0, 0, 0]],
    [735, 1, "light__v2_2", [9, 5, 9], [28, 24, 20], [0, 0, 0]],
    [766, 1, "light__v2_2_vr", [9, 12, 5], [28, 28, 20], [0, 0, 0]],
    [779, 1, "light__v2_2_r", [12, 5, 5], [28, 20, 20], [0, 0, 0]],
    [780, 1, "light__v2_2_vb", [11, 5, 6, 9], [28, 28, 20, 20], [0, 0, 0, 0]],
    [512, 2, "heavy_", [2], [27], [0]],
    [525, 2, "heavy_1", [5], [30], [0]],
    [528, 2, "heavy_2", [5], [32], [0]],
    [579, 2, "heavy_2_w", [10, 4, 4], [32, 27, 5], [0, 0, 0]],
    [614, 2, "heavy_2_r_", [12, 5, 4], [32, 27, 5], [0, 0, 0]],
    [615, 2, "heavy_2_r", [12, 5, 5], [32, 27, 5], [0, 0, 0]],
    [565, 2, "heavy__v2_2", [9, 4, 4], [36, 36, 36], [0, 0, 0]],
    [616, 2, "heavy__v2_2_w", [10, 4, 4], [36, 36, 36], [0, 0, 0]],
    [617, 2, "heavy__v2_2_r_", [12, 5, 4], [36, 36, 36], [0, 0, 0]],
    [618, 2, "heavy__v2_2_r", [12, 5, 5], [36, 36, 36], [0, 0, 0]],
];

/* 軽空母のみ */
const lightCarrier = enemyData.filter(mainData => mainData[1] == 1);

/* 結果表示バー用データ */
var chartData =
{
    friend: [],
    enemy: [],
    rate: [{}]
};
var prevData = [0, 0, 0, 0, 0, 0, 0, 0];
var enemyFleet = [];

// 敵とりあえず
var enmList = [618, 735, 735];
// 基地とりあえず
var lbData = {
    ap: [210, 90, 200],
    status: [2, 2, 2]
}
// 本隊とりあえず
var mainAp = 140;

/*==================================
    関数
==================================*/
/**
 * 機体カテゴリ選択欄に、配列から選択可能データを生成
 * @param {string} groupName グループ名 (陸上機 とか 艦載機)
 * @param {Array.<number>} 展開する機体カテゴリid
 */
function setPlaneCategory(groupName, array) {
    $('.planeSelect__select').append('<optgroup label="' + groupName + '" id="' + groupName + '">');
    Object.keys(planeCategory).forEach(function (value) {
        if (array.indexOf(planeCategory[value]) != -1) {
            $('#' + groupName).append('<option value="' + planeCategory[value] + '">' + value + '</option>');
        }
    });
}

/* 機体を選択欄に展開 */

function setPlanes(array) {
}

/* 引数に渡されたカテゴリに紐づく配列を返却 */
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
        .addClass($original.data('cssname').match(/\bcss_\S+/g))

        /* 機体データ取得 */
        .data('name', $original.text())
        .data('aa', $original.data('aa'))
        .data('dist', $original.data('dist'))
        .data('category', $original.data('cate'))
        .find('button').text($original.text());

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

/**
 * 引数で渡された table 要素(要 tbody )に plans 配列から値を展開
 * @param {JqueryDomObject} $table
 * @param {Array.<Object>} planes
 */
function createPlaneTable($table, planes) {
    var $target = $table.find('tbody');
    $target.empty();

    planes.forEach(function (plane) {
        $target.append(`
        <tr class="border-bottom">
            <td><img src="./img/e/category`+ plane.category + `.png" class="img-size-25" alt="` + plane.category + `"></td>
            <td>`+ plane.name + `</td>
            <td class="text-center">`+ plane.AA + `</td>
            <td class="text-center">`+ plane.dist + `</td>
        </tr>
    `);
    });


}

/* 画面初期化用メソッド */
function initAll(callback) {
    /* 機体カテゴリ初期化 */
    $('.planeSelect__select').empty();
    $('.planeSelect__select').append('<option value="0">全て</option>');
    setPlaneCategory('艦載機', [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    setPlaneCategory('陸上機', [101, 102, 103, 104]);

    /* 艦戦データ展開 */
    // createPlaneTable($('.plane_table'), cbFighters);

    /* 基地航空隊 第1基地航空隊第1中隊を複製 */
    var org = $('#lb_item1').children('div').html();
    $('.lb_plane__div').each(function () {
        $(this).html(org);
    });



    callback();
}

/**
 * 制空値を比較し、制空状態の index を返却
 * @param {number} x ベース制空値
 * @param {number} y 比較対象制空値
 * @returns {number} 制空状態 index (0:確保 1:優勢...)
 */
function getAirStatusIndex(x, y) {
    var border = getBorder(y);
    for (let i = 0; i < border.length; i++) if (x >= border[i]) return i;
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
    var mainData = enemyData.filter(x => x[0] == id)[0];
    var enemy =
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
    var sumAP = 0;
    for (var i = 0; i < enemyFleet.length; i++) sumAP += enemyFleet[i].lbAp;
    return sumAP;
}

/**
 * 指定した敵艦隊オブジェクトの総制空値を返す(通常)
 * @param {Array.<Object>} enemyFleet
 * @returns 総制空値
 */
function getEnemyFleetAirPower(enemyFleet) {
    var sumAP = 0;
    for (var i = 0; i < enemyFleet.length; i++) sumAP += enemyFleet[i].ap;
    return sumAP;
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜数はランダム
 * @param {Number} airStateIndex 制空状態インデックス
 * @param {Number} slot 撃墜前搭載数
 * @returns {Number} 撃墜後搭載数
 */
function getShootDownSlot(airStateIndex, slot) {
    var downRate = airStatus[airStateIndex].rate + 1;
    return Math.floor(slot * (0.65 * Math.floor(Math.random() * downRate) + 0.35 * Math.floor(Math.random() * downRate)) / 10);
}

/**
 * 引数の制空状態、搭載数をもとに撃墜後の搭載数を返却 撃墜率は中央値固定
 * @param {Number} airStateIndex 制空状態インデックス
 * @param {Number} slot 撃墜前搭載数
 * @returns {Number} 撃墜後搭載数
 */
function getShootDownSlotHalf(airStateIndex, slot) {
    var downRate = airStatus[airStateIndex].rate;
    return Math.floor(slot * (0.65 * downRate / 2.0 + 0.35 * downRate / 2.0) / 10);
}

/**
 * 撃墜処理(チャート表示用 5割固定)
 * @param {Array.<Object>} enemyFleet
 * @param {number} ap
 */
function ShootDownforChart(enemyFleet, ap) {
    var elbap = getEnemyFleetLandBaseAirPower(enemyFleet);

    chartData.friend.push(ap);
    chartData.enemy.push(elbap);

    var airCond = getAirStatusIndex(ap, elbap);
    enemyFleet.forEach(function (enemy) {
        enemy.slots.forEach(function (slot, i) {
            enemy.slots[i] -= getShootDownSlotHalf(airCond, slot);
        })
        updateEnemyAp(enemy);
    });
}

/**
 * 撃墜処理 (繰り返し用　処理速度優先)
 * @param {Array.<Object>} enemyFleet
 * @param {number} ap
 */
function ShootDown(enemyFleet, ap) {
    var elbap = getEnemyFleetLandBaseAirPower(enemyFleet);
    var airCond = getAirStatusIndex(ap, elbap);
    for (var i = 0; i < enemyFleet.length; i++) {
        for (var j = 0; j < enemyFleet[i].slots.length; j++) {
            var slot = enemyFleet[i].slots[j];
            enemyFleet[i].slots[j] -= getShootDownSlot(airCond, slot);
        }
        updateEnemyAp(enemyFleet[i]);
    }
}

/**
 * 敵IDのリストから敵艦隊を生成する
 * @param {Array.<number>} enmList 敵艦IDリスト
 * @returns {Array.<Object>} 敵艦隊オブジェクト配列
 */
function getEnemyFleet(enmList) {
    var selectedEnemy = [];
    enmList.forEach(function (id) { selectedEnemy.push(createEnemyObject(id)); });
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
 * 計算
 */
function startCaluclate() {

    initCaluclate(true);
    var eap = 0;

    for (var index = 0; index < 3; index++) {

        var lbAp = lbData.ap[index];
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
    chartData.rate = rateCaluclate();

    // 上位 n % のデータを拾う?

    drawResultBar(chartData);
}

/**
 * 割合計算
 */
function rateCaluclate() {
    var st = Date.now();
    var maxCount = 50000;
    var check = 1;
    var dist = [{}, {}, {}, {}, {}, {}, {}, {}];
    dist.forEach(function (object) {
        airStatus.forEach(function (value) { object[value.abbr] = 0 });
    });

    initCaluclate(false);
    for (var count = 0; count < maxCount; count++) {
        // 敵機補給
        for (let i = 0; i < enemyFleet.length; i++) {
            enemyFleet[i].slots = enemyFleet[i].orgSlots.concat();
            updateEnemyAp(enemyFleet[i]);
        }

        for (var j = 0; j < 3; j++) {
            var lbAp = lbData.ap[j];
            if (lbData.status[j] > 0) {
                // 第一波
                dist[j * 2][airStatus[getAirStatusIndex(lbAp, getEnemyFleetLandBaseAirPower(enemyFleet))].abbr]++;
                ShootDown(enemyFleet, lbAp);
            }

            if (lbData.status[j] == 2) {
                //if (j == 0) console.log(count + '回目 : ' + lbAp + ' / ' + getEnemyFleetLandBaseAirPower(enemyFleet) + ' = ' + airStatus[getAirStatusIndex(lbAp, getEnemyFleetLandBaseAirPower(enemyFleet))].abbr);
                // 第二波
                dist[j * 2 + 1][airStatus[getAirStatusIndex(lbAp, getEnemyFleetLandBaseAirPower(enemyFleet))].abbr]++;
                ShootDown(enemyFleet, lbAp);
            }
        }

        // 本隊
        dist[7][airStatus[getAirStatusIndex(mainAp, getEnemyFleetAirPower(enemyFleet))].abbr]++;
    }
    dist.forEach(function (obj) {
        Object.keys(obj).forEach(function (key) {
            obj[key] = Math.floor((obj[key] / maxCount * 10000)) / 100 + ' %';
        });
    });
    console.log('checkpoint' + check++ + ' : ' + (Date.now() - st) + ' msec.');
    return dist;
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
    $('#resultChart').empty();

    // それぞれのフェーズにおける制空ボーダーの配列を生成
    var border = data.enemy.map(eap => getBorder(eap));
    var divBase = border.map(value => value[0] == 0 ? 1 : value[0]);
    var mainData = data.friend.map(function (ap, i) { return ap / divBase[i] * 100; });
    const phaseList = ['基地1 第1波', '基地1 第2波', '基地2 第1波', '基地2 第2波', '基地3 第1波', '基地3 第2波', '', '本隊'];

    var svgPadding = { left: 65, right: 20, bottom: 30, top: 30 };
    var svgMargin = { left: 0, right: 0, bottom: 0, top: 0 };
    var barWidth = 15;
    var svgWidth = $('#resultChart').width() - svgMargin.left - svgMargin.right;
    var svgHeight = 1.8 * barWidth * (mainData.length) + svgPadding.top + svgPadding.bottom;
    var maxRange = 110;
    var borderColor = getBarColor(1.0);
    var backColor = getBarColor(0.2);

    var xScale = d3.scaleLinear()
        .domain([0, maxRange])
        .range([svgPadding.left, svgWidth - svgPadding.right]);
    var yScale = d3.scaleBand()
        .rangeRound([svgPadding.top, svgHeight - svgPadding.bottom])
        .domain(phaseList);

    // グラフエリア生成
    var svg = d3.select('#resultChart').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    // x軸
    svg.append('g')
        .attr('class', 'axis x_axis')
        .style('color', '#aaa')
        .attr(
            'transform',
            'translate(0,' + (svgHeight - svgPadding.top) + ')'
        )
        .call(
            d3.axisBottom(xScale)
                .tickValues([100, 50, 100 / 4.5, 100 / 9])
                .tickFormat((d, i) => { return airStatus[i].abbr; })
                .tickSize(-svgHeight + svgPadding.top + svgPadding.bottom)
        );

    // y軸
    svg.append('g')
        .attr('class', 'axis y_axis')
        .style('color', '#aaa')
        .attr("transform", "translate(" + svgPadding.left + ",-6)") // ちょっと上に移動 -6
        .call(d3.axisLeft(yScale));

    // ツールチップ生成
    var tooltip = d3.select("body").append("div").attr("class", "tooltip_resultBar container pt-3 px-2");

    // 各種バー描画
    svg.selectAll('svg')
        .data(mainData)
        .enter()
        .append('rect')
        .attr('x', function (d) { return xScale(0); })
        .attr('y', function (d, i) { return yScale(phaseList[i]); })
        .attr('width', function (d, i) { return xScale(prevData[i]) - xScale(0); })
        .attr('height', barWidth)
        .style('fill', function (d, i) { return backColor[getAirStatusIndex(data.friend[i], data.enemy[i])]; })
        .style('stroke', function (d, i) { return borderColor[getAirStatusIndex(data.friend[i], data.enemy[i])]; })
        .on('mouseover', function (d, i) {
            d3.select(this)
                .attr('style', 'fill:' + getBarColor(0.5)[getAirStatusIndex(data.friend[i], data.enemy[i])])
                .style('stroke', function () { return borderColor[getAirStatusIndex(data.friend[i], data.enemy[i])]; });

            var addText = '';
            var target = chartData.rate[i];
            Object.keys(target).forEach(function (key) { if (target[key] != '0 %') addText += key + '( ' + target[key] + ' )　'; });

            var addText2 = '';
            var ap = data.friend[i];
            airStatus.forEach(function (val, index) {
                var sub = ap - border[i][index];
                if (index != airStatus.length - 1) {
                    addText2 += `
                        <tr`+ (sub > 0 ? ' class="font-weight-bold"' : '') + `>
                            <td class="text-right">` + val.abbr + `:</td>
                            <td>` + border[i][index] + `</td>
                            <td>(` + (sub > 0 ? '+' + sub : sub == 0 ? '± 0' : '-' + (-sub)) + `)</td>
                        </tr>`;
                }
            });

            var airIndex = getAirStatusIndex(ap, data.enemy[i]);
            var infoText = `
                <div class="text-center mb-2">` + (i < 7 ? `第` + Math.floor(i / 2 + 1) + `基地航空隊　第` + ((i % 2) + 1) + `波` : `本隊`) + `</div>
                <div class="text-center font-weight-bold" style="color: ` + getBarColor(0.8)[airIndex] + `">` + airStatus[airIndex].name + `</div>
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
                .style("left", (xScale(d) + 200) + "px");
        })
        .on('mouseout', function (d, i) {
            d3.select(this)
                .attr('style', 'fill:' + backColor[getAirStatusIndex(data.friend[i], data.enemy[i])])
                .style('stroke', function () { return borderColor[getAirStatusIndex(data.friend[i], data.enemy[i])]; });
            tooltip.style("visibility", "hidden");
        })
        .transition()
        .ease(d3.easePolyOut)
        .delay(0)
        .duration(800)
        .attr('width', function (d) { return xScale(d) - xScale(0); });

    prevData = mainData.concat();
}


/**
 * グラフ描画用のカラーコードを返却する
 * @param {number} opacity
 * @returns {Array.<string>} 色コードのリスト index:0 から順に、確保,優勢,均衡,劣勢,喪失 の色
 */
function getBarColor(opacity) {
    return ['rgba(0,255,0,' + opacity + ')', 'rgba(100,255,50,' + opacity + ')', 'rgba(255,255,0,' + opacity + ')', 'rgba(255,150,0,' + opacity + ')', 'rgba(255,50,0,' + opacity + ')'];
}


/*==================================
    メイン
==================================*/
$(function () {
    /* 画面初期化 */
    initAll(function () {
        /* 終わったらLoading画面お片付け */
        $('#loadingSpinner').remove();
        $('#mainContent').removeClass('d-none');
    });

    /* 目次クリックで移動 */
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
        accept: ".lbPlane__div",
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
        createPlaneTable($('.plane_table'), getPlanes($(this).val()));
    });

    /* 機体選択ボタンクリック -> モーダル展開 */
    $('.btn-SearchPlane').on('click', function () {
        /* 機体選択画面の結果を返却するターゲットのdiv要素を取得 */
        $target = $(this).closest('.lb_plane__div');
        var selectedCategory = $target.data('category');
        var selectedName = $target.data('name');
        var $modalBody = $('.modal-body');

        /* モーダル生成処理 */
        $modalBody.find('.planes__container__tbody').empty();

        createPlaneTable();

        $('#btnCommitPlane').prop('disabled', true);
        $('#btnRemovePlane').prop('disabled', true);

        if (selectedCategory) {
            /* 既存のデータがあればカテゴリをそれに合わせる */
            $('.planeSelect__select').prop('value', selectedCategory).change();
        }
        else {
            /* 既存データがなければ機体選択リストのカテゴリ選択値を流用 */
            //$modalBody.find('.planeSelect__select').prop('value', $('#planeSelect__content').find('.planeSelect__select').val()).change();
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

    /* とりあえず計算結果表示デバッグ用 */
    $(document).on('click', '#update', function () { startCaluclate(); });
});
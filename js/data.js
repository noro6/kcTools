// 機体カテゴリ
const planeCategory = {
  '艦上戦闘機': 1,
  '夜間戦闘機': -1,
  '艦上攻撃機': 2,
  '夜間攻撃機': -2,
  '艦上爆撃機': 3,
  '艦上偵察機': 4,
  '水上偵察機': 5,
  '水上爆撃機': 6,
  '水上戦闘機': 7,
  '大型飛行艇': 8,
  '噴式爆撃機': 9,
  '陸上攻撃機': 101,
  '対潜哨戒機': -101,
  '陸軍戦闘機': 102,
  '局地戦闘機': 103,
  '陸上偵察機': 104
}

// 艦上戦闘機 : 1
const cbFighters = [
  { id: 19, category: 1, name: "九六式艦戦", AA: 2, dist: 3, geigeki: 0, taibaku: 0, remodel: true },
  { id: 20, category: 1, name: "零式艦戦21型", AA: 5, dist: 7, geigeki: 0, taibaku: 0, remodel: true },
  { id: 21, category: 1, name: "零式艦戦52型", AA: 6, dist: 6, geigeki: 0, taibaku: 0, remodel: true },
  { id: 22, category: 1, name: "試製烈風 後期型", AA: 10, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 53, category: 1, name: "烈風一一型", AA: 12, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 55, category: 1, name: "紫電改二", AA: 9, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 56, category: 1, name: "震電改", AA: 15, dist: 2, geigeki: 0, taibaku: 0, remodel: false },
  { id: 96, category: 1, name: "零式艦戦21型(熟練)", AA: 8, dist: 7, geigeki: 0, taibaku: 0, remodel: true },
  { id: 109, category: 1, name: "零式艦戦52型丙(六〇一空)", AA: 9, dist: 6, geigeki: 0, taibaku: 0, remodel: true },
  { id: 110, category: 1, name: "烈風(六〇一空)", AA: 11, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 152, category: 1, name: "零式艦戦52型(熟練)", AA: 9, dist: 6, geigeki: 0, taibaku: 0, remodel: true },
  { id: 153, category: 1, name: "零式艦戦52型丙(付岩井小隊)", AA: 10, dist: 6, geigeki: 0, taibaku: 0, remodel: true },
  { id: 155, category: 1, name: "零式艦戦21型(付岩本小隊)", AA: 9, dist: 7, geigeki: 0, taibaku: 0, remodel: false },
  { id: 156, category: 1, name: "零式艦戦52型甲(付岩本小隊)", AA: 11, dist: 6, geigeki: 0, taibaku: 0, remodel: true },
  { id: 157, category: 1, name: "零式艦戦53型(岩本隊)", AA: 12, dist: 6, geigeki: 0, taibaku: 0, remodel: true },
  { id: 158, category: 1, name: "Bf109T改", AA: 8, dist: 2, geigeki: 0, taibaku: 0, remodel: false },
  { id: 159, category: 1, name: "Fw190T改", AA: 10, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 181, category: 1, name: "零式艦戦32型", AA: 5, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 182, category: 1, name: "零式艦戦32型(熟練)", AA: 8, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 184, category: 1, name: "Re.2001 OR改", AA: 6, dist: 4, geigeki: 0, taibaku: 0, remodel: true },
  { id: 189, category: 1, name: "Re.2005 改", AA: 11, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 197, category: 1, name: "F4F-3", AA: 4, dist: 4, geigeki: 0, taibaku: 0, remodel: true },
  { id: 198, category: 1, name: "F4F-4", AA: 5, dist: 4, geigeki: 0, taibaku: 0, remodel: true },
  { id: 205, category: 1, name: "F6F-3", AA: 8, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 206, category: 1, name: "F6F-5", AA: 10, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 228, category: 1, name: "九六式艦戦改", AA: 4, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 249, category: 1, name: "Fulmar", AA: 3, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 252, category: 1, name: "Seafire Mk.III改", AA: 9, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 254, category: -1, name: "F6F-3N", AA: 8, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 255, category: -1, name: "F6F-5N", AA: 10, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 271, category: 1, name: "紫電改四", AA: 10, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 335, category: 1, name: "烈風改(試製艦載型)", AA: 10, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 336, category: 1, name: "烈風改二", AA: 13, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 338, category: -1, name: "烈風改二戊型", AA: 11, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 339, category: -1, name: "烈風改二戊型(一航戦/熟練)", AA: 12, dist: 6, geigeki: 0, taibaku: 0, remodel: false }
];

// 艦上攻撃機 : 2
const cbTorpedoBombers = [
  { id: 16, category: 2, name: "九七式艦攻", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: true },
  { id: 17, category: 2, name: "天山", AA: 0, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 18, category: 2, name: "流星", AA: 0, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 52, category: 2, name: "流星改", AA: 0, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 82, category: 2, name: "九七式艦攻(九三一空)", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: true },
  { id: 83, category: 2, name: "天山(九三一空)", AA: 0, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 93, category: 2, name: "九七式艦攻(友永隊)", AA: 1, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 94, category: 2, name: "天山一二型(友永隊)", AA: 1, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 98, category: 2, name: "九七式艦攻(熟練)", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 112, category: 2, name: "天山(六〇一空)", AA: 0, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 113, category: 2, name: "流星(六〇一空)", AA: 0, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 143, category: 2, name: "九七式艦攻(村田隊)", AA: 1, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 144, category: 2, name: "天山(村田隊)", AA: 1, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 188, category: 2, name: "Re.2001 G改", AA: 4, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 196, category: 2, name: "TBD", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 242, category: 2, name: "Swordfish", AA: 0, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 243, category: 2, name: "Swordfish Mk.II(熟練)", AA: 0, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 244, category: 2, name: "Swordfish Mk.III(熟練)", AA: 0, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 256, category: 2, name: "TBF", AA: 1, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 257, category: -2, name: "TBM-3D", AA: 1, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 302, category: 2, name: "九七式艦攻(九三一空/熟練)", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 342, category: 2, name: "流星改(一航戦)", AA: 2, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 343, category: 2, name: "流星改(一航戦/熟練)", AA: 3, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 344, category: -2, name: "九七式艦攻改 試製三号戊型(空六号電探改装備機)", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 345, category: -2, name: "九七式艦攻改(熟練) 試製三号戊型(空六号電探改装備機)", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false }
];

// 艦上爆撃機 : 3
const cbDiveBombers = [
  { id: 23, category: 3, name: "九九式艦爆", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 24, category: 3, name: "彗星", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 57, category: 3, name: "彗星一二型甲", AA: 0, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 60, category: 3, name: "零式艦戦62型(爆戦)", AA: 4, dist: 4, geigeki: 0, taibaku: 0, remodel: true },
  { id: 64, category: 3, name: "Ju87C改", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 97, category: 3, name: "九九式艦爆(熟練)", AA: 1, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 99, category: 3, name: "九九式艦爆(江草隊)", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 100, category: 3, name: "彗星(江草隊)", AA: 1, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 111, category: 3, name: "彗星(六〇一空)", AA: 0, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 148, category: 3, name: "試製南山", AA: 1, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 154, category: 3, name: "零式艦戦62型(爆戦/岩井隊)", AA: 7, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 195, category: 3, name: "SBD", AA: 2, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 219, category: 3, name: "零式艦戦63型(爆戦)", AA: 5, dist: 4, geigeki: 0, taibaku: 0, remodel: true },
  { id: 233, category: 3, name: "F4U-1D", AA: 7, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 248, category: 3, name: "Skua", AA: 2, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 277, category: 3, name: "FM-2", AA: 6, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 291, category: 3, name: "彗星二二型(六三四空)", AA: 1, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 292, category: 3, name: "彗星二二型(六三四空/熟練)", AA: 2, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 305, category: 3, name: "Ju87C改二(KMX搭載機)", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 306, category: 3, name: "Ju87C改二(KMX搭載機/熟練)", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 316, category: 3, name: "Re.2001 CB改", AA: 4, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 319, category: 3, name: "彗星一二型(六三四空/三号爆弾搭載機)", AA: 3, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 320, category: 3, name: "彗星一二型(三一号光電管爆弾搭載機)", AA: 0, dist: 5, geigeki: 0, taibaku: 0, remodel: false }
];

// 艦上偵察機 : 4
const cbReconnaissances = [
  { id: 54, category: 4, name: "彩雲", AA: 0, dist: 8, geigeki: 0, taibaku: 0, remodel: true },
  { id: 61, category: 4, name: "二式艦上偵察機", AA: 1, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 151, category: 4, name: "試製景雲(艦偵型)", AA: 0, dist: 8, geigeki: 0, taibaku: 0, remodel: true },
  { id: 212, category: 4, name: "彩雲(東カロリン空)", AA: 0, dist: 8, geigeki: 0, taibaku: 0, remodel: false },
  { id: 273, category: 4, name: "彩雲(偵四)", AA: 2, dist: 7, geigeki: 0, taibaku: 0, remodel: false }
];

// 水上偵察機 : 5
const spReconnaissances = [
  { id: 25, category: 5, name: "零式水上偵察機", AA: 1, dist: 7, geigeki: 0, taibaku: 0, remodel: true },
  { id: 59, category: 5, name: "零式水上観測機", AA: 2, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 102, category: 5, name: "九八式水上偵察機(夜偵)", AA: 0, dist: 6, geigeki: 0, taibaku: 0, remodel: false },
  { id: 115, category: 5, name: "Ar196改", AA: 1, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 118, category: 5, name: "紫雲", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 163, category: 5, name: "Ro.43水偵", AA: 1, dist: 3, geigeki: 0, taibaku: 0, remodel: true },
  { id: 171, category: 5, name: "OS2U", AA: 1, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 238, category: 5, name: "零式水上偵察機11型乙", AA: 1, dist: 7, geigeki: 0, taibaku: 0, remodel: false },
  { id: 239, category: 5, name: "零式水上偵察機11型乙(熟練)", AA: 1, dist: 7, geigeki: 0, taibaku: 0, remodel: false },
  { id: 304, category: 5, name: "S9 Osprey", AA: 1, dist: 3, geigeki: 0, taibaku: 0, remodel: false }
];

// 水上爆撃機 : 6
const spBombers = [
  { id: 26, category: 6, name: "瑞雲", AA: 2, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 62, category: 6, name: "試製晴嵐", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 79, category: 6, name: "瑞雲(六三四空)", AA: 2, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 80, category: 6, name: "瑞雲12型", AA: 3, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 81, category: 6, name: "瑞雲12型(六三四空)", AA: 3, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 194, category: 6, name: "Laté 298B", AA: 1, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 207, category: 6, name: "瑞雲(六三一空)", AA: 1, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 208, category: 6, name: "晴嵐(六三一空)", AA: 0, dist: 4, geigeki: 0, taibaku: 0, remodel: false },
  { id: 237, category: 6, name: "瑞雲(六三四空/熟練)", AA: 4, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 322, category: 6, name: "瑞雲改二(六三四空)", AA: 4, dist: 5, geigeki: 0, taibaku: 0, remodel: true },
  { id: 323, category: 6, name: "瑞雲改二(六三四空/熟練)", AA: 5, dist: 5, geigeki: 0, taibaku: 0, remodel: false }
];

// 水上戦闘機 : 7
const spFighters = [
  { id: 164, category: 7, name: "Ro.44水上戦闘機", AA: 2, dist: 3, geigeki: 0, taibaku: 0, remodel: true },
  { id: 165, category: 7, name: "二式水戦改", AA: 3, dist: 4, geigeki: 0, taibaku: 0, remodel: true },
  { id: 215, category: 7, name: "Ro.44水上戦闘機bis", AA: 3, dist: 3, geigeki: 0, taibaku: 0, remodel: true },
  { id: 216, category: 7, name: "二式水戦改(熟練)", AA: 5, dist: 4, geigeki: 0, taibaku: 0, remodel: true },
  { id: 217, category: 7, name: "強風改", AA: 5, dist: 3, geigeki: 0, taibaku: 0, remodel: true }
];

// 大型飛行艇 : 8
const lgFlyingBoats = [
  { id: 138, category: 8, name: "二式大艇", AA: 0, dist: 20, geigeki: 0, taibaku: 0, remodel: false },
  { id: 178, category: 8, name: "PBY-5A Catalina", AA: 0, dist: 10, geigeki: 0, taibaku: 0, remodel: false }
];

// 噴式爆撃機 : 9
const jetBombers = [
  { id: 199, category: 9, name: "噴式景雲改", AA: 6, dist: 3, geigeki: 0, taibaku: 0, remodel: false },
  { id: 200, category: 9, name: "橘花改", AA: 12, dist: 2, geigeki: 0, taibaku: 0, remodel: false }
];

// 陸上攻撃機 : 101
const lbAttackAircrafts = [
  { id: 168, category: 101, name: "九六式陸攻", AA: 1, dist: 8, geigeki: 0, taibaku: 0, remodel: false },
  { id: 169, category: 101, name: "一式陸攻", AA: 2, dist: 9, geigeki: 0, taibaku: 0, remodel: false },
  { id: 170, category: 101, name: "一式陸攻(野中隊)", AA: 3, dist: 9, geigeki: 0, taibaku: 0, remodel: false },
  { id: 180, category: 101, name: "一式陸攻 二二型甲", AA: 3, dist: 10, geigeki: 0, taibaku: 0, remodel: false },
  { id: 186, category: 101, name: "一式陸攻 三四型", AA: 4, dist: 8, geigeki: 0, taibaku: 0, remodel: false },
  { id: 187, category: 101, name: "銀河", AA: 3, dist: 9, geigeki: 0, taibaku: 0, remodel: false },
  { id: 224, category: 101, name: "爆装一式戦 隼III型改(55戦隊)", AA: 6, dist: 5, geigeki: 0, taibaku: 0, remodel: false },
  { id: 269, category: -101, name: "試製東海", AA: 0, dist: 8, geigeki: 0, taibaku: 0, remodel: false },
  { id: 270, category: -101, name: "東海(九〇一空)", AA: 0, dist: 8, geigeki: 0, taibaku: 0, remodel: false }
];

// 陸軍戦闘機 : 102
const lbInterceptors = [
  { id: 176, category: 102, name: "三式戦 飛燕", AA: 8, dist: 3, geigeki: 3, taibaku: 1, remodel: false },
  { id: 177, category: 102, name: "三式戦 飛燕(飛行第244戦隊)", AA: 9, dist: 4, geigeki: 4, taibaku: 3, remodel: true },
  { id: 185, category: 102, name: "三式戦 飛燕一型丁(キ61-I 丁)", AA: 9, dist: 4, geigeki: 3, taibaku: 2, remodel: true },
  { id: 218, category: 102, name: "四式戦 疾風", AA: 10, dist: 5, geigeki: 1, taibaku: 1, remodel: false },
  { id: 221, category: 102, name: "一式戦 隼II型", AA: 6, dist: 6, geigeki: 2, taibaku: 0, remodel: true },
  { id: 222, category: 102, name: "一式戦 隼III型甲", AA: 7, dist: 6, geigeki: 3, taibaku: 1, remodel: true },
  { id: 223, category: 102, name: "一式戦 隼III型甲(54戦隊)", AA: 8, dist: 7, geigeki: 3, taibaku: 1, remodel: false },
  { id: 225, category: 102, name: "一式戦 隼II型(64戦隊)", AA: 11, dist: 7, geigeki: 5, taibaku: 1, remodel: false },
  { id: 250, category: 102, name: "Spitfire Mk.I", AA: 7, dist: 4, geigeki: 1, taibaku: 2, remodel: false },
  { id: 251, category: 102, name: "Spitfire Mk.V", AA: 9, dist: 5, geigeki: 2, taibaku: 3, remodel: false },
  { id: 253, category: 102, name: "Spitfire Mk.IX(熟練)", AA: 10, dist: 4, geigeki: 4, taibaku: 2, remodel: false }
];

// 局地戦闘機 : 103
const lbFighters = [
  { id: 175, category: 103, name: "雷電", AA: 6, dist: 2, geigeki: 2, taibaku: 5, remodel: false },
  { id: 201, category: 103, name: "紫電一一型", AA: 8, dist: 3, geigeki: 1, taibaku: 1, remodel: true },
  { id: 202, category: 103, name: "紫電二一型 紫電改", AA: 9, dist: 4, geigeki: 3, taibaku: 1, remodel: false },
  { id: 263, category: 103, name: "紫電改(三四三空) 戦闘301", AA: 11, dist: 4, geigeki: 4, taibaku: 2, remodel: false },
  { id: 333, category: 103, name: "烈風改", AA: 10, dist: 4, geigeki: 2, taibaku: 6, remodel: false },
  { id: 334, category: 103, name: "烈風改(三五二空/熟練)", AA: 11, dist: 4, geigeki: 3, taibaku: 7, remodel: false }
];

// 陸上偵察機 : 104
const lbReconnaissances = [
  { id: 311, category: 104, name: "二式陸上偵察機", AA: 3, dist: 8, geigeki: 0, taibaku: 0, remodel: false },
  { id: 312, category: 104, name: "二式陸上偵察機(熟練)", AA: 3, dist: 9, geigeki: 0, taibaku: 0, remodel: false }
];

// 制空状態オブジェクト
const airStatus = [
  { name: '制空権確保', abbr: '確保', rate: 10 },
  { name: '航空優勢', abbr: '優勢', rate: 8 },
  { name: '航空均衡', abbr: '均衡', rate: 6 },
  { name: '航空劣勢', abbr: '劣勢', rate: 4 },
  { name: '制空権喪失', abbr: '喪失', rate: 1 },
];

// 艦種リスト
const shipCategory = {
  '正規空母': 1,
  '装甲空母': 2,
  '軽空母': 3,
  '航空戦艦': 4,
  '航空巡洋艦': 5,
  '水上機母艦': 6,
  '戦艦': 7,
  '高速戦艦': 8,
  '重巡洋艦': 9,
  '揚陸艦': 10,
  '補給艦': 11,
  '潜水空母': 12,
  '潜水母艦': 13,
  '潜水艦': 14,
  '軽巡洋艦': 15,
  '駆逐艦': 16,
  '重雷装巡洋艦': 17,
  '練習巡洋艦': 18,
  '海防艦': 19,
  '工作艦': 20,
}

// 艦娘オブジェクト
const shipData = [
  { id: 6, category: 1, name: "赤城", slot: [18, 18, 27, 10], final: false },
  { id: 7, category: 1, name: "加賀", slot: [18, 18, 45, 12], final: false },
  { id: 8, category: 1, name: "蒼龍", slot: [12, 27, 18, 7], final: false },
  { id: 9, category: 1, name: "飛龍", slot: [12, 27, 18, 7], final: false },
  { id: 25, category: 3, name: "鳳翔", slot: [8, 11], final: false },
  { id: 30, category: 3, name: "龍驤", slot: [9, 24, 5], final: false },
  { id: 49, category: 6, name: "千歳", slot: [12, 12], final: false },
  { id: 50, category: 6, name: "千代田", slot: [12, 12], final: false },
  { id: 65, category: 3, name: "飛鷹", slot: [12, 18, 18, 10], final: false },
  { id: 66, category: 3, name: "隼鷹", slot: [12, 18, 18, 10], final: false },
  { id: 94, category: 3, name: "祥鳳", slot: [18, 9, 3], final: false },
  { id: 95, category: 6, name: "千歳改", slot: [12, 6, 6], final: false },
  { id: 96, category: 6, name: "千代田改", slot: [12, 6, 6], final: false },
  { id: 99, category: 6, name: "千歳甲", slot: [12, 6, 6], final: true },
  { id: 100, category: 6, name: "千代田甲", slot: [12, 6, 6], final: true },
  { id: 101, category: 5, name: "最上改", slot: [5, 6, 5, 11], final: true },
  { id: 102, category: 4, name: "伊勢改", slot: [11, 11, 11, 14], final: false },
  { id: 103, category: 4, name: "日向改", slot: [11, 11, 11, 14], final: false },
  { id: 104, category: 3, name: "千歳航", slot: [21, 9, 6], final: false },
  { id: 105, category: 3, name: "千代田航", slot: [21, 9, 6], final: false },
  { id: 106, category: 1, name: "翔鶴", slot: [21, 21, 21, 12], final: false },
  { id: 107, category: 1, name: "瑞鶴", slot: [21, 21, 21, 12], final: false },
  { id: 108, category: 1, name: "瑞鶴改", slot: [24, 24, 24, 12], final: false },
  { id: 112, category: 3, name: "瑞鳳", slot: [18, 9, 3], final: false },
  { id: 113, category: 3, name: "瑞鳳改", slot: [18, 12, 12, 6], final: false },
  { id: 117, category: 5, name: "三隈改", slot: [5, 6, 5, 8], final: true },
  { id: 121, category: 3, name: "千歳航改二", slot: [24, 16, 11, 8], final: true },
  { id: 122, category: 3, name: "千代田航改二", slot: [24, 16, 11, 8], final: true },
  { id: 129, category: 5, name: "鈴谷改", slot: [5, 6, 5, 6], final: false },
  { id: 130, category: 5, name: "熊野改", slot: [5, 6, 5, 6], final: false },
  { id: 136, category: 7, name: "大和改", slot: [7, 7, 7, 7], final: true },
  { id: 148, category: 7, name: "武蔵改", slot: [7, 7, 7, 7], final: false },
  { id: 153, category: 1, name: "大鳳", slot: [18, 18, 18, 7], final: false },
  { id: 155, category: 12, name: "伊401", slot: [3], final: false },
  { id: 156, category: 2, name: "大鳳改", slot: [30, 24, 24, 8], final: true },
  { id: 157, category: 3, name: "龍驤改二", slot: [18, 28, 6, 3], final: true },
  { id: 166, category: 10, name: "あきつ丸改", slot: [8, 8, 8], final: true },
  { id: 184, category: 13, name: "大鯨", slot: [2, 3, 3], final: true },
  { id: 185, category: 3, name: "龍鳳", slot: [18, 7, 6], final: false },
  { id: 188, category: 5, name: "利根改二", slot: [2, 2, 9, 5], final: true },
  { id: 189, category: 5, name: "筑摩改二", slot: [2, 2, 9, 5], final: true },
  { id: 190, category: 3, name: "龍鳳改", slot: [21, 9, 9, 6], final: true },
  { id: 196, category: 1, name: "飛龍改二", slot: [18, 36, 22, 3], final: true },
  { id: 197, category: 1, name: "蒼龍改二", slot: [18, 35, 20, 6], final: true },
  { id: 201, category: 1, name: "雲龍", slot: [18, 24, 3, 6], final: false },
  { id: 202, category: 1, name: "天城", slot: [18, 24, 3, 6], final: false },
  { id: 203, category: 1, name: "葛城", slot: [18, 24, 3, 6], final: false },
  { id: 206, category: 1, name: "雲龍改", slot: [18, 21, 27, 3], final: true },
  { id: 208, category: 3, name: "隼鷹改二", slot: [24, 18, 20, 4], final: true },
  { id: 211, category: 4, name: "扶桑改二", slot: [4, 4, 9, 23], final: true },
  { id: 212, category: 4, name: "山城改二", slot: [4, 4, 9, 23], final: true },
  { id: 229, category: 1, name: "天城改", slot: [18, 21, 27, 3], final: true },
  { id: 230, category: 1, name: "葛城改", slot: [18, 21, 27, 3], final: true },
  { id: 232, category: 1, name: "Graf Zeppelin", slot: [20, 13, 10], final: false },
  { id: 233, category: 1, name: "Saratoga", slot: [27, 19, 19, 15], final: false },
  { id: 238, category: 1, name: "Saratoga改", slot: [36, 18, 18, 18], final: false },
  { id: 244, category: 1, name: "Aquila", slot: [10, 26, 15], final: false },
  { id: 245, category: 6, name: "秋津洲", slot: [1, 1], final: false },
  { id: 246, category: 8, name: "Italia", slot: [3, 3, 3, 3], final: true },
  { id: 247, category: 8, name: "Roma改", slot: [3, 3, 3, 3], final: true },
  { id: 250, category: 6, name: "秋津洲改", slot: [1, 1, 1], final: true },
  { id: 251, category: 6, name: "瑞穂", slot: [12, 12], final: false },
  { id: 260, category: 11, name: "速吸", slot: [6, 1], final: false },
  { id: 261, category: 1, name: "翔鶴改二", slot: [27, 27, 27, 12], final: true },
  { id: 262, category: 1, name: "瑞鶴改二", slot: [28, 26, 26, 13], final: true },
  { id: 266, category: 2, name: "翔鶴改二甲", slot: [34, 21, 12, 9], final: true },
  { id: 267, category: 2, name: "瑞鶴改二甲", slot: [34, 24, 12, 6], final: true },
  { id: 288, category: 15, name: "由良改二", slot: [1, 2, 1], final: true },
  { id: 291, category: 6, name: "Commandant Teste", slot: [12, 7, 7], final: false },
  { id: 293, category: 12, name: "伊400", slot: [3], final: false },
  { id: 294, category: 12, name: "伊13", slot: [2, 0], final: false },
  { id: 295, category: 12, name: "伊14", slot: [2, 0], final: false },
  { id: 296, category: 9, name: "Zara due", slot: [6, 3, 3, 3], final: true },
  { id: 299, category: 6, name: "神威改", slot: [11, 8, 3], final: true },
  { id: 300, category: 11, name: "神威改母", slot: [1, 1, 1], final: true },
  { id: 303, category: 5, name: "鈴谷改二", slot: [3, 3, 7, 11], final: true },
  { id: 304, category: 5, name: "熊野改二", slot: [3, 3, 7, 11], final: true },
  { id: 308, category: 3, name: "鈴谷航改二", slot: [15, 12, 12, 8], final: true },
  { id: 309, category: 3, name: "熊野航改二", slot: [15, 12, 12, 8], final: true },
  { id: 315, category: 1, name: "Ark Royal", slot: [18, 30, 12, 12], final: false },
  { id: 321, category: 3, name: "春日丸", slot: [14, 9], final: false },
  { id: 324, category: 3, name: "神鷹", slot: [9, 18, 6], final: false },
  { id: 326, category: 3, name: "大鷹", slot: [14, 11, 2], final: false },
  { id: 331, category: 3, name: "大鷹改二", slot: [14, 14, 8, 3], final: true },
  { id: 341, category: 7, name: "長門改二", slot: [3, 3, 6, 3], final: true },
  { id: 344, category: 3, name: "Gambier Bay", slot: [16, 12], final: false },
  { id: 345, category: 1, name: "Saratoga Mk.II", slot: [32, 24, 18, 6], final: true },
  { id: 346, category: 7, name: "武蔵改二", slot: [5, 5, 5, 8, 5], final: true },
  { id: 347, category: 15, name: "多摩改二", slot: [1, 1, 1], final: true },
  { id: 349, category: 1, name: "Intrepid", slot: [37, 36, 19, 4], final: false },
  { id: 350, category: 2, name: "Saratoga Mk.II Mod.2", slot: [37, 24, 19, 13], final: true },
  { id: 353, category: 4, name: "伊勢改二", slot: [2, 2, 22, 22, 9], final: true },
  { id: 354, category: 4, name: "日向改二", slot: [2, 4, 22, 11, 11], final: true },
  { id: 355, category: 3, name: "瑞鳳改二", slot: [21, 18, 12, 6], final: true },
  { id: 360, category: 3, name: "瑞鳳改二乙", slot: [18, 15, 15, 2], final: true },
  { id: 373, category: 7, name: "陸奥改二", slot: [2, 3, 3, 7], final: true },
  { id: 374, category: 15, name: "Gotland", slot: [2, 3, 6], final: true },
  { id: 381, category: 6, name: "日進", slot: [8, 8, 12], final: false },
  { id: 386, category: 6, name: "日進甲", slot: [8, 8, 12, 4], final: true },
  { id: 10001, category: 7, name: "長門改", slot: [3, 3, 3, 3], final: false },
  { id: 10002, category: 7, name: "陸奥改", slot: [3, 3, 3, 3], final: false },
  { id: 10006, category: 1, name: "赤城改", slot: [20, 20, 32, 10], final: true },
  { id: 10007, category: 1, name: "加賀改", slot: [20, 20, 46, 12], final: true },
  { id: 10008, category: 1, name: "蒼龍改", slot: [18, 27, 18, 10], final: false },
  { id: 10009, category: 1, name: "飛龍改", slot: [18, 27, 18, 10], final: false },
  { id: 10025, category: 3, name: "鳳翔改", slot: [14, 16, 12], final: true },
  { id: 10026, category: 4, name: "扶桑改", slot: [10, 10, 10, 10], final: false },
  { id: 10027, category: 4, name: "山城改", slot: [10, 10, 10, 10], final: false },
  { id: 10030, category: 3, name: "龍驤改", slot: [9, 24, 5, 5], final: false },
  { id: 10065, category: 3, name: "飛鷹改", slot: [18, 18, 18, 2], final: true },
  { id: 10066, category: 3, name: "隼鷹改", slot: [18, 18, 18, 12], final: false },
  { id: 10094, category: 3, name: "祥鳳改", slot: [18, 12, 12, 6], final: true },
  { id: 10104, category: 3, name: "千歳航改", slot: [24, 16, 8, 8], final: false },
  { id: 10105, category: 3, name: "千代田航改", slot: [24, 16, 8, 8], final: false },
  { id: 10106, category: 1, name: "翔鶴改", slot: [24, 24, 24, 12], final: false },
  { id: 10123, category: 12, name: "伊19改", slot: [1, 1], final: true },
  { id: 10127, category: 12, name: "伊58改", slot: [1, 1], final: true },
  { id: 10128, category: 12, name: "伊8改", slot: [1, 1], final: true },
  { id: 10137, category: 15, name: "阿賀野改", slot: [2, 2, 2], final: true },
  { id: 10138, category: 15, name: "能代改", slot: [2, 2, 2], final: true },
  { id: 10139, category: 15, name: "矢矧改", slot: [2, 2, 2], final: true },
  { id: 10140, category: 15, name: "酒匂改", slot: [2, 2, 2], final: true },
  { id: 10155, category: 12, name: "伊401改", slot: [3, 3], final: true },
  { id: 10232, category: 1, name: "Graf Zeppelin改", slot: [30, 13, 10, 3], final: true },
  { id: 10244, category: 1, name: "Aquila改", slot: [15, 26, 15, 10], final: true },
  { id: 10248, category: 9, name: "Zara改", slot: [2, 2, 2, 2], final: false },
  { id: 10249, category: 9, name: "Pola改", slot: [2, 2, 2, 2], final: true },
  { id: 10251, category: 6, name: "瑞穂改", slot: [12, 12, 8], final: true },
  { id: 10260, category: 11, name: "速吸改", slot: [6, 3, 1], final: true },
  { id: 10283, category: 12, name: "伊26改", slot: [1, 1], final: true },
  { id: 10291, category: 6, name: "Commandant Teste改", slot: [12, 12, 7, 7], final: true },
  { id: 10293, category: 12, name: "伊400改", slot: [3, 3], final: true },
  { id: 10294, category: 12, name: "伊13改", slot: [2, 1], final: true },
  { id: 10295, category: 12, name: "伊14改", slot: [2, 1], final: true },
  { id: 10315, category: 1, name: "Ark Royal改", slot: [24, 30, 12, 12], final: true },
  { id: 10324, category: 3, name: "神鷹改", slot: [9, 18, 6, 3], final: false },
  { id: 10326, category: 3, name: "大鷹改", slot: [14, 14, 5, 3], final: false },
  { id: 10344, category: 3, name: "Gambier Bay改", slot: [16, 12, 6], final: true },
  { id: 10349, category: 1, name: "Intrepid改", slot: [40, 36, 21, 15], final: true },
  { id: 10381, category: 6, name: "日進改", slot: [8, 8, 12], final: false }
]

// 敵艦データ
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
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
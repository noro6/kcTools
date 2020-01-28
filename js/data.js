/*==================================
    ますたでーた
==================================*/
// 制空状態
const AIR_STATUS = [
  { id: 0, name: '制空権確保', abbr: '確保', rate: 10 },
  { id: 1, name: '航空優勢', abbr: '優勢', rate: 8 },
  { id: 2, name: '航空均衡', abbr: '均衡', rate: 6 },
  { id: 3, name: '航空劣勢', abbr: '劣勢', rate: 4 },
  { id: 4, name: '制空権喪失', abbr: '喪失', rate: 1 },
  { id: -1, name: '航空戦なし', abbr: '-', rate: 0 },
];

// セル種別
const CELL_TYPE = { normal: 1, grand: 2, airRaid: 3, night: 4, highAirRaid: 5 };

// 艦戦系
const FIGHTERS = [1, 7, 102, 103];

// 攻撃機系
const ATTACKERS = [2, -2, 3, 6, 9, 101, -101];

// 偵察機
const RECONNAISSANCES = [4, 5, 8, 104];

// 機体カテゴリ
const PLANE_TYPE = [
  { id: 1, name: '艦上戦闘機', abbr: '艦戦', abbr: '艦戦', css: 'css_fighter' },
  { id: -1, name: '夜間戦闘機', abbr: '夜戦', css: 'css_cb_night_aircraft' },
  { id: 2, name: '艦上攻撃機', abbr: '艦攻', css: 'css_torpedo_bomber' },
  { id: -2, name: '夜間攻撃機', abbr: '夜攻', css: 'css_cb_night_aircraft' },
  { id: 3, name: '艦上爆撃機', abbr: '艦爆', css: 'css_dive_bomber' },
  { id: 4, name: '艦上偵察機', abbr: '艦偵', css: 'css_cb_reconnaissance' },
  { id: 5, name: '水上偵察機', abbr: '水偵', css: 'css_sp' },
  { id: 6, name: '水上爆撃機', abbr: '水爆', css: 'css_sp' },
  { id: 7, name: '水上戦闘機', abbr: '水戦', css: 'css_sp' },
  { id: 8, name: '大型飛行艇', abbr: '飛行艇', css: 'css_sp' },
  { id: 9, name: '噴式爆撃機', abbr: '噴式', css: 'css_cb_reconnaissance' },
  { id: 101, name: '陸上攻撃機', abbr: '陸攻', css: 'css_lb_attack_aircraft' },
  { id: -101, name: '対潜哨戒機', abbr: '陸攻', css: 'css_lb_asw_aircraft' },
  { id: 102, name: '陸軍戦闘機', abbr: '陸戦', css: 'css_lb_fighter' },
  { id: 103, name: '局地戦闘機', abbr: '局戦', css: 'css_lb_attack_aircraft' },
  { id: 104, name: '陸上偵察機', abbr: '陸偵', css: 'css_cb_reconnaissance' }
];

// 機体
const PLANE_DATA = [
  { id: 19, type: 1, name: "九六式艦戦", AA: 3, range: 3, IP: 0, AB: 0, imp: true, los: 0, cost: 3, abbr: '', avoid: 0, prio: 99 },
  { id: 20, type: 1, name: "零式艦戦21型", AA: 5, range: 7, IP: 0, AB: 0, imp: true, los: 0, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 21, type: 1, name: "零式艦戦52型", AA: 6, range: 6, IP: 0, AB: 0, imp: true, los: 0, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 22, type: 1, name: "試製烈風 後期型", AA: 10, range: 5, IP: 0, AB: 0, imp: false, los: 0, cost: 7, abbr: '', avoid: 0, prio: 99 },
  { id: 53, type: 1, name: "烈風一一型", AA: 12, range: 5, IP: 0, AB: 0, imp: false, los: 0, cost: 8, abbr: '', avoid: 0, prio: 99 },
  { id: 55, type: 1, name: "紫電改二", AA: 9, range: 3, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 56, type: 1, name: "震電改", AA: 15, range: 2, IP: 0, AB: 0, imp: false, los: 0, cost: 9, abbr: '', avoid: 0, prio: 99 },
  { id: 96, type: 1, name: "零式艦戦21型(熟練)", AA: 8, range: 7, IP: 0, AB: 0, imp: true, los: 1, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 109, type: 1, name: "零式艦戦52型丙(六〇一空)", AA: 9, range: 6, IP: 0, AB: 0, imp: true, los: 0, cost: 5, abbr: '零式艦戦52型丙(601空)', avoid: 0, prio: 99 },
  { id: 110, type: 1, name: "烈風(六〇一空)", AA: 11, range: 5, IP: 0, AB: 0, imp: true, los: 0, cost: 7, abbr: '烈風(601空)', avoid: 0, prio: 99 },
  { id: 152, type: 1, name: "零式艦戦52型(熟練)", AA: 9, range: 6, IP: 0, AB: 0, imp: true, los: 1, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 153, type: 1, name: "零式艦戦52型丙(付岩井小隊)", AA: 10, range: 6, IP: 0, AB: 0, imp: true, los: 1, cost: 5, abbr: '零式艦戦52型丙(岩井小隊)', avoid: 0, prio: 99 },
  { id: 155, type: 1, name: "零式艦戦21型(付岩本小隊)", AA: 9, range: 7, IP: 0, AB: 0, imp: false, los: 1, cost: 4, abbr: '零式艦戦21型(岩本小隊)', avoid: 0, prio: 99 },
  { id: 156, type: 1, name: "零式艦戦52型甲(付岩本小隊)", AA: 11, range: 6, IP: 0, AB: 0, imp: true, los: 1, cost: 5, abbr: '零式艦戦52型甲(岩本小隊)', avoid: 0, prio: 99 },
  { id: 157, type: 1, name: "零式艦戦53型(岩本隊)", AA: 12, range: 6, IP: 0, AB: 0, imp: true, los: 3, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 158, type: 1, name: "Bf109T改", AA: 8, range: 2, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 159, type: 1, name: "Fw190T改", AA: 10, range: 3, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 181, type: 1, name: "零式艦戦32型", AA: 5, range: 5, IP: 0, AB: 0, imp: true, los: 0, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 182, type: 1, name: "零式艦戦32型(熟練)", AA: 8, range: 5, IP: 0, AB: 0, imp: true, los: 0, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 184, type: 1, name: "Re.2001 OR改", AA: 6, range: 4, IP: 0, AB: 0, imp: true, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 189, type: 1, name: "Re.2005 改", AA: 11, range: 3, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 197, type: 1, name: "F4F-3", AA: 4, range: 4, IP: 0, AB: 0, imp: true, los: 0, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 198, type: 1, name: "F4F-4", AA: 5, range: 4, IP: 0, AB: 0, imp: true, los: 1, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 205, type: 1, name: "F6F-3", AA: 8, range: 5, IP: 0, AB: 0, imp: true, los: 1, cost: 8, abbr: '', avoid: 0, prio: 99 },
  { id: 206, type: 1, name: "F6F-5", AA: 10, range: 5, IP: 0, AB: 0, imp: true, los: 1, cost: 8, abbr: '', avoid: 0, prio: 99 },
  { id: 228, type: 1, name: "九六式艦戦改", AA: 4, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 3, abbr: '', avoid: 0, prio: 99 },
  { id: 249, type: 1, name: "Fulmar", AA: 3, range: 4, IP: 0, AB: 0, imp: false, los: 1, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 252, type: 1, name: "Seafire Mk.III改", AA: 9, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 271, type: 1, name: "紫電改四", AA: 10, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 7, abbr: '', avoid: 0, prio: 99 },
  { id: 335, type: 1, name: "烈風改(試製艦載型)", AA: 10, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 10, abbr: '', avoid: 0, prio: 99 },
  { id: 336, type: 1, name: "烈風改二", AA: 13, range: 5, IP: 0, AB: 0, imp: false, los: 0, cost: 10, abbr: '', avoid: 0, prio: 99 },
  { id: 353, type: 1, name: "Fw190 A-5改(熟練)", AA: 11, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 254, type: -1, name: "F6F-3N", AA: 8, range: 5, IP: 0, AB: 0, imp: false, los: 2, cost: 9, abbr: '', avoid: 0, prio: 99 },
  { id: 255, type: -1, name: "F6F-5N", AA: 10, range: 5, IP: 0, AB: 0, imp: false, los: 3, cost: 9, abbr: '', avoid: 0, prio: 99 },
  { id: 338, type: -1, name: "烈風改二戊型", AA: 11, range: 5, IP: 0, AB: 0, imp: false, los: 1, cost: 11, abbr: '', avoid: 0, prio: 99 },
  { id: 339, type: -1, name: "烈風改二戊型(一航戦/熟練)", AA: 12, range: 6, IP: 0, AB: 0, imp: false, los: 1, cost: 11, abbr: '烈風改二戊(一航戦/熟練)', avoid: 0, prio: 99 },
  { id: 16, type: 2, name: "九七式艦攻", AA: 0, range: 4, IP: 0, AB: 0, imp: true, los: 1, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 17, type: 2, name: "天山", AA: 0, range: 5, IP: 0, AB: 0, imp: true, los: 1, cost: 6, abbr: '', avoid: 0, prio: 11 },
  { id: 18, type: 2, name: "流星", AA: 0, range: 6, IP: 0, AB: 0, imp: false, los: 1, cost: 7, abbr: '', avoid: 0, prio: 9 },
  { id: 52, type: 2, name: "流星改", AA: 0, range: 6, IP: 0, AB: 0, imp: false, los: 2, cost: 8, abbr: '', avoid: 0, prio: 8 },
  { id: 82, type: 2, name: "九七式艦攻(九三一空)", AA: 0, range: 4, IP: 0, AB: 0, imp: true, los: 2, cost: 5, abbr: '九七式艦攻(931空)', avoid: 0, prio: 18 },
  { id: 83, type: 2, name: "天山(九三一空)", AA: 0, range: 5, IP: 0, AB: 0, imp: false, los: 2, cost: 6, abbr: '天山(931空)', avoid: 0, prio: 13 },
  { id: 93, type: 2, name: "九七式艦攻(友永隊)", AA: 1, range: 4, IP: 0, AB: 0, imp: false, los: 4, cost: 5, abbr: '', avoid: 1, prio: 5 },
  { id: 94, type: 2, name: "天山一二型(友永隊)", AA: 1, range: 5, IP: 0, AB: 0, imp: false, los: 5, cost: 6, abbr: '', avoid: 1, prio: 2 },
  { id: 98, type: 2, name: "九七式艦攻(熟練)", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 2, cost: 5, abbr: '', avoid: 0, prio: 16 },
  { id: 112, type: 2, name: "天山(六〇一空)", AA: 0, range: 5, IP: 0, AB: 0, imp: false, los: 2, cost: 6, abbr: '天山(601空)', avoid: 0, prio: 10 },
  { id: 113, type: 2, name: "流星(六〇一空)", AA: 0, range: 6, IP: 0, AB: 0, imp: false, los: 3, cost: 7, abbr: '流星(601空)', avoid: 0, prio: 7 },
  { id: 143, type: 2, name: "九七式艦攻(村田隊)", AA: 1, range: 4, IP: 0, AB: 0, imp: false, los: 4, cost: 5, abbr: '', avoid: 1, prio: 6 },
  { id: 144, type: 2, name: "天山一二型(村田隊)", AA: 1, range: 5, IP: 0, AB: 0, imp: false, los: 4, cost: 6, abbr: '', avoid: 1, prio: 1 },
  { id: 188, type: 2, name: "Re.2001 G改", AA: 4, range: 3, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 21 },
  { id: 196, type: 2, name: "TBD", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 2, cost: 6, abbr: '', avoid: 0, prio: 19 },
  { id: 242, type: 2, name: "Swordfish", AA: 0, range: 3, IP: 0, AB: 0, imp: false, los: 1, cost: 3, abbr: '', avoid: 0, prio: 22 },
  { id: 243, type: 2, name: "Swordfish Mk.II(熟練)", AA: 0, range: 3, IP: 0, AB: 0, imp: false, los: 2, cost: 3, abbr: '', avoid: 0, prio: 20 },
  { id: 244, type: 2, name: "Swordfish Mk.III(熟練)", AA: 0, range: 3, IP: 0, AB: 0, imp: false, los: 5, cost: 4, abbr: '', avoid: 0, prio: 14 },
  { id: 256, type: 2, name: "TBF", AA: 1, range: 6, IP: 0, AB: 0, imp: false, los: 2, cost: 10, abbr: '', avoid: 0, prio: 13 },
  { id: 302, type: 2, name: "九七式艦攻(九三一空/熟練)", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 3, cost: 5, abbr: '九七式艦攻(931空/熟練)', avoid: 0, prio: 15 },
  { id: 342, type: 2, name: "流星改(一航戦)", AA: 2, range: 6, IP: 0, AB: 0, imp: false, los: 4, cost: 9, abbr: '', avoid: 0, prio: 4 },
  { id: 343, type: 2, name: "流星改(一航戦/熟練)", AA: 3, range: 6, IP: 0, AB: 0, imp: false, los: 6, cost: 9, abbr: '', avoid: 0, prio: 3 },
  { id: 257, type: -2, name: "TBM-3D", AA: 1, range: 6, IP: 0, AB: 0, imp: false, los: 4, cost: 11, abbr: '', avoid: 0, prio: 11 },
  { id: 344, type: -2, name: "九七式艦攻改 試製三号戊型(空六号電探改装備機)", AA: 0, range: 4, IP: 0, AB: 0, imp: true, los: 4, cost: 6, abbr: '97艦攻改 試製3号戊型', avoid: 0, prio: 17 },
  { id: 345, type: -2, name: "九七式艦攻改(熟練) 試製三号戊型(空六号電探改装備機)", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 5, cost: 6, abbr: '97艦攻改(熟練) 試製3号戊型', avoid: 0, prio: 12 },
  { id: 23, type: 3, name: "九九式艦爆", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 24, type: 3, name: "彗星", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 5, abbr: '', avoid: 0, prio: 17 },
  { id: 57, type: 3, name: "彗星一二型甲", AA: 0, range: 5, IP: 0, AB: 0, imp: false, los: 1, cost: 6, abbr: '', avoid: 0, prio: 12 },
  { id: 60, type: 3, name: "零式艦戦62型(爆戦)", AA: 4, range: 4, IP: 0, AB: 0, imp: true, los: 0, cost: 5, abbr: '', avoid: 0, prio: 14 },
  { id: 64, type: 3, name: "Ju87C改", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 16 },
  { id: 97, type: 3, name: "九九式艦爆(熟練)", AA: 1, range: 4, IP: 0, AB: 0, imp: false, los: 2, cost: 4, abbr: '', avoid: 0, prio: 18 },
  { id: 99, type: 3, name: "九九式艦爆(江草隊)", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 3, cost: 4, abbr: '', avoid: 1, prio: 10 },
  { id: 100, type: 3, name: "彗星(江草隊)", AA: 1, range: 5, IP: 0, AB: 0, imp: false, los: 4, cost: 5, abbr: '', avoid: 2, prio: 1 },
  { id: 111, type: 3, name: "彗星(六〇一空)", AA: 0, range: 5, IP: 0, AB: 0, imp: false, los: 1, cost: 5, abbr: '彗星(601空)', avoid: 0, prio: 9 },
  { id: 148, type: 3, name: "試製南山", AA: 1, range: 5, IP: 0, AB: 0, imp: false, los: 2, cost: 9, abbr: '', avoid: 0, prio: 6 },
  { id: 154, type: 3, name: "零式艦戦62型(爆戦/岩井隊)", AA: 7, range: 5, IP: 0, AB: 0, imp: true, los: 1, cost: 5, abbr: '', avoid: 2, prio: 4 },
  { id: 195, type: 3, name: "SBD", AA: 2, range: 4, IP: 0, AB: 0, imp: false, los: 2, cost: 5, abbr: '', avoid: 0, prio: 20 },
  { id: 219, type: 3, name: "零式艦戦63型(爆戦)", AA: 5, range: 4, IP: 0, AB: 0, imp: true, los: 0, cost: 6, abbr: '', avoid: 0, prio: 13 },
  { id: 233, type: 3, name: "F4U-1D", AA: 7, range: 6, IP: 0, AB: 0, imp: false, los: 1, cost: 9, abbr: '', avoid: 0, prio: 5 },
  { id: 248, type: 3, name: "Skua", AA: 2, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 4, abbr: '', avoid: 0, prio: 21 },
  { id: 277, type: 3, name: "FM-2", AA: 6, range: 4, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 22 },
  { id: 291, type: 3, name: "彗星二二型(六三四空)", AA: 1, range: 5, IP: 0, AB: 0, imp: false, los: 0, cost: 5, abbr: '彗星二二型(634空)', avoid: 0, prio: 8 },
  { id: 292, type: 3, name: "彗星二二型(六三四空/熟練)", AA: 2, range: 6, IP: 0, AB: 0, imp: false, los: 2, cost: 5, abbr: '彗星二二型(634空/熟練)', avoid: 0, prio: 2 },
  { id: 305, type: 3, name: "Ju87C改二(KMX搭載機)", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 2, cost: 8, abbr: '', avoid: 0, prio: 15 },
  { id: 306, type: 3, name: "Ju87C改二(KMX搭載機/熟練)", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 2, cost: 8, abbr: '', avoid: 0, prio: 11 },
  { id: 316, type: 3, name: "Re.2001 CB改", AA: 4, range: 3, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 19 },
  { id: 319, type: 3, name: "彗星一二型(六三四空/三号爆弾搭載機)", AA: 3, range: 5, IP: 0, AB: 0, imp: false, los: 0, cost: 5, abbr: '彗星12型(634空/3号爆弾)', avoid: 1, prio: 7 },
  { id: 320, type: 3, name: "彗星一二型(三一号光電管爆弾搭載機)", AA: 0, range: 5, IP: 0, AB: 0, imp: false, los: 0, cost: 6, abbr: '彗星12型(31号光電管爆弾)', avoid: 1, prio: 3 },
  { id: 54, type: 4, name: "彩雲", AA: 0, range: 8, IP: 0, AB: 0, imp: true, los: 9, cost: 9, abbr: '', avoid: 0, prio: 1 },
  { id: 61, type: 4, name: "二式艦上偵察機", AA: 1, range: 5, IP: 0, AB: 0, imp: true, los: 7, cost: 6, abbr: '', avoid: 0, prio: 6 },
  { id: 151, type: 4, name: "試製景雲(艦偵型)", AA: 0, range: 8, IP: 0, AB: 0, imp: true, los: 11, cost: 12, abbr: '', avoid: 0, prio: 4 },
  { id: 212, type: 4, name: "彩雲(東カロリン空)", AA: 0, range: 8, IP: 0, AB: 0, imp: false, los: 10, cost: 9, abbr: '', avoid: 0, prio: 3 },
  { id: 273, type: 4, name: "彩雲(偵四)", AA: 2, range: 7, IP: 0, AB: 0, imp: false, los: 10, cost: 9, abbr: '', avoid: 0, prio: 2 },
  { id: 25, type: 5, name: "零式水上偵察機", AA: 1, range: 7, IP: 0, AB: 0, imp: true, los: 5, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 59, type: 5, name: "零式水上観測機", AA: 2, range: 3, IP: 0, AB: 0, imp: false, los: 6, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 102, type: 5, name: "九八式水上偵察機(夜偵)", AA: 0, range: 6, IP: 0, AB: 0, imp: true, los: 3, cost: 8, abbr: '', avoid: 0, prio: 99 },
  { id: 115, type: 5, name: "Ar196改", AA: 1, range: 3, IP: 0, AB: 0, imp: false, los: 5, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 118, type: 5, name: "紫雲", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 8, cost: 9, abbr: '', avoid: 0, prio: 99 },
  { id: 163, type: 5, name: "Ro.43水偵", AA: 1, range: 3, IP: 0, AB: 0, imp: true, los: 4, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 171, type: 5, name: "OS2U", AA: 1, range: 3, IP: 0, AB: 0, imp: false, los: 6, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 238, type: 5, name: "零式水上偵察機11型乙", AA: 1, range: 7, IP: 0, AB: 0, imp: false, los: 6, cost: 5, abbr: '零式水偵11型乙', avoid: 0, prio: 99 },
  { id: 239, type: 5, name: "零式水上偵察機11型乙(熟練)", AA: 1, range: 7, IP: 0, AB: 0, imp: false, los: 8, cost: 5, abbr: '零式水偵11型乙(熟練)', avoid: 0, prio: 99 },
  { id: 304, type: 5, name: "S9 Osprey", AA: 1, range: 3, IP: 0, AB: 0, imp: false, los: 4, cost: 3, abbr: '', avoid: 0, prio: 99 },
  { id: 26, type: 6, name: "瑞雲", AA: 2, range: 5, IP: 0, AB: 0, imp: true, los: 6, cost: 6, abbr: '', avoid: 0, prio: 9 },
  { id: 62, type: 6, name: "試製晴嵐", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 6, cost: 10, abbr: '', avoid: 0, prio: 5 },
  { id: 79, type: 6, name: "瑞雲(六三四空)", AA: 2, range: 5, IP: 0, AB: 0, imp: true, los: 6, cost: 6, abbr: '瑞雲(634空)', avoid: 1, prio: 8 },
  { id: 80, type: 6, name: "瑞雲12型", AA: 3, range: 5, IP: 0, AB: 0, imp: false, los: 6, cost: 7, abbr: '', avoid: 1, prio: 7 },
  { id: 81, type: 6, name: "瑞雲12型(六三四空)", AA: 3, range: 5, IP: 0, AB: 0, imp: false, los: 7, cost: 7, abbr: '', avoid: 2, prio: 6 },
  { id: 194, type: 6, name: "Laté 298B", AA: 1, range: 4, IP: 0, AB: 0, imp: false, los: 4, cost: 7, abbr: '', avoid: 0, prio: 99 },
  { id: 207, type: 6, name: "瑞雲(六三一空)", AA: 1, range: 5, IP: 0, AB: 0, imp: false, los: 4, cost: 6, abbr: '瑞雲(631空)', avoid: 0, prio: 99 },
  { id: 208, type: 6, name: "晴嵐(六三一空)", AA: 0, range: 4, IP: 0, AB: 0, imp: false, los: 6, cost: 10, abbr: '晴嵐(631空)', avoid: 0, prio: 4 },
  { id: 237, type: 6, name: "瑞雲(六三四空/熟練)", AA: 4, range: 5, IP: 0, AB: 0, imp: true, los: 7, cost: 6, abbr: '瑞雲(634空/熟練)', avoid: 2, prio: 3 },
  { id: 322, type: 6, name: "瑞雲改二(六三四空)", AA: 4, range: 5, IP: 0, AB: 0, imp: true, los: 7, cost: 8, abbr: '瑞雲改二(634空)', avoid: 3, prio: 2 },
  { id: 323, type: 6, name: "瑞雲改二(六三四空/熟練)", AA: 5, range: 5, IP: 0, AB: 0, imp: false, los: 8, cost: 8, abbr: '瑞雲改二(634空/熟練)', avoid: 4, prio: 1 },
  { id: 164, type: 7, name: "Ro.44水上戦闘機", AA: 2, range: 3, IP: 0, AB: 0, imp: true, los: 2, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 165, type: 7, name: "二式水戦改", AA: 3, range: 4, IP: 0, AB: 0, imp: true, los: 1, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 215, type: 7, name: "Ro.44水上戦闘機bis", AA: 3, range: 3, IP: 0, AB: 0, imp: true, los: 3, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 216, type: 7, name: "二式水戦改(熟練)", AA: 5, range: 4, IP: 0, AB: 0, imp: true, los: 1, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 217, type: 7, name: "強風改", AA: 5, range: 3, IP: 0, AB: 0, imp: true, los: 1, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 138, type: 8, name: "二式大艇", AA: 0, range: 20, IP: 0, AB: 0, imp: false, los: 12, cost: 25, abbr: '', avoid: 0, prio: 99 },
  { id: 178, type: 8, name: "PBY-5A Catalina", AA: 0, range: 10, IP: 0, AB: 0, imp: false, los: 9, cost: 13, abbr: '', avoid: 0, prio: 99 },
  { id: 199, type: 9, name: "噴式景雲改", AA: 6, range: 3, IP: 0, AB: 0, imp: false, los: 3, cost: 14, abbr: '', avoid: 3, prio: 99 },
  { id: 200, type: 9, name: "橘花改", AA: 12, range: 2, IP: 0, AB: 0, imp: false, los: 0, cost: 13, abbr: '', avoid: 4, prio: 99 },
  { id: 168, type: 101, name: "九六式陸攻", AA: 1, range: 8, IP: 0, AB: 0, imp: false, los: 2, cost: 10, abbr: '', avoid: 0, prio: 6 },
  { id: 169, type: 101, name: "一式陸攻", AA: 2, range: 9, IP: 0, AB: 0, imp: false, los: 3, cost: 12, abbr: '', avoid: 0, prio: 5 },
  { id: 170, type: 101, name: "一式陸攻(野中隊)", AA: 3, range: 9, IP: 0, AB: 0, imp: true, los: 4, cost: 12, abbr: '', avoid: 1, prio: 2 },
  { id: 180, type: 101, name: "一式陸攻 二二型甲", AA: 3, range: 10, IP: 0, AB: 0, imp: false, los: 4, cost: 12, abbr: '', avoid: 0, prio: 4 },
  { id: 186, type: 101, name: "一式陸攻 三四型", AA: 4, range: 8, IP: 0, AB: 0, imp: true, los: 4, cost: 12, abbr: '', avoid: 0, prio: 1 },
  { id: 187, type: 101, name: "銀河", AA: 3, range: 9, IP: 0, AB: 0, imp: true, los: 3, cost: 13, abbr: '', avoid: 0, prio: 3 },
  { id: 224, type: 101, name: "爆装一式戦 隼III型改(65戦隊)", AA: 6, range: 5, IP: 0, AB: 0, imp: false, los: 1, cost: 4, abbr: '爆装一式戦(65戦隊)', avoid: 0, prio: 99 },
  { id: 269, type: -101, name: "試製東海", AA: 0, range: 8, IP: 0, AB: 0, imp: false, los: 5, cost: 9, abbr: '', avoid: 0, prio: 99 },
  { id: 270, type: -101, name: "東海(九〇一空)", AA: 0, range: 8, IP: 0, AB: 0, imp: false, los: 6, cost: 9, abbr: '', avoid: 0, prio: 99 },
  { id: 176, type: 102, name: "三式戦 飛燕", AA: 8, range: 3, IP: 3, AB: 1, imp: true, los: 0, cost: 7, abbr: '', avoid: 0, prio: 99 },
  { id: 177, type: 102, name: "三式戦 飛燕(飛行第244戦隊)", AA: 9, range: 4, IP: 4, AB: 3, imp: true, los: 0, cost: 7, abbr: '三式戦 飛燕(第244戦隊)', avoid: 0, prio: 99 },
  { id: 185, type: 102, name: "三式戦 飛燕一型丁(キ61-I 丁)", AA: 9, range: 4, IP: 3, AB: 2, imp: true, los: 0, cost: 7, abbr: '三式戦 飛燕一型丁', avoid: 0, prio: 99 },
  { id: 218, type: 102, name: "四式戦 疾風", AA: 10, range: 5, IP: 1, AB: 1, imp: false, los: 0, cost: 7, abbr: '', avoid: 0, prio: 99 },
  { id: 221, type: 102, name: "一式戦 隼II型", AA: 6, range: 6, IP: 2, AB: 0, imp: true, los: 0, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 222, type: 102, name: "一式戦 隼III型甲", AA: 7, range: 6, IP: 3, AB: 1, imp: true, los: 0, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 223, type: 102, name: "一式戦 隼III型甲(54戦隊)", AA: 8, range: 7, IP: 3, AB: 1, imp: false, los: 1, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 225, type: 102, name: "一式戦 隼II型(64戦隊)", AA: 11, range: 7, IP: 5, AB: 1, imp: false, los: 1, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 250, type: 102, name: "Spitfire Mk.I", AA: 7, range: 4, IP: 1, AB: 2, imp: true, los: 0, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 251, type: 102, name: "Spitfire Mk.V", AA: 9, range: 5, IP: 2, AB: 3, imp: false, los: 0, cost: 5, abbr: '', avoid: 0, prio: 99 },
  { id: 253, type: 102, name: "Spitfire Mk.IX(熟練)", AA: 10, range: 4, IP: 4, AB: 2, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 175, type: 103, name: "雷電", AA: 6, range: 2, IP: 2, AB: 5, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 201, type: 103, name: "紫電一一型", AA: 8, range: 3, IP: 1, AB: 1, imp: true, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 202, type: 103, name: "紫電二一型 紫電改", AA: 9, range: 4, IP: 3, AB: 1, imp: false, los: 0, cost: 6, abbr: '', avoid: 0, prio: 99 },
  { id: 263, type: 103, name: "紫電改(三四三空) 戦闘301", AA: 11, range: 4, IP: 4, AB: 2, imp: false, los: 0, cost: 6, abbr: '紫電改(343空) 戦闘301', avoid: 0, prio: 99 },
  { id: 333, type: 103, name: "烈風改", AA: 10, range: 4, IP: 2, AB: 6, imp: false, los: 0, cost: 9, abbr: '', avoid: 0, prio: 99 },
  { id: 334, type: 103, name: "烈風改(三五二空/熟練)", AA: 11, range: 4, IP: 3, AB: 7, imp: false, los: 0, cost: 9, abbr: '烈風改(352空/熟練)', avoid: 0, prio: 99 },
  { id: 350, type: 103, name: "Me163B", AA: 2, range: 1, IP: 0, AB: 9, imp: false, los: 0, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 351, type: 103, name: "試製 秋水", AA: 2, range: 1, IP: 0, AB: 8, imp: false, los: 0, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 352, type: 103, name: "秋水", AA: 3, range: 1, IP: 0, AB: 9, imp: false, los: 0, cost: 4, abbr: '', avoid: 0, prio: 99 },
  { id: 354, type: 103, name: "Fw190 D-9", AA: 12, range: 3, IP: 3, AB: 3, imp: false, los: 0, cost: 8, abbr: '', avoid: 0, prio: 99 },
  { id: 311, type: 104, name: "二式陸上偵察機", AA: 3, range: 8, IP: 0, AB: 0, imp: false, los: 8, cost: 7, abbr: '', avoid: 0, prio: 7 },
  { id: 312, type: 104, name: "二式陸上偵察機(熟練)", AA: 3, range: 9, IP: 0, AB: 0, imp: false, los: 9, cost: 7, abbr: '', avoid: 0, prio: 5 }
];

// 艦種リスト
const SHIP_TYPE = [
  { id: 1, name: '正規空母' },
  { id: 2, name: '装甲空母' },
  { id: 3, name: '軽空母' },
  { id: 4, name: '航空戦艦' },
  { id: 5, name: '航空巡洋艦' },
  { id: 6, name: '水上機母艦' },
  { id: 7, name: '戦艦' },
  { id: 8, name: '高速戦艦' },
  { id: 9, name: '重巡洋艦' },
  { id: 10, name: '揚陸艦' },
  { id: 11, name: '補給艦' },
  { id: 12, name: '潜水空母' },
  { id: 13, name: '潜水母艦' },
  { id: 14, name: '軽巡洋艦' },
  { id: 15, name: '駆逐艦' },
  { id: 16, name: '重雷装巡洋艦' },
  { id: 17, name: '練習巡洋艦' },
  { id: 18, name: '潜水艦' },
  { id: 19, name: '海防艦' },
  { id: 20, name: '工作艦' },
];

// 艦種毎装備可能カテゴリ(最低限)
const LINK_SHIP_EQUIPMENT = [
  { type: 1, e_type: [1, 2, 3, 4] },
  { type: 2, e_type: [1, 2, 3, 4] },
  { type: 3, e_type: [1, 2, 3, 4] },
  { type: 4, e_type: [5, 6, 7] },
  { type: 5, e_type: [5, 6, 7] },
  { type: 6, e_type: [5, 6, 7] },
  { type: 7, e_type: [5] },
  { type: 8, e_type: [5] },
  { type: 9, e_type: [5, 6, 7] },
  { type: 10, e_type: [] },
  { type: 11, e_type: [5, 6, 7] },
  { type: 12, e_type: [5, 6, 7] },
  { type: 13, e_type: [5, 7] },
  { type: 14, e_type: [5] }
];

// 特定の艦娘が特別に装備できるやつ
const SPECIAL_LINK_SHIP_EQUIPMENT = [
  // 速吸改に 艦攻
  { shipId: 1432, equipmentTypes: [2], equipmentIds: [] },
  // 秋津洲(改)に 大型飛行艇
  { shipId: 245, equipmentTypes: [8], equipmentIds: [] },
  { shipId: 250, equipmentTypes: [8], equipmentIds: [] },
  // 神威改母に 大型飛行艇
  { shipId: 300, equipmentTypes: [8], equipmentIds: [] },
  // 日進改以降に 大型飛行艇
  { shipId: 1490, equipmentTypes: [8], equipmentIds: [] },
  { shipId: 386, equipmentTypes: [8], equipmentIds: [] },
  // 装甲空母に 試製景雲
  { shipId: 153, equipmentTypes: [], equipmentIds: [151] },
  { shipId: 156, equipmentTypes: [], equipmentIds: [151] },
  { shipId: 350, equipmentTypes: [], equipmentIds: [151] },
  // 翔鶴型改二甲に 噴式機
  { shipId: 266, equipmentTypes: [9], equipmentIds: [151] },
  { shipId: 267, equipmentTypes: [9], equipmentIds: [151] },
  // 伊勢型改二に 艦戦 艦爆 艦偵
  { shipId: 353, equipmentTypes: [1, 3, 4], equipmentIds: [] },
  { shipId: 354, equipmentTypes: [1, 3, 4], equipmentIds: [] },
  // 長門型改以降に 水戦
  { shipId: 341, equipmentTypes: [7], equipmentIds: [] },
  { shipId: 373, equipmentTypes: [7], equipmentIds: [] },
  { shipId: 1376, equipmentTypes: [7], equipmentIds: [] },
  { shipId: 1376, equipmentTypes: [7], equipmentIds: [] },
  // 大和型改以降に 水戦
  { shipId: 136, equipmentTypes: [7], equipmentIds: [] },
  { shipId: 148, equipmentTypes: [7], equipmentIds: [] },
  { shipId: 346, equipmentTypes: [7], equipmentIds: [] },
  // イタリア戦艦改に 水爆 水戦
  { shipId: 246, equipmentTypes: [6, 7], equipmentIds: [] },
  { shipId: 247, equipmentTypes: [6, 7], equipmentIds: [] },
  // イタリア重巡改以降に 水爆 水戦
  { shipId: 1438, equipmentTypes: [6, 7], equipmentIds: [] },
  { shipId: 1441, equipmentTypes: [6, 7], equipmentIds: [] },
  { shipId: 296, equipmentTypes: [6, 7], equipmentIds: [] },
  // 金剛改二丙に 水爆
  { shipId: 391, equipmentTypes: [6], equipmentIds: [] },
  // 由良改二に 水爆 水戦
  { shipId: 288, equipmentTypes: [6, 7], equipmentIds: [] },
  // 多摩改二に 水爆 水戦
  { shipId: 347, equipmentTypes: [6, 7], equipmentIds: [] },
  // 阿賀野型改に 水爆
  { shipId: 1401, equipmentTypes: [6], equipmentIds: [] },
  { shipId: 1402, equipmentTypes: [6], equipmentIds: [] },
  { shipId: 1403, equipmentTypes: [6], equipmentIds: [] },
  { shipId: 1410, equipmentTypes: [6], equipmentIds: [] },
  // Gotlandに 水爆
  { shipId: 374, equipmentTypes: [6], equipmentIds: [] },
  { shipId: 379, equipmentTypes: [6], equipmentIds: [] },
  // あきつ丸に 艦戦
  { shipId: 166, equipmentTypes: [1], equipmentIds: [] },
  // 神州丸に 水戦 水偵
  { shipId: 421, equipmentTypes: [5, 7], equipmentIds: [] },
  { shipId: 426, equipmentTypes: [5, 7], equipmentIds: [] },
];

// 艦娘
const SHIP_DATA = [
  { id: 6, type: 1, name: "赤城", slot: [18, 18, 27, 10], final: 0, orig: 6, deckid: 83 },
  { id: 7, type: 1, name: "加賀", slot: [18, 18, 45, 12], final: 0, orig: 7, deckid: 84 },
  { id: 8, type: 1, name: "蒼龍", slot: [12, 27, 18, 7], final: 0, orig: 8, deckid: 90 },
  { id: 9, type: 1, name: "飛龍", slot: [12, 27, 18, 7], final: 0, orig: 9, deckid: 91 },
  { id: 25, type: 3, name: "鳳翔", slot: [8, 11], final: 0, orig: 25, deckid: 89 },
  { id: 30, type: 3, name: "龍驤", slot: [9, 24, 5], final: 0, orig: 30, deckid: 76 },
  { id: 49, type: 6, name: "千歳", slot: [12, 12], final: 0, orig: 49, deckid: 102 },
  { id: 50, type: 6, name: "千代田", slot: [12, 12], final: 0, orig: 50, deckid: 103 },
  { id: 65, type: 3, name: "飛鷹", slot: [12, 18, 18, 10], final: 0, orig: 65, deckid: 75 },
  { id: 66, type: 3, name: "隼鷹", slot: [12, 18, 18, 10], final: 0, orig: 66, deckid: 92 },
  { id: 94, type: 3, name: "祥鳳", slot: [18, 9, 3], final: 0, orig: 94, deckid: 74 },
  { id: 95, type: 6, name: "千歳改", slot: [12, 6, 6], final: 0, orig: 49, deckid: 104 },
  { id: 96, type: 6, name: "千代田改", slot: [12, 6, 6], final: 0, orig: 50, deckid: 105 },
  { id: 99, type: 6, name: "千歳甲", slot: [12, 6, 6], final: 1, orig: 49, deckid: 106 },
  { id: 100, type: 6, name: "千代田甲", slot: [12, 6, 6], final: 1, orig: 50, deckid: 107 },
  { id: 101, type: 5, name: "最上改", slot: [5, 6, 5, 11], final: 1, orig: 51, deckid: 73 },
  { id: 102, type: 4, name: "伊勢改", slot: [11, 11, 11, 14], final: 0, orig: 3, deckid: 82 },
  { id: 103, type: 4, name: "日向改", slot: [11, 11, 11, 14], final: 0, orig: 4, deckid: 88 },
  { id: 104, type: 3, name: "千歳航", slot: [21, 9, 6], final: 0, orig: 49, deckid: 108 },
  { id: 105, type: 3, name: "千代田航", slot: [21, 9, 6], final: 0, orig: 50, deckid: 109 },
  { id: 106, type: 1, name: "翔鶴", slot: [21, 21, 21, 12], final: 0, orig: 106, deckid: 110 },
  { id: 107, type: 1, name: "瑞鶴", slot: [21, 21, 21, 12], final: 0, orig: 107, deckid: 111 },
  { id: 108, type: 1, name: "瑞鶴改", slot: [24, 24, 24, 12], final: 0, orig: 106, deckid: 112 },
  { id: 112, type: 3, name: "瑞鳳", slot: [18, 9, 3], final: 0, orig: 112, deckid: 116 },
  { id: 113, type: 3, name: "瑞鳳改", slot: [18, 12, 12, 6], final: 0, orig: 112, deckid: 117 },
  { id: 117, type: 5, name: "三隈改", slot: [5, 6, 5, 8], final: 1, orig: 116, deckid: 121 },
  { id: 121, type: 3, name: "千歳航改二", slot: [24, 16, 11, 8], final: 1, orig: 49, deckid: 296 },
  { id: 122, type: 3, name: "千代田航改二", slot: [24, 16, 11, 8], final: 1, orig: 50, deckid: 297 },
  { id: 129, type: 5, name: "鈴谷改", slot: [5, 6, 5, 6], final: 0, orig: 124, deckid: 129 },
  { id: 130, type: 5, name: "熊野改", slot: [5, 6, 5, 6], final: 0, orig: 125, deckid: 130 },
  { id: 136, type: 7, name: "大和改", slot: [7, 7, 7, 7], final: 1, orig: 131, deckid: 136 },
  { id: 148, type: 7, name: "武蔵改", slot: [7, 7, 7, 7], final: 0, orig: 143, deckid: 148 },
  { id: 153, type: 2, name: "大鳳", slot: [18, 18, 18, 7], final: 0, orig: 153, deckid: 153 },
  { id: 155, type: 12, name: "伊401", slot: [3], final: 0, orig: 155, deckid: 155 },
  { id: 156, type: 2, name: "大鳳改", slot: [30, 24, 24, 8], final: 1, orig: 153, deckid: 156 },
  { id: 157, type: 3, name: "龍驤改二", slot: [18, 28, 6, 3], final: 1, orig: 30, deckid: 157 },
  { id: 166, type: 10, name: "あきつ丸改", slot: [8, 8, 8], final: 1, orig: 161, deckid: 166 },
  { id: 184, type: 13, name: "大鯨", slot: [2, 3, 3], final: 1, orig: 184, deckid: 184 },
  { id: 185, type: 3, name: "龍鳳", slot: [18, 7, 6], final: 0, orig: 184, deckid: 185 },
  { id: 188, type: 5, name: "利根改二", slot: [2, 2, 9, 5], final: 1, orig: 63, deckid: 188 },
  { id: 189, type: 5, name: "筑摩改二", slot: [2, 2, 9, 5], final: 1, orig: 64, deckid: 189 },
  { id: 190, type: 3, name: "龍鳳改", slot: [21, 9, 9, 6], final: 1, orig: 184, deckid: 318 },
  { id: 196, type: 1, name: "飛龍改二", slot: [18, 36, 22, 3], final: 1, orig: 9, deckid: 196 },
  { id: 197, type: 1, name: "蒼龍改二", slot: [18, 35, 20, 6], final: 1, orig: 8, deckid: 197 },
  { id: 201, type: 1, name: "雲龍", slot: [18, 24, 3, 6], final: 0, orig: 201, deckid: 404 },
  { id: 202, type: 1, name: "天城", slot: [18, 24, 3, 6], final: 0, orig: 202, deckid: 331 },
  { id: 203, type: 1, name: "葛城", slot: [18, 24, 3, 6], final: 0, orig: 203, deckid: 332 },
  { id: 206, type: 1, name: "雲龍改", slot: [18, 21, 27, 3], final: 1, orig: 201, deckid: 406 },
  { id: 208, type: 3, name: "隼鷹改二", slot: [24, 18, 20, 4], final: 1, orig: 66, deckid: 408 },
  { id: 211, type: 4, name: "扶桑改二", slot: [4, 4, 9, 23], final: 1, orig: 26, deckid: 411 },
  { id: 212, type: 4, name: "山城改二", slot: [4, 4, 9, 23], final: 1, orig: 27, deckid: 412 },
  { id: 229, type: 1, name: "天城改", slot: [18, 21, 27, 3], final: 1, orig: 202, deckid: 429 },
  { id: 230, type: 1, name: "葛城改", slot: [18, 21, 27, 3], final: 1, orig: 203, deckid: 430 },
  { id: 232, type: 1, name: "Graf Zeppelin", slot: [20, 13, 10], final: 0, orig: 232, deckid: 432 },
  { id: 233, type: 1, name: "Saratoga", slot: [27, 19, 19, 15], final: 0, orig: 233, deckid: 433 },
  { id: 238, type: 1, name: "Saratoga改", slot: [36, 18, 18, 18], final: 0, orig: 233, deckid: 438 },
  { id: 244, type: 1, name: "Aquila", slot: [10, 26, 15], final: 0, orig: 244, deckid: 444 },
  { id: 245, type: 6, name: "秋津洲", slot: [1, 1], final: 0, orig: 245, deckid: 445 },
  { id: 246, type: 8, name: "Italia", slot: [3, 3, 3, 3], final: 1, orig: 241, deckid: 446 },
  { id: 247, type: 8, name: "Roma改", slot: [3, 3, 3, 3], final: 1, orig: 242, deckid: 447 },
  { id: 250, type: 6, name: "秋津洲改", slot: [1, 1, 1], final: 1, orig: 245, deckid: 450 },
  { id: 251, type: 6, name: "瑞穂", slot: [12, 12], final: 0, orig: 251, deckid: 451 },
  { id: 260, type: 11, name: "速吸", slot: [6, 1], final: 0, orig: 260, deckid: 460 },
  { id: 261, type: 1, name: "翔鶴改二", slot: [27, 27, 27, 12], final: 1, orig: 106, deckid: 461 },
  { id: 262, type: 1, name: "瑞鶴改二", slot: [28, 26, 26, 13], final: 1, orig: 107, deckid: 462 },
  { id: 266, type: 2, name: "翔鶴改二甲", slot: [34, 21, 12, 9], final: 1, orig: 106, deckid: 466 },
  { id: 267, type: 2, name: "瑞鶴改二甲", slot: [34, 24, 12, 6], final: 1, orig: 107, deckid: 467 },
  { id: 288, type: 14, name: "由良改二", slot: [1, 2, 1], final: 1, orig: 45, deckid: 488 },
  { id: 291, type: 6, name: "Commandant Teste", slot: [12, 7, 7], final: 0, orig: 291, deckid: 491 },
  { id: 293, type: 12, name: "伊400", slot: [3], final: 0, orig: 293, deckid: 493 },
  { id: 294, type: 12, name: "伊13", slot: [2, 0], final: 0, orig: 294, deckid: 494 },
  { id: 295, type: 12, name: "伊14", slot: [2, 0], final: 0, orig: 295, deckid: 495 },
  { id: 296, type: 9, name: "Zara due", slot: [6, 3, 3, 3], final: 1, orig: 248, deckid: 496 },
  { id: 299, type: 6, name: "神威改", slot: [11, 8, 3], final: 1, orig: 299, deckid: 499 },
  { id: 300, type: 11, name: "神威改母", slot: [1, 1, 1], final: 1, orig: 299, deckid: 500 },
  { id: 303, type: 5, name: "鈴谷改二", slot: [3, 3, 7, 11], final: 1, orig: 124, deckid: 503 },
  { id: 304, type: 5, name: "熊野改二", slot: [3, 3, 7, 11], final: 1, orig: 125, deckid: 504 },
  { id: 308, type: 3, name: "鈴谷航改二", slot: [15, 12, 12, 8], final: 1, orig: 124, deckid: 508 },
  { id: 309, type: 3, name: "熊野航改二", slot: [15, 12, 12, 8], final: 1, orig: 125, deckid: 509 },
  { id: 315, type: 1, name: "Ark Royal", slot: [18, 30, 12, 12], final: 0, orig: 315, deckid: 515 },
  { id: 321, type: 3, name: "春日丸", slot: [14, 9], final: 0, orig: 321, deckid: 521 },
  { id: 324, type: 3, name: "神鷹", slot: [9, 18, 6], final: 0, orig: 324, deckid: 534 },
  { id: 326, type: 3, name: "大鷹", slot: [14, 11, 2], final: 0, orig: 321, deckid: 526 },
  { id: 331, type: 3, name: "大鷹改二", slot: [14, 14, 8, 3], final: 1, orig: 321, deckid: 529 },
  { id: 336, type: 3, name: "神鷹改二", slot: [9, 18, 18, 6], final: 1, orig: 324, deckid: 536 },
  { id: 341, type: 7, name: "長門改二", slot: [3, 3, 6, 3], final: 1, orig: 1, deckid: 541 },
  { id: 344, type: 3, name: "Gambier Bay", slot: [16, 12], final: 0, orig: 344, deckid: 544 },
  { id: 345, type: 1, name: "Saratoga Mk.II", slot: [32, 24, 18, 6], final: 1, orig: 233, deckid: 545 },
  { id: 346, type: 7, name: "武蔵改二", slot: [5, 5, 5, 8, 5], final: 1, orig: 143, deckid: 546 },
  { id: 347, type: 14, name: "多摩改二", slot: [1, 1, 1], final: 1, orig: 40, deckid: 547 },
  { id: 349, type: 1, name: "Intrepid", slot: [37, 36, 19, 4], final: 0, orig: 349, deckid: 549 },
  { id: 350, type: 2, name: "Saratoga Mk.II Mod.2", slot: [37, 24, 19, 13], final: 1, orig: 233, deckid: 550 },
  { id: 353, type: 4, name: "伊勢改二", slot: [2, 2, 22, 22, 9], final: 1, orig: 3, deckid: 553 },
  { id: 354, type: 4, name: "日向改二", slot: [2, 4, 22, 11, 11], final: 1, orig: 4, deckid: 554 },
  { id: 355, type: 3, name: "瑞鳳改二", slot: [21, 18, 12, 6], final: 1, orig: 112, deckid: 555 },
  { id: 360, type: 3, name: "瑞鳳改二乙", slot: [18, 15, 15, 2], final: 1, orig: 112, deckid: 560 },
  { id: 373, type: 7, name: "陸奥改二", slot: [2, 3, 3, 7], final: 1, orig: 2, deckid: 573 },
  { id: 374, type: 14, name: "Gotland", slot: [2, 3, 6], final: 0, orig: 374, deckid: 574 },
  { id: 379, type: 14, name: "Gotland改", slot: [1, 1, 1, 1], final: 1, orig: 374, deckid: 579 },
  { id: 381, type: 6, name: "日進", slot: [8, 8, 12], final: 0, orig: 381, deckid: 581 },
  { id: 386, type: 6, name: "日進甲", slot: [8, 8, 12, 4], final: 1, orig: 381, deckid: 586 },
  { id: 391, type: 8, name: "金剛改二丙", slot: [2, 2, 3, 6], final: 1, orig: 391, deckid: 591 },
  { id: 404, type: 1, name: "赤城改二", slot: [21, 21, 32, 12, 4], final: 1, orig: 6, deckid: 594 },
  { id: 409, type: 1, name: "赤城改二戊", slot: [16, 16, 40, 4, 2], final: 1, orig: 6, deckid: 599 },
  { id: 421, type: 10, name: "神州丸", slot: [2, 2, 8], final: 0, orig: 421, deckid: 621 },
  { id: 426, type: 10, name: "神州丸改", slot: [2, 2, 4, 8], final: 1, orig: 421, deckid: 626 },
  { id: 1375, type: 7, name: "長門改", slot: [3, 3, 3, 3], final: 0, orig: 1, deckid: 275 },
  { id: 1376, type: 7, name: "陸奥改", slot: [3, 3, 3, 3], final: 0, orig: 2, deckid: 276 },
  { id: 1377, type: 1, name: "赤城改", slot: [20, 20, 32, 10], final: 0, orig: 6, deckid: 277 },
  { id: 1378, type: 1, name: "加賀改", slot: [20, 20, 46, 12], final: 1, orig: 7, deckid: 278 },
  { id: 1379, type: 1, name: "蒼龍改", slot: [18, 27, 18, 10], final: 0, orig: 8, deckid: 279 },
  { id: 1380, type: 1, name: "飛龍改", slot: [18, 27, 18, 10], final: 0, orig: 9, deckid: 280 },
  { id: 1381, type: 3, name: "龍驤改", slot: [9, 24, 5, 5], final: 0, orig: 30, deckid: 281 },
  { id: 1382, type: 3, name: "祥鳳改", slot: [18, 12, 12, 6], final: 1, orig: 94, deckid: 282 },
  { id: 1383, type: 3, name: "飛鷹改", slot: [18, 18, 18, 12], final: 1, orig: 65, deckid: 283 },
  { id: 1384, type: 3, name: "隼鷹改", slot: [18, 18, 18, 12], final: 0, orig: 66, deckid: 284 },
  { id: 1385, type: 3, name: "鳳翔改", slot: [14, 16, 12], final: 1, orig: 25, deckid: 285 },
  { id: 1386, type: 4, name: "扶桑改", slot: [10, 10, 10, 10], final: 0, orig: 26, deckid: 286 },
  { id: 1387, type: 4, name: "山城改", slot: [10, 10, 10, 10], final: 0, orig: 27, deckid: 287 },
  { id: 1388, type: 1, name: "翔鶴改", slot: [24, 24, 24, 12], final: 0, orig: 106, deckid: 288 },
  { id: 1391, type: 3, name: "千歳航改", slot: [24, 16, 8, 8], final: 0, orig: 49, deckid: 291 },
  { id: 1392, type: 3, name: "千代田航改", slot: [24, 16, 8, 8], final: 0, orig: 50, deckid: 292 },
  { id: 1401, type: 14, name: "阿賀野改", slot: [2, 2, 2], final: 1, orig: 137, deckid: 305 },
  { id: 1402, type: 14, name: "能代改", slot: [2, 2, 2], final: 1, orig: 138, deckid: 306 },
  { id: 1403, type: 14, name: "矢矧改", slot: [2, 2, 2], final: 1, orig: 139, deckid: 307 },
  { id: 1410, type: 14, name: "酒匂改", slot: [2, 2, 2], final: 1, orig: 139, deckid: 314 },
  { id: 1428, type: 6, name: "瑞穂改", slot: [12, 12, 8], final: 1, orig: 251, deckid: 348 },
  { id: 1432, type: 11, name: "速吸改", slot: [6, 3, 1], final: 1, orig: 260, deckid: 352 },
  { id: 1433, type: 1, name: "Graf Zeppelin改", slot: [30, 13, 10, 3], final: 1, orig: 232, deckid: 353 },
  { id: 1438, type: 9, name: "Zara改", slot: [2, 2, 2, 2], final: 0, orig: 248, deckid: 358 },
  { id: 1441, type: 9, name: "Pola改", slot: [2, 2, 2, 2], final: 1, orig: 249, deckid: 361 },
  { id: 1445, type: 1, name: "Aquila改", slot: [15, 26, 15, 10], final: 1, orig: 244, deckid: 365 },
  { id: 1447, type: 12, name: "伊26改", slot: [1, 1], final: 1, orig: 283, deckid: 367 },
  { id: 1452, type: 6, name: "Commandant Teste改", slot: [12, 12, 7, 7], final: 1, orig: 291, deckid: 372 },
  { id: 1454, type: 12, name: "伊13改", slot: [2, 1, 0], final: 1, orig: 294, deckid: 374 },
  { id: 1455, type: 12, name: "伊14改", slot: [2, 1, 0], final: 1, orig: 295, deckid: 375 },
  { id: 1460, type: 3, name: "大鷹改", slot: [14, 14, 5, 3], final: 0, orig: 321, deckid: 380 },
  { id: 1461, type: 3, name: "神鷹改", slot: [9, 18, 6, 3], final: 0, orig: 324, deckid: 381 },
  { id: 1473, type: 1, name: "Ark Royal改", slot: [24, 30, 12, 12], final: 1, orig: 315, deckid: 393 },
  { id: 1476, type: 3, name: "Gambier Bay改", slot: [16, 12, 6], final: 1, orig: 344, deckid: 396 },
  { id: 1477, type: 1, name: "Intrepid改", slot: [40, 36, 21, 15], final: 1, orig: 349, deckid: 397 },
  { id: 1490, type: 6, name: "日進改", slot: [8, 8, 12], final: 0, orig: 381, deckid: 690 },
  { id: 1499, type: 12, name: "伊58改", slot: [1, 1], final: 1, orig: 127, deckid: 399 },
  { id: 1500, type: 12, name: "伊8改", slot: [1, 1], final: 1, orig: 128, deckid: 400 },
  { id: 1501, type: 12, name: "伊19改", slot: [1, 1], final: 1, orig: 123, deckid: 401 },
  { id: 1503, type: 12, name: "伊401改", slot: [3, 3], final: 1, orig: 155, deckid: 403 },
  { id: 1506, type: 12, name: "伊400改", slot: [3, 3], final: 1, orig: 293, deckid: 606 }
];

// 艦種
const ENEMY_TYPE = [
  { id: 1, name: '正規空母' },
  { id: 2, name: '軽空母' },
  { id: 3, name: '戦艦' },
  { id: 4, name: '重巡洋艦' },
  { id: 5, name: '軽巡洋艦' },
  { id: 6, name: '駆逐艦' },
  { id: 7, name: '重雷装巡洋艦' },
  { id: 8, name: '潜水艦' },
  { id: 9, name: '補給艦' },
  { id: 20, name: '浮遊要塞 / 護衛要塞' },
  { id: 100, name: '地上施設' },
  { id: 110, name: '鬼 / 姫' },
  { id: 1000, name: '過去イベント登場艦' },
];

// 敵艦
const ENEMY_DATA = [
  { id: -1, type: [1, 2, 3, 4, 5, 6, 7, 8, 9, 20, 100, 110, 1000], name: "直接入力", slot: [], eqp: [], orig: -1, aaw: 0, aabo: 0 },
  { id: 1, type: [6], name: "駆逐イ級", slot: [], eqp: [], orig: 1, aaw: 4, aabo: 0 },
  { id: 2, type: [6], name: "駆逐ロ級", slot: [], eqp: [], orig: 2, aaw: 5, aabo: 0 },
  { id: 3, type: [6], name: "駆逐ハ級", slot: [], eqp: [], orig: 3, aaw: 4, aabo: 0 },
  { id: 4, type: [6], name: "駆逐ニ級", slot: [], eqp: [], orig: 4, aaw: 5, aabo: 0 },
  { id: 5, type: [5], name: "軽巡ホ級", slot: [1], eqp: [525], orig: 5, aaw: 6, aabo: 0 },
  { id: 6, type: [5], name: "軽巡ヘ級", slot: [1], eqp: [525], orig: 6, aaw: 6, aabo: 0 },
  { id: 7, type: [5], name: "軽巡ト級", slot: [2], eqp: [525], orig: 7, aaw: 6, aabo: 0 },
  { id: 8, type: [7], name: "雷巡チ級", slot: [], eqp: [], orig: 8, aaw: 6, aabo: 0 },
  { id: 9, type: [4], name: "重巡リ級", slot: [3], eqp: [525], orig: 9, aaw: 8, aabo: 0 },
  { id: 10, type: [2], name: "軽母ヌ級", slot: [18, 18, 18], eqp: [519, 523, 516], orig: 10, aaw: 7, aabo: 0 },
  { id: 11, type: [3], name: '戦艦ル級', slot: [3], eqp: [525], orig: 11, aaw: 16, aabo: 1 },
  { id: 12, type: [1], name: "空母ヲ級", slot: [27, 27, 27], eqp: [519, 523, 516], orig: 12, aaw: 10, aabo: 0 },
  { id: 13, type: [9], name: "輸送ワ級", slot: [], eqp: [], orig: 13, aaw: 0, aabo: 0 },
  { id: 14, type: [6], name: "駆逐イ級elite", slot: [], eqp: [], orig: 1, aaw: 6, aabo: 0 },
  { id: 15, type: [6], name: "駆逐ロ級elite", slot: [], eqp: [], orig: 2, aaw: 6, aabo: 0 },
  { id: 16, type: [6], name: "駆逐ハ級elite", slot: [], eqp: [], orig: 3, aaw: 7, aabo: 0 },
  { id: 17, type: [6], name: "駆逐ニ級elite", slot: [], eqp: [], orig: 4, aaw: 8, aabo: 0 },
  { id: 18, type: [5], name: "軽巡ホ級elite", slot: [1], eqp: [525], orig: 5, aaw: 8, aabo: 0 },
  { id: 19, type: [5], name: "軽巡ヘ級elite", slot: [1], eqp: [525], orig: 6, aaw: 9, aabo: 0 },
  { id: 20, type: [5], name: "軽巡ト級elite", slot: [2], eqp: [525], orig: 7, aaw: 9, aabo: 0 },
  { id: 21, type: [7], name: "雷巡チ級elite", slot: [], eqp: [], orig: 8, aaw: 8, aabo: 0 },
  { id: 22, type: [4], name: "重巡リ級elite", slot: [3, 3], eqp: [525, 525], orig: 9, aaw: 10, aabo: 1 },
  { id: 23, type: [2], name: "軽母ヌ級elite", slot: [24, 24, 24], eqp: [520, 523, 516], orig: 10, aaw: 7, aabo: 1 },
  { id: 24, type: [3], name: '戦艦ル級elite', slot: [], eqp: [], orig: 11, aaw: 16, aabo: 2 },
  { id: 25, type: [1], name: "空母ヲ級elite", slot: [30, 30, 30], eqp: [520, 524, 517], orig: 12, aaw: 12, aabo: 1 },
  { id: 26, type: [9], name: "輸送ワ級elite", slot: [], eqp: [], orig: 13, aaw: 8, aabo: 0 },
  { id: 27, type: [4], name: "重巡リ級flagship", slot: [4], eqp: [525], orig: 9, aaw: 12, aabo: 1 },
  { id: 28, type: [1], name: "空母ヲ級flagship", slot: [32, 32, 32], eqp: [520, 524, 517], orig: 12, aaw: 14, aabo: 1 },
  { id: 29, type: [3], name: "戦艦ル級flagship", slot: [5], eqp: [525], orig: 11, aaw: 17, aabo: 2 },
  { id: 30, type: [8], name: "潜水カ級", slot: [], eqp: [], orig: 30, aaw: 0, aabo: 0 },
  { id: 31, type: [8], name: "潜水ヨ級", slot: [], eqp: [], orig: 31, aaw: 0, aabo: 0 },
  { id: 32, type: [8], name: "潜水カ級elite", slot: [], eqp: [], orig: 30, aaw: 0, aabo: 0 },
  { id: 33, type: [8], name: "潜水ヨ級elite", slot: [], eqp: [], orig: 31, aaw: 0, aabo: 0 },
  { id: 34, type: [8], name: "潜水カ級flagship", slot: [], eqp: [], orig: 30, aaw: 0, aabo: 0 },
  { id: 35, type: [8], name: "潜水ヨ級flagship", slot: [], eqp: [], orig: 31, aaw: 0, aabo: 0 },
  { id: 36, type: [20], name: "浮遊要塞", slot: [30, 30], eqp: [520, 524], orig: 36, aaw: 8, aabo: 1 },
  { id: 37, type: [20], name: "浮遊要塞 下向き", slot: [30, 30], eqp: [520, 517], orig: 36, aaw: 8, aabo: 1 },
  { id: 38, type: [20], name: "浮遊要塞 上向き", slot: [30, 30], eqp: [520, 517], orig: 36, aaw: 8, aabo: 1 },
  { id: 41, type: [3], name: "戦艦タ級", slot: [4], eqp: [525], orig: 41, aaw: 15, aabo: 2 },
  { id: 42, type: [3], name: "戦艦タ級elite", slot: [], eqp: [], orig: 41, aaw: 16, aabo: 2 },
  { id: 43, type: [3], name: "戦艦タ級flagship", slot: [4], eqp: [525], orig: 41, aaw: 16, aabo: 2 },
  { id: 44, type: [110], name: "装甲空母鬼", slot: [80, 80], eqp: [520, 524], orig: 44, aaw: 15, aabo: 1 },
  { id: 45, type: [110], name: "装甲空母姫", slot: [96, 96], eqp: [520, 524], orig: 45, aaw: 16, aabo: 1 },
  { id: 46, type: [110], name: "南方棲鬼", slot: [50], eqp: [520], orig: 46, aaw: 33, aabo: 4 },
  { id: 47, type: [110], name: "南方棲戦鬼", slot: [70, 70], eqp: [520, 524], orig: 46, aaw: 18, aabo: 2 },
  { id: 48, type: [110], name: "南方棲戦姫", slot: [90], eqp: [520], orig: 46, aaw: 35, aabo: 5 },
  { id: 49, type: [20], name: "護衛要塞", slot: [35, 35], eqp: [520, 524], orig: 49, aaw: 8, aabo: 1 },
  { id: 50, type: [20], name: "護衛要塞 下向き", slot: [35, 35], eqp: [520, 517], orig: 49, aaw: 8, aabo: 1 },
  { id: 51, type: [20], name: "護衛要塞 上向き", slot: [35, 35], eqp: [520, 517], orig: 49, aaw: 8, aabo: 1 },
  { id: 52, type: [6], name: "駆逐ロ級flagship", slot: [], eqp: [], orig: 2, aaw: 9, aabo: 0 },
  { id: 53, type: [6], name: "駆逐ハ級flagship", slot: [], eqp: [], orig: 3, aaw: 9, aabo: 0 },
  { id: 54, type: [5], name: "軽巡ホ級flagship", slot: [], eqp: [], orig: 5, aaw: 10, aabo: 0 },
  { id: 55, type: [5], name: "軽巡ヘ級flagship", slot: [2], eqp: [525], orig: 6, aaw: 10, aabo: 0 },
  { id: 56, type: [110, 100, 1000], name: "飛行場姫", slot: [98, 98, 98, 98], eqp: [520, 520, 524, 517], orig: 56, aaw: 21, aabo: 2 },
  { id: 57, type: [110, 3, 1000], name: "戦艦棲姫", slot: [], eqp: [], orig: 57, aaw: 17, aabo: 2 },
  { id: 58, type: [9], name: "輸送ワ級flagship", slot: [], eqp: [], orig: 13, aaw: 12, aabo: 1 },
  { id: 59, type: [7], name: "雷巡チ級flagship", slot: [], eqp: [], orig: 8, aaw: 10, aabo: 0 },
  { id: 60, type: [2], name: "軽母ヌ級flagship", slot: [22, 22, 22, 22], eqp: [520, 524, 524, 517], orig: 10, aaw: 12, aabo: 1 },
  { id: 61, type: [3], name: "戦艦レ級", slot: [140], eqp: [546], orig: 61, aaw: 17, aabo: 3 },
  { id: 62, type: [3], name: "戦艦レ級elite", slot: [180], eqp: [546], orig: 61, aaw: 20, aabo: 3 },
  { id: 64, type: [6], name: "駆逐イ級flagship", slot: [], eqp: [], orig: 1, aaw: 24, aabo: 2 },
  { id: 65, type: [1], name: "空母ヲ級改flagship", slot: [36, 36, 36, 36], eqp: [521, 524, 518, 518], orig: 12, aaw: 18, aabo: 1 },
  { id: 66, type: [4], name: "重巡リ級改flagship", slot: [4], eqp: [526], orig: 9, aaw: 15, aabo: 1 },
  { id: 67, type: [3], name: "戦艦ル級改flagship", slot: [5], eqp: [526], orig: 11, aaw: 18, aabo: 2 },
  { id: 70, type: [8], name: "潜水ソ級", slot: [], eqp: [], orig: 70, aaw: 4, aabo: 0 },
  { id: 71, type: [8], name: "潜水ソ級elite", slot: [], eqp: [], orig: 70, aaw: 4, aabo: 0 },
  { id: 72, type: [8], name: "潜水ソ級flagship", slot: [], eqp: [], orig: 70, aaw: 0, aabo: 0 },
  { id: 73, type: [110, 100], name: "港湾棲姫", slot: [80, 80, 80, 80], eqp: [521, 524, 517, 517], orig: 73, aaw: 24, aabo: 1 },
  { id: 74, type: [110, 100], name: "離島棲鬼", slot: [90, 90, 90, 90], eqp: [521, 524, 518, 518], orig: 74, aaw: 20, aabo: 3 },
  { id: 75, type: [6], name: "駆逐イ級後期型", slot: [], eqp: [], orig: 1, aaw: 10, aabo: 0 },
  { id: 76, type: [6], name: "駆逐ロ級後期型", slot: [], eqp: [], orig: 2, aaw: 11, aabo: 0 },
  { id: 77, type: [6], name: "駆逐ハ級後期型", slot: [], eqp: [], orig: 3, aaw: 12, aabo: 0 },
  { id: 78, type: [6], name: "駆逐ニ級後期型", slot: [], eqp: [], orig: 4, aaw: 12, aabo: 0 },
  { id: 79, type: [1], name: "空母ヲ級flagship(白)", slot: [32, 32, 27, 5], eqp: [547, 548, 549, 549], orig: 12, aaw: 14, aabo: 2 },
  { id: 85, type: [110, 1], name: "空母棲鬼", slot: [48, 48, 48], eqp: [547, 548, 549], orig: 86, aaw: 74, aabo: 9 },
  { id: 86, type: [110, 1], name: "空母棲姫", slot: [60, 52, 56], eqp: [547, 548, 549], orig: 86, aaw: 76, aabo: 9 },
  { id: 87, type: [110, 100], name: "北方棲姫(3-5前哨 強)", slot: [72, 64, 36], eqp: [521, 548, 517], orig: 87, aaw: 21, aabo: 2 },
  { id: 88, type: [110, 100], name: "北方棲姫(3-5最終 強)", slot: [72, 72, 40], eqp: [547, 548, 549], orig: 87, aaw: 23, aabo: 2 },
  { id: 89, type: [110, 100], name: "北方棲姫(3-5前哨 弱)", slot: [64, 48, 36], eqp: [521, 548, 517], orig: 87, aaw: 20, aabo: 2 },
  { id: 90, type: [110, 100], name: "北方棲姫(3-5最終 弱)", slot: [64, 68, 40], eqp: [547, 548, 549], orig: 87, aaw: 21, aabo: 2 },
  { id: 91, type: [5], name: "軽巡ツ級", slot: [3], eqp: [525], orig: 91, aaw: 90, aabo: 6 },
  { id: 92, type: [5], name: "軽巡ツ級elite", slot: [3], eqp: [525], orig: 91, aaw: 91, aabo: 6 },
  { id: 94, type: [4], name: "重巡ネ級", slot: [4], eqp: [525], orig: 94, aaw: 16, aabo: 1 },
  { id: 95, type: [4], name: "重巡ネ級elite", slot: [4], eqp: [525], orig: 94, aaw: 17, aabo: 1 },
  { id: 97, type: [110, 6], name: "駆逐棲姫 弱", slot: [], eqp: [], orig: 97, aaw: 15, aabo: 0 },
  { id: 98, type: [110, 6], name: "駆逐棲姫 強", slot: [], eqp: [], orig: 97, aaw: 15, aabo: 0 },
  { id: 99, type: [110, 1, 1000], name: "空母水鬼 弱", slot: [66, 60, 60], eqp: [547, 548, 549], orig: 99, aaw: 74, aabo: 9 },
  { id: 100, type: [110, 1, 1000], name: "空母水鬼 強", slot: [66, 60, 60], eqp: [547, 548, 549], orig: 99, aaw: 77, aabo: 9 },
  { id: 101, type: [110, 5, 1000], name: "軽巡棲鬼 弱", slot: [3], eqp: [525], orig: 101, aaw: 16, aabo: 1 },
  { id: 102, type: [110, 5, 1000], name: "軽巡棲鬼 強", slot: [3], eqp: [525], orig: 101, aaw: 16, aabo: 1 },
  { id: 103, type: [110, 3, 1000], name: "戦艦水鬼 弱", slot: [6], eqp: [525], orig: 103, aaw: 18, aabo: 1 },
  { id: 104, type: [110, 3, 1000], name: "戦艦水鬼 強", slot: [6], eqp: [525], orig: 103, aaw: 19, aabo: 1 },
  { id: 105, type: [110, 100, 1000], name: "港湾水鬼 弱", slot: [90, 90], eqp: [547, 548], orig: 105, aaw: 20, aabo: 3 },
  { id: 106, type: [110, 100, 1000], name: "港湾水鬼 強", slot: [108, 108], eqp: [547, 548], orig: 105, aaw: 22, aabo: 3 },
  { id: 107, type: [110, 100, 1000], name: "港湾水鬼 最終 弱", slot: [108, 108], eqp: [547, 548], orig: 105, aaw: 24, aabo: 3 },
  { id: 108, type: [110, 100, 1000], name: "港湾水鬼 最終 強", slot: [130, 130], eqp: [547, 548], orig: 105, aaw: 26, aabo: 3 },
  { id: 109, type: [110, 100, 1000], name: "泊地水鬼 弱", slot: [120], eqp: [548], orig: 109, aaw: 18, aabo: 1 },
  { id: 110, type: [110, 100, 1000], name: "泊地水鬼 強", slot: [140], eqp: [548], orig: 109, aaw: 18, aabo: 1 },
  { id: 111, type: [110, 100, 1000], name: "泊地水鬼 最終 弱", slot: [160], eqp: [548], orig: 109, aaw: 20, aabo: 1 },
  { id: 112, type: [110, 100, 1000], name: "泊地水鬼 最終 強", slot: [180], eqp: [548], orig: 109, aaw: 20, aabo: 1 },
  { id: 113, type: [110, 100], name: "港湾棲姫(4-5最終)", slot: [180], eqp: [549], orig: 73, aaw: 26, aabo: 0 },
  { id: 114, type: [1], name: "空母ヲ級flagship(白赤)", slot: [32, 32, 27, 5], eqp: [556, 548, 558, 549], orig: 12, aaw: 14, aabo: 2 },
  { id: 115, type: [1], name: "空母ヲ級flagship(赤)", slot: [32, 32, 27, 5], eqp: [556, 557, 558, 558], orig: 12, aaw: 14, aabo: 2 },
  { id: 116, type: [1], name: "空母ヲ級改flagship(白)", slot: [36, 36, 36, 36], eqp: [547, 548, 549, 549], orig: 12, aaw: 18, aabo: 2 },
  { id: 117, type: [1], name: "空母ヲ級改flagship(白赤)", slot: [36, 36, 36, 36], eqp: [556, 548, 558, 549], orig: 12, aaw: 18, aabo: 2 },
  { id: 118, type: [1], name: "空母ヲ級改flagship(赤)", slot: [36, 36, 36, 36], eqp: [556, 557, 558, 558], orig: 12, aaw: 18, aabo: 2 },
  { id: 119, type: [110, 1, 1000], name: "空母棲鬼(赤)", slot: [48, 48, 48], eqp: [556, 557, 558], orig: 86, aaw: 74, aabo: 9 },
  { id: 120, type: [110, 1, 1000], name: "空母棲姫(赤)", slot: [60, 52, 56], eqp: [556, 557, 558], orig: 86, aaw: 76, aabo: 9 },
  { id: 121, type: [6], name: "駆逐イ級後期型elite", slot: [], eqp: [], orig: 1, aaw: 12, aabo: 0 },
  { id: 122, type: [6], name: "駆逐ロ級後期型elite", slot: [], eqp: [], orig: 2, aaw: 13, aabo: 0 },
  { id: 123, type: [6], name: "駆逐ハ級後期型elite", slot: [], eqp: [], orig: 3, aaw: 13, aabo: 0 },
  { id: 124, type: [6], name: "駆逐ニ級後期型elite", slot: [], eqp: [], orig: 4, aaw: 13, aabo: 0 },
  { id: 131, type: [110, 100, 1000], name: "飛行場姫 15夏 [丙]", slot: [98, 98, 98, 98], eqp: [556, 548, 558, 549], orig: 56, aaw: 21, aabo: 2 },
  { id: 132, type: [110, 100, 1000], name: "飛行場姫 15夏 [乙]", slot: [98, 98, 98, 98], eqp: [556, 557, 558, 549], orig: 56, aaw: 22, aabo: 2 },
  { id: 133, type: [110, 100, 1000], name: "飛行場姫 15夏 [甲]", slot: [98, 98, 98, 98], eqp: [556, 557, 558, 558], orig: 56, aaw: 23, aabo: 2 },
  { id: 137, type: [6], name: "PT小鬼群 最弱", slot: [], eqp: [], orig: 137, aaw: 6, aabo: 0 },
  { id: 138, type: [6], name: "PT小鬼群 弱", slot: [], eqp: [], orig: 137, aaw: 8, aabo: 0 },
  { id: 139, type: [6], name: "PT小鬼群 中", slot: [], eqp: [], orig: 137, aaw: 8, aabo: 0 },
  { id: 140, type: [6], name: "PT小鬼群 強", slot: [], eqp: [], orig: 137, aaw: 9, aabo: 0 },
  { id: 150, type: [110, 100, 1000], name: "飛行場姫 陸爆 弱", slot: [12, 12, 8, 4], eqp: [561, 561, 561, 561], orig: 56, aaw: 21, aabo: 2 },
  { id: 151, type: [110, 100, 1000], name: "飛行場姫 陸爆 中", slot: [16, 16, 12, 4], eqp: [562, 561, 561, 561], orig: 56, aaw: 21, aabo: 2 },
  { id: 152, type: [110, 100, 1000], name: "飛行場姫 陸爆 強", slot: [24, 24, 16, 8], eqp: [562, 562, 561, 561], orig: 56, aaw: 21, aabo: 3 },
  { id: 153, type: [110, 100, 1000], name: "集積地棲姫 [丙]", slot: [12, 12, 8, 4], eqp: [561, 561, 561, 561], orig: 153, aaw: 15, aabo: 3 },
  { id: 154, type: [110, 100, 1000], name: "集積地棲姫 [乙]", slot: [16, 16, 12, 4], eqp: [562, 561, 561, 561], orig: 153, aaw: 16, aabo: 2 },
  { id: 155, type: [110, 100, 1000], name: "集積地棲姫 [甲]", slot: [24, 24, 16, 8], eqp: [562, 562, 561, 561], orig: 153, aaw: 17, aabo: 2 },
  { id: 156, type: [110, 100, 1000], name: "集積地棲姫-壊 [丙]", slot: [16, 16, 12, 4], eqp: [562, 561, 561, 561], orig: 153, aaw: 16, aabo: 3 },
  { id: 157, type: [110, 100, 1000], name: "集積地棲姫-壊 [乙]", slot: [24, 24, 16, 8], eqp: [562, 562, 561, 561], orig: 153, aaw: 17, aabo: 2 },
  { id: 158, type: [110, 100, 1000], name: "集積地棲姫-壊 [甲]", slot: [32, 32, 24, 8], eqp: [562, 562, 562, 561], orig: 153, aaw: 18, aabo: 2 },
  { id: 159, type: [110, 4, 1000], name: "重巡棲姫 [丙]", slot: [4], eqp: [564], orig: 159, aaw: 16, aabo: 0 },
  { id: 160, type: [110, 4, 1000], name: "重巡棲姫 [乙]", slot: [4], eqp: [564], orig: 159, aaw: 17, aabo: 0 },
  { id: 161, type: [110, 4, 1000], name: "重巡棲姫 [甲]", slot: [4], eqp: [564], orig: 159, aaw: 17, aabo: 0 },
  { id: 162, type: [110, 4, 1000], name: "重巡棲姫 [丙] 強", slot: [4], eqp: [564], orig: 159, aaw: 18, aabo: 0 },
  { id: 163, type: [110, 4, 1000], name: "重巡棲姫 [乙] 強", slot: [4], eqp: [564], orig: 159, aaw: 18, aabo: 0 },
  { id: 164, type: [110, 4, 1000], name: "重巡棲姫 [甲] 強", slot: [4], eqp: [564], orig: 159, aaw: 19, aabo: 0 },
  { id: 165, type: [8], name: '砲台小鬼', slot: [], eqp: [], orig: 165, aaw: 76, aabo: 3 },
  { id: 166, type: [8], name: '砲台小鬼 機銃', slot: [], eqp: [], orig: 165, aaw: 149, aabo: 5 },
  { id: 167, type: [8], name: '砲台小鬼 対空CI', slot: [], eqp: [], orig: 165, aaw: 138, aabo: 8 },
  { id: 168, type: [110, 100], name: "離島棲姫(陸爆弱)", slot: [16, 12, 12, 8], eqp: [562, 561, 561, 566], orig: 74, aaw: 21, aabo: 3 },
  { id: 169, type: [110, 100], name: "離島棲姫(陸爆強)", slot: [20, 18, 18, 8], eqp: [562, 561, 566, 566], orig: 74, aaw: 21, aabo: 4 },
  { id: 171, type: [110, 100], name: "離島棲姫", slot: [32, 32], eqp: [566, 566], orig: 74, aaw: 22, aabo: 2 },
  // { id: 179, type: [110, 100], name: "リコリス棲姫 1", slot: [24, 24, 24, 24], eqp: [3, 3, 12, 7], orig: 179,  aaw: 21, aabo: 5 },
  // { id: 180, type: [110, 100], name: "リコリス棲姫 2", slot: [30, 30, 30, 30], eqp: [5, 3, 12, 7], orig: 179,  aaw: 21, aabo: 5 },
  // { id: 181, type: [110, 100], name: "リコリス棲姫 3", slot: [36, 36, 36, 36], eqp: [5, 5, 12, 7], orig: 179,  aaw: 21, aabo: 5 },
  { id: 182, type: [110, 10, 1000], name: "リコリス棲姫 弱", slot: [24, 24, 24, 24], eqp: [562, 561, 556, 566], orig: 182, aaw: 22, aabo: 5 },
  { id: 183, type: [110, 10, 1000], name: "リコリス棲姫 強", slot: [30, 30, 30, 30], eqp: [562, 562, 556, 566], orig: 182, aaw: 23, aabo: 5 },
  { id: 184, type: [110, 100, 1000], name: "中枢棲姫 [丙]", slot: [16], eqp: [569], orig: 184, aaw: 32, aabo: 3 },
  { id: 185, type: [110, 100, 1000], name: "中枢棲姫 [乙]", slot: [16], eqp: [569], orig: 184, aaw: 33, aabo: 3 },
  { id: 186, type: [110, 100, 1000], name: "中枢棲姫 [甲]", slot: [16], eqp: [569], orig: 184, aaw: 38, aabo: 3 },
  { id: 187, type: [110, 100, 1000], name: "中枢棲姫-壊 [丙]", slot: [16], eqp: [569], orig: 184, aaw: 32, aabo: 3 },
  { id: 188, type: [110, 100, 1000], name: "中枢棲姫-壊 [乙]", slot: [16], eqp: [569], orig: 184, aaw: 35, aabo: 3 },
  { id: 189, type: [110, 100, 1000], name: "中枢棲姫-壊 [甲]", slot: [16], eqp: [569], orig: 184, aaw: 38, aabo: 3 },
  { id: 196, type: [110, 100, 1000], name: "戦艦夏姫 [丙]", slot: [], eqp: [], orig: 196, aaw: 17, aabo: 2 },
  { id: 197, type: [110, 100, 1000], name: "戦艦夏姫 [乙]", slot: [], eqp: [], orig: 196, aaw: 18, aabo: 2 },
  { id: 198, type: [110, 100, 1000], name: "戦艦夏姫 [甲]", slot: [], eqp: [], orig: 196, aaw: 18, aabo: 2 },
  { id: 199, type: [110, 100, 1000], name: "港湾夏姫 [丙]", slot: [81, 81], eqp: [561, 561], orig: 73, aaw: 26, aabo: 1 },
  { id: 200, type: [110, 100, 1000], name: "港湾夏姫 [乙]", slot: [81, 96], eqp: [562, 561], orig: 73, aaw: 26, aabo: 1 },
  { id: 201, type: [110, 100, 1000], name: "港湾夏姫 [甲]", slot: [96, 96], eqp: [562, 562], orig: 73, aaw: 27, aabo: 4, },
  { id: 202, type: [110, 100, 1000], name: "港湾夏姫-壊 [丙]", slot: [81, 81], eqp: [561, 561], orig: 73, aaw: 26, aabo: 1 },
  { id: 203, type: [110, 100, 1000], name: "港湾夏姫-壊 [乙]", slot: [81, 96], eqp: [562, 561], orig: 73, aaw: 26, aabo: 1 },
  { id: 204, type: [110, 100, 1000], name: "港湾夏姫-壊 [甲]", slot: [96, 96], eqp: [562, 562], orig: 73, aaw: 27, aabo: 1 },
  { id: 205, type: [110, 4, 1000], name: "重巡夏姫 [丙]", slot: [4], eqp: [564], orig: 159, aaw: 16, aabo: 0 },
  { id: 206, type: [110, 4, 1000], name: "重巡夏姫 [乙]", slot: [4], eqp: [564], orig: 159, aaw: 18, aabo: 0 },
  { id: 207, type: [110, 4, 1000], name: "重巡夏姫 [甲]", slot: [4], eqp: [564], orig: 159, aaw: 18, aabo: 0 },
  { id: 208, type: [110, 7, 1000], name: "水母水姫 [丙]", slot: [12, 14], eqp: [571, 571], orig: 208, aaw: 20, aabo: 0 },
  { id: 209, type: [110, 7, 1000], name: "水母水姫 [乙]", slot: [24, 28], eqp: [571, 571], orig: 208, aaw: 20, aabo: 0 },
  { id: 210, type: [110, 7, 1000], name: "水母水姫 [甲]", slot: [36, 42], eqp: [571, 571], orig: 208, aaw: 21, aabo: 0 },
  { id: 211, type: [110, 1, 1000], name: "深海海月姫 [丙]", slot: [23, 22, 22, 23], eqp: [547, 557, 558, 547], orig: 213, aaw: 21, aabo: 4 },
  { id: 212, type: [110, 1, 1000], name: "深海海月姫 [乙]", slot: [39, 39, 39, 39], eqp: [572, 557, 558, 572], orig: 213, aaw: 23, aabo: 7 },
  { id: 213, type: [110, 1, 1000], name: "深海海月姫 [甲]", slot: [48, 48, 48, 36], eqp: [572, 557, 558, 572], orig: 213, aaw: 23, aabo: 7 },
  { id: 214, type: [1], name: "空母ヲ級改flagship(陸爆弱)", slot: [36, 36, 28, 28], eqp: [556, 561, 561, 561], orig: 12, aaw: 18, aabo: 4 },
  { id: 215, type: [1], name: "空母ヲ級改flagship(陸爆強)", slot: [36, 36, 32, 32], eqp: [556, 562, 562, 562], orig: 12, aaw: 18, aabo: 5 },
  { id: 234, type: [2], name: "軽母ヌ級改elite", slot: [22, 22, 22, 22], eqp: [574, 524, 520, 574], orig: 10, aaw: 13, aabo: 1 },
  { id: 235, type: [2], name: "軽母ヌ級改flagship", slot: [26, 24, 24, 22], eqp: [575, 524, 520, 575], orig: 10, aaw: 16, aabo: 1 },
  { id: 236, type: [110, 8, 1000], name: "潜水新棲姫flagship [丙]", slot: [], eqp: [], orig: 236, aaw: 0, aabo: 0 },
  { id: 237, type: [110, 8, 1000], name: "潜水新棲姫flagship [乙]", slot: [], eqp: [], orig: 236, aaw: 0, aabo: 0 },
  { id: 238, type: [110, 8, 1000], name: "潜水新棲姫flagship [甲]", slot: [], eqp: [], orig: 236, aaw: 0, aabo: 0 },
  { id: 239, type: [6], name: "駆逐ナ級", slot: [], eqp: [], orig: 239, aaw: 15, aabo: 0 },
  { id: 240, type: [6], name: "駆逐ナ級elite", slot: [], eqp: [], orig: 239, aaw: 16, aabo: 0 },
  { id: 241, type: [6], name: "駆逐ナ級flagship", slot: [], eqp: [], orig: 239, aaw: 17, aabo: 0 },
  { id: 242, type: [6], name: "駆逐ナ級後期型", slot: [], eqp: [], orig: 239, aaw: 17, aabo: 0 },
  { id: 243, type: [6], name: "駆逐ナ級後期型elite", slot: [], eqp: [], orig: 239, aaw: 18, aabo: 0 },
  { id: 244, type: [6], name: "駆逐ナ級後期型flagship", slot: [], eqp: [], orig: 239, aaw: 19, aabo: 0 },
  { id: 251, type: [110, 1, 1000], name: "空母夏鬼", slot: [64, 56, 54], eqp: [547, 548, 549], orig: 86, aaw: 75, aabo: 9 },
  { id: 252, type: [110, 1, 1000], name: "空母夏姫", slot: [72, 72, 63], eqp: [547, 548, 549], orig: 86, aaw: 77, aabo: 9 },
  { id: 253, type: [110, 10, 1000], name: "集積地夏姫 弱", slot: [12, 12], eqp: [562, 562], orig: 153, aaw: 18, aabo: 2 },
  { id: 254, type: [110, 10, 1000], name: "集積地夏姫 強", slot: [24, 24], eqp: [562, 562], orig: 153, aaw: 48, aabo: 2 },
  { id: 261, type: [4], name: "重巡ネ級flagship", slot: [28], eqp: [574], orig: 94, aaw: 17, aabo: 0 },
  { id: 262, type: [2], name: "軽母ヌ級elite(白)", slot: [26, 23, 23], eqp: [547, 548, 549], orig: 10, aaw: 7, aabo: 2 },
  { id: 263, type: [2], name: "軽母ヌ級flagship(白)", slot: [32, 29, 29], eqp: [547, 548, 549], orig: 10, aaw: 66, aabo: 9 },
  { id: 264, type: [2], name: "軽母ヌ級flagship(赤)", slot: [32, 29, 29], eqp: [556, 557, 558], orig: 10, aaw: 66, aabo: 9 },
  { id: 265, type: [2], name: "軽母ヌ級改elite(鳥白)", slot: [28, 24, 18, 18], eqp: [574, 547, 548, 549], orig: 10, aaw: 13, aabo: 2 },
  { id: 266, type: [2], name: "軽母ヌ級改flagship(鳥赤)", slot: [28, 28, 20, 20], eqp: [575, 556, 557, 558], orig: 10, aaw: 16, aabo: 2 },
  { id: 276, type: [2], name: "軽母ヌ級elite(鳥白)", slot: [26, 23, 23], eqp: [547, 574, 574], orig: 10, aaw: 7, aabo: 2 },
  { id: 277, type: [2], name: "軽母ヌ級elite(黒)", slot: [26, 23, 23], eqp: [581, 582, 583], orig: 10, aaw: 7, aabo: 3 },
  { id: 278, type: [2], name: "軽母ヌ級改elite(黒)", slot: [28, 24, 18, 18], eqp: [581, 582, 583, 583], orig: 10, aaw: 13, aabo: 3 },
  { id: 279, type: [2], name: "軽母ヌ級改flagship(赤)", slot: [28, 28, 20, 20], eqp: [556, 557, 558, 558], orig: 10, aaw: 16, aabo: 2 },
  { id: 280, type: [2], name: "軽母ヌ級改flagship(黒)", slot: [28, 28, 20, 20], eqp: [581, 582, 583, 575], orig: 10, aaw: 16, aabo: 3 },
  { id: 281, type: [110, 1, 1000], name: "空母棲姫(黒) 弱", slot: [60, 52, 56, 30], eqp: [581, 557, 558, 583], orig: 86, aaw: 22, aabo: 2 },
  { id: 282, type: [110, 1, 1000], name: "空母棲姫(黒) 強", slot: [60, 52, 56, 30], eqp: [581, 557, 558, 583], orig: 86, aaw: 25, aabo: 2 },
  { id: 289, type: [110, 8, 1000], name: "潜水新棲姫flagship 強", slot: [], eqp: [], orig: 236, aaw: 0, aabo: 0 },
  { id: 290, type: [110, 3, 1000], name: "戦艦棲姫改 [丙]", slot: [4], eqp: [525], orig: 57, aaw: 18, aabo: 2 },
  { id: 291, type: [110, 3, 1000], name: "戦艦棲姫改 [乙]", slot: [4], eqp: [525], orig: 57, aaw: 19, aabo: 2 },
  { id: 292, type: [110, 3, 1000], name: "戦艦棲姫改 [甲]", slot: [4], eqp: [525], orig: 57, aaw: 20, aabo: 2 },
  { id: 293, type: [110, 3, 1000], name: "戦艦水鬼改 [丙]", slot: [6], eqp: [525], orig: 103, aaw: 19, aabo: 2 },
  { id: 294, type: [110, 3, 1000], name: "戦艦水鬼改 [乙]", slot: [6], eqp: [525], orig: 103, aaw: 20, aabo: 2 },
  { id: 295, type: [110, 3, 1000], name: "戦艦水鬼改 [甲]", slot: [6], eqp: [525], orig: 103, aaw: 20, aabo: 2 },
  { id: 296, type: [110, 3, 1000], name: "戦艦水鬼改-壊 [丙]", slot: [6], eqp: [525], orig: 103, aaw: 19, aabo: 2 },
  { id: 297, type: [110, 3, 1000], name: "戦艦水鬼改-壊 [乙]", slot: [6], eqp: [525], orig: 103, aaw: 20, aabo: 2 },
  { id: 298, type: [110, 3, 1000], name: "戦艦水鬼改-壊 [甲]", slot: [6], eqp: [525], orig: 103, aaw: 20, aabo: 2 },
  { id: 309, type: [110, 100, 1000], name: "集積地棲姫 バカンス [丙]", slot: [64], eqp: [562], orig: 153, aaw: 18, aabo: 1 },
  { id: 310, type: [110, 100, 1000], name: "集積地棲姫 バカンス [乙]", slot: [81], eqp: [562], orig: 153, aaw: 18, aabo: 1 },
  { id: 311, type: [110, 100, 1000], name: "集積地棲姫 バカンス [甲]", slot: [96], eqp: [562], orig: 153, aaw: 20, aabo: 1 },
  { id: 312, type: [110, 100, 1000], name: "集積地棲姫-壊 バカンス [丙]", slot: [], eqp: [], orig: 153, aaw: 142, aabo: 11 },
  { id: 313, type: [110, 100, 1000], name: "集積地棲姫-壊 バカンス [乙]", slot: [], eqp: [], orig: 153, aaw: 142, aabo: 11 },
  { id: 314, type: [110, 100, 1000], name: "集積地棲姫-壊 バカンス [甲]", slot: [], eqp: [], orig: 153, aaw: 142, aabo: 11 },
  { id: 315, type: [110, 3, 1000], name: "泊地水鬼 バカンス [丙]", slot: [124], eqp: [583], orig: 109, aaw: 18, aabo: 2 },
  { id: 316, type: [110, 3, 1000], name: "泊地水鬼 バカンス [乙]", slot: [144], eqp: [583], orig: 109, aaw: 18, aabo: 2 },
  { id: 317, type: [110, 3, 1000], name: "泊地水鬼 バカンス [甲]", slot: [188], eqp: [583], orig: 109, aaw: 19, aabo: 2 },
  { id: 318, type: [110, 3, 1000], name: "泊地水鬼-壊 バカンス [丙]", slot: [], eqp: [], orig: 109, aaw: 18, aabo: 2 },
  { id: 319, type: [110, 3, 1000], name: "泊地水鬼-壊 バカンス [乙]", slot: [], eqp: [], orig: 109, aaw: 19, aabo: 2 },
  { id: 320, type: [110, 3, 1000], name: "泊地水鬼-壊 バカンス [甲]", slot: [], eqp: [], orig: 109, aaw: 20, aabo: 2 },
  { id: 334, type: [110, 3, 1000], name: "戦艦仏棲姫 バカンス [丙]", slot: [64], eqp: [574], orig: 334, aaw: 17, aabo: 1 },
  { id: 335, type: [110, 3, 1000], name: "戦艦仏棲姫 バカンス [乙]", slot: [72], eqp: [574], orig: 334, aaw: 18, aabo: 1 },
  { id: 336, type: [110, 3, 1000], name: "戦艦仏棲姫 バカンス [甲]", slot: [81], eqp: [574], orig: 334, aaw: 19, aabo: 1 },
  { id: 337, type: [110, 3, 1000], name: "戦艦仏棲姫-壊 バカンス [丙]", slot: [72], eqp: [574], orig: 334, aaw: 17, aabo: 1 },
  { id: 338, type: [110, 3, 1000], name: "戦艦仏棲姫-壊 バカンス [乙]", slot: [81], eqp: [574], orig: 334, aaw: 18, aabo: 1 },
  { id: 339, type: [110, 3, 1000], name: "戦艦仏棲姫-壊 バカンス [甲]", slot: [96], eqp: [574], orig: 334, aaw: 19, aabo: 1 },
  { id: 358, type: [6], name: "駆逐ニ級改", slot: [], eqp: [], orig: 4, aaw: 25, aabo: 4 },
  { id: 359, type: [6], name: "駆逐ニ級改後期型", slot: [], eqp: [], orig: 4, aaw: 28, aabo: 4 },
  { id: 360, type: [6], name: "駆逐ニ級改後期型elite", slot: [], eqp: [], orig: 4, aaw: 30, aabo: 4 },
  { id: 361, type: [6], name: "駆逐ニ級改後期型flagship", slot: [], eqp: [], orig: 4, aaw: 31, aabo: 4 },
  { id: 362, type: [5], name: "軽巡ツ級flagship", slot: [3], eqp: [525], orig: 91, aaw: 92, aabo: 6 },
  { id: 363, type: [110, 4, 1000], name: "重巡棲姫 青", slot: [4], eqp: [564], orig: 159, aaw: 18, aabo: 0 },
  { id: 364, type: [110, 4, 1000], name: "重巡棲姫 青 強", slot: [4], eqp: [564], orig: 159, aaw: 19, aabo: 0 },
  { id: 365, type: [110, 100, 1000], name: "北方棲妹 [丙]", slot: [50], eqp: [562], orig: 365, aaw: 18, aabo: 1 },
  { id: 366, type: [110, 100, 1000], name: "北方棲妹 [乙]", slot: [70], eqp: [562], orig: 365, aaw: 18, aabo: 1 },
  { id: 367, type: [110, 100, 1000], name: "北方棲妹 [甲]", slot: [90], eqp: [562], orig: 365, aaw: 19, aabo: 1 },
  { id: 368, type: [110, 100, 1000], name: "北方棲妹-壊 [丙]", slot: [80], eqp: [562], orig: 365, aaw: 47, aabo: 4 },
  { id: 369, type: [110, 100, 1000], name: "北方棲妹-壊 [乙]", slot: [100], eqp: [562], orig: 365, aaw: 47, aabo: 4 },
  { id: 370, type: [110, 100, 1000], name: "北方棲妹-壊 [甲]", slot: [120], eqp: [562], orig: 365, aaw: 48, aabo: 4 },
  { id: 389, type: [110, 100, 1000], name: "飛行場姫 偵察 弱", slot: [9, 9, 12], eqp: [594, 594, 562], orig: 56, aaw: 21, aabo: 3 },
  { id: 390, type: [110, 100, 1000], name: "飛行場姫 偵察 中", slot: [9, 9, 12, 12], eqp: [595, 594, 562, 561], orig: 56, aaw: 21, aabo: 3 },
  { id: 391, type: [110, 100, 1000], name: "飛行場姫 偵察 強", slot: [9, 9, 18, 12], eqp: [595, 595, 562, 562], orig: 56, aaw: 21, aabo: 3 },
  { id: 392, type: [110, 1000], name: "飛行場姫 重爆 弱", slot: [18, 12, 6], eqp: [597, 597, 597], orig: 56, aaw: 21, aabo: 3 },
  { id: 393, type: [110, 1000], name: "飛行場姫 重爆 中", slot: [18, 12, 12, 6], eqp: [598, 597, 597, 594], orig: 56, aaw: 21, aabo: 3 },
  { id: 394, type: [110, 1000], name: "飛行場姫 重爆 強", slot: [36, 18, 12, 6], eqp: [598, 598, 598, 595], orig: 56, aaw: 21, aabo: 3 },
  { id: 395, type: [4], name: "重巡ネ級改 [丙]", slot: [4], eqp: [564], orig: 94, aaw: 17, aabo: 1 },
  { id: 396, type: [4], name: "重巡ネ級改 [乙]", slot: [4], eqp: [564], orig: 94, aaw: 18, aabo: 1 },
  { id: 397, type: [4], name: "重巡ネ級改 [甲]", slot: [4], eqp: [564], orig: 94, aaw: 19, aabo: 1 },
  { id: 398, type: [110, 4], name: "バタビア沖棲姫 [丙]", slot: [6], eqp: [564], orig: 398, aaw: 17, aabo: 1 },
  { id: 399, type: [110, 4], name: "バタビア沖棲姫 [乙]", slot: [6], eqp: [564], orig: 398, aaw: 18, aabo: 1 },
  { id: 400, type: [110, 4], name: "バタビア沖棲姫 [甲]", slot: [6], eqp: [564], orig: 398, aaw: 20, aabo: 1 },
  { id: 401, type: [110, 4], name: "バタビア沖棲姫-壊 [丙]", slot: [6], eqp: [564], orig: 398, aaw: 18, aabo: 1 },
  { id: 402, type: [110, 4], name: "バタビア沖棲姫-壊 [乙]", slot: [6], eqp: [564], orig: 398, aaw: 20, aabo: 1 },
  { id: 403, type: [110, 4], name: "バタビア沖棲姫-壊 [甲]", slot: [6], eqp: [564], orig: 398, aaw: 22, aabo: 1 },
  { id: 404, type: [5], name: "軽巡ヘ級改flagship", slot: [], eqp: [], orig: 6, aaw: 12, aabo: 1 },
  { id: 405, type: [5], name: "軽巡ヘ級改flagship", slot: [], eqp: [], orig: 6, aaw: 14, aabo: 1 },
  { id: 406, type: [110, 1], name: "空母棲姫改 [丙]", slot: [56, 52, 48, 30], eqp: [581, 557, 558, 583], orig: 86, aaw: 25, aabo: 2 },
  { id: 407, type: [110, 1], name: "空母棲姫改 [乙]", slot: [58, 52, 50, 30], eqp: [581, 582, 558, 583], orig: 86, aaw: 26, aabo: 2 },
  { id: 408, type: [110, 1], name: "空母棲姫改 [甲]", slot: [60, 52, 56, 30], eqp: [581, 582, 583, 583], orig: 86, aaw: 28, aabo: 2 },
  { id: 409, type: [110, 5], name: "防空巡棲姫 [丙]", slot: [], eqp: [], orig: 409, aaw: 201, aabo: 20 },
  { id: 410, type: [110, 5], name: "防空巡棲姫 [乙]", slot: [], eqp: [], orig: 409, aaw: 201, aabo: 20 },
  { id: 411, type: [110, 5], name: "防空巡棲姫 [甲]", slot: [], eqp: [], orig: 409, aaw: 201, aabo: 20 },
  { id: 412, type: [110, 5], name: "防空巡棲姫-壊 [丙]", slot: [], eqp: [], orig: 409, aaw: 231, aabo: 20 },
  { id: 413, type: [110, 5], name: "防空巡棲姫-壊 [乙]", slot: [], eqp: [], orig: 409, aaw: 233, aabo: 20 },
  { id: 414, type: [110, 5], name: "防空巡棲姫-壊 [甲]", slot: [], eqp: [], orig: 409, aaw: 234, aabo: 20 },
  { id: 415, type: [110, 8], name: "潜水棲姫改flagship [丙]", slot: [], eqp: [], orig: 415, aaw: 0, aabo: 0 },
  { id: 416, type: [110, 8], name: "潜水棲姫改flagship [乙]", slot: [], eqp: [], orig: 415, aaw: 0, aabo: 0 },
  { id: 417, type: [110, 8], name: "潜水棲姫改flagship　[甲]", slot: [], eqp: [], orig: 415, aaw: 0, aabo: 0 },
  { id: 418, type: [110, 8], name: "潜水棲姫改-壊flagship [丙]", slot: [], eqp: [], orig: 415, aaw: 0, aabo: 0 },
  { id: 419, type: [110, 8], name: "潜水棲姫改-壊flagship [乙]", slot: [], eqp: [], orig: 415, aaw: 0, aabo: 0 },
  { id: 420, type: [110, 8], name: "潜水棲姫改-壊flagship [甲]", slot: [], eqp: [], orig: 415, aaw: 0, aabo: 0 },
];

const ENEMY_PLANE_DATA = [
  { id: 519, type: 1, name: '深海棲艦戦', aa: 2 },
  { id: 520, type: 1, name: '深海棲艦戦 Mark.II', aa: 5 },
  { id: 521, type: 1, name: '深海棲艦戦 Mark.III', aa: 9 },
  { id: 547, type: 1, name: '深海猫艦戦', aa: 10 },
  { id: 556, type: 1, name: '深海猫艦戦改', aa: 12 },
  { id: 572, type: 1, name: '深海熊猫艦戦', aa: 18 },
  { id: 581, type: -1, name: '夜猫深海艦戦', aa: 11 },
  { id: 516, type: 2, name: '深海棲艦攻', aa: 0 },
  { id: 517, type: 2, name: '深海棲艦攻 Mark.II', aa: 0 },
  { id: 518, type: 2, name: '深海棲艦攻 Mark.III', aa: 4 },
  { id: 549, type: 2, name: '深海復讐艦攻', aa: 4 },
  { id: 558, type: 2, name: '深海復讐艦攻改', aa: 5 },
  { id: 574, type: 2, name: '深海攻撃哨戒鷹', aa: 8 },
  { id: 575, type: 2, name: '深海攻撃哨戒鷹改', aa: 9 },
  { id: 586, type: 2, name: '深海攻撃哨戒鷹改二', aa: 10 },
  { id: 583, type: -2, name: '夜復讐深海艦攻', aa: 6 },
  { id: 523, type: 3, name: '深海棲艦爆', aa: 0 },
  { id: 524, type: 3, name: '深海棲艦爆 Mark.II', aa: 0 },
  { id: 546, type: 3, name: '飛び魚艦爆', aa: 8 },
  { id: 548, type: 3, name: '深海地獄艦爆', aa: 0 },
  { id: 557, type: 3, name: '深海地獄艦爆改', aa: 0 },
  { id: 561, type: 3, name: '深海解放陸爆', aa: 3 },
  { id: 562, type: 3, name: '深海解放陸爆Ace', aa: 5 },
  { id: 566, type: 3, name: '深海猫艦戦(爆装)', aa: 7 },
  { id: 582, type: 3, name: '夜深海艦爆', aa: 5 },
  { id: 525, type: 5, name: '深海棲艦偵察機', aa: 1 },
  { id: 526, type: 5, name: '飛び魚偵察機', aa: 2 },
  { id: 564, type: 5, name: '深海水上偵察観測機', aa: 2 },
  { id: 569, type: 5, name: '深海偵察飛行艇', aa: 1 },
  { id: 554, type: 6, name: '深海水上攻撃機', aa: 4 },
  { id: 555, type: 6, name: '深海水上攻撃機改', aa: 9 },
  { id: 571, type: 6, name: '深海水母小鬼機', aa: 11 },
  { id: 573, type: 6, name: '深海潜水下駄履き', aa: 6 },
  { id: 594, type: 101, name: '深海空要塞(偵察型)', aa: 9 },
  { id: 595, type: 101, name: '深海空要塞Ace(偵察型)', aa: 17 },
  { id: 597, type: 101, name: '深海空要塞(重爆型)', aa: 9 },
  { id: 598, type: 101, name: '深海空要塞Ace(重爆型)', aa: 17 },
]

// 難易度
const DIFFICULTY = [
  { id: 0, name: '丁' },
  { id: 1, name: '丙' },
  { id: 2, name: '乙' },
  { id: 3, name: '甲' }
];

// 海域
const WORLD_DATA = [
  { world: 1, name: '鎮守府海域' },
  { world: 2, name: '南西諸島海域' },
  { world: 3, name: '北方海域' },
  { world: 7, name: '南西海域' },
  { world: 4, name: '西方海域' },
  { world: 5, name: '南方海域' },
  { world: 6, name: '中部海域' },
  { world: 1911, name: '進撃！第二次作戦「南方作戦」（2019秋イベ）' },
];

// マップ
const MAP_DATA = [
  { area: 11, name: '鎮守府正面海域' },
  { area: 12, name: '南西諸島沖' },
  { area: 13, name: '製油所地帯沿岸' },
  { area: 14, name: '南西諸島防衛線' },
  { area: 15, name: '鎮守府近海' },
  { area: 16, name: '鎮守府近海航路' },
  { area: 21, name: '南西諸島近海' },
  { area: 22, name: 'バシー海峡' },
  { area: 23, name: '東部オリョール海' },
  { area: 24, name: '沖ノ鳥海域' },
  { area: 25, name: '沖ノ鳥沖' },
  { area: 31, name: 'モーレイ海' },
  { area: 32, name: 'キス島沖' },
  { area: 33, name: 'アルフォンシーノ方面' },
  { area: 34, name: '北方海域全域' },
  { area: 35, name: '北方AL海域' },
  { area: 41, name: 'ジャム島沖' },
  { area: 42, name: 'カレー洋海域' },
  { area: 43, name: 'リランカ島' },
  { area: 44, name: 'カスガダマ等' },
  { area: 45, name: 'カレー洋リランカ島沖' },
  { area: 51, name: '南方海域前面' },
  { area: 52, name: '珊瑚諸島沖' },
  { area: 53, name: 'サブ島沖海域' },
  { area: 54, name: 'サーモン海域' },
  { area: 55, name: 'サーモン海域北方' },
  { area: 61, name: '中部海域哨戒線' },
  { area: 62, name: 'MS諸島沖' },
  { area: 63, name: 'グアノ環礁沖海域' },
  { area: 64, name: '中部北海域ピーコック島沖' },
  { area: 65, name: 'KW環礁沖海域' },
  { area: 71, name: 'ブルネイ泊地沖' },
  { area: 72, name: 'タウイタウイ泊地沖' },
  { area: 19111, name: 'マカッサル沖/バリ島沖' },
  { area: 19112, name: 'ジャワ沖/ダーウィン沖' },
  { area: 19113, name: 'ジャワ海/スラバヤ沖' },
  { area: 19114, name: 'バタビア沖' },
  { area: 19115, name: 'ダバオ沖/太平洋南西部' },
  { area: 19116, name: 'ソロモン諸島沖' }
];

// 戦闘マス
const ENEMY_PATTERN = [
  {
    area: 11, lv: -1, cell: [
      { type: 1, form: 1, name: 'A', enemies: [1], range: 0, coords: '219,112,246,149' },
      { type: 1, form: 1, name: 'B', enemies: [1, 1], range: 0, coords: '319,63,349,99' },
      { type: 1, form: 1, name: 'C', enemies: [5, 3, 2, 2], range: 0, coords: '321,167,355,213' }
    ]
  },
  {
    area: 12, lv: -1, cell: [
      { type: 1, form: 1, name: 'A', enemies: [6, 2, 2], range: 0, coords: '178,52,202,87' },
      { type: 1, form: 1, name: 'C', enemies: [6, 2, 2], range: 0, coords: '266,185,292,218' },
      { type: 1, form: 1, name: 'D', enemies: [6, 3, 2, 2], range: 0, coords: '303,52,327,87' },
      { type: 1, form: 1, name: 'E', enemies: [6, 8, 8, 3, 3], range: 0, coords: '366,120,398,167' }
    ]
  },
  {
    area: 13, lv: -1, cell: [
      { type: 1, form: 1, name: 'C', enemies: [6, 3, 2, 2], range: 0, coords: '313,190,339,222' },
      { type: 1, form: 1, name: 'E', enemies: [6, 3, 2, 2], range: 0, coords: '293,142,320,179' },
      { type: 1, form: 2, name: 'F', enemies: [9, 9, 2, 2], range: 0, coords: '222,178,247,212' },
      { type: 1, form: 2, name: 'J', enemies: [11, 8, 6, 2, 2], range: 0, coords: '110,176,143,217' }
    ]
  },
  {
    area: 14, lv: -1, cell: [
      { type: 1, form: 2, name: 'B', enemies: [9, 6, 1, 1, 1], range: 0, coords: '107,70,129,107' },
      { type: 1, form: 2, name: 'D', enemies: [9, 6, 1, 1, 1], range: 0, coords: '173,175,200,212' },
      { type: 1, form: 3, name: 'H', enemies: [10, 10, 9, 6, 2, 2], range: 0, coords: '306,126,330,159' },
      { type: 1, form: 3, name: 'I', enemies: [10, 10, 9, 5, 1, 1], range: 0, coords: '337,43,368,68' },
      { type: 1, form: 2, name: 'J', enemies: [11, 10, 10, 6, 2, 2], range: 0, coords: '348,163,372,199' },
      { type: 1, form: 3, name: 'L', enemies: [12, 12, 9, 6, 2, 2], range: 0, coords: '393,112,427,147' }
    ]
  },
  {
    area: 15, lv: -1, cell: [
      { type: 1, form: 4, name: 'A', enemies: [32, 30, 30], range: 0, coords: '192,70,220,105' },
      { type: 1, form: 1, name: 'C', enemies: [55, 59, 59, 75, 75, 75], range: 0, coords: '257,105,283,136' },
      { type: 1, form: 4, name: 'D', enemies: [33, 31, 31], range: 0, coords: '286,50,314,78' },
      { type: 1, form: 4, name: 'E', enemies: [33, 32, 32], range: 0, coords: '309,115,336,143' },
      { type: 1, form: 4, name: 'F', enemies: [33, 32, 32, 32], range: 0, coords: '343,77,372,109' },
      { type: 1, form: 1, name: 'H', enemies: [55, 59, 59, 75, 75, 75], range: 0, coords: '386,176,415,206' },
      { type: 1, form: 3, name: 'I', enemies: [28, 55, 55, 75, 75], range: 0, coords: '406,112,435,146' },
      { type: 1, form: 4, name: 'J', enemies: [72, 33, 33, 30], range: 0, coords: '293,175,332,214' },
    ]
  },
  {
    area: 16, lv: -1, cell: [
      { type: 1, form: 1, name: 'B', enemies: [55, 23, 75, 75, 1, 1], range: 0, coords: '133,146,163,174' },
      { type: 1, form: 4, name: 'C', enemies: [32, 32, 30, 30, 30], range: 0, coords: '157,124,188,150' },
      { type: 1, form: 3, name: 'D', enemies: [79, 23, 23, 92, 75, 75], range: 0, coords: '153,93,191,120' },
      { type: 1, form: 4, name: 'E', enemies: [32, 32, 30, 30, 30], range: 0, coords: '179,195,207,223' },
      { type: 1, form: 3, name: 'F', enemies: [28, 25, 92, 1, 1, 1], range: 0, coords: '185,167,222,192' },
      { type: 1, form: 4, name: 'I', enemies: [35, 32, 32, 30, 30], range: 0, coords: '246,94,277,120' },
      { type: 1, form: 3, name: 'J', enemies: [65, 10, 10, 92, 75, 75], range: 0, coords: '292,55,321,82' },
      { type: 1, form: 2, name: 'K', enemies: [27, 24, 20, 75, 1, 1], range: 0, coords: '326,124,357,151' },
      { type: 1, form: 3, name: 'L', enemies: [79, 79, 23, 92, 1, 1], range: 0, coords: '324,93,358,119' }
    ]
  },
  {
    area: 21, lv: -1, cell: [
      { type: 1, form: 3, name: 'A', enemies: [23, 18, 26, 26, 75, 75], range: 0, coords: '37,128,66,158' },
      { type: 1, form: 2, name: 'C', enemies: [22, 22, 6, 1, 1, 1], range: 0, coords: '134,119,159,146' },
      { type: 1, form: 3, name: 'D', enemies: [23, 23, 22, 18, 75, 75], range: 0, coords: '251,145,278,176' },
      { type: 1, form: 3, name: 'F', enemies: [25, 25, 22, 18, 75, 75], range: 0, coords: '358,102,387,130' },
      { type: 1, form: 3, name: 'H', enemies: [24, 25, 25, 22, 75, 75], range: 0, coords: '351,158,398,201' }]
  },
  {
    area: 22, lv: -1, cell: [
      { type: 1, form: 3, name: 'B', enemies: [26, 26, 18, 75, 75, 75], range: 0, coords: '112,172,137,199' },
      { type: 1, form: 3, name: 'D', enemies: [26, 26, 18, 75, 75, 75], range: 0, coords: '200,187,225,216' },
      { type: 1, form: 2, name: 'E', enemies: [18, 21, 21, 1, 1, 1], range: 0, coords: '238,147,268,179' },
      { type: 1, form: 2, name: 'G', enemies: [24, 24, 22, 18, 1, 1], range: 0, coords: '295,123,326,149' },
      { type: 1, form: 3, name: 'K', enemies: [25, 24, 24, 19, 75, 75], range: 0, coords: '330,179,372,216' }
    ]
  },
  {
    area: 23, lv: -1, cell: [
      { type: 1, form: 2, name: 'A', enemies: [18, 75, 75, 1, 1, 1], range: 0, coords: '84,137,108,168' },
      { type: 1, form: 2, name: 'E', enemies: [18, 75, 75, 1, 1, 1], range: 0, coords: '209,40,237,68' },
      { type: 1, form: 2, name: 'F', enemies: [18, 21, 21, 75, 1, 1], range: 0, coords: '237,106,271,136' },
      { type: 1, form: 2, name: 'J', enemies: [22, 22, 21, 19, 75, 75], range: 0, coords: '301,83,333,114' },
      { type: 1, form: 2, name: 'K', enemies: [22, 22, 21, 19, 75, 75], range: 0, coords: '313,143,344,172' },
      { type: 1, form: 2, name: 'M', enemies: [18, 26, 26, 26, 75, 75], range: 0, coords: '415,93,447,119' },
      { type: 1, form: 1, name: 'N', enemies: [29, 25, 25, 19, 76, 76], range: 0, coords: '399,123,436,162' },
    ]
  },
  {
    area: 24, lv: -1, cell: [
      { type: 1, form: 2, name: 'B', enemies: [22, 22, 22, 19, 76, 76], range: 0, coords: '90,119,117,147' },
      { type: 1, form: 2, name: 'E', enemies: [22, 18, 76, 76, 2, 2], range: 0, coords: '161,186,190,216' },
      { type: 1, form: 3, name: 'F', enemies: [23, 23, 22, 18, 76, 76], range: 0, coords: '170,50,200,83' },
      { type: 1, form: 2, name: 'I', enemies: [55, 76, 76, 75, 75, 75], range: 0, coords: '232,164,264,195' },
      { type: 1, form: 3, name: 'L', enemies: [28, 28, 27, 54, 76, 76], range: 0, coords: '307,109,339,139' },
      { type: 1, form: 3, name: 'M', enemies: [28, 28, 29, 55, 76, 76], range: 0, coords: '327,47,361,74' },
      { type: 1, form: 1, name: 'P', enemies: [29, 29, 29, 55, 76, 76], range: 0, coords: '397,91,435,129' },
    ]
  },
  {
    area: 25, lv: -1, cell: [
      { type: 1, form: 2, name: 'B', enemies: [27, 19, 76, 76, 76, 76], range: 0, coords: '100,86,131,113' },
      { type: 1, form: 3, name: 'C', enemies: [60, 27, 22, 76, 76, 76], range: 0, coords: '137,166,171,198' },
      { type: 1, form: 2, name: 'E', enemies: [27, 27, 27, 54, 76, 76], range: 0, coords: '198,119,235,145' },
      { type: 1, form: 4, name: 'F', enemies: [55, 59, 59, 76, 76, 76], range: 0, coords: '203,46,239,80' },
      { type: 1, form: 2, name: 'J', enemies: [29, 27, 27, 55, 76, 76], range: 0, coords: '319,54,356,87' },
      { type: 1, form: 3, name: 'L', enemies: [28, 23, 23, 29, 76, 76], range: 0, coords: '342,123,380,155' },
      { type: 1, form: 3, name: 'O', enemies: [28, 29, 29, 55, 76, 76], range: 0, coords: '385,92,427,136' }
    ]
  },
  {
    area: 31, lv: -1, cell: [
      { type: 1, form: 2, name: 'B', enemies: [55, 18, 21, 21, 76, 76], range: 0, coords: '155,110,185,138' },
      { type: 1, form: 2, name: 'C', enemies: [27, 55, 18, 76, 76, 76], range: 0, coords: '210,131,243,161' },
      { type: 1, form: 3, name: 'D', enemies: [23, 22, 18, 18, 76, 76], range: 0, coords: '294,87,325,120' },
      { type: 1, form: 2, name: 'F', enemies: [27, 27, 55, 76, 76, 76], range: 0, coords: '388,179,419,210' },
      { type: 1, form: 1, name: 'G', enemies: [28, 29, 29, 76, 76, 26], range: 0, coords: '391,72,434,112' }
    ]
  },
  {
    area: 32, lv: -1, cell: [
      { type: 1, form: 3, name: 'A', enemies: [23, 22, 22, 19, 76, 76], range: 0, coords: '140,110,172,139' },
      { type: 1, form: 2, name: 'C', enemies: [54, 21, 76, 76, 2, 2], range: 0, coords: '164,191,194,220' },
      { type: 1, form: 2, name: 'H', enemies: [24, 24, 22, 19, 76, 76], range: 0, coords: '268,146,299,176' },
      { type: 1, form: 1, name: 'J', enemies: [27, 55, 54, 76, 76, 76], range: 0, coords: '342,177,372,207' },
      { type: 1, form: 3, name: 'K', enemies: [28, 28, 29, 24, 77, 77], range: 0, coords: '398,183,430,215' },
      { type: 1, form: 2, name: 'L', enemies: [55, 19, 77, 77, 77, 26], range: 0, coords: '294,78,333,118' }
    ]
  },
  {
    area: 33, lv: -1, cell: [
      { type: 1, form: 4, name: 'A', enemies: [55, 22, 20, 20, 76, 76], range: 0, coords: '102,160,129,191' },
      { type: 1, form: 1, name: 'B', enemies: [27, 27, 55, 20, 76, 76], range: 0, coords: '159,192,189,222' },
      { type: 1, form: 3, name: 'E', enemies: [23, 23, 23, 22, 76, 76], range: 0, coords: '241,54,269,86' },
      { type: 1, form: 3, name: 'G', enemies: [28, 23, 29, 54, 77, 77], range: 0, coords: '300,105,330,133' },
      { type: 1, form: 1, name: 'K', enemies: [27, 27, 59, 55, 77, 77], range: 0, coords: '367,171,399,203' },
      { type: 1, form: 1, name: 'M', enemies: [29, 29, 23, 55, 77, 77], range: 0, coords: '378,66,419,109' }
    ]
  },
  {
    area: 34, lv: -1, cell: [
      { type: 1, form: 4, name: 'A', enemies: [27, 27, 55, 20, 76, 76], range: 0, coords: '81,81,112,111' },
      { type: 1, form: 4, name: 'B', enemies: [27, 27, 55, 20, 76, 76], range: 0, coords: '125,124,158,158' },
      { type: 1, form: 2, name: 'C', enemies: [29, 29, 23, 54, 76, 76], range: 0, coords: '137,65,171,92' },
      { type: 1, form: 3, name: 'G', enemies: [28, 29, 29, 55, 77, 77], range: 0, coords: '215,153,246,179' },
      { type: 1, form: 2, name: 'H', enemies: [55, 59, 59, 59, 76, 76], range: 0, coords: '237,196,269,227' },
      { type: 1, form: 2, name: 'M', enemies: [29, 60, 60, 55, 77, 77], range: 0, coords: '327,55,361,83' },
      { type: 1, form: 2, name: 'N', enemies: [29, 60, 60, 55, 77, 77], range: 0, coords: '363,153,394,181' },
      { type: 1, form: 1, name: 'P', enemies: [28, 28, 29, 29, 77, 77], range: 0, coords: '399,122,434,160' }
    ]
  },
  {
    area: 35, lv: -1, cell: [
      { type: 1, form: 2, name: 'B', enemies: [54, 27, 42, 21, 75, 75], range: 0, coords: '119,87,149,115' },
      { type: 1, form: 3, name: 'D(司令Lv90以上)強', enemies: [65, 79, 28, 43, 76, 76], range: 0, coords: '208,52,241,83' },
      { type: 1, form: 3, name: 'D(司令Lv90以上)弱', enemies: [79, 28, 43, 22, 75, 75], range: 0, coords: '' },
      { type: 1, form: 3, name: 'D(司令Lv89以下）', enemies: [65, 79, 43, 22, 76, 76], range: 0, coords: '' },
      { type: 1, form: 2, name: 'E(前哨)', enemies: [29, 29, 77, 77, 34, 32], range: 0, coords: '228,118,262,150' },
      { type: 1, form: 2, name: 'E(最終)', enemies: [60, 29, 29, 77, 77, 34], range: 0, coords: '' },
      { type: 1, form: 1, name: 'F', enemies: [55, 27, 21, 21, 76, 76], range: 0, coords: '245,181,280,216' },
      { type: 1, form: 2, name: 'G(前哨)', enemies: [27, 22, 22, 20, 75, 75], range: 0, coords: '301,136,336,172' },
      { type: 1, form: 3, name: 'G(最終)', enemies: [60, 27, 22, 77, 75, 75], range: 0, coords: '' },
      { type: 1, form: 3, name: 'H(司令Lv85以上 前哨)', enemies: [87, 49, 50, 51, 50, 51], range: 0, coords: '311,66,343,99' },
      { type: 1, form: 3, name: 'H(司令Lv85以上 最終)', enemies: [88, 49, 50, 51, 50, 51], range: 0, coords: '' },
      { type: 1, form: 3, name: 'H(司令Lv84以下 前哨)', enemies: [89, 49, 50, 51, 50, 51], range: 0, coords: '' },
      { type: 1, form: 3, name: 'H(司令Lv84以下 最終)', enemies: [90, 49, 50, 51, 50, 51], range: 0, coords: '' },
      { type: 1, form: 2, name: 'K(前哨)', enemies: [91, 26, 26, 29, 76, 76], range: 0, coords: '370,81,407,117' },
      { type: 1, form: 1, name: 'K(最終)', enemies: [91, 58, 58, 43, 78, 78], range: 0, coords: '' },
    ]
  },
  {
    area: 41, lv: -1, cell: [
      { type: 1, form: 2, name: 'A', enemies: [54, 59, 21, 21, 76, 76], range: 0, coords: '92,106,121,137' },
      { type: 1, form: 2, name: 'C', enemies: [27, 19, 19, 76, 75, 75], range: 0, coords: '180,84,209,114' },
      { type: 1, form: 4, name: 'D', enemies: [32, 30, 30, 30, 30], range: 0, coords: '234,168,265,201' },
      { type: 1, form: 2, name: 'E', enemies: [58, 58, 29, 29, 75, 75], range: 0, coords: '247,69,280,98' },
      { type: 1, form: 2, name: 'G', enemies: [42, 42, 76, 76, 76, 76], range: 0, coords: '309,190,344,221' },
      { type: 1, form: 2, name: 'H', enemies: [27, 27, 55, 54, 76, 76], range: 0, coords: '326,124,355,154' },
      { type: 1, form: 1, name: 'J', enemies: [27, 27, 23, 55, 76, 76], range: 0, coords: '381,119,418,160' }
    ]
  },
  {
    area: 42, lv: -1, cell: [
      { type: 1, form: 2, name: 'A', enemies: [27, 54, 18, 18, 76, 76], range: 0, coords: '301,75,333,108' },
      { type: 1, form: 4, name: 'B', enemies: [33, 33, 30, 30, 20], range: 0, coords: '284,173,318,205' },
      { type: 1, form: 3, name: 'C', enemies: [60, 27, 27, 54, 76, 76], range: 0, coords: '219,117,250,147' },
      { type: 1, form: 3, name: 'D', enemies: [28, 28, 29, 55, 76, 76], range: 0, coords: '200,189,229,218' },
      { type: 1, form: 3, name: 'E', enemies: [60, 27, 54, 18, 76, 76], range: 0, coords: '201,47,232,78' },
      { type: 1, form: 3, name: 'G', enemies: [58, 26, 26, 54, 76, 76], range: 0, coords: '116,93,147,119' },
      { type: 1, form: 4, name: 'H', enemies: [33, 33, 30, 30, 30, 30], range: 0, coords: '104,162,133,195' },
      { type: 1, form: 2, name: 'L', enemies: [43, 28, 58, 58, 77, 77], range: 0, coords: '141,124,178,164' }
    ]
  },
  {
    area: 43, lv: -1, cell: [
      { type: 1, form: 4, name: 'A', enemies: [33, 30, 30, 20, 76, 76], range: 0, coords: '299,79,327,104' },
      { type: 1, form: 4, name: 'C', enemies: [33, 33, 30, 30, 30], range: 0, coords: '270,164,299,194' },
      { type: 1, form: 2, name: 'D', enemies: [27, 55, 19, 18, 76, 76], range: 0, coords: '249,125,280,154' },
      { type: 1, form: 3, name: 'F', enemies: [28, 23, 43, 55, 77, 77], range: 0, coords: '213,186,241,216' },
      { type: 1, form: 2, name: 'G', enemies: [27, 55, 55, 19, 76, 76], range: 0, coords: '203,94,234,124' },
      { type: 1, form: 3, name: 'H', enemies: [23, 42, 22, 18, 77, 77], range: 0, coords: '180,160,213,190' },
      { type: 1, form: 2, name: 'I', enemies: [43, 42, 23, 18, 76, 76], range: 0, coords: '137,120,166,145' },
      { type: 1, form: 2, name: 'L', enemies: [27, 19, 19, 76, 75, 75], range: 0, coords: '62,153,93,186' },
      { type: 1, form: 3, name: 'N', enemies: [73, 60, 76, 76, 13, 13], range: 0, coords: '124,157,163,199' }
    ]
  },
  {
    area: 44, lv: -1, cell: [
      { type: 1, form: 2, name: 'A', enemies: [27, 27, 55, 76, 1, 1], range: 0, coords: '305,97,335,124' },
      { type: 1, form: 2, name: 'B', enemies: [27, 55, 76, 76, 32], range: 0, coords: '295,147,327,178' },
      { type: 1, form: 4, name: 'E', enemies: [35, 32, 30, 30], range: 0, coords: '226,95,259,124' },
      { type: 1, form: 3, name: 'F', enemies: [28, 23, 43, 55, 77, 77], range: 0, coords: '216,176,246,209' },
      { type: 1, form: 2, name: 'G', enemies: [43, 43, 23, 77, 77, 1], range: 0, coords: '167,48,197,76' },
      { type: 1, form: 3, name: 'H', enemies: [28, 29, 27, 27, 77, 77], range: 0, coords: '154,198,191,228' },
      { type: 1, form: 2, name: 'I', enemies: [27, 27, 55, 77, 77, 77], range: 0, coords: '149,113,182,141' },
      { type: 1, form: 3, name: 'K', enemies: [45, 43, 43, 77, 77, 31], range: 0, coords: '91,131,131,170' }
    ]
  },
  {
    area: 45, lv: -1, cell: [
      { type: 1, form: 4, name: 'B', enemies: [71, 33, 33, 30, 30], range: 0, coords: '373,185,400,215' },
      { type: 1, form: 4, name: 'D', enemies: [35, 35, 30, 30, 30], range: 0, coords: '332,119,361,151' },
      { type: 1, form: 2, name: 'E', enemies: [66, 27, 27, 92, 76, 76], range: 0, coords: '319,195,349,227' },
      { type: 1, form: 4, name: 'F', enemies: [33, 33, 33, 30, 30], range: 0, coords: '308,38,342,74' },
      { type: 1, form: 2, name: 'G', enemies: [66, 27, 27, 92, 76, 76], range: 0, coords: '296,94,325,125' },
      { type: 1, form: 2, name: 'H', enemies: [66, 42, 42, 95, 92, 75], range: 0, coords: '294,144,323,177' },
      { type: 1, form: 2, name: 'J', enemies: [59, 59, 59, 92, 76, 76], range: 0, coords: '256,98,287,131' },
      { type: 1, form: 3, name: 'K', enemies: [55, 79, 79, 67, 67, 55], range: 0, coords: '245,171,276,203' },
      { type: 1, form: 3, name: 'N', enemies: [58, 26, 26, 54, 76, 76], range: 0, coords: '149,139,184,173' },
      { type: 1, form: 4, name: 'O', enemies: [71, 71, 30, 30, 30, 30], range: 0, coords: '145,82,177,113' },
      { type: 1, form: 1, name: 'S', enemies: [60, 43, 95, 92, 77, 77], range: 0, coords: '61,96,93,128' },
      { type: 1, form: 1, name: 'T(前哨)', enemies: [73, 50, 51, 67, 77, 77], range: 0, coords: '220,120,255,157' },
      { type: 1, form: 1, name: 'T(最終)', enemies: [113, 49, 50, 67, 95, 58], range: 0, coords: '' }]
  },
  {
    area: 51, lv: -1, cell: [
      { type: 1, form: 2, name: 'B', enemies: [27, 27, 55, 91, 76, 76], range: 0, coords: '133,115,158,146' },
      { type: 1, form: 3, name: 'D', enemies: [79, 79, 60, 92, 76, 76], range: 0, coords: '178,181,208,212' },
      { type: 1, form: 4, name: 'E', enemies: [34, 32, 32, 30, 30, 30], range: 0, coords: '227,181,258,213' },
      { type: 1, form: 3, name: 'F', enemies: [23, 95, 94, 91, 76, 76], range: 0, coords: '271,116,301,150' },
      { type: 1, form: 2, name: 'G', enemies: [43, 42, 23, 91, 76, 76], range: 0, coords: '289,159,317,193' },
      { type: 1, form: 3, name: 'J', enemies: [79, 79, 43, 55, 77, 77], range: 0, coords: '351,158,386,202' }
    ]
  },
  {
    area: 52, lv: -1, cell: [
      { type: 3, form: 3, name: 'C', enemies: [79, 79, 27, 55, 76, 76], range: 0, coords: '320,164,354,200' },
      { type: 1, form: 3, name: 'D', enemies: [26, 26, 26, 54, 75, 75], range: 0, coords: '222,143,251,173' },
      { type: 1, form: 3, name: 'E', enemies: [79, 43, 55, 92, 76, 76], range: 0, coords: '198,178,229,211' },
      { type: 1, form: 3, name: 'F', enemies: [79, 27, 27, 55, 76, 76], range: 0, coords: '157,124,184,151' },
      { type: 1, form: 3, name: 'I', enemies: [119, 65, 95, 92, 76, 76], range: 0, coords: '108,128,140,160' },
      { type: 1, form: 2, name: 'K', enemies: [27, 27, 54, 76, 76, 76], range: 0, coords: '80,159,108,192' },
      { type: 3, form: 3, name: 'L', enemies: [79, 79, 27, 55, 76, 76], range: 0, coords: '57,77,91,108' },
      { type: 1, form: 3, name: 'O', enemies: [119, 95, 95, 92, 76, 76], range: 0, coords: '122,181,160,219' }
    ]
  },
  {
    area: 53, lv: -1, cell: [
      { type: 1, form: 2, name: 'C', enemies: [55, 92, 76, 76, 76, 76], range: 0, coords: '163,61,189,88' },
      { type: 1, form: 3, name: 'M', enemies: [79, 79, 79, 92, 77, 77], range: 0, coords: '294,48,325,77' },
      { type: 1, form: 2, name: 'Q(強)', enemies: [48, 60, 60, 92, 77, 77], range: 0, coords: '176,101,210,143' },
      { type: 1, form: 2, name: 'Q(弱)', enemies: [48, 92, 92, 77, 77, 77], range: 0, coords: '' }
    ]
  },
  {
    area: 54, lv: -1, cell: [
      { type: 1, form: 1, name: 'C', enemies: [55, 91, 77, 77, 32, 32], range: 0, coords: '161,54,190,85' },
      { type: 1, form: 2, name: 'E', enemies: [55, 18, 92, 77, 77, 1], range: 0, coords: '198,120,222,150' },
      { type: 1, form: 3, name: 'G', enemies: [115, 115, 43, 95, 91, 77], range: 0, coords: '235,57,265,97' },
      { type: 1, form: 3, name: 'L', enemies: [43, 43, 95, 91, 77, 77], range: 0, coords: '326,105,360,141' },
      { type: 1, form: 3, name: 'P', enemies: [58, 264, 43, 95, 77, 77], range: 0, coords: '373,83,410,125' }
    ]
  },
  {
    area: 55, lv: -1, cell: [
      { type: 1, form: 4, name: 'B', enemies: [35, 33, 32, 32, 30, 30], range: 0, coords: '134,66,158,97' },
      { type: 1, form: 2, name: 'C', enemies: [54, 91, 76, 76, 76, 76], range: 0, coords: '137,162,160,193' },
      { type: 1, form: 3, name: 'H', enemies: [65, 65, 55, 92, 77, 77], range: 0, coords: '208,124,233,157' },
      { type: 1, form: 3, name: 'J', enemies: [65, 65, 92, 77, 77, 32], range: 0, coords: '226,77,253,110' },
      { type: 1, form: 3, name: 'K', enemies: [65, 65, 60, 92, 77, 77], range: 0, coords: '240,39,268,73' },
      { type: 1, form: 2, name: 'N', enemies: [59, 59, 91, 91, 77, 77], range: 0, coords: '284,134,309,166' },
      { type: 1, form: 2, name: 'P', enemies: [62, 29, 29, 91, 77, 77], range: 0, coords: '329,83,355,118' },
      { type: 1, form: 2, name: 'S(クリア前)Wレ', enemies: [48, 62, 62, 91, 77, 77], range: 0, coords: '387,119,425,168' },
      { type: 1, form: 3, name: 'S(クリア前)', enemies: [65, 65, 48, 77, 77, 31], range: 0, coords: '' },
      { type: 1, form: 3, name: 'S(クリア後)1', enemies: [65, 28, 62, 77, 77, 33], range: 0, coords: '' },
      { type: 1, form: 2, name: 'S(クリア後)2', enemies: [62, 43, 79, 77, 77, 33], range: 0, coords: '' }
    ]
  },
  {
    area: 61, lv: -1, cell: [
      { type: 1, form: 2, name: 'C', enemies: [29, 60, 27, 91, 76, 76], range: 0, coords: '165,124,190,156' },
      { type: 1, form: 3, name: 'D', enemies: [54, 16, 16, 75, 75], range: 0, coords: '191,48,220,77' },
      { type: 1, form: 3, name: 'F', enemies: [55, 26, 26, 75, 75], range: 0, coords: '217,95,244,126' },
      { type: 1, form: 3, name: 'H', enemies: [27, 16, 16, 91, 76, 76], range: 0, coords: '275,190,302,221' },
      { type: 1, form: 3, name: 'I', enemies: [85, 79, 27, 91, 76, 76], range: 0, coords: '286,58,314,92' },
      { type: 1, form: 1, name: 'J', enemies: [58, 58, 55, 55, 77, 77], range: 0, coords: '373,190,404,223' },
      { type: 1, form: 3, name: 'K', enemies: [79, 27, 92, 92, 78, 78], range: 0, coords: '374,122,415,164' }
    ]
  },
  {
    area: 62, lv: -1, cell: [
      { type: 1, form: 3, name: 'B', enemies: [27, 23, 23, 91, 75, 75], range: 0, coords: '128,85,149,115' },
      { type: 1, form: 3, name: 'C', enemies: [60, 60, 24, 91, 75, 75], range: 0, coords: '147,143,172,174' },
      { type: 1, form: 3, name: 'F', enemies: [79, 79, 92, 76, 75, 75], range: 0, coords: '233,130,258,160' },
      { type: 1, form: 2, name: 'H', enemies: [29, 29, 60, 91, 77, 78], range: 0, coords: '298,55,323,86' },
      { type: 1, form: 3, name: 'I', enemies: [29, 29, 60, 91, 77, 78], range: 0, coords: '309,150,336,180' },
      { type: 1, form: 3, name: 'J', enemies: [65, 29, 92, 77, 76, 76], range: 0, coords: '355,154,384,186' },
      { type: 1, form: 3, name: 'K', enemies: [58, 79, 67, 92, 78, 78], range: 0, coords: '378,59,413,99' }
    ]
  },
  {
    area: 63, lv: -1, cell: [
      { type: 1, form: 1, name: 'B', enemies: [55, 76, 76], range: 0, coords: '130,69,155,100' },
      { type: 1, form: 4, name: 'C', enemies: [71, 33, 32, 30, 30], range: 0, coords: '154,162,180,196' },
      { type: 1, form: 2, name: 'D', enemies: [55, 76, 76, 76], range: 0, coords: '182,58,207,89' },
      { type: 1, form: 2, name: 'E', enemies: [92, 21, 21, 75, 75], range: 0, coords: '211,108,240,145' },
      { type: 1, form: 2, name: 'F', enemies: [95, 22, 20, 75, 75], range: 0, coords: '272,174,301,208' },
      { type: 1, form: 1, name: 'J', enemies: [43, 43, 27, 97, 78, 78], range: 0, coords: '374,83,406,125' },
      { type: 1, form: 1, name: 'J(最終)', enemies: [97, 43, 43, 27, 78, 78], range: 0, coords: '' }
    ]
  },
  {
    area: 64, lv: -1, cell: [
      { type: 1, form: 1, name: 'A', enemies: [54, 59, 59, 77, 76, 76], range: 1, coords: '80,69,103,96' },
      { type: 1, form: 1, name: 'B', enemies: [54, 77, 77, 76, 76], range: 1, coords: '86,145,111,174' },
      { type: 1, form: 1, name: 'C', enemies: [29, 29, 55, 76, 76, 23], range: 3, coords: '135,179,160,207' },
      { type: 3, form: 1, name: 'D', enemies: [169], range: 2, coords: '151,104,186,137' },
      { type: 1, form: 1, name: 'E', enemies: [27, 54, 75, 75, 32, 32], range: 2, coords: '168,52,197,84' },
      { type: 3, form: 1, name: 'F', enemies: [169], range: 4, coords: '190,184,225,214' },
      { type: 3, form: 1, name: 'G', enemies: [169], range: 3, coords: '217,87,255,118' },
      { type: 1, form: 1, name: 'H', enemies: [29, 29, 55, 78, 78, 23], range: 7, coords: '263,193,289,228' },
      { type: 3, form: 3, name: 'I', enemies: [169, 23, 75, 75, 75], range: 6, coords: '284,71,324,104' },
      { type: 1, form: 3, name: 'J', enemies: [118, 67, 95, 92, 76, 76], range: 6, coords: '294,140,324,173' },
      { type: 1, form: 3, name: 'K', enemies: [117, 43, 27, 54, 76, 76], range: 7, coords: '337,187,361,218' },
      { type: 1, form: 3, name: 'L', enemies: [60, 60, 27, 54, 75, 75], range: 7, coords: '338,94,366,128' },
      { type: 1, form: 4, name: 'M', enemies: [72, 71, 71, 70, 70], range: 7, coords: '369,142,404,177' },
      { type: 1, form: 1, name: 'N', enemies: [171, 167, 166, 165, 153, 58], range: 5, coords: '219,134,263,174' },
      { type: 1, form: 1, name: 'N(最終)', enemies: [156, 167, 166, 165, 156, 55], range: 5, coords: '' }
    ]
  },
  {
    area: 65, lv: -1, cell: [
      { type: 3, form: 3, name: '空襲(前哨)', enemies: [86, 115, 92, 77, 77, 77], range: 1, coords: '' },
      { type: 3, form: 3, name: '空襲(最終)', enemies: [86, 115, 115, 92, 78, 78], range: 1, coords: '51,90,88,124' },
      { type: 1, form: 1, name: 'A', enemies: [55, 55, 54, 54, 77, 77], range: 1, coords: '121,84,149,118' },
      { type: 1, form: 4, name: 'B', enemies: [34, 34, 32, 32, 32], range: 1, coords: '158,166,189,203' },
      { type: 1, form: 3, name: 'C', enemies: [118, 43, 95, 95, 77, 77], range: 2, coords: '176,115,204,147' },
      { type: 1, form: 3, name: 'D', enemies: [60, 60, 95, 92, 77, 77], range: 3, coords: '219,83,246,119' },
      { type: 1, form: 4, name: 'E', enemies: [72, 72, 71, 71, 71, 71], range: 3, coords: '232,146,258,176' },
      { type: 1, form: 2, name: 'F', enemies: [66, 59, 59, 55, 76, 76], range: 2, coords: '234,181,262,212' },
      { type: 3, form: 3, name: 'G', enemies: [86, 115, 115, 92, 78, 78], range: 4, coords: '283,85,317,117' },
      { type: 3, form: 3, name: 'H', enemies: [115, 115, 92, 77, 77, 77], range: 4, coords: '294,136,333,168' },
      { type: 3, form: 3, name: 'H(最終)', enemies: [86, 115, 92, 78, 78, 78], range: 4, coords: '' },
      { type: 1, form: 3, name: 'I', enemies: [60, 60, 92, 77, 75, 75], range: 3, coords: '306,191,333,222' },
      { type: 1, form: 3, name: 'I(最終)', enemies: [60, 60, 55, 92, 77, 77], range: 3, coords: '' },
      // { type: 4, form: 3, name: 'K', enemies: [60, 55, 91, 76, 75, 75], range: 4, coords: '' },
      { type: 2, form: 13, name: 'M(弱)', enemies: [86, 115, 27, 92, 76, 76, 55, 27, 75, 75, 75, 75], range: 5, coords: '' },
      { type: 2, form: 13, name: 'M(強/最終)', enemies: [86, 115, 115, 92, 78, 78, 55, 27, 27, 77, 76, 76], range: 5, coords: '362,63,404,110' }
    ]
  },
  {
    area: 71, lv: -1, cell: [
      { type: 1, form: 3, name: 'B', enemies: [60, 27, 27, 54, 76, 76], range: 0, coords: '102,161,125,192' },
      { type: 1, form: 3, name: 'C', enemies: [79, 43, 95, 92, 76, 76], range: 0, coords: '122,56,145,86' },
      { type: 1, form: 4, name: 'D', enemies: [71, 32, 32, 30, 30], range: 0, coords: '168,119,197,150' },
      { type: 1, form: 4, name: 'F', enemies: [33, 33, 31, 31], range: 0, coords: '241,128,268,159' },
      { type: 1, form: 2, name: 'G', enemies: [55, 54, 76, 76, 76], range: 0, coords: '270,79,300,108' },
      { type: 1, form: 4, name: 'H', enemies: [71, 71, 31, 31], range: 0, coords: '343,110,370,139' },
      { type: 1, form: 4, name: 'K', enemies: [72, 33, 33], range: 0, coords: '388,68,429,108' },
    ]
  },
  {
    area: 72, lv: -1, cell: [
      { type: 1, form: 2, name: 'B', enemies: [55, 54, 92, 76, 76, 76], range: 0, coords: '170,190,192,218' },
      { type: 1, form: 4, name: 'C', enemies: [32, 32, 30, 30, 30], range: 0, coords: '208,163,229,194' },
      { type: 1, form: 4, name: 'E', enemies: [32, 32, 32], range: 0, coords: '252,134,277,162' },
      { type: 1, form: 4, name: 'G', enemies: [72, 32, 32, 26, 76, 76], range: 0, coords: '210,74,240,112' },
      { type: 3, form: 3, name: 'H', enemies: [118, 279, 23, 92, 76, 76], range: 0, coords: '323,182,358,219' },
      { type: 1, form: 1, name: 'I', enemies: [27, 55, 54, 76, 76, 76], range: 0, coords: '347,132,370,164' },
      { type: 1, form: 2, name: 'J', enemies: [29, 54, 58, 58, 76, 76], range: 0, coords: '370,69,399,101' },
      { type: 1, form: 3, name: 'M', enemies: [118, 279, 95, 92, 76, 76], range: 0, coords: '384,163,423,209' },
    ]
  },
  {
    area: 19111, lv: 3, cell: [
      { type: 1, form: 4, name: 'A', enemies: [34, 32, 32, 32], range: 0, coords: '' },
      { type: 1, form: 1, name: 'C', enemies: [75, 75, 75, 75], range: 0, coords: '' },
      { type: 1, form: 2, name: 'D', enemies: [92, 95, 95, 75, 75], range: 0, coords: '' },
      { type: 1, form: 1, name: 'G', enemies: [121, 75, 75, 75], range: 0, coords: '' },
      { type: 1, form: 1, name: 'Hボス', enemies: [154, 139, 139, 138], range: 0, coords: '' },
      { type: 1, form: 1, name: 'J', enemies: [55, 76, 76, 75, 75], range: 0, coords: '' },
      { type: 1, form: 1, name: 'Kボス', enemies: [405, 54, 76, 76, 76], range: 0, coords: '' },
    ]
  },
  { area: 19111, lv: 2, cell: [{ type: 1, form: 1, name: 'Hボス', enemies: [153], range: 0, coords: '' }] },
  { area: 19111, lv: 1, cell: [{ type: 1, form: 1, name: 'Hボス', enemies: [153], range: 0, coords: '' }] },
  { area: 19111, lv: 0, cell: [{ type: 1, form: 1, name: 'Hボス', enemies: [153], range: 0, coords: '' }] },

  {
    // 甲
    area: 19112, lv: 3, cell:
      [
        { type: 1, form: 1, name: 'A', enemies: [108, 152], range: 7, coords: '' },
        { type: 1, form: 1, name: 'B', enemies: [108, 152, 152], range: 5, coords: '' },
        { type: 1, form: 1, name: 'C', enemies: [108, 152, 152], range: 4, coords: '' },
        { type: 1, form: 1, name: 'E', enemies: [91], range: 4, coords: '' },
        { type: 1, form: 1, name: 'G', enemies: [280, 92], range: 5, coords: '' },
        { type: 1, form: 1, name: 'H', enemies: [108, 152, 152, 151], range: 5, coords: '' },
        { type: 1, form: 1, name: 'J', enemies: [152, 152], range: 2, coords: '' },
        { type: 1, form: 1, name: 'L', enemies: [151, 151, 151], range: 2, coords: '' },
        { type: 1, form: 1, name: 'N', enemies: [95, 92], range: 3, coords: '' },
        { type: 1, form: 1, name: 'O', enemies: [95, 92], range: 5, coords: '' },
        { type: 1, form: 1, name: 'P', enemies: [92, 95], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Q', enemies: [95, 92], range: 5, coords: '' },
        { type: 1, form: 1, name: 'Rボス(前哨)', enemies: [161, 55, 55, 92], range: 6, coords: '' },
        { type: 1, form: 1, name: 'Rボス(最終)', enemies: [164, 55, 55, 92], range: 6, coords: '' },
      ]
  },
  {
    // 乙
    area: 19112, lv: 2, cell:
      [
        { type: 1, form: 1, name: 'A', enemies: [107, 151], range: 7, coords: '' },
        { type: 1, form: 1, name: 'B', enemies: [107, 151, 150], range: 5, coords: '' },
        // { type: 1, form: 1, name: 'C', enemies: [108, 152, 152], range: 4},
        { type: 1, form: 1, name: 'E', enemies: [91], range: 4, coords: '' },
        { type: 1, form: 1, name: 'G', enemies: [277, 91], range: 5, coords: '' },
        // { type: 1, form: 1, name: 'H', enemies: [108, 152, 152, 151], range: 5},
        { type: 1, form: 1, name: 'J', enemies: [151, 150], range: 2, coords: '' },
        { type: 1, form: 1, name: 'L', enemies: [150, 150, 150], range: 2, coords: '' },
        { type: 1, form: 1, name: 'N', enemies: [94, 91], range: 3, coords: '' },
        { type: 1, form: 1, name: 'O', enemies: [95, 91], range: 5, coords: '' },
        { type: 1, form: 1, name: 'P', enemies: [94, 91], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Q', enemies: [94, 91], range: 5, coords: '' },
        { type: 1, form: 1, name: 'Rボス(前哨)', enemies: [160, 91], range: 6, coords: '' },
        { type: 1, form: 1, name: 'Rボス(最終)', enemies: [163, 91], range: 6, coords: '' },
      ]
  },
  {
    // 丙
    area: 19112, lv: 1, cell:
      [
        { type: 1, form: 1, name: 'A', enemies: [106, 151], range: 7, coords: '' },
        { type: 1, form: 1, name: 'B', enemies: [106, 150, 150], range: 5, coords: '' },
        // { type: 1, form: 1, name: 'C', enemies: [108, 152, 152], range: 4},
        { type: 1, form: 1, name: 'G', enemies: [277, 91], range: 5, coords: '' },
        // { type: 1, form: 1, name: 'H', enemies: [108, 152, 152, 151], range: 5},
        { type: 1, form: 1, name: 'J', enemies: [150, 150], range: 2, coords: '' },
        { type: 1, form: 1, name: 'L', enemies: [150], range: 2, coords: '' },
        { type: 1, form: 1, name: 'N', enemies: [94], range: 3, coords: '' },
        { type: 1, form: 1, name: 'O', enemies: [94, 91], range: 5, coords: '' },
        { type: 1, form: 1, name: 'P', enemies: [94, 91], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Q', enemies: [94, 91], range: 5, coords: '' },
        { type: 1, form: 1, name: 'Rボス(前哨)', enemies: [159, 91], range: 6, coords: '' },
        { type: 1, form: 1, name: 'Rボス(最終)', enemies: [162, 91], range: 6, coords: '' },
      ]
  },
  {
    // 丁
    area: 19112, lv: 0, cell:
      [
        { type: 1, form: 1, name: 'A', enemies: [105, 151], range: 7, coords: '' },
        { type: 1, form: 1, name: 'B', enemies: [105, 150], range: 5, coords: '' },
        { type: 1, form: 1, name: 'C', enemies: [105, 150], range: 4, coords: '' },
        { type: 1, form: 1, name: 'G', enemies: [23, 91], range: 5, coords: '' },
        // { type: 1, form: 1, name: 'H', enemies: [108, 152, 152, 151], range: 5},
        { type: 1, form: 1, name: 'J', enemies: [150], range: 2, coords: '' },
        { type: 1, form: 1, name: 'L', enemies: [150], range: 2, coords: '' },
        { type: 1, form: 1, name: 'N', enemies: [94], range: 3, coords: '' },
        { type: 1, form: 1, name: 'O', enemies: [94, 91], range: 5, coords: '' },
        { type: 1, form: 1, name: 'P', enemies: [94, 91], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Q', enemies: [94, 91], range: 5, coords: '' },
        { type: 1, form: 1, name: 'Rボス(前哨)', enemies: [159], range: 6, coords: '' },
        { type: 1, form: 1, name: 'Rボス(最終)', enemies: [162, 91], range: 6, coords: '' },
      ]
  },
  {
    // 甲
    area: 19113, lv: 3, cell:
      [
        { type: 1, form: 1, name: 'B', enemies: [280, 27, 27, 92], range: 1, coords: '' },
        { type: 1, form: 1, name: 'G', enemies: [27, 27, 92], range: 3, coords: '' },
        { type: 1, form: 1, name: 'I', enemies: [280, 27, 27, 92], range: 4, coords: '' },
        { type: 1, form: 1, name: 'J', enemies: [27, 27, 92], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Mボス', enemies: [397, 92], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(前哨)', enemies: [104, 27, 276], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Oボス(最終)', enemies: [295, 27, 266, 92], range: 6, coords: '' },
      ]
  },
  {
    // 乙
    area: 19113, lv: 2, cell:
      [
        // { type: 1, form: 1, name: 'B', enemies: [280, 27, 27, 92], range: 1},
        { type: 1, form: 1, name: 'G', enemies: [27, 27, 91], range: 3, coords: '' },
        { type: 1, form: 1, name: 'I', enemies: [277, 27, 27, 91], range: 4, coords: '' },
        { type: 1, form: 1, name: 'J', enemies: [27, 27, 91], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Mボス', enemies: [396, 92], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(前哨)', enemies: [103, 27], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Oボス(最終)', enemies: [294, 27, 23], range: 6, coords: '' },
      ]
  },
  {
    // 丙
    area: 19113, lv: 1, cell:
      [
        { type: 1, form: 1, name: 'B', enemies: [277, 22, 92], range: 1, coords: '' },
        { type: 1, form: 1, name: 'G', enemies: [27, 22], range: 3, coords: '' },
        { type: 1, form: 1, name: 'I', enemies: [277, 22, 91], range: 4, coords: '' },
        { type: 1, form: 1, name: 'J', enemies: [55, 27, 22], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Mボス', enemies: [395, 91], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(前哨)', enemies: [103, 22], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Oボス(最終)', enemies: [293, 22], range: 6, coords: '' },
      ]
  },
  {
    // 丁
    area: 19113, lv: 0, cell:
      [
        { type: 1, form: 1, name: 'B', enemies: [262, 27, 91], range: 1, coords: '' },
        { type: 1, form: 1, name: 'G', enemies: [22, 22], range: 3, coords: '' },
        { type: 1, form: 1, name: 'I', enemies: [277, 22, 91], range: 4, coords: '' },
        { type: 1, form: 1, name: 'J', enemies: [55, 22, 22], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Mボス', enemies: [395], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス', enemies: [103], range: 6, coords: '' },
      ]
  },
  {
    // 甲
    area: 19114, lv: 3, cell:
      [
        { type: 3, form: 3, name: '空襲(強)', enemies: [394, 394, 150, 150], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(中)', enemies: [394, 393, 150, 150], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(弱)', enemies: [394, 150, 150], range: 1, coords: '' },
        { type: 1, form: 4, name: 'B', enemies: [72, 33, 33], range: 2, coords: '' },
        { type: 1, form: 2, name: 'C', enemies: [404, 59, 59, 123, 76, 76], range: 3, coords: '' },
        { type: 3, form: 3, name: 'D', enemies: [394, 394, 150, 150], range: 3, coords: '' },
        { type: 1, form: 3, name: 'E', enemies: [280, 27, 27, 92, 77, 77], range: 4, coords: '' },
        { type: 1, form: 4, name: 'F', enemies: [72, 33, 33, 31], range: 4, coords: '' },
        { type: 1, form: 1, name: 'G', enemies: [27, 27, 95, 92, 123, 123], range: 4, coords: '' },
        { type: 1, form: 4, name: 'K', enemies: [72, 33, 33, 31], range: 5, coords: '' },
        { type: 1, form: 2, name: 'L', enemies: [404, 54, 77, 77, 76, 76], range: 5, coords: '' },
        { type: 1, form: 1, name: 'M', enemies: [27, 404, 404, 92, 240, 240], range: 5, coords: '' },
        { type: 1, form: 1, name: 'Pボス', enemies: [397, 43, 55, 92, 243, 243], range: 5, coords: '' },
        { type: 1, form: 4, name: 'Q', enemies: [72, 33, 33], range: 2, coords: '' },
        { type: 3, form: 3, name: 'R', enemies: [400, 279, 262, 92, 243, 243], range: 6, coords: '' },
        { type: 3, form: 3, name: 'R(最終)', enemies: [403, 279, 279, 92, 243, 243], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Sボス(前哨)', enemies: [400, 397, 27, 27, 240, 240, 404, 92, 240, 240, 240, 240], range: 7, coords: '' },
        { type: 2, form: 11, name: 'Sボス(最終)', enemies: [403, 397, 279, 92, 243, 243, 405, 54, 243, 243, 243, 243], range: 7, coords: '' },
      ]
  },
  {
    // 乙
    area: 19114, lv: 2, cell:
      [
        { type: 3, form: 3, name: '空襲(強)', enemies: [393, 150, 150], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(中)', enemies: [392, 150, 150], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(弱)', enemies: [392, 150, 150], range: 1, coords: '' },
        { type: 1, form: 4, name: 'B', enemies: [71, 32, 32], range: 2, coords: '' },
        { type: 1, form: 2, name: 'C', enemies: [54, 59, 59, 77, 1, 1], range: 3, coords: '' },
        // { type: 1, form: 1, name: 'D', enemies: [394, 394, 150, 150], range: 3},
        { type: 1, form: 1, name: 'E', enemies: [277, 27, 27, 91, 77, 1], range: 4, coords: '' },
        { type: 1, form: 4, name: 'F', enemies: [71, 33, 33, 31], range: 4, coords: '' },
        { type: 1, form: 1, name: 'G', enemies: [27, 27, 94, 91, 77, 77], range: 4, coords: '' },
        { type: 1, form: 4, name: 'K', enemies: [71, 33, 33, 31], range: 5, coords: '' },
        { type: 1, form: 1, name: 'L', enemies: [55, 54, 77, 77, 1, 1], range: 5, coords: '' },
        { type: 1, form: 1, name: 'M', enemies: [27, 404, 55, 91, 239, 239], range: 5, coords: '' },
        { type: 1, form: 1, name: 'Pボス', enemies: [397, 42, 42, 55, 92, 240, 240], range: 5, coords: '' },
        { type: 1, form: 4, name: 'Q', enemies: [71, 33, 33], range: 2, coords: '' },
        { type: 3, form: 3, name: 'R', enemies: [399, 262, 262, 91, 242, 242], range: 6, coords: '' },
        { type: 3, form: 3, name: 'R(最終)', enemies: [402, 263, 262, 91, 242, 242], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Sボス(前哨)', enemies: [399, 27, 27, 19, 239, 239, 54, 91, 239, 239, 1, 1], range: 7, coords: '' },
        { type: 2, form: 11, name: 'Sボス(最終)', enemies: [402, 395, 262, 91, 242, 242, 404, 239, 239, 239, 239, 239], range: 7, coords: '' },
      ]
  },
  {
    // 丙
    area: 19114, lv: 1, cell:
      [
        { type: 3, form: 3, name: '空襲(強)', enemies: [150, 150, 150], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(中)', enemies: [150, 150], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(弱)', enemies: [150], range: 1, coords: '' },
        { type: 1, form: 4, name: 'B', enemies: [71, 31, 31], range: 2, coords: '' },
        { type: 1, form: 2, name: 'C', enemies: [54, 21, 21, 77, 1, 1], range: 3, coords: '' },
        { type: 3, form: 3, name: 'D', enemies: [150, 150, 150], range: 3, coords: '' },
        { type: 1, form: 1, name: 'E', enemies: [277, 27, 91, 77, 1, 1], range: 4, coords: '' },
        { type: 1, form: 4, name: 'F', enemies: [71, 32, 30, 30], range: 4, coords: '' },
        { type: 1, form: 1, name: 'G', enemies: [27, 22, 94, 77, 1, 1], range: 4, coords: '' },
        { type: 1, form: 4, name: 'K', enemies: [71, 32, 30, 30], range: 5, coords: '' },
        { type: 1, form: 1, name: 'L', enemies: [55, 18, 77, 1, 1, 1], range: 5, coords: '' },
        { type: 1, form: 1, name: 'M', enemies: [27, 55, 91, 1, 1, 1], range: 5, coords: '' },
        { type: 1, form: 1, name: 'Pボス', enemies: [395, 41, 41, 91, 239, 239], range: 5, coords: '' },
        { type: 1, form: 4, name: 'Q', enemies: [71, 31, 31], range: 2, coords: '' },
        { type: 3, form: 3, name: 'R', enemies: [398, 23, 23, 18, 1, 1], range: 6, coords: '' },
        { type: 3, form: 3, name: 'R(最終)', enemies: [401, 262, 23, 19, 239, 239], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Sボス(前哨)', enemies: [398, 22, 19, 18, 239, 239, 18, 239, 239, 1, 1, 1], range: 7, coords: '' },
        { type: 2, form: 11, name: 'Sボス(最終)', enemies: [401, 23, 91, 19, 239, 239, 18, 239, 239, 239, 1, 1], range: 7, coords: '' },
      ]
  },
  {
    // 丁
    area: 19114, lv: 0, cell:
      [
        { type: 3, form: 3, name: '空襲(強)', enemies: [150, 150], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(弱)', enemies: [150], range: 1, coords: '' },
        { type: 1, form: 4, name: 'B', enemies: [71, 30, 30], range: 2, coords: '' },
        { type: 1, form: 2, name: 'C', enemies: [54, 21, 21, 77, 1, 1], range: 3, coords: '' },
        // { type: 1, form: 1, name: 'D', enemies: [150, 150, 150], range: 3},
        { type: 1, form: 1, name: 'E', enemies: [276, 22, 91], range: 4, coords: '' },
        { type: 1, form: 4, name: 'F', enemies: [71, 32, 30, 30], range: 4, coords: '' },
        { type: 1, form: 2, name: 'G', enemies: [22, 22, 94, 77, 1, 1], range: 4, coords: '' },
        { type: 1, form: 4, name: 'K', enemies: [71, 32, 30, 30], range: 5, coords: '' },
        { type: 1, form: 2, name: 'L', enemies: [55, 18, 77, 1, 1, 1], range: 5, coords: '' },
        { type: 1, form: 2, name: 'M', enemies: [27, 18, 91, 1, 1, 1], range: 5, coords: '' },
        { type: 1, form: 1, name: 'Pボス', enemies: [395, 54, 239, 1, 1, 1], range: 5, coords: '' },
        { type: 1, form: 4, name: 'Q', enemies: [71, 30, 30], range: 2, coords: '' },
        { type: 3, form: 3, name: 'R', enemies: [398, 23, 18, 1, 1, 1], range: 6, coords: '' },
        { type: 3, form: 3, name: 'R(最終)', enemies: [401, 23, 23], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Sボス(前哨)', enemies: [398, 18, 239, 1, 1, 1, 1, 1, 1, 1, 1, 1], range: 7, coords: '' },
        { type: 2, form: 11, name: 'Sボス(最終)', enemies: [401, 22, 18, 239, 1, 1, 18, 1, 1, 1, 1, 1], range: 7, coords: '' },
      ]
  },
  {
    // 甲
    area: 19115, lv: 3, cell:
      [
        { type: 0, form: 3, name: '空襲(強)', enemies: [408, 280, 280, 280, 244, 244], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(中)', enemies: [408, 280, 280, 277, 243, 243], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(弱)', enemies: [408, 280, 280, 92, 243, 243], range: 1, coords: '' },
        { type: 1, form: 4, name: 'A', enemies: [238, 72, 71, 71], range: 1, coords: '' },
        { type: 3, form: 3, name: 'B', enemies: [279, 279, 405, 362, 240, 240], range: 1, coords: '' },
        { type: 1, form: 4, name: 'C', enemies: [238, 71, 71, 71], range: 1, coords: '' },
        { type: 3, form: 3, name: 'D', enemies: [408, 279, 279, 262, 243, 243], range: 2, coords: '' },
        { type: 1, form: 1, name: 'E', enemies: [405, 54, 362, 92, 77, 77], range: 2, coords: '' },
        { type: 3, form: 3, name: 'F', enemies: [408, 279, 279, 279, 244, 244], range: 3, coords: '' },
        { type: 1, form: 3, name: 'G', enemies: [279, 27, 405, 362, 240, 240], range: 3, coords: '' },
        { type: 1, form: 3, name: 'I', enemies: [266, 266, 43, 362, 243, 243], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Jボス', enemies: [420, 72, 72, 362, 244, 244], range: 2, coords: '' },
        { type: 3, form: 3, name: 'K', enemies: [408, 280, 280, 280, 244, 244], range: 4, coords: '' },
        { type: 3, form: 3, name: 'L', enemies: [408, 280, 280, 280, 244, 244], range: 5, coords: '' },
        { type: 1, form: 3, name: 'N', enemies: [266, 266, 43, 58, 243, 243], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(前哨)', enemies: [408, 280, 280, 43, 95, 95, 405, 362, 244, 244, 240, 240], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(最終)', enemies: [408, 408, 280, 280, 43, 43, 405, 362, 244, 244, 244, 244], range: 5, coords: '' },
      ]
  },
  {
    // 乙
    area: 19115, lv: 2, cell:
      [
        { type: 0, form: 3, name: '空襲(強)', enemies: [407, 278, 277, 277, 240, 240], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(弱)', enemies: [407, 277, 277, 91, 239, 239], range: 1, coords: '' },
        { type: 1, form: 4, name: 'A', enemies: [237, 71, 32, 32], range: 1, coords: '' },
        { type: 3, form: 3, name: 'B', enemies: [264, 263, 404, 92, 239, 239], range: 1, coords: '' },
        { type: 1, form: 4, name: 'C', enemies: [237, 32, 32, 32], range: 1, coords: '' },
        { type: 3, form: 3, name: 'D', enemies: [407, 264, 262, 91, 239, 239], range: 2, coords: '' },
        { type: 1, form: 1, name: 'E', enemies: [404, 54, 92, 92, 77, 77], range: 2, coords: '' },
        { type: 3, form: 3, name: 'F', enemies: [407, 264, 262, 262, 240, 240], range: 3, coords: '' },
        { type: 1, form: 3, name: 'G', enemies: [264, 27, 404, 92, 239, 239], range: 3, coords: '' },
        { type: 1, form: 3, name: 'I', enemies: [265, 265, 42, 92, 240, 240], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Jボス', enemies: [419, 71, 71, 92, 240, 240], range: 2, coords: '' },
        { type: 3, form: 3, name: 'K', enemies: [407, 278, 278, 277, 240, 240], range: 4, coords: '' },
        // { type: 1, form: 1, name: 'L', enemies: [407, 280, 280, 277], range: 5},
        // { type: 1, form: 1, name: 'N', enemies: [266, 43, 265], range: 5},
        { type: 2, form: 11, name: 'Oボス(前哨)', enemies: [407, 278, 278, 42, 95, 240, 404, 92, 240, 239, 239, 239], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(最終)', enemies: [407, 278, 278, 277, 42, 42, 404, 92, 240, 240, 240, 240], range: 5, coords: '' },
      ]
  },
  {
    // 丙
    area: 19115, lv: 1, cell:
      [
        { type: 0, form: 3, name: '空襲(強)', enemies: [406, 277, 23, 91], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(中)', enemies: [406, 23, 23, 91], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(弱)', enemies: [406, 23, 91], range: 1, coords: '' },
        { type: 1, form: 4, name: 'A', enemies: [236, 32, 32, 30], range: 1, coords: '' },
        { type: 3, form: 3, name: 'B', enemies: [263, 262, 55, 91, 77, 1], range: 1, coords: '' },
        { type: 1, form: 4, name: 'C', enemies: [236, 32, 32], range: 1, coords: '' },
        { type: 3, form: 3, name: 'D', enemies: [406, 262, 91, 239, 1, 1], range: 2, coords: '' },
        { type: 1, form: 1, name: 'E', enemies: [55, 54, 91, 77, 77, 1], range: 2, coords: '' },
        { type: 3, form: 3, name: 'F', enemies: [406, 262, 91, 239, 1, 1], range: 3, coords: '' },
        { type: 1, form: 3, name: 'G', enemies: [263, 27, 55, 91, 77, 1], range: 3, coords: '' },
        { type: 1, form: 3, name: 'I', enemies: [276, 276, 42, 91, 239, 239], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Jボス', enemies: [418, 70, 70, 91, 239, 239], range: 2, coords: '' },
        { type: 3, form: 3, name: 'K', enemies: [406, 277, 23, 91, 239, 239], range: 4, coords: '' },
        { type: 3, form: 3, name: 'L', enemies: [406, 277, 23, 91, 239, 239], range: 5, coords: '' },
        { type: 1, form: 3, name: 'N', enemies: [276, 276, 42, 26, 239, 239], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(前哨)', enemies: [406, 277, 23, 42, 94, 239, 55, 91, 239, 1, 1, 1], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(最終)', enemies: [406, 277, 277, 42, 42, 239, 55, 91, 239, 239, 1, 1], range: 5, coords: '' },
      ]
  },
  {
    // 丁
    area: 19115, lv: 0, cell:
      [
        { type: 0, form: 3, name: '空襲(強)', enemies: [406, 23, 91], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(弱)', enemies: [406, 91], range: 1, coords: '' },
        { type: 1, form: 4, name: 'A', enemies: [236, 32, 30, 30], range: 1, coords: '' },
        { type: 3, form: 3, name: 'B', enemies: [262, 23, 55, 91, 1, 1], range: 1, coords: '' },
        { type: 1, form: 4, name: 'C', enemies: [236, 32, 30], range: 1, coords: '' },
        { type: 3, form: 3, name: 'D', enemies: [262, 23, 91, 239, 1, 1], range: 2, coords: '' },
        { type: 1, form: 1, name: 'E', enemies: [55, 54, 91, 1, 1, 1], range: 2, coords: '' },
        { type: 3, form: 3, name: 'F', enemies: [262, 23, 91, 1, 1, 1], range: 3, coords: '' },
        { type: 1, form: 3, name: 'G', enemies: [262, 27, 55, 91, 1, 1], range: 3, coords: '' },
        { type: 1, form: 3, name: 'I', enemies: [276, 41, 91, 239, 239, 1], range: 4, coords: '' },
        { type: 1, form: 1, name: 'Jボス', enemies: [418, 30, 30, 1, 1], range: 2, coords: '' },
        { type: 3, form: 3, name: 'K', enemies: [406, 23, 91, 239, 1, 1], range: 4, coords: '' },
        { type: 3, form: 3, name: 'L', enemies: [406, 23, 91, 239, 1, 1], range: 5, coords: '' },
        { type: 1, form: 3, name: 'N', enemies: [276, 26, 41, 239, 239, 1], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(前哨)', enemies: [406, 23, 41, 94, 1, 1, 91, 1, 1, 1, 1, 1], range: 5, coords: '' },
        { type: 2, form: 11, name: 'Oボス(最終)', enemies: [406, 23, 23, 41, 41, 239, 91, 239, 1, 1, 1, 1], range: 5, coords: '' },
      ]
  },
  {
    // 甲
    area: 19116, lv: 3, cell:
      [
        { type: 0, form: 3, name: '空襲(強)', enemies: [183, 394, 151, 150, 414, 362], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(中)', enemies: [183, 394, 150, 150, 411, 362], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(弱)', enemies: [183, 394, 150, 362, 411, 362], range: 1, coords: '' },
        { type: 1, form: 4, name: 'B', enemies: [238, 72, 72, 71, 71], range: 2, coords: '' },
        { type: 1, form: 2, name: 'D', enemies: [405, 362, 362, 78, 78, 78], range: 3, coords: '' },
        { type: 3, form: 3, name: 'E', enemies: [183, 151, 150, 150, 411, 362], range: 3, coords: '' },
        { type: 3, form: 3, name: 'E(最終)', enemies: [183, 152, 150, 150, 414, 362], range: 3, coords: '' },
        { type: 1, form: 4, name: 'F', enemies: [238, 72, 72, 71, 71], range: 3, coords: '' },
        { type: 3, form: 3, name: 'H', enemies: [183, 151, 151, 150, 411, 362], range: 3, coords: '' },
        { type: 3, form: 3, name: 'H(最終)', enemies: [183, 152, 151, 150, 414, 362], range: 3, coords: '' },
        { type: 3, form: 3, name: 'J', enemies: [408, 118, 280, 280, 43, 362], range: 4, coords: '' },
        // { type: 4, form: 2, name: 'K', enemies: [405, 392, 124, 124, 78, 78], range: 5, coords: '' },
        { type: 1, form: 3, name: 'L', enemies: [118, 43, 362, 266, 243, 243], range: 5, coords: '' },
        { type: 3, form: 3, name: 'M', enemies: [183, 152, 151, 150, 411, 362], range: 5, coords: '' },
        { type: 3, form: 3, name: 'M(最終)', enemies: [183, 152, 152, 150, 414, 362], range: 5, coords: '' },
        { type: 1, form: 2, name: 'N', enemies: [43, 43, 362, 362, 244, 244], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Pボス', enemies: [295, 27, 27, 95, 95, 92, 405, 92, 92, 243, 243, 243], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Pボス 輸送後', enemies: [298, 27, 27, 95, 92, 26, 405, 92, 243, 243, 243, 243], range: 6, coords: '' },
        { type: 1, form: 3, name: 'Q', enemies: [280, 266, 43, 362, 244, 244], range: 5, coords: '' },
        { type: 1, form: 2, name: 'S', enemies: [397, 397, 362, 92, 243, 243], range: 6, coords: '' },
        { type: 2, form: 11, name: 'V(強)', enemies: [408, 118, 280, 280, 43, 362, 405, 362, 244, 244, 243, 243], range: 6, coords: '' },
        { type: 2, form: 11, name: 'V(弱)', enemies: [408, 280, 280, 43, 43, 362, 405, 362, 244, 244, 243, 243], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Wボス(前哨)', enemies: [411, 294, 294, 397, 397, 362, 405, 244, 244, 243, 243, 139], range: 7, coords: '' },
        { type: 2, form: 11, name: 'Wボス(最終)', enemies: [414, 297, 297, 397, 397, 362, 405, 362, 244, 244, 244, 140], range: 7, coords: '' },
      ]
  },
  {
    // 乙
    area: 19116, lv: 2, cell:
      [
        { type: 0, form: 3, name: '空襲(強)', enemies: [182, 151, 150, 150, 413, 92], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(中)', enemies: [182, 150, 150, 150, 410, 91], range: 1, coords: '' },
        { type: 0, form: 3, name: '空襲(弱)', enemies: [182, 151, 150, 410, 91], range: 1, coords: '' },
        { type: 1, form: 4, name: 'B', enemies: [237, 71, 71, 71, 31], range: 2, coords: '' },
        { type: 1, form: 2, name: 'D', enemies: [405, 362, 92, 78, 77, 77], range: 3, coords: '' },
        { type: 3, form: 3, name: 'E', enemies: [182, 151, 150, 413, 92, 92], range: 3, coords: '' },
        { type: 1, form: 4, name: 'F', enemies: [237, 71, 71, 71, 31], range: 3, coords: '' },
        { type: 3, form: 3, name: 'H', enemies: [182, 150, 150, 150, 410, 92], range: 3, coords: '' },
        { type: 3, form: 3, name: 'H(最終)', enemies: [182, 151, 150, 150, 413, 92], range: 3, coords: '' },
        { type: 3, form: 3, name: 'J', enemies: [407, 117, 278, 278, 42, 92], range: 4, coords: '' },
        // { type: 4, form: 2, name: 'K', enemies: [404, 92, 124, 78, 77, 77], range: 5, coords: '' },
        { type: 1, form: 3, name: 'L', enemies: [118, 43, 92, 265, 243, 243], range: 5, coords: '' },
        { type: 3, form: 3, name: 'M', enemies: [182, 151, 150, 150, 410, 92], range: 5, coords: '' },
        { type: 3, form: 3, name: 'M(最終)', enemies: [182, 152, 150, 150, 413, 92], range: 5, coords: '' },
        { type: 1, form: 2, name: 'N', enemies: [43, 43, 92, 92, 243, 243], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Pボス', enemies: [294, 27, 27, 95, 95, 92, 404, 91, 242, 242, 1, 1], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Pボス 輸送後', enemies: [297, 27, 27, 95, 92, 26, 404, 91, 242, 242, 1, 1], range: 6, coords: '' },
        { type: 1, form: 3, name: 'Q', enemies: [278, 276, 42, 92, 242, 242], range: 5, coords: '' },
        { type: 1, form: 2, name: 'S', enemies: [396, 396, 92, 92, 243, 243], range: 6, coords: '' },
        { type: 2, form: 11, name: 'V(強)', enemies: [407, 117, 278, 278, 42, 92, 404, 92, 243, 243, 242, 242], range: 6, coords: '' },
        { type: 2, form: 11, name: 'V(弱)', enemies: [407, 278, 278, 42, 42, 92, 404, 92, 243, 243, 242, 242], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Wボス(前哨)', enemies: [410, 42, 42, 396, 396, 92, 404, 243, 243, 239, 239, 138], range: 7, coords: '' },
        { type: 2, form: 11, name: 'Wボス(最終)', enemies: [413, 42, 42, 396, 396, 92, , 404, 92, 243, 243, 243, 139], range: 7, coords: '' },
      ]
  },
  {
    // 丙
    area: 19116, lv: 1, cell:
      [
        { type: 3, form: 3, name: '空襲(強)', enemies: [182, 151, 150, 409, 91], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(中)', enemies: [182, 150, 150, 409, 91], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(弱)', enemies: [182, 150, 409, 91], range: 1, coords: '' },
        { type: 1, form: 4, name: 'B', enemies: [236, 71, 31, 31, 31], range: 2, coords: '' },
        { type: 1, form: 2, name: 'D', enemies: [404, 92, 92, 77, 77, 1], range: 3, coords: '' },
        { type: 3, form: 3, name: 'E', enemies: [182, 151, 409, 91], range: 3, coords: '' },
        { type: 1, form: 4, name: 'F', enemies: [236, 71, 31, 31, 31], range: 3, coords: '' },
        { type: 3, form: 3, name: 'H', enemies: [182, 150, 150, 409, 91], range: 3, coords: '' },
        { type: 3, form: 3, name: 'J', enemies: [406, 116, 277, 277, 41, 91], range: 4, coords: '' },
        // { type: 4, form: 2, name: 'K', enemies: [404, 92, 77, 77, 77, 77], range: 5, coords: '' },
        { type: 1, form: 3, name: 'L', enemies: [116, 41, 91, 276, 239, 239], range: 5, coords: '' },
        { type: 3, form: 3, name: 'M', enemies: [182, 151, 150, 409, 91], range: 5, coords: '' },
        { type: 1, form: 2, name: 'N', enemies: [43, 42, 92, 92, 240, 240], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Pボス', enemies: [293, 27, 27, 94, 94, 91, 55, 91, 239, 239, 1, 1], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Pボス 輸送後', enemies: [296, 27, 27, 95, 91, 13, 55, 91, 239, 239, 1, 1], range: 6, coords: '' },
        { type: 1, form: 3, name: 'Q', enemies: [262, 276, 41, 91, 242, 242], range: 5, coords: '' },
        { type: 1, form: 2, name: 'S', enemies: [396, 395, 92, 91, 242, 242], range: 6, coords: '' },
        { type: 2, form: 11, name: 'V(強)', enemies: [406, 116, 277, 277, 41, 91, 55, 91, 242, 242, 1, 1], range: 6, coords: '' },
        { type: 2, form: 11, name: 'V(弱)', enemies: [406, 277, 277, 41, 41, 91, 55, 91, 242, 242, 1, 1], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Wボス(前哨)', enemies: [409, 41, 41, 95, 95, 91, 55, 91, 239, 239, 1, 137], range: 7, coords: '' },
        { type: 2, form: 11, name: 'Wボス(最終)', enemies: [412, 41, 41, 395, 395, 91, 55, 91, 239, 239, 239, 138], range: 7, coords: '' },
      ]
  },
  {
    // 丁
    area: 19116, lv: 0, cell:
      [
        { type: 3, form: 3, name: '空襲(強)', enemies: [182, 150, 150, 409, 91], range: 1, coords: '' },
        { type: 3, form: 3, name: '空襲(弱)', enemies: [182, 150, 409, 91], range: 1, coords: '' },
        { type: 1, form: 4, name: 'B', enemies: [236, 71, 31, 31], range: 2, coords: '' },
        { type: 1, form: 2, name: 'D', enemies: [55, 91, 91, 77, 77, 1], range: 3, coords: '' },
        { type: 3, form: 3, name: 'E', enemies: [182, 150, 409, 91], range: 3, coords: '' },
        { type: 1, form: 4, name: 'F', enemies: [236, 71, 31, 31], range: 3, coords: '' },
        { type: 3, form: 3, name: 'H', enemies: [182, 150, 409, 91], range: 3, coords: '' },
        { type: 3, form: 3, name: 'J', enemies: [406, 277, 23, 41, 91, 239], range: 4, coords: '' },
        // { type: 4, form: 2, name: 'K', enemies: [55, 92, 77, 77, 1, 1], range: 5, coords: '' },
        { type: 1, form: 1, name: 'L', enemies: [116, 41, 91, 276, 239, 239], range: 5, coords: '' },
        { type: 3, form: 3, name: 'M', enemies: [182, 150, 150, 409, 92], range: 5, coords: '' },
        { type: 1, form: 2, name: 'N', enemies: [42, 42, 92, 91, 239, 239], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Pボス', enemies: [293, 27, 27, 94, 91, 13, 91, 239, 1, 1, 1, 1], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Pボス(輸送後)', enemies: [296, 27, 27, 94, 13, 13, 91, 239, 1, 1, 1, 1], range: 6, coords: '' },
        { type: 1, form: 3, name: 'Q', enemies: [277, 276, 41, 91, 242, 242], range: 5, coords: '' },
        { type: 1, form: 2, name: 'S', enemies: [395, 395, 91, 91, 242, 242], range: 6, coords: '' },
        { type: 2, form: 11, name: 'V(強)', enemies: [406, 23, 23, 41, 91, 239, 91, 239, 239, 1, 1, 1], range: 6, coords: '' },
        { type: 2, form: 11, name: 'V(弱)', enemies: [406, 41, 91, 239, 1, 1, 91, 239, 239, 1, 1, 1], range: 6, coords: '' },
        { type: 2, form: 11, name: 'Wボス(前哨)', enemies: [409, 41, 94, 94, 91, 239, 55, 1, 1, 1, 1, 137], range: 7, coords: '' },
        { type: 2, form: 11, name: 'Wボス(最終)', enemies: [412, 41, 41, 94, 94, 91, 55, 239, 239, 1, 1, 137], range: 7, coords: '' },
      ]
  },
];

/** デフォ機体プリセット */
const DEFAULT_PLANE_PRESET = [
  { id: 1, name: 'FBA汎用 (サンプル)', planes: [94, 100, 157, 54] },
  { id: 2, name: '上位艦戦セット (サンプル)', planes: [56, 336, 157, 339] },
  { id: 3, name: '陸戦1 陸攻3 (サンプル)', planes: [225, 186, 186, 186] },
  { id: 4, name: '防空セット (サンプル)', planes: [54, 175, 175, 175] },
];

/** 変更履歴 */
let CHANGE_LOG = [
  { id: '0.0.1', changes: [{ type: 0, title: "設置", content: "初版設置" }] },
  { id: '1.0.0', changes: [{ type: 0, title: "艦娘制空計算機能を実装しました。", content: "基本の機能です。" }] },
  {
    id: '1.0.1', changes: [
      {
        type: 0, title: "艦娘を12隻まで設定できるようになりました。",
        content: "レイアウトの都合上、第1艦隊、第2艦隊と別れていますが、両艦隊の制空値を合算して計算します。"
      },
      { type: 0, title: "艦娘単位の制空値を表示するようにしました。", content: "各艦娘名の横に表示されます。" },
    ]
  },
  {
    id: '1.1.0', changes: [
      {
        type: 0, title: "基地航空隊を新設しました。",
        content: "集中、単発、待機から選択可能です。機体が存在しない航空隊はゲーム同様、待機に固定されます。変更する場合は、最初に機体を選択してください。"
      },
      {
        type: 0, title: "基地航空隊による敵機撃墜を考慮できるようになりました。",
        content: "結果は、実際に第1基地航空隊から本隊の制空争いまでを1連の試行として反復するモンテカルロ法シミュレーションによって導出します。"
      },
    ]
  },
  {
    id: '1.1.1', changes: [
      {
        type: 0, title: "敵艦の制空値直接入力機能を実装しました。",
        content: "敵艦選択から「直接入力」を選択したのち、制空値をクリックすると自由に設定できます。ここで入力した制空値は、基地航空隊の撃墜対象になりません。"
      }
    ]
  },
  {
    id: '1.1.2', changes: [
      {
        type: 0, title: "機体のドラッグ&amp;ドロップによる入れ替え機能を実装しました。"
        , content: "入れ替えたい対象の機体の機体アイコン、または機体名付近をドラッグし、入れ替えたい位置までドラッグしてください。"
      }
    ]
  },
  {
    id: '1.1.3', changes: [
      {
        type: 0, title: "艦娘間の装備入れ替えについて、適合しない装備を考慮するようにしました。",
        content: "適合しない装備は入れ替えられません。また、搭載できない装備が交換されてきた場合は自動的に外されます。"
      },
      {
        type: 0, title: "機体をドロップ時、機体を複製できる機能を追加しました。",
        content: "詳細設定欄で設定、またはCtrlキーを押下した状態で機体をドロップすると機体が複製されて挿入されます。"
      }
    ]
  },
  {
    id: '1.1.4', changes: [
      { type: 0, title: "5スロット艦に対応しました。", content: "該当する艦娘を編成した場合のみ表示されます。" },
      {
        type: 0, title: "基地航空隊各隊毎に、出撃/配備時の資源消費を確認できるようになりました。",
        content: "燃料、弾薬は<u>出撃時に自動的に消費される量</u>、ボーキサイトは<u>未配備の基地から現在の装備構成にした場合に自動的に消費される量</u>です。"
      },
    ]
  },
  {
    id: '1.2.0', changes: [
      {
        type: 0, title: "防空計算に対応しました。",
        content: "3部隊同時設定可能です。いずれかの航空隊を「防空」に設定すると、他の航空隊で「集中」「単発」に設定するまで防空モードとなります。"
      },
    ]
  },
  {
    id: '1.2.1', changes: [
      {
        type: 0, title: "機体プリセット機能を追加しました。",
        content: "デフォルトでいくつかプリセットが登録されていますが、削除して問題ありません。"
      },
    ]
  },
  {
    id: '1.3.0', changes: [
      {
        type: 0, title: "道中における、自艦隊の被撃墜に対応しました。",
        content: "敵艦隊欄から、目的の戦闘までの道中の戦闘回数を選択し、それぞれの敵艦隊を選択してください。"
      },
      {
        type: 0, title: "防空時において、対重爆時の制空値計算に対応しました。",
        content: "重爆対象の敵艦を選択し、防空を選択すると考慮します。入力情報欄には常に対重爆時の制空値が表示されます。"
      }
    ]
  },
  {
    id: '1.3.1', changes: [
      {
        type: 0, title: "機体、艦娘、および敵艦の選択画面の複数列表示機能を実装しました。",
        content: "各種選択欄内の、カテゴリの右欄で切り替えられます。ブラウザの横幅によってはあまり恩恵がありません。ソート順は図鑑No順です。"
      },
      {
        type: 0, title: "海域一覧からの敵艦隊入力に対応しました。",
        content: "各戦闘の「海域選択」をクリックすると海域選択が可能です。ここから敵情報を選択した場合、基地航空隊の半径も考慮されます。"
      },
      {
        type: 0, title: "各敵艦隊との戦闘順の入れ替え機能を実装しました。",
        content: "ドラッグ&amp;ドロップで入れ替えらます。戦闘回数、総制空値の欄からドラッグできます。"
      },
    ]
  },
  {
    id: '1.3.2', changes: [
      {
        type: 0, title: "自動編成記録機能を実装しました。",
        content: "サイト再表示時、前回の編成データがあれば復帰する機能です。「詳細設定」から本機能の ON/OFF を切り替えられます。"
      },
      {
        type: 0, title: "入力情報の保存・展開機能を実装しました。",
        content: "入力した基地、艦娘、敵艦情報をまとめてブラウザに保存できます。画面右上の「編成保存・展開」ボタンから登録・編集可能です。"
      },
      {
        type: 0, title: "外部サイトからの編成取り込み機能を実装しました。",
        content: "現在は「艦隊シミュレーター＆デッキビルダー」形式のデータに対応しています。画面右上の「編成保存・展開」ボタンから取り込みが可能です。"
      },
      {
        type: 0, title: "編成の共有機能を実装しました。",
        content: "編成のURL生成や、「艦隊シミュレーター＆デッキビルダー」形式のデータを出力できます。共有URLに関して、文字数制限のあるサイトなどに貼り付ける場合は、適宜短縮URLサービスなどを利用して下さい。"
      },
    ],
  },
  {
    id: '1.3.3', changes: [
      {
        type: 0, title: "艦隊毎の制空値表示を行うようにしました。",
        content: "各艦隊選択欄の下部、表示隻数の右側に表示されています。"
      },
      {
        type: 1, title: "海域選択が分かり辛かったので表示方法を変更しました。",
        content: "アイコンからボタン式になっています。機能に変更はありません。レイアウトは暫定です。"
      },
      {
        type: 1, title: "防空から集中等にした際、他の部隊は待機にするようにしました。",
        content: "防空や集中、単発を同時に選択できないのは仕様です。現状、両計算を同時に行うことはできません。"
      },
      {
        type: 2, title: "日進に大型飛行艇を搭載した際の初期搭載数を修正しました。",
        content: "1機です。知りませんでしたm(_ _)m　なお、その他の機体と同様、手動で搭載数を変更する場合は1機以上を設定しても問題ありません。"
      },
      {
        type: 2, title: "ドラッグ&ドロップ時の挙動の不具合を修正しました。",
        content: "艦隊欄でのドラッグ&ドロップ時に改修値がおかしくなる現象、偵察機系の最大搭載数がおかしくなる現象を修正しました。"
      },
    ],
  },
  {
    id: '1.3.4', changes: [
      {
        type: 0, title: "公開しました。",
        content: "デバッグ、動作検証に参加していただいた方、ありがとうございました。今後も改善案や要望、バグ報告など随時受け付けており、変更/修正/機能追加があった場合はこの画面にてお知らせしていきます。"
      },
      {
        type: 0, title: "海域からセルを選択した際に進行航路を表示するようにしました。",
        content: "自由にセルを設定できるため、ゲーム上あり得ない航路になることもあります。なお、別の海域を混ぜると無効です。"
      },
      {
        type: 2, title: "デッキビルダーからの編成取り込み機能の不具合を修正しました。",
        content: "第2艦隊を設定しなかった場合において、特定の条件で取り込みができない現象を修正しました。"
      },
      {
        type: 2, title: "レイアウトの一部修正を行いました。",
        content: "更新履歴欄において、一部文字が枠をはみ出していた部分を修正しました。"
      },
    ],
  },
  {
    id: '1.3.5', changes: [
      {
        type: 0, title: "2019秋イベント 対応開始",
        content: "確認できた敵編成から順次追加していきます。今後、強編成等が確認された場合は編成が変わる可能性があります。"
      },
    ],
  },
  {
    id: '1.3.5.1', changes: [
      {
        type: 1, title: "第2艦隊の制空権争い参加の挙動を変更しました。",
        content: "対敵連合艦隊時にのみ、第2艦隊の制空値も考慮します。敵艦が連合艦隊を組んでいるマスは、各マスの「敵連合」にチェックを入れてください。"
      },
      {
        type: 2, title: "細かい修正を行いました。",
        content: "長門型改に水上戦闘機が搭載できない現象の修正、三式戦 飛燕 の改修値を変更できない現象を修正しました。"
      },
    ],
  },
  {
    id: '1.3.5.2', changes: [
      {
        type: 0, title: "結果表示の際、空スロットを省略表示できるようにしました。",
        content: "結果表示欄の「未搭載スロットを非表示にする」にチェックを入れると表示を切り替えられます。選択状態は次回起動時にも引き継ぎます。"
      },
      {
        type: 2, title: "細かい修正を行いました。",
        content: "速吸改に艦上攻撃機が搭載できなくなっていた現象を修正しました。"
      },
    ],
  },
  {
    id: '1.3.5.3', changes: [
      {
        type: 1, title: "一括設定をより細かく設定できるようになりました。",
        content: "基地/艦娘単位で、各機体の搭載数、改修値、熟練度を自由に設定できるようになりました。一括設定は <i class='fas fa-tools'></i> アイコンをクリックすると起動します。"
      },
      {
        type: 2, title: "細かい修正を行いました。",
        content: "ページ下部、 サイトについて > 使い方 欄の訂正を行いました。"
      },
    ],
  },
  {
    id: '1.3.5.4', changes: [
      {
        type: 0, title: "2019秋イベント対応",
        content: "今後、強編成等が確認された場合は編成が変わる可能性があります。更新を確実に反映させる場合はブラウザのキャッシュを削除してみてください(Ctrlキー押下しながらF5を押下など)"
      },
      {
        type: 0, title: "計算結果欄に各種制空状態ボーダーを表示するようにしました。",
        content: "基地航空隊を派遣した場合、基準となる表示敵制空値は「平均値」となりますので、実際の制空状態ボーダーは表示値から前後する点に注意してください。"
      },
      {
        type: 2, title: "細かい修正を行いました。",
        content: "保存した海域セル選択状況がうまく復帰できていなかった不具合、プリセット新規登録時の不具合を修正しました。"
      },
    ],
  },
  {
    id: '1.4.0', changes: [
      {
        type: 0, title: "敵の対空砲火による撃墜(stage2)を実装しました。",
        content: "同機能実装に伴い、より正確な道中の被撃墜計算を行うには、制空争いに関係ない敵艦(駆逐艦や潜水艦など)の入力が必要になります。なお、計算結果欄の出撃後搭載数、および制空値はシミュレート全体における平均値が表示されています。"
      },
      {
        type: 0, title: "出撃終了時の艦載機全滅率の表示を追加しました。",
        content: "それぞれにマウスホバー(スマホではタップ)すると、シミュレーション全体での出撃後搭載数の最大、最小、および全滅回数が表示されます。全滅を避けたい場合にご活用ください。"
      },
      {
        type: 0, title: "一部艦載機に対空射撃回避補正を適用しました。",
        content: "対空砲火による撃墜機能実装に伴う追加です。主にネームド機や強めの瑞雲系が該当します。前述の全滅率表示機能と併せると効果が分かりやすいです。"
      },
      {
        type: 0, title: "入力情報コピペテキストを用意しました。",
        content: "入力情報欄下部に増設されています。掲示板など画像が貼りにくいような環境に書き込む際などにご利用ください。"
      },
      {
        type: 1, title: "敵艦データを更新しました。",
        content: "対空放火による撃墜機能追加に伴い、駆逐艦などの非偵察機搭載艦などを追加しました。"
      },
      {
        type: 2, title: "細かい修正を行いました。",
        content: "2019秋イベ E-6 [丁] の敵編成が表示されない不具合を修正しました。"
      },
    ],
  },
  {
    id: '1.4.1', changes: [
      {
        type: 0, title: "計算結果のスクショをワンボタンで保存できるようになりました。",
        content: "計算結果欄のカメラのアイコンをクリックすると、クリックした時点の計算結果欄を画像化し、お使いの端末に保存します。"
      },
      {
        type: 0, title: "Twitterでつぶやく機能を追加しました。",
        content: "押した時点での編成URLがあらかじめ入力されたツイート画面に移動します。"
      },
      {
        type: 0, title: "計算結果欄の表示を微妙にカスタマイズできるようになりました。",
        content: "結果グラフと表をドラッグ&amp;ドロップで入れ替えられるようになりました。また、基地や本隊を指定して非表示にできるようになりました。"
      },
      {
        type: 0, title: "機体配置時の初期熟練度を調整できるようになりました。",
        content: "詳細設定欄から変更可能です。カテゴリ毎に、新たに機体を配置した際の熟練度を変更することが可能です。選択値は次回サイト訪問時に復元します。"
      },
      {
        type: 1, title: "手動計算開始機能を廃止しました。",
        content: "あまりにも空気機能でした。どうしても復活を希望する方がいればご一報ください。"
      },
    ],
  },
  {
    id: '1.4.2', changes: [
      {
        type: 0, title: "海域マップ画像の各戦闘マスがクリックできるようになりました。",
        content: "画像内の戦闘マスをクリックすると、そのマスの敵編成を表示できます。従来通りマス一覧から選択することも可能です。"
      },
      {
        type: 0, title: "入力情報のスクショをワンボタンで保存できるようになりました。",
        content: "入力情報のカメラのアイコンをクリックすると、クリックした時点の入力情報を画像化し、お使いの端末に保存します。"
      },
      {
        type: 1, title: "計算結果欄の表示のカスタマイズ方法を変更しました。",
        content: "スマホ閲覧時に入れ替えが誤爆してしまう対策として、グラフの表示、非表示をトグル式で変更するようにしました。"
      },
      {
        type: 2, title: "細かい修正を行いました。",
        content: "陸上偵察機補正が動かなくなっていた不具合を修正しました。"
      },
    ],
  },
];

const LAST_UPDATE_DATE = "2020/01/28";
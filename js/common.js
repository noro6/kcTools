// 設定データ
let setting = null;

// 確認モーダルのモード
let confirmType = null;

// デッキビルダーで読み込んだ艦隊全容
let loadedDeckBuilders = [];

/*==================================
		Web Storage
==================================*/
/**
 * local Storage からデータ取得(Json.parse済)
 * @param {string} key key
 * @returns データ(Json.parse済) 存在しない、または失敗したら null
 */
function loadLocalStorage(key) {
	if (!window.localStorage) return null;
	try {
		return JSON.parse(window.localStorage.getItem(key));
	} catch (error) {
		return null;
	}
}
/**
 * local Storage にデータ格納
 * @param {string} key キー名
 * @param {Object} data 格納する生データ
 * @returns
 */
function saveLocalStorage(key, data) {
	if (!window.localStorage || key.length === 0) return false;
	try {
		window.localStorage.setItem(key, JSON.stringify(data));
		return true;
	} catch (error) {
		const $modal = $('#modal_confirm');
		$modal.find('.modal-body').html(`
			<div class="h6">データの更新に失敗しました。</div>
			<div class="m-3 font_size_12">お使いのブラウザのLocalStrage保存領域上限に達した可能性があります。</div>
			<div class="mx-3 font_size_12">不要な編成データの削除や、展開している編成タブを閉じ、再度試してみてください。</div>
		`);
		confirmType = 'strageOver';
		$modal.modal('show');
		return false;
	}
}
/**
 * local Storage 特定データ消去
 * @param {String} key 消去対象key
 */
function deleteLocalStorage(key) {
	if (!window.localStorage || key.length === 0) return false;
	window.localStorage.removeItem(key);
	return true;
}
/**
 * session Storage からデータ取得(Json.parse済)
 * @param {string} key key
 * @returns データ(Json.parse済) 存在しない、または失敗したら null
 */
function loadSessionStorage(key) {
	if (!window.sessionStorage) return null;
	try {
		return JSON.parse(window.sessionStorage.getItem(key));
	} catch (error) {
		return null;
	}
}
/**
 * session Storage にデータ格納
 * @param {string} key キー名
 * @param {Object} data 格納する生データ
 * @returns
 */
function saveSessionStorage(key, data) {
	if (!window.sessionStorage || key.length === 0) return false;
	try {
		window.sessionStorage.setItem(key, JSON.stringify(data));
		return true;
	} catch (error) {
		inform_danger('データ保存エラー')
		return false;
	}
}


/**
 * 設定データ初期化
 */
function initializeSetting() {
	// 設定データ読み込み
	setting = loadLocalStorage('setting');
	if (!setting) setting = {};
	// 設定ファイル内になければ初期値を設定
	if (!setting.hasOwnProperty('version')) setting.version = '0.0.0';
	if (!setting.hasOwnProperty('adaptedVersion')) setting.adaptedVersion = '0.0.0';
	if (!setting.hasOwnProperty('simulateCount')) setting.simulateCount = 5000;
	if (!setting.hasOwnProperty('emptySlotInvisible')) setting.emptySlotInvisible = false;
	if (!setting.hasOwnProperty('inStockOnly')) setting.inStockOnly = false;
	if (!setting.hasOwnProperty('isDivideStock')) setting.isDivideStock = false;
	if (!setting.hasOwnProperty('visibleEquipped')) setting.visibleEquipped = false;
	if (!setting.hasOwnProperty('visibleFinal')) setting.visibleFinal = true;
	if (!setting.hasOwnProperty('enemyDisplayImage')) setting.enemyDisplayImage = true;
	if (!setting.hasOwnProperty('enemyFleetDisplayImage')) setting.enemyFleetDisplayImage = true;
	if (!setting.hasOwnProperty('copyToClipboard')) setting.copyToClipboard = false;
	if (!setting.hasOwnProperty('selectedHistory')) setting.selectedHistory = [[], []];
	if (!setting.hasOwnProperty('orderByFrequency')) setting.orderByFrequency = false;
	if (!setting.hasOwnProperty('themeColor')) setting.themeColor = 'normal_theme';
	if (!setting.hasOwnProperty('contentsOrder')) setting.contentsOrder = [];
	if (!setting.hasOwnProperty('favoriteOnly')) setting.favoriteOnly = false;
	if (!setting.hasOwnProperty('favoritePlane')) setting.favoritePlane = [];
	if (!setting.hasOwnProperty('visibleEquippedShip')) setting.visibleEquippedShip = false;
	if (!setting.hasOwnProperty('inStockOnlyShip')) setting.inStockOnlyShip = false;
	if (!setting.hasOwnProperty('favoriteOnlyShip')) setting.favoriteOnlyShip = false;
	if (!setting.hasOwnProperty('favoriteShip')) setting.favoriteShip = [];
	if (!setting.hasOwnProperty('reducedDisplay')) setting.reducedDisplay = true;
	if (!setting.hasOwnProperty('confirmTabClosing')) setting.confirmTabClosing = true;
	if (!setting.hasOwnProperty('presetsOrder')) setting.presetsOrder = 1;
	if (!setting.hasOwnProperty('uploadUserName')) setting.uploadUserName = '';
	if (!setting.hasOwnProperty('planeOnly')) setting.planeOnly = true;
	if (!setting.hasOwnProperty('hasSlotOnly')) setting.hasSlotOnly = true;
	if (!setting.hasOwnProperty('visibleEmptyFolder')) setting.visibleEmptyFolder = false;
	if (!setting.hasOwnProperty('visibleAntiAirStatus')) setting.visibleAntiAirStatus = false;
	if (!setting.hasOwnProperty('visibleFixedMenu')) setting.visibleFixedMenu = true;
	if (!setting.hasOwnProperty('managerViewMode')) setting.managerViewMode = 'table';
	if (!setting.hasOwnProperty('createdURLs')) setting.createdURLs = [];
	if (!setting.hasOwnProperty('defaultProf')) {
		setting.defaultProf = [];
		const types = PLANE_TYPE.filter(v => v.id > 0 && v.id !== 49);
		// 熟練を最初からMaxにする機体カテゴリ
		const maxLevels = [6, 9, 10, 41, 45, 48];
		for (const type of types) {
			const d = { id: type.id, prof: maxLevels.includes(type.id) ? 7 : 0 };
			setting.defaultProf.push(d);
		}
	}
	if (!setting.hasOwnProperty('displayMode')) {
		setting.displayMode = {
			'modal_plane_select': 'single',
			'modal_ship_select': 'single',
			'modal_enemy_select': 'single'
		};
	}
	if (!setting.hasOwnProperty('orderBy')) {
		setting.orderBy = {
			'landBase': 'default',
			'friendFleet': 'default'
		};
	}
	if (!setting.hasOwnProperty('planeFilter')) {
		setting.planeFilter = {
			'landBase': ['radius', 0],
			'friendFleet': ['antiAir', 0]
		};
	}
	if (!setting.hasOwnProperty('presetFolders')) {
		setting.presetFolders = [];
		for (let i = 1; i < 20; i++) setting.presetFolders.push({ id: i, name: 'フォルダー' + i, isOpen: false });
		setting.presetFolders.push({ id: 99, name: 'ゴミ箱', isOpen: false });
	}

	// バージョン差異による設定変更等を適用する
	adaptUpdater();

	// 初期化完了
	saveSetting();

	if (setting.reducedDisplay) {
		reduced_display_Clicked();
	}
}

/**
 * 各アップデートに伴う設定の変更等
 */
function adaptUpdater() {
	if (setting.version !== LATEST_VERSION) {
		// バージョンアップ通知(赤いぴょこぴょこ)
		if (document.getElementsByClassName('version_detail')[0]) {
			document.getElementsByClassName('version_detail')[0].classList.add('unread');
		}
	}

	// 適用済みversionチェック
	if (setting.adaptedVersion === LATEST_VERSION) return;

	// 頭はだいたい1なので今は略
	const versions = setting.adaptedVersion.split('.');
	const major = castInt(versions[1]);
	const minor = castInt(versions[2]);
	const patch = versions.length >= 4 ? castInt(versions[3]) : 0;

	// ～ v1.8.0
	if (major <= 8) {
		// 所持装備機能フォーマット変更対応
		const planeStock = loadLocalStorage('planeStock');
		if (planeStock && planeStock.length > 0 && !planeStock[0].num.length) {
			deleteLocalStorage('planeStock');
		}

		// typoデータの移行
		if (setting.hasOwnProperty('copyToClipbord')) {
			setting.copyToClipboard = setting.copyToClipbord;
			delete setting.copyToClipbord;
		}
		if (setting.hasOwnProperty('visibleEquiped')) {
			setting.visibleEquipped = setting.visibleEquiped;
			delete setting.visibleEquiped;
		}

		// setting設置による統合
		deleteLocalStorage('version');
		deleteLocalStorage('autoSave');
		deleteLocalStorage('simulateCount');
		deleteLocalStorage('emptySlotInvisible');
		deleteLocalStorage('modalDisplayMode');
		deleteLocalStorage('defaultProf');
	}

	// ～ v1.9.0
	if (major <= 9) {
		// ～ v1.9.1
		if (minor < 1) {
			// 敵艦隊欄 画像表示をデフォルトに変更
			setting.enemyFleetDisplayImage = true;
		}

		// ～ v1.9.2.1
		if (minor <= 2 && patch < 1) {
			// 機体選択欄のソート保持方法変更
			setting.orderBy = {
				'landBase': 'default',
				'friendFleet': 'default'
			};
		}
	}

	//　～ v1.10.0
	if (major <= 10) {
		//　～ v1.10.0
		if (major <= 9) {
			// プリセットのidをGUID化
			presets = loadLocalStorage('presets');
			if (presets) {
				for (const preset of presets) {
					preset[0] = getUniqueId() + preset[0];
				}
				saveLocalStorage('presets', presets);
			}

			// バックアップデータ保持終了
			if (setting.hasOwnProperty('backUpEnabled')) delete setting.backUpEnabled;
			if (setting.hasOwnProperty('backUpCount')) delete setting.backUpCount;
			if (setting.hasOwnProperty('autoSave')) delete setting.autoSave;
			deleteLocalStorage('backUpPresets');
			deleteLocalStorage('autoSaveData');
		}

		// v1.10.1
		if (major <= 9 || minor < 1) {
			// 機体プリセットの保存形式変更
			const ps = loadLocalStorage('planePreset');
			if (ps) {
				for (const p of ps) {
					const newPlanesFormat = [];
					for (const v of p.planes) {
						newPlanesFormat.push({ id: v, remodel: 0 });
					}
					p.planes = newPlanesFormat;
				}

				saveLocalStorage('planePreset', ps);
			}
		}

		// v1.10.2
		if (major <= 9 || minor < 2) {
			// 編成プリセットに更新日の概念を追加
			let presets = loadLocalStorage('presets');
			if (presets) {
				const startDate = formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss');
				let index = 0;
				for (const preset of presets) {
					if (preset.length < 5) {
						preset.push(startDate + '.' + ('000' + index++).slice(-3));
					}
				}

				saveLocalStorage('presets', presets);
			}
		}
	}

	//　～ v1.11.0
	if (major <= 11) {
		//　～ v1.10.1
		if (major <= 10 || minor < 1) {
			// 空襲被害最大プロパティを削除
			delete setting.airRaidMax;
		}

		// ~v1.11.3.3 未満
		if (major <= 10 || minor < 3 || (minor === 3 && patch <= 3)) {
			// デフォルトMax熟練度を初期化　すまんでち
			setting.defaultProf = [];
			const types = PLANE_TYPE.filter(v => v > 0 && v !== 49);
			// 熟練を最初からMaxにする機体カテゴリ
			const maxLevels = [6, 9, 10, 41, 45, 48];
			for (const type of types) {
				const d = { id: type, prof: maxLevels.includes(type) ? 7 : 0 };
				setting.defaultProf.push(d);
			}

			// 内部熟練度120機体初期化　すまんでち
			setting.initialProf120 = [];
		}
	}

	if (major <= 12) {
		if (major <= 11) {
			// 対空CI非表示項目設定削除
			delete setting.invisibleCutin;
			// 連合チェックいらん
			delete setting.isUnion;
		}
		//　～ v1.12.1.1
		if (major <= 11 || minor < 1 || (minor === 1 && patch < 1)) {
			setting.visibleAntiAirStatus = true;
		}

		// ～　v1.12.9
		if (major <= 11 || minor < 9) {
			// 所持艦娘情報破棄
			deleteLocalStorage('shipStock');
		}
	}

	setting.adaptedVersion = LATEST_VERSION;
}

/**
 * コンフィグ更新
 */
function saveSetting() {
	saveLocalStorage('setting', setting);
}

/**
 * 縮小表示クリック時
 */
function reduced_display_Clicked() {
	const btn = document.getElementById('reduced_display');
	if (!btn) return;
	if (btn.classList.contains('checked')) {
		btn.classList.remove('checked');
		btn.textContent = '縮小表示OFF';
		document.getElementById('main').classList.remove('reduced');
	}
	else {
		btn.classList.add('checked');
		btn.textContent = '縮小表示ON';
		document.getElementById('main').classList.add('reduced');
	}

	setting.reducedDisplay = btn.classList.contains('checked');
	saveSetting();
}


/**
 * デッキビルダーフォーマットデータからプリセットを生成
 * f(leet)*は艦隊、s(hip)*は船、i(item)*は装備でixは拡張スロット、rfは改修、masは熟練度
 * @param {string} deck [基地プリセット, 艦隊プリセット, []]
 * @returns {object} プリセットデータとして返却 失敗時null
 */
function readDeckBuilder(deck) {
	if (!deck) return null;
	if (deck.indexOf('?predeck=') > -1) deck = deck.split('?predeck=')[1];
	try {
		deck = decodeURIComponent(deck).trim('"');
		const obj = JSON.parse(deck);
		const fleets = [];
		const landBase = [[], [-1, -1, -1]];
		let isYugeki = false;
		let unmanageShip = false;

		loadedDeckBuilders = [];
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
				if (!isYugeki) {
					isYugeki = Object.keys(value).length === 7;
				}
				Object.keys(value).forEach((s) => {
					const s_ = value[s];
					if (!s_ || !s_.hasOwnProperty('items')) return;
					const s_id = castInt(s_.id);
					// マスタデータと照合
					let shipData = SHIP_DATA.find(v => v.api === s_id);
					// マスタにないものも装備は受け入れるが、注意書きは表示させる
					if (!shipData) {
						shipData = { id: 0, slot: [0, 0, 0, 0] };
						unmanageShip = true;
					}

					// 練度
					let level = 99;
					if (s_.hasOwnProperty('lv')) {
						level = castInt(s_.lv);
						level = level ? level : 99;
					}

					// 運
					let luck = -1;
					if (s_.hasOwnProperty('luck')) {
						luck = castInt(s_.luck);
						luck = luck ? luck : -1;
					}

					// 装備の抽出
					const ship = [shipData.id, [], (castInt(s.replace('s', '')) - 1 + (isYugeki ? 7 : 6) * fleetNo), 0, level, isYugeki ? 2 : 0, luck];
					Object.keys(s_.items).forEach((i) => {
						const i_ = s_.items[i];
						if (!i_ || !i_.hasOwnProperty("id")) return;

						// マスタデータと照合
						if (!ITEM_DATA.find(v => v.id === castInt(i_.id))) return;

						// スロット番号 xは補強増設
						let planeIndex = castInt(i.replace('i', '')) - 1;

						let slot = 0
						// スロット番号精査
						if (planeIndex < -1 || planeIndex >= shipData.slot.length) {
							// スロット番号不明もしくは限界突破してたら補強増設に逃げる
							planeIndex = -1;
						}
						else {
							// 正常っぽい
							slot = castInt(shipData.slot[planeIndex]);
						}

						// 装備プロパティの抽出 id, remodel, level, slot, スロット番号
						const plane = [0, 0, 0, slot, planeIndex];
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

				// 何らかの情報があれば追加
				if (fleet[1].some(v => v[0] > 0 || v[1].some(w => w[0] > 0))) {
					loadedDeckBuilders.push(fleet.concat());
				}
			}
		});

		// いったん第1、第2艦隊のみに絞って返却
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
 * 指定文字列を読み込み、shipStockに反映させる　失敗時false
 * @param {string} input
 */
function readShipJson(input) {
	try {
		const jsonData = JSON.parse(input);
		const shipStock = [];

		let uniqueId = 1;
		for (const obj of jsonData) {
			let id = 0;
			const detail = { id: uniqueId++, lv: 0, exp: 0, st: [], area: -1 };

			// 艦娘データかチェック
			if (obj.hasOwnProperty('api_ship_id') && obj.hasOwnProperty('api_lv') && obj.hasOwnProperty('api_exp') && obj.hasOwnProperty('api_kyouka')) {
				id = castInt(obj.api_ship_id);
				detail.lv = castInt(obj.api_lv);
				/** 経験値　[0]=累積, [1]=次のレベルまで, [2]=経験値バー割合 */
				detail.exp = obj.api_exp[0];
				/** 近代化改修状態　[0]=火力, [1]=雷装, [2]=対空, [3]=装甲, [4]=運, [5]=耐久, [6]=対潜 */
				detail.st = obj.api_kyouka;
			}
			else if (obj.hasOwnProperty('id') && obj.hasOwnProperty('lv') && obj.hasOwnProperty('st') && obj.hasOwnProperty('exp')) {
				id = castInt(obj.id);
				detail.lv = castInt(obj.lv);
				/** 経験値　[0]=累積, [1]=次のレベルまで, [2]=経験値バー割合 */
				detail.exp = obj.exp[0];
				/** 近代化改修状態　[0]=火力, [1]=雷装, [2]=対空, [3]=装甲, [4]=運, [5]=耐久, [6]=対潜 */
				detail.st = obj.st;
			}
			else {
				// データ形式があってない
				return false;
			}

			// 札
			if (obj.hasOwnProperty('api_sally_area')) {
				detail.area = obj.api_sally_area;
			}
			else if (obj.hasOwnProperty('area')) {
				detail.area = obj.area;
			}

			const ship = SHIP_DATA.find(v => v.api === id);
			// マスタにあるデータなら処理する
			if (ship) {
				const stock = shipStock.find(v => v.id === ship.id);
				if (stock) {
					// 既にデータある場合
					stock.details.push(detail);
				}
				else {
					// 新しくデータ追加
					shipStock.push({ id: ship.id, details: [detail] });
				}
			}
		}

		shipStock.sort((a, b) => a.id - b.id);
		// 完全上書き
		saveLocalStorage('shipStock', shipStock);
		setting.inStockOnlyShip = true;
		saveSetting();
	} catch (error) {
		return false;
	}
	return true;
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
			if (obj.hasOwnProperty('api_slotitem_id') && obj.hasOwnProperty('api_level')) {
				const planeId = obj.api_slotitem_id;
				const remodel = obj.api_level;
				const stock = planeStock.find(v => v.id === planeId);
				if (stock) stock.num[remodel]++;
			}
			else if (obj.hasOwnProperty('id') && obj.hasOwnProperty('lv') && !obj.hasOwnProperty('st')) {
				const planeId = obj.id;
				const remodel = obj.lv;
				const stock = planeStock.find(v => v.id === planeId);
				if (stock) stock.num[remodel]++;
			}
			else {
				return false;
			}
		}

		planeStock.sort((a, b) => a.id - b.id);
		saveLocalStorage('planeStock', planeStock);
		setting.inStockOnly = true;
		saveSetting();
	} catch (error) {
		return false;
	}
	return true;
}

/*==================================
		プリセット関連
==================================*/
/**
 * 渡したinput値からプリセットデータを生成
 * @param {string} input
 * @returns {array} 基地 艦隊 敵艦プリセット 失敗時空プリセット[[],[],[]]
 */
function decodePreset(input) {
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
 * 機体在庫読み込み　未定義の場合は初期化したものを返却
 * @returns {[{id: number, num: number[]}]}
 */
function loadPlaneStock() {
	let planeStock = loadLocalStorage('planeStock');

	if (!planeStock || !planeStock.length) {
		const initStock = [];
		for (const plane of ITEM_DATA) {
			const stock = { id: plane.id, num: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
			initStock.push(stock);
		}
		planeStock = initStock.concat();
		saveLocalStorage('planeStock', planeStock);
	}
	else {
		// 追加装備チェック
		for (const plane of ITEM_DATA) {
			if (!planeStock.find(v => v.id === plane.id)) {
				planeStock.push({ id: plane.id, num: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] });
				saveLocalStorage('planeStock', planeStock);
			}
		}
	}

	return planeStock;
}

/**
 * 艦娘在庫読み込み　未定義の場合は空の配列
 * @returns {[{id: number, details: {id: number, lv: number, exp: number, st: number[], area: number}[]}]}
 */
function loadShipStock() {
	let shipStock = loadLocalStorage('shipStock') || [];
	return shipStock;
}

/*==================================
		汎用
==================================*/
/**
 * ほぼ一意なid用文字列を返す
 */
function getUniqueId() {
	return new Date().getTime().toString(16);
}

/**
 * 数値へキャスト(整数)
 * 失敗時は第二引数の値　未指定時は0
 * @param {object} input 入力文字
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
 * @param {object} input 入力文字
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
 * @param {JQuery} $this inputタグ id 持ち限定
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
 * RGBに変換
 * @param {string} hex
 */
function hexToRGB(hex) {
	if (hex.slice(0, 1) == "#") hex = hex.slice(1);
	if (hex.length == 3) hex = hex.slice(0, 1) + hex.slice(0, 1) + hex.slice(1, 2) + hex.slice(1, 2) + hex.slice(2, 3) + hex.slice(2, 3);
	return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map(function (str) {
		return parseInt(str, 16);
	});
}

/**
 * ステータスヘッダー用の変換関数
 * @param {*} text
 * @returns
 */
function convertHeaderText(text) {
	if (text === "default") text = "カテゴリ";
	else if (text === "history") text = "よく使う";
	else if (text === "id") text = "図鑑No";
	else if (text === "antiAir") text = "対空";
	else if (text === "battleAntiAir") text = "出撃対空";
	else if (text === "defenseAntiAir") text = "防空対空";
	else if (text === "antiAirWeight") text = "加重対空";
	else if (text === "antiAirBonus") text = "艦隊防空";
	else if (text === "fire") text = "火力";
	else if (text === "torpedo") text = "雷装";
	else if (text === "bomber") text = "爆装";
	else if (text === "accuracy") text = "命中";
	else if (text === "scout") text = "索敵";
	else if (text === "asw") text = "対潜";
	else if (text === "antiBomber") text = "対爆";
	else if (text === "interception") text = "迎撃";
	else if (text === "radius") text = "半径";
	else if (text === "cost") text = "コスト";
	else if (text === "avoid") text = "射撃回避";
	else if (text === "avoid2") text = "回避";
	else if (text === "armor") text = "装甲";
	else if (text === "land_base_power") text = "基地火力";
	return text;
}

/**
 * 指定プリセットをデッキビルダーフォーマットに変換
 * デッキフォーマット {version: 4, f1: {s1: {id: '100', items:{i1:{id:1, rf: 4, mas:7},{i2:{id:3, rf: 0}}...,ix:{id:43}}}, s2:{}...},...}（2017/2/3更新）
 * デッキフォーマット {version: 4.2, f1: {}, s2:{}...}, a1:{mode:1, items:{i1:{id:1, rf: 4, mas:7}}}（2019/12/5更新）
 * @returns {string} デッキビルダー形式データ
 */
function convertToDeckBuilder(fleet, landBase, withoutDisabledShip = false) {
	try {
		const obj = {
			version: 4,
			hqlv: castInt($('#admin_lv').val()),
			f1: {},
			f2: {},
			f3: {},
			a1: { mode: 0, items: {} },
			a2: { mode: 0, items: {} },
			a3: { mode: 0, items: {} }
		};

		// 基地データ
		for (const plane of landBase[0]) {
			obj[`a${Math.floor(plane[4] / 4) + 1}`].items[`i${Math.floor(plane[4] % 4) + 1}`] = { id: plane[0], rf: plane[2], mas: plane[1] };
		}
		for (let index = 0; index < landBase[1].length; index++) {
			const mode = landBase[1][index];
			obj[`a${index + 1}`].mode = mode > 0 ? 1 : mode === 0 ? 2 : 0;
		}

		// 艦隊データ
		const fleetBorder = fleet.length && fleet[0].length >= 6 && fleet[0][5] === 2 ? 7 : 6;
		for (let index = 0; index < fleet.length; index++) {
			const ship = fleet[index];
			const shipData = SHIP_DATA.find(v => v.id === ship[0]);
			if (!shipData) continue;
			if (withoutDisabledShip && ship[3]) continue;

			// 装備機体群オブジェクト生成
			const items = { i1: null, i2: null, i3: null, i4: null, i5: null };
			for (const item of ship[1]) {
				const i = { id: item[0], rf: item[2], mas: item[1] };
				const index = item[4] >= 0 ? item[4] + 1 : 'x';
				items[`i${index}`] = i;
			}

			const s = { id: `${shipData.api}`, lv: ship[4], luck: ship[6], items: items };
			const shipIndex = ship[2];
			if (shipIndex < fleetBorder) {
				obj.f1["s" + ((shipIndex % fleetBorder) + 1)] = s;
				if (fleetBorder === 7) obj.f3["s" + ((shipIndex % fleetBorder) + 1)] = s;
			}
			else obj.f2[`s${(shipIndex % fleetBorder) + 1}`] = s;
		}

		return JSON.stringify(obj);
	} catch (error) {
		return "";
	}
}


/**
 * 指定プリセットをデッキビルダーフォーマットに変換 作戦室用
 * デッキフォーマット {version: 4, f1: {s1: {id: '100', items:{i1:{id:1, rf: 4, mas:7},{i2:{id:3, rf: 0}}...,ix:{id:43}}}, s2:{}...},...}（2017/2/3更新）
 * デッキフォーマット {version: 1, f1: {}, s2:{}...}, a1:{mode:1, items:{i1:{id:1, rf: 4, mas:7}}}（2019/12/5更新）
 * @returns {string} デッキビルダー形式データ
 */
function convertToDeckBuilder_j(fleet, landBase, withoutDisabledShip = false) {
	try {
		const obj = {
			version: 1,
			name: getActivePreset().name,
			hqLevel: castInt($('#admin_lv').val()),
			side: "Player",
			fleetType: $('#union_fleet').prop('checked') ? "CarrierTaskForce" : "Single",
			fleets: [
				{ ships: [] },
				{ ships: [] },
				{ ships: [] },
				{ ships: [] },
			],
			landBase: [
				{ slots: [], equipments: [null, null, null, null] },
				{ slots: [], equipments: [null, null, null, null] },
				{ slots: [], equipments: [null, null, null, null] }
			],
		};

		// 基地データ
		for (let i = 0; i < landBase[0].length; i++) {
			const plane = landBase[0][i];
			const t = obj["landBase"][Math.floor(plane[4] / 4)];
			const index = Math.floor(plane[4] % 4);
			t['slots'][index] = plane[3];
			t['equipments'][index] = {
				masterId: plane[0],
				improvement: plane[2],
				proficiency: getProf(plane[1], ITEM_DATA.find(v => v.id === plane[0]).type)
			};
		}

		// 艦隊データ
		const fleetBorder = fleet.length && fleet[0].length >= 6 && fleet[0][5] === 2 ? 7 : 6;
		for (let i = 0; i < fleet.length; i++) {
			const ship = fleet[i];
			const shipData = SHIP_DATA.find(v => v.id === ship[0]);
			if (!shipData) continue;

			const shipIndex = ship[2];
			const t = obj["fleets"][shipIndex < fleetBorder ? 0 : 1];

			// 装備機体群オブジェクト生成
			const planes = [];
			const insData = { masterId: shipData.api, level: ship[4], slots: [], increased: { luck: ship[6] - shipData.luck }, equipments: planes };

			for (let j = 0; j < shipData.slot.length; j++) {
				let insSlot = shipData.slot.length > j ? shipData.slot[j] : 0;
				if (ship[1].find(v => v[4] === j)) {
					insSlot = ship[1].find(v => v[4] === j)[3];
				}
				insData.slots.push(insSlot);
			}

			for (let i = 0; i < shipData.slot.length + 1; i++) {
				const item = ship[1].find(v => v[4] === (i >= shipData.slot.length ? -1 : i));
				if (item) {
					planes.push({
						masterId: item[0],
						improvement: item[2],
						proficiency: getProf(item[1], ITEM_DATA.find(v => v.id === item[0]).type)
					});
				}
				else {
					planes.push({ masterId: 0, improvement: 0, proficiency: 0 });
				}
			}

			// 計算外を省くにチェックがはいってない or 無効になってないなら追加
			if (!withoutDisabledShip || !ship[3]) {
				t['ships'].push(insData);
			}
		}

		return JSON.stringify(obj);
	} catch (error) {
		return "";
	}
}

/**
 * 低い方の内部熟練度を返す　設定次第で最大は120になる
 * @param {number} level 熟練度レベル
 * @param {number} type 機体カテゴリ
 */
function getProf(level, type) {
	switch (level) {
		case 7:
			return setting.initialProf120.includes(Math.abs(type)) ? 120 : 100;
		case 0:
			return 0;
		case 1:
			return 10;
		case 2:
			return 25;
		case 3:
			return 40;
		case 4:
			return 55;
		case 5:
			return 70;
		case 6:
			return 85;
		default:
			return 0;
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
	window.history.replaceState(null, null, location.pathname);
	return retVal;
}

/**
 * リンクにaタグを付与
 * @param {string} str 入力文字列
 */
function AutoLink(str) {
	const regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g;
	const regexp_makeLink = function (all, url, h, href) {
		return '<a href="h' + href + '" target="_blank">' + url + '</a>';
	}

	return str.replace(regexp_url, regexp_makeLink);
}

/**
 * アラート緑
 * @param {string} content 本文
 */
function inform_success(content) {
	inform_custom_alert(content, 0);
}
/**
 * アラート黄
 * @param {string} content 本文
 */
function inform_warning(content) {
	inform_custom_alert(content, 1);
}
/**
 * アラート赤
 * @param {string} content 本文
 */
function inform_danger(content) {
	inform_custom_alert(content, 2);
}

/**
 * カスタムのアラートに文言を表示
 * @param {string} content 表示する内容文言
 */
function inform_custom_alert(content, mode) {
	const wraper = document.getElementById('custom_alert_wraper');
	wraper.innerHTML = '';

	const body = document.createElement('div');
	body.id = 'custom_alert_body';
	body.textContent = content;

	switch (mode) {
		case 0:
			body.className = 'alert-success';
			break;
		case 1:
			body.className = 'alert-warning';
			break;
		case 2:
			body.className = 'alert-danger';
			break;
		default:
			break;
	}

	wraper.appendChild(body);
}

/**
 * 日付をフォーマット
 * @param {Date} date
 * @param {string} format
 * @returns
 */
function formatDate(date, format) {
	format = format.replace(/yyyy/g, date.getFullYear());
	format = format.replace(/yy/g, date.getFullYear() % 100);
	format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
	format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
	format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
	format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
	format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
	format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
	return format;
};

/**
 * 短いURL取得要求
 * @param {string} url
 */
async function postURLData(url) {
	const data = {
		longDynamicLink: `https://aircalc.page.link/?link=${url}`,
		suffix: { option: "SHORT" }
	};
	return await fetch(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${xxx}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	}).then(response => response.json());
}

/**
 * div要素生成汎用
 * @param {string} className クラス名
 * @param {string} id id
 * @param {string} textContent 文字列
 */
function createDiv(className = '', id = '', textContent = '') {
	const div = document.createElement('div');
	if (className) div.className = className;
	if (id) div.id = id;
	if (textContent) div.textContent = textContent;
	return div;
}

/**
 * 指定ノードにツールチップを適用し、表示
 * @param {HTMLElement} node 指定DOM
 * @param {string} text 表示内容
 * @param {string} place 表示方向 top | right | left | buttom
 * @param {string} boundary 回り込み window | viewport
 */
function showTooltip(node, text, place = '', boundary = '') {
	$(node).tooltip('dispose');
	node.title = text;
	node.dataset.toggle = 'tooltip';
	node.dataset.html = true;
	node.dataset.trigger = 'manual';
	if (place) node.dataset.placement = place;
	if (boundary) node.dataset.boundary = boundary;
	$(node).tooltip('show');
}

/**
 * ツールチップ破棄
 * @param {HTMLElement} node 指定DOM
 */
function hideTooltip(node) {
	$(node).tooltip('hide');
	node.removeAttribute('title');
	delete node.dataset.originalTitle;
	delete node.dataset.html;
	delete node.dataset.toggle;
	delete node.dataset.placement;
	delete node.dataset.boundary;
	delete node.dataset.trigger;
	$(node).tooltip('dispose');
}

/*==================================
		タブ操作
==================================*/
/**
 * 展開中の編成タブ作成
 */
function setTab() {
	// ヘッダーのタブ一覧の作成
	let activePresets = loadLocalStorage('activePresets');
	if (!activePresets) activePresets = { activeId: "", presets: [] };
	const presets = loadLocalStorage('presets');

	const fragment = document.createDocumentFragment();
	for (const tabData of activePresets.presets) {
		// ローカルストレージ登録済みデータかどうか
		const savedPreset = presets ? presets.find(v => v[0] === tabData.id) : null;

		const tab = document.createElement('div');
		tab.className = `d-flex fleet_tab ${activePresets.activeId === tabData.id ? 'active' : ''}`;
		tab.dataset.presetid = tabData.id;

		const icon = document.createElement('div');
		icon.className = 'align-self-center fleet_tab_icon';
		if (savedPreset) {
			const dataString = tabData.history.histories[tabData.history.index];
			icon.style.color = '#adf';
			if (savedPreset[2] !== dataString) {
				icon.innerHTML = '&#8727;';
				// 未保存データを表す
				tab.classList.add('unsaved');
			}
			else {
				icon.innerHTML = '<i class="fas fa-file-text"></i>';
			}
		}
		else {
			icon.innerHTML = '&#63;';
			icon.style.color = '#fff';
			// 未保存データを表すやつ
			tab.classList.add('unsaved');
		}

		const name = document.createElement('div');
		name.className = 'align-self-center fleet_name ml-2 flex-grow-1';
		name.textContent = savedPreset ? savedPreset[1] : tabData.name ? tabData.name : '無題';

		tab.dataset.presetname = name.textContent;

		const name_input = document.createElement('input');
		name_input.type = 'text';
		name_input.maxLength = 50;
		name_input.className = ' ml-2 d-none fleet_name_input flex-grow-1'
		name_input.value = name.textContent;

		const closeButton = document.createElement('div');
		closeButton.className = 'align-self-center btn_close_tab ml-auto';
		closeButton.innerHTML = '&times;';

		tab.appendChild(icon);
		tab.appendChild(name);
		tab.appendChild(name_input);
		tab.appendChild(closeButton);

		fragment.appendChild(tab);
	}

	// タブ20個未満なら新規追加タブを追加
	if (activePresets.presets.length < 20) {
		const newTab = createDiv(`d-flex fleet_tab`, 'add_new_tab');
		newTab.dataset.presetid = '';
		newTab.dataset.presetname = '新しい編成タブを開く';
		const newTabPlus = createDiv();
		newTabPlus.innerHTML = '&#43';
		newTab.appendChild(newTabPlus);
		fragment.appendChild(newTab);
	}

	document.getElementById('fleet_tab_container').innerHTML = '';
	document.getElementById('fleet_tab_container').appendChild(fragment);
}

/**
 * タブ変更時処理
 * @param {JqueryDomObject} $this 押されたタブ
 */
function activeTabChanged($this) {
	$('#header .fleet_tab').removeClass('active');
	$this.addClass('active');

	// アクティブタブの変更処理
	let activePresets = loadLocalStorage('activePresets');
	if (!activePresets) activePresets = { activeId: "", presets: [] };
	activePresets.activeId = $this[0].dataset.presetid;
	saveLocalStorage('activePresets', activePresets);
}

/**
 * 新規タブクリック時処理
 */
function btn_add_new_tab_Clicked() {
	$('#header .fleet_tab').removeClass('active');
	// ツールチップがあれば一掃する
	$('#fleet_tab_container .fleet_tab').tooltip('hide');
	$('#fleet_tab_container .fleet_tab').tooltip('dispose');

	// アクティブタブのリセット
	let activePresets = loadLocalStorage('activePresets');
	if (!activePresets) activePresets = { activeId: "", presets: [] };
	activePresets.activeId = '';
	saveLocalStorage('activePresets', activePresets);
}

/**
 * タブを閉じたときの処理
 * @param {JqueryDomObject} $this 押されたタブ
 */
function closeActiveTab($this) {
	const container = $this.closest('.fleet_tab');

	// 消す対象がある場合
	if (container.hasClass('unsaved') && setting.confirmTabClosing) {
		// ほんまに閉じてもいいの？
		const $modal = $('#modal_confirm');
		$modal.find('.modal-body').html(`
			<div class="h6">未保存の変更内容がありますが、このままタブを閉じますか？</div>
			<div class="mt-3 font_size_12">戻って保存するには、画面上部の「編成保存」を押してください。</div>
			<div class="font_size_12">変更内容を破棄してタブを閉じる場合は、このままOKボタンを押してください。</div>
			<div class="mt-3 font_size_11">このメッセージは編成一覧ページの「共通設定」欄で無効にできます。</div>
		`);
		$modal[0].dataset.target = container[0].dataset.presetid;
		confirmType = 'deleteTab';
		$modal.modal('show');
	}
	else {
		closeTab(container[0].dataset.presetid);
	}
}

/**
 * 指定したIDのタブを消去
 * @param {string} id プリセットID
 */
function closeTab(id) {
	// ツールチップがあれば一掃する
	$('#fleet_tab_container .fleet_tab').tooltip('hide');
	$('#fleet_tab_container .fleet_tab').tooltip('dispose');

	let activePresets = loadLocalStorage('activePresets');
	activePresets.presets = activePresets.presets.filter(v => v.id !== id);

	// アクティブタブの解除
	if (activePresets.activeId === id) {
		activePresets.activeId = '';
	}
	saveLocalStorage('activePresets', activePresets);

	if (!activePresets.presets.length && !window.location.href.endsWith('/list/')) {
		window.location.href = '../list/';
	}
	else {
		setTab();
	}
}

/**
 * 現在のアクティブなタブのデータを取得
 */
function getActivePreset() {
	let act = loadLocalStorage('activePresets');

	// タブ制御用
	let activePreset = {
		id: '',
		name: '',
		history: { index: 0, histories: [] },
		memo: ''
	};

	// 画面上のアクティブタブと整合性をとる
	const activtTab = $('#fleet_tab_container').find('.fleet_tab.active')[0];

	if (act && act.activeId) {
		if (activtTab && act.activeId === activtTab.dataset.presetid) {
			// 画面上のアクティブタブと一致
			let preset = act.presets.find(v => v.id === act.activeId);
			if (preset) {
				activePreset = preset;
			}
		}
		else if (activtTab) {
			// 複数タブなどで画面上のアクティブタブと一致してない場合
			let preset = act.presets.find(v => v.id === activtTab.dataset.presetid);
			if (preset) {
				activePreset = preset;

				// アクティブタブはこっちだよと書き換え
				act.activeId = activtTab.dataset.presetid;
				saveLocalStorage('activePresets', act);
			}
		}
	}
	else if (activtTab) {
		let preset = act.presets.find(v => v.id === activtTab.dataset.presetid);
		if (preset) {
			activePreset = preset;

			// アクティブタブはこっちだよと書き換え
			act.activeId = activtTab.dataset.presetid;
			saveLocalStorage('activePresets', act);
		}
	}

	return activePreset;
}

/**
 * 指定したアクティブタブ情報を保存 無ければ追加
 * @param {object} preset
 */
function updateActivePreset(preset) {
	let activePresets = loadLocalStorage('activePresets');
	if (!activePresets) activePresets = { activeId: "", presets: [] };
	let index = activePresets.presets.findIndex(v => v.id === preset.id);

	if (index >= 0) {
		// あれば更新
		activePresets.presets[index] = preset;
	}
	else {
		// 無ければ追加してタブ描画
		activePresets.presets.push(preset);
		activePresets.activeId = preset.id;

		setTab();
	}

	saveLocalStorage('activePresets', activePresets);
}

const xxx = "AIzaSyC_rEnvKFFlZv54xvxP8MXPht081xYol4s";

/**
 * 現在アクティブなタブ内の最大の無題を返す
 */
function getMaxUntitled() {
	let activePresets = loadLocalStorage('activePresets');
	if (!activePresets) return "無題1";

	const regex = /無題\d+/;
	let max = 0;
	for (const preset of activePresets.presets) {
		if (regex.test(preset.name)) {
			const val = castInt(preset.name.replace('無題', ''));
			if (max < val) max = val;
		}
	}
	return "無題" + (max + 1);
}

/**
 * 設定削除クリック時
 */
function btn_reset_localStorage_Clicked() {
	const $modal = $('#modal_confirm');
	$modal.find('.modal-body').html(`
		<div>ブラウザに保存された入力・設定データを削除します。</div>
		<div class="mt-3">登録・保存されている編成データや装備プリセット、所持装備情報や各種詳細設定値など全てのデータが削除されます。</div>
		<div>削除したデータは元に戻せませんので注意してください。</div>
		<div class="mt-3">本サイトの利用を中止する場合、削除後にページを再読み込みしてしまうと再度設定データが生成されるため、削除後は直ちにサイトを閉じてください。</div>
		<div class="mt-3">よろしければ、OKボタンを押してください。</div>
	`);
	confirmType = "deleteLocalStorageAll";
	$modal.modal('show');
}

// ※
let fb = null;

function initializeFB() {
	firebase.initializeApp({
		apiKey: xxx,
		projectId: 'development-74af0'
	});
	fb = firebase.firestore();
}

/*==================================
		イベント
==================================*/
document.addEventListener('DOMContentLoaded', function () {

	// 設定データ読み込み
	initializeSetting();

	$('#header').on('click', '#reduced_display', reduced_display_Clicked);
	$('#header').on('click', '.fleet_tab', function () { activeTabChanged($(this)); });
	$('#header').on('click', '.btn_close_tab', function (e) { e.stopPropagation(); closeActiveTab($(this)); });
	// マウス中ボタンクリック
	$('#header').on({
		mousedown: function (e) {
			if (e.button === 1) {
				e.stopPropagation();
				closeActiveTab($(this));
				return false;
			}
		}
	}, '.fleet_tab');

	$('#modal_confirm').on('hide.bs.modal', function () { if (confirmType !== 'Error') confirmType = null; });
	$('#modal_confirm').on('click', '.btn_ok', function () {
		const $modal = $('#modal_confirm');
		if (confirmType === 'deleteTab') {
			// アクティブタブ削除
			closeTab($modal[0].dataset.target);
			$modal.modal('hide');
		}
		else if (confirmType === 'strageOver') {
			$modal.modal('hide');
		}
	});
	$('#fleet_tab_container').on({
		mouseenter: function () {
			const $this = $(this);
			timer = setTimeout(function () { showTooltip($this[0], $this[0].dataset.presetname); }, 500);
		},
		mouseleave: function () {
			if (timer) clearTimeout(timer);
			hideTooltip($(this)[0]);
		}
	}, '.fleet_tab');

	Sortable.create(document.getElementById('fleet_tab_container'), {
		animation: 200,
		delay: 100,
		handle: '.fleet_tab:not(.editting)',
		scroll: true,
		filter: '#add_new_tab',
		onEnd: function () {
			const temp = loadLocalStorage('activePresets');
			if (!temp) return;

			let sorted = { activeId: "", presets: [] };
			for (const tab of document.getElementsByClassName('fleet_tab')) {
				const preset = temp.presets.find(v => v.id === tab.dataset.presetid);
				if (preset) sorted.presets.push(preset);
			}
			sorted.activeId = temp.activeId;
			saveLocalStorage('activePresets', sorted);
		}
	});

	$('#header').on('click', '#btn_goto_manager', function () { window.location.href = '../manager/'; });
});
// 設定データ
let setting = null;

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
		window.localStorage.removeItem(key);
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
	if (!setting.hasOwnProperty('airRaidMax')) setting.airRaidMax = true;
	if (!setting.hasOwnProperty('isUnion')) setting.isUnion = true;
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
	if (!setting.hasOwnProperty('reducedDisplay')) setting.reducedDisplay = false;
	if (!setting.hasOwnProperty('defaultProf')) {
		setting.defaultProf = [];
		const types = PLANE_TYPE.filter(v => v.id > 0 && v.id !== 104);
		// 熟練を最初からMaxにする機体カテゴリ
		const maxLevels = [1, 4, 5, 7, 8, 102, 103];
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
			if (savedPreset[2] !== dataString) {
				icon.innerHTML = '&#8727;';
			}
			else {
				icon.innerHTML = '<i class="fas fa-file-text"></i>';
			}
			icon.style.color = '#adf';
		}
		else {
			icon.innerHTML = '&#63;';
			icon.style.color = '#fff';

			// 未保存データを表すやつ
			tab.classList.add('unsaved');
		}


		const name = document.createElement('div');
		name.className = 'align-self-center fleet_name ml-2 flex-grow-1';
		name.textContent = tabData.name;

		const closeButton = document.createElement('div');
		closeButton.className = 'align-self-center btn_close_tab ml-auto';
		closeButton.innerHTML = '&times;';

		tab.appendChild(icon);
		tab.appendChild(name);
		tab.appendChild(closeButton);

		fragment.appendChild(tab);
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
 * タブを閉じたときの処理
 * @param {JqueryDomObject} $this 押されたタブ
 */
function closeActiveTab($this) {
	const container = $this.closest('.fleet_tab');
	let activePresets = loadLocalStorage('activePresets');

	// 消す対象がある場合
	if (activePresets) {
		activePresets.presets = activePresets.presets.filter(v => v.id !== container[0].dataset.presetid);
		if (activePresets.activeId === container[0].dataset.presetid) {
			activePresets.activeId = '';
		}
		saveLocalStorage('activePresets', activePresets);

		if (!activePresets.presets.length) {
			window.location.href = '../list/index.html';
		}
		else {
			inform_success('「' + container.find('.fleet_name').text() + '」を閉じました。');
			setTab();
		}
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
		history: { index: 0, histories: [] }
	};

	if (act && act.activeId) {
		let preset = act.presets.find(v => v.id === act.activeId);
		if (preset) activePreset = preset;
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


/*==================================
		イベント
==================================*/
document.addEventListener('DOMContentLoaded', function () {

	// 設定データ読み込み
	initializeSetting();

	$('#header').on('click', '#reduced_display', reduced_display_Clicked);
	$('#header').on('click', '.fleet_tab', function () { activeTabChanged($(this)); });
	$('#header').on('click', '.btn_close_tab', function (e) { e.stopPropagation(); closeActiveTab($(this)); });

	Sortable.create(document.getElementById('fleet_tab_container'), {
		animation: 200,
		scroll: true,
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
});
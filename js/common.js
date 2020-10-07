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
 * コンフィグ更新
 */
function saveSetting() {
	saveLocalStorage('setting', setting);
}



/*==================================
		プリセット関連
==================================*/
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
 * 現在の入力状況からbase64エンコード済みプリセットデータを生成、返却する
 * @returns {string} エンコード済プリセットデータ
 */
function encodePreset() {
	try {
		// 現在のプリセットを取得し、オブジェクトを文字列化
		const preset = [
			createLandBasePreset(),
			createFriendFleetPreset(),
			createEnemyFleetPreset(),
			createAntiAirTablePreset()
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
 * 展開中の編成タブ作成
 */
function setTab() {
	// ヘッダーのタブ一覧の作成
	let activePresets = loadLocalStorage('activePresets');
	if (!activePresets) activePresets = { activeId: "", presets: [] };

	const fragment = document.createDocumentFragment();
	for (const tabData of activePresets.presets) {
		const tab = document.createElement('div');
		tab.className = `d-flex fleet_tab ${activePresets.activeId === tabData.id ? 'active' : ''}`;
		tab.dataset.presetid = tabData.id;

		const icon = document.createElement('div');
		icon.className = 'align-self-center fleet_tab_icon';
		icon.innerHTML = '&#9679;';

		const name = document.createElement('div');
		name.className = 'align-self-center fleet_name ml-1 flex-grow-1';
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
 * ほぼ一意なid用文字列を返す
 */
function getUniqueId() {
	return new Date().getTime().toString(16);
}

/*
 * イベント
 */
document.addEventListener('DOMContentLoaded', function () {

	document.getElementById('btn_top').addEventListener('click', () => { window.location.href = './index.html'; });

	$('#header').on('click', '.fleet_tab', function () {
		$('#header .fleet_tab').removeClass('active');
		$(this).addClass('active');

		let activePresets = loadLocalStorage('activePresets');
		if (!activePresets) activePresets = { activeId: "", presets: [] };
		activePresets.activeId = $(this)[0].dataset.presetid;
		saveLocalStorage('activePresets', activePresets);
	});

	$('#header').on('click', '.btn_close_tab', function (e) {
		// タブ閉じる
		e.stopPropagation();

		const container = $(this).closest('.fleet_tab');
		let activePresets = loadLocalStorage('activePresets');

		// 消す対象がある場合
		if (activePresets) {
			activePresets.presets = activePresets.presets.filter(v => v.id !== container[0].dataset.presetid);
			if (activePresets.activeId === container[0].dataset.presetid) {
				activePresets.activeId = '';
			}
			saveLocalStorage('activePresets', activePresets);

			if (!activePresets.presets.length) {
				window.location.href = './index.html';
			}
		}

		setTab();
	});

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
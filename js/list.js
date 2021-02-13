/**
 * 初期化
 */
function initialize() {
  // url取得、転送
  if (location.search) window.location.href = '../simulator/' + location.search;

  // 設定変更
  document.getElementById('confirm_tab_close')['checked'] = setting.confirmTabClosing;
  document.getElementById('presets_order').value = setting.presetsOrder;
  document.getElementById('empty_folder_visible')['checked'] = setting.visibleEmptyFolder;

  // アクティブなタブはないので表示修正
  $('.fleet_tab.active').removeClass('active');

  // 保存されているプリセットを展開
  setLocalPresets();

  if (loadSessionStorage('display_public')) {
    // みんなの編成を初期表示
    $('#public_preset_tab').tab('show');
  }
}


/**
 * ローカルのプリセット展開
 */
function setLocalPresets() {
  let presets = loadLocalStorage('presets');
  if (!presets) presets = [];

  $('#btn_search_preset').prop('disabled', false);
  setPresets(presets);

  // イベント紐づけ
  $('.folder_content').on('show.bs.collapse', function () { folder_content_Show($(this)); });
  $('.folder_content').on('hide.bs.collapse', function () { folder_content_Hide($(this)); });
}

/**
 * 編成一覧画面に指定したプリセットを展開
 * @param {*} presets 保存編成
 * @param {boolean} isLocal ローカルのものかどうか　デフォルトtrue
 */
function setPresets(presets, isLocal = true) {

  // 対象のテーブル
  const targetContainer = isLocal ? 'presets_container' : 'public_presets_container';
  // ソートチェック
  const sort = castInt(document.getElementById('presets_order').value);
  // 検索語句
  const keyword = document.getElementById('search_preset').value.trim();
  // 空フォルダー表示チェック
  const visibleEmptyFolder = document.getElementById('empty_folder_visible')['checked'];
  setting.visibleEmptyFolder = visibleEmptyFolder;

  if (isLocal && keyword) {
    presets = presets.filter(v => v[1].indexOf(keyword) >= 0);
  }

  if (isLocal) {
    switch (sort) {
      case 1:
        // 更新日時降順
        presets.sort((a, b) => a[4] < b[4] ? 1 : -1);
        break;
      case 2:
        // 更新日時昇順
        presets.sort((a, b) => a[4] > b[4] ? 1 : -1);
        break;
      case 3:
        // プリセット名降順
        presets.sort((a, b) => a[1] < b[1] ? 1 : -1);
        break;
      case 4:
        // プリセット名昇順
        presets.sort((a, b) => a[1] > b[1] ? 1 : -1);
        break;
      default:
        break;
    }
  }
  setting.presetsOrder = sort;
  saveSetting();

  // 入れ替えできる条件かどうか
  const enabledSortable = sort === 0 && !keyword && isLocal;

  const fragment = document.createDocumentFragment();

  if (isLocal) {
    // 新規作成用ボタン
    const new_container = createDiv(`preset_container new d-flex ${presets.length ? '' : 'border_delete'}`);
    const new_body = createDiv('new_body mx-auto my-auto', '', presets.length ? '新規作成' : '編成を新規作成');
    new_container.appendChild(new_body);
    fragment.appendChild(new_container);
  }
  else if (!isLocal && presets.length === 0) {
    const empty_container = createDiv(`d-flex empty_container`);
    const di = createDiv('mx-auto my-auto', '', 'データが見つかりませんでした。');
    empty_container.appendChild(di);
    fragment.appendChild(empty_container);
  }

  // フォルダー作成
  const folders = setting.presetFolders;
  const folderContainers = [];
  for (let index = 0; index < folders.length; index++) {
    const folder = folders[index];
    const wrapper = createDiv();
    // このフォルダーに属する編成総数
    const presetCount = presets.filter(v => v.length >= 6 && v[5] === folder.id).length;

    const header = createDiv(`preset_container folder_header ${presetCount === 0 && !visibleEmptyFolder ? 'd-none' : ''}`);

    if (presetCount) {
      header.dataset.toggle = 'collapse';
      header.dataset.target = '#folder' + folder.id;
    }
    header.dataset.folderid = folder.id;

    const headerBody = createDiv('d-flex my-auto ml-3 mr-2');
    const headerText = createDiv('preset_name align-self-center');
    headerText.innerHTML = `<i class="fas fa-folder${presetCount ? '-open' : ' opacity4'} mr-2 cur_move handle"></i>${folder.name}`;
    headerBody.appendChild(headerText);

    const countText = createDiv('ml-3 font_size_12 align-self-center font_color_half preset_count');
    countText.textContent = `( ${presetCount}件 )`;
    if (presetCount) headerBody.appendChild(countText);

    // 名前編集欄
    const name_edit = document.createElement('input');
    name_edit.type = 'text';
    name_edit.maxLength = 50;
    name_edit.className = 'form-control form-control-sm preset_name_edit mb-1 mr-3 d-none';
    name_edit.value = folder.name;
    headerBody.appendChild(name_edit);

    // ボタン群ラッパー
    const btns = createDiv('d-flex ml-auto btns_container');

    // フォルダー追加コミットボタン
    const btn_commit_f = createDiv('ml-auto r_btn btn_commit_folder d-none');
    btn_commit_f.dataset.toggle = 'tooltip';
    btn_commit_f.dataset.offset = '-50%';
    btn_commit_f.title = '選択した編成をこのフォルダーに追加します。';
    btn_commit_f.innerHTML = '<i class="fas fa-save"></i>';
    btns.appendChild(btn_commit_f);

    // フォルダー追加やめるボタン
    const btn_rollback_f = createDiv('ml-2 r_btn btn_rollback_folder d-none');
    btn_rollback_f.dataset.toggle = 'tooltip';
    btn_rollback_f.dataset.offset = '-50%';
    btn_rollback_f.title = 'キャンセルします。';
    btn_rollback_f.innerHTML = '<i class="fas fa-undo"></i>';
    btns.appendChild(btn_rollback_f);

    // フォルダーに追加ボタン
    const btn_add = createDiv('ml-auto r_btn btn_add_preset');
    btn_add.dataset.toggle = 'tooltip';
    btn_add.dataset.offset = '-50%';
    btn_add.title = 'このフォルダーに移動させる編成を一括で選択します。';
    btn_add.innerHTML = '<i class="fas fa-folder-download"></i>';
    btns.appendChild(btn_add);

    // 編成編集コミットボタン
    const btn_commit = createDiv('ml-auto r_btn btn_commit d-none');
    btn_commit.dataset.toggle = 'tooltip';
    btn_commit.dataset.offset = '-50%';
    btn_commit.title = '編集内容を確定します。';
    btn_commit.innerHTML = '<i class="fas fa-save"></i>';
    btns.appendChild(btn_commit);

    // 編成編集やめるボタン
    const btn_rollback = createDiv('ml-2 r_btn btn_rollback d-none');
    btn_rollback.dataset.toggle = 'tooltip';
    btn_rollback.dataset.offset = '-50%';
    btn_rollback.title = '編集内容を取り消します。';
    btn_rollback.innerHTML = '<i class="fas fa-undo"></i>';
    btns.appendChild(btn_rollback);

    // 編成編集開始ボタン
    const btn_edit = createDiv('ml-2 r_btn btn_edit_start');
    btn_edit.dataset.toggle = 'tooltip';
    btn_edit.dataset.offset = '-50%';
    btn_edit.title = 'フォルダー名の変更を行います。';
    btn_edit.innerHTML = '<i class="fas fa-pencil"></i>';
    btns.appendChild(btn_edit);

    headerBody.appendChild(btns);
    header.appendChild(headerBody);

    const container = document.createElement('div');
    container.id = 'folder' + folder.id;
    container.dataset.folderid = folder.id;
    container.className = 'folder_content pl-5';
    if (presetCount) {
      container.classList.add('collapse');
      if (folder.isOpen) {
        container.classList.add('show');
      }
    }
    wrapper.appendChild(container);
    folderContainers.push({ id: folder.id, header: header, container: container });
  }

  // 並び替え可能要素
  const sortable_container = createDiv('', 'preset_sortable_container');

  for (const preset of presets) {

    // 編成名なし　キーワードが編成に一致しない場合出力しない
    if (!preset[1] || (isLocal && keyword && preset[1].indexOf(keyword) < 0)) {
      continue;
    }
    // これいる（確信）...ないとsortableでanimationがバッティングする
    const wrapper = createDiv();
    const container = createDiv('preset_container');
    container.dataset.presetid = preset[0];
    if (!isLocal) {
      container.dataset.presetdata = preset[2];
    }

    // プリセヘッダー
    const preset_header = createDiv('preset_header ' + (enabledSortable ? 'sortable_handle' : ''));
    container.appendChild(preset_header);

    const preset_body = createDiv('preset_body d-flex mx-2');
    const abstract = createDiv('mr-2 preset_abstract flex-grow-1');
    // 編成名
    abstract.appendChild(createDiv('preset_name', '', preset[1]));
    // 名前編集欄
    const name_edit = document.createElement('input');
    name_edit.type = 'text';
    name_edit.maxLength = 50;
    name_edit.className = 'form-control form-control-sm preset_name_edit mb-1 d-none';
    name_edit.value = preset[1];
    abstract.appendChild(name_edit);

    const preset_data = decodePreset(preset[2]);
    // 基地データ
    const lbs = preset_data[0];
    // 艦娘データ
    const fleets = preset_data[1];

    // const land_base = createDiv('d-none d-md-flex land_base_status');
    // for (let i = 1; i <= 3; i++) {
    //   // 基地データが入っていてかつお札が出撃
    //   const disabled = lbs.length >= 1 && lbs[1].length >= i && lbs[1][i - 1] >= 0 ? '' : 'disabled';
    //   land_base.appendChild(createDiv(`land_base_state no_${i} mr-1 ${disabled}`, '', `第${i}基地航空隊`));
    // }
    // abstract.appendChild(land_base);

    const fleet_container = createDiv('d-flex ships flex-wrap');

    for (const ship of fleets) {
      if (fleet_container.childNodes.length > 5) {
        break;
      }
      if (ship[0] <= 0) {
        continue;
      }
      const ship_img = document.createElement('img');
      ship_img.className = 'ship_image';
      ship_img.width = 100;
      ship_img.height = 25;
      ship_img.src = `../img/ship/${ship[0]}.png`;
      fleet_container.appendChild(ship_img);
    }
    abstract.appendChild(fleet_container);

    // メモ表示用
    const memo = createDiv(`preset_memo_view border mt-1 px-1 py-1 ${preset[3] ? '' : 'd-none'}`, '');
    memo.innerHTML = AutoLink(preset[3]);
    abstract.appendChild(memo);

    // メモ編集用
    const textarea = document.createElement('textarea');
    textarea.className = 'form-control preset_memo mt-1 w-100 d-none';
    textarea.value = preset[3] ? preset[3] : '';
    const rowLength = textarea.value.match(/\n/g);
    textarea.rows = (rowLength && rowLength.length ? rowLength.length + 2 : 2);
    abstract.appendChild(textarea);
    preset_body.appendChild(abstract);

    // ボタン群ラッパー
    const btns = createDiv('d-flex ml-auto pt-2 btns_container');

    if (isLocal) {
      // 編成編集コミットボタン
      const btn_commit = createDiv('ml-auto r_btn btn_commit d-none');
      btn_commit.dataset.toggle = 'tooltip';
      btn_commit.dataset.offset = '-50%';
      btn_commit.title = '編集内容を確定します。';
      btn_commit.innerHTML = '<i class="fas fa-save"></i>';
      btns.appendChild(btn_commit);

      // 編成編集やめるボタン
      const btn_rollback = createDiv('ml-2 r_btn btn_rollback d-none');
      btn_rollback.dataset.toggle = 'tooltip';
      btn_rollback.dataset.offset = '-50%';
      btn_rollback.title = '編集内容を取り消します。';
      btn_rollback.innerHTML = '<i class="fas fa-undo"></i>';
      btns.appendChild(btn_rollback);

      // 編成編集開始ボタン
      const btn_edit = createDiv('ml-auto r_btn btn_edit_start');
      btn_edit.dataset.toggle = 'tooltip';
      btn_edit.dataset.offset = '-50%';
      btn_edit.title = '編成名や編成メモの変更を行います。';
      btn_edit.innerHTML = '<i class="fas fa-pencil"></i>';
      btns.appendChild(btn_edit);

      // 編成コピーボタン
      const btn_copy = createDiv('ml-2 r_btn btn_copy');
      btn_copy.dataset.toggle = 'tooltip';
      btn_copy.dataset.offset = '-50%';
      btn_copy.title = '編成を複製して新しい編成タブを作成します。';
      btn_copy.innerHTML = '<i class="fas fa-copy"></i>';
      btns.appendChild(btn_copy);

      // フォルダー移動ボタン
      const btn_move_folder = createDiv('ml-2 r_btn btn_move_folder');
      btn_move_folder.dataset.toggle = 'tooltip';
      btn_move_folder.dataset.offset = '-50%';
      btn_move_folder.title = '所属フォルダーを変更します。';
      btn_move_folder.innerHTML = '<i class="fas fa-folder-upload"></i>';
      btns.appendChild(btn_move_folder);

      // 編成削除ボタン
      const btn_delete = createDiv('ml-2 r_btn btn_delete');
      btn_delete.dataset.toggle = 'tooltip';
      btn_delete.dataset.offset = '-50%';
      btn_delete.title = '編成を削除します。';
      btn_delete.innerHTML = '<i class="fas fa-trash-o"></i>';
      btns.appendChild(btn_delete);
    }
    else {
      // 編成展開ボタン
      const btn_open = createDiv('ml-2 r_btn btn_open');
      btn_open.dataset.toggle = 'tooltip';
      btn_open.dataset.offset = '-50%';
      btn_open.title = '編成を展開します。';
      btn_open.innerHTML = '<i class="fas fa-folder-open-o"></i>';
      btns.appendChild(btn_open);
    }

    preset_body.appendChild(btns);
    container.appendChild(preset_body);

    // プリセフッター
    if (!isLocal) {
      const preset_footer = createDiv('update_date mr-3', '', `${preset[5] ? `作成者: ${preset[5]}　` : ""} ${preset[4] ? preset[4].split('.')[0] : '-'}`);
      container.appendChild(preset_footer);
    }
    else {
      const preset_footer = createDiv('update_date mr-1', '', `更新日時: ${preset[4] ? preset[4].split('.')[0] : '-'}`);
      container.appendChild(preset_footer);
    }

    wrapper.appendChild(container);

    if (isLocal && preset.length >= 6) {
      // フォルダー検索　あればそっちにappend
      const targetFolder = folderContainers.find(v => v.id === preset[5]);
      if (targetFolder) {
        targetFolder.container.appendChild(wrapper);
      }
      else {
        sortable_container.appendChild(wrapper);
      }
    }
    else {
      sortable_container.appendChild(wrapper);
    }
  }

  // 通常分挿入
  fragment.appendChild(sortable_container);

  // Folder挿入
  if (isLocal) {
    const foldersSortable = createDiv('', 'foldersParent');
    for (const folder of folderContainers) {
      const wrapper = createDiv();
      wrapper.appendChild(folder.header);
      wrapper.appendChild(folder.container);
      foldersSortable.appendChild(wrapper);
    }

    fragment.appendChild(foldersSortable);
  }

  if (!isLocal && prevSnapShot) {
    const more_container = createDiv(`d-flex preset_container more_load`);
    const di = createDiv('mx-auto my-auto', '', 'もっと読み込む');
    more_container.appendChild(di);
    fragment.appendChild(more_container);
  }

  document.getElementById(targetContainer).innerHTML = '';
  document.getElementById(targetContainer).appendChild(fragment);
  $('#' + targetContainer + ' .r_btn').tooltip();

  // 入れ替え設定
  if (sort === 0 && !keyword && isLocal) {
    Sortable.create(document.getElementById('preset_sortable_container'), {
      animation: 200,
      handle: '.sortable_handle',
      onEnd: function () {
        const oldPresets = loadLocalStorage('presets');
        const newPresets = [];
        for (const c of document.getElementsByClassName('preset_container')) {
          const preset = oldPresets.find(v => v[0] === c.dataset.presetid);
          if (preset) newPresets.push(preset);
        }
        if (newPresets.length) {
          saveLocalStorage('presets', newPresets);
          inform_success('編成データの順序が更新されました。');
        }
      }
    });

    const folders = setting.presetFolders;
    for (let index = 0; index < folders.length; index++) {
      const folder = folders[index];
      Sortable.create(document.getElementById('folder' + folder.id), {
        animation: 200,
        handle: '.sortable_handle',
        onEnd: function () {
          const oldPresets = loadLocalStorage('presets');
          const newPresets = [];
          for (const c of document.getElementsByClassName('preset_container')) {
            const preset = oldPresets.find(v => v[0] === c.dataset.presetid);
            if (preset) newPresets.push(preset);
          }
          if (newPresets.length) {
            saveLocalStorage('presets', newPresets);
            inform_success('編成データの順序が更新されました。');
          }
        }
      });
    }
  }

  if (isLocal && document.getElementById('foldersParent')) {
    // フォルダー群自体の順序入れ替え
    Sortable.create(document.getElementById('foldersParent'), {
      animation: 200,
      handle: '.handle',
      onEnd: function () {
        const folders = setting.presetFolders;
        const newFolders = [];
        for (const c of document.getElementsByClassName('folder_header')) {
          const folder = folders.find(v => v.id === castInt(c.dataset.folderid));
          if (folder) newFolders.push(folder);
        }
        if (newFolders.length) {
          setting.presetFolders = newFolders;
          saveSetting();
          inform_success('フォルダーの順序が更新されました。');
        }
      }
    });
  }
}

/**
 * リンクにaタグを付与
 * @param {string} str 
 */
function AutoLink(str) {
  const regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g;
  const regexp_makeLink = function (all, url, h, href) {
    return '<a href="h' + href + '" target="_blank">' + url + '</a>';
  }

  return str.replace(regexp_url, regexp_makeLink);
}

/**
 * 海域変更時
 */
function map_select_Changed() {
  const area = castInt($('#map_select').val());
  $('#btn_search_preset').prop('disabled', false);
  $('#presets_order').removeClass('d-none');

  if (area > 400) {
    $('#select_preset_level').parent().removeClass('d-none');
    $('#select_preset_level').val(4);
  }
  else if (area === 0) {
    $('#presets_order').val(1);
    $('#presets_order').change();
    $('#presets_order').addClass('d-none');
  }
  else {
    $('#select_preset_level').parent().addClass('d-none');
    $('#select_preset_level').val(0);
  }
}

let prevSnapShot = null;
let STEP = 20;

/**
 * アップロードされている編成を検索
 */
function searchUploadedPreset() {
  const query = getPublicPresetsQuery();
  const presets = [];

  if (!fb) initializeFB();
  if (fb) {
    let search = null;
    if (query.map)
      search = fb.collection("presets")
        .where("map", "==", query.map)
        .where("level", "==", query.level)
        .orderBy(query.sortKey, query.order)
        .limit(STEP);
    else {
      search = fb.collection("presets")
        .orderBy(query.sortKey, query.order)
        .limit(STEP);
    }
    search.get()
      .then(function (querySnapshot) {
        prevSnapShot = querySnapshot.docs[querySnapshot.docs.length - 1];
        querySnapshot.forEach(function (doc) {
          const docData = doc.data();
          const createdAt = doc.data().createdAt ? doc.data().createdAt.toDate() : new Date();
          const preset = [
            '',
            docData.name + (query.map === 0 && docData.level > 0 ? '【' + DIFFICULTY.find(v => v.id === docData.level).name + '】' : ''),
            docData.data,
            docData.memo,
            formatDate(createdAt, 'yyyy/MM/dd HH:mm'),
            docData.user
          ];
          presets.push(preset);
        });

        if (presets.length < STEP || !query.map) {
          prevSnapShot = null;
        }
        setPresets(presets, false);

        const result = {
          map: query.map,
          level: query.level,
          sortKey: query.sortKey,
          order: query.order,
          presets: presets
        }
        saveSessionStorage('search_result', result);
      })
      .catch(function (error) {
        console.error(error);
        inform_danger('編成データの読み込みに失敗しました。');
      });
  }
}

/**
 * 公開プリセ検索文字列生成
 */
function getPublicPresetsQuery() {
  $('#btn_search_preset').prop('disabled', true);
  // 海域
  const map = castInt($('#map_select').val());
  const level = map > 400 ? castInt($('#select_preset_level').val()) : 0;
  let sortKey = 'createdAt';
  let order = 'desc';

  switch (castInt(document.getElementById('presets_order').value)) {
    case 1:
      // 更新日時降順 そのまま
      break;
    case 2:
      // 更新日時昇順
      order = 'asc';
      break;
    case 3:
      // プリセット名降順
      sortKey = 'name';
      break;
    case 4:
      // プリセット名昇順
      sortKey = 'name';
      order = 'asc';
      break;
    default:
      break;
  }

  return { map: map, level: level, sortKey: sortKey, order: order };
}

/**
 * もっと読み込みボタン
 */
function more_load_presets() {

  const btn_more_load = $('.more_load');
  btn_more_load.html(`<div class="w-100 text-center py-3"><div class="spinner-border" role="status"><span class="sr-only"></span></div></div>`);
  btn_more_load.removeClass('more_load');

  const query = getPublicPresetsQuery();
  let prevResult = loadSessionStorage('search_result');
  // 前回検索値がない場合は通常検索
  if (!prevResult || !prevSnapShot) {
    searchUploadedPreset();
    return;
  }

  // 前回検索条件と同じ条件でない場合は通常検索
  if (prevResult.map !== query.map || prevResult.level !== query.level || prevResult.sortKey !== query.sortKey || prevResult.order !== query.order) {
    searchUploadedPreset();
    return;
  }

  const presets = prevResult.presets;

  if (!fb) initializeFB();
  if (fb) {
    fb.collection("presets")
      .where("map", "==", query.map)
      .where("level", "==", query.level)
      .orderBy(query.sortKey, query.order)
      .startAfter(prevSnapShot)
      .limit(STEP)
      .get()
      .then(function (querySnapshot) {
        prevSnapShot = querySnapshot.docs[querySnapshot.docs.length - 1];
        querySnapshot.forEach(function (doc) {
          const docData = doc.data();
          const createdAt = doc.data().createdAt ? doc.data().createdAt.toDate() : new Date();
          const preset = [
            '',
            docData.name,
            docData.data,
            docData.memo,
            formatDate(createdAt, 'yyyy/MM/dd HH:mm'),
            docData.user
          ];
          presets.push(preset);
        });

        if (querySnapshot.docs.length < STEP) {
          prevSnapShot = null;
        }

        setPresets(presets, false);

        const result = {
          map: query.map,
          level: query.level,
          sortKey: query.sortKey,
          order: query.order,
          presets: presets
        }
        saveSessionStorage('search_result', result);
      })
      .catch(function (error) {
        console.error(error);
        inform_danger('編成データの読み込みに失敗しました。');
      });
  }
}

/**
 * フォルダー追加ボタンクリック
 * @param {JqueryDomObject} $this クリック要素
 */
function btn_add_preset_Clicked($this, e) {
  e.stopPropagation();

  const p = $this.closest('.preset_container');
  // ボタン
  p.find('.btn_edit_start').addClass('d-none');
  p.find('.btn_add_preset').addClass('d-none');
  p.find('.btn_commit_folder').removeClass('d-none');
  p.find('.btn_rollback_folder').removeClass('d-none');

  $('.preset_container:not(.folder_header)').addClass('folder_selectable');

  // 自分自身以外の全てのボタンを消す
  $('.btns_container').addClass('d-none').removeClass('d-flex');
  p.find('.btns_container').removeClass('d-none').addClass('d-flex');

  inform_success('このフォルダに移動させる編成を選択し、保存ボタンをクリックしてください。');
}


function btn_commit_folder_Clicked($this, e) {
  e.stopPropagation();

  const p = $this.closest('.preset_container');
  p.find('.btn_commit_folder').tooltip('hide');

  const folderId = castInt(p[0].dataset.folderid);
  const folder = setting.presetFolders.find(v => v.id === folderId);

  if (!folder) {
    // あり得ない
    inform_danger('フォルダー更新に失敗しました。');
    btn_rollback_folder_Clicked($this, e);
    return;
  }

  const presets = loadLocalStorage('presets');
  // 選択したプリセットの所属フォルダを変更
  $('.folder_selectable.selected').each((i, e) => {
    const presetId = $(e)[0].dataset.presetid;
    const preset = presets ? presets.find(v => v[0] === presetId) : null;

    // 見つかったものだけ更新
    if (preset && preset.length >= 6) preset[5] = folderId;
    else if (preset && preset.length === 5) preset.push(folderId);
  });

  saveLocalStorage('presets', presets);
  // もう一回プリセ一覧生成しておわおわ
  setLocalPresets();

  inform_success('選択された編成をフォルダー『' + folder.name + '』に移動しました。');
}

/**
 * フォルダ追加モードキャンセル
 * @param {JqueryDomObject} $this クリック要素
 * @param {*} e
 */
function btn_rollback_folder_Clicked($this, e) {
  e.stopPropagation();

  const p = $this.closest('.preset_container');
  p.find('.btn_edit_start').removeClass('d-none');
  p.find('.btn_add_preset').removeClass('d-none');
  p.find('.btn_commit_folder').addClass('d-none');
  p.find('.btn_rollback_folder').addClass('d-none');

  // 追加モードのクラスを全て破棄
  $('.folder_selectable').removeClass('folder_selectable');
  $('.btns_container').removeClass('d-none').addClass('d-flex');
}

/**
 * フォルダー追加モード　編成クリック時
 * @param {JqueryDomObject} $this クリック要素
 */
function folder_selectable_Clicked($this) {
  if ($this.hasClass('selected')) {
    $this.removeClass('selected');
  }
  else {
    $this.addClass('selected');
  }
}

/**
 * フォルダー展開時
 * @param {JqueryDomObject} $this クリック要素
 */
function folder_content_Show($this) {
  const folderId = castInt($this[0].dataset.folderid);
  const folders = setting.presetFolders;
  const folder = folders.find(v => v.id === folderId);

  if (folder) {
    folder.isOpen = true;
    saveSetting();
  }
}

/**
 * フォルダー格納時
 * @param {JqueryDomObject} $this クリック要素
 */
function folder_content_Hide($this) {
  const folderId = castInt($this[0].dataset.folderid);
  const folders = setting.presetFolders;
  const folder = folders.find(v => v.id === folderId);

  if (folder) {
    folder.isOpen = false;
    saveSetting();
  }
}

/**
 * 編成編集開始
 * @param {JqueryDomObject} $this クリック要素
 */
function btn_edit_start_Clicked($this, e) {
  e.stopPropagation();

  // 他の編集状態をキャンセル
  $('.preset_container.editting').each((i, ele) => {
    btn_rollback_Clicked($(ele).find('.btn_rollback'));
    inform_warning($(ele).find('.preset_name').text() + 'の編集はキャンセルされました。');
  });

  const p = $this.closest('.preset_container');
  p.addClass('editting');
  p.removeClass('sortable_handle');
  // 編集領域
  p.find('.preset_name').addClass('d-none');
  p.find('.preset_count').addClass('d-none');
  p.find('.preset_name_edit').removeClass('d-none');
  p.find('.preset_memo').removeClass('d-none');
  p.find('.preset_memo_view').addClass('d-none');
  // ボタン
  p.find('.btn_commit').removeClass('d-none');
  p.find('.btn_rollback').removeClass('d-none');
  p.find('.btn_copy').addClass('d-none');
  p.find('.btn_move_folder').addClass('d-none');
  p.find('.btn_edit_start').addClass('d-none');
  p.find('.btn_add_preset').addClass('d-none');
}


/**
 * 編成編集キャンセル
 * @param {JqueryDomObject} $this クリック要素
 */
function btn_rollback_Clicked($this, e = null) {
  if (e) e.stopPropagation();

  const p = $this.closest('.preset_container');
  // 編集領域
  p.find('.preset_name').removeClass('d-none');
  p.find('.preset_count').removeClass('d-none');
  p.find('.preset_name_edit').addClass('d-none');
  p.find('.preset_memo').addClass('d-none');
  if (p.find('.preset_memo_view').text()) {
    p.find('.preset_memo_view').removeClass('d-none');
  }
  // ボタン
  p.find('.btn_commit').addClass('d-none');
  p.find('.btn_rollback').addClass('d-none');
  p.find('.btn_copy').removeClass('d-none');
  p.find('.btn_move_folder').removeClass('d-none');
  p.find('.btn_edit_start').removeClass('d-none');
  p.find('.btn_add_preset').removeClass('d-none');

  p.removeClass('editting');
  p.addClass('sortable_handle');
}

/**
 * 名称編集完了
 * @param {JqueryDomObject} $this クリック要素
 */
function btn_commit_Clicked($this, e = null) {
  // 保存処理
  const p = $this.closest('.preset_container');
  if (p.hasClass('folder_header')) {
    // フォルダー名称変更処理
    const folders = setting.presetFolders;
    const id = castInt(p[0].dataset.folderid);

    const i = folders.findIndex(v => v.id === id);
    if (i >= 0) {
      let newName = p.find('.preset_name_edit').val().trim();
      // 80文字超えてたら切る
      if (newName.length > 80) {
        newName = newName.slice(0, 80);
        p.find('.preset_name_edit').val(newName);
      }

      if (p.find('.preset_name').find('.fas').hasClass('opacity4')) {
        p.find('.preset_name').html(`<i class="fas fa-folder mr-2 opacity4"></i>${newName}`);
      }
      else {
        p.find('.preset_name').html(`<i class="fas fa-folder-open mr-2"></i>${newName}`);
      }

      folders[i].name = newName;
      saveSetting();
      inform_success('フォルダ名の更新が完了しました。');
    }
  }
  else {
    // プリセット名称変更処理
    const presetid = p[0].dataset.presetid;

    let presets = loadLocalStorage('presets');
    if (!presets) presets = [];

    const i = presets.findIndex(v => v[0] === presetid);

    if (i >= 0) {
      // 名称　メモを設定
      let newName = p.find('.preset_name_edit').val().trim();
      let newMemo = p.find('.preset_memo').val().trim();
      if (newName) {

        // 50文字超えてたら切る
        if (newName.length > 50) {
          newName = newName.slice(0, 50);
          p.find('.preset_name_edit').val(newName);
        }

        presets[i][1] = newName;
        p.find('.preset_name').text(newName);
      }

      // 400文字超えてたら切る
      if (newMemo.length > 400) {
        newMemo = newMemo.slice(0, 400);
        p.find('.preset_memo').val(newMemo);
      }
      presets[i][3] = newMemo;
      const memo = newMemo.replace(/\r?\n/g, ' ');
      p.find('.preset_memo_view').text(memo);

      if (!memo.trim().length) {
        p.find('.preset_memo_view').addClass('d-none');
      }
      else {
        p.find('.preset_memo_view').removeClass('d-none');
      }

      saveLocalStorage('presets', presets);
      inform_success('編成情報の更新が完了しました。');
    }
  }

  btn_rollback_Clicked($this, e);
  setTab();
  // アクティブなタブはないので表示修正
  $('.fleet_tab.active').removeClass('active');
}

/**
 * 編成削除
 * @param {JqueryDomObject} $this クリック要素
 */
function btn_delete_Clicked($this, e) {
  e.stopPropagation();

  // 削除確認モーダル
  const $modal = $('#modal_confirm');
  $modal.find('.modal-body').html(`<div class="mt-2">編成を削除します。よろしいですか？</div>`);
  $modal[0].dataset.target = $this.closest('.preset_container')[0].dataset.presetid;
  confirmType = 'deletePreset';
  $modal.modal('show');
}

/**
 * 編成展開
 * @param {JqueryDomObject} $this クリック要素
 */
function preset_Clicked($this) {
  const presets = loadLocalStorage('presets');
  const presetId = $this[0].dataset.presetid;

  const preset = presets ? presets.find(v => v[0] === presetId) : null;

  // 展開タブ一覧に突っ込む新規データ
  let tabData = {
    id: getUniqueId(),
    name: getMaxUntitled(),
    // 全て空のデータ ↓
    history: {
      index: 0,
      histories: [
        'Noi6BpgWgRnX41BYLgAZKe-H6IBEB4cSaA3gQMYCuALgJYB2AkgCYEBcmBATgIZ0AplxjoedfgCMANiM6pwBKQHtebIb1HiAvhBwAzfjIDOQ8EdPnFZIA'
      ]
    }
  };

  if (preset) {
    // プリセットが見つかった場合はそのデータ
    tabData.id = preset[0];
    tabData.name = $this.find('.preset_name').text();
    tabData.history.histories[0] = preset[2];
  }

  let activePresets = loadLocalStorage('activePresets');
  if (!activePresets) activePresets = { activeId: "", presets: [] };

  // 展開済み編成内にいまクリックされた編成がすでに展開されていないか？
  const alreadyPreset = activePresets.presets.find(v => v.id === tabData.id);
  if (!alreadyPreset) {
    // 展開済み編成に加え入れろ～
    activePresets.presets.push(tabData);
  }
  else {
    // もう展開されているならそいつに置き換え
    tabData = alreadyPreset;
  }

  activePresets.activeId = tabData.id;
  saveLocalStorage('activePresets', activePresets);

  window.location.href = `../simulator/?p=${tabData.history.histories[tabData.history.index]}`;
}

/**
 * 外部の編成展開
 * @param {JqueryDomObject} $this クリック要素
 */
function public_preset_Clicked($this) {
  const $parent = $this.closest('.preset_container');
  const data = $parent[0].dataset.presetdata;
  const name = $parent.find('.preset_name').text();
  window.location.href = `../simulator/?d=${data}&name=${encodeURIComponent(name)}`;
}

/**
 * 編成複製展開
 * @param {JqueryDomObject} $this クリック要素
 */
function btn_copy_Clicked($this, e) {
  e.stopPropagation();

  const presets = loadLocalStorage('presets');
  const presetId = $this.closest('.preset_container')[0].dataset.presetid;

  const preset = presets ? presets.find(v => v[0] === presetId) : null;

  if (!preset) {
    // ないことはない
    inform_danger('複製対象の編成データが見つかりませんでした。');
    return;
  }

  let tabData = {
    id: getUniqueId(),
    name: preset[1] + '_コピー',
    history: { index: 0, histories: [preset[2]] }
  };

  let activePresets = loadLocalStorage('activePresets');
  if (!activePresets) activePresets = { activeId: "", presets: [] };

  // 展開済み編成に加え入れろ～
  activePresets.presets.push(tabData);
  activePresets.activeId = tabData.id;
  saveLocalStorage('activePresets', activePresets);

  window.location.href = `../simulator/?p=${tabData.history.histories[tabData.history.index]}`;
}

/**
 * プリセット個別　フォルダ移動ボタンクリック
 * @param {JqueryDomObject} $this
 * @param {*} e
 */
function btn_move_folder_Clicked($this, e) {
  e.stopPropagation();

  const presets = loadLocalStorage('presets');
  const presetId = $this.closest('.preset_container')[0].dataset.presetid;

  const preset = presets ? presets.find(v => v[0] === presetId) : null;

  if (!preset) {
    // ないことはない
    inform_danger('移動対象のプリセットデータが読み込めませんでした。');
    return;
  }

  // フォルダーセレクトボックスの初期化
  const folders = setting.presetFolders;
  let text = '<option value="0">指定なし</option>';
  for (const folder of folders) {
    text += `<option value="${folder.id}">${folder.name}</option>`;
  }
  $('#preset_folder').html(text);

  $('#modal_folder_confirm')[0].dataset.target = preset[0];
  $('#modal_folder_confirm').modal('show');
}

/**
 * プリセット個別　フォルダ移動コミット
 */
function modal_folder_confirm_ok_Clicked() {
  const presets = loadLocalStorage('presets');
  const presetId = $('#modal_folder_confirm')[0].dataset.target;

  const preset = presets ? presets.find(v => v[0] === presetId) : null;

  if (!preset) {
    // ないことはない
    inform_danger('移動対象のプリセットデータが読み込めませんでした。');
    return;
  }

  const folderId = castInt($('#preset_folder').val());
  const folder = setting.presetFolders.find(v => v.id === folderId);

  if (preset.length >= 6) {
    preset[5] = folderId;
  }
  else if (preset.length === 5) {
    preset.push(folderId);
  }

  saveLocalStorage('presets', presets);
  inform_success(`プリセット『${preset[1]}』をフォルダー『${folder ? folder.name : '未指定'}』に移動しました`);
  setLocalPresets();
}

/**
 * トップページ内タブクリック時
 */
function topTab_Clicked() {
  let tabInfo = getActivePreset();

  // 見つからなかったら無題タブを展開
  if (!tabInfo.id) {
    preset_Clicked($('#add_new_tab'));
  }
  else {
    window.location.href = `../simulator/?p=${tabInfo.history.histories[tabInfo.history.index]}`;
  }
}

/**
 * バージョン変更通知展開時
 */
function version_detail_Clicked() {
  if (!document.getElementById('version_inform_body').innerHTML) {
    const serverVersion = CHANGE_LOG.find(v => v.id === LATEST_VERSION);
    const fragment = document.createDocumentFragment();
    for (const v of serverVersion.changes) {
      // 変更通知
      const $change_wrap = createDiv('mt-3');

      const $badge_wrap = document.createElement('div');
      const $badge = document.createElement('span');
      $badge.className = `mr-1 pt-1 badge badge-pill badge-${v.type === 0 ? 'success' : v.type === 1 ? 'info' : 'danger'}`;
      $badge.textContent = (v.type === 0 ? '新規' : v.type === 1 ? '変更' : '修正');

      const $title_text = document.createElement('span');
      $title_text.innerHTML = v.title;

      $badge_wrap.appendChild($badge);
      $badge_wrap.appendChild($title_text);
      $change_wrap.appendChild($badge_wrap);

      if (v.content) {
        const $content = createDiv('font_size_12 pl-3');
        $content.innerHTML = v.content;

        $change_wrap.appendChild($content);
      }

      fragment.appendChild($change_wrap);
    }
    document.getElementById('version').textContent = serverVersion.id;
    document.getElementById('version_inform_body').appendChild(fragment);

    // 既読フラグ
    setting.version = serverVersion.id;
    saveSetting();

    document.getElementsByClassName('version_detail')[0].classList.remove('unread');
  }

  $('#modal_version_inform').modal('show');
}


/**
 * 更新履歴作成
 */
function loadSiteHistory() {
  if (document.getElementById('site_history_body').innerHTML) return;

  const fragment = document.createDocumentFragment();
  let verIndex = 0;
  const serverVersion = LATEST_VERSION;
  for (const ver of CHANGE_LOG) {
    const $ver_parent = createDiv('my-3 ver_log border-bottom');
    const $ver_title = createDiv('py-2', '', `v${ver.id}`);

    if (serverVersion === ver.id) {
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
}

/**
 * 確認ダイアログOKボタンクリック時
 */
function modal_confirm_ok_Clicked() {

  const $modal = $('#modal_confirm');
  if (confirmType === 'deletePreset') {
    // 保存一覧から削除
    let presets = loadLocalStorage('presets');
    presets = presets.filter(v => v[0] !== $modal[0].dataset.target);
    saveLocalStorage('presets', presets);

    // タブからも削除(あれば)
    let activePresets = loadLocalStorage('activePresets');
    activePresets.presets = activePresets.presets.filter(v => v.id !== $modal[0].dataset.target);
    saveLocalStorage('activePresets', activePresets);

    setLocalPresets();
    inform_success('削除が完了しました。');
    setTab();

    $modal.modal('hide');
  }
  else if (confirmType === "deleteLocalStorageAll") {
    window.localStorage.clear();
    setLocalPresets();
    setTab();
    $modal.modal('hide');
  }
  else if (confirmType === "sendComment") {
    send_comment();
    $modal.modal('hide');
  }

  // アクティブなタブはないので表示修正
  $('.fleet_tab.active').removeClass('active');
}

/**
 * 初めての方クリック時
 */
function first_time_Clicked() {
  $('#abstract').collapse('show');
  setTimeout(() => { $('body,html').animate({ scrollTop: $('#first_time').offset().top - 80 }, 300, 'swing'); }, 200);
  return false;
}

/**
 * 使い方クリック時
 */
function site_manual_Clicked() {
  $('#abstract').collapse('show');
  setTimeout(() => { $('body,html').animate({ scrollTop: $('#manual').offset().top - 80 }, 300, 'swing'); }, 200);
  return false;
}

/**
 * コメント欄初期化
 */
function initializeBoard() {
  if (!fb) initializeFB();
  if (fb) {
    fb.collection("comments").orderBy('createdAt', 'desc').limit(30)
      .onSnapshot(function (querySnapshot) {
        const fragment = document.createDocumentFragment();
        querySnapshot.forEach(function (doc) {
          const box = document.createElement('div');
          box.className = 'general_box my-3 px-3 pt-3 pb-1 comment';

          const header = document.createElement('div');
          header.className = 'd-flex mb-1';

          const index = document.createElement('div');
          index.className = 'comment_index text-primary';
          index.dataset.number = doc.data().number;
          index.textContent = `${doc.data().number}:`;

          const author = document.createElement('div');
          author.className = 'comment_writer ml-1 mr-2';
          author.textContent = doc.data().author;

          const createdAt = doc.data().createdAt ? doc.data().createdAt.toDate() : new Date();
          const date = document.createElement('div');
          date.className = 'comment_date opacity6 font_size_11 align-self-center';
          date.textContent = ' -- ' + formatDate(createdAt, 'yyyy/MM/dd HH:mm:ss');

          header.appendChild(index);
          header.appendChild(author);
          header.appendChild(date);

          const dt = new Date();
          dt.setDate(dt.getDate() - 7);
          if (createdAt > dt) {
            dt.setDate(dt.getDate() + 4);
            const badge = document.createElement('div');
            badge.className = `font_size_11 align-self-center ml-1 ${createdAt > dt ? 'text-danger' : 'text-success'}`;
            badge.textContent = 'New';
            header.appendChild(badge);
          }

          const content = document.createElement('div');
          content.className = 'comment_content align-self-center';
          content.textContent = doc.data().content;

          box.appendChild(header);
          box.appendChild(content);

          fragment.appendChild(box);
        });

        document.getElementById('coment_board').innerHTML = '';
        document.getElementById('coment_board').appendChild(fragment);
      });
  }

  // ブラウザ再読み込み時の残りカスがある場合の対処
  comment_text_Changed();
}


/**
 * レス番号クリック
 */
function comment_index_Clicked($this) {
  const num = castInt($this[0].dataset.number);
  if (document.getElementById('comment_text').value.trim().length) {
    document.getElementById('comment_text').value += ('>>' + num + '\n');
  }
  else {
    document.getElementById('comment_text').value = ('>>' + num + '\n');
  }

  // 移動
  setTimeout(() => { $('body,html').animate({ scrollTop: $('#comments').offset().top - 20 }, 20, 'swing'); }, 20);
  document.getElementById('comment_text').focus();
}

/**
 * comment欄変更時
 */
function comment_text_Changed() {
  // サーバーサイドでもチェックは行うがこっちでもやっとく
  const author = document.getElementById('comment_author');
  const content = document.getElementById('comment_text');
  const text = content.value;
  // 行数チェック用
  const nCount = text.match(/\n/g);
  let valid = true;

  // 名前欄チェック
  if (author.value.trim() === 'noro') {
    document.getElementById('author_validate').textContent = '使用できない名前です。';
    author.classList.add('is-invalid');
    valid = false;
  }
  else if (author.value.trim().length > 20) {
    // 名前欄文字数チェック
    document.getElementById('author_validate').textContent = '20文字以内で入力して下さい。';
    author.classList.add('is-invalid');
    valid = false;
  }
  else author.classList.remove('is-invalid');

  // 本文文字数チェック
  if (text.trim().length === 0) {
    document.getElementById('comment_validate').textContent = '';
    content.classList.remove('is-invalid');
    valid = false;
  }
  else if (text.length > 1000) {
    document.getElementById('comment_validate').textContent = '1000文字以内で入力してください。';
    content.classList.add('is-invalid');
    valid = false;
  }
  else if (nCount && nCount.length >= 15) {
    document.getElementById('comment_validate').textContent = '規定行数を超えました。行数を減らして下さい。';
    content.classList.add('is-invalid');
    valid = false;
  }
  else content.classList.remove('is-invalid');

  // 送信ボタンの有効無効
  document.getElementById('btn_send_comment').disabled = !valid;

  // バリデーションOK!
  if (valid) {
    author.classList.remove('is-invalid');
    content.classList.remove('is-invalid');
  };
}

/**
 * comment送信確認
 */
function btn_send_comment_Clicked() {
  const $modal = $('#modal_confirm');
  $modal.find('.modal-body').html(`
		<div>コメントを送信します。</div>
		<div class="mt-3 font_size_12">・公序良俗に反する書き込みはご遠慮ください。</div>
		<div class="font_size_12">・送信した内容は、原則あとから変更/削除はできませんので注意してください。</div>
		<div class="font_size_12">・どうしても変更・削除したい場合はご連絡ください。</div>
		<div class="mt-3">よろしければ、OKボタンを押してください。</div>
	`);
  confirmType = "sendComment";
  $modal.modal('show');
}

function send_comment() {
  if (fb) {
    let author = document.getElementById('comment_author').value.trim();
    const content = document.getElementById('comment_text').value.trim();
    if (!author) author = '名無しさん';

    fb.runTransaction(function (transaction) {
      const ref = fb.collection('comments');
      const newComment = ref.doc();
      return transaction.get(newComment).then(async () => {
        // 最新コメを1件取得
        const querySnapshot = await ref.orderBy("createdAt", "desc").limit(1).get()
        if (querySnapshot) {
          let newId = 0;
          await Promise.all(querySnapshot.docs.map(async (doc) => {
            const latest = await doc.data();
            newId = await latest.number;
          }));

          if (castInt(newId, -1) >= 0) {
            const comment = {
              number: castInt(newId) + 1,
              author: author,
              content: content,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await transaction.set(newComment, comment);
            return comment;
          }
          else return Promise.reject("ID採番エラー :", newId);
        }
      })
    }).then(function (comment) {
      document.getElementById('comment_text').value = '';
      document.getElementById('btn_send_comment').disabled = true;
    }).catch(function (err) {
      console.error(err);
      alert('コメントの投稿に失敗しました。サーバーサイドでエラーが発生しました。');
    });
  }
  else alert('謎の理由により、コメントの投稿に失敗しました。');
}

/**
 * URL短縮ボタンクリック
 */
async function btn_url_shorten_Clicked() {
  const button = document.getElementById('btn_url_shorten');
  const textbox = document.getElementById('input_url');
  const url = textbox.value.trim();

  if (button.classList.contains('shortening')) return;
  button.classList.add('shortening');
  button.textContent = '短縮中';

  // urlチェック
  if (!url) {
    textbox.value = "";
    inform_warning('URLを入力してください。');
  }
  else if (!url.match(/^(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/)) {
    textbox.value = "";

    // 隠し機能
    // デッキビルダー形式チェック
    const preset = readDeckBuilder(url);
    if (preset) {
      window.location.href = `../simulator/?predeck=${url}`;
    }
    // 所持装備チェック
    else if (readEquipmentJson(url)) {
      inform_success('所持装備の反映に成功しました。');
    }
    else if (readShipJson(url)) {
      inform_success('所持艦娘の反映に成功しました。');
    }
    else {
      inform_danger('入力されたURLの短縮に失敗しました。');
    }
  }
  else if (!url.match(/^(https:\/\/aircalc.page.link\/)([.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/)) {
    await postURLData(url)
      .then(json => {
        if (json.error || !json.shortLink) {
          textbox.value = "";
          inform_danger('入力されたURLの短縮に失敗しました。');
        }
        else {
          textbox.value = json.shortLink;
          inform_success('URLの短縮に成功しました。');
        }
      })
      .catch(error => {
        textbox.value = "";
        inform_danger('入力されたURLの短縮に失敗しました。');
      });
  }

  button.textContent = 'URL短縮';
  button.classList.remove('shortening');
}


/**
 * みんなの編成タブが押された
 */
function public_preset_tab_Shown() {
  $('#btn_search_preset').parent().removeClass('d-none');
  $('#map_select').parent().removeClass('d-none');
  $('#search_preset_parent').addClass('d-none');
  $('#empty_folder_visible_parent').addClass('d-none');

  if (castInt($('#presets_order').val()) === 0) {
    $('#presets_order').val(1);
    $('#presets_order').change();
    $('#presets_order').addClass('d-none');
  }
  $('#presets_order').find('option[value="0"]').prop('disabled', true);

  saveSessionStorage('display_public', true);

  if (!$('#map_select').html()) {
    let text = '<option value="0">全ての海域（最新の20件）</option>';
    for (const w of WORLD_DATA) {
      const world = w.world;
      const maps = MAP_DATA.filter(m => Math.floor(m.area / 10) === world);
      text += `<optgroup label="${w.name}">`;
      for (const m of maps) {
        const map = m.area % 10;
        text += `<option value="${m.area}">${world > 20 ? 'E' : world}-${map} : ${m.name}</option>`;
      }
    }
    $('#map_select').html(text);

    // 前回検索結果を復帰
    const result = loadSessionStorage('search_result');
    if (result) {
      $('#map_select').val(result.map);
      setPresets(result.presets, false);
    }
  }
  map_select_Changed();
}

/**
 * みんなの編成が非表示になった
 */
function public_preset_tab_Hidden() {
  $('#btn_search_preset').parent().addClass('d-none');
  $('#map_select').parent().addClass('d-none');
  $('#search_preset_parent').removeClass('d-none');
  $('#empty_folder_visible_parent').removeClass('d-none');
  $('#presets_order').find('option[value="0"]').prop('disabled', false);
  $('#presets_order').removeClass('d-none');

  saveSessionStorage('display_public', false);
}

/**
 * サイトテーマカラー変更
 */
function site_theme_Changed($this) {

  // 選択されているテーマを取得
  let theme = $this.attr('id');

  // 以前のクラス解除
  document.body.classList.remove(setting.themeColor);
  // テーマ設定
  document.body.classList.add(theme);

  if (theme === 'dark_theme' || theme === 'dark_gradient_theme' || theme === 'deep_blue_theme') {
    // ダーク系共通
    mainColor = "#e0e0e0";
    document.body.classList.add('dark-theme');
  }
  else {
    // 淡色系共通
    mainColor = "#000000";
    document.body.classList.remove('dark-theme');
  }

  // ヘッダーのURL欄は固定
  document.getElementById('input_url').classList.add('form-control-dark');

  setting.themeColor = theme;
  saveSetting();
  document.body.style.color = mainColor;
}

/**
 * タブ確認ダイアログ設定変更
 */
function confirm_tab_close_Clicked() {
  setting.confirmTabClosing = document.getElementById('confirm_tab_close')['checked'];
  saveSetting();
}

/**
 * イベントの登録
 */
document.addEventListener('DOMContentLoaded', function () {
  // 初期化
  initialize();

  // トップページへ
  document.getElementById('btn_top').addEventListener('click', () => { window.location.href = '../list/'; });
  // イベント配置
  $('#header').on('click', '.fleet_tab', topTab_Clicked);
  $('#main').on('click', '.version_detail', version_detail_Clicked);
  $('#main').on('click', '.btn_first_time', first_time_Clicked);
  $('#main').on('click', '.btn_site_manual', site_manual_Clicked);
  $('#main').on('click', '.theme_select', function () { site_theme_Changed($(this)); });
  $('#main').on('input', '#search_preset', setLocalPresets);
  $('#main').on('change', '#presets_order', setLocalPresets);
  $('#main').on('click', '#btn_search_preset', searchUploadedPreset);
  $('#main').on('change', '#map_select', map_select_Changed);
  $('#main').on('click', '#empty_folder_visible', setLocalPresets);
  $('#main').on('change', '#select_preset_level', function () { $('#btn_search_preset').prop('disabled', false); });
  $('#public_presets_container').on('click', '.preset_container .btn_open', function () { public_preset_Clicked($(this)); });
  $('#public_presets_container').on('click', '.preset_container.more_load', more_load_presets);
  $('#presets_container').on('click', '.preset_container:not(.editting, .folder_header, .folder_selectable)', function () { preset_Clicked($(this)); });
  $('#presets_container').on('click', '.btn_edit_start', function (e) { btn_edit_start_Clicked($(this), e); });
  $('#presets_container').on('click', '.btn_commit', function (e) { btn_commit_Clicked($(this), e); });
  $('#presets_container').on('click', '.btn_rollback', function (e) { btn_rollback_Clicked($(this), e); });
  $('#presets_container').on('click', '.btn_copy', function (e) { btn_copy_Clicked($(this), e); });
  $('#presets_container').on('click', '.btn_move_folder', function (e) { btn_move_folder_Clicked($(this), e); });
  $('#presets_container').on('click', '.btn_delete', function (e) { btn_delete_Clicked($(this), e); });
  $('#presets_container').on('click', '.folder_header.editting', function (e) { e.stopPropagation(); });
  $('#presets_container').on('click', '.btn_add_preset', function (e) { btn_add_preset_Clicked($(this), e); });
  $('#presets_container').on('click', '.btn_commit_folder', function (e) { btn_commit_folder_Clicked($(this), e); });
  $('#presets_container').on('click', '.btn_rollback_folder', function (e) { btn_rollback_folder_Clicked($(this), e); });
  $('#presets_container').on('click', '.preset_container.folder_selectable', function () { folder_selectable_Clicked($(this)); });
  $('#public_preset_tab').on('shown.bs.tab', public_preset_tab_Shown);
  $('#public_preset_tab').on('hidden.bs.tab', public_preset_tab_Hidden);
  $('#site_history').on('show.bs.collapse', '.collapse', loadSiteHistory);
  $('#site_board').on('show.bs.collapse', '.collapse', initializeBoard);
  $('#site_board').on('click', '#btn_send_comment', btn_send_comment_Clicked);
  $('#site_board').on('input', '#comment_author', comment_text_Changed);
  $('#site_board').on('input', '#comment_text', comment_text_Changed);
  $('#site_board').on('click', '.comment_index', function () { comment_index_Clicked($(this)) });
  $('#config_content').on('click', '#confirm_tab_close', confirm_tab_close_Clicked);
  $('#config_content').on('click', '#btn_reset_localStorage', btn_reset_localStorage_Clicked);
  $('#btn_url_shorten').click(btn_url_shorten_Clicked);
  $('#modal_confirm').on('click', '.btn_ok', modal_confirm_ok_Clicked);
  $('#modal_folder_confirm').on('click', '.btn_ok', modal_folder_confirm_ok_Clicked);
});
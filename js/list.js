
function initialize() {
  // アクティブなタブはないので表示修正
  $('.fleet_tab.active').removeClass('active');

  // 保存されているプリセットを展開
  setPresets();
}


/**
 * 編成一覧画面に、保存されている編成を展開
 */
function setPresets() {
  let presets = loadLocalStorage('presets');
  if (!presets) presets = [];

  const fragment = document.createDocumentFragment();

  // 新規作成用
  const new_container = document.createElement('div');
  new_container.className = 'general_box preset_container new';

  const new_body = document.createElement('div');
  new_body.className = 'new_body mx-auto my-2';
  new_body.textContent = '新規作成'
  new_container.appendChild(new_body);

  fragment.appendChild(new_container);


  for (const preset of presets) {
    const container = document.createElement('div');
    container.className = 'general_box preset_container';
    container.dataset.presetid = preset[0];

    const abstract = document.createElement('div');
    abstract.className = 'd-flex pb-1 preset_abstract border-bottom';

    // 編成アイコン
    const color = document.createElement('div');
    color.className = 'align-self-center preset_color';
    color.innerHTML = '&#9679;';
    abstract.appendChild(color);

    // 編成名
    const name = document.createElement('div');
    name.className = 'align-self-center ml-1 preset_name';
    name.textContent = preset[1];
    abstract.appendChild(name);

    // 名前編集欄
    const name_edit = document.createElement('input');
    name_edit.type = 'text';
    name_edit.className = 'align-self-center mx-1 form-control form-control-sm preset_name_edit d-none';
    name_edit.value = preset[1];
    abstract.appendChild(name_edit);

    // 編成編集コミットボタン
    const btn_commit = document.createElement('div');
    btn_commit.className = 'align-self-center ml-auto r_btn btn_commit d-none';
    btn_commit.innerHTML = '<i class="fas fa-save"></i>';
    abstract.appendChild(btn_commit);

    // 編成編集やめるボタン
    const btn_rollback = document.createElement('div');
    btn_rollback.className = 'align-self-center ml-1 r_btn btn_rollback d-none';
    btn_rollback.innerHTML = '<i class="fas fa-undo"></i>';
    abstract.appendChild(btn_rollback);

    // 編成編集開始ボタン
    const btn_edit = document.createElement('div');
    btn_edit.className = 'align-self-center ml-auto r_btn btn_edit_start';
    btn_edit.innerHTML = '<i class="fas fa-pencil"></i>';
    abstract.appendChild(btn_edit);

    // 編成コピーボタン
    const btn_copy = document.createElement('div');
    btn_copy.className = 'align-self-center ml-1 r_btn btn_copy';
    btn_copy.innerHTML = '<i class="fas fa-copy"></i>';
    abstract.appendChild(btn_copy);

    // 編成削除ボタン
    const btn_delete = document.createElement('div');
    btn_delete.className = 'align-self-center ml-1 r_btn btn_delete';
    btn_delete.dataset.toggle = 'tooltip';
    btn_delete.dataset.trigger = 'click';
    btn_delete.title = '削除する場合は、もう一度このボタンをクリックしてください。';
    btn_delete.innerHTML = '<i class="fas fa-trash-o"></i>';
    abstract.appendChild(btn_delete);

    container.appendChild(abstract);

    const preset_data = decodePreset(preset[2]);
    // 基地データ
    const lbs = preset_data[0];
    // 艦娘データ
    const fleets = preset_data[1];

    const land_base = document.createElement('div');
    land_base.className = 'mt-1 d-flex land_base_status';

    let exists_lb = false;
    for (let i = 1; i <= 3; i++) {
      // 基地データが入っていてかつお札が出撃
      const disabled = lbs.length >= 1 && lbs[1].length >= i && lbs[1][i - 1] > 0 ? '' : 'disabled';
      const status = document.createElement('div');
      status.className = `land_base_state no_${i} mr-1 ${disabled}`;
      status.textContent = `第${i}基地航空隊`;
      land_base.appendChild(status);

      if (!exists_lb && !disabled) {
        exists_lb = true;
      }
    }
    if (exists_lb) {
      container.appendChild(land_base);
    }

    const fleet_container = document.createElement('div');
    fleet_container.className = 'mt-1 d-flex ships flex-wrap';

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
    container.appendChild(fleet_container);

    if (preset[3]) {
      const textarea = document.createElement('textarea');
      textarea.className = 'form-control preset_memo mt-1';
      textarea.value = preset[3];
      textarea.disabled = true;
      container.appendChild(textarea);
    }

    fragment.appendChild(container);
  }

  document.getElementById('presets_container').innerHTML = '';
  document.getElementById('presets_container').appendChild(fragment);
  $('.btn_delete').tooltip();
}

/**
 * 編成編集開始
 * @param {JqueryDomObject} $this クリック要素
 */
function btn_edit_start_Clicked($this, e) {
  e.stopPropagation();
  const p = $this.closest('.preset_container');
  p.addClass('editting');
  // 編集領域
  p.find('.preset_name').addClass('d-none');
  p.find('.preset_name_edit').removeClass('d-none');
  // ボタン
  p.find('.btn_copy').addClass('d-none');
  p.find('.btn_commit').removeClass('d-none');
  p.find('.btn_rollback').removeClass('d-none');
  p.find('textarea').prop('disabled', false);
  $this.addClass('d-none');
}


/**
 * 編成編集完了
 * @param {JqueryDomObject} $this クリック要素
 */
function btn_commit_Clicked($this, e) {
  e.stopPropagation();
  const p = $this.closest('.preset_container');
  // 編集領域
  p.find('.preset_name').removeClass('d-none');
  p.find('.preset_name_edit').addClass('d-none');
  // ボタン
  p.find('.btn_copy').removeClass('d-none');
  p.find('.btn_rollback').addClass('d-none');
  p.find('.btn_edit_start').removeClass('d-none');
  p.find('textarea').prop('disabled', true);
  $this.addClass('d-none');

  p.removeClass('editting');
}

/**
 * 編成削除
 * @param {JqueryDomObject} $this クリック要素
 */
function btn_delete_Clicked($this, e) {
  e.stopPropagation();

  if ($this.hasClass('ready')) {
    $('.btn_delete').tooltip('hide');
    const presetId = $this.closest('.preset_container')[0].dataset.presetid;

    // 保存一覧から削除
    let presets = loadLocalStorage('presets');
    presets = presets.filter(v => v[0] !== presetId);
    saveLocalStorage('presets', presets);

    // タブからも削除(あれば)
    let activePresets = loadLocalStorage('activePresets');
    activePresets.presets = activePresets.presets.filter(v => v.id !== presetId);
    saveLocalStorage('activePresets', activePresets);

    setPresets();
    setTab();
  }
  else {
    $this.addClass('ready');
  }
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
    name: '無題',
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

  window.location.href = `../simulator/index.html?p=${tabData.history.histories[tabData.history.index]}`;
}

/**
 * トップページ内タブクリック時
 */
function topTab_Clicked() {
  let tabInfo = getActivePreset();
  window.location.href = `../simulator/index.html?p=${tabInfo.history.histories[tabInfo.history.index]}`;
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
      const $change_wrap = document.createElement('div');
      $change_wrap.className = 'mt-3';

      const $badge_wrap = document.createElement('div');
      const $badge = document.createElement('span');
      $badge.className = 'mr-1 pt-1 badge badge-pill badge-' + (v.type === 0 ? 'success' : v.type === 1 ? 'info' : 'danger');
      $badge.textContent = (v.type === 0 ? '新規' : v.type === 1 ? '変更' : '修正');

      const $title_text = document.createElement('span');
      $title_text.innerHTML = v.title;

      $badge_wrap.appendChild($badge);
      $badge_wrap.appendChild($title_text);
      $change_wrap.appendChild($badge_wrap);

      if (v.content) {
        const $content = document.createElement('div');
        $content.className = 'font_size_12 pl-3';
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
    const $ver_parent = document.createElement('div');
    $ver_parent.className = 'my-3 ver_log border-bottom';

    const $ver_title = document.createElement('div');
    $ver_title.className = 'py-2';
    $ver_title.textContent = 'v' + ver.id;

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
 * イベントの登録
 */
document.addEventListener('DOMContentLoaded', function () {
  // 初期化
  initialize();

  // トップページへ
  document.getElementById('btn_top').addEventListener('click', () => { window.location.href = '../list/index.html'; });
  // イベント配置
  $('#header').on('click', '.fleet_tab', topTab_Clicked);
  $('#main').on('click', '.version_detail', version_detail_Clicked);
  $('#main').on('click', '.btn_edit_start', function (e) { btn_edit_start_Clicked($(this), e); });
  $('#main').on('click', '.btn_commit', function (e) { btn_commit_Clicked($(this), e); });
  $('#main').on('click', '.btn_delete', function (e) { btn_delete_Clicked($(this), e); });
  $('#main').on('click', '.preset_container:not(.editting)', function () { preset_Clicked($(this)); });
  $('#site_history').on('show.bs.collapse', '.collapse', loadSiteHistory);
  document.body.onclick = () => { $('.btn_delete').removeClass('ready').tooltip('hide'); }
});
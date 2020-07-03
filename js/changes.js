/** 変更履歴 */
let CHANGE_LOG = [
	{ id: "0.0.1", changes: [{ type: 0, title: "設置", content: "初版設置" }] },
	{ id: "1.0.0", changes: [{ type: 0, title: "艦娘制空計算機能を実装しました。", content: "基本の機能です。" }] },
	{
		id: "1.0.1", changes: [
			{
				type: 0, title: "艦娘を12隻まで設定できるようになりました。",
				content: "レイアウトの都合上、第1艦隊、第2艦隊と別れていますが、両艦隊の制空値を合算して計算します。"
			},
			{ type: 0, title: "艦娘単位の制空値を表示するようにしました。", content: "各艦娘名の横に表示されます。" },
		]
	},
	{
		id: "1.1.0", changes: [
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
		id: "1.1.1", changes: [
			{
				type: 0, title: "敵艦の制空値直接入力機能を実装しました。",
				content: "敵艦選択から「直接入力」を選択したのち、制空値をクリックすると自由に設定できます。ここで入力した制空値は、基地航空隊の撃墜対象になりません。"
			}
		]
	},
	{
		id: "1.1.2", changes: [
			{
				type: 0, title: "機体のドラッグ&amp;ドロップによる入れ替え機能を実装しました。"
				, content: "入れ替えたい対象の機体の機体アイコン、または機体名付近をドラッグし、入れ替えたい位置までドラッグしてください。"
			}
		]
	},
	{
		id: "1.1.3", changes: [
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
		id: "1.1.4", changes: [
			{ type: 0, title: "5スロット艦に対応しました。", content: "該当する艦娘を編成した場合のみ表示されます。" },
			{
				type: 0, title: "基地航空隊各隊毎に、出撃/配備時の資源消費を確認できるようになりました。",
				content: "燃料、弾薬は<u>出撃時に自動的に消費される量</u>、ボーキサイトは<u>未配備の基地から現在の装備構成にした場合に自動的に消費される量</u>です。"
			},
		]
	},
	{
		id: "1.2.0", changes: [
			{
				type: 0, title: "防空計算に対応しました。",
				content: "3部隊同時設定可能です。いずれかの航空隊を「防空」に設定すると、他の航空隊で「集中」「単発」に設定するまで防空モードとなります。"
			},
		]
	},
	{
		id: "1.2.1", changes: [
			{
				type: 0, title: "機体プリセット機能を追加しました。",
				content: "デフォルトでいくつかプリセットが登録されていますが、削除して問題ありません。"
			},
		]
	},
	{
		id: "1.3.0", changes: [
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
		id: "1.3.1", changes: [
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
		id: "1.3.2", changes: [
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
		id: "1.3.3", changes: [
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
				type: 2, title: "ドラッグ&amp;ドロップ時の挙動の不具合を修正しました。",
				content: "艦隊欄でのドラッグ&amp;ドロップ時に改修値がおかしくなる現象、偵察機系の最大搭載数がおかしくなる現象を修正しました。"
			},
		],
	},
	{
		id: "1.3.4", changes: [
			{
				type: 0, title: "公開しました。",
				content: "デバッグ、動作検証に参加していただいた方、ありがとうございました。今後も改善案や要望、バグ報告など随時受け付けており、変更/修正/機能追加があった場合はお知らせしていきます。"
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
		id: "1.3.5", changes: [
			{
				type: 0, title: "2019秋イベント 対応",
				content: "確認できた敵編成から順次追加していきます。今後、強編成等が確認された場合は編成が変わる可能性があります。"
			},
		],
	},
	{
		id: "1.3.6", changes: [
			{
				type: 1, title: "第2艦隊の制空権争い参加の挙動を変更しました。",
				content: "対敵連合艦隊時にのみ、第2艦隊の制空値も考慮します。敵艦が連合艦隊を組んでいるマスは、各マスの「敵連合」にチェックを入れてください。"
			},
			{
				type: 0, title: "結果表示の際、空スロットを省略表示できるようにしました。",
				content: "結果表示欄の「未搭載スロットを非表示にする」にチェックを入れると表示を切り替えられます。選択状態は次回起動時にも引き継ぎます。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "長門型改に水上戦闘機、速吸改に艦上攻撃機が搭載できない現象の修正、三式戦 飛燕 の改修値を変更できない現象を修正しました。"
			},
		],
	},
	{
		id: "1.3.7", changes: [
			{
				type: 1, title: "一括設定をより細かく設定できるようになりました。",
				content: "基地/艦娘単位で、各機体の搭載数、改修値、熟練度を自由に設定できるようになりました。一括設定は <i class='fas fa-wrench'></i> アイコンをクリックすると起動します。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "ページ下部、 サイトについて > 使い方 欄の訂正を行いました。"
			},
		],
	},
	{
		id: "1.3.8", changes: [
			{
				type: 0, title: "計算結果欄に各種制空状態ボーダーを表示するようにしました。",
				content: "基地航空隊を派遣した場合、基準となる表示敵制空値は「平均値」となりますので、実際の制空状態ボーダーは表示値から前後する点に注意してください。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "保存した海域セル選択状況がうまく復帰できていなかった不具合、プリセット新規登録時の不具合を修正しました。"
			},
		],
	},
	{
		id: "1.4.0", changes: [
			{
				type: 0, title: "敵の対空砲火による撃墜(stage2)処理を実装しました。",
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
				content: "対空砲火による撃墜機能追加に伴い、駆逐艦などの非偵察機搭載艦などを追加しました。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "2019秋イベ E-6 [丁] の敵編成が表示されない不具合を修正しました。"
			},
		],
	},
	{
		id: "1.4.1", changes: [
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
		id: "1.4.2", changes: [
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
				content: "スマホ閲覧時に入れ替えが誤爆してしまう対策としてドラッグ開始可能範囲を限定、グラフの表示、非表示をトグル式で変更するようにしました。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "陸上偵察機補正が動かなくなっていた不具合を修正しました。"
			},
		],
	},
	{
		id: "1.4.3", changes: [
			{
				type: 0, title: "基地、艦娘のドラッグ&amp;ドロップによる交換機能を追加しました。",
				content: "ゲーム内編成画面のように、艦娘の画像をドラッグ&amp;ドロップすることで交換可能です。基地については「第X基地航空隊」の表示部分から交換可能です。"
			},
			{
				type: 0, title: "味方の連合艦隊、通常艦隊を切り替えられるようになりました。",
				content: "自艦隊欄「連合艦隊」チェックで変更できます。非チェック状態の場合、表示されている艦隊のみ計算対象になります。"
			},
			{
				type: 0, title: "本隊航空戦stage1直後の敵艦載機数表示を追加しました。",
				content: "計算結果欄最下部に表示されます。味方艦隊の対空砲火前の搭載数であることに注意してください。表示 / 非表示を選択可能です。"
			},
			{
				type: 0, title: "入力した艦娘の有効、無効を選択できるようになりました。",
				content: "「無効」とした艦は、入力内容はそのままですが計算対象になりません。該当の艦娘を艦隊に入れるか入れないか調整する際にお役立てください。無効状態でも装備換装等は通常通り可能です。"
			},
			{
				type: 0, title: "基地空襲をワンクリックで起こせるようになりました。",
				content: "基地航空隊欄の右上部にあるボタンから、空襲時の被害を各航空隊の最上部スロに対してランダムに発生させます。その隣のボタンから補給も可能です。"
			},
			{
				type: 0, title: "艦娘選択欄、および自艦隊欄に画像を追加しました。",
				content: ""
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "特定条件で試製景雲を他の艦に装備できる不具合を修正しました。"
			},
		],
	},
	{
		id: "1.5.0", changes: [
			{
				type: 0, title: "所持装備数入力機能を追加しました。",
				content: "サイト下部「所持装備」欄から入力可能です。特に入力しなくても本サイトは従来通り利用可能ですが、自分がゲームで所持している機体に合わせて所持数を入力すると、後述する新機能をより便利に活用できます。"
			},
			{
				type: 0, title: "所持機体から機体を選択する機能を追加しました。",
				content: "「所持装備」で設定した機体のみ選択できる機能です。改修値が設定されている場合、改修値が多いものから順に配備します。なお、保存した編成の読み込みや、プリセット展開などは、所持機体に関わらず従来通り利用可能です。"
			},
			{
				type: 0, title: "艦載機のおまかせ自動配備機能(仮)を実装しました。",
				content: "「所持装備」で設定した機体から艦載機を一気に自動で配備してくれる機能です。現段階では単純なアルゴリズムで配備を行うため、必ずしも最適な配置になるとは限りません。制空調整初期のたたき台などに利用してみてください。"
			},
			{
				type: 0, title: "各種一覧画面に、名称検索フォームを設置しました。",
				content: "装備、艦娘、敵艦の一覧画面に設置されています。入力文字列に部分一致したデータを表示します。"
			},
			{
				type: 1, title: "海域マップ選択画面の表示形式を変更しました。",
				content: "パターン毎に分かれていたマスを統一し、マス選択後にさらに編成を選択するように変更しました。また、通常海域の敵編成パターンをある程度追加しました。"
			},
			{
				type: 1, title: "UI / レイアウトの調整を行いました。",
				content: "とにかくいろいろ"
			},
		],
	},
	{
		id: "1.5.1", changes: [
			{
				type: 0, title: "ミニ期間限定イベント対応",
				content: "確認できた敵編成から順次追加しています。今後、強編成等が確認された場合は編成が変わる可能性があります。"
			},
			{
				type: 0, title: "おまかせ配備上書き回避機能を追加しました。",
				content: "各艦娘スロットの錠前アイコンから、そのスロットのおまかせ配備による上書きを回避できる機能です。主砲や缶用の空きスロットや、彩雲や夜間攻撃機などを指定艦に固定しておきたい場合にご利用ください。"
			},
			{
				type: 1, title: "おまかせ配備機能から、一部オプションを削除しました。",
				content: "重巡系の水戦ガン積み化を回避するオプションですが、上記ロック機能の実装により廃止になりました。"
			},
		],
	},
	{
		id: "1.5.2", changes: [
			{
				type: 0, title: "スクリーンショット機能を全ての入力欄に追加しました。",
				content: "各入力欄右上部の<i class='px-1 fas fa-camera'></i>を押下すると、その欄のスクリーンショットを保存し、お使いの端末にダウンロードします。SNSでの共有、備忘録等にご利用ください。"
			},
			{
				type: 0, title: "ミニ期間限定イベント対応",
				content: "確認できた敵編成から順次追加しています。今後、強編成等が確認された場合は編成が変わる可能性があります。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "オートセーブ時、特定条件でスロット位置がずれる不具合を修正しました。"
			},
		],
	},
	{
		id: "1.5.3", changes: [
			{
				type: 0, title: "機体選択画面内の機体一覧ソート機能を強化改修しました。",
				content: "出撃時の対空値、防空時の対空値などでソートできるようになりました。ソート条件は保存され、次回サイト訪問時に復帰します。"
			},
			{
				type: 0, title: "海域選択画面にて、陣形、敵艦隊防空値の表示を追加しました。",
				content: ""
			},
			{
				type: 1, title: "基地空襲発生ボタンによる被害を4機固定に変更しました。",
				content: "「詳細設定」欄から、該当のオプションのON/OFFを切り替えられます。OFFにすると、従来のように1～4機のランダム被害を発生させます。"
			},
			{
				type: 2, title: "表示・レイアウトの修正を行いました。",
				content: "特定の環境において、想定していない描画がなされているケースがありましたので対策を入れました。また、一部表記揺れのあった文言を修正しました。"
			},
		],
	},
	{
		id: "1.5.4", changes: [
			{
				type: 2, title: "敵艦の対空性能を修正しました。",
				content: "全滅率や制空調整に大きく関わるため急遽修正しました。申し訳ありませんでした。2020/3/13以前に作成した編成がある場合、今一度計算結果をご確認ください。"
			},
		],
	},
	{
		id: "1.5.5", changes: [
			{
				type: 0, title: "編成のバックアップ機能を追加しました。",
				content: "誤って艦隊をリセットしたり他のURLを読み込んで上書きされた際、編成を復元できる機能です。「編成保存・展開」からバックアップの確認や展開が可能です。保存件数や機能の停止などは「詳細設定」から行ってください。"
			},
			{
				type: 0, title: "使い方、初めての方への案内、よくある質問を追加しました。",
				content: "あれ？と思ったらまずは「初めての方へ」や「よくある質問」などを見て下さい。"
			},
			{
				type: 1, title: "出撃時対空、防空時対空ソート時の対空値の表記を変更しました。",
				content: "機体一覧において、従来は装備の素対空値を表示していましたが、ソート条件を前述の2つにした場合、それぞれ実際の出撃時対空値、防空時対空値を表示するように変更しました。"
			},
			{
				type: 1, title: "連合艦隊のチェック状態を保持するようにしました。",
				content: ""
			},
		],
	},
	{
		id: "1.5.6", changes: [
			{
				type: 0, title: "海域一括入力機能を追加しました。",
				content: "1戦目から順に連続で敵艦隊を入力できる機能です。戦闘数を事前に把握しておく必要がなくなりました。「敵艦隊」欄からご利用ください。"
			},
			{
				type: 1, title: "艦隊欄のリセットボタンのUIを変更しました。",
				content: "ゴミ箱アイコンです。従来の装備一括解除ボタンは、ゲーム同様のUIに倣っています"
			},
			{
				type: 1, title: "艦娘の無効化状態を保持するように変更しました。",
				content: ""
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "結果表示欄において、非表示にした表示物が再度表示されてしまう現象を修正しました。"
			},
		],
	},
	{
		id: "1.6.0", changes: [
			{
				type: 0, title: "搭載数詳細計算機能(艦娘)を追加しました。",
				content: "出撃終了時点での艦娘の各搭載数の分布を詳細に表示できるようになりました。「計算結果」欄から、見たい機体をクリックすると表示されます。"
			},
			{
				type: 0, title: "搭載数詳細計算機能(敵艦)を追加しました。",
				content: "本隊航空戦終了後の敵艦載機の残数や、その航空戦火力の詳細表示が可能になりました。対空装備をどの程度積むのかの参考にしてください。"
			},
			{
				type: 0, title: "海域一覧画面でのダブルクリックに対応しました。",
				content: "戦闘マスや編成パターン名をダブルクリックすることでも敵艦を展開できるようになりました。パターンが複数あるマスの誤展開には注意してください。"
			},
			{
				type: 0, title: "「よく使う」順でソートできるようになりました。",
				content: "装備一覧、艦娘一覧の表示順を、自身がよく選択する順でソートできるようになりました。詳細設定から学習した情報のリセットも可能です。"
			},
			{
				type: 0, title: "背景色を自由に変更できるようにしました。",
				content: "「詳細設定」欄から変更できます。いつもと違う気分で計算したい方に。"
			},
			{
				type: 0, title: "新装備を追加しました。",
				content: "新型のSwordfish系列、Fairey Seafox改を追加しました。"
			},
			{
				type: 1, title: "よくある質問を更新しました。",
				content: ""
			},
		],
	},
	{
		id: "1.6.1", changes: [
			{
				type: 0, title: "搭載数詳細計算機能(基地)を追加しました。",
				content: "基地航空隊の被撃墜数の詳細表示が可能になりました。計算結果欄の基地の制空結果欄をクリックすると表示します。"
			},
			{
				type: 0, title: "各大見出しの入れ替え状況を保存するようにしました。",
				content: "順序入れ替え終了ボタンを押した時点での順序が保持されます。"
			},
			{
				type: 1, title: "搭載数詳細計算画面のUIを変更しました。",
				content: "画面を開いたまま別の装備の詳細を表示できるようになりました。別の搭載艦を見たい場合は今まで通り一度閉じてください。"
			},
		],
	},
	{
		id: "1.6.1.1", changes: [
			{
				type: 1, title: "機体ソート項目に「基地攻撃時の火力順」を追加しました。",
				content: "対水上艦への攻撃の場合で、陸攻特効等の補正は考慮していません。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "基地詳細計算時、偵察機系の機体が航空戦stage1の撃墜対象外だった問題、陸攻の改修値が航空戦火力に適用されていなかった問題を修正しました。"
			},
		],
	},
	{
		id: "1.6.2", changes: [
			{
				type: 0, title: "敵艦隊の対空砲火計算機能を追加しました。",
				content: "入力した敵艦隊毎に、敵艦それぞれの割合、固定撃墜数などを一覧で表示します。同画面内にて簡易的な撃墜数の試算も可能です。敵艦隊欄の <i class='fas fa-exclamation-circle text-primary'></i> アイコンをクリックすると起動します。"
			},
			{
				type: 1, title: "共有URL発行時のURLを短縮化するように変更しました。",
				content: ""
			},
			{
				type: 0, title: "新装備を追加しました。",
				content: "天山一二型甲改2種、XF5Uを追加しました。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "敵艦隊未設定時に計算結果欄の表示が意図していない表示になっていた現象を修正しました。神州丸改に水上爆撃機が搭載できない件を修正しました。"
			},
		],
	},
	{
		id: "1.7.0", changes: [
			{
				type: 0, title: "噴式強襲航空攻撃による撃墜を実装しました。",
				content: "内部的な処理の追加ですので、今までと特に入力方法を変更する必要はありません。なお、計算結果欄の各戦闘毎の表示に関して、搭載数については<span class='font-weight-bold'>噴式強襲前</span>の搭載数、制空値(自艦隊)については<span class='font-weight-bold'>噴式強襲後</span>の制空値が表示されています。"
			},
			{
				type: 0, title: "噴式爆撃機の通常航空戦Stage1撃墜軽減処理を追加しました。",
				content: ""
			},
			{
				type: 0, title: "敵艦隊欄の敵艦を画像表示できるようになりました。",
				content: "従来通りの敵艦名称表示と、画像表示とで切り替えられます。お好きな方をご利用ください。"
			},
			{
				type: 1, title: "敵側の撃墜処理を微修正しました。",
				content: ""
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "改修不可で、かつ★付きの装備の改修値が変更できない問題を修正しました。一部艦爆の改修効果が間違っていた箇所を修正しました。"
			},
		],
	},
	{
		id: "1.7.1", changes: [
			{
				type: 0, title: "ダークテーマβを導入しました。",
				content: "「詳細設定」欄の最下部にて変更できます。試験的な導入のため、表示がおかしい箇所が出ているかもしれません。お気づきの点がありましたらご報告ください。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "長門改に水上戦闘機が装備できない状態になっていた問題を修正しました。"
			},
		],
	},
	{
		id: "1.7.2", changes: [
			{
				type: 0, title: "元に戻す(Undo)、やり直す(Redo)機能を追加しました。",
				content: "「Ctrl + Z」「Ctrl + Y」を押下してください。"
			},
			{
				type: 0, title: "テーマ『深海』を導入しました。",
				content: "赤くはないです。例によって、「詳細設定」欄の最下部にて変更可能です。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "敵艦の制空値直接入力時、および艦載機熟練度変更時の挙動がおかしい不具合を修正しました。"
			},
		],
	},
	{
		id: "1.7.3", changes: [
			{
				type: 0, title: "機体のお気に入り機能を追加しました。",
				content: "お気に入りに登録した機体のみを一覧から選択できるようになりました。所持装備欄で機体のお気に入り登録が可能です。機体一覧にて「お気に入りのみ」モードが実装されておりますので、そちらをクリックしご活用ください。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "初期表示時にテーマが固定されてしまう不具合、特定条件で艦娘無効機能が別の艦娘に対して動作してしまう不具合を修正しました。"
			},
		],
	},
	{
		id: "1.7.3.1", changes: [
			{
				type: 1, title: "詳細計算画面のレイアウトを微妙に変更しました。",
				content: "そのうちまた変わります。"
			},
			{
				type: 2, title: "軽微な不具合の修正を行いました。",
				content: "基地航空隊のラベルが全て第1基地航空隊になっていた問題を修正しました。"
			},
		],
	},
	{
		id: "1.7.4", changes: [
			{
				type: 0, title: "敵艦隊の航空戦前後の制空値分布表示機能を追加しました。",
				content: "計算結果欄最下部に増設しました。航空戦後の値は、主に航空支援時の制空値調整に利用可能です。"
			},
			{
				type: 1, title: "サイト表示速度の改善を行いました。",
				content: "いろいろ施しました。スマホ閲覧時はやはり重い模様。また、Loading画面は撤廃しました。"
			},
			{
				type: 1, title: "バージョン変更内容を任意で表示するようにしました。",
				content: "この文言を表示できたということは、変更内容の表示方法の解説は不要ですね！"
			},
		],
	},
	{
		id: "1.7.5", changes: [
			{
				type: 0, title: "基地 & 艦隊入力欄下部に、制空状態ゲージを追加しました。",
				content: "計算結果欄にて表示されている基地と艦隊の制空状態ゲージを、スクロールせずに確認できます。なお、基地は第1波の制空状態が表示されています。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "高高度空襲計算時、すべての基地航空隊を外した際、最後の制空値が削除されずゾンビ化して計算される不具合を修正しました。"
			},
		],
	},
	{
		id: "1.7.6", changes: [
			{
				type: 0, title: "ドラッグ & ドロップ可能な機体一覧画面を追加しました。",
				content: "基地航空隊欄または艦隊欄の <i class='fas fa-list-ul'></i> ボタンから起動します。表示されている機体をドラッグ & ドロップで装備させることができます。また、この画面自体も自由に動かせます。"
			},
		],
	},
	{
		id: "1.7.6.1", changes: [
			{
				type: 1, title: "淡色系のテーマを2種追加しました。テーマ案まだまだ募集中です",
				content: "「空(Sky)」と「桜」の2種です。単なる背景色の変更だけかとか言わない。また、テーマ変更時の処理の最適化を行いました。その関係で、v1.7.6以前適用していたテーマはリセットされています。お手数ですが再度変更してください。"
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "特定条件で、艦娘の搭載数を初期値に戻す際、0機になる不具合を修正しました。"
			},
		],
   },
   {
		id: "1.7.7", changes: [
         {
				type: 0, title: "味方艦隊の触接率の計算及び表示を追加しました。",
				content: "自艦隊欄の、艦隊制空値の隣に追加されています。詳細アイコン<i class='fas fa-search'></i>をクリックするとより詳しい触接率を表示します。"
			},
			{
				type: 1, title: "一部UIデザインを調整しました。",
				content: ""
			},
			{
				type: 2, title: "不具合の修正を行いました。",
				content: "特定条件で、自動保存されたデータが復帰できず消えてしまう不具合を修正しました。スクリーンショットボタンクリック時に背景色がおかしくなる現象を修正しました。"
			},
		],
   },
   {
		id: "1.7.8", changes: [
         {
				type: 0, title: "基地航空隊の触接率の計算が可能になりました。",
				content: "基地航空隊の、触接詳細アイコン<i class='fas fa-search'></i>をクリックすると、各制空状態下での触接率を表示します。"
			},
			{
				type: 0, title: "2020梅雨イベント 対応",
				content: "確認できた敵編成から順次追加していきます。今後、強編成等が確認された場合は編成が変わる可能性があります。"
			},
		],
   },
   {
		id: "1.7.9", changes: [
         {
				type: 0, title: "コメント欄を開設しました。",
				content: "サイト下部にて、バグ報告、要望、情報提供、質問、感想など自由に書き込めるコメント欄が新設されています。気軽にご利用ください。"
			},
			{
				type: 0, title: "編成プリセットの順の変更が可能になりました。",
				content: "編成プリセットの、連番が振られている箇所をドラッグ & ドロップすることで、プリセットの順番を変更できます。"
         },
         {
				type: 2, title: "不具合の修正を行いました。",
				content: "基地航空隊をドラッグ & ドロップで入れ替えた際に、ゲージの表示がおかしくなる現象を修正しました。"
			},
		],
	},
];

const LAST_UPDATE_DATE = "2020/07/03";

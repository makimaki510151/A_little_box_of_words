# 小さな箱の言葉 — A Little Box of Words

タイピングで資源を集め、小さな箱庭を育て、住人や物語を解き明かしていく Web ゲームです。

Widget Idle のコンパクトな成長体験に影響を受けつつ、独自のタイピング × 放置育成 × ストーリー構成で制作しています。

## 遊び方

1. 表示された単語・文章を入力する（Enter で確定）
2. 獲得した **文字片 / 記憶 / 星屑** で施設を建設・強化する
3. 施設の自動生産で放置中も進行する
4. 住人・物語・実績を解放していく

## プレイ（公開URL）

https://makimaki510151.github.io/A_little_box_of_words/

## 技術構成

- React + TypeScript + Vite
- セーブ：LocalStorage（エクスポート / インポート対応）
- 公開：GitHub Pages（静的ビルド）

## GitHub Pages 設定

リポジトリの **Settings → Pages** で、次のいずれかにしてください。

1. **推奨:** Source = **GitHub Actions**
2. または Source = **Deploy from a branch** → Branch `gh-pages` / folder `/`

`main` ブランチのルートをそのまま公開すると、Vite のソース `index.html` が配信されゲームが動きません。

## 開発

```bash
npm install
npm run dev
npm run build
```

## MVP 範囲

- タイピング（単語・短文・長文・特別）
- 資源 3 種、施設 5 種、住人 3 人
- ストーリー（序章〜第一章）
- 放置生産（オフライン上限 8 時間）
- 実績 10 種、図鑑、設定パネル

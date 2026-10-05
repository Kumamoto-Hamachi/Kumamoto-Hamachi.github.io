# Kumamoto-Hamachi.github.io

https://kumamoto-hamachi.github.io/ のソース。[Astro](https://astro.build/) で静的サイトを生成し、GitHub Actions で GitHub Pages に公開する。

## 開発

Node.js 22.12 以上が必要。

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に出力
npm run preview  # dist/ をローカルで配信
```

## 構成

| パス | 役割 |
|---|---|
| `src/data/articles.yaml` | 記事の台帳（タイトル、説明、カテゴリ、公開日、シリーズ） |
| `src/data/categories.yaml` | カテゴリの定義（表示名、説明、表示順） |
| `src/data/series.yaml` | シリーズの定義（タイトル、説明） |
| `src/content.config.ts` | 台帳の項目と型 |
| `src/pages/articles/<id>.astro` | 独自デザインの記事ページ |
| `src/pages/` のそれ以外 | トップ、記事一覧、カテゴリ、シリーズのページ |
| `src/layouts/` | ページの外枠 |
| `src/lib/content.ts` | 台帳を読んで並べる関数 |

## 記事を追加する

1. `src/pages/articles/<id>.astro` を作り、`ArticlePage` で包む（既存の記事を参照）
2. `src/data/articles.yaml` に同じ `id` で登録する

カテゴリは 1 記事に 1 つ。何に使うかではなく、読み終えて身につく知識の分野で決める。
シリーズに入れる場合は `series` と `seriesOrder` をセットで書く。

台帳とページの片方だけがある場合や、存在しないカテゴリ・シリーズを指定した場合は、ビルドが失敗する。

## 公開

`main` への push で `.github/workflows/deploy.yml` がビルドして GitHub Pages に公開する。PR ではビルドが通るかだけを確かめる。

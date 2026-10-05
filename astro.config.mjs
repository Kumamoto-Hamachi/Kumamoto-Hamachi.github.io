// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://kumamoto-hamachi.github.io',
  // HTML の空白を圧縮しない。手書き HTML から移植した記事の表示を変えないため。
  // - v7 既定の 'jsx' はインライン要素間の空白を消す
  // - true（v6 までの既定）も、テキスト先頭や要素間の全角スペース（U+3000）を消し、数式の字下げが崩れる
  compressHTML: false,
});

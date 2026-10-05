import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type Category = CollectionEntry<'categories'>;
export type Series = CollectionEntry<'series'>;

// 独自デザインの記事ページの id 一覧。キーだけを使い、ページ本体は読み込まない
const articlePageIds = new Set(
  Object.keys(import.meta.glob('/src/pages/articles/*.astro')).map((path) =>
    path.replace(/^.*\/(.+)\.astro$/, '$1'),
  ),
);

export function articleUrl(id: string): string {
  return `/articles/${id}/`;
}

export function categoryUrl(id: string): string {
  return `/categories/${id}/`;
}

export function seriesUrl(id: string): string {
  return `/series/${id}/`;
}

// 新しい順。同じ日はシリーズの後ろの記事を先にする
function compareNewestFirst(a: Article, b: Article): number {
  return (
    b.data.publishedAt.getTime() - a.data.publishedAt.getTime() ||
    (b.data.seriesOrder ?? 0) - (a.data.seriesOrder ?? 0) ||
    a.id.localeCompare(b.id)
  );
}

// 台帳の不整合を集める。
// reference() は参照先がないと [ERROR] を出すだけでビルドは成功し、その記事が一覧から黙って消えるため自前で確かめる
function findLedgerProblems(articles: Article[], categories: Category[], seriesList: Series[]): string[] {
  const categoryIds = new Set(categories.map((c) => c.id));
  const seriesIds = new Set(seriesList.map((s) => s.id));
  const problems: string[] = [];
  const seenOrders = new Map<string, string>();

  for (const { id, data } of articles) {
    if (!articlePageIds.has(id)) {
      problems.push(`${id}: ページ src/pages/articles/${id}.astro がない`);
    }
    if (!categoryIds.has(data.category.id)) {
      problems.push(`${id}: カテゴリ ${data.category.id} が src/data/categories.yaml にない`);
    }
    if (data.series) {
      if (!seriesIds.has(data.series.id)) {
        problems.push(`${id}: シリーズ ${data.series.id} が src/data/series.yaml にない`);
      }
      const key = `${data.series.id}#${data.seriesOrder}`;
      const other = seenOrders.get(key);
      if (other) {
        problems.push(`${id}: シリーズ ${data.series.id} の seriesOrder ${data.seriesOrder} が ${other} と重複`);
      }
      seenOrders.set(key, id);
    }
  }
  return problems;
}

export async function getArticles(): Promise<Article[]> {
  const [articles, categories, seriesList] = await Promise.all([
    getCollection('articles'),
    getCollection('categories'),
    getCollection('series'),
  ]);
  const problems = findLedgerProblems(articles, categories, seriesList);
  if (problems.length > 0) {
    throw new Error(`src/data/articles.yaml の不整合:\n${problems.join('\n')}`);
  }
  return articles.sort(compareNewestFirst);
}

export interface CategoryWithArticles {
  category: Category;
  articles: Article[];
}

// 表示順に並べたカテゴリ。記事が 1 本もないカテゴリは含めない
export async function getCategoriesWithArticles(): Promise<CategoryWithArticles[]> {
  const [categories, articles] = await Promise.all([getCollection('categories'), getArticles()]);
  return categories
    .sort((a, b) => a.data.order - b.data.order)
    .map((category) => ({
      category,
      articles: articles.filter((a) => a.data.category.id === category.id),
    }))
    .filter(({ articles }) => articles.length > 0);
}

export interface SeriesWithArticles {
  series: Series;
  // シリーズ内の順番で並べる
  articles: Article[];
}

export async function getSeriesWithArticles(): Promise<SeriesWithArticles[]> {
  const [seriesList, articles] = await Promise.all([getCollection('series'), getArticles()]);
  return seriesList
    .map((series) => ({
      series,
      articles: articles
        .filter((a) => a.data.series?.id === series.id)
        .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0)),
    }))
    .filter(({ articles }) => articles.length > 0);
}

// 公開日を YYYY-MM-DD で返す。publishedAt は UTC 0 時なので、環境のタイムゾーンに左右されない
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

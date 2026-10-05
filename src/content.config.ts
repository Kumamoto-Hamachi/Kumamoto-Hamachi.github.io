import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const categories = defineCollection({
  loader: file('src/data/categories.yaml'),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    // 一覧での表示順
    order: z.number().int(),
  }),
});

const series = defineCollection({
  loader: file('src/data/series.yaml'),
  schema: z.object({
    title: z.string(),
    // 見出しの上に添える英字の短いラベル
    eyebrow: z.string().optional(),
    description: z.string(),
  }),
});

// 独自デザインの .astro ページとして作った記事の台帳。
// ページ本体は src/pages/articles/<id>.astro に置く。
const articles = defineCollection({
  loader: file('src/data/articles.yaml'),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      category: reference('categories'),
      publishedAt: z.coerce.date(),
      // カードに添える英字の短いラベル
      label: z.string().optional(),
      series: reference('series').optional(),
      // シリーズ内の順番（1 始まり）
      seriesOrder: z.number().int().positive().optional(),
    })
    .refine((data) => (data.series === undefined) === (data.seriesOrder === undefined), {
      message: 'series と seriesOrder はセットで指定してください',
    }),
});

export const collections = { categories, series, articles };

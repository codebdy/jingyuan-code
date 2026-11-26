import { news } from './home';
const slugs = ['smarter-manufacturing-better-quality', 'advancing-manufacturing-excellence', 'industry-trends-in-focus'];

// The supplied list repeats three headlines. Each headline has one canonical
// article; the existing summary is the approved body placeholder.
export const newsArticles = news.map((item, index) => ({
  ...item,
  slug: slugs[index],
  date: '2026-10-20',
  displayDate: 'October 20, 2026',
  category: 'Exhibition Information',
  body: [item.description],
}));
export type NewsArticle = typeof newsArticles[number];
export const findNewsArticle = (text: string) => newsArticles.find(article => text.includes(article.title));
export function newsPath(title: string) {
  const article = findNewsArticle(title);
  return article ? `/news/${article.slug}/` : '/news/';
}

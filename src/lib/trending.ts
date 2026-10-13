import { db } from "@/lib/db";

/**
 * Returns the Date corresponding to the start of the current week (Monday 00:00:00).
 */
export function getStartOfWeek(d: Date = new Date()): Date {
  const date = new Date(d.getTime());
  const day = date.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Automatically resets weeklyViews for any articles whose reset timestamp is prior to the start of the current week.
 */
export async function syncWeeklyViewsReset(): Promise<void> {
  try {
    const startOfWeek = getStartOfWeek();
    await db.article.updateMany({
      where: {
        OR: [
          { weeklyViewsResetAt: { lt: startOfWeek } },
          { weeklyViewsResetAt: null },
        ],
      },
      data: {
        weeklyViews: 0,
        weeklyViewsResetAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error syncing weekly views reset:", error);
  }
}

/**
 * Records a page visit for an article, handling the weekly cycle refresh and increment.
 */
export async function incrementArticleViews(articleId: string) {
  const startOfWeek = getStartOfWeek();

  const article = await db.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      views: true,
      weeklyViews: true,
      weeklyViewsResetAt: true,
      publishedAt: true,
      deletedAt: true,
    },
  });

  if (!article || !article.publishedAt || article.deletedAt) {
    return null;
  }

  // Check if article needs weekly reset
  const needsReset = !article.weeklyViewsResetAt || article.weeklyViewsResetAt < startOfWeek;

  const updated = await db.article.update({
    where: { id: articleId },
    data: {
      views: { increment: 1 },
      weeklyViews: needsReset ? 1 : { increment: 1 },
      weeklyViewsResetAt: needsReset ? new Date() : undefined,
    },
    select: {
      id: true,
      views: true,
      weeklyViews: true,
    },
  });

  return updated;
}

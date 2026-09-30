import { db } from "@/lib/db";

// Retention duration in hours (3 days = 72 hours)
export const TRASH_RETENTION_HOURS = 72;
export const TRASH_RETENTION_MS = TRASH_RETENTION_HOURS * 60 * 60 * 1000;

/**
 * Automatically clean up (permanently delete) articles in the trash
 * that have been pending for more than 3 days (72 hours).
 */
export async function cleanupExpiredTrash(): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - TRASH_RETENTION_MS);

    // Delete articles where deletedAt is older than 3 days
    const result = await db.article.deleteMany({
      where: {
        deletedAt: {
          not: null,
          lte: cutoffDate,
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error("Error cleaning up expired trash:", error);
    return 0;
  }
}

/**
 * Calculate the expiration date for an item in trash
 */
export function getTrashExpiryDate(deletedAt: Date | string): Date {
  const deletedTime = new Date(deletedAt).getTime();
  return new Date(deletedTime + TRASH_RETENTION_MS);
}

/**
 * Calculate humanized remaining time before automatic deletion
 */
export function getTrashRemainingInfo(deletedAt: Date | string): {
  isExpired: boolean;
  remainingMs: number;
  label: string;
} {
  const expiryTime = getTrashExpiryDate(deletedAt).getTime();
  const now = Date.now();
  const diff = expiryTime - now;

  if (diff <= 0) {
    return {
      isExpired: true,
      remainingMs: 0,
      label: "Kedaluwarsa (segera dihapus otomatis)",
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  let label = "";
  if (days > 0) {
    label = `${days} hari ${remainingHours} jam lagi`;
  } else if (hours > 0) {
    label = `${hours} jam lagi`;
  } else {
    const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
    label = `${minutes} menit lagi`;
  }

  return {
    isExpired: false,
    remainingMs: diff,
    label,
  };
}

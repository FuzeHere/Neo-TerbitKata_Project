import React from "react";
import { db } from "@/lib/db";
import CommentModerator from "@/components/admin/CommentModerator";

export const revalidate = 0;

export default async function AdminCommentsPage() {
  const comments = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      article: { select: { title: true, slug: true } },
      parent: { select: { name: true } }
    }
  });

  const serializedComments = comments.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderasi Komentar</h1>
        <p className="text-muted-foreground">Tinjau, setujui, atau tolak komentar dari pembaca portal.</p>
      </div>

      <CommentModerator initialComments={serializedComments} />
    </div>
  );
}

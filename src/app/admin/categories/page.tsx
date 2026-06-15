import React from "react";
import { db } from "@/lib/db";
import CategoryTagManager from "@/components/admin/CategoryTagManager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const [categories, tags] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } }
    }),
    db.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kategori & Tag</h1>
        <p className="text-muted-foreground">Kelola taksonomi pengelompokan berita TerbitKata.</p>
      </div>

      <CategoryTagManager initialCategories={categories} initialTags={tags} />
    </div>
  );
}

import React from "react";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, FolderKanban, MessageSquare, Plus, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const revalidate = 0; // Force dynamic rendering

export default async function AdminDashboard() {
  // Query data directly on server
  const [
    totalArticles,
    totalCategories,
    totalComments,
    pendingCommentsCount,
    latestArticles
  ] = await Promise.all([
    db.article.count(),
    db.category.count(),
    db.comment.count(),
    db.comment.count({ where: { status: "PENDING" } }),
    db.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        categories: { select: { name: true } }
      }
    })
  ]);

  const stats = [
    {
      title: "Total Artikel",
      value: totalArticles,
      icon: FileText,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      description: "Semua artikel yang terdaftar"
    },
    {
      title: "Kategori & Tag",
      value: totalCategories,
      icon: FolderKanban,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      description: "Kategori pembagian topik"
    },
    {
      title: "Total Komentar",
      value: totalComments,
      icon: MessageSquare,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      description: `Termasuk ${pendingCommentsCount} menunggu persetujuan`
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview Dashboard</h1>
          <p className="text-muted-foreground">Kinerja portal berita dan moderasi konten TerbitKata.</p>
        </div>
        <Link
          href="/admin/articles/create"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-medium text-sm px-4 py-2 rounded-lg transition shadow-md shadow-primary/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tulis Artikel Baru
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notifications Alert if comments are pending */}
      {pendingCommentsCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Ada Komentar Menunggu Moderasi</h4>
            <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
              Terdapat <strong>{pendingCommentsCount}</strong> komentar baru dari pembaca yang belum diperiksa. 
              Segera tinjau komentar tersebut untuk menjaga kualitas diskusi di portal Anda.
            </p>
            <Link 
              href="/admin/comments" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline mt-2"
            >
              Moderasi Sekarang <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Latest Articles Table */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Artikel Terbaru</CardTitle>
            <p className="text-xs text-muted-foreground">5 artikel yang terakhir dipublikasikan atau ditulis.</p>
          </div>
          <Link
            href="/admin/articles"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-3 px-4">Judul Artikel</th>
                  <th className="py-3 px-4">Penulis</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Tanggal Dibuat</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada artikel yang dibuat. Mulai tulis artikel pertama Anda!
                    </td>
                  </tr>
                ) : (
                  latestArticles.map((article) => (
                    <tr 
                      key={article.id}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium max-w-sm truncate">
                        <Link href={`/admin/articles/edit/${article.id}`} className="hover:text-primary transition">
                          {article.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{article.author.name}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {article.categories.map((cat) => (
                            <span 
                              key={cat.name}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{formatDate(article.createdAt)}</td>
                      <td className="py-3.5 px-4">
                        <span 
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium inline-block ${
                            article.publishedAt 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {article.publishedAt ? "Dipublikasikan" : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

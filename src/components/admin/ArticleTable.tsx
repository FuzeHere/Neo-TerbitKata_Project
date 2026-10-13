"use client";

import React, { useState } from "react";
import { Search, Edit, Trash2, ExternalLink, Calendar, User, Eye, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ArticleTableProps {
  initialArticles: any[];
  userRole?: string;
}

export default function ArticleTable({ initialArticles, userRole }: ArticleTableProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "pilihan" | "featured" | "published" | "draft">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const router = useRouter();

  // Filter articles based on search query and active tab
  const filteredArticles = articles.filter((article) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      article.title.toLowerCase().includes(searchLower) ||
      article.author.name.toLowerCase().includes(searchLower) ||
      article.categories.some((cat: any) => cat.name.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    if (filterTab === "pilihan") return !!article.isEditorChoice;
    if (filterTab === "featured") return !!article.isFeatured;
    if (filterTab === "published") return !!article.publishedAt;
    if (filterTab === "draft") return !article.publishedAt;
    return true;
  });

  const handleTogglePilihan = async (id: string, currentVal: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEditorChoice: !currentVal }),
      });
      if (res.ok) {
        setArticles((prev) =>
          prev.map((art) => (art.id === id ? { ...art, isEditorChoice: !currentVal } : art))
        );
        router.refresh();
      } else {
        alert("Gagal memperbarui status Pilihan TerbitKata.");
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMsg =
      userRole === "WRITER"
        ? "Apakah Anda yakin ingin menghapus artikel ini?\n\nArtikel akan segera ditarik dari web publik dan masuk ke kotak sampah akun admin untuk persetujuan penghapusan."
        : "Apakah Anda yakin ingin memindahkan artikel ini ke kotak sampah?\n\nArtikel akan ditarik dari web dan dapat dipulihkan atau dihapus permanen oleh admin.";

    if (!confirm(confirmMsg)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setArticles(articles.filter((art) => art.id !== id));
        alert(data.message || "Artikel berhasil diproses.");
        router.refresh();
      } else {
        alert(data.error || "Gagal memproses penghapusan artikel.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi saat menghapus.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Filter Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-5 pt-3 flex gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setFilterTab("all")}
          className={`pb-3 px-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            filterTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Semua ({articles.length})
        </button>
        <button
          onClick={() => setFilterTab("pilihan")}
          className={`pb-3 px-2 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            filterTab === "pilihan"
              ? "border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Pilihan TerbitKata ({articles.filter((a) => a.isEditorChoice).length})
        </button>
        <button
          onClick={() => setFilterTab("featured")}
          className={`pb-3 px-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            filterTab === "featured"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Sorot Utama ({articles.filter((a) => a.isFeatured).length})
        </button>
        <button
          onClick={() => setFilterTab("published")}
          className={`pb-3 px-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            filterTab === "published"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Dipublikasikan ({articles.filter((a) => a.publishedAt).length})
        </button>
        <button
          onClick={() => setFilterTab("draft")}
          className={`pb-3 px-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
            filterTab === "draft"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Draft ({articles.filter((a) => !a.publishedAt).length})
        </button>
      </div>

      {/* Table Header / Search */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute inset-y-0 left-3 h-4 w-4 text-slate-400 my-auto" />
          <Input
            type="text"
            placeholder="Cari artikel, penulis, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Menampilkan {filteredArticles.length} dari {articles.length} artikel
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-900/10">
              <th className="py-3 px-5">Artikel</th>
              <th className="py-3 px-5">Kategori</th>
              <th className="py-3 px-5">Tanggal</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Dibaca</th>
              <th className="py-3 px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Tidak ada artikel yang cocok dengan filter atau pencarian Anda.
                </td>
              </tr>
            ) : (
              filteredArticles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1 max-w-md">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {article.isEditorChoice && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Pilihan TerbitKata
                          </span>
                        )}
                        {article.isFeatured && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                            Sorot Utama
                          </span>
                        )}
                        <span className="font-semibold text-slate-900 dark:text-slate-100 hover:text-primary transition line-clamp-1">
                          {article.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {article.author.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex gap-1 flex-wrap">
                      {article.categories.map((cat: any) => (
                        <span
                          key={cat.id}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-500">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {formatDate(article.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                        article.publishedAt
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {article.publishedAt ? "Dipublikasikan" : "Draft"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-600 dark:text-slate-400">
                    <div className="flex flex-col text-xs">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                        <span>{article.views ?? 0}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {article.weeklyViews ?? 0} minggu ini
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={togglingId === article.id}
                        onClick={() => handleTogglePilihan(article.id, !!article.isEditorChoice)}
                        className={`h-7 w-7 cursor-pointer transition ${
                          article.isEditorChoice
                            ? "text-amber-500 hover:text-amber-600 bg-amber-500/10"
                            : "text-slate-400 hover:text-amber-500"
                        }`}
                        title={
                          article.isEditorChoice
                            ? "Hapus dari Pilihan TerbitKata"
                            : "Jadikan Pilihan TerbitKata (Tampil di section banner)"
                        }
                      >
                        {togglingId === article.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      {article.publishedAt && (
                        <Link
                          href={`/${article.categories[0]?.slug || "berita"}/${article.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          title="Lihat Halaman Publik"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/articles/edit/${article.id}`}
                        className="p-1.5 text-slate-450 hover:text-primary transition"
                        title="Edit Artikel"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === article.id}
                        onClick={() => handleDelete(article.id)}
                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        title="Hapus Artikel"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Trash2, MessageSquare, Calendar, User, Mail, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CommentModeratorProps {
  initialComments: any[];
}

type TabType = "PENDING" | "APPROVED" | "REJECTED";

export default function CommentModerator({ initialComments }: CommentModeratorProps) {
  const [comments, setComments] = useState(initialComments);
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const router = useRouter();

  const filteredComments = comments.filter((comment) => comment.status === activeTab);

  const handleUpdateStatus = async (id: string, status: TabType) => {
    setActioningId(id);
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments(
          comments.map((c) => (c.id === id ? { ...c, status } : c))
        );
        alert(`Komentar berhasil di-${status.toLowerCase()}.`);
        router.refresh();
      } else {
        alert(data.error || "Gagal memperbarui status komentar.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return;

    setActioningId(id);
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setComments(comments.filter((c) => c.id !== id));
        alert("Komentar berhasil dihapus.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menghapus komentar.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setActioningId(null);
    }
  };

  const tabs: { label: string; value: TabType; count: number; color: string }[] = [
    {
      label: "Menunggu Persetujuan",
      value: "PENDING",
      count: comments.filter((c) => c.status === "PENDING").length,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    },
    {
      label: "Disetujui",
      value: "APPROVED",
      count: comments.filter((c) => c.status === "APPROVED").length,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    {
      label: "Ditolak / Spam",
      value: "REJECTED",
      count: comments.filter((c) => c.status === "REJECTED").length,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer -mb-px ${
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${tab.color}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Comment Cards */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-12">
            <CardContent className="flex flex-col items-center justify-center text-center gap-3">
              <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              <p className="text-sm text-slate-500 font-medium">Tidak ada komentar di bagian ini.</p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card
              key={comment.id}
              className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition overflow-hidden ${
                actioningId === comment.id ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* Meta Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-850 dark:text-slate-200">
                      <User className="h-3.5 w-3.5 text-slate-400" /> {comment.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> {comment.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    Pada artikel: 
                    <Link
                      href={`/admin/articles/edit/${comment.articleId}`}
                      className="text-primary hover:underline font-semibold flex items-center gap-0.5 truncate max-w-[180px] sm:max-w-xs"
                    >
                      {comment.article.title} <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  {comment.status === "PENDING" && (
                    <>
                      <Button
                        onClick={() => handleUpdateStatus(comment.id, "APPROVED")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs px-3.5 cursor-pointer flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Setujui
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateStatus(comment.id, "REJECTED")}
                        className="border-slate-300 dark:border-slate-750 text-slate-650 dark:text-slate-300 hover:bg-slate-50 h-8 text-xs px-3.5 cursor-pointer flex items-center gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Tolak / Spam
                      </Button>
                    </>
                  )}

                  {comment.status === "APPROVED" && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(comment.id, "REJECTED")}
                      className="border-slate-300 dark:border-slate-750 text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 h-8 text-xs px-3.5 cursor-pointer flex items-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Batalkan Persetujuan (Tolak)
                    </Button>
                  )}

                  {comment.status === "REJECTED" && (
                    <Button
                      onClick={() => handleUpdateStatus(comment.id, "APPROVED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs px-3.5 cursor-pointer flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" /> Setujui Kembali
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(comment.id)}
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                    title="Hapus Komentar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

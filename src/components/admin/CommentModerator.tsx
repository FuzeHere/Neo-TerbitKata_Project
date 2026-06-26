"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Trash2, MessageSquare, Calendar, User, Mail, ArrowUpRight, Loader2 } from "lucide-react";
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
  
  // Admin reply states
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyingSubmitting, setReplyingSubmitting] = useState(false);

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

  const handleReplyClick = (commentId: string) => {
    setReplyingCommentId(commentId);
    setReplyContent("");
  };

  const handleReplySubmit = async (e: React.FormEvent, parentComment: any) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setReplyingSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: parentComment.articleId,
          parentId: parentComment.id,
          content: replyContent,
          isFromAdmin: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Komentar balasan berhasil dipublikasikan!");
        
        // Add new reply to comments list state immediately
        const newReply = {
          ...data.comment,
          createdAt: new Date().toISOString(),
          article: { title: parentComment.article.title, slug: parentComment.article.slug },
          parent: { name: parentComment.name }
        };
        
        setComments((prev) => [newReply, ...prev]);
        setReplyingCommentId(null);
        setReplyContent("");
        
        // Refresh router
        router.refresh();
      } else {
        alert(data.error || "Gagal mengirim balasan.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setReplyingSubmitting(false);
    }
  };

  const tabs: { label: string; value: TabType; count: number; color: string }[] = [
    {
      label: "Menunggu Persetujuan",
      value: "PENDING",
      count: comments.filter((c) => c.status === "PENDING").length,
      color: "bg-amber-500/10 text-amber-600"
    },
    {
      label: "Disetujui",
      value: "APPROVED",
      count: comments.filter((c) => c.status === "APPROVED").length,
      color: "bg-emerald-500/10 text-emerald-600"
    },
    {
      label: "Ditolak / Spam",
      value: "REJECTED",
      count: comments.filter((c) => c.status === "REJECTED").length,
      color: "bg-rose-500/10 text-rose-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer -mb-px ${
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
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
          <Card className="bg-white border-slate-200 py-12">
            <CardContent className="flex flex-col items-center justify-center text-center gap-3">
              <MessageSquare className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500 font-medium">Tidak ada komentar di bagian ini.</p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card
              key={comment.id}
              className={`bg-white border-slate-200 transition overflow-hidden ${
                actioningId === comment.id ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* Meta Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-850">
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

                {/* Reply context label if replying to another comment */}
                {comment.parent && (
                  <div className="text-xs font-semibold text-slate-550 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 inline-block mb-1">
                    Membalas komentar: <span className="text-primary">{comment.parent.name}</span>
                  </div>
                )}

                {/* Comment Content */}
                <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 flex-wrap">
                  {/* Reply Button (Only for approved comments) */}
                  {comment.status === "APPROVED" && (
                    <Button
                      variant="outline"
                      onClick={() => handleReplyClick(comment.id)}
                      className="border-slate-200 text-primary hover:bg-slate-50 h-8 text-xs px-3.5 cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Balas
                    </Button>
                  )}

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
                        className="border-slate-300 text-slate-650 hover:bg-slate-50 h-8 text-xs px-3.5 cursor-pointer flex items-center gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Tolak / Spam
                      </Button>
                    </>
                  )}

                  {comment.status === "APPROVED" && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(comment.id, "REJECTED")}
                      className="border-slate-300 text-rose-600 hover:bg-rose-50/50 h-8 text-xs px-3.5 cursor-pointer flex items-center gap-1"
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
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Hapus Komentar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Inline Reply Form inside Card */}
                {replyingCommentId === comment.id && (
                  <form
                    onSubmit={(e) => handleReplySubmit(e, comment)}
                    className="mt-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3"
                  >
                    <Label
                      htmlFor={`admin-reply-${comment.id}`}
                      className="text-xs font-bold text-slate-700 block"
                    >
                      Tulis Balasan sebagai Admin / Penulis:
                    </Label>
                    <Textarea
                      id={`admin-reply-${comment.id}`}
                      required
                      placeholder="Ketik isi komentar balasan Anda..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[80px] text-xs bg-white border-slate-200 focus-visible:ring-primary"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={replyingSubmitting}
                        className="bg-primary text-white h-8 text-xs px-4 cursor-pointer"
                      >
                        {replyingSubmitting ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Mengirim...
                          </>
                        ) : (
                          "Kirim Balasan"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setReplyingCommentId(null)}
                        className="border-slate-200 hover:bg-slate-50 h-8 text-xs px-4 cursor-pointer"
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

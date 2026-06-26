"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, User, Clock, RefreshCw, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CommentSectionProps {
  articleId: string;
  initialComments: any[];
  authorName?: string;
}

export default function CommentSection({ articleId, initialComments, authorName }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);

  // Main Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reply Mode States
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyCaptchaAnswer, setReplyCaptchaAnswer] = useState("");
  const [replyCaptchaQuestion, setReplyCaptchaQuestion] = useState("");
  const [replyCaptchaToken, setReplyCaptchaToken] = useState("");
  const [replyLoadingCaptcha, setReplyLoadingCaptcha] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyStatusMessage, setReplyStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load CAPTCHA for Main Form
  const fetchCaptcha = async () => {
    setLoadingCaptcha(true);
    try {
      const res = await fetch("/api/comments/captcha");
      const data = await res.json();
      if (res.ok) {
        setCaptchaQuestion(data.question);
        setCaptchaToken(data.token);
      }
    } catch (err) {
      console.error("Gagal memuat CAPTCHA");
    } finally {
      setLoadingCaptcha(false);
    }
  };

  // Load CAPTCHA for Reply Form
  const fetchReplyCaptcha = async () => {
    setReplyLoadingCaptcha(true);
    try {
      const res = await fetch("/api/comments/captcha");
      const data = await res.json();
      if (res.ok) {
        setReplyCaptchaQuestion(data.question);
        setReplyCaptchaToken(data.token);
      }
    } catch (err) {
      console.error("Gagal memuat CAPTCHA");
    } finally {
      setReplyLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleReplyClick = (commentId: string) => {
    setActiveReplyId(commentId);
    setReplyName("");
    setReplyEmail("");
    setReplyContent("");
    setReplyCaptchaAnswer("");
    setReplyStatusMessage(null);
    fetchReplyCaptcha();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim() || !email.trim() || !content.trim() || !captchaAnswer.trim()) {
      setStatusMessage({ type: "error", text: "Semua kolom wajib diisi." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          name,
          email,
          content,
          captchaAnswer,
          captchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: data.message || "Komentar terkirim! Menunggu persetujuan editor.",
        });

        // Reset form
        setName("");
        setEmail("");
        setContent("");
        setCaptchaAnswer("");

        // Refresh CAPTCHA
        fetchCaptcha();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Gagal mengirim komentar." });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Terjadi kesalahan koneksi sistem." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    setReplyStatusMessage(null);

    if (!replyName.trim() || !replyEmail.trim() || !replyContent.trim() || !replyCaptchaAnswer.trim()) {
      setReplyStatusMessage({ type: "error", text: "Semua kolom wajib diisi." });
      return;
    }

    setReplySubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          name: replyName,
          email: replyEmail,
          content: replyContent,
          captchaAnswer: replyCaptchaAnswer,
          captchaToken: replyCaptchaToken,
          parentId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setReplyStatusMessage({
          type: "success",
          text: data.message || "Balasan terkirim! Menunggu persetujuan editor.",
        });

        // Reset reply inputs
        setReplyContent("");
        setReplyCaptchaAnswer("");

        // Auto close after success
        setTimeout(() => {
          setActiveReplyId(null);
          setReplyStatusMessage(null);
        }, 2000);
      } else {
        setReplyStatusMessage({ type: "error", text: data.error || "Gagal mengirim balasan." });
      }
    } catch (err) {
      setReplyStatusMessage({ type: "error", text: "Terjadi kesalahan koneksi sistem." });
    } finally {
      setReplySubmitting(false);
    }
  };

  const isAuthorRole = (commentName: string) => {
    return authorName && commentName.toLowerCase() === authorName.toLowerCase();
  };

  // Group comments and replies
  const rootComments = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => c.parentId);

  const getRepliesForComment = (commentId: string) => {
    return replies
      .filter((r) => r.parentId === commentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  return (
    <div className="space-y-8 pt-8 border-t bg-white">
      {/* Title */}
      <div className="flex items-center gap-2 border-b bg-white pb-3">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg text-slate-900">
          Komentar Pembaca ({comments.length})
        </h3>
      </div>

      {/* Main Comment Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl border bg-white space-y-4">
        <h4 className="font-bold text-sm text-slate-900">Kirim Komentar Anda</h4>
        <p className="text-xs text-slate-500">Alamat email Anda tidak akan dipublikasikan secara umum. Komentar akan dimoderasi terlebih dahulu.</p>

        {statusMessage && (
          <div
            className={`p-3 text-xs rounded-lg font-medium border ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-semibold">Nama Lengkap</Label>
            <Input
              id="name"
              required
              placeholder="Masukkan nama Anda..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-slate-200 h-9 focus-visible:ring-primary text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold">Email Pembaca</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="nama@email.com..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-slate-200 h-9 focus-visible:ring-primary text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="commentContent" className="text-xs font-semibold">Isi Komentar</Label>
          <Textarea
            id="commentContent"
            required
            placeholder="Tulis opini atau komentar konstruktif Anda mengenai artikel ini..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-transparent border-slate-200 min-h-[100px] text-xs focus-visible:ring-primary"
          />
        </div>

        {/* Captcha Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-white rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">
              {captchaQuestion || "Menyiapkan CAPTCHA..."}
            </span>
            <button
              type="button"
              onClick={fetchCaptcha}
              disabled={loadingCaptcha}
              className="p-1 text-slate-400 hover:text-primary transition rounded cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingCaptcha ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="captcha" className="text-xs font-semibold shrink-0">Jawaban:</Label>
            <Input
              id="captcha"
              required
              type="number"
              placeholder="Hasil angka..."
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="bg-transparent border-slate-200 h-8 w-24 focus-visible:ring-primary text-xs"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="bg-primary text-white h-9 text-xs px-6 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              Mengirim Komentar...
            </>
          ) : (
            "Kirim Komentar"
          )}
        </Button>
      </form>

      {/* Approved Comments List */}
      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Belum ada komentar disetujui. Jadilah yang pertama berkomentar!</p>
        ) : (
          rootComments.map((comment) => (
            <div
              key={comment.id}
              className="p-5 rounded-xl border border-slate-100 bg-slate-50/20 space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{comment.name}</span>
                  {isAuthorRole(comment.name) && (
                    <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Penulis
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-655 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Reply Trigger */}
              <div className="flex justify-start pt-1">
                <button
                  onClick={() => handleReplyClick(comment.id)}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="h-3 w-3" /> Balas
                </button>
              </div>

              {/* Reply Form */}
              {activeReplyId === comment.id && (
                <form
                  onSubmit={(e) => handleReplySubmit(e, comment.id)}
                  className="mt-4 p-4 rounded-xl border border-slate-100 bg-white space-y-4"
                >
                  <h5 className="font-bold text-xs text-slate-800">Balas Komentar {comment.name}</h5>

                  {replyStatusMessage && (
                    <div
                      className={`p-2.5 text-xs rounded-lg font-medium border ${
                        replyStatusMessage.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      }`}
                    >
                      {replyStatusMessage.text}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="reply-name" className="text-[10px] font-semibold text-slate-600">Nama Lengkap</Label>
                      <Input
                        id="reply-name"
                        required
                        placeholder="Nama Anda..."
                        value={replyName}
                        onChange={(e) => setReplyName(e.target.value)}
                        className="bg-transparent border-slate-200 h-8 text-xs focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reply-email" className="text-[10px] font-semibold text-slate-600">Email Anda</Label>
                      <Input
                        id="reply-email"
                        type="email"
                        required
                        placeholder="nama@email.com..."
                        value={replyEmail}
                        onChange={(e) => setReplyEmail(e.target.value)}
                        className="bg-transparent border-slate-200 h-8 text-xs focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reply-content" className="text-[10px] font-semibold text-slate-600">Isi Balasan</Label>
                    <Textarea
                      id="reply-content"
                      required
                      placeholder="Tulis balasan konstruktif Anda..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="bg-transparent border-slate-200 min-h-[70px] text-xs focus-visible:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-slate-700">
                        {replyCaptchaQuestion || "Menyiapkan CAPTCHA..."}
                      </span>
                      <button
                        type="button"
                        onClick={fetchReplyCaptcha}
                        disabled={replyLoadingCaptcha}
                        className="p-0.5 text-slate-400 hover:text-primary transition rounded cursor-pointer"
                      >
                        <RefreshCw className={`h-3 w-3 ${replyLoadingCaptcha ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <Label htmlFor="reply-captcha" className="text-xs font-semibold shrink-0">Jawaban:</Label>
                      <Input
                        id="reply-captcha"
                        required
                        type="number"
                        placeholder="Hasil..."
                        value={replyCaptchaAnswer}
                        onChange={(e) => setReplyCaptchaAnswer(e.target.value)}
                        className="bg-transparent border-slate-200 h-7 w-20 focus-visible:ring-primary text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={replySubmitting}
                      className="bg-primary text-white h-8 text-xs px-4 cursor-pointer"
                    >
                      {replySubmitting ? (
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
                      onClick={() => setActiveReplyId(null)}
                      className="border-slate-200 hover:bg-slate-50 h-8 text-xs px-4 cursor-pointer"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              )}

              {/* Replies Thread */}
              {getRepliesForComment(comment.id).length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-slate-100 space-y-3">
                  {getRepliesForComment(comment.id).map((reply) => (
                    <div
                      key={reply.id}
                      className="p-4 rounded-xl border border-slate-100 bg-white space-y-2"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{reply.name}</span>
                          {isAuthorRole(reply.name) && (
                            <span className="text-[8px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              Penulis
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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
}

export default function CommentSection({ articleId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // Captcha State
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load CAPTCHA
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

  useEffect(() => {
    fetchCaptcha();
  }, []);

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

  return (
    <div className="space-y-8 pt-8 border-t border-slate-200 dark:border-slate-800">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Komentar Pembaca ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Kirim Komentar Anda</h4>
        <p className="text-xs text-slate-500">Alamat email Anda tidak akan dipublikasikan secara umum. Komentar akan dimoderasi terlebih dahulu.</p>

        {statusMessage && (
          <div
            className={`p-3 text-xs rounded-lg font-medium border ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
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
              className="bg-transparent border-slate-200 dark:border-slate-850 h-9 focus-visible:ring-primary text-xs"
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
              className="bg-transparent border-slate-200 dark:border-slate-850 h-9 focus-visible:ring-primary text-xs"
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
            className="bg-transparent border-slate-200 dark:border-slate-850 min-h-[100px] text-xs focus-visible:ring-primary"
          />
        </div>

        {/* Captcha Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-850">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
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
              className="bg-transparent border-slate-200 dark:border-slate-800 h-8 w-24 focus-visible:ring-primary text-xs"
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
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Belum ada komentar disetujui. Jadilah yang pertama berkomentar!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 space-y-2"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{comment.name}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

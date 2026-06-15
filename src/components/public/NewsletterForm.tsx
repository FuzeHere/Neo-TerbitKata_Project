"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Berhasil berlangganan newsletter!");
        setEmail("");
      } else {
        alert(data.error || "Gagal berlangganan.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="flex gap-2">
      <Input
        type="email"
        required
        placeholder="Email Anda..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs rounded-lg flex-1"
      />
      <Button
        type="submit"
        disabled={submitting}
        className="bg-primary hover:bg-primary/95 text-white h-9 w-9 p-0 flex items-center justify-center rounded-lg cursor-pointer"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
      </Button>
    </form>
  );
}

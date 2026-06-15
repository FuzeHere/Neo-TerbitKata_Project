import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isSpam } from "@/lib/utils";
import { verifyCaptcha } from "@/lib/captcha";
import { config } from "@/lib/config";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED, or all (for admin)

    const session = await getServerSession(authOptions);

    const where: any = {};

    if (articleId) {
      where.articleId = articleId;
    }

    if (session) {
      // Admin request
      if (status && status !== "all") {
        where.status = status;
      }
    } else {
      // Public request: only approved comments
      where.status = "APPROVED";
    }

    const comments = await db.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        article: {
          select: { title: true, slug: true }
        }
      }
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil komentar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { articleId, name, email, content, captchaAnswer, captchaToken } = await req.json();

    if (!articleId || !name || !email || !content || !captchaAnswer || !captchaToken) {
      return NextResponse.json({ error: "Semua kolom input wajib diisi" }, { status: 400 });
    }

    // 1. Verify Math CAPTCHA
    const isCaptchaValid = verifyCaptcha(captchaAnswer, captchaToken, config.nextAuthSecret);
    if (!isCaptchaValid) {
      return NextResponse.json({ error: "Jawaban CAPTCHA salah" }, { status: 400 });
    }

    // 2. Dynamic spam filtering (check links or blacklist keywords)
    const isSpamComment = isSpam(content, config.spamKeywords);

    // Create comment - if spam, mark as REJECTED directly, otherwise PENDING
    const comment = await db.comment.create({
      data: {
        articleId,
        name,
        email,
        content,
        status: isSpamComment ? "REJECTED" : "PENDING"
      }
    });

    return NextResponse.json({
      comment,
      message: isSpamComment
        ? "Komentar terdeteksi spam dan otomatis ditolak."
        : "Komentar berhasil dikirim dan menunggu moderasi admin."
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengirim komentar" }, { status: 500 });
  }
}

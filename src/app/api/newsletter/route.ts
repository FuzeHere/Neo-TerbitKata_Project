import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email harus diisi" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar di newsletter kami" },
        { status: 400 }
      );
    }

    const subscriber = await db.newsletterSubscriber.create({
      data: { email }
    });

    return NextResponse.json({
      subscriber,
      message: "Terima kasih! Anda berhasil berlangganan newsletter TerbitKata."
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses newsletter" }, { status: 500 });
  }
}

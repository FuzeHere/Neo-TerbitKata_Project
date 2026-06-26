import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, email, password, avatar } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Nama dan email wajib diisi" }, { status: 400 });
    }

    // Check if email is already taken by another user
    const existing = await db.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar pada user lain" }, { status: 400 });
    }

    const data: any = {
      name,
      email,
      avatar
    };

    if (password && password.trim() !== "") {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Gagal memperbarui profil:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}

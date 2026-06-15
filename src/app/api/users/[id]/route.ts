import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Nama dan email wajib diisi" }, { status: 400 });
    }

    const existing = await db.user.findFirst({
      where: {
        email,
        id: { not: id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar pada user lain" }, { status: 400 });
    }

    const data: any = { name, email, role };

    if (password && password.trim() !== "") {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui data user" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent deleting oneself
    if (id === (session.user as any).id) {
      return NextResponse.json({ error: "Anda tidak dapat menghapus akun Anda sendiri" }, { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}

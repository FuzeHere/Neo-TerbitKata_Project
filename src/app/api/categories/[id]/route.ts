import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Nama kategori harus diisi" }, { status: 400 });
    }

    const slug = slugify(name);
    
    // Check if slug is taken by another category
    const existing = await db.category.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Kategori dengan nama serupa sudah ada" }, { status: 400 });
    }

    const category = await db.category.update({
      where: { id },
      data: { name, slug, description }
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui kategori" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if category is used in any article
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    if (category && category._count.articles > 0) {
      return NextResponse.json(
        { error: "Kategori tidak bisa dihapus karena masih digunakan di artikel" },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}

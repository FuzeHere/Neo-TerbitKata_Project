import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter").max(50, "Nama kategori maksimal 50 karakter"),
  description: z.string().trim().max(255, "Deskripsi maksimal 255 karakter").optional().nullable(),
});

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
      return NextResponse.json(
        { error: "Forbidden: Hanya Super Admin yang dapat mengubah kategori" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data input tidak valid" },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;
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
      data: { name, slug, description: description || null }
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
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Super Admin yang dapat menghapus kategori" },
        { status: 403 }
      );
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

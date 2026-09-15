import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter").max(50, "Nama kategori maksimal 50 karakter"),
  description: z.string().trim().max(255, "Deskripsi maksimal 255 karakter").optional().nullable(),
});

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil kategori" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Super Admin yang dapat membuat kategori" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data input tidak valid" },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;
    const slug = slugify(name);
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Kategori dengan nama serupa sudah ada" }, { status: 400 });
    }

    const category = await db.category.create({
      data: { name, slug, description: description || null }
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 });
  }
}

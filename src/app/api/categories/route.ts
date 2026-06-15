import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Nama kategori harus diisi" }, { status: 400 });
    }

    const slug = slugify(name);
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Kategori dengan nama serupa sudah ada" }, { status: 400 });
    }

    const category = await db.category.create({
      data: { name, slug, description }
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 });
  }
}

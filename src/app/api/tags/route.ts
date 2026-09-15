import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const createTagSchema = z.object({
  name: z.string().trim().min(2, "Nama tag minimal 2 karakter").max(50, "Nama tag maksimal 50 karakter"),
});

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil tag" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Nama tag tidak valid" },
        { status: 400 }
      );
    }

    const { name } = parsed.data;
    const slug = slugify(name);
    const existing = await db.tag.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Tag dengan nama serupa sudah ada" }, { status: 400 });
    }

    const tag = await db.tag.create({
      data: { name, slug }
    });

    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat tag" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const updateTagSchema = z.object({
  name: z.string().trim().min(2, "Nama tag minimal 2 karakter").max(50, "Nama tag maksimal 50 karakter"),
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Nama tag tidak valid" },
        { status: 400 }
      );
    }

    const { name } = parsed.data;
    const slug = slugify(name);
    
    // Check if slug is taken by another tag
    const existing = await db.tag.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Tag dengan nama serupa sudah ada" }, { status: 400 });
    }

    const tag = await db.tag.update({
      where: { id },
      data: { name, slug }
    });

    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui tag" }, { status: 500 });
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
        { error: "Forbidden: Hanya Super Admin yang dapat menghapus tag" },
        { status: 403 }
      );
    }

    await db.tag.delete({ where: { id } });
    return NextResponse.json({ message: "Tag berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus tag" }, { status: 500 });
  }
}

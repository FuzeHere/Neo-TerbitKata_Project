import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const { status } = await req.json();
    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const comment = await db.comment.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memoderasi komentar" }, { status: 500 });
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

    await db.comment.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus komentar" }, { status: 500 });
  }
}

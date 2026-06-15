import React from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserManager from "@/components/admin/UserManager";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true
    }
  });

  const serializedUsers = users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
        <p className="text-muted-foreground">Kelola akun dan hak akses Super Admin dan Writer TerbitKata.</p>
      </div>

      <UserManager initialUsers={serializedUsers} currentUserId={(session.user as any).id} />
    </div>
  );
}

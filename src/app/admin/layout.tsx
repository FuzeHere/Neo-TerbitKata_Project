import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  FolderKanban, 
  MessageSquare, 
  Users, 
  Globe, 
  LogOut,
  User as UserIcon
} from "lucide-react";
import SessionProvider from "@/components/providers/SessionProvider";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Artikel", href: "/admin/articles", icon: FileText },
    { name: "Kategori & Tag", href: "/admin/categories", icon: FolderKanban },
    { name: "Komentar", href: "/admin/comments", icon: MessageSquare },
  ];

  // Show user management only to Super Admins
  if (role === "SUPER_ADMIN") {
    menuItems.push({ name: "Manajemen User", href: "/admin/users", icon: Users });
  }

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
            <Link href="/admin" className="flex items-center gap-2">
              <img src="/logo.png" alt="TerbitKata Logo" className="h-8 w-auto object-contain" />
              <span className="text-xs text-muted-foreground font-semibold">CMS</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section / Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 mb-4">
              {session.user.image || (session.user as any).avatar ? (
                <img
                  src={session.user.image || (session.user as any).avatar}
                  alt={session.user.name || "User"}
                  className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-slate-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{session.user.name}</p>
                <p className="text-xs text-muted-foreground capitalize truncate">{role.replace("_", " ").toLowerCase()}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Link
                href="/admin/profile"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition"
              >
                <UserIcon className="h-3.5 w-3.5" />
                Pengaturan Profil
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition"
              >
                <Globe className="h-3.5 w-3.5" />
                Kunjungi Portal
              </Link>
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header (Mobile menu trigger + Title) */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6">
            <div className="flex items-center md:hidden gap-3">
              <Link href="/admin" className="flex items-center">
                <img src="/logo.png" alt="TerbitKata Logo" className="h-8 w-auto object-contain" />
              </Link>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Selamat datang kembali,</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{session.user.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                {role.replace("_", " ").toLowerCase()} Mode
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

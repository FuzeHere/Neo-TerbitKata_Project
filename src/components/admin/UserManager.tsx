"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Shield, Edit2, Trash2, X, Check, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface UserManagerProps {
  initialUsers: any[];
  currentUserId: string;
}

export default function UserManager({ initialUsers, currentUserId }: UserManagerProps) {
  const router = useRouter();

  const [users, setUsers] = useState(initialUsers);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("WRITER");

  // Edit Mode States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("WRITER");

  const [loading, setLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Seluruh kolom input wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers([data, ...users]);
        setName("");
        setEmail("");
        setPassword("");
        setRole("WRITER");
        alert("User berhasil ditambahkan.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menambah user.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPassword("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      alert("Nama dan email wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          password: editPassword,
          role: editRole,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === editingUserId ? { ...u, name: editName, email: editEmail, role: editRole } : u))
        );
        setEditingUserId(null);
        alert("Data user berhasil diperbarui.");
        router.refresh();
      } else {
        alert(data.error || "Gagal memperbarui data user.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUserId) {
      alert("Anda tidak dapat menghapus akun Anda sendiri.");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus user ini secara permanen? Seluruh artikel miliknya akan terhapus.")) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
        alert("User berhasil dihapus.");
        router.refresh();
      } else {
        alert(data.error || "Gagal menghapus user.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* Left Column: Form Card */}
      <div className="md:col-span-1 space-y-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              {editingUserId ? "Edit User Account" : "Tambah Writer Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingUserId ? (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editName" className="text-xs">Nama Lengkap</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-transparent border-slate-200 dark:border-slate-800 h-9 focus-visible:ring-primary text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editEmail" className="text-xs">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="bg-transparent border-slate-200 dark:border-slate-800 h-9 focus-visible:ring-primary text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editRole" className="text-xs">Hak Akses / Role</Label>
                  <Select
                    id="editRole"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="bg-transparent text-xs"
                  >
                    <option value="WRITER">Writer (Penulis)</option>
                    <option value="SUPER_ADMIN">Super Admin (Pengelola)</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editPassword" className="text-xs">Kata Sandi Baru (Kosongkan jika tidak diubah)</Label>
                  <Input
                    id="editPassword"
                    type="password"
                    placeholder="••••••••"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="bg-transparent border-slate-200 dark:border-slate-800 h-9 focus-visible:ring-primary text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingUserId(null)}
                    className="flex-1 h-9 text-xs cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white h-9 text-xs cursor-pointer"
                  >
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Nama Lengkap</Label>
                  <Input
                    id="name"
                    placeholder="Nama lengkap penulis..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-slate-200 dark:border-slate-800 h-9 focus-visible:ring-primary text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@terbitkata.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-slate-200 dark:border-slate-800 h-9 focus-visible:ring-primary text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs">Hak Akses / Role</Label>
                  <Select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-transparent text-xs"
                  >
                    <option value="WRITER">Writer (Penulis)</option>
                    <option value="SUPER_ADMIN">Super Admin (Pengelola)</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">Kata Sandi Awal</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-slate-200 dark:border-slate-800 h-9 focus-visible:ring-primary text-xs"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white h-9 text-xs cursor-pointer"
                >
                  Tambah Writer Baru
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: User List Card */}
      <div className="md:col-span-2">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Daftar Akun Pengguna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada akun pengguna.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border border-slate-100 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-900/10 hover:border-slate-200 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{user.name}</span>
                        {user.id === currentUserId && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-550 border border-slate-250">
                            Saya
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                            user.role === "SUPER_ADMIN"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {user.role === "SUPER_ADMIN" ? "Admin" : "Writer"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {user.email}
                        </span>
                        <span>• Terdaftar: {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(user)}
                      className="h-8 w-8 text-slate-500 hover:text-primary cursor-pointer"
                      title="Edit User"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={user.id === currentUserId}
                      onClick={() => handleDeleteUser(user.id)}
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 cursor-pointer"
                      title="Hapus User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

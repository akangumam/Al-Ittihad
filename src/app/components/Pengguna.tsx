import { useState, useEffect } from "react";
import { UserPlus, Trash2, ShieldCheck, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/types";

interface UserRow {
  id: string;
  email: string;
  nama: string;
  role: Role;
  created_at: string;
}

const ROLE_OPTIONS: Role[] = ["Admin", "Bendahara", "TU"];

const ROLE_BADGE: Record<Role, { bg: string; text: string }> = {
  Admin:     { bg: "#EDF7EC", text: "#166534" },
  Bendahara: { bg: "#FEF3C7", text: "#92400E" },
  TU:        { bg: "#EFF6FF", text: "#1E40AF" },
};

function RoleBadge({ role }: { role: Role }) {
  const s = ROLE_BADGE[role];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      {role}
    </span>
  );
}

export function Pengguna() {
  const [users, setUsers]             = useState<UserRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [sheetOpen, setSheetOpen]     = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);
  const [saving, setSaving]           = useState(false);

  const [form, setForm] = useState({ email: "", nama: "", role: "TU" as Role, password: "" });
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Load users ──────────────────────────────────────────────────────────────
  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) { toast.error("Gagal memuat data pengguna."); }
    else setUsers(data as UserRow[]);
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  // ── Tambah user ─────────────────────────────────────────────────────────────
  async function handleAdd() {
    setFormError("");
    if (!form.email.trim() || !form.nama.trim()) {
      setFormError("Email dan Nama wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError("Format email tidak valid.");
      return;
    }
    if (form.password.length < 8) {
      setFormError("Password minimal 8 karakter.");
      return;
    }
    setSaving(true);

    // 1) Buat user di Supabase Auth via Edge Function (butuh service_role)
    const { data: { session } } = await supabase.auth.getSession();
    const fnResp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clever-responder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      }
    );
    if (!fnResp.ok) {
      const body = await fnResp.json().catch(() => ({}));
      setSaving(false);
      if (body?.error?.includes("already")) setFormError("Email ini sudah terdaftar.");
      else setFormError("Gagal membuat akun: " + (body?.error ?? fnResp.statusText));
      return;
    }

    // 2) Daftarkan ke whitelist user_roles
    const { error } = await supabase.from("user_roles").insert({
      email: form.email.trim().toLowerCase(),
      nama:  form.nama.trim(),
      role:  form.role,
    });
    setSaving(false);
    if (error) {
      if (error.code === "23505") setFormError("Email ini sudah terdaftar di daftar akses.");
      else toast.error("Gagal mendaftarkan akses: " + error.message);
      return;
    }
    toast.success(`${form.nama} berhasil ditambahkan sebagai ${form.role}.`);
    setForm({ email: "", nama: "", role: "TU", password: "" });
    setShowPass(false);
    setSheetOpen(false);
    loadUsers();
  }

  // ── Hapus user ──────────────────────────────────────────────────────────────
  async function handleDelete(user: UserRow) {
    const { error } = await supabase.from("user_roles").delete().eq("id", user.id);
    if (error) { toast.error("Gagal menghapus pengguna."); return; }
    toast.success(`Akses ${user.nama} telah dicabut.`);
    setPendingDelete(null);
    loadUsers();
  }

  // ── Ubah role ────────────────────────────────────────────────────────────────
  async function handleRoleChange(user: UserRow, newRole: Role) {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("id", user.id);
    if (error) { toast.error("Gagal mengubah role."); return; }
    toast.success(`Role ${user.nama} diubah ke ${newRole}.`);
    loadUsers();
  }

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1C2517]">Pengguna & Akses</h1>
          <p className="text-sm text-[#6B7769] mt-0.5">
            Hanya email yang terdaftar di sini yang bisa masuk ke sistem.
          </p>
        </div>
        <button
          onClick={() => { setForm({ email: "", nama: "", role: "TU", password: "" }); setShowPass(false); setFormError(""); setSheetOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ background: "#3E8A2F" }}
        >
          <UserPlus size={15} />
          Tambah Pengguna
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E2E8DE" }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#3E8A2F", borderTopColor: "transparent" }} />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck size={32} className="mx-auto mb-3 text-[#9CA3A0]" />
            <p className="text-sm text-[#6B7769]">Belum ada pengguna terdaftar.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8DE" }}>
                {["Nama", "Email", "Role", "Terdaftar", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-[#9CA3A0] uppercase tracking-wide px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className="hover:bg-[#FAFBF9] transition-colors"
                  style={{ borderBottom: i < users.length - 1 ? "1px solid #F0F7EE" : "none" }}
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1C2517]">{u.nama}</td>
                  <td className="px-5 py-3.5 text-sm text-[#6B7769]">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value as Role)}
                      className="text-xs font-semibold rounded-full px-2 py-1 outline-none cursor-pointer border-0 appearance-none"
                      style={{
                        background: ROLE_BADGE[u.role].bg,
                        color: ROLE_BADGE[u.role].text,
                      }}
                    >
                      {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#9CA3A0] tabular-nums">{fmtDate(u.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setPendingDelete(u)}
                      className="p-1.5 rounded-lg hover:bg-[#FEF2F2] transition-colors"
                      title="Hapus akses"
                    >
                      <Trash2 size={14} className="text-[#DC2626]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Sheet Tambah Pengguna ─────────────────────────────────────────────── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div
            className="bg-white h-full flex flex-col shadow-2xl"
            style={{ width: 480, borderLeft: "1px solid #E2E8DE" }}
          >
            {/* Header sheet */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #E2E8DE" }}>
              <div>
                <p className="font-semibold text-[#1C2517]">Tambah Pengguna</p>
                <p className="text-xs text-[#6B7769] mt-0.5">Daftarkan email Google guru/staf</p>
              </div>
              <button onClick={() => setSheetOpen(false)} className="p-1.5 rounded-lg hover:bg-[#F5F9F4]">
                <X size={16} className="text-[#6B7769]" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-xs font-semibold text-[#374040] mb-1.5">
                  Nama Lengkap <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none"
                  style={{ border: "1.5px solid #E2E8DE" }}
                  placeholder="Contoh: Ust. Ahmad Zaki S.Pd"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#374040] mb-1.5">
                  Alamat Gmail <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none"
                  style={{ border: "1.5px solid #E2E8DE" }}
                  placeholder="contoh@gmail.com"
                />
                <p className="text-[10px] text-[#9CA3A0] mt-1">
                  Bisa Gmail atau email lain yang valid.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#374040] mb-1.5">
                  Password Sementara <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none pr-10"
                    style={{ border: "1.5px solid #E2E8DE" }}
                    placeholder="Min. 8 karakter"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] hover:text-[#6B7769]">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-[#9CA3A0] mt-1">
                  Pengguna dapat menggantinya sendiri setelah login pertama.
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-[#374040] mb-1.5">
                  Role / Hak Akses <span className="text-[#DC2626]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      className="py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={
                        form.role === r
                          ? { background: "#3E8A2F", color: "#fff", border: "1.5px solid #3E8A2F" }
                          : { background: "#fff", color: "#374040", border: "1.5px solid #E2E8DE" }
                      }
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-[#9CA3A0] space-y-0.5">
                  <p><span className="font-semibold text-[#374040]">Admin</span> — akses penuh ke semua modul</p>
                  <p><span className="font-semibold text-[#374040]">Bendahara</span> — keuangan + data siswa (read)</p>
                  <p><span className="font-semibold text-[#374040]">TU</span> — akademik + absensi</p>
                </div>
              </div>

              {/* Error */}
              {formError && (
                <p className="text-xs font-semibold text-[#DC2626] px-3 py-2 rounded-lg" style={{ background: "#FEF2F2" }}>
                  {formError}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex gap-3 shrink-0" style={{ borderTop: "1px solid #E2E8DE" }}>
              <button
                onClick={() => setSheetOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4] transition-colors"
                style={{ border: "1.5px solid #E2E8DE" }}
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ background: "#3E8A2F" }}
              >
                {saving ? "Menyimpan..." : "Tambah Pengguna"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Konfirmasi Hapus ─────────────────────────────────────────────────── */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4" style={{ border: "1px solid #E2E8DE" }}>
            <div>
              <p className="font-semibold text-[#1C2517]">Cabut Akses Pengguna?</p>
              <p className="text-sm text-[#6B7769] mt-1">
                <span className="font-medium text-[#1C2517]">{pendingDelete.nama}</span> ({pendingDelete.email}) tidak akan bisa login lagi setelah ini.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-[#374040] hover:bg-[#F5F9F4]"
                style={{ border: "1.5px solid #E2E8DE" }}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(pendingDelete)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "#DC2626" }}
              >
                Ya, Cabut Akses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

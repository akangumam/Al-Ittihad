import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, LogOut, KeyRound, Eye, EyeOff } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { tahunAjaranOptions } from "@/data/settings";

export function TopBar() {
  const { tahunAjaran, setTahunAjaran } = useAppContext();
  const { user, signOut, updatePassword } = useAuth();
  const [yearOpen, setYearOpen]       = useState(false);
  const [userOpen, setUserOpen]       = useState(false);
  const [passModal, setPassModal]     = useState(false);
  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [passError, setPassError]     = useState("");
  const [passInfo, setPassInfo]       = useState("");
  const [passBusy, setPassBusy]       = useState(false);
  const dropdownRef   = useRef<HTMLDivElement>(null);
  const userMenuRef   = useRef<HTMLDivElement>(null);

  function openPassModal() {
    setUserOpen(false);
    setNewPass(""); setConfirmPass(""); setShowPass(false);
    setPassError(""); setPassInfo(""); setPassBusy(false);
    setPassModal(true);
  }

  async function handleChangePass(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    if (newPass.length < 8) { setPassError("Password minimal 8 karakter."); return; }
    if (newPass !== confirmPass) { setPassError("Konfirmasi tidak cocok."); return; }
    setPassBusy(true);
    const err = await updatePassword(newPass);
    setPassBusy(false);
    if (err) { setPassError("Gagal menyimpan. Silakan coba lagi."); return; }
    setPassInfo("Password berhasil diubah!");
    setTimeout(() => setPassModal(false), 1800);
  }

  const initials = (user?.nama ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setYearOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayYear = `TA ${tahunAjaran}`;

  return (
    <>
    <header
      className="h-14 bg-white flex items-center px-6 gap-4 shrink-0 z-30"
      style={{ borderBottom: "1px solid #E2E8DE" }}
    >
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-[#F0F7EE] transition-colors"
          style={{ background: "#F5F9F4", border: "1px solid #E2E8DE" }}
        >
          <Search size={14} className="text-[#9CA3A0] shrink-0" />
          <span className="text-sm text-[#9CA3A0] flex-1 select-none">
            Cari siswa, transaksi...
          </span>
          <div className="flex items-center gap-0.5">
            <kbd className="text-[10px] text-[#9CA3A0] bg-white border border-[#E2E8DE] rounded px-1.5 py-0.5 font-mono leading-none">
              ⌘
            </kbd>
            <kbd className="text-[10px] text-[#9CA3A0] bg-white border border-[#E2E8DE] rounded px-1.5 py-0.5 font-mono leading-none">
              K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Academic year selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setYearOpen(!yearOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-[#EDF7EC]"
            style={{ border: "1.5px solid #3E8A2F", color: "#3E8A2F" }}
          >
            {displayYear}
            <ChevronDown
              size={13}
              className="transition-transform"
              style={{ transform: yearOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {yearOpen && (
            <div
              className="absolute right-0 mt-1.5 bg-white rounded-xl shadow-xl py-1 z-50 min-w-[164px]"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {tahunAjaranOptions.map((ta) => (
                <button
                  key={ta}
                  onClick={() => {
                    setTahunAjaran(ta);
                    setYearOpen(false);
                  }}
                  className={[
                    "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#EDF7EC]",
                    ta === tahunAjaran ? "text-[#3E8A2F] font-semibold" : "text-[#374040]",
                  ].join(" ")}
                >
                  TA {ta}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-[#F5F9F4] transition-colors">
          <Bell size={18} className="text-[#6B7769]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Avatar + user menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg hover:bg-[#F5F9F4] transition-colors"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.nama} className="w-7 h-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#3E8A2F] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="hidden lg:block text-left max-w-[120px]">
              <p className="text-xs font-semibold text-[#1C2517] leading-none mb-0.5 truncate">
                {user?.nama ?? "—"}
              </p>
              <p className="text-[10px] text-[#6B7769] leading-none">{user?.role ?? "—"}</p>
            </div>
            <ChevronDown
              size={13}
              className="text-[#9CA3A0] hidden lg:block transition-transform"
              style={{ transform: userOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {userOpen && (
            <div
              className="absolute right-0 mt-1.5 bg-white rounded-xl shadow-xl py-1 z-50 min-w-[200px]"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {/* Info user */}
              <div className="px-4 py-2.5" style={{ borderBottom: "1px solid #E2E8DE" }}>
                <p className="text-xs font-semibold text-[#1C2517] truncate">{user?.nama}</p>
                <p className="text-[10px] text-[#9CA3A0] truncate mt-0.5">{user?.email}</p>
              </div>
              {/* Ganti Password */}
              <button
                onClick={openPassModal}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374040] hover:bg-[#F5F9F4] transition-colors"
              >
                <KeyRound size={14} className="text-[#6B7769]" />
                Ganti Password
              </button>
              {/* Keluar */}
              <button
                onClick={() => { setUserOpen(false); signOut(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                style={{ borderTop: "1px solid #F0F7EE" }}
              >
                <LogOut size={14} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* ── Modal Ganti Password ────────────────────────────────────────── */}
    {passModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4" style={{ border: "1px solid #E2E8DE" }}>
          <div>
            <p className="font-semibold text-[#1C2517]">Ganti Password</p>
            <p className="text-xs text-[#6B7769] mt-0.5">Password baru minimal 8 karakter.</p>
          </div>

          {passInfo ? (
            <p className="text-sm font-semibold text-[#3E8A2F] text-center py-2">{passInfo}</p>
          ) : (
            <form onSubmit={handleChangePass} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#374040]">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} value={newPass}
                    onChange={e => setNewPass(e.target.value)} required autoFocus
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none pr-10"
                    style={{ border: "1.5px solid #E2E8DE" }}
                    placeholder="Min. 8 karakter"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0]">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#374040]">Konfirmasi</label>
                <input
                  type="password" value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: "1.5px solid #E2E8DE" }}
                  placeholder="Ulangi password baru"
                />
              </div>
              {passError && <p className="text-xs text-[#DC2626] font-medium">{passError}</p>}
              <div className="flex gap-2.5 pt-1">
                <button type="button" onClick={() => setPassModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-[#374040]"
                  style={{ border: "1.5px solid #E2E8DE" }}>
                  Batal
                </button>
                <button type="submit" disabled={passBusy}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#3E8A2F" }}>
                  {passBusy ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}
  </>
  );
}

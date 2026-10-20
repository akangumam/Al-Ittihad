import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, Users, QrCode, Sparkles, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseReady } from "@/lib/supabase";
import logoEmblem from "../../imports/aliet_logo.png";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.252 17.64 11.945 17.64 9.205Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

type Mode = "login" | "forgot";

export function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]           = useState<Mode>("login");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [info, setInfo]           = useState("");
  const [busy, setBusy]           = useState(false);

  useEffect(() => {
    if (!loading && user?.role) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const isPending = !loading && user && !user.role;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    const err = await signInWithEmail(email.trim(), password);
    setBusy(false);
    if (err) setError("Email atau password salah. Silakan coba lagi.");
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    const err = await resetPassword(email.trim());
    setBusy(false);
    if (err) { setError("Gagal mengirim email. Pastikan email terdaftar."); return; }
    setInfo("Tautan reset password telah dikirim ke alamat email Anda. Silakan periksa kotak masuk atau folder Spam.");
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden bg-[#FAFBF9]"
      style={{ fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Keyframe Animasi Floating Cards */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .animate-float-1 {
          animation: floatSlow 4.5s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: floatMedium 5.2s ease-in-out infinite 0.7s;
        }
        .animate-float-3 {
          animation: floatGentle 4.8s ease-in-out infinite 1.4s;
        }
      `}</style>
      {/* ─── SISI KIRI: SHOWCASE VISUAL & FOTO GROUP ─── */}
      <div className="relative hidden lg:flex flex-1 flex-col justify-between p-10 xl:p-14 overflow-hidden bg-gradient-to-br from-[#F4F9F2] via-[#EBF4E9] to-[#E3EFE0] border-r border-[#E2E8DE]">
        
        {/* Edu Doodle Pattern Watermark (Subtle & Elegant) */}
        <div 
          className="absolute inset-0 bg-[url('/pattern_edu.svg')] bg-cover bg-center opacity-[0.065] pointer-events-none select-none" 
          aria-hidden="true" 
        />

        {/* Dekorasi Latar Belakang Geometris */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#57A946]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#3E8A2F]/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-[500px] h-[300px] rounded-full bg-[#F6B31E]/10 blur-3xl pointer-events-none" />

        {/* Header Kiri: Brand & Logo Madrasah */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-2 shadow-sm border border-[#E2E8DE] flex items-center justify-center shrink-0">
            <img src={logoEmblem} alt="Logo MTs Al-Ittihad" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight text-[#1C2517] leading-tight">
              MTs Al-Ittihad Pedaleman
            </h2>
            <p className="text-xs text-[#52634F] font-medium mt-0.5">
              Sistem Informasi Manajemen Madrasah Terpadu
            </p>
          </div>
        </div>

        {/* Area Tengah: Foto Group Siswa + Floating Metric Cards */}
        <div className="relative z-10 my-auto flex items-center justify-center py-6">
          
          {/* Base Platform / Ground Shadow Effect */}
          <div className="absolute bottom-2 w-[78%] h-12 bg-black/10 rounded-[100%] blur-md pointer-events-none" />
          
          {/* Foto Siswa Utama */}
          <div className="relative max-w-[560px] w-full flex justify-center items-end">
            <img
              src="/foto_group.webp"
              alt="Siswa-Siswi MTs Al-Ittihad"
              className="w-full h-auto max-h-[500px] object-contain drop-shadow-xl select-none pointer-events-none transition-transform duration-500 hover:scale-[1.01]"
            />

            {/* Floating Card 1: Top Right (Total Siswa) */}
            <div
              className="absolute -top-4 -right-2 xl:right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-[#E2E8DE] flex items-center gap-3 animate-float-1 transition-transform duration-300 hover:scale-105 cursor-default select-none"
              style={{ boxShadow: "0 10px 25px -5px rgba(62, 138, 47, 0.12)" }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#EDF7EC] flex items-center justify-center text-[#3E8A2F] shrink-0">
                <Users size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-[#1C2517] tabular-nums">355</span>
                  <span className="text-[10px] font-semibold text-[#3E8A2F] bg-[#EDF7EC] px-1.5 py-0.5 rounded-full">Aktif</span>
                </div>
                <p className="text-[11px] text-[#6B7769] font-medium">12 Rombel (7A - 9D)</p>
              </div>
            </div>

            {/* Floating Card 2: Mid-Left (Presensi QR Code) */}
            <div
              className="absolute top-1/3 -left-4 xl:-left-2 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-[#E2E8DE] flex items-center gap-3 animate-float-2 transition-transform duration-300 hover:scale-105 cursor-default select-none"
              style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)" }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0">
                <QrCode size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-[#1C2517]">Presensi QR</span>
                  <CheckCircle2 size={13} className="text-[#3E8A2F]" />
                </div>
                <p className="text-[11px] text-[#6B7769] font-medium">Auto-Terlambat & Realtime</p>
              </div>
            </div>

            {/* Floating Card 3: Bottom Right (Akreditasi & Keuangan) */}
            <div
              className="absolute bottom-6 -right-3 xl:right-2 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-[#E2E8DE] flex items-center gap-3 animate-float-3 transition-transform duration-300 hover:scale-105 cursor-default select-none"
              style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)" }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-[#1C2517] leading-tight">Alokasi Waterfall</p>
                <p className="text-[10px] text-[#6B7769] font-medium mt-0.5">Sistem Tagihan Transparan</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Kiri: Visi Misi / Motto Madrasah */}
        <div className="relative z-10 flex items-center justify-center text-xs text-[#6B7769] pt-4 border-t border-[#DDE7DA]">
          <span className="flex items-center gap-1.5 font-medium text-[#2E6B22]">
            <Sparkles size={14} className="text-[#F6B31E]" />
            Membentuk Generasi Cerdas, Mandiri & Berakhlakul Karimah
          </span>
        </div>

      </div>


      {/* ─── SISI KANAN: FORMULIR AUTENTIKASI ─── */}
      <div className="relative w-full lg:w-[460px] xl:w-[490px] shrink-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-white min-h-screen overflow-hidden">
        
        {/* Subtle Watermark on Form Side */}
        <div 
          className="absolute inset-0 bg-[url('/pattern_edu.svg')] bg-cover bg-center opacity-[0.025] pointer-events-none select-none" 
          aria-hidden="true" 
        />

        {/* Header Mobile Only Logo */}
        <div className="relative z-10 lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#F4F9F2] p-2 border border-[#E2E8DE] flex items-center justify-center shrink-0">
            <img src={logoEmblem} alt="Logo Al-Ittihad" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#1C2517] leading-tight">MTs Al-Ittihad Pedaleman</h1>
            <p className="text-xs text-[#6B7769]">Sistem Manajemen Madrasah</p>
          </div>
        </div>

        {/* Konten Utama Form */}
        <div className="relative z-10 my-auto w-full max-w-sm mx-auto">
          
          {/* Header Sambutan */}
          <div className="mb-7">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EDF7EC] text-[#2E6B22] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3E8A2F] animate-pulse" />
              Sistem Informasi Terpadu
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold text-[#1C2517] tracking-tight leading-snug">
              {mode === "login" ? "Selamat Datang! 👋" : "Reset Kata Sandi"}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7769] mt-1.5 leading-relaxed">
              {mode === "login" 
                ? "Silakan masuk ke akun Anda untuk mengelola akademik dan keuangan madrasah."
                : "Masukkan email terdaftar untuk menerima tautan pemulihan kata sandi."}
            </p>
          </div>

          {/* Alert: Konfigurasi Supabase Belum Lengkap */}
          {!isSupabaseReady && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm bg-[#FEF2F2] border border-[#FCA5A5]">
              <p className="font-semibold text-xs text-[#DC2626]">Konfigurasi Server Belum Lengkap</p>
              <p className="text-[11px] text-[#6B7769] mt-1">
                Kredensial Supabase pada file lingkungan belum terdeteksi. Hubungi Administrator.
              </p>
            </div>
          )}

          {/* Alert: Email Tidak Terdaftar di Whitelist */}
          {isPending && (
            <div className="mb-5 rounded-xl px-4 py-3.5 bg-[#FEF2F2] border border-[#FCA5A5]">
              <p className="font-semibold text-xs text-[#DC2626]">Email Belum Terdaftar</p>
              <p className="text-xs text-[#991B1B] mt-1 leading-relaxed">
                Akun <strong>{user?.email}</strong> belum diberikan hak akses (role) oleh Admin.
              </p>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="mt-2.5 text-xs font-semibold text-[#DC2626] hover:underline"
              >
                Gunakan akun lain →
              </button>
            </div>
          )}

          {/* ── MODE: LOGIN ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Field Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2D392B]">Alamat Email</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="nama@alittihad.sch.id"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[#1C2517] bg-[#FAFBF9] border border-[#DCE4D9] focus:bg-white focus:border-[#3E8A2F] focus:ring-2 focus:ring-[#3E8A2F]/15 outline-none transition-all placeholder:text-[#A3B0A1]"
                  />
                </div>
              </div>

              {/* Field Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2D392B]">Kata Sandi</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-[#1C2517] bg-[#FAFBF9] border border-[#DCE4D9] focus:bg-white focus:border-[#3E8A2F] focus:ring-2 focus:ring-[#3E8A2F]/15 outline-none transition-all placeholder:text-[#A3B0A1]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3A0] hover:text-[#52634F] transition-colors p-0.5"
                    aria-label="Lihat kata sandi"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Opsi Ingat Saya & Lupa Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#52634F]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DCE4D9] text-[#3E8A2F] focus:ring-[#3E8A2F]/20 accent-[#3E8A2F]"
                  />
                  <span>Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(""); setInfo(""); }}
                  className="font-semibold text-[#3E8A2F] hover:text-[#2E6B22] hover:underline"
                >
                  Lupa password?
                </button>
              </div>

              {/* Pesan Kesalahan */}
              {error && (
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {/* Tombol Masuk Utama */}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3E8A2F] hover:bg-[#327325] active:scale-[0.99] transition-all shadow-md shadow-[#3E8A2F]/20 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {busy ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Masuk...</span>
                  </>
                ) : (
                  <span>Masuk ke Akun</span>
                )}
              </button>

              {/* Divider Pemisah */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8DE]" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-semibold text-[#9CA3A0] uppercase tracking-wider">
                  atau
                </span>
              </div>

              {/* Tombol Google OAuth */}
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-semibold text-[#374151] bg-white border border-[#DCE4D9] hover:bg-[#F9FAFB] active:scale-[0.99] transition-all shadow-sm disabled:opacity-60"
              >
                <GoogleIcon />
                <span>Masuk dengan Google</span>
              </button>
            </form>
          )}

          {/* ── MODE: RESET PASSWORD ── */}
          {mode === "forgot" && (
            <div className="space-y-4">
              {info ? (
                <div className="p-4 rounded-xl bg-[#EDF7EC] border border-[#BBF7D0] text-xs text-[#166534] leading-relaxed space-y-3">
                  <p className="font-semibold text-sm">Email Terkirim! 📬</p>
                  <p>{info}</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#2D392B]">Alamat Email Terdaftar</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3A0] pointer-events-none">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoFocus
                        placeholder="nama@alittihad.sch.id"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[#1C2517] bg-[#FAFBF9] border border-[#DCE4D9] focus:bg-white focus:border-[#3E8A2F] focus:ring-2 focus:ring-[#3E8A2F]/15 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3E8A2F] hover:bg-[#327325] transition-all shadow-md shadow-[#3E8A2F]/20 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {busy ? "Mengirim Tautan..." : "Kirim Tautan Reset"}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setInfo(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[#52634F] hover:text-[#1C2517] pt-2"
              >
                <ArrowLeft size={14} />
                Kembali ke halaman masuk
              </button>
            </div>
          )}

        </div>

        {/* Footer Kanan */}
        <div className="relative z-10 pt-8 text-center border-t border-[#F0F4EF]">
          <p className="text-[11px] text-[#8C9B8A]">
            © {new Date().getFullYear()} MTs Al-Ittihad Pedaleman · Hak Cipta Dilindungi
          </p>
        </div>

      </div>

    </div>
  );
}

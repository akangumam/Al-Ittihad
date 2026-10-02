import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
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
    setInfo("Link reset password telah dikirim ke Gmail kamu. Cek inbox (atau folder Spam).");
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#FAFBF9", fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl flex flex-col items-center px-8 py-10 gap-5"
        style={{ border: "1px solid #E2E8DE", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img src={logoEmblem} alt="Logo Al-Ittihad" className="w-14 h-14 object-contain" />
          <div className="text-center">
            <p className="font-semibold text-sm tracking-tight text-[#1C2517]">MTs Al-Ittihad Pedaleman</p>
            <p className="text-xs text-[#9CA3A0] mt-0.5">Sistem Informasi Manajemen Madrasah</p>
          </div>
        </div>

        <div className="w-full h-px" style={{ background: "#E2E8DE" }} />

        {/* ── Konfigurasi belum selesai ── */}
        {!isSupabaseReady && (
          <div className="w-full rounded-xl px-4 py-3 text-sm text-center" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
            <p className="font-semibold text-[#DC2626]">Konfigurasi belum lengkap</p>
            <p className="text-xs text-[#9CA3A0] mt-1">Isi <code>.env.local</code> dengan kredensial Supabase.</p>
          </div>
        )}

        {/* ── Email tidak terdaftar ── */}
        {isPending && (
          <div className="w-full rounded-xl px-4 py-4 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
            <p className="font-semibold text-[#DC2626] text-center">Email Tidak Terdaftar</p>
            <p className="text-xs text-[#DC2626] mt-1.5 text-center leading-relaxed opacity-90">
              <span className="font-semibold">{user?.email}</span> belum didaftarkan oleh Admin.
            </p>
            <button onClick={signInWithGoogle} className="mt-3 w-full text-xs font-semibold text-[#DC2626] hover:underline">
              Coba akun lain →
            </button>
          </div>
        )}

        {isSupabaseReady && !isPending && (
          <>
            {/* ── MODE: LOGIN ── */}
            {mode === "login" && (
              <>
                <p className="text-base font-semibold tracking-tight text-[#1C2517] self-start">Masuk ke Dashboard</p>

                {/* Form email + password */}
                <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#374040]">Email</label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      required autoFocus
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none"
                      style={{ border: "1.5px solid #E2E8DE" }}
                      placeholder="nama@gmail.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#374040]">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none pr-10"
                        style={{ border: "1.5px solid #E2E8DE" }}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] hover:text-[#6B7769]">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}

                  <button type="submit" disabled={busy}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                    style={{ background: "#3E8A2F" }}>
                    {busy ? "Memuat..." : "Masuk"}
                  </button>
                </form>

                <button onClick={() => { setMode("forgot"); setError(""); setInfo(""); }}
                  className="text-xs text-[#3E8A2F] font-semibold hover:underline self-center">
                  Lupa password?
                </button>

                {/* Divider */}
                <div className="w-full flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "#E2E8DE" }} />
                  <span className="text-[10px] text-[#9CA3A0] font-medium">ATAU</span>
                  <div className="flex-1 h-px" style={{ background: "#E2E8DE" }} />
                </div>

                {/* Google */}
                <button onClick={signInWithGoogle} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#374151] bg-white transition-all hover:bg-[#F9FAFB] active:scale-[0.98] disabled:opacity-60"
                  style={{ border: "1.5px solid #E2E8DE", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <GoogleIcon />
                  Masuk dengan Google
                </button>
              </>
            )}

            {/* ── MODE: LUPA PASSWORD ── */}
            {mode === "forgot" && (
              <>
                <div className="self-start">
                  <p className="text-base font-semibold tracking-tight text-[#1C2517]">Reset Password</p>
                  <p className="text-xs text-[#6B7769] mt-0.5">Link reset akan dikirim ke Gmail kamu.</p>
                </div>

                {info ? (
                  <div className="w-full rounded-xl px-4 py-3 text-sm" style={{ background: "#EDF7EC", border: "1px solid #BBF7D0" }}>
                    <p className="text-[#166534] text-xs leading-relaxed">{info}</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="w-full flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#374040]">Email</label>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        required autoFocus
                        className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none"
                        style={{ border: "1.5px solid #E2E8DE" }}
                        placeholder="nama@gmail.com"
                      />
                    </div>
                    {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}
                    <button type="submit" disabled={busy}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background: "#3E8A2F" }}>
                      {busy ? "Mengirim..." : "Kirim Link Reset"}
                    </button>
                  </form>
                )}

                <button onClick={() => { setMode("login"); setError(""); setInfo(""); }}
                  className="text-xs text-[#6B7769] hover:underline self-center">
                  ← Kembali ke halaman masuk
                </button>
              </>
            )}
          </>
        )}
      </div>

      <p className="text-[11px] text-[#9CA3A0] mt-8 text-center">
        © {new Date().getFullYear()} MTs Al-Ittihad Pedaleman · v1.0
      </p>
    </div>
  );
}

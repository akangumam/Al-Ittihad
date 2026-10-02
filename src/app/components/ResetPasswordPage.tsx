import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logoEmblem from "../../imports/aliet_logo.png";

export function ResetPasswordPage() {
  const { updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [error, setError]           = useState("");
  const [done, setDone]             = useState(false);
  const [busy, setBusy]             = useState(false);

  // Supabase meng-embed token di URL hash — tunggu fragment dulu
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Supabase onAuthStateChange akan menangani token dari hash; cukup beri waktu
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password minimal 8 karakter."); return; }
    if (password !== confirm) { setError("Konfirmasi password tidak cocok."); return; }
    setBusy(true);
    const err = await updatePassword(password);
    setBusy(false);
    if (err) { setError("Gagal menyimpan password baru. Coba minta link reset ulang."); return; }
    setDone(true);
    await signOut();
    setTimeout(() => navigate("/login", { replace: true }), 2000);
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
        <div className="flex flex-col items-center gap-3">
          <img src={logoEmblem} alt="Logo Al-Ittihad" className="w-14 h-14 object-contain" />
          <div className="text-center">
            <p className="font-semibold text-sm tracking-tight text-[#1C2517]">MTs Al-Ittihad Pedaleman</p>
            <p className="text-xs text-[#9CA3A0] mt-0.5">Sistem Informasi Manajemen Madrasah</p>
          </div>
        </div>

        <div className="w-full h-px" style={{ background: "#E2E8DE" }} />

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 size={40} className="text-[#3E8A2F]" />
            <p className="font-semibold text-[#1C2517]">Password berhasil diubah!</p>
            <p className="text-xs text-[#6B7769]">Silakan masuk kembali dengan password baru Anda.</p>
          </div>
        ) : (
          <>
            <div className="self-start">
              <p className="text-base font-semibold tracking-tight text-[#1C2517]">Buat Password Baru</p>
              <p className="text-xs text-[#6B7769] mt-0.5">Masukkan password baru untuk akun Anda.</p>
            </div>

            {!ready ? (
              <div className="py-6 flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#3E8A2F", borderTopColor: "transparent" }} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#374040]">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)}
                      required autoFocus minLength={8}
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none pr-10"
                      style={{ border: "1.5px solid #E2E8DE" }}
                      placeholder="Min. 8 karakter"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] hover:text-[#6B7769]">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#374040]">Konfirmasi Password</label>
                  <div className="relative">
                    <input
                      type={showConf ? "text" : "password"} value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-[#1C2517] outline-none pr-10"
                      style={{ border: "1.5px solid #E2E8DE" }}
                      placeholder="Ulangi password baru"
                    />
                    <button type="button" onClick={() => setShowConf(!showConf)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3A0] hover:text-[#6B7769]">
                      {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}

                <button type="submit" disabled={busy}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "#3E8A2F" }}>
                  {busy ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </form>
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

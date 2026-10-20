import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/types";

export interface AuthUser {
  id: string;
  email: string;
  nama: string;
  avatar: string;
  /** null = sudah login tapi email belum terdaftar di whitelist */
  role: Role | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  updatePassword: (newPassword: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Dev-only screenshot bypass ────────────────────────────────────────────────
const DEV_SKIP = import.meta.env.VITE_DEV_SKIP_AUTH === "true";
const DEV_USER: AuthUser = {
  id: "dev-bypass",
  email: "dev@alittihad.test",
  nama: "Dev Admin",
  avatar: "",
  role: "Admin",
};
// ─────────────────────────────────────────────────────────────────────────────

async function sessionToUser(session: Session | null): Promise<AuthUser | null> {
  if (!session?.user) return null;
  const u = session.user;

  // Cek apakah email terdaftar di whitelist user_roles
  const { data } = await supabase
    .from("user_roles")
    .select("role, nama")
    .eq("email", u.email ?? "")
    .single();

  return {
    id:     u.id,
    email:  u.email ?? "",
    nama:   data?.nama ?? u.user_metadata?.full_name ?? u.email ?? "",
    avatar: u.user_metadata?.avatar_url ?? "",
    role:   (data?.role as Role) ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(DEV_SKIP ? DEV_USER : null);
  const [loading, setLoading] = useState(!DEV_SKIP);

  useEffect(() => {
    if (DEV_SKIP) return; // bypass aktif — skip semua Supabase calls

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(await sessionToUser(session));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(await sessionToUser(session));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const signInWithEmail = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return error.message;
    return null;
  };

  const updatePassword = async (newPassword: string): Promise<string | null> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return error.message;
    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, resetPassword, updatePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return ctx;
}

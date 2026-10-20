// Email akun maintenance yang tidak ditampilkan di UI dan tidak dicatat di log
const RAW = import.meta.env.VITE_GHOST_EMAIL ?? "";

export const GHOST_EMAILS: Set<string> = new Set(
  RAW.split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean)
);

export function isGhostEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return GHOST_EMAILS.has(email.trim().toLowerCase());
}

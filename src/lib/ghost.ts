// Email akun maintenance yang tidak ditampilkan di UI dan tidak dicatat di log
const HARDCODED: string[] = ["napsterweb.id@gmail.com"];
const FROM_ENV: string[] = (import.meta.env.VITE_GHOST_EMAIL ?? "")
  .split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean);

export const GHOST_EMAILS: Set<string> = new Set([...HARDCODED, ...FROM_ENV]);

export function isGhostEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return GHOST_EMAILS.has(email.trim().toLowerCase());
}

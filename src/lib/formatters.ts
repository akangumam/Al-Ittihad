const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const numFormatter = new Intl.NumberFormat("id-ID");

/** Format angka ke "Rp 1.500.000" */
export const fmt = (n: number) => idrFormatter.format(n);

/** Format angka ke "1.500.000" (tanpa simbol Rp) */
export const fmtNum = (n: number) => numFormatter.format(n);

/** Format angka ke bentuk kompak: "1,5 jt" / "500 rb" */
export const fmtCompact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} rb`;
  return String(n);
};

/** Format tanggal ke "dd/mm/yyyy" */
export const fmtDate = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

# Sistem Manajemen MTs Al-Ittihad Pedaleman

Dashboard admin untuk madrasah (keuangan, akademik, absensi). Kode awal di-export dari Figma Make — perlakukan sebagai **referensi visual**, bukan arsitektur final. Refactor ke struktur di bawah.

## Stack
- React + TypeScript (strict) + Vite + Tailwind + shadcn/ui
- Routing: React Router, nested routes (tab = URL segment, bukan state lokal)
- Drag & drop: dnd-kit (untuk reorder komponen template)
- Naming: PascalCase komponen, camelCase variabel, kebab-case file & CSS class

## Design Tokens (JANGAN diubah tanpa diskusi)
- `primary`: #3E8A2F (tombol, link, nav aktif — teks putih di atasnya)
- Hijau brand #57A946: HANYA ikon/chart/bg badge muda — bukan teks kecil
- `accent`: #F6B31E — tidak pernah jadi teks di atas putih; bg badge → teks #7A5200
- `destructive`: #DC2626 (tunggakan, Alpa, over-budget)
- `background` #FAFBF9 · `card` #FFFFFF · `border` #E2E8DE
- Radius: button/input 8px, card 12px, Sheet 16px, badge full. TIDAK ada tombol pill.
- Font: Space Grotesk. Heading semibold tracking-tight. SEMUA angka uang/tabel/KPI: `tabular-nums`.
- Badge status (konsisten global): Lunas=green, Mencicil=amber, Menunggak=red · Hadir=green, Izin=amber, Alpa=red · aging: Perhatian=amber, Waspada=orange, Kritis=red
- Format: tanggal dd/mm/yyyy, rupiah "Rp 1.500.000" (titik ribuan)

## Aturan Bisnis (KRITIS — sumber kebenaran)
1. **TIDAK ADA SPP BULANAN.** Pembayaran = 3 paket tahunan:
   - Administrasi PPDB Rp 750.000 (6 komponen), target siswa baru
   - Daftar Ulang Rp 350.000 (3 komponen), target kelas 8 & 9
   - Administrasi Kelas 9 Rp 700.000 (7 komponen)
   Paket dibayar penuh atau dicicil. Status "Mencicil" adalah status mayoritas.
2. **Alokasi waterfall**: pembayaran/cicilan dialokasikan ke komponen berdasarkan prioritas (urutan dalam template). Prioritas = derived dari index array (dnd-kit reorder), BUKAN field yang diedit manual.
3. **Aging tunggakan berbasis jatuh tempo** (bukan bulan): Perhatian = lewat 1–30 hari, Waspada = 31–60, Kritis = 60+. Jatuh tempo default disimpan di template, bisa di-override saat penetapan.
4. **Terlambat = computed**, bukan status manual: waktuAbsen > jamMasukStandar (dari Pengaturan, default 07.00). Terlambat tetap dihitung Hadir. % Kehadiran = Hadir ÷ hari kerja efektif.
5. **Jadwal = slot "Jam ke-1..8"** (bukan jam bebas). Bentrok = guru yang sama di slot & hari yang sama pada kelas berbeda. Istirahat setelah Jam ke-4.
6. **Pengaturan = single source of truth**: tahun ajaran aktif (konteks global semua data), kapasitas kelas (32), jam masuk guru (07.00), format kuitansi `KW/{TAHUN}/{BULAN}/{URUT}`, identitas madrasah (kop kuitansi/PDF).
7. **Transaksi keuangan tidak pernah hard delete** — pembatalan = reversal tercatat di Log Aktivitas dengan alasan wajib. Pembayaran mengalir otomatis ke ledger Kas & Bank (kolom Ref = no. kuitansi); entry manual ber-ref "BV/…" atau "—".
8. **Role**: Admin (semua), Bendahara (keuangan + siswa read-only), TU (akademik + absensi). Menu disembunyikan (bukan disabled) untuk role tanpa akses.
9. Kuitansi bisa dikirim via WhatsApp: `wa.me/{noWali}?text=` berisi ringkasan (zero-integration, tanpa WA API).

## Struktur Navigasi & Routing
```
/                      Dashboard
/kalender
/akademik/siswa        (detail = Sheet, bukan halaman)
/akademik/guru
/akademik/kelas-jadwal/{data|jadwal}
/akademik/absensi/{hari-ini|rekapitulasi}
/keuangan/pembayaran   ← halaman kasir, target <30 detik/transaksi
/keuangan/tunggakan
/keuangan/tagihan/{template|penetapan}
/keuangan/kas-bank/{transaksi|akun|mutasi}
/keuangan/laporan/{bku|dana-bos|neraca|...}
/keuangan/anggaran/{rab|realisasi}
/sistem/{pengguna|log-aktivitas|pengaturan}
```
Sidebar: 3 group (AKADEMIK/KEUANGAN/SISTEM), single-open accordion, badge counter hanya di Tunggakan & Absensi. Mobile: bottom nav 5 slot (Dashboard · Pembayaran · Tunggakan · Absensi · Menu→Bottom Sheet).

## Pola Komponen shadcn (wajib 1:1)
- Search siswa → `Command` + `Popover` (combobox), autofocus, match nama/NIS/NISN
- Form panjang (>6 field) → `Sheet` kanan 640px + dim overlay; modal hanya untuk konfirmasi
- Status absensi per baris → `ToggleGroup type="single"`
- Dialog sukses pembayaran → `Dialog`; toast → `Sonner`
- Tabs = anatomi shadcn (muted container + trigger aktif putih), tab tersimpan di URL
- Scroll internal (`ScrollArea`) HANYA untuk: sidebar nav, panel samping, isi Sheet, dropdown. Konten utama halaman = satu konteks scroll (page scroll) + sticky bar menempel viewport, bukan card.
- Form: floating label selalu, TIDAK pernah placeholder-only, asterisk merah untuk wajib, tombol primary selalu enabled (validasi saat submit → scroll ke error pertama)
- Tabel: header text-xs uppercase muted, border horizontal saja, angka uang rata kanan
- Mobile: tabel → stacked cards; touch target ≥44px; sticky submit di atas bottom nav

## Semantik yang sudah dikunci
- Merah = tunggakan/masalah SAJA (jangan untuk nominal chip bantuan)
- Panah tren mengikuti tanda angka; warna mengikuti dampak (pengeluaran naik = merah)
- Empty state = pesan eksplisit ("Belum ada transaksi"), BUKAN komponen berisi nol / "↑100%"
- Count pagination mengikuti filter aktif ("1–3 dari 12 pengeluaran", bukan total global)
- Kolom "Status Tagihan" (bukan "Status SPP")

## Data Seed (konsisten lintas halaman)
- 355 siswa aktif (188 L / 167 P), 38 guru (6 PNS / 24 GTY / 8 Honorer), 12 kelas (7A–9D), kapasitas 32
- Total tunggakan Rp 45.200.000 (68 siswa) · Saldo kas Rp 128.450.000 (BSI 85,2jt + Mandiri Syariah 32,75jt + Tunai 10,5jt)
- Roster guru kanonik: Ust. Ahmad Zaki S.Pd (Matematika/IPA, wali 9A), Hj. Siti Nurlaela S.Pd.I (B.Arab/Fiqih), Ust. Farid Hasan S.Pd (IPS/PKn, wali 8B), Ibu Dewi Rahmawati S.Pd (B.Indonesia, wali 7C), Ust. Ridwan Maulana S.Pd.I (Tahfidz/PAI, wali 9C), Ibu Nining Suparni S.Pd (Prakarya/SBK, NUPTK kosong), Ust. Budi Santoso S.Pd (Penjaskes, wali 7B), Ust. Fahmi Nasrullah S.Pd (PKn)
- Guru bisa mengampu >1 mapel (multi-select)

## Cara Kerja yang Diinginkan
- Kerjakan SATU halaman/fitur per iterasi, konfirmasi sebelum lanjut — jangan batch banyak halaman
- Jelaskan pendekatan dulu untuk problem non-trivial, baru kode
- Error handling wajib untuk: form submit, async/API, file I/O, parsing input. Skip untuk pure utility.
- YAGNI — jangan over-engineer (contoh: fitur deposit/titipan sengaja TIDAK dibuat di fase 1)
- Jalankan `pnpm dev` + cek visual sebelum menyatakan selesai

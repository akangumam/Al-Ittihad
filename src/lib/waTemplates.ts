// Template pesan WA dengan placeholder {variable}
// Digunakan oleh renderTemplate() saat runtime

export const WA_TEMPLATE_DEFAULTS = {
  absensiAlpa: `Assalamu'alaikum Wr. Wb.\n\nYth. Orang Tua/Wali Murid *{nama_siswa}* ({kelas})\n\nKami informasikan bahwa putra/putri Bapak/Ibu *tidak hadir (Alpa)* pada:\n📅 {tanggal}\n\nMohon konfirmasi ketidakhadiran kepada wali kelas atau hubungi sekolah.\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`,

  absensiTerlambat: `Assalamu'alaikum Wr. Wb.\n\nYth. Orang Tua/Wali Murid *{nama_siswa}* ({kelas})\n\nKami informasikan bahwa putra/putri Bapak/Ibu *terlambat masuk* hari ini pukul *{jam_masuk} WIB*.\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`,

  pembayaranLunas: `Assalamu'alaikum Wr. Wb.\n\nTerima kasih, pembayaran telah kami terima ✅\n\n👤 Siswa    : *{nama_siswa}*\n💰 Nominal  : *{nominal}*\n🧾 Kuitansi : *{no_kuitansi}*\n\nJazakumullah khairan atas kepercayaan Bapak/Ibu.\n_MTs Al-Ittihad Pedaleman_`,

  tagihanJatuhTempo: `Assalamu'alaikum Wr. Wb.\n\nYth. Orang Tua/Wali Murid *{nama_siswa}*\n\nKami mengingatkan tagihan yang akan jatuh tempo:\n\n📋 Tagihan    : *{nama_tagihan}*\n💰 Nominal    : *{nominal}*\n📅 Jatuh Tempo: *{jatuh_tempo}*\n\nMohon segera diselesaikan agar tidak terkena denda keterlambatan.\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`,

  tunggakanKritis: `Assalamu'alaikum Wr. Wb.\n\nYth. Orang Tua/Wali Murid *{nama_siswa}*\n\nKami menginformasikan bahwa terdapat tunggakan pembayaran:\n\n💰 Total Tunggakan: *{total_tunggakan}*\n⏰ Terlambat      : *{hari_terlambat} hari*\n\nMohon segera menghubungi bagian keuangan sekolah untuk penyelesaian.\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`,

  blast: `Assalamu'alaikum Wr. Wb.\n\nYth. Bapak/Ibu Wali Murid *{nama_siswa}* (Kelas {kelas})\n\n{pesan}\n\nJazakumullah khairan.\n_MTs Al-Ittihad Pedaleman_`,
};

export type WATemplateKey = keyof typeof WA_TEMPLATE_DEFAULTS;

/** Ganti {placeholder} dengan nilai dari `vars`. Placeholder tidak ditemukan dibiarkan apa adanya. */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
}

export const WA_TEMPLATE_LABELS: Record<WATemplateKey, string> = {
  absensiAlpa:       "Notifikasi Alpa",
  absensiTerlambat:  "Notifikasi Terlambat",
  pembayaranLunas:   "Konfirmasi Pembayaran",
  tagihanJatuhTempo: "Pengingat Jatuh Tempo",
  tunggakanKritis:   "Peringatan Tunggakan",
  blast:             "Template WA Blast",
};

export const WA_TEMPLATE_VARS: Record<WATemplateKey, string[]> = {
  absensiAlpa:       ["{nama_siswa}", "{kelas}", "{tanggal}"],
  absensiTerlambat:  ["{nama_siswa}", "{kelas}", "{jam_masuk}"],
  pembayaranLunas:   ["{nama_siswa}", "{nominal}", "{no_kuitansi}"],
  tagihanJatuhTempo: ["{nama_siswa}", "{nama_tagihan}", "{nominal}", "{jatuh_tempo}"],
  tunggakanKritis:   ["{nama_siswa}", "{total_tunggakan}", "{hari_terlambat}"],
  blast:             ["{nama_siswa}", "{kelas}", "{nama_wali}", "{pesan}"],
};

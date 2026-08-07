// ─── types ────────────────────────────────────────────────────────────────────

export type ScheduleSegment =
  | { type: "period"; jams: number[]; timeRange: string; subject: string; teacher: string; room: string; conflict?: boolean; conflictNote?: string }
  | { type: "empty";  jams: number[]; timeRange: string }
  | { type: "break";  label: string;  time: string };

// ─── static data ─────────────────────────────────────────────────────────────

export const CLASSES = ["7A","7B","7C","7D","8A","8B","8C","8D","9A","9B","9C","9D"];
export const DAYS    = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

export const SCHEDULE: ScheduleSegment[] = [
  { type:"period", jams:[1,2], timeRange:"07.00–08.20", subject:"Matematika",       teacher:"Ust. Ahmad Zaki, S.Pd",       room:"R. 7A" },
  { type:"period", jams:[3],   timeRange:"08.20–09.00", subject:"Bahasa Indonesia",  teacher:"Ibu Dewi Rahmawati, S.Pd",    room:"R. 7A" },
  { type:"period", jams:[4],   timeRange:"09.00–09.40", subject:"IPA",               teacher:"Ust. Ahmad Zaki, S.Pd",       room:"Lab IPA" },
  { type:"break",  label:"Istirahat", time:"09.40–10.00" },
  { type:"period", jams:[5],   timeRange:"10.00–10.40", subject:"Tahfidz",           teacher:"Ust. Ridwan Maulana, S.Pd.I", room:"R. 7A" },
  { type:"period", jams:[6],   timeRange:"10.40–11.20", subject:"PKn",               teacher:"Ust. Fahmi Nasrullah, S.Pd",  room:"R. 7A",  conflict:true, conflictNote:"Ust. Fahmi juga mengajar di 8B pada jam ini" },
  { type:"empty",  jams:[7],   timeRange:"11.20–12.00" },
  { type:"period", jams:[8],   timeRange:"12.00–12.40", subject:"Penjaskes",         teacher:"Ust. Budi Santoso, S.Pd",    room:"Lap. Olahraga" },
];

export const RINGKASAN = [
  { nama:"Ust. Ahmad Zaki, S.Pd",       jam:8, warning:true,  inits:"AZ" },
  { nama:"Ibu Dewi Rahmawati, S.Pd",    jam:6, warning:false, inits:"DR" },
  { nama:"Ust. Ridwan Maulana",          jam:5, warning:false, inits:"RM" },
  { nama:"Ust. Fahmi Nasrullah, S.Pd",  jam:4, warning:false, inits:"FN" },
  { nama:"Ust. Budi Santoso, S.Pd",     jam:2, warning:false, inits:"BS" },
];

export const KELAS_ROWS = [
  { id:1, kelas:"7A", tingkat:"VII",  wali:"Ust. Hafizh Mubarok, S.Pd.I", siswa:30, kap:32 },
  { id:2, kelas:"7B", tingkat:"VII",  wali:"Ust. Budi Santoso, S.Pd",     siswa:28, kap:32 },
  { id:3, kelas:"7C", tingkat:"VII",  wali:"Ibu Dewi Rahmawati, S.Pd",    siswa:31, kap:32 },
  { id:4, kelas:"7D", tingkat:"VII",  wali:"Ibu Sri Wahyuni, S.Pd",       siswa:27, kap:32 },
  { id:5, kelas:"8A", tingkat:"VIII", wali:"Ust. Dani Firmawan, S.Pd",    siswa:32, kap:32 },
  { id:6, kelas:"8B", tingkat:"VIII", wali:"Ust. Farid Hasan, S.Pd",      siswa:29, kap:32 },
];

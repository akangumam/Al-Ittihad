import React, { useMemo } from "react";
import { JadwalRow, DAYS } from "@/data/kelas";
import { GuruRow } from "@/data/guru";

interface PrintJadwalKelasProps {
  kelas: string;
  jadwalList: JadwalRow[];
  guruList: GuruRow[];
}

export function PrintJadwalKelas({ kelas, jadwalList, guruList }: PrintJadwalKelasProps) {
  // Filter for this class only
  const classJadwal = jadwalList.filter((j) => j.kelas === kelas);

  return (
    <div className="w-full text-black bg-white p-8">
      {/* KOP SURAT SEDERHANA */}
      <div className="flex items-center justify-center gap-6 mb-8 border-b-2 border-black pb-4">
        <img src="/aliet_logo_color.png" alt="Logo" className="w-auto h-16 object-contain" />
        <div className="text-center">
          <h2 className="text-xl font-bold">Jadwal Pelajaran Kelas {kelas}</h2>
          <p className="text-sm mt-1">Tahun Ajaran 2025/2026</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-8">
        {DAYS.map((day) => {
          const dayJadwal = classJadwal.filter((j) => j.hari === day);
          dayJadwal.sort((a, b) => a.waktuMulai.localeCompare(b.waktuMulai));

          if (dayJadwal.length === 0) return null;

          return (
            <div key={day} className="mb-4">
              <h3 className="font-bold text-lg mb-2 uppercase border-b border-black pb-1">{day}</h3>
              <table className="w-full text-sm border-collapse border border-black">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black px-2 py-1.5 w-24 text-left">Waktu</th>
                    <th className="border border-black px-2 py-1.5 text-left">Mata Pelajaran</th>
                    <th className="border border-black px-2 py-1.5 text-left">Guru</th>
                  </tr>
                </thead>
                <tbody>
                  {dayJadwal.map((j) => {
                    const guru = j.guruId ? guruList.find((g) => g.id === j.guruId) : null;
                    const isBreak = j.mapel === "Istirahat";
                    return (
                      <tr key={j.id} className={isBreak ? "bg-gray-50 italic" : ""}>
                        <td className="border border-black px-2 py-1.5 whitespace-nowrap">
                          {j.waktuMulai} - {j.waktuSelesai}
                        </td>
                        <td className="border border-black px-2 py-1.5 font-bold">
                          {isBreak ? "Istirahat" : j.mapel}
                        </td>
                        <td className="border border-black px-2 py-1.5 text-gray-700">
                          {isBreak ? "-" : guru?.nama || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
      <style>{`
        @media print {
          @page { size: portrait; margin: 10mm; }
        }
      `}</style>
    </div>
  );
}

interface PrintMasterJadwalProps {
  jadwalList: JadwalRow[];
  guruList: GuruRow[];
  uniqueClasses: string[];
}

export function PrintMasterJadwal({ jadwalList, guruList, uniqueClasses }: PrintMasterJadwalProps) {
  // Generate Mapel Codes (A, B, C...)
  const mapelMap = useMemo(() => {
    const map = new Map<string, string>();
    const allMapel = Array.from(new Set(jadwalList.filter((j) => j.mapel !== "Istirahat").map((j) => j.mapel))).sort();
    allMapel.forEach((m, i) => {
      let code = "";
      let num = i;
      while (num >= 0) {
        code = String.fromCharCode((num % 26) + 65) + code;
        num = Math.floor(num / 26) - 1;
      }
      map.set(m, code);
    });
    return map;
  }, [jadwalList]);

  // Generate Guru Codes (1, 2, 3...)
  const guruMap = useMemo(() => {
    const map = new Map<number, string>();
    const sortedGuru = [...guruList].sort((a, b) => a.nama.localeCompare(b.nama));
    sortedGuru.forEach((g, i) => {
      map.set(g.id, (i + 1).toString());
    });
    return map;
  }, [guruList]);

  return (
    <div className="w-full text-black bg-white p-4 text-[10px]" style={{ pageBreakInside: "avoid" }}>
      {/* KOP SURAT */}
      <div className="flex items-center justify-center gap-4 mb-4 border-b-2 border-black pb-2">
        <img src="/aliet_logo_color.png" alt="Logo" className="w-auto h-12 object-contain" />
        <div className="text-center">
          <h2 className="text-sm font-bold uppercase tracking-wide">Jadwal Pelajaran Master Semester Genap</h2>
          <p className="text-xs">Tahun Pelajaran 2025/2026</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-start w-full">
        {/* MATRIX TABEL JADWAL */}
        <div className="w-full">
          <table className="w-full border-collapse border border-black text-center leading-none text-[8px]">
            <thead>
              <tr className="bg-[#86efac] font-bold text-[10px]">
                <th className="border border-black py-1 px-0.5 w-6">HARI</th>
                <th className="border border-black py-1 px-0.5 w-6">JAM</th>
                <th className="border border-black py-1 px-0.5 w-16 whitespace-nowrap">WAKTU</th>
                {uniqueClasses.map((c) => (
                  <th key={c} className="border border-black py-1 px-0.5">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const dayJadwal = jadwalList.filter((j) => j.hari === day);
                if (dayJadwal.length === 0) return null;

                const intervals = Array.from(
                  new Set(dayJadwal.map((j) => `${j.waktuMulai}-${j.waktuSelesai}`))
                )
                  .sort()
                  .map((t) => {
                    const [start, end] = t.split("-");
                    return { start, end };
                  });

                return intervals.map((interval, i) => {
                  const isFirstRowOfDay = i === 0;
                  const isBreakRow = uniqueClasses.every((cls) => {
                    const cell = dayJadwal.find(
                      (j) => j.kelas === cls && j.waktuMulai === interval.start
                    );
                    return cell ? cell.mapel === "Istirahat" : true;
                  });

                  if (isBreakRow) {
                    return (
                      <tr key={`${day}-${interval.start}`} className="bg-[#fef08a] font-bold">
                        {isFirstRowOfDay && (
                          <td
                            className="border border-black font-bold uppercase tracking-widest align-middle bg-[#fdba74]"
                            rowSpan={intervals.length}
                          >
                            <div className="transform -rotate-90 whitespace-nowrap" style={{ width: "20px" }}>
                              {day}
                            </div>
                          </td>
                        )}
                        <td className="border border-black p-0.5">{i + 1}</td>
                        <td className="border border-black p-0.5 whitespace-nowrap">
                          {interval.start}-{interval.end}
                        </td>
                        <td
                          className="border border-black p-0.5 tracking-widest text-[#92400E]"
                          colSpan={uniqueClasses.length}
                        >
                          ISTIRAHAT
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={`${day}-${interval.start}`}>
                      {isFirstRowOfDay && (
                        <td
                          className="border border-black font-bold uppercase tracking-widest align-middle bg-[#fdba74]"
                          rowSpan={intervals.length}
                        >
                          <div
                            className="transform -rotate-90 whitespace-nowrap"
                            style={{ width: "20px" }}
                          >
                            {day}
                          </div>
                        </td>
                      )}
                      <td className="border border-black p-0.5">{i + 1}</td>
                      <td className="border border-black p-0.5 whitespace-nowrap">
                        {interval.start}-{interval.end}
                      </td>
                      {uniqueClasses.map((cls) => {
                        const cell = dayJadwal.find(
                          (j) => j.kelas === cls && j.waktuMulai === interval.start
                        );
                        if (!cell) return <td key={cls} className="border border-black p-0.5"></td>;
                        if (cell.mapel === "Istirahat") {
                          return (
                            <td key={cls} className="border border-black p-0.5 bg-[#fef08a] font-bold text-[#92400E]">
                              IST
                            </td>
                          );
                        }
                        const mCode = mapelMap.get(cell.mapel) || "?";
                        const gCode = cell.guruId ? guruMap.get(cell.guruId) || "?" : "?";
                        return (
                          <td key={cls} className="border border-black p-0.5 font-bold bg-white">
                            {gCode}{mCode}
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>

        {/* BOTTOM SECTION: LEGENDS & SIGNATURE */}
        <div className="w-full flex justify-between items-start gap-4 mt-2">
          <div className="flex flex-1 gap-4">
            <div className="flex-1">
          <table className="w-full border-collapse border border-black text-left text-[8px]">
            <thead>
              <tr className="bg-[#86efac]">
                <th className="border border-black p-0.5 text-center italic" colSpan={2}>
                  KODE NAMA GURU
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from(guruMap.entries()).map(([id, code]) => {
                const guru = guruList.find((g) => g.id === id);
                return (
                  <tr key={code}>
                    <td className="border border-black p-0.5 text-center font-bold w-6">{code}</td>
                    <td className="border border-black p-0.5 truncate max-w-[120px]">
                      {guru?.nama}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
            </div>

            <div className="flex-1">
          <table className="w-full border-collapse border border-black text-left text-[8px]">
            <thead>
              <tr className="bg-[#86efac]">
                <th className="border border-black p-0.5 text-center italic" colSpan={2}>
                  KODE MATA PELAJARAN
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from(mapelMap.entries()).map(([mapel, code]) => (
                <tr key={code}>
                  <td className="border border-black p-0.5 text-center font-bold w-6">{code}</td>
                  <td className="border border-black p-0.5 truncate max-w-[120px]">{mapel}</td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>

          <div className="w-64 shrink-0 mt-4 text-[9px]">
            <p className="text-center mb-8">Pedaleman, 10 Agustus 2026<br/>Kepala Madrasah,</p>
            <p className="text-center font-bold underline">H. Muhammad, S.Pd.I</p>
            <p className="text-center">NIP. 198001012005011003</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: landscape; margin: 5mm; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}

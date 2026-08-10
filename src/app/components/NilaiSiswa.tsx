import { useState, useMemo } from "react";
import { Search, ChevronDown, Upload, Download, Edit3, Save, X } from "lucide-react";
import { DataTable, Th } from "@/app/components/shared/DataTable";
import { dataMataPelajaran, type NilaiSiswa } from "@/data/nilai";
import { kelasOptions } from "@/data/constants";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { toast } from "sonner";
import { useAppContext } from "@/context/AppContext";

export function NilaiSiswaComponent() {
  const { nilaiList, bulkUpdateNilai, siswaList } = useAppContext();
  const [mapelFilter, setMapelFilter] = useState(dataMataPelajaran[3].id); // Default to Matematika
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [search, setSearch] = useState("");
  
  // State for manual input mode
  const [isEditing, setIsEditing] = useState(false);
  const [editableGrades, setEditableGrades] = useState<Record<string, Partial<NilaiSiswa>>>({});

  // Calculate filtered rows based on ALL students in siswaList
  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    
    // First, filter students based on search and class filter
    const matchedSiswa = siswaList.filter(s => {
      const matchSearch = !q || s.nama.toLowerCase().includes(q) || s.nisn.includes(q);
      const matchKelas = kelasFilter === "Semua Kelas" || s.kelas === kelasFilter.replace("Kelas ", "");
      const matchAktif = s.status === "Aktif";
      return matchSearch && matchKelas && matchAktif;
    });

    // Then, for each student, find their grade for the active mapel, or create a blank one
    return matchedSiswa.map(s => {
      const existingGrade = nilaiList.find(n => n.siswaId === s.id.toString() && n.mapelId === mapelFilter);
      if (existingGrade) {
        return { ...existingGrade, namaSiswa: s.nama, nisn: s.nisn, kelas: s.kelas }; // ensure latest student info
      }
      return {
        id: `${s.id}_${mapelFilter}`,
        siswaId: s.id.toString(),
        namaSiswa: s.nama,
        nisn: s.nisn,
        kelas: s.kelas,
        mapelId: mapelFilter,
        nilaiTugas: 0,
        nilaiUts: 0,
        nilaiUas: 0,
        nilaiAkhir: 0,
        status: "Belum Tuntas"
      } as NilaiSiswa;
    });
  }, [search, mapelFilter, kelasFilter, nilaiList, siswaList]);

  const mapelAktif = dataMataPelajaran.find(m => m.id === mapelFilter);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit mode
      setEditableGrades({});
    } else {
      // Enter edit mode, initialize values
      const initial: Record<string, Partial<NilaiSiswa>> = {};
      filteredRows.forEach(r => {
        initial[r.id] = { ...r };
      });
      setEditableGrades(initial);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (Object.keys(editableGrades).length > 0) {
      bulkUpdateNilai(editableGrades);
    }
    toast.success("Nilai berhasil disimpan!");
    setIsEditing(false);
  };

  const handleGradeChange = (id: string, field: keyof NilaiSiswa, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setEditableGrades(prev => {
      const current = prev[id] || {};
      const updated = { ...current, [field]: numValue };
      
      // Auto calculate Nilai Akhir
      const tugas = updated.nilaiTugas || 0;
      const uts = updated.nilaiUts || 0;
      const uas = updated.nilaiUas || 0;
      const akhir = Math.round((tugas + uts + uas) / 3);
      
      updated.nilaiAkhir = akhir;
      updated.status = akhir >= (mapelAktif?.kkm || 75) ? "Tuntas" : "Belum Tuntas";
      
      return { ...prev, [id]: updated };
    });
  };

  const handleImportMock = () => {
    toast.success("Simulasi: File Excel berhasil diimport. Nilai diperbarui otomatis.");
  };

  const handleDownloadMock = () => {
    toast.info("Simulasi: Mengunduh Template_Nilai_Siswa.xlsx...");
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F9F4] animate-in fade-in duration-500">
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4 bg-white" style={{ borderBottom: "1px solid #E2E8DE" }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1C2517]">Nilai Siswa</h1>
            <p className="text-sm text-[#6B7769] mt-1">Kelola dan input nilai akademik siswa.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleDownloadMock}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-[#6B7769] hover:bg-[#F5F9F4] transition-colors"
              style={{ border: "1px solid #E2E8DE" }}
            >
              <Download size={16} />
              Template Excel
            </button>
            <button 
              onClick={handleImportMock}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-[#3B82F6] hover:bg-[#EFF6FF] transition-colors"
              style={{ border: "1px solid #BFDBFE" }}
            >
              <Upload size={16} />
              Import Excel
            </button>
            {!isEditing ? (
              <button 
                onClick={handleEditToggle}
                className="flex items-center gap-2 px-4 py-2 bg-[#3E8A2F] text-white rounded-lg text-sm font-semibold hover:bg-[#2F6B23] transition-colors shadow-sm"
              >
                <Edit3 size={16} />
                Edit Nilai
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#DC2626] rounded-lg text-sm font-semibold hover:bg-[#FEF2F2] transition-colors"
                  style={{ border: "1px solid #FECACA" }}
                >
                  <X size={16} />
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3E8A2F] text-white rounded-lg text-sm font-semibold hover:bg-[#2F6B23] transition-colors shadow-sm"
                >
                  <Save size={16} />
                  Simpan Nilai
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3A0]" size={16} />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F5F9F4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8A2F]/20"
              style={{ border: "1px solid #E2E8DE" }}
            />
          </div>

          <div className="relative">
            <select
              value={mapelFilter}
              onChange={(e) => setMapelFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white rounded-lg text-sm font-medium text-[#1C2517] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3E8A2F]/20"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {dataMataPelajaran.map(m => (
                <option key={m.id} value={m.id}>{m.nama}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white rounded-lg text-sm font-medium text-[#1C2517] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3E8A2F]/20"
              style={{ border: "1px solid #E2E8DE" }}
            >
              {kelasOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7769] pointer-events-none" size={16} />
          </div>
          
          <div className="ml-auto text-sm text-[#6B7769] font-medium hidden sm:block">
            KKM: <span className="text-[#1C2517] font-bold">{mapelAktif?.kkm || '-'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <DataTable>
          <thead>
            <tr>
              <Th>No</Th>
              <Th>Siswa</Th>
              <Th>Kelas</Th>
              <Th align="center">Tugas</Th>
              <Th align="center">UTS</Th>
              <Th align="center">UAS</Th>
              <Th align="center">Nilai Akhir</Th>
              <Th align="center">Status</Th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((r, i) => {
                const currentData = isEditing ? editableGrades[r.id] || r : r;
                return (
                  <tr key={r.id} className="hover:bg-[#F9FAF9] transition-colors border-b border-[#E2E8DE]">
                    <td className="px-4 py-3 text-sm text-[#6B7769]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-[#1C2517]">{r.namaSiswa}</div>
                      <div className="text-xs text-[#6B7769]">{r.nisn}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#374040]">
                      {r.kelas}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="w-16 px-2 py-1 text-center text-sm border border-[#E2E8DE] rounded"
                          value={currentData.nilaiTugas || ''} 
                          onChange={(e) => handleGradeChange(r.id, 'nilaiTugas', e.target.value)}
                        />
                      ) : (
                        <span className="text-sm font-semibold">{r.nilaiTugas}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="w-16 px-2 py-1 text-center text-sm border border-[#E2E8DE] rounded"
                          value={currentData.nilaiUts || ''} 
                          onChange={(e) => handleGradeChange(r.id, 'nilaiUts', e.target.value)}
                        />
                      ) : (
                        <span className="text-sm font-semibold">{r.nilaiUts}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="w-16 px-2 py-1 text-center text-sm border border-[#E2E8DE] rounded"
                          value={currentData.nilaiUas || ''} 
                          onChange={(e) => handleGradeChange(r.id, 'nilaiUas', e.target.value)}
                        />
                      ) : (
                        <span className="text-sm font-semibold">{r.nilaiUas}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-[#1C2517]">
                        {currentData.nilaiAkhir}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge 
                        status={currentData.status as any} 
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[#6B7769] text-sm">
                  Tidak ada data siswa atau nilai untuk filter tersebut.
                </td>
              </tr>
            )}
          </tbody>
        </DataTable>
      </div>
    </div>
  );
}

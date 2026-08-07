const fs = require('fs');

let content = fs.readFileSync('src/app/components/Pembayaran.tsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Remove mock data and import
content = content.replace(
  /\/\/ ─── static data ───[\s\S]*?\/\/ Total: 3\.500\.000 = student\.sisa\n\];/m,
  `import {
  pembayaranStudent as student,
  pembayaranSearchResults as searchResults,
  pembayaranTagihanList as tagihanList,
} from "@/data/pembayaran";`
);

// 2. Change state
content = content.replace(
  `const [query, setQuery] = useState("Ahmad Fadhilah Putra");`,
  `const [query, setQuery] = useState("");`
);
content = content.replace(
  `const [dropdownOpen, setDropdownOpen] = useState(false);`,
  `const [dropdownOpen, setDropdownOpen] = useState(false);\n  const [selectedStudent, setSelectedStudent] = useState<any>(null);`
);
content = content.replace(
  `const [nominal, setNominal] = useState(400_000);`,
  `const [nominal, setNominal] = useState(0);`
);

// 3. Change alokasi and sisaSetelah
content = content.replace(
  `const alokasi = computeAlokasi(nominal);\n  const sisaSetelah = Math.max(0, student.sisa - nominal);`,
  `const alokasi = selectedStudent ? computeAlokasi(nominal) : [];\n  const sisaSetelah = selectedStudent ? Math.max(0, selectedStudent.sisa - nominal) : 0;`
);

// 4. Remove autoFocus
content = content.replace(
  `placeholder="Ketik nama atau NIS siswa..."\n                  autoFocus\n                />`,
  `placeholder="Ketik nama atau NIS siswa..."\n                />`
);

// 5. Update setQuery in list
content = content.replace(
  `setQuery(s.nama);\n                        setDropdownOpen(false);`,
  `setQuery(s.nama);\n                        setSelectedStudent(student);\n                        setNominal(400_000);\n                        setDropdownOpen(false);`
);

// Wrap Section 2 and 3
content = content.replace(
  `          {/* 2 · Student context card + bill table */}
          <div
            className="bg-white rounded-xl p-6 space-y-5"
            style={{ border: "1px solid #E2E8DE" }}
          >`,
  `          {/* 2 · Student context card + bill table */}
          {selectedStudent ? (
            <>
            <div
              className="bg-white rounded-xl p-6 space-y-5"
              style={{ border: "1px solid #E2E8DE" }}
            >`
);

content = content.replace(
  `              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — sticky ── */}`,
  `              </div>
            </div>
          </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-10 flex flex-col items-center justify-center text-center" style={{ border: "1px solid #E2E8DE", minHeight: "300px" }}>
              <div className="w-16 h-16 rounded-full bg-[#F5F9F4] flex items-center justify-center mb-4">
                <Search size={28} className="text-[#9CA3A0]" />
              </div>
              <p className="text-[#374040] font-semibold text-lg mb-1">Belum ada siswa terpilih</p>
              <p className="text-[#6B7769] text-sm">Gunakan kolom pencarian di atas untuk menemukan siswa dan melihat rincian tagihannya.</p>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — sticky ── */}`
);

const parts = content.split('export function Pembayaran() {');
if (parts.length > 1) {
  let p2 = parts[1];
  p2 = p2.replace(/student\.nama/g, "selectedStudent.nama");
  p2 = p2.replace(/student\.kelas/g, "selectedStudent.kelas");
  p2 = p2.replace(/student\.nis/g, "selectedStudent.nis");
  p2 = p2.replace(/student\.wali/g, "selectedStudent.wali");
  p2 = p2.replace(/student\.telp/g, "selectedStudent.telp");
  p2 = p2.replace(/student\.totalTagihan/g, "selectedStudent.totalTagihan");
  p2 = p2.replace(/student\.dibayar/g, "selectedStudent.dibayar");
  p2 = p2.replace(/student\.sisa/g, "selectedStudent.sisa");
  p2 = p2.replace(/AF<\/div>/, "{selectedStudent.inits}</div>");

  p2 = p2.replace(
    `        {/* ── RIGHT COLUMN — sticky ── */}
        <div className="sticky top-6 self-start">
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>`,
    `        {/* ── RIGHT COLUMN — sticky ── */}
        <div className="sticky top-6 self-start">
          {selectedStudent && (
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #E2E8DE" }}>`
  );

  p2 = p2.replace(
    `            </div>
          </div>
        </div>
      </div>`,
    `            </div>
          </div>
          )}
        </div>
      </div>`
  );

  content = parts[0] + 'export function Pembayaran() {' + p2;
}

// Convert back to CRLF if needed, but saving as LF is fine.
fs.writeFileSync('src/app/components/Pembayaran.tsx', content);
console.log("Done");

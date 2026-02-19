# 📋 PRD: Website Publik & Portal PPDB MTs Al-Ittihad

**Document Version:** 1.0  
**Last Updated:** 5 Januari 2026  
**Product Owner:** MTs Al-Ittihad Pedaleman  
**Tech Stack:** Next.js 14 (App Router + ISR), TypeScript, Prisma, SQLite, Material-UI

---

## 🎯 1. EXECUTIVE SUMMARY

### 1.1 Tujuan Proyek

Membangun website publik untuk MTs Al-Ittihad Pedaleman dengan:

1. **Informasi umum sekolah** untuk publik (SEO-friendly)
2. **Sistem PPDB online** (Penerimaan Peserta Didik Baru)
3. **Portal Wali Murid & Siswa** untuk akses informasi pribadi
4. **CMS Admin Panel** terintegrasi dengan dashboard existing

### 1.2 Target Pengguna

- **Calon siswa & orang tua** (PPDB)
- **Wali murid siswa aktif** (cek tagihan SPP, nilai)
- **Siswa aktif** (informasi akademik)
- **Masyarakat umum** (informasi sekolah)
- **Admin sekolah** (kelola konten website)

### 1.3 Success Metrics

- 90% pendaftar PPDB menggunakan sistem online
- Pengurangan 70% pertanyaan manual terkait tagihan SPP
- Website dapat diakses 24/7 dengan uptime >99%
- Lighthouse SEO Score >90

---

## 🏗️ 2. SISTEM ARSITEKTUR

### 2.1 EXISTING SYSTEM (DO NOT MODIFY) ✋

```
src/app/[lang]/(dashboard)/(private)/     ← Admin Dashboard (PROTECTED)
├── akademik/                             ← Data akademik
├── keuangan/                             ← Keuangan sekolah
├── spp/                                  ← Manajemen SPP
├── rab/                                  ← Anggaran BOS
└── laporan/                              ← Laporan internal

EXISTING DATABASE SCHEMA (DO NOT MODIFY):
├── Student                               ← Data siswa
├── Teacher                               ← Data guru
├── SPPPayment                            ← Pembayaran SPP
├── SPPRate                               ← Tarif SPP
├── Transaction                           ← Transaksi keuangan
├── Account                               ← Akun kas/bank
└── ActivityLog                           ← Audit log
```

### 2.2 NEW STRUCTURE (TO BE CREATED) 🆕

```
PUBLIC WEBSITE:
src/app/front-pages/                      ← Public pages
├── page.tsx                              ← ✅ Homepage (modify existing)
├── layout.tsx                            ← ✅ Public layout (exists)
├── sitemap.ts                            ← 🆕 Auto-generate sitemap
├── robots.ts                             ← 🆕 SEO robots.txt
│
├── tentang/
│   └── page.tsx                          ← 🆕 About school (SSG)
├── visi-misi/
│   └── page.tsx                          ← 🆕 Vision & Mission (SSG)
├── fasilitas/
│   └── page.tsx                          ← 🆕 Facilities (ISR: 24h)
├── berita/
│   ├── page.tsx                          ← 🆕 News list (ISR: 5min)
│   └── [slug]/page.tsx                   ← 🆕 News detail (ISR: 5min)
├── kontak/
│   └── page.tsx                          ← 🆕 Contact (SSG)
│
├── ppdb/                                 ← 🆕 PPDB Module
│   ├── page.tsx                          ← Info & registration (ISR: 1h)
│   ├── daftar/page.tsx                   ← Registration form (CSR)
│   ├── cek-status/page.tsx               ← Check status (CSR)
│   └── panduan/page.tsx                  ← Guidelines (SSG)
│
└── portal/                               ← 🆕 Parent/Student Portal
    ├── login/page.tsx                    ← Login page (CSR)
    ├── wali-murid/
    │   ├── page.tsx                      ← Parent dashboard
    │   ├── tagihan/page.tsx              ← SPP bills
    │   ├── riwayat/page.tsx              ← Payment history
    │   └── profil/page.tsx               ← Student profile
    └── siswa/
        ├── page.tsx                      ← Student dashboard
        ├── jadwal/page.tsx               ← Schedule
        └── profil/page.tsx               ← Profile

CMS ADMIN PANEL (INTEGRATED):
src/app/[lang]/(dashboard)/(private)/cms/ ← 🆕 CMS Module
├── berita/
│   ├── page.tsx                          ← List articles
│   ├── tambah/page.tsx                   ← Create article
│   └── [id]/edit/page.tsx                ← Edit article
├── info-sekolah/
│   ├── page.tsx                          ← List info pages
│   └── [key]/edit/page.tsx               ← Edit info
├── fasilitas/
│   ├── page.tsx                          ← List facilities
│   └── tambah/page.tsx                   ← Add facility
├── ppdb/
│   ├── pendaftar/page.tsx                ← List applicants
│   ├── pendaftar/[id]/page.tsx           ← Detail & verify
│   └── pengaturan/page.tsx               ← PPDB settings
└── portal-users/
    └── page.tsx                          ← Manage portal users

NEW DATABASE MODELS (APPEND TO schema.prisma):
├── PPDBApplication                       ← 🆕 Pendaftaran PPDB
├── PortalUser                            ← 🆕 User portal (wali/siswa)
├── NewsArticle                           ← 🆕 Berita & pengumuman
├── SchoolInfo                            ← 🆕 Info sekolah (CMS)
├── Facility                              ← 🆕 Fasilitas sekolah
└── PPDBSettings                          ← 🆕 Pengaturan PPDB

NEW API ROUTES:
src/app/api/public/                       ← 🆕 Public APIs
├── ppdb/route.ts                         ← POST: submit, GET: list
├── ppdb/[noPendaftaran]/route.ts         ← GET: check status
├── portal/auth/route.ts                  ← POST: login portal
├── portal/spp/route.ts                   ← GET: tagihan SPP
├── news/route.ts                         ← GET: list articles
└── news/[slug]/route.ts                  ← GET: article detail

src/app/api/admin/                        ← 🆕 Admin APIs
├── revalidate/route.ts                   ← POST: trigger ISR
├── news/route.ts                         ← CRUD articles
├── schoolinfo/route.ts                   ← CRUD school info
└── facilities/route.ts                   ← CRUD facilities
```

---

## 📐 3. BUSINESS RULES & CONSTRAINTS

### 3.1 HARD CONSTRAINTS (TIDAK BOLEH DILANGGAR) 🚫

1. **Database Existing Models**
   - ❌ JANGAN modify schema: `Student`, `Teacher`, `SPPPayment`, `SPPRate`, `Transaction`, `Account`, `ActivityLog`
   - ❌ JANGAN hapus/ubah field yang sudah ada
   - ✅ BOLEH tambah model baru
   - ✅ BOLEH tambah relation ke model existing (hati-hati!)

2. **Admin Dashboard**
   - ❌ JANGAN ubah routing di `(dashboard)/(private)/`
   - ❌ JANGAN ubah authentication flow existing (NextAuth)
   - ❌ JANGAN modify `AuthGuard` component
   - ✅ BOLEH tambah menu baru di sidebar untuk CMS

3. **Teknologi Stack**
   - ❌ JANGAN ganti framework (tetap Next.js 14)
   - ❌ JANGAN ganti database (tetap SQLite + Prisma)
   - ❌ JANGAN ganti UI library (tetap Material-UI)
   - ✅ BOLEH tambah package npm jika BENAR-BENAR perlu

4. **Authentication**
   - Admin dashboard = NextAuth (existing) - JANGAN UBAH
   - Portal wali/siswa = Custom auth (NIS + password) - SISTEM BARU
   - ❌ JANGAN campur session admin dengan portal user

### 3.2 RENDERING STRATEGY (ISR for SEO) ⚡

```typescript
// TIER 1: STATIC (SSG) - Jarang berubah
// Pages: Tentang, Visi-Misi, Kontak, Panduan PPDB
export default async function AboutPage() {
  const data = await prisma.schoolInfo.findUnique({ where: { key: 'tentang' }})
  return <AboutView data={data} />
}
// No revalidate = Pure static, rebuild manual

// TIER 2: ISR Short (5 menit) - Sering berubah
// Pages: Berita, Pengumuman
export const revalidate = 300 // 5 minutes
export default async function NewsPage() {
  const news = await prisma.newsArticle.findMany()
  return <NewsList news={news} />
}

// TIER 3: ISR Long (1 jam - 1 hari) - Moderate
// Pages: PPDB Info, Fasilitas, Homepage
export const revalidate = 3600 // 1 hour
export default async function PPDBInfoPage() {
  const settings = await prisma.pPDBSettings.findFirst()
  return <PPDBInfo data={settings} />
}

// TIER 4: CSR - Interactive
// Pages: Forms, Portal Login, Cek Status
'use client'
export default function PPDBFormPage() {
  return <PPDBForm />
}
```

---

## 🗄️ 4. DATABASE SCHEMA (NEW MODELS)

```prisma
// ==================== APPEND TO prisma/schema.prisma ====================

// PPDB (Penerimaan Peserta Didik Baru)
model PPDBApplication {
  id                String   @id @default(cuid())
  noPendaftaran     String   @unique

  // Identitas Calon Siswa
  namaLengkap       String
  namaPanggilan     String?
  jenisKelamin      String               // 'L' or 'P'
  tempatLahir       String
  tanggalLahir      String              // Format: YYYY-MM-DD
  agama             String
  anakKe            Int
  jumlahSaudara     Int

  // Alamat
  alamat            String
  rt                String?
  rw                String?
  kelurahan         String
  kecamatan         String
  kabupaten         String
  provinsi          String
  kodePos           String?

  // Sekolah Asal
  asalSekolah       String
  nsnSekolahAsal    String?
  alamatSekolah     String?

  // Data Orang Tua / Wali
  namaAyah          String
  pekerjaanAyah     String?
  pendidikanAyah    String?
  penghasilanAyah   String?
  namaIbu           String
  pekerjaanIbu      String?
  pendidikanIbu     String?
  penghasilanIbu    String?
  namaWali          String?
  pekerjaanWali     String?
  hubunganWali      String?

  // Kontak
  noHpOrtu          String
  email             String?

  // Dokumen Upload
  dokumenKK         String?
  dokumenAkteLahir  String?
  dokumenIjazah     String?
  fotoSiswa         String?

  // Status & Metadata
  status            String   @default("Pending")
  statusVerifikasi  String   @default("Belum")
  catatanAdmin      String?
  tahunAjaran       String
  jalurPendaftaran  String   @default("Reguler")

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  verifiedAt        DateTime?
  acceptedAt        DateTime?

  @@index([noPendaftaran])
  @@index([status])
  @@index([tahunAjaran])
}

// Portal User (Wali Murid & Siswa)
model PortalUser {
  id                 String   @id @default(cuid())
  username           String   @unique
  password           String
  nama               String
  role               String
  siswaId            String?
  email              String?
  noHp               String?
  isActive           Boolean  @default(true)
  mustChangePassword Boolean  @default(true)
  lastLogin          DateTime?
  loginAttempts      Int      @default(0)
  lockedUntil        DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([username])
  @@index([siswaId])
}

// News & Announcements
model NewsArticle {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  excerpt     String?
  content     String
  coverImage  String?
  category    String   @default("Umum")
  author      String
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([category])
  @@index([isPublished])
}

// School Information (CMS)
model SchoolInfo {
  id        String   @id @default(cuid())
  key       String   @unique
  title     String
  content   String
  category  String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([key])
}

// Facilities
model Facility {
  id        String   @id @default(cuid())
  nama      String
  deskripsi String
  kategori  String
  kapasitas Int?
  kondisi   String   @default("Baik")
  foto      String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([kategori])
}

// PPDB Settings
model PPDBSettings {
  id                String   @id @default(cuid())
  tahunAjaran       String   @unique
  tanggalMulai      String
  tanggalAkhir      String
  quotaTotal        Int
  quotaRegular      Int
  quotaPrestasi     Int
  quotaKhusus       Int
  isOpen            Boolean  @default(false)
  biayaPendaftaran  Float?
  pengumuman        String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([tahunAjaran])
}
```

---

## 🔐 5. SECURITY REQUIREMENTS

### 5.1 Authentication

```typescript
// ADMIN AUTH (Existing - NextAuth)
- Login: /login
- Session: NextAuth
- Guards: AuthGuard component
- JANGAN DIUBAH!

// PORTAL AUTH (New - Custom)
- Login: /front-pages/portal/login
- Method: JWT in httpOnly cookie
- Username: NIS (siswa) or NIS-ortu (parent)
- Default Password: DDMMYYYY (tanggal lahir)
- Must change password on first login

// API AUTHORIZATION
GET  /api/public/*           ← Public (rate limited)
POST /api/public/ppdb        ← Public + CAPTCHA
GET  /api/public/portal/*    ← Portal auth required
POST /api/admin/*            ← Admin auth required (NextAuth)
```

### 5.2 Data Privacy

```typescript
// Portal users can ONLY access their own data
// Middleware check: siswaId === token.siswaId

// Sensitive data NOT exposed to portal:
- Other students' data
- Financial data (school level)
- Teacher salaries
- Admin credentials
```

---

## 📱 6. UI/UX GUIDELINES

### 6.1 Design System (USE EXISTING)

```typescript
// Components from existing:
import { Button, Card, TextField } from '@mui/material'
import CustomTextField from '@core/components/mui/TextField'
import CustomCard from '@core/components/mui/Card'

// Colors (dari theme):
primary:   '#696CFF'
secondary: '#8592A3'
success:   '#71DD37'
error:     '#FF4C51'
warning:   '#FFB400'

// Typography:
font-family: 'Inter', sans-serif
```

### 6.2 Responsive Breakpoints

```css
Mobile:  < 768px   (80% users - PRIORITY)
Tablet:  768-1024px
Desktop: > 1024px
```

---

## 🚀 7. IMPLEMENTATION PHASES

### Phase 1: Foundation & Database ✅

- [x] Create PRD
- [ ] Update database schema
- [ ] Run migration
- [ ] Create API structure

### Phase 2: CMS Admin Panel (Week 1-2) 🔥

- [ ] Berita: List, Create, Edit, Delete
- [ ] Info Sekolah: Edit pages
- [ ] Fasilitas: List, Create, Edit
- [ ] Revalidation API
- [ ] Upload image handling

### Phase 3: PPDB Module (Week 2-3)

- [ ] PPDB public pages (info, form, check status)
- [ ] PPDB admin panel (list, verify, manage)
- [ ] File upload handling
- [ ] Generate nomor pendaftaran

### Phase 4: Portal Wali Murid (Week 3-4)

- [ ] Portal authentication
- [ ] Parent dashboard
- [ ] SPP balance & history
- [ ] Download payment receipt

### Phase 5: Public Website (Week 4-5)

- [ ] Homepage (modify existing landing page)
- [ ] Static pages (tentang, visi-misi, kontak)
- [ ] News list & detail pages
- [ ] SEO optimization (sitemap, robots.txt, metadata)

### Phase 6: Testing & Launch (Week 5-6)

- [ ] Performance testing
- [ ] Security audit
- [ ] SEO validation
- [ ] User acceptance testing
- [ ] Production deployment

---

## ⚠️ 8. AI/COPILOT INSTRUCTIONS

**Ketika AI akan implement feature baru:**

1. **BACA** section 3.1 (HARD CONSTRAINTS)
2. **VALIDASI**:
   - ❌ Akan modify existing models? → STOP, TANYA
   - ❌ Akan ubah routing dashboard? → STOP, TANYA
   - ❌ Akan modify NextAuth? → STOP, TANYA
3. **KONFIRMASI** jika ada keraguan
4. **IMPLEMENT** sesuai struktur section 2.2

**Default Response Template:**

```
Saya akan implement [FEATURE]:

✅ Files yang akan dibuat:
- [list]

⚠️ Files yang akan dimodify:
- [list + reason]

🔍 Impact:
- Database: [Yes/No]
- Existing features: [Affected/Not]

Lanjutkan?
```

---

## ✅ 9. ACCEPTANCE CRITERIA

**CMS Module:**

- [ ] Admin bisa create/edit/delete berita
- [ ] Admin bisa upload gambar
- [ ] Admin bisa edit info sekolah
- [ ] Changes auto-update website (ISR)

**PPDB:**

- [ ] User bisa mendaftar online
- [ ] Generate nomor pendaftaran unik
- [ ] User bisa cek status
- [ ] Admin bisa verifikasi & manage

**Portal:**

- [ ] Wali murid bisa login
- [ ] Lihat tagihan SPP real-time
- [ ] Unduh bukti pembayaran

**Technical:**

- [ ] No breaking changes
- [ ] Migration sukses
- [ ] Lighthouse SEO > 90
- [ ] Page load < 3s

---

**END OF PRD**

**Document Signature:**  
Created: 5 Januari 2026  
Version: 1.0  
Status: APPROVED ✅

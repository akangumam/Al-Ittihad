-- CreateTable
CREATE TABLE "PPDBApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noPendaftaran" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "namaPanggilan" TEXT,
    "jenisKelamin" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" TEXT NOT NULL,
    "agama" TEXT NOT NULL,
    "anakKe" INTEGER NOT NULL,
    "jumlahSaudara" INTEGER NOT NULL,
    "alamat" TEXT NOT NULL,
    "rt" TEXT,
    "rw" TEXT,
    "kelurahan" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kabupaten" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kodePos" TEXT,
    "asalSekolah" TEXT NOT NULL,
    "nsnSekolahAsal" TEXT,
    "alamatSekolah" TEXT,
    "namaAyah" TEXT NOT NULL,
    "pekerjaanAyah" TEXT,
    "pendidikanAyah" TEXT,
    "penghasilanAyah" TEXT,
    "namaIbu" TEXT NOT NULL,
    "pekerjaanIbu" TEXT,
    "pendidikanIbu" TEXT,
    "penghasilanIbu" TEXT,
    "namaWali" TEXT,
    "pekerjaanWali" TEXT,
    "hubunganWali" TEXT,
    "noHpOrtu" TEXT NOT NULL,
    "email" TEXT,
    "dokumenKK" TEXT,
    "dokumenAkteLahir" TEXT,
    "dokumenIjazah" TEXT,
    "fotoSiswa" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "statusVerifikasi" TEXT NOT NULL DEFAULT 'Belum',
    "catatanAdmin" TEXT,
    "tahunAjaran" TEXT NOT NULL,
    "jalurPendaftaran" TEXT NOT NULL DEFAULT 'Reguler',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "verifiedAt" DATETIME,
    "acceptedAt" DATETIME
);

-- CreateTable
CREATE TABLE "PortalUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "siswaId" TEXT,
    "email" TEXT,
    "noHp" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Umum',
    "author" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SchoolInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "kapasitas" INTEGER,
    "kondisi" TEXT NOT NULL DEFAULT 'Baik',
    "foto" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PPDBSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tahunAjaran" TEXT NOT NULL,
    "tanggalMulai" TEXT NOT NULL,
    "tanggalAkhir" TEXT NOT NULL,
    "quotaTotal" INTEGER NOT NULL,
    "quotaRegular" INTEGER NOT NULL,
    "quotaPrestasi" INTEGER NOT NULL,
    "quotaKhusus" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "biayaPendaftaran" REAL,
    "pengumuman" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AcademicYear" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "semester" TEXT NOT NULL DEFAULT 'Ganjil',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AcademicYear" ("createdAt", "endDate", "id", "isActive", "name", "startDate", "updatedAt") SELECT "createdAt", "endDate", "id", "isActive", "name", "startDate", "updatedAt" FROM "AcademicYear";
DROP TABLE "AcademicYear";
ALTER TABLE "new_AcademicYear" RENAME TO "AcademicYear";
CREATE UNIQUE INDEX "AcademicYear_name_key" ON "AcademicYear"("name");
CREATE TABLE "new_SPPPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentDate" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Lunas',
    "attachment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SPPPayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SPPPayment_account_fkey" FOREIGN KEY ("account") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SPPPayment" ("account", "amount", "createdAt", "id", "month", "paymentDate", "paymentMethod", "receiptNo", "studentId", "studentName", "updatedAt", "year") SELECT "account", "amount", "createdAt", "id", "month", "paymentDate", "paymentMethod", "receiptNo", "studentId", "studentName", "updatedAt", "year" FROM "SPPPayment";
DROP TABLE "SPPPayment";
ALTER TABLE "new_SPPPayment" RENAME TO "SPPPayment";
CREATE UNIQUE INDEX "SPPPayment_receiptNo_key" ON "SPPPayment"("receiptNo");
CREATE INDEX "SPPPayment_studentId_idx" ON "SPPPayment"("studentId");
CREATE INDEX "SPPPayment_paymentDate_idx" ON "SPPPayment"("paymentDate");
CREATE UNIQUE INDEX "SPPPayment_studentId_month_year_key" ON "SPPPayment"("studentId", "month", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PPDBApplication_noPendaftaran_key" ON "PPDBApplication"("noPendaftaran");

-- CreateIndex
CREATE INDEX "PPDBApplication_noPendaftaran_idx" ON "PPDBApplication"("noPendaftaran");

-- CreateIndex
CREATE INDEX "PPDBApplication_status_idx" ON "PPDBApplication"("status");

-- CreateIndex
CREATE INDEX "PPDBApplication_tahunAjaran_idx" ON "PPDBApplication"("tahunAjaran");

-- CreateIndex
CREATE INDEX "PPDBApplication_createdAt_idx" ON "PPDBApplication"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_username_key" ON "PortalUser"("username");

-- CreateIndex
CREATE INDEX "PortalUser_username_idx" ON "PortalUser"("username");

-- CreateIndex
CREATE INDEX "PortalUser_siswaId_idx" ON "PortalUser"("siswaId");

-- CreateIndex
CREATE INDEX "PortalUser_role_idx" ON "PortalUser"("role");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_slug_idx" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_category_idx" ON "NewsArticle"("category");

-- CreateIndex
CREATE INDEX "NewsArticle_isPublished_idx" ON "NewsArticle"("isPublished");

-- CreateIndex
CREATE INDEX "NewsArticle_publishedAt_idx" ON "NewsArticle"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolInfo_key_key" ON "SchoolInfo"("key");

-- CreateIndex
CREATE INDEX "SchoolInfo_key_idx" ON "SchoolInfo"("key");

-- CreateIndex
CREATE INDEX "SchoolInfo_category_idx" ON "SchoolInfo"("category");

-- CreateIndex
CREATE INDEX "Facility_kategori_idx" ON "Facility"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "PPDBSettings_tahunAjaran_key" ON "PPDBSettings"("tahunAjaran");

-- CreateIndex
CREATE INDEX "PPDBSettings_tahunAjaran_idx" ON "PPDBSettings"("tahunAjaran");

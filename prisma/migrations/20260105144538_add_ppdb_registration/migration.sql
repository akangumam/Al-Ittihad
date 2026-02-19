-- CreateTable
CREATE TABLE "PPDBRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationNumber" TEXT NOT NULL,
    "jalur" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" TEXT NOT NULL,
    "alamatRumah" TEXT NOT NULL,
    "desa" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "noKartuKeluarga" TEXT NOT NULL,
    "namaAyah" TEXT NOT NULL,
    "nikAyah" TEXT NOT NULL,
    "tempatLahirAyah" TEXT NOT NULL,
    "tanggalLahirAyah" TEXT NOT NULL,
    "pekerjaanAyah" TEXT NOT NULL,
    "penghasilanAyah" TEXT NOT NULL,
    "namaIbu" TEXT NOT NULL,
    "nikIbu" TEXT NOT NULL,
    "tempatLahirIbu" TEXT NOT NULL,
    "tanggalLahirIbu" TEXT NOT NULL,
    "pekerjaanIbu" TEXT NOT NULL,
    "penghasilanIbu" TEXT NOT NULL,
    "alamatOrangTua" TEXT NOT NULL,
    "noWhatsApp" TEXT NOT NULL,
    "email" TEXT,
    "namaSekolah" TEXT NOT NULL,
    "statusSekolah" TEXT NOT NULL,
    "nsmNss" TEXT,
    "npsn" TEXT,
    "alamatSekolah" TEXT NOT NULL,
    "kartuKeluarga" TEXT,
    "ijazah" TEXT,
    "skhun" TEXT,
    "pasFoto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "reviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PPDBRegistration_registrationNumber_key" ON "PPDBRegistration"("registrationNumber");

-- CreateIndex
CREATE INDEX "PPDBRegistration_jalur_idx" ON "PPDBRegistration"("jalur");

-- CreateIndex
CREATE INDEX "PPDBRegistration_status_idx" ON "PPDBRegistration"("status");

-- CreateIndex
CREATE INDEX "PPDBRegistration_createdAt_idx" ON "PPDBRegistration"("createdAt");

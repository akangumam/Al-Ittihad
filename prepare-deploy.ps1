
$deployDir = "deploy_alittihad"

# 1. Bersihkan folder deploy lama jika ada
if (Test-Path $deployDir) {
    Write-Host "Membersihkan folder lama..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $deployDir
}

# 2. Buat folder baru
New-Item -ItemType Directory -Path $deployDir | Out-Null
New-Item -ItemType Directory -Path "$deployDir/.next" | Out-Null

Write-Host "Menyiapkan file untuk hosting..." -ForegroundColor Cyan

# 3. Copy file dari standalone
if (Test-Path ".next/standalone") {
    Copy-Item -Path ".next/standalone/*" -Destination $deployDir -Recurse -Force
    Write-Host "[OK] File Standalone berhasil disiapkan." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Folder .next/standalone tidak ditemukan. Pastikan sudah menjalankan 'npm run build'." -ForegroundColor Red
    exit
}

# 4. Copy folder public
if (Test-Path "public") {
    Copy-Item -Path "public" -Destination "$deployDir/public" -Recurse -Force
    Write-Host "[OK] Folder Public berhasil disiapkan." -ForegroundColor Green
}

# 5. Copy .next/static
if (Test-Path ".next/static") {
    Copy-Item -Path ".next/static" -Destination "$deployDir/.next/static" -Recurse -Force
    Write-Host "[OK] Folder Static berhasil disiapkan." -ForegroundColor Green
}

Write-Host "`nSELESAI!" -ForegroundColor Yellow
Write-Host "Folder '$deployDir' sudah siap. Silakan klik kanan folder tersebut lalu pilih 'Compress to ZIP file'." -ForegroundColor White
Write-Host "File ZIP itulah yang di-upload ke hosting." -ForegroundColor White

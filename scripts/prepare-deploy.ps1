# ============================================================
# Script Persiapan Deploy ke cPanel (DomaiNesia)
# Jalankan: .\scripts\prepare-deploy.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DeployDir   = Join-Path $ProjectRoot "deploy_alittihad"
$NextDir     = Join-Path $ProjectRoot ".next"

Write-Host ""
Write-Host "=== Al-Ittihad Deploy Preparation ===" -ForegroundColor Cyan
Write-Host ""

# ----- 1. Build -----
Write-Host "[1/4] Building Next.js application..." -ForegroundColor Yellow
Set-Location $ProjectRoot
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build FAILED. Cek error di atas." -ForegroundColor Red
    exit 1
}
Write-Host "Build selesai." -ForegroundColor Green

# ----- 2. Update server.js & node_modules dari standalone -----
Write-Host ""
Write-Host "[2/4] Mengupdate server.js dan node_modules..." -ForegroundColor Yellow

$StandaloneDir = Join-Path $NextDir "standalone"

Copy-Item (Join-Path $StandaloneDir "server.js") `
          (Join-Path $DeployDir "server.js") -Force

Remove-Item (Join-Path $DeployDir "node_modules") -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $StandaloneDir "node_modules") `
          (Join-Path $DeployDir "node_modules") -Recurse -Force

Write-Host "server.js dan node_modules diperbarui." -ForegroundColor Green

# ----- 3. Salin folder .next (tanpa cache) -----
Write-Host ""
Write-Host "[3/4] Menyalin folder .next ke deploy_alittihad..." -ForegroundColor Yellow

$DeployNext = Join-Path $DeployDir ".next"
Remove-Item $DeployNext -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $DeployNext | Out-Null

# Salin subfolder yang dibutuhkan
foreach ($folder in @("server", "static")) {
    $src = Join-Path $NextDir $folder
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $DeployNext $folder) -Recurse -Force
    }
}

# Salin file-file .next di root (bukan folder)
Get-ChildItem $NextDir -File | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $DeployNext $_.Name) -Force
}

Write-Host "Folder .next disalin." -ForegroundColor Green

# ----- 4. Salin prisma schema (untuk migrate di server) -----
Write-Host ""
Write-Host "[4/4] Menyalin prisma schema..." -ForegroundColor Yellow

$DeployPrisma = Join-Path $DeployDir "prisma"
New-Item -ItemType Directory -Path $DeployPrisma -Force | Out-Null
Copy-Item (Join-Path $ProjectRoot "prisma\schema.prisma") `
          (Join-Path $DeployPrisma "schema.prisma") -Force

# Salin migrations jika ada
$MigrationsDir = Join-Path $ProjectRoot "prisma\migrations"
if (Test-Path $MigrationsDir) {
    Copy-Item $MigrationsDir (Join-Path $DeployPrisma "migrations") -Recurse -Force
}

Write-Host "Prisma schema disalin." -ForegroundColor Green

# ----- Selesai -----
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Deploy package SIAP di: deploy_alittihad/" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor White
Write-Host "  1. Pastikan deploy_alittihad\.env sudah benar (DB host, NEXTAUTH_URL)"
Write-Host "  2. ZIP seluruh isi folder deploy_alittihad/"
Write-Host "  3. Upload & ekstrak di File Manager cPanel"
Write-Host "  4. Setup Node.js App di cPanel (startup file: server.js)"
Write-Host "  5. Di terminal cPanel, jalankan: npx prisma migrate deploy"
Write-Host ""

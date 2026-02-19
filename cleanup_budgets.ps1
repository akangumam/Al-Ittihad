# Script untuk membersihkan data Budget dari database
# Jalankan dengan: .\cleanup_budgets.ps1

Write-Host "=== Cleanup Budget Data ===" -ForegroundColor Cyan
Write-Host ""

# Konfirmasi
$confirm = Read-Host "Apakah Anda yakin ingin menghapus semua data Budget? (y/n)"

if ($confirm -ne "y") {
    Write-Host "Dibatalkan." -ForegroundColor Yellow
    exit
}

Write-Host "Menghapus data Budget..." -ForegroundColor Yellow

# Panggil API untuk menghapus semua budget
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/budgets/cleanup" -Method DELETE
    Write-Host "✓ Data Budget berhasil dihapus" -ForegroundColor Green
    Write-Host $response.message -ForegroundColor Green
} catch {
    Write-Host "✗ Gagal menghapus data Budget" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Selesai!" -ForegroundColor Cyan

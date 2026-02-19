# Clean Code - cSpell Configuration

## Status: ❌ DISABLED

cSpell telah **dinonaktifkan untuk proyek ini** untuk menghindari warning yang mengganggu pada kata-kata bahasa Indonesia.

## Konfigurasi

Di file `.vscode/settings.json`:

```json
"cSpell.enabled": false
```

## Alasan

- Proyek menggunakan bahasa Indonesia secara ekstensif
- Warning cSpell (125+ items) mengganggu fokus development
- Error yang sebenarnya (TypeScript, ESLint) lebih penting untuk difokuskan

## Cara Mengaktifkan Kembali

Jika ingin mengaktifkan cSpell lagi:

1. Buka `.vscode/settings.json`
2. Ubah `"cSpell.enabled": false` menjadi `"cSpell.enabled": true`
3. Atau hapus baris tersebut
4. Reload VS Code window

## Alternative

Jika ingin spell checking, pertimbangkan:

- Install extension spell checker yang support bahasa Indonesia
- Atau gunakan online grammar/spell checker saat review final code

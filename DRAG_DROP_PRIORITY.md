# Fitur Drag & Drop untuk Prioritas Komponen Biaya

## Implementasi Selesai ✅

Fitur drag and drop untuk mengurutkan komponen biaya telah berhasil diimplementasikan menggunakan **@dnd-kit**.

## Cara Menggunakan

### Di Halaman Template Biaya:

1. Buka menu **Biaya Sekolah** → **Template Biaya**
2. Klik tombol **"Edit"** pada template yang ingin diubah, atau **"Tambah Template"** untuk membuat baru
3. Di bagian **Komponen Biaya**, Anda akan melihat:
   - Icon **drag handle** (☰) di sebelah kiri setiap baris komponen
   - Field **Prioritas** yang menampilkan urutan otomatis (1, 2, 3, dst)

### Mengubah Urutan Prioritas:

**Cara Lama (Manual):**

- Isi angka prioritas secara manual di kolom "Prioritas"

**Cara Baru (Drag & Drop):** ✨

- Klik dan tahan icon drag (☰) di sebelah kiri komponen
- Geser ke atas atau ke bawah
- Lepaskan mouse di posisi yang diinginkan
- **Nomor prioritas akan otomatis berubah mengikuti urutan baru**

## Contoh Penggunaan

### Skenario: Template PPDB dengan 6 Komponen

**Urutan Awal:**

1. Seragam (Rp 200.000)
2. LKS (Rp 130.000)
3. Iuran Bulanan (Rp 120.000)
4. Map Raport (Rp 50.000)
5. Lab (Rp 50.000)
6. Infaq (Rp 200.000)

**Jika Anda ingin "Infaq" dibayar lebih dulu:**

- Klik dan drag icon ☰ di baris "Infaq"
- Geser ke posisi paling atas
- Lepaskan

**Hasil Otomatis:**

1. Infaq (Rp 200.000) ← Prioritas berubah jadi 1
2. Seragam (Rp 200.000) ← Turun jadi 2
3. LKS (Rp 130.000) ← Turun jadi 3
4. Iuran Bulanan (Rp 120.000) ← Turun jadi 4
5. Map Raport (Rp 50.000) ← Turun jadi 5
6. Lab (Rp 50.000) ← Turun jadi 6

## Fitur Teknis

### Dependencies yang Digunakan:

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

### Keunggulan @dnd-kit:

- ✅ Modern dan lightweight
- ✅ Accessibility-friendly (keyboard navigation support)
- ✅ Touch-friendly untuk mobile/tablet
- ✅ Smooth animation transitions
- ✅ Zero dependencies pada jQuery atau library besar lainnya

### Auto-Update Priorities:

Ketika Anda menggeser komponen, sistem otomatis:

1. Menghitung ulang posisi array
2. Update field `priority` setiap komponen = index + 1
3. Re-render UI dengan smooth transition

### Catatan Penting:

- **Field "Prioritas" menjadi read-only (disabled)** - tidak bisa diubah manual lagi
- Prioritas ditentukan dari **urutan visual** komponen (dari atas ke bawah)
- Urutan ini akan disimpan ke database saat klik "Simpan"

## Implementasi Code

File yang diubah: `src/views/biaya/FeeTemplateTable.tsx`

### 1. Menambah ID Unik ke Setiap Komponen:

```typescript
type ComponentInput = {
  id: string // ← ID unik untuk drag and drop
  name: string
  amount: string
  priority: string
  description?: string
}
```

### 2. Drag and Drop Handler:

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event

  if (over && active.id !== over.id) {
    setComponents(items => {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)

      // Auto-update priorities
      return newItems.map((item, index) => ({
        ...item,
        priority: (index + 1).toString()
      }))
    })
  }
}
```

### 3. Sortable Component Item:

Setiap baris komponen dibungkus dengan `useSortable` hook yang menyediakan:

- Drag handle dengan cursor grab/grabbing
- Transform animation saat di-drag
- Opacity effect (50%) saat sedang dipindah

### 4. DndContext & SortableContext:

```tsx
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
    {components.map((comp, index) => (
      <SortableComponentItem ... />
    ))}
  </SortableContext>
</DndContext>
```

## Testing

Untuk menguji fitur ini:

1. Jalankan development server: `pnpm dev`
2. Login sebagai admin
3. Buka: http://localhost:3000/id/biaya/template-biaya
4. Edit salah satu template (misalnya "Administrasi PPDB 2025/2026")
5. Coba drag komponen dengan icon ☰
6. Perhatikan prioritas berubah otomatis
7. Klik "Simpan" dan reload halaman untuk memastikan urutan tersimpan

## Manfaat untuk User

### Sebelum (Manual Input):

- User harus ingat/cek nomor prioritas setiap komponen
- Harus edit angka di field "Prioritas" satu per satu
- Rawan salah urutan atau duplikat prioritas
- Tidak intuitif

### Sesudah (Drag & Drop):

- Visual & intuitif - "yang di atas dibayar lebih dulu"
- Cukup geser komponen ke posisi yang diinginkan
- Prioritas otomatis update tanpa perlu input manual
- Lebih cepat untuk reordering banyak komponen
- UX modern seperti aplikasi project management

## Troubleshooting

### Drag tidak berfungsi:

- Pastikan browser up-to-date
- Clear cache browser (Ctrl+Shift+R)
- Cek console untuk error

### Komponen tidak bergeser:

- Pastikan klik dan hold di icon drag (☰), bukan di field lain
- Pastikan mouse tidak lepas saat drag

### Prioritas tidak update setelah simpan:

- Cek network tab untuk response API
- Pastikan payload components memiliki priority yang benar

## Dokumentasi @dnd-kit

Untuk info lebih lanjut tentang library yang digunakan:

- Docs: https://docs.dndkit.com/
- GitHub: https://github.com/clauderic/dnd-kit

---

**Status:** ✅ Implemented & Ready to Use  
**Server:** http://localhost:3000  
**Date:** 2025-01-19

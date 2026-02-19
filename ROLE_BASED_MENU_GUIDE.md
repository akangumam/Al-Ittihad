# 🔐 Panduan Menu Berbasis Role

## Struktur Menu Baru

### Menu yang Dipisahkan:

#### 📋 **Pengguna & Hak Akses** (Menu Root Terpisah)

- **Akses**: `admin`, `staff`, `manager`
- **Lokasi**: Menu root level (sejajar dengan Dashboard, Akademik, dll)
- **Fitur**: Manajemen user dan role permissions

#### ⚙️ **Pengaturan Sistem** (Admin Only)

- **Akses**: `admin` saja
- **Submenu**:
  - Kategori Transaksi
  - Manajemen Kas/Bank
  - Tahun Pelajaran
  - Log Aktivitas Pengguna
  - Cadangkan & Pulihkan

---

## Cara Menambahkan User dengan Role Terbatas

### 1. **Buat User Baru dengan Role `staff` atau `manager`**

```typescript
// Di database atau melalui form pendaftaran
{
  fullName: "Nama User",
  email: "user@example.com",
  role: "staff", // atau "manager"
  password: "hashed_password"
}
```

### 2. **User dengan Role `staff`/`manager` Akan:**

✅ **BISA AKSES:**

- Dashboard
- Kalender
- Akademik (Data Siswa, Guru, Kelas, dll)
- Absensi Guru
- Biaya Sekolah
- Keuangan (Pemasukan, Pengeluaran)
- Laporan
- **Pengguna & Hak Akses** ← Menu baru terpisah

❌ **TIDAK BISA AKSES:**

- **Pengaturan Sistem** (Kategori, Kas/Bank, Backup, dll)

### 3. **User dengan Role `admin` Akan:**

✅ **BISA AKSES SEMUA MENU** (tidak ada batasan)

---

## Role yang Tersedia

| Role         | Pengguna & Hak Akses | Pengaturan Sistem | Semua Menu Lain |
| ------------ | :------------------: | :---------------: | :-------------: |
| `admin`      |          ✅          |        ✅         |       ✅        |
| `staff`      |          ✅          |        ❌         |       ✅        |
| `manager`    |          ✅          |        ❌         |       ✅        |
| `subscriber` |          ❌          |        ❌         |  ✅ (terbatas)  |

---

## Cara Menambahkan Role Restriction pada Menu Baru

Edit file: `src/data/navigation/verticalMenuData.tsx`

```typescript
{
  label: 'Menu Baru',
  icon: 'ri-icon-name',
  href: '/path/to/menu',
  roles: ['admin', 'staff'] // Hanya admin dan staff yang bisa akses
}
```

### Contoh Menu dengan Children:

```typescript
{
  label: 'Menu Parent',
  icon: 'ri-icon-name',
  roles: ['admin', 'manager'], // Restriction di parent level
  children: [
    {
      label: 'Child 1',
      href: '/path/child1',
      icon: 'ri-icon-1'
    },
    {
      label: 'Child 2',
      href: '/path/child2',
      icon: 'ri-icon-2'
    }
  ]
}
```

---

## Implementasi Teknis

### File yang Diubah:

1. **`src/types/menuTypes.ts`**
   - Menambahkan property `roles?: string[]` ke `VerticalMenuItemDataType` dan `VerticalSubMenuDataType`

2. **`src/data/navigation/verticalMenuData.tsx`**
   - Memisahkan "Pengguna & Hak Akses" menjadi menu root
   - Menambahkan `roles: ['admin']` ke "Pengaturan Sistem"
   - Menambahkan `roles: ['admin', 'staff', 'manager']` ke "Pengguna & Hak Akses"

3. **`src/components/GenerateMenu.tsx`**
   - Menambahkan `useSession` dari NextAuth
   - Menambahkan fungsi `filterMenuByRole()` untuk filter menu berdasarkan role user
   - Menu akan otomatis disembunyikan jika user tidak punya akses

---

## Testing

### 1. Login sebagai Admin:

- Semua menu harus terlihat
- "Pengguna & Hak Akses" tampil sebagai menu terpisah
- "Pengaturan Sistem" tampil dengan semua submenu

### 2. Login sebagai Staff/Manager:

- Semua menu operasional terlihat
- "Pengguna & Hak Akses" tampil
- "Pengaturan Sistem" **TIDAK tampil**

### 3. Login sebagai Subscriber:

- Menu terbatas sesuai kebutuhan
- "Pengguna & Hak Akses" **TIDAK tampil**
- "Pengaturan Sistem" **TIDAK tampil**

---

## Keuntungan Implementasi Ini

✅ **Pemisahan yang Jelas**: User management terpisah dari system settings
✅ **Fleksibel**: Mudah menambahkan role baru
✅ **Secure**: Menu disembunyikan di client, tapi tetap perlu backend protection
✅ **Maintainable**: Satu tempat untuk konfigurasi role (verticalMenuData.tsx)
✅ **User Friendly**: User hanya lihat menu yang relevan dengan akses mereka

---

## ⚠️ Catatan Penting

1. **Backend Protection Wajib**: Selalu validasi role di backend/API, jangan hanya di frontend
2. **Session Management**: Pastikan NextAuth session sudah dikonfigurasi dengan benar
3. **Role Consistency**: Gunakan role name yang konsisten di database dan kode
4. **Middleware**: Pertimbangkan menambahkan middleware untuk route protection

---

## Troubleshooting

### ❓ Tidak Bisa Melihat Menu "Pengguna & Hak Akses" atau "Pengaturan Sistem"

**1. Cek Role User Anda:**

- Buka file `debug-session.html` di browser
- Atau buka Console browser dan ketik: `fetch('/api/auth/session').then(r => r.json()).then(console.log)`
- Pastikan `role` user Anda adalah `admin`, `staff`, atau `manager`

**2. Jika Role Tidak Muncul atau `undefined`:**

- Cek database, pastikan kolom `role` terisi
- Logout dan login ulang untuk refresh session
- Cek `src/app/api/auth/[...nextauth]/options.ts` - pastikan `role` masuk ke session callback

**3. Clear Cache dan Restart:**

```bash
Remove-Item -Path .next -Recurse -Force
npm run dev
```

**4. Temporary Fix - Nonaktifkan Role Filter:**
Edit `src/components/GenerateMenu.tsx`, comment line filter:

```typescript
// const filteredMenuData = filterMenuByRole([...menuData])
const filteredMenuData = menuData // Temporary: show all menus
```

### Menu tidak muncul setelah login:

- Cek `session?.user?.role` di console browser
- Pastikan role user di database sesuai dengan yang di kode (`admin`, `staff`, `manager`)

### Menu masih tampil untuk user yang tidak seharusnya:

- Clear browser cache dan refresh halaman
- Cek apakah ada typo di property `roles` di menuData

### Error TypeScript:

- Pastikan sudah import type yang benar dari `@/types/menuTypes`
- Restart TypeScript server di VSCode

---

## Update Log

**Tanggal**: 3 Februari 2026

**Changes**:

- ✅ Pisahkan "Pengguna & Hak Akses" dari "Pengaturan Sistem"
- ✅ Tambahkan role-based filtering di GenerateMenu
- ✅ Update type definitions untuk support `roles` property
- ✅ Implementasi `filterMenuByRole()` function
- ✅ Integration dengan NextAuth session

---

Implementasi selesai! 🎉

# MTs Al-Ittihad - School Management System

Sistem Manajemen Sekolah untuk MTs Al-Ittihad yang dibangun dengan Next.js dan TypeScript.

## 🚀 Fitur Utama

### 📚 Modul Akademik

- **Data Siswa**: Manajemen data siswa lengkap dengan foto, informasi pribadi, dan akademik
- **Data Kelas**: Pengelolaan kelas dan wali kelas
- **Tahun Ajaran**: Manajemen tahun ajaran aktif dan historis
- **Data Guru**: Manajemen data tenaga pengajar (Coming Soon)

### 💰 Modul Keuangan

- **Pemasukan**: Pencatatan pemasukan sekolah
- **Pengeluaran**: Pencatatan pengeluaran sekolah
- **Mutasi Kas**: Transfer antar rekening/kas
- **Rekening & Kas**: Manajemen akun keuangan
- **Kategori Transaksi**: Pengelolaan kategori pemasukan dan pengeluaran

### 💳 Modul SPP

- **Pembayaran SPP**: Pencatatan pembayaran SPP siswa
- **Tunggakan**: Monitoring siswa yang menunggak
- **Tarif SPP**: Pengaturan tarif SPP per kelas
- **Laporan SPP**: Laporan pembayaran dan tunggakan

### 📊 Modul Anggaran (BOS)

- **Data Anggaran**: Manajemen anggaran BOS
- **Realisasi**: Tracking realisasi anggaran
- **Laporan Anggaran**: Laporan penggunaan anggaran

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **Styling**: CSS Modules
- **State Management**: React Context API
- **Data Storage**: LocalStorage (Client-side)
- **Icons**: Iconify Icons
- **Drag & Drop**: react-dropzone
- **Tables**: TanStack Table (React Table)

## 📦 Installation

1. Clone repository:

```bash
git clone https://github.com/akangumam/MTs-Al-Ittihad.git
cd MTs-Al-Ittihad
```

2. Install dependencies:

```bash
npm install
# atau
yarn install
# atau
pnpm install
```

3. Setup environment variables:

```bash
cp .env.example .env.local
```

4. Run development server:

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) dengan browser Anda.

## 🔧 Available Scripts

```bash
npm run dev          # Run development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   └── [lang]/              # Multi-language support
│       └── (dashboard)/     # Dashboard layout
│           └── (private)/   # Protected routes
│               ├── akademik/    # Academic module
│               ├── spp/         # SPP module
│               ├── keuangan/    # Finance module
│               └── anggaran/    # Budget module
├── components/              # Reusable components
├── contexts/                # React Context providers
│   └── AppContext.tsx      # Main app state management
├── data/                    # Initial data & configurations
├── views/                   # Page-specific components
│   ├── akademik/           # Academic views
│   ├── spp/                # SPP views
│   ├── keuangan/           # Finance views
│   └── anggaran/           # Budget views
└── utils/                   # Utility functions
```

## 🎨 Features Detail

### Student Management (CRUD)

- ✅ Create new student with comprehensive data
- ✅ Read/View student details with tabs (Profile, Finance, Academic)
- ✅ Update student information
- ✅ Delete student record
- ✅ Photo upload with preview
- ✅ Student filtering and search

### SPP Payment System

- ✅ Record SPP payments per month
- ✅ Automatic arrears calculation
- ✅ Payment history tracking
- ✅ Outstanding payment monitoring
- ✅ Receipt generation

### Financial Management

- ✅ Income recording with categories
- ✅ Expense tracking with budget linking
- ✅ Cash mutation between accounts
- ✅ Account balance management
- ✅ Transaction history

## 🌐 Multi-Language Support

Project ini mendukung multi-bahasa dengan struktur route `[lang]`:

- English (en)
- French (fr)
- Arabic (ar)

## 🔒 Authentication

Authentication module menggunakan layout protected routes dengan middleware untuk mengamankan halaman dashboard.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Developed with ❤️ for MTs Al-Ittihad

---

## 🚧 Roadmap

- [ ] Teacher Management Module
- [ ] Attendance System
- [ ] Grade/Report Card Management
- [ ] Parent Portal
- [ ] Mobile Responsive Optimization
- [ ] Export to Excel/PDF
- [ ] Email/WhatsApp Notifications
- [ ] Backend API Integration
- [ ] Database Implementation (PostgreSQL/MySQL)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

Untuk pertanyaan dan dukungan, silakan hubungi tim development.

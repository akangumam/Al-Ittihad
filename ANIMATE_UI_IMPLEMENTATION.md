# Animate UI Implementation Guide

## Implementasi Animasi Sidebar untuk MTs Al-Ittihad

### 📋 Prerequisites

1. **Framer Motion** - Library animasi utama
2. **Shadcn CLI** - Untuk install komponen (sudah ada di project)

---

### 🚀 Langkah 1: Install Dependencies

```bash
# Install Framer Motion
npm install framer-motion

# Install Motion (new animation library from Framer)
npm install motion
```

---

### 🎨 Langkah 2: Setup Animate UI

Animate UI menggunakan sistem "copy-paste" seperti Shadcn UI, bukan NPM library.

#### A. Buat folder struktur untuk Animate UI:

```
src/
├── components/
│   └── animate-ui/
│       ├── primitives/
│       │   ├── motion/
│       │   └── transitions/
│       └── components/
│           └── sidebar/
```

#### B. Install komponen via CLI (optional):

```bash
# Jika mau gunakan Shadcn CLI untuk Animate UI (experimental)
npx shadcn@latest init
```

---

### 🎯 Langkah 3: Implementasi untuk Sidebar

#### Komponen yang akan kita gunakan:

1. **Animated Menu Item** - Hover & Active states
2. **Smooth Collapse/Expand** - Untuk submenu
3. **Stagger Animation** - Menu items muncul satu per satu
4. **Icon Rotation** - Arrow icon untuk expand/collapse

---

### 📝 Struktur File yang Akan Dibuat:

```
src/components/animate-ui/
├── motion-config.ts          # Konfigurasi motion global
├── sidebar/
│   ├── animated-menu-item.tsx    # Menu item dengan animasi
│   ├── animated-submenu.tsx      # Submenu collapse/expand
│   └── sidebar-animations.ts     # Animation variants
```

---

### 🛠️ Yang Perlu Dikustomisasi dari Project Anda:

**File-file yang akan dimodifikasi:**

1. `src/components/layout/vertical/VerticalMenu.tsx`
   - Tambah wrapper animasi
   - Implement stagger effect

2. `src/@menu/components/vertical-menu/MenuItem.tsx`
   - Tambah hover animations
   - Implement active state animations

3. `src/@menu/components/vertical-menu/SubMenu.tsx`
   - Animated expand/collapse
   - Height transitions

4. `src/@menu/styles/vertical/StyledVerticalNavExpandIcon.tsx`
   - Icon rotation animation

---

### ✨ Animasi yang Akan Ditambahkan:

#### 1. **Menu Item Hover Animation**

```typescript
const menuItemVariants = {
  rest: { scale: 1, x: 0 },
  hover: {
    scale: 1.02,
    x: 4,
    transition: { duration: 0.2 }
  }
}
```

#### 2. **Submenu Collapse/Expand**

```typescript
const submenuVariants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.2 }
    }
  },
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.2, delay: 0.1 }
    }
  }
}
```

#### 3. **Stagger Effect** (Menu items muncul satu per satu)

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}
```

#### 4. **Icon Rotation**

```typescript
const iconVariants = {
  closed: { rotate: 0 },
  open: { rotate: 90 }
}
```

---

### 📊 Performance Considerations:

1. **Use `layoutId`** untuk shared element transitions
2. **Enable GPU acceleration** dengan `transform` & `opacity`
3. **Avoid animating** `width`, `height` langsung (gunakan `scaleX`, `scaleY`)
4. **Use `will-change`** untuk properti yang sering berubah

---

### 🎬 Demo Animasi yang Tersedia:

Dari Animate UI, komponen yang cocok untuk sidebar:

1. **Accordion** - Untuk submenu expand/collapse
2. **Navigation Menu** - Base navigation dengan animasi
3. **Hover Card** - Tooltip dengan animasi
4. **Collapsible** - Animated collapse component

---

### 🔗 Resources:

- [Animate UI Docs](https://animate-ui.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Motion Docs](https://motion.dev/)

---

### ⚡ Quick Start Command:

```bash
# Install dependencies
npm install framer-motion motion

# Create folder structure
mkdir -p src/components/animate-ui/sidebar
mkdir -p src/components/animate-ui/primitives

# Ready to implement!
```

---

### 🎯 Next Steps:

Setelah Anda review dokumentasi ini, saya siap untuk:

1. ✅ Install dependencies
2. ✅ Buat komponen animated sidebar
3. ✅ Implementasikan ke vertical menu yang ada
4. ✅ Test & optimize performance

**Apakah Anda siap untuk memulai implementasi?**

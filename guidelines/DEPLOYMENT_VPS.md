# Panduan Deploy VPS Sumopod (Alur Git Pull)

Dokumen ini berisi panduan untuk melakukan deployment project **Al-Ittihad** (Vite + React SPA) ke VPS Sumopod dengan domain `alittihadpedaleman.web.id`. Konsep deployment yang digunakan adalah **Git Pull & Build di VPS**.

## 1. Setup Awal di VPS (Hanya Dilakukan Sekali)

### A. Persiapan Environment (Node.js & Git)
Login ke VPS via SSH:
```bash
ssh root@ip_address_vps_anda
```

Install Node.js (v20 LTS), `pnpm`, dan Git:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Install pnpm secara global
sudo npm install -g pnpm
```

### B. Clone Repository
Disarankan untuk meletakkan project di `/var/www/`. 
*(Pastikan Anda sudah melakukan setup SSH Key di VPS untuk mengakses GitHub/GitLab jika repository bersifat private).*

```bash
cd /var/www/
git clone <URL_REPOSITORY_GIT_ANDA> alittihad
```

### C. Konfigurasi Environment Variables
Aplikasi ini membutuhkan variabel environment Supabase untuk build.
```bash
cd /var/www/alittihad
nano .env.production
```
Isi dengan config Supabase:
```env
VITE_SUPABASE_URL=https://bwtwuveqzffvttqwwzmu.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ytaBepGlA3qCg0elCJy7xw_hV7F-owI
```

### D. Install Dependencies & Build Pertama
```bash
pnpm install
pnpm run build
```
Setelah selesai, akan terbentuk folder `/var/www/alittihad/dist`.

---

## 2. Konfigurasi Nginx & Domain

### A. Install Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

### B. Konfigurasi Virtual Host untuk React SPA
Buat file konfigurasi Nginx baru:
```bash
sudo nano /etc/nginx/sites-available/alittihadpedaleman.web.id
```

Masukkan konfigurasi berikut (perhatikan letak direktori `root` mengarah ke folder `dist`):
```nginx
server {
    listen 80;
    server_name alittihadpedaleman.web.id www.alittihadpedaleman.web.id;

    # Arahkan langsung ke folder dist hasil build Vite
    root /var/www/alittihad/dist;
    index index.html index.htm;

    location / {
        # Sangat penting untuk SPA React Router agar tidak terjadi 404 saat direfresh
        try_files $uri $uri/ /index.html;
    }

    # Caching untuk file aset statis (CSS/JS/Gambar)
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}
```

### C. Aktifkan Nginx
```bash
sudo ln -s /etc/nginx/sites-available/alittihadpedaleman.web.id /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### D. Setup SSL (HTTPS)
Pastikan DNS A Record domain `alittihadpedaleman.web.id` sudah diarahkan ke IP VPS sebelum menjalankan langkah ini.
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d alittihadpedaleman.web.id -d www.alittihadpedaleman.web.id
```

---

## 3. Alur Update (Daily Workflow)

Saat ada pembaruan kode yang sudah di-*push* dari lokal, Anda cukup melakukan langkah ini di VPS:

```bash
cd /var/www/alittihad

# 1. Tarik pembaruan terbaru dari repository
git pull origin main

# 2. Install ulang dependencies (jika ada penambahan package baru)
pnpm install

# 3. Build ulang project
pnpm run build
```

Setelah `pnpm run build` selesai 100%, website akan otomatis menampilkan versi terbaru (tidak perlu me-restart Nginx).

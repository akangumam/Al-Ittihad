# Setup Guide - MTs Al-Ittihad Management System

## 🚀 Production Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### 2. Database Setup

#### Install PostgreSQL

```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

#### Create Database

```sql
-- Login to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE al_ittihad;

-- Create user
CREATE USER al_ittihad_user WITH PASSWORD 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE al_ittihad TO al_ittihad_user;
```

### 3. Environment Configuration

Create `.env` file in root directory:

```env
# Database
DATABASE_URL="postgresql://al_ittihad_user:secure_password_here@localhost:5432/al_ittihad?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-32-character-secret-key-here"
NEXTAUTH_BASEPATH="/api/auth"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App Config
NEXT_PUBLIC_APP_NAME="MTs Al-Ittihad"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 4. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 5. Database Migration

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Seed initial data
pnpm prisma db seed
```

### 6. Run Development Server

```bash
pnpm dev
```

Visit: http://localhost:3000

### 7. Build for Production

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## 📊 Database Migration from LocalStorage

Jika sudah ada data di localStorage yang ingin dimigrate:

```bash
# Run migration script
pnpm tsx scripts/migrate-localstorage-to-db.ts
```

## 🔑 Default Login Credentials

**Admin:**

- Email: `admin@alittihad.sch.id`
- Password: `admin123`

**Guru:**

- Email: `guru@alittihad.sch.id`
- Password: `guru123`

**⚠️ IMPORTANT:** Change default passwords after first login!

## 🚢 Deployment Options

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

Database: Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for PostgreSQL

### Option 2: VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone <your-repo>
cd al_ittihad
npm install
npm run build

# Start with PM2
pm2 start npm --name "al-ittihad" -- start
pm2 save
pm2 startup
```

### Option 3: Docker

```bash
# Build image
docker build -t al-ittihad .

# Run container
docker run -p 3000:3000 --env-file .env al-ittihad
```

## 🔧 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U al_ittihad_user -d al_ittihad
```

### Prisma Migration Issues

```bash
# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset

# Force push schema
pnpm prisma db push --force-reset
```

### Build Errors

```bash
# Clean build cache
rm -rf .next
rm -rf node_modules
pnpm install
pnpm build
```

## 📱 Mobile Access

Configure nginx reverse proxy for HTTPS:

```nginx
server {
    listen 80;
    server_name school.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name school.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Security Checklist

- [ ] Change default passwords
- [ ] Setup HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup database backups
- [ ] Configure firewall rules
- [ ] Setup monitoring (Sentry, LogRocket)
- [ ] Regular security updates

## 📞 Support

For issues and questions:

- GitHub Issues: [Create Issue]
- Email: support@alittihad.sch.id

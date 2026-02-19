# 🚀 Quick Start - Production Setup

## Step 1: Install PostgreSQL

### Windows

```bash
# Download and install from:
https://www.postgresql.org/download/windows/

# Or using Chocolatey:
choco install postgresql
```

### Create Database

```bash
# Open psql
psql -U postgres

# Create database and user
CREATE DATABASE al_ittihad;
CREATE USER al_ittihad_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE al_ittihad TO al_ittihad_user;
\q
```

## Step 2: Configure Environment

Create `.env` file:

```env
DATABASE_URL="postgresql://al_ittihad_user:your_secure_password@localhost:5432/al_ittihad?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_BASEPATH="/api/auth"
```

## Step 3: Install & Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Seed database with initial data
pnpm prisma db seed
```

## Step 4: Run Application

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## Step 5: Login

Open http://localhost:3000

**Default credentials:**

- Email: `admin@alittihad.sch.id`
- Password: `admin123`

⚠️ **IMPORTANT:** Change password after first login!

## Troubleshooting

### Database connection error

```bash
# Check PostgreSQL status
# Windows:
services.msc  # Look for PostgreSQL service

# Test connection
psql -U al_ittihad_user -d al_ittihad
```

### Migration errors

```bash
# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset

# Or force push
pnpm prisma db push --force-reset
```

### Port already in use

```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Next Steps

1. ✅ Change default passwords
2. ✅ Setup backup schedule
3. ✅ Configure SSL (if production)
4. ✅ Setup monitoring
5. ✅ Read full SETUP_GUIDE.md

## Support

- Documentation: See `SETUP_GUIDE.md`
- Issues: Create GitHub issue
- Email: support@alittihad.sch.id

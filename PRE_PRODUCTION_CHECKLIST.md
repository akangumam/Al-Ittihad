# 🚀 PRE-PRODUCTION ACTION CHECKLIST

**Target:** Fix critical issues before hosting deployment  
**Timeline:** 2-3 days  
**Priority:** 🔴 CRITICAL items must be done, ⚠️ HIGH items strongly recommended

---

## DAY 1: Security Fixes (4-6 hours)

### ☐ Task 1: Remove Default Passwords (30 min) 🔴 CRITICAL

**File:** `prisma/seed-complete.ts`

**Current Problem:**

```typescript
const hashedPassword = await hash('password123', 10) // ← Public in code!
```

**Fix Option A - Force Change on First Login:**

```typescript
// Update schema.prisma first
model User {
  // ... existing fields
  mustChangePassword Boolean @default(true)
  passwordChangedAt  DateTime?
}

// Then in seed-complete.ts
{
  email: 'admin@alittihad.sch.id',
  name: 'Administrator',
  role: 'admin',
  password: hashedPassword,
  mustChangePassword: true,  // ← Force change on login
  emailVerified: new Date()
}
```

**Fix Option B - Random Passwords (Better for Production):**

```typescript
import crypto from 'crypto'

// Generate random password for each user
const adminPassword = crypto.randomBytes(16).toString('hex')
const adminHash = await hash(adminPassword, 10)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔐 ADMIN INITIAL PASSWORD (SAVE THIS!):', adminPassword)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

// Then send to admin via email or secure channel
```

**Test:** ✓ Verify you cannot login with `password123` after deployment

---

### ☐ Task 2: Regenerate All Secrets (15 min) 🔴 CRITICAL

**File:** `.env` (create new `.env.production`)

**Action:**

```bash
# Generate new NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Create .env.production
NODE_ENV=production
DATABASE_URL=postgresql://...  # Will update in Task 4
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<paste-new-secret-here>
RESEND_API_KEY=<will-update-later>
EMAIL_FROM=noreply@alittihad.sch.id
APP_NAME=MTs Al-Ittihad
```

**IMPORTANT:**

- ❌ **DO NOT** use the existing `NEXTAUTH_SECRET` from current `.env`
- ❌ **DO NOT** commit `.env.production` to Git
- ✅ **DO** add to `.gitignore`

---

### ☐ Task 3: Verify .env Not in Git (5 min) 🔴 CRITICAL

**Check:**

```bash
# Is .env in .gitignore?
cat .gitignore | grep ".env"

# Has .env been committed before?
git log --all -- .env

# If yes, remove it:
git rm --cached .env
git rm --cached .env.production
git commit -m "Remove sensitive env files"
```

**Add to `.gitignore` if missing:**

```
.env
.env.*
.env.local
.env.production
.env.production.local
!.env.example
```

---

### ☐ Task 4: Cleanup Console.log (2-3 hours) ⚠️ HIGH

**Option A - Quick Fix (30 min):**
Add build-time removal in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn']
          }
        : false
  }
}
```

**Option B - Proper Logging (2-3 hours):**
Replace console.log with proper logger:

```typescript
// lib/logger.ts
const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args)
    }
  },
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  info: (...args: any[]) => console.log('[INFO]', ...args)
}

export default logger

// Then replace in files:
// console.log('Debug') → logger.debug('Debug')
```

**Priority:** If time-limited, use Option A (build config). Come back to Option B later.

---

## DAY 2: Database & Hosting Setup (4-6 hours)

### ☐ Task 5: Choose Hosting Provider (1 hour) 🔴 CRITICAL

**Decision Matrix:**

| Provider          | Cost/mo | Ease       | Performance | Best For            |
| ----------------- | ------- | ---------- | ----------- | ------------------- |
| **Vercel**        | $0-20   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐    | Beginners           |
| **Railway**       | $5-15   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐    | Small teams         |
| **DigitalOcean**  | $6-12   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐  | Tech-savvy          |
| **VPS Indonesia** | $5-10   | ⭐⭐       | ⭐⭐⭐      | Budget + Fast in ID |

**Recommendation for Al-Ittihad:**

- **If no DevOps experience:** Vercel
- **If have basic Linux skills:** DigitalOcean/Linode
- **If budget very tight:** VPS Indonesia (Niagahoster, Dewaweb)

**Action:**

- [ ] Create account
- [ ] Note down hosting details
- [ ] Prepare payment method

---

### ☐ Task 6: Setup PostgreSQL Database (2-3 hours) 🔴 CRITICAL

**Option A - Vercel (Easiest):**

```bash
# 1. Go to Vercel Dashboard
# 2. Create new PostgreSQL database
# 3. Copy connection string

# 4. Update .env.production
DATABASE_URL="postgres://default:..."
```

**Option B - Neon (Free PostgreSQL):**

```bash
# 1. Go to neon.tech
# 2. Create free account
# 3. Create database "al_ittihad"
# 4. Copy connection string

DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/al_ittihad?sslmode=require"
```

**Option C - VPS (Self-hosted):**

```bash
# SSH to server
ssh root@your-server-ip

# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE al_ittihad;
CREATE USER al_ittihad_user WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE al_ittihad TO al_ittihad_user;
\q

# Connection string:
DATABASE_URL="postgresql://al_ittihad_user:STRONG_PASSWORD_HERE@localhost:5432/al_ittihad"
```

**Test Connection:**

```bash
# Install pg client locally
npm install -g pg-connection-test

# Test
pg-connection-test "postgresql://..."
```

---

### ☐ Task 7: Configure Email Service (1 hour) ⚠️ HIGH

**Steps:**

1. **Get Resend API Key:**
   - Go to https://resend.com
   - Create account
   - Generate new API key
   - Copy key

2. **Add Domain (Optional but Recommended):**

   ```
   Domain: alittihad.sch.id
   Add DNS records:
     TXT: resend._domainkey   →  (value from Resend)
     TXT: @                   →  v=spf1 include:resend.com ~all
   ```

3. **Update .env.production:**

   ```env
   RESEND_API_KEY=re_NEW_KEY_HERE
   EMAIL_FROM=noreply@alittihad.sch.id  # Or onboarding@resend.dev for testing
   ```

4. **Test Email:**
   ```bash
   npm run test-email
   ```

**Note:** You can skip domain verification and use `onboarding@resend.dev` for now. Come back to custom domain later.

---

## DAY 3: Deployment & Testing (4-6 hours)

### ☐ Task 8: Deploy to Staging (2 hours) ⚠️ HIGH

**Vercel Deployment:**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build locally first
npm run build

# 3. Deploy to preview
vercel --prod
```

**VPS Deployment:**

```bash
# 1. SSH to server
ssh user@server

# 2. Clone repo
git clone https://github.com/your-repo/al-ittihad.git
cd al-ittihad

# 3. Install dependencies
npm install

# 4. Create .env.production
nano .env.production
# Paste production config

# 5. Build
npm run build

# 6. Run migrations
npx prisma migrate deploy

# 7. Seed initial data
npm run db:seed-complete

# 8. Start with PM2
npm install -g pm2
pm2 start npm --name "al-ittihad" -- start
pm2 save
pm2 startup
```

---

### ☐ Task 9: Run Production Checks (1 hour) 🔴 CRITICAL

**Security Checklist:**

```bash
# 1. Can you access database directly?
# → Should be NO (firewall configured)

# 2. Try default password
# → Should be REJECTED

# 3. Check HTTPS
# → Should have valid SSL certificate

# 4. Test forgot password
# → Should receive email

# 5. Check error handling
# → Should NOT show stack traces to users
```

**Performance Checklist:**

```bash
# 1. Page load time < 3 seconds?
# 2. Images optimized?
# 3. Database queries fast?
# 4. No console errors in browser?
```

---

### ☐ Task 10: User Acceptance Testing (2 hours) ⚠️ HIGH

**Test Cases:**

1. **Authentication:**
   - [ ] Login with correct credentials
   - [ ] Login with wrong password (should fail)
   - [ ] Forgot password flow
   - [ ] Change password
   - [ ] Logout

2. **Student Management:**
   - [ ] Add new student
   - [ ] Edit student
   - [ ] View student detail
   - [ ] Delete student

3. **Financial:**
   - [ ] Add income
   - [ ] Add expense
   - [ ] Generate BKU report
   - [ ] View dashboard

4. **Teacher Attendance:**
   - [ ] Mark attendance
   - [ ] View attendance summary
   - [ ] Generate attendance report

**Log any bugs found!**

---

## 🎯 DEPLOYMENT DAY CHECKLIST

**Morning (Before 10 AM):**

- [ ] Final backup of current system (if migrating)
- [ ] Notify users of deployment
- [ ] Prepare rollback plan

**Deployment (10 AM - 12 PM):**

- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Verify DNS/SSL working
- [ ] Test critical flows

**Afternoon (1 PM - 5 PM):**

- [ ] Monitor error logs
- [ ] Assist users with login
- [ ] Fix urgent issues
- [ ] Document problems

**Evening:**

- [ ] Daily summary report
- [ ] Plan fixes for tomorrow
- [ ] Backup production database

---

## 📞 EMERGENCY CONTACTS

**If something goes wrong:**

1. **Site down:** Check hosting provider status
2. **Database errors:** Verify DATABASE_URL
3. **Can't login:** Check NEXTAUTH_SECRET
4. **Email not sending:** Verify RESEND_API_KEY

**Rollback Plan:**

```bash
# Keep old system running during migration
# Don't delete until new system stable for 1 week
```

---

## ✅ COMPLETION VERIFICATION

**Before marking "READY FOR PRODUCTION":**

- [ ] ✅ All 🔴 CRITICAL items completed
- [ ] ✅ At least 80% of ⚠️ HIGH items completed
- [ ] ✅ Staging environment tested
- [ ] ✅ At least 2 people trained
- [ ] ✅ Backup system in place
- [ ] ✅ Support plan ready
- [ ] ✅ Rollback plan documented

---

**Estimated Total Time:** 12-18 hours (2-3 days)

**You've got this!** 🚀

Take it step by step, don't rush, and the deployment will go smoothly.

---

**Questions?** Review `PRODUCTION_READINESS_AUDIT.md` for detailed explanations. **Good luck with the deployment!** 🎉

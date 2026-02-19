# 🚀 DEPLOYMENT GUIDE - Domainesia Cloud Hosting

**Target:** Deploy Al-Ittihad Next.js App to Domainesia  
**Timeline:** 2-3 hours  
**Status:** Ready to Execute

---

## 📋 PREREQUISITES

### **What You Need:**

1. ✅ **Domainesia Cloud Hosting** (subscribed)
2. ✅ **Domain** (connected to Domainesia)
3. ✅ **cPanel Access** (username & password)
4. ⏰ **SSH Access** (required for Next.js deployment)
5. ⏰ **Node.js Support** (check in cPanel)

---

## 🎯 DEPLOYMENT ARCHITECTURE

### **Recommended Setup:**

```
┌─────────────────────────────────────────┐
│  USER (Browser)                         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  DOMAINESIA CLOUD HOSTING               │
│  - Next.js App (Node.js)                │
│  - PM2 Process Manager                  │
│  - Nginx Reverse Proxy                  │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  NEON.TECH (PostgreSQL Database)        │
│  - Free Tier (0.5 GB)                   │
│  - Managed & Auto-backup                │
└─────────────────────────────────────────┘
```

---

## 📝 STEP-BY-STEP DEPLOYMENT

### **PHASE 1: Check Domainesia Capabilities** (10 minutes)

#### **Step 1.1: Login to cPanel**

1. Go to: `https://panel.domainesia.com`
2. Login with your credentials
3. Find your hosting account
4. Click "cPanel" or "Manage Hosting"

#### **Step 1.2: Check Node.js Support**

In cPanel, look for:

- **"Setup Node.js App"** (newer cPanel)
- **"Application Manager"**
- **"Select PHP Version"** (might have Node.js too)

**If you find Node.js:**

- ✅ Note the version (need 18.17.0 or higher)
- ✅ Note the path
- ✅ Proceed with deployment

**If NO Node.js found:**

- ⚠️ Contact Domainesia support
- ⚠️ Upgrade to plan with Node.js
- ⚠️ Or consider Vercel alternative

#### **Step 1.3: Check SSH Access**

In cPanel, look for:

- **"SSH Access"** or
- **"Terminal"** or
- **"SSH/Shell Access"**

**Setup SSH:**

1. Generate SSH key (if needed)
2. Copy SSH credentials
3. Test connection:
   ```bash
   ssh username@yourdomain.com
   ```

**If SSH not available:**

- Contact Domainesia support to enable

---

### **PHASE 2: Setup PostgreSQL Database** (30 minutes)

**We'll use Neon.tech (free PostgreSQL cloud)**

#### **Step 2.1: Create Neon Account**

1. Go to: https://neon.tech
2. Click "Sign Up"
3. Sign up with GitHub or Email
4. Verify email

#### **Step 2.2: Create Database Project**

1. Click "Create Project"
2. **Project Name:** `Al-Ittihad School`
3. **Database Name:** `al_ittihad`
4. **Region:** Choose **Singapore** (closest to Indonesia)
5. **PostgreSQL Version:** 15
6. Click "Create Project"

**Wait 30-60 seconds for provisioning...**

#### **Step 2.3: Get Connection String**

1. After project created, you'll see connection string:

   ```
   postgresql://username:password@ep-xxx-xxx.ap-southeast-1.aws.neon.tech/al_ittihad?sslmode=require
   ```

2. **COPY THIS!** Save to notepad

3. Click "Connection String" tab
4. Copy all formats (we need the full one)

---

### **PHASE 3: Prepare Application** (20 minutes)

#### **Step 3.1: Update Environment Variables**

1. **Create `.env.production` file:**

```env
# ========================================
# PRODUCTION ENVIRONMENT - Domainesia
# ========================================

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
BASEPATH=

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_BASEPATH=/api/auth

# Generate new secret: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=GENERATE_NEW_SECRET_HERE

# Database - Neon PostgreSQL
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/al_ittihad?sslmode=require

# Email - Resend
RESEND_API_KEY=re_NEW_KEY_HERE
EMAIL_FROM=noreply@yourdomain.com
APP_NAME=MTs Al-Ittihad

# API
NEXT_PUBLIC_API_URL=/api
```

2. **Generate new NEXTAUTH_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy output and paste to `.env.production`

#### **Step 3.2: Build Application Locally**

**Test build before deploying:**

```bash
# 1. Install all dependencies
npm install

# 2. Build for production
npm run build

# 3. Test production build locally
npm start

# 4. Check if it works
# Open: http://localhost:3000
```

**If build successful** ✅ → Ready to deploy  
**If build fails** ❌ → Fix errors first

---

### **PHASE 4: Deploy to Domainesia** (45 minutes)

#### **Step 4.1: Upload Files via SSH/SFTP**

**Option A: Using Git (Recommended)**

```bash
# 1. SSH to server
ssh username@yourdomain.com

# 2. Navigate to public_html or app directory
cd ~/public_html

# 3. Clone repository
git clone https://github.com/your-repo/al-ittihad.git
cd al-ittihad

# 4. Install dependencies
npm install

# 5. Build application
npm run build
```

**Option B: Using FileZilla/SFTP**

1. Download FileZilla
2. Connect to Domainesia SFTP:
   - Host: `yourdomain.com`
   - Protocol: SFTP
   - Username: (from cPanel)
   - Password: (from cPanel)
3. Upload entire project folder
4. SSH and run build

#### **Step 4.2: Create .env.production on Server**

```bash
# SSH to server
cd ~/public_html/al-ittihad

# Create .env.production
nano .env.production

# Paste production environment variables
# (from Step 3.1)

# Save: Ctrl+O, Enter, Ctrl+X
```

#### **Step 4.3: Run Database Migrations**

```bash
# Still in SSH

# 1. Generate Prisma Client
npx prisma generate

# 2. Run migrations
npx prisma migrate deploy

# 3. Seed initial data
npm run db:seed-complete

# 4. Copy passwords shown in terminal!
```

#### **Step 4.4: Setup PM2 Process Manager**

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "al-ittihad" -- start

# Save PM2 configuration
pm2 save

# Setup auto-start on server reboot
pm2 startup

# Check if running
pm2 status
pm2 logs al-ittihad
```

**Application should now run on:** `http://localhost:3000` (on server)

---

### **PHASE 5: Configure Nginx/Apache** (20 minutes)

#### **Step 5.1: Setup Reverse Proxy**

**In cPanel:**

1. Go to **"Apache Configuration"** or **"Nginx Configuration"**
2. Add reverse proxy rule

**Nginx Configuration:**

```nginx
# In /etc/nginx/conf.d/yourdomain.conf

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificate (Let's Encrypt via cPanel)
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Reverse proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**OR Use cPanel's "Proxy" Feature:**

1. In cPanel, find **"Proxy"** or **"Application URL"**
2. Add proxy rule:
   - Domain: `yourdomain.com`
   - Port: `3000`
   - Protocol: `http`

#### **Step 5.2: Setup SSL Certificate**

**In cPanel:**

1. Go to **"SSL/TLS Status"**
2. Find your domain
3. Click **"Run AutoSSL"** (Let's Encrypt)
4. Wait 1-2 minutes
5. Verify HTTPS works

**Or manually:**

```bash
# Using Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### **PHASE 6: Final Testing** (15 minutes)

#### **Step 6.1: Test Application**

Open browser and check:

1. **Homepage:** `https://yourdomain.com`
   - ✅ Loads correctly?
   - ✅ HTTPS working?
   - ✅ No errors in console?

2. **Login:** `https://yourdomain.com/login`
   - ✅ Login page appears?
   - ✅ Can login with seeded credentials?
   - ✅ Redirects to dashboard?

3. **Database:** Test CRUD operations
   - ✅ Create new student
   - ✅ Edit student
   - ✅ Delete student
   - ✅ Generate report

4. **Email:** Test forgot password
   - ✅ Email sends?
   - ✅ Reset link works?

#### **Step 6.2: Performance Check**

```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs al-ittihad --lines 50

# Monitor resources
pm2 monit
```

#### **Step 6.3: Setup Monitoring**

```bash
# Setup PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔧 TROUBLESHOOTING

### **Issue: "Cannot connect to database"**

**Solution:**

```bash
# Check DATABASE_URL in .env.production
cat .env.production | grep DATABASE_URL

# Test connection
npx prisma db pull

# Regenerate Prisma Client
npx prisma generate
```

---

### **Issue: "404 Not Found" on domain**

**Solution:**

- Check Nginx/Apache configuration
- Verify proxy_pass points to localhost:3000
- Restart Nginx: `sudo systemctl restart nginx`
- Check PM2 is running: `pm2 status`

---

### **Issue: "Application not staying online"**

**Solution:**

```bash
# Check PM2 logs
pm2 logs al-ittihad

# Restart application
pm2 restart al-ittihad

# Check for errors in build
npm run build
```

---

## 📊 POST-DEPLOYMENT CHECKLIST

- [ ] ✅ Application accessible via domain
- [ ] ✅ HTTPS working (green padlock)
- [ ] ✅ Login functionality works
- [ ] ✅ Database operations work
- [ ] ✅ Email sending works
- [ ] ✅ PM2 running and stable
- [ ] ✅ SSL certificate valid
- [ ] ✅ No errors in logs
- [ ] ✅ Performance acceptable
- [ ] ✅ Monitoring setup

---

## 💰 COST SUMMARY

| Item                     | Cost                 |
| ------------------------ | -------------------- |
| Domainesia Cloud Hosting | Already paid ✅      |
| Domain                   | Already paid ✅      |
| Neon PostgreSQL          | $0/month (free tier) |
| SSL Certificate          | $0 (Let's Encrypt)   |
| **Total Monthly Cost**   | **$0 additional**    |

---

## 🎉 SUCCESS!

**If all checks pass, congratulations!** 🎊

Your Al-Ittihad application is now:

- ✅ Live on production
- ✅ Accessible worldwide
- ✅ Secure with HTTPS
- ✅ Backed by reliable database
- ✅ Ready for users!

---

## 📞 NEED HELP?

**Common Domainesia Support:**

- Live Chat: https://www.domainesia.com
- Phone: 0274 5305505
- Email: cs@domainesia.com

**Next Steps:**

1. Train users
2. Monitor performance
3. Setup regular backups
4. Plan for scaling

---

**Deployment Status:** Ready to Execute  
**Estimated Time:** 2-3 hours  
**Difficulty:** Medium (requires SSH access)

Let's deploy! 🚀

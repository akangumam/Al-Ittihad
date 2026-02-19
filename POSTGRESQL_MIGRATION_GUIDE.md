# 🗄️ PostgreSQL Migration Guide

**Status:** To Be Executed When Setting Up Production Hosting  
**Estimated Time:** 1-2 hours  
**Priority:** 🟠 HIGH (Before Production)

---

## 📋 WHY PostgreSQL?

### **Current: SQLite**

```env
DATABASE_URL=file:./dev.db
```

**Problems with SQLite in Production:**

1. ❌ **File-based** - Not suitable for multi-server deployments
2. ❌ **Locking issues** - Concurrent writes cause "database locked" errors
3. ❌ **No network access** - Can't connect remotely for backups/monitoring
4. ❌ **Limited scalability** - Performance degrades with > 100 concurrent users
5. ❌ **Single point of failure** - If file corrupts, all data lost

### **Solution: PostgreSQL**

```env
DATABASE_URL=postgresql://user:pass@host:5432/al_ittihad
```

**Benefits:**

- ✅ **Production-grade** - Used by millions of applications
- ✅ **Concurrent access** - Handles 1000+ simultaneous connections
- ✅ **Network-based** - Remote backups, monitoring, replication
- ✅ **ACID compliant** - Data integrity guaranteed
- ✅ **Scalable** - Can grow from 10 to 10,000+ users

---

## 🎯 HOSTING OPTIONS COMPARISON

### **Option 1: Neon.tech** ⭐⭐⭐⭐⭐ (RECOMMENDED)

**Website:** https://neon.tech

**Pros:**

- ✅ **Generous free tier** (0.5 GB storage, 100 hours compute/mo)
- ✅ **Serverless** - Auto-scale based on usage
- ✅ **Branch databases** - Create test copies instantly
- ✅ **Fast setup** - 5 minute signup to database
- ✅ **Built-in backups**

**Cons:**

- ⚠️ Free tier has compute limits (sleep after inactivity)

**Pricing:**

- Free: $0/month (sufficient for testing)
- Paid: $19/month (for always-on production)

**Best For:** Schools starting out, want easy setup

---

### **Option 2: Vercel Postgres** ⭐⭐⭐⭐

**Website:** https://vercel.com/storage/postgres

**Pros:**

- ✅ **Integrated with Vercel** (if you use Vercel hosting)
- ✅ **Easy setup** - One-click from dashboard
- ✅ **Powered by Neon** - Same tech, better integration
- ✅ **Auto-scaling**

**Cons:**

- ⚠️ Requires Vercel hosting (not standalone)
- ⚠️ More expensive than direct Neon

**Pricing:**

- Free: $0/month (0.5 GB)
- Pro: $25/month (10 GB)

**Best For:** If you're already using Vercel for hosting

---

### **Option 3: Railway** ⭐⭐⭐⭐

**Website:** https://railway.app

**Pros:**

- ✅ **All-in-one** - Hosting + Database in one platform
- ✅ **Simple pricing** - Pay for what you use
- ✅ **Good UI/UX** - Easy to manage
- ✅ **Automatic backups**

**Cons:**

- ⚠️ No forever-free tier (trial credits)
- ⚠️ Pricier than Neon for database alone

**Pricing:**

- Trial: $5 credit free
- Usage-based: ~$5-15/month for small DB

**Best For:** Want hosting + database in one place

---

### **Option 4: DigitalOcean Managed PostgreSQL** ⭐⭐⭐

**Website:** https://www.digitalocean.com/products/managed-databases-postgresql

**Pros:**

- ✅ **Fully managed** - Auto backups, updates, monitoring
- ✅ **Reliable** - 99.95% uptime SLA
- ✅ **Scalable** - Easy to upgrade

**Cons:**

- ❌ **Expensive** - Starts at $15/month
- ⚠️ More complex setup

**Pricing:**

- Basic: $15/month (1 GB RAM, 10 GB disk)
- Pro: $60/month (better performance)

**Best For:** Schools with bigger budget, want premium reliability

---

### **Option 5: Self-Hosted PostgreSQL** ⭐⭐

**Requirements:** VPS with Ubuntu/Debian

**Pros:**

- ✅ **Cheapest** - $5-10/month VPS
- ✅ **Full control**
- ✅ **No vendor lock-in**

**Cons:**

- ❌ **Requires expertise** - Need to manage backups, security, updates
- ❌ **Time-consuming** - 2-3 hours initial setup
- ❌ **No support** - You're on your own

**Pricing:**

- VPS: $5-10/month (DigitalOcean, Linode, Vultr)
- Free software (PostgreSQL)

**Best For:** Schools with technical staff, very tight budget

---

## 🚀 MIGRATION STEPS

### **Recommended Path: Neon.tech**

I'll walk you through Neon because it's fastest and free!

---

## 📝 STEP-BY-STEP: Neon PostgreSQL Setup

### **Phase 1: Create Neon Account (5 minutes)**

1. **Go to:** https://neon.tech
2. **Click:** "Get Started" or "Sign Up"
3. **Sign up with:** GitHub account (easiest) or email
4. **Verify email** (if using email signup)

---

### **Phase 2: Create Database (5 minutes)**

1. **After login,** click "Create a project"
2. **Project name:** `Al-Ittihad School`
3. **PostgreSQL version:** 15 (latest stable)
4. **Region:** Choose closest to Indonesia:
   - Singapore (recommended for speed)
   - Or Tokyo/Sydney
5. **Click:** "Create project"

**Wait 30-60 seconds** for provisioning...

---

### **Phase 3: Get Connection String (2 minutes)**

1. **Dashboard shows connection string:**

   ```
   postgresql://username:password@ep-abc123.region.aws.neon.tech/main?sslmode=require
   ```

2. **Copy the connection string**

3. **IMPORTANT:** Keep this SECRET!

---

### **Phase 4: Update Application (10 minutes)**

1. **Create new .env.production file:**

```env
# Production Environment Variables
NODE_ENV=production

# Database - PostgreSQL from Neon
DATABASE_URL=postgresql://username:password@ep-abc123.region.aws.neon.tech/main?sslmode=require

# Auth - Generate new secret!
NEXTAUTH_URL=https://alittihad.sch.id  # Your domain
NEXTAUTH_SECRET=<generate-new-with-openssl>

# Email
RESEND_API_KEY=<new-key-from-resend>
EMAIL_FROM=noreply@alittihad.sch.id

# App
APP_NAME=MTs Al-Ittihad
NEXT_PUBLIC_API_URL=/api
```

2. **Generate new NEXTAUTH_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copy output to .env.production
```

---

### **Phase 5: Run Prisma Migrations (5 minutes)**

```bash
# 1. Make sure Prisma CLI is installed
npm install -D prisma

# 2. Set DATABASE_URL to PostgreSQL
export DATABASE_URL="postgresql://..." # Your Neon URL

# Or on Windows:
$env:DATABASE_URL="postgresql://..."

# 3. Run migrations (creates all tables)
npx prisma migrate deploy

# 4. Generate Prisma Client
npx prisma generate
```

**Expected output:**

```
✓ Prisma Migrate applied migrations:
  • 20240101000000_init
  • ... (all your migrations)

✓ All migrations applied successfully
```

---

### **Phase 6: Seed Initial Data (5 minutes)**

```bash
# Run seed script
npm run db:seed-complete
```

**IMPORTANT:** Copy the passwords that appear in terminal!

---

### **Phase 7: Test Connection (5 minutes)**

```bash
# Test with Prisma Studio
npx prisma studio
```

**Opens browser at:** http://localhost:5555

**Check:**

- ✅ Can you see tables (User, Student, Teacher, etc)?
- ✅ Can you see seeded data?
- ✅ Can you edit a record?

**If YES → Migration successful!** 🎉

---

### **Phase 8: Update Application Code (If Needed)**

**Good news:** No code changes needed!

Prisma works identically with both SQLite and PostgreSQL.

Your existing code will work without modification.

---

## 🔧 TROUBLESHOOTING

### **Error: "Can't reach database server"**

**Solution:**

- Check DATABASE_URL is correct
- Check network connection
- Verify Neon project is active (not paused)

---

### **Error: "SSL connection required"**

**Solution:**
Add `?sslmode=require` to end of DATABASE_URL:

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

---

### **Error: "Password authentication failed"**

**Solution:**

- Copy DATABASE_URL again from Neon dashboard
- Make sure no extra spaces in .env file
- Try resetting database password in Neon

---

### **Migration Issues**

**Solution:**

```bash
# Check migration status
npx prisma migrate status

# Force reset (⚠️ deletes all data!)
npx prisma migrate reset

# Then seed again
npm run db:seed-complete
```

---

## 📊 VERIFICATION CHECKLIST

Before considering migration complete:

- [ ] ✅ Neon account created
- [ ] ✅ PostgreSQL database provisioned
- [ ] ✅ Connection string saved securely
- [ ] ✅ `.env.production` file created
- [ ] ✅ Migrations ran successfully
- [ ] ✅ Data seeded properly
- [ ] ✅ Can connect via Prisma Studio
- [ ] ✅ Application can query database
- [ ] ✅ Login works with new DB
- [ ] ✅ CRUD operations work

---

## 💰 COST ESTIMATE

### **Free Tier (Neon):**

- **Storage:** 0.5 GB (enough for ~5,000 students)
- **Compute:** 100 hours/month
- **Connections:** 1000 concurrent
- **Cost:** **$0/month**

**When to upgrade:**

- More than 0.5 GB data (unlikely for school)
- Need 24/7 availability (free tier sleeps after inactivity)
- More than 100 hours compute/month

### **Paid Tier ($19/month):**

- **Storage:** Unlimited
- **Compute:** Always-on, unlimited
- **Connections:** Unlimited
- **Cost:** **$19/month**

**Recommendation:** Start with free tier, upgrade if needed.

---

## 🗓️ WHEN TO MIGRATE?

### **Migrate PostgreSQL When:**

**Option A: During Hosting Setup** ⭐ (RECOMMENDED)

- Set up hosting provider
- Set up PostgreSQL
- Configure environment variables
- Deploy with PostgreSQL from day 1

**Option B: After Testing on SQLite**

- Deploy to staging with SQLite first
- Test all features
- Migrate to PostgreSQL
- Deploy to production

**Option C: Start with PostgreSQL Locally**

- Set up Neon even for development
- Use PostgreSQL from beginning
- No migration needed later

---

## 🎯 RECOMMENDED TIMELINE

### **This Week (Day 2-3):**

1. Choose hosting provider (Vercel/Railway/VPS)
2. Create Neon account
3. Setup PostgreSQL database
4. Test migration locally

### **Next Week (Day 4-7):**

1. Deploy to staging with PostgreSQL
2. User acceptance testing
3. Fix any bugs

### **Week After (Day 8-10):**

1. Deploy to production
2. Monitor performance
3. Celebrate! 🎉

---

## 📞 SUPPORT

**Need Help?**

If you encounter issues during migration:

1. Check Neon documentation: https://neon.tech/docs
2. Prisma migration guides: https://www.prisma.io/docs/guides/migrate
3. Ask me! I can help troubleshoot.

---

## ✅ CONCLUSION

**PostgreSQL migration is straightforward:**

- Create account (5 min)
- Create database (5 min)
- Run migrations (5 min)
- Test connection (5 min)

**Total time: ~30 minutes for database setup**
**Total time including testing: 1-2 hours**

**Cost: $0/month to start** (Neon free tier)

**Ready to migrate?** Follow steps above when you setup hosting!

---

**Document Status:** Ready to Execute  
**Last Updated:** 2026-02-04  
**Next Step:** Execute when setting up production hosting

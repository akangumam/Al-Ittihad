# 🔐 SECURITY FIX #1: Default Password Problem

## 📋 PROBLEM EXPLAINED

**Current Situation:**

```typescript
// prisma/seed-complete.ts Line 106
const hashedPassword = await hash('password123', 10) // ← HARDCODED!
```

**Why This is Critical:**

1. ❌ **Public in Code** - Anyone can see GitHub repo and know password
2. ❌ **Predictable** - `password123` is too common
3. ❌ **Logged** - Password printed in console log
4. ❌ **Same for All** - All users have identical password

**Attack Scenario:**

```bash
Hacker → GitHub → seed-complete.ts → password123 → admin@alittihad.sch.id → ACCESS!
```

---

## ✅ SOLUTION OPTIONS

### **OPTION A: Force Password Change on First Login** ⭐ (RECOMMENDED)

**How it works:**

1. User logs in with temporary password (still `password123` but only once)
2. System immediately forces password change
3. User must set new password before accessing system
4. Temporary password becomes invalid after first use

**Pros:**

- ✅ Simple to implement
- ✅ Secure - password only works once
- ✅ User sets own password

**Cons:**

- ⚠️ User needs to remember to write down temp password

**Implementation:** See below

---

### **OPTION B: Random Generated Passwords** ⭐⭐ (MORE SECURE)

**How it works:**

1. Seed script generates unique random password per user
2. Password printed ONLY in terminal (not committed to git)
3. Admin must copy password and send to user via secure channel
4. Each user has different password

**Pros:**

- ✅ Most secure
- ✅ Unique per user
- ✅ No hardcoded passwords

**Cons:**

- ⚠️ Requires admin to manually distribute passwords
- ⚠️ Need secure password delivery method (email/WhatsApp/in-person)

**Implementation:** See below

---

### **OPTION C: No Default Password (Setup Wizard)** ⭐⭐⭐ (BEST BUT COMPLEX)

**How it works:**

1. First user (admin) creates account via setup wizard
2. Admin sets own password during setup
3. Admin creates other users from admin panel
4. System sends invitation email with temp password link

**Pros:**

- ✅ Most professional
- ✅ No default passwords at all
- ✅ Best security practice

**Cons:**

- ⚠️ Requires building setup wizard (2-3 hours work)
- ⚠️ More complex

**Implementation:** Requires more dev work

---

## 🛠️ IMPLEMENTATION - OPTION A (Recommended for Quick Fix)

### **Step 1: Add Field to User Model**

**File:** `prisma/schema.prisma`

```prisma
model User {
  id                  String                @id @default(cuid())
  name                String?
  email               String?               @unique
  emailVerified       DateTime?
  image               String?
  password            String?

  // ADD THESE TWO LINES:
  mustChangePassword  Boolean               @default(false)  // ← NEW
  passwordChangedAt   DateTime?                              // ← NEW

  role                String?               @default("member")
  // ... rest of fields
}
```

### **Step 2: Update Seed File**

**File:** `prisma/seed-complete.ts`

```typescript
// Replace line 105-135 with:

console.log('👥 Seeding users...')

// IMPORTANT: This password is TEMPORARY and must be changed on first login
const tempPassword = 'TempAl!ttihad2026' // Better than password123
const hashedPassword = await hash(tempPassword, 10)

await prisma.user.createMany({
  data: [
    {
      email: 'admin@alittihad.sch.id',
      name: 'Administrator',
      role: 'admin',
      password: hashedPassword,
      mustChangePassword: true, // ← Force change on login
      emailVerified: new Date()
    },
    {
      email: 'tu@alittihad.sch.id',
      name: 'Tata Usaha',
      role: 'staff',
      password: hashedPassword,
      mustChangePassword: true, // ← Force change on login
      emailVerified: new Date()
    },
    {
      email: 'guru@alittihad.sch.id',
      name: 'Guru',
      role: 'teacher',
      password: hashedPassword,
      mustChangePassword: true, // ← Force change on login
      emailVerified: new Date()
    }
  ]
})

console.log('✅ Users seeded: 3 users')
console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('⚠️  TEMPORARY PASSWORD (First Login Only)')
console.log('   Email: admin@alittihad.sch.id')
console.log('   Password: ' + tempPassword)
console.log('')
console.log('   ⚠️  MUST CHANGE PASSWORD AFTER FIRST LOGIN!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
```

### **Step 3: Add Login Check**

**File:** `src/libs/auth.ts`

Find the `authorize` function and add check:

```typescript
authorize: async credentials => {
  // ... existing code

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid email or password')
  }

  // ✅ ADD THIS CHECK:
  if (user.mustChangePassword) {
    // Store flag in session
    return {
      ...user,
      mustChangePassword: true
    }
  }

  return user
}
```

### **Step 4: Add Redirect After Login**

**File:** `src/app/[lang]/(blank-layout-pages)/(guest-only)/login/page.tsx`

Or wherever login redirect happens, add:

```typescript
// After successful login
const session = await getSession()

if (session?.user?.mustChangePassword) {
  // Redirect to change password page  router.push('/pages/account-settings?tab=security&force=true')
} else {
  // Normal redirect to dashboard
  router.push('/')
}
```

### **Step 5: Lock Account Settings Until Changed**

**File:** `src/views/pages/account-settings/security/ChangePasswordCard.tsx`

Add warning at top:

```typescript
{mustChangePassword && (
  <Alert severity="error" sx={{ mb: 3 }}>
    🔒 <strong>Security Required:</strong> You must change your temporary password before accessing the system.
  </Alert>
)}
```

---

## 🛠️ IMPLEMENTATION - OPTION B (Most Secure)

### **Step 1: Update Seed File Only**

**File:** `prisma/seed-complete.ts`

```typescript
import crypto from 'crypto'

console.log('👥 Seeding users...')

// Generate unique passwords for each user
const adminPassword = crypto.randomBytes(16).toString('hex').slice(0, 12) + 'Al!'
const tuPassword = crypto.randomBytes(16).toString('hex').slice(0, 12) + 'Tu!'
const guruPassword = crypto.randomBytes(16).toString('hex').slice(0, 12) + 'Gr!'

const adminHash = await hash(adminPassword, 10)
const tuHash = await hash(tuPassword, 10)
const guruHash = await hash(guruPassword, 10)

await prisma.user.createMany({
  data: [
    {
      email: 'admin@alittihad.sch.id',
      name: 'Administrator',
      role: 'admin',
      password: adminHash,
      emailVerified: new Date()
    },
    {
      email: 'tu@alittihad.sch.id',
      name: 'Tata Usaha',
      role: 'staff',
      password: tuHash,
      emailVerified: new Date()
    },
    {
      email: 'guru@alittihad.sch.id',
      name: 'Guru',
      role: 'teacher',
      password: guruHash,
      emailVerified: new Date()
    }
  ]
})

console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔐 INITIAL PASSWORDS - SAVE THESE!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log('📧 admin@alittihad.sch.id')
console.log('🔑 Password: ' + adminPassword)
console.log('')
console.log('📧 tu@alittihad.sch.id')
console.log('🔑 Password: ' + tuPassword)
console.log('')
console.log('📧 guru@alittihad.sch.id')
console.log('🔑 Password: ' + guruPassword)
console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('⚠️  IMPORTANT: ')
console.log('   1. COPY these passwords NOW')
console.log('   2. Send to users via secure channel')
console.log('   3. Users should change password after first login')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
```

**Pros of Option B:**

- ✅ Each user gets unique password
- ✅ Passwords are random & strong
- ✅ Not in git (only in seed output)

---

## 🎯 WHICH OPTION TO CHOOSE?

### **For Al-Ittihad, I Recommend:**

**OPTION A** (Force Password Change) if:

- ✅ Want quick implementation (30 min)
- ✅ Users will setup system themselves
- ✅ Can communicate temp password securely

**OPTION B** (Random Passwords) if:

- ✅ Want maximum security
- ✅ Admin will distribute passwords
- ✅ Have secure communication channel

---

## 📝 EXECUTION STEPS

**If you choose OPTION A:**

```bash
# 1. Update schema
# Add mustChangePassword field

# 2. Generate migration
npx prisma migrate dev --name add-password-change-field

# 3. Update seed file
# (code above)

# 4. Update auth logic
# (force redirect to change password)

# 5. Test
npm run db:reset-complete
npm run dev
# Try login → Should force password change
```

**If you choose OPTION B:**

```bash
# 1. Update seed file only  # (code above)

# 2. Reset database
npm run db:reset-complete

# 3. COPY passwords from terminal output

# 4. Send passwords to users securely
```

---

## ⏱️ TIME ESTIMATE

- **Option A:** 30-60 minutes (includes testing)
- **Option B:** 15 minutes (just update seed)

---

## 🆘 SUPPORT

Mau saya implement sekarang? Pilih option mana yang Anda prefer:

- **A:** Force password change (more work, better UX)
- **B:** Random passwords (quick fix, manual distribution)

Saya bisa langsung edit file dan implement! 🚀

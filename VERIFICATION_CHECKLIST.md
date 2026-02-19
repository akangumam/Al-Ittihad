# Verification Checklist - Form Migration to API

This document outlines the changes made to migrate the forms to use the new API endpoints and how to verify them.

## 1. SPP Payment Form (`src/views/spp/SPPPaymentForm.tsx`)

**Changes:**

- Removed dependency on `AppContext` (localStorage).
- Implemented API fetching for:
  - Students list (`GET /api/students`)
  - Bank Accounts (`GET /api/accounts`)
  - Payment History (`GET /api/spp-payments?studentId=...`)
- Implemented API submission (`POST /api/spp-payments`).
- Added loading states, error handling, and success toast.

**Verification Steps:**

1. Navigate to "Pembayaran SPP".
2. Select a student. Verify that the student list loads correctly.
3. Select months to pay. Verify that previously paid months are disabled/marked.
4. Select a destination account.
5. Click "Proses Pembayaran".
6. Verify that:
   - The button shows "Loading...".
   - A success toast appears.
   - The receipt dialog opens.
   - The payment is recorded in the database (check via API or database viewer).

## 2. Add Income Form (`src/views/financial/income/AddIncomeForm.tsx`)

**Changes:**

- Implemented API fetching for Accounts and Categories (`GET /api/accounts`, `GET /api/seed`).
- Implemented API submission (`POST /api/incomes`).
- Added loading states and error handling.

**Verification Steps:**

1. Navigate to "Keuangan" > "Pemasukan" > "Tambah Baru".
2. Verify that "Akun Tujuan" and "Kategori" dropdowns are populated.
3. Fill in the form.
4. Click "Simpan".
5. Verify success toast and redirection to the income list.

## 3. Add Expense Form (`src/views/financial/expense/AddExpenseForm.tsx`)

**Changes:**

- Implemented API fetching for Accounts and Categories.
- Implemented API submission (`POST /api/expenses`).
- Added loading states and error handling.

**Verification Steps:**

1. Navigate to "Keuangan" > "Pengeluaran" > "Tambah Baru".
2. Verify that "Sumber Dana" and "Kategori" dropdowns are populated.
3. Fill in the form.
4. Click "Simpan Pengeluaran".
5. Verify success toast and redirection to the expense list.

## 4. General Improvements

- **Loading States:** All submit buttons now show a spinner and are disabled during submission.
- **Error Handling:** API errors are caught and displayed in an Alert component and/or Toast.
- **Data Validation:** Basic client-side validation ensures required fields are filled.

## Next Steps

- Migrate data tables (Student List, Transaction Lists) to use API pagination and filtering.
- Fully replace `AppContext` with `AppContextV2` or direct API calls throughout the app.

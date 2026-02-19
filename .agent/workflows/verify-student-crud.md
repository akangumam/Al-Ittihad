---
description: Verify Student CRUD Functionality
---

# Student CRUD Verification Workflow

Follow these steps to verify that the Student Data Management (CRUD) features are working correctly.

## 1. Verify Student List (Read)

1. Navigate to the **Data Siswa** page: `http://localhost:3000/id/akademik/data-siswa` (or your local port).
2. Ensure the table displays a list of students.
3. Verify that columns like NIS, Name, Class, and Status are visible.

## 2. Verify Create Student (Create)

1. Click the **"Tambah Siswa Baru"** button.
2. Fill in the required fields:
   - **NIS**: (e.g., 2024999)
   - **NISN**: (e.g., 0012345678)
   - **Nama Lengkap**: (e.g., Test Siswa Baru)
   - **Jenis Kelamin**: Laki-laki/Perempuan
   - **Tingkat/Kelas**: (e.g., Kelas 7)
3. Fill in other optional fields if desired.
4. Click **"Simpan Data Siswa"**.
5. You should be redirected back to the list.
6. **Verify**: The new student "Test Siswa Baru" should appear in the table.

## 3. Verify Student Detail (Read)

1. Click on the **"Lihat Detail"** (eye icon) or the NIS link for the newly created student.
2. **Verify**: The detail page should show the correct information you just entered (Name, NIS, Class, etc.).
3. Check the "Profil Lengkap" tab to see all details.

## 4. Verify Update Student (Update)

1. From the detail page, click the **"Edit"** button, OR from the list, click the option menu (three dots) and select **"Edit Data"**.
2. Change some information, for example:
   - Change **Nama Lengkap** to "Test Siswa Edit".
   - Change **Status** to "Cuti".
3. Click **"Simpan Perubahan"**.
4. You should be redirected back to the list.
5. **Verify**: The name should now be "Test Siswa Edit" and status "Cuti".

## 5. Verify Delete Student (Delete)

1. In the student list, find "Test Siswa Edit".
2. Click the option menu (three dots).
3. Select **"Hapus"**.
4. Confirm the browser alert dialog ("Apakah Anda yakin...?").
5. **Verify**: The student should be removed from the table.

## 6. Verify Data Persistence (In-Memory)

1. Since the app currently uses `AppContext` (in-memory state), data will persist as long as you don't refresh the browser (unless `localStorage` persistence is fully active and working).
2. Try navigating to other pages (e.g., Dashboard) and come back to Data Siswa. The data should still be there.

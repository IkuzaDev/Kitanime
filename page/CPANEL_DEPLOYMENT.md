# Panduan Deployment FreeNime di cPanel

## Langkah-langkah Deploy di cPanel

### 1. Persiapan File
Pastikan file berikut sudah ada di project:
- `server.js` (sudah dibuat)
- `.htaccess` (sudah dibuat)
- `package.json` (sudah ada)

### 2. Upload ke cPanel
1. Login ke cPanel hosting
2. Masuk ke **File Manager**
3. Upload semua file project ke dalam folder `public_html` atau subdomain yang diinginkan

### 3. Setup Node.js Application di cPanel
1. Di cPanel, cari menu **"Setup Node.js App"**
2. Klik **"Create Application"**
3. Isi form dengan:
   - **Application mode**: Production
   - **Application root**: (folder tempat project berada, misalnya `public_html`)
   - **Application URL**: (domain atau subdomain yang digunakan)
   - **Application startup file**: `server.js`
   - **Node.js version**: Pilih versi terbaru (v18 atau v20)

### 4. Install Dependencies
1. Setelah app dibuat, klik **"Run NPM Install"**
2. Tunggu hingga semua dependencies terinstall
3. Jika ada error, bisa juga jalankan via terminal dengan:
   ```
   npm install --production
   ```

### 5. Konfigurasi Environment
1. Buat file `.env` di root folder jika diperlukan
2. Contoh konfigurasi `.env`:
   ```
   NODE_ENV=production
   PORT=3000
   ```

### 6. Jalankan Aplikasi
1. Klik **"Start App"** di cPanel
2. Pastikan status berubah menjadi **"Running"**
3. Akses website melalui domain yang sudah dikonfigurasi

### 7. Troubleshooting

#### Port Configuration
- Pastikan port di `server.js` menggunakan `process.env.PORT || 3000`
- Port ini akan di-handle otomatis oleh cPanel

#### Database SQLite
- Database SQLite (`freenime.db`) akan berjalan otomatis
- Pastikan file `freenime.db` memiliki permission 644

#### Error 503 Service Unavailable
- Restart aplikasi dari cPanel
- Cek error log di **"Node.js App"** > **"Log"**

#### Permission Error
- Pastikan semua file memiliki permission yang benar:
  - File: 644
  - Folder: 755
  - `server.js`: 755 (executable)

### 8. Update Aplikasi
1. Upload file yang sudah diupdate ke cPanel
2. Di **"Setup Node.js App"**, klik **"Restart"**
3. Jika ada perubahan dependencies, jalankan **"Run NPM Install"** lagi

### 9. Monitoring
- Gunakan **"Log"** di Node.js App untuk monitoring error
- Cek **"Metrics"** untuk melihat resource usage

### 10. Backup
- Backup database: Download file `freenime.db`
- Backup file: Download seluruh project folder

### Tips Keamanan
- Jangan commit file `.env` ke git
- Pastikan `node_modules` tidak diupload (gunakan npm install di cPanel)
- Gunakan HTTPS dengan SSL certificate

### Kontak Support
Jika mengalami masalah, cek:
1. cPanel error logs
2. Node.js application logs
3. Pastikan semua dependencies terinstall dengan benar
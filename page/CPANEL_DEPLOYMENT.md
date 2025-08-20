# cPanel Deployment Guide untuk KitaNime

## Masalah yang Diperbaiki

Error yang sering terjadi di cPanel:
```
Failed to start server: Error: http.Server.listen() was called more than once
```

## Solusi yang Diterapkan

### 1. Struktur File Baru
- `app.js` - Express application (tidak langsung menjalankan server)
- `server.js` - Production server entry point
- `startup.js` - cPanel-specific startup script
- `.htaccess` - Apache configuration untuk cPanel

### 2. Cara Deploy di cPanel

#### Opsi 1: Menggunakan server.js (Recommended)
```bash
node server.js
```

#### Opsi 2: Menggunakan startup.js (Untuk environment yang kompleks)
```bash
node startup.js
```

#### Opsi 3: Menggunakan npm scripts
```bash
npm start          # Menjalankan server.js
npm run production # Menjalankan server.js dengan flag production
```

### 3. Environment Variables untuk cPanel

Tambahkan di cPanel Node.js App settings:
```
NODE_ENV=production
CPANEL_ENV=true
SHARED_HOSTING=true
PORT=3001
SESSION_SECRET=your-secret-key-here
```

### 4. File yang Harus Diupload ke cPanel

```
├── app.js                 # Main Express app
├── server.js             # Production server
├── startup.js            # cPanel startup script
├── .htaccess             # Apache config
├── package.json          # Dependencies
├── routes/               # Route files
├── views/                # Pug templates
├── public/               # Static assets
├── models/               # Database models
├── services/             # API services
├── middleware/           # Custom middleware
└── data/                 # Database files
```

### 5. Langkah-langkah Deploy

1. **Upload semua file** ke directory aplikasi Node.js di cPanel

2. **Install dependencies** melalui cPanel Node.js interface atau terminal:
   ```bash
   npm install
   ```

3. **Set startup file** di cPanel Node.js App:
   - Startup File: `server.js`
   - atau gunakan: `startup.js`

4. **Restart aplikasi** melalui cPanel Node.js interface

### 6. Troubleshooting

#### Jika masih ada error "listen() called more than once":

1. **Pastikan hanya satu entry point** yang digunakan:
   - Gunakan `server.js` ATAU `startup.js`, jangan keduanya
   - Jangan jalankan `app.js` secara langsung

2. **Check environment variables**:
   ```bash
   echo $NODE_ENV
   echo $CPANEL_ENV
   ```

3. **Restart Node.js app** di cPanel:
   - Stop aplikasi
   - Tunggu 30 detik
   - Start kembali

4. **Check process yang berjalan**:
   ```bash
   ps aux | grep node
   ```
   Jika ada multiple process, kill semua dan restart.

#### Jika ada error database:

1. **Pastikan folder data/ ada** dan writable
2. **Check path database** di `models/database.js`
3. **Pastikan SQLite3 terinstall** di server

### 7. Monitoring

Untuk monitoring aplikasi di cPanel:

```bash
# Check logs
tail -f ~/logs/nodejs_app.log

# Check process
ps aux | grep node

# Check port
netstat -tulpn | grep :3001
```

### 8. Performance Tips untuk cPanel

1. **Gunakan compression** (sudah diaktifkan di .htaccess)
2. **Cache static assets** (sudah dikonfigurasi)
3. **Limit memory usage** dengan environment variables
4. **Use production session store** (bukan MemoryStore)

### 9. Security untuk Production

1. **Ganti SESSION_SECRET** dengan nilai yang aman
2. **Set NODE_ENV=production**
3. **Disable debug logs** di production
4. **Use HTTPS** jika tersedia

---

## Catatan Penting

- File `app.js` sekarang **TIDAK** langsung menjalankan server
- Gunakan `server.js` atau `startup.js` sebagai entry point
- Circular dependency di `routes/index.js` sudah diperbaiki
- Aplikasi sekarang aman untuk environment shared hosting
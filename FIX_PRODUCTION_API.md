# Fix Production API Port Issue

## Problem
Production masih memanggil port 3001 padahal sudah diupdate ke 8181.

## Root Cause
Vite meng-inject environment variables saat **build time**, bukan runtime. Jika build dibuat dengan `.env.production` yang masih menggunakan port 3001, semua API calls akan tetap menggunakan port 3001.

## Solution

### Step 1: Update .env.production di VPS

SSH ke VPS dan update file `.env.production`:

```bash
cd /var/www/tomo-batik
nano .env.production
```

Pastikan isinya:

```env
VITE_API_URL=http://localhost:8181/api
VITE_CHECKOUT_URL=http://localhost:8181/checkout
VITE_ORDER_API_URL=http://localhost:8181
```

### Step 2: Rebuild Aplikasi

Setelah update `.env.production`, **WAJIB rebuild** aplikasi:

```bash
cd /var/www/tomo-batik
npm run build
```

### Step 3: Copy Build Baru ke Nginx Directory

```bash
sudo cp -r dist/* /var/www/tomo-batik/dist/
# Atau jika dist sudah di lokasi yang benar, skip step ini
```

### Step 4: Reload Nginx

```bash
sudo nginx -t  # Test konfigurasi
sudo systemctl reload nginx
```

### Step 5: Clear Browser Cache

Clear cache browser atau hard refresh (Ctrl+Shift+R / Cmd+Shift+R) untuk memastikan file JavaScript baru ter-load.

## Verification

Cek di browser console (F12) atau Network tab, pastikan semua API calls menggunakan port 8181, bukan 3001.

## Important Notes

⚠️ **PENTING**: Setiap kali mengubah `.env.production`, **WAJIB rebuild** aplikasi karena environment variables di-inject saat build time.

✅ **Best Practice**: Simpan `.env.production` di repository (atau dokumentasikan) agar tidak lupa konfigurasi yang benar.





# Quick Start Guide - Deploy Tomo Batik ke VPS

Panduan cepat untuk deploy aplikasi Tomo Batik ke VPS Ubuntu 24.04 LTS.

## 🚀 Langkah Cepat (5 Menit)

### 1. Persiapan di VPS

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Install PM2
sudo npm install -g pm2

# Setup firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Clone dan Build Project

```bash
# Clone repository
cd /var/www
sudo git clone <YOUR_REPO_URL> tomo-batik
sudo chown -R $USER:$USER /var/www/tomo-batik
cd tomo-batik

# Install dependencies
npm install

# Buat file environment
echo "VITE_API_URL=http://localhost:3001/api" > .env.production
# Atau jika backend di server berbeda:
# echo "VITE_API_URL=https://api.yourdomain.com/api" > .env.production

# Build project
npm run build
```

### 3. Setup Nginx

```bash
# Copy konfigurasi
sudo cp nginx.conf.example /etc/nginx/sites-available/tomo-batik

# Edit konfigurasi (ganti yourdomain.com dengan domain/IP Anda)
sudo nano /etc/nginx/sites-available/tomo-batik

# Enable site
sudo ln -s /etc/nginx/sites-available/tomo-batik /etc/nginx/sites-enabled/

# Test dan reload
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Setup SSL (Opsional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Setup Backend (Jika diperlukan)

```bash
cd /var/www/tomo-batik/database/backend-example

# Install dependencies
npm install

# Buat .env file
nano .env
# Tambahkan konfigurasi database dan port

# Start dengan PM2
pm2 start server.js --name tomo-batik-api
pm2 startup
pm2 save
```

## ✅ Selesai!

Aplikasi Anda sekarang sudah online di:
- HTTP: `http://yourdomain.com` atau `http://YOUR_VPS_IP`
- HTTPS: `https://yourdomain.com` (jika sudah setup SSL)

## 📝 Perintah Berguna

```bash
# Lihat status aplikasi
pm2 status
pm2 logs tomo-batik-api

# Update aplikasi
cd /var/www/tomo-batik
git pull
npm install
npm run build
sudo systemctl reload nginx

# Cek log Nginx
sudo tail -f /var/log/nginx/error.log
```

## 🔧 Troubleshooting

**Aplikasi tidak muncul?**
- Cek: `sudo systemctl status nginx`
- Cek: `sudo nginx -t`
- Cek log: `sudo tail -f /var/log/nginx/error.log`

**Backend tidak bekerja?**
- Cek: `pm2 status`
- Cek: `curl http://localhost:3001/api/health`
- Cek log: `pm2 logs tomo-batik-api`

**Permission denied?**
- Pastikan ownership: `sudo chown -R $USER:$USER /var/www/tomo-batik`

## 📚 Dokumentasi Lengkap

Lihat `DEPLOYMENT.md` untuk panduan lengkap dan detail.




# Panduan Deploy Tomo Batik ke VPS Ubuntu 24.04 LTS

Panduan lengkap untuk mendeploy aplikasi Tomo Batik ke VPS Ubuntu 24.04 LTS menggunakan Nginx sebagai reverse proxy.

## Prasyarat

- VPS Ubuntu 24.04 LTS
- Akses root atau user dengan sudo privileges
- Domain name (opsional, bisa menggunakan IP address)
- SSH access ke VPS

## Langkah 1: Persiapan Server

### 1.1 Update Sistem

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Node.js (menggunakan NodeSource)

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

### 1.3 Install Nginx

```bash
sudo apt install -y nginx

# Start dan enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verifikasi status
sudo systemctl status nginx
```

### 1.4 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 1.5 Install Git

```bash
sudo apt install -y git
```

## Langkah 2: Setup Firewall

```bash
# Allow SSH, HTTP, dan HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Langkah 3: Clone dan Setup Project

### 3.1 Clone Repository

```bash
# Buat direktori untuk aplikasi
sudo mkdir -p /var/www
cd /var/www

# Clone repository (ganti dengan URL repository Anda)
sudo git clone <YOUR_REPO_URL> tomo-batik
sudo chown -R $USER:$USER /var/www/tomo-batik
cd tomo-batik
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Buat File Environment

```bash
# Buat file .env untuk production
nano .env.production
```

Tambahkan konfigurasi berikut (sesuaikan dengan backend API Anda):

```env
VITE_API_URL=https://api.yourdomain.com/api
```

Atau jika backend di server yang sama:

```env
VITE_API_URL=http://localhost:8181/api
```

### 3.4 Build Project

```bash
npm run build
```

File build akan berada di folder `dist/`.

## Langkah 4: Setup Nginx

### 4.1 Buat Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/tomo-batik
```

Tambahkan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # Jika tidak punya domain, ganti dengan IP address VPS Anda
    # server_name YOUR_VPS_IP;

    root /var/www/tomo-batik/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

### 4.2 Enable Site

```bash
# Buat symbolic link
sudo ln -s /etc/nginx/sites-available/tomo-batik /etc/nginx/sites-enabled/

# Test konfigurasi Nginx
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Langkah 5: Setup SSL dengan Let's Encrypt (Opsional tapi Direkomendasikan)

### 5.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Generate SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot akan otomatis mengkonfigurasi Nginx untuk menggunakan HTTPS.

### 5.3 Auto-renewal

Certbot sudah setup auto-renewal, tapi bisa test dengan:

```bash
sudo certbot renew --dry-run
```

## Langkah 6: Setup Backend (Jika Backend di Server yang Sama)

### 6.1 Setup Backend

```bash
cd /var/www/tomo-batik/database/backend-example

# Install dependencies
npm install

# Buat file .env untuk backend
nano .env
```

Tambahkan konfigurasi:

```env
PORT=8181
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tomo_batik
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

### 6.2 Setup Database PostgreSQL (Jika diperlukan)

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Buat database dan user
sudo -u postgres psql
```

Di dalam PostgreSQL prompt:

```sql
CREATE DATABASE tomo_batik;
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE tomo_batik TO your_db_user;
\q
```

Import schema:

```bash
sudo -u postgres psql tomo_batik < /var/www/tomo-batik/database/schema.sql
```

### 6.3 Setup Backend dengan PM2

```bash
cd /var/www/tomo-batik/database/backend-example

# Start dengan PM2
pm2 start server.js --name tomo-batik-api

# Setup PM2 untuk auto-start saat reboot
pm2 startup
pm2 save
```

### 6.4 Update Nginx untuk Proxy Backend

Edit `/etc/nginx/sites-available/tomo-batik`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/tomo-batik/dist;
    index index.html;

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:8181;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Langkah 7: Monitoring dan Maintenance

### 7.1 Monitor dengan PM2

```bash
# Lihat status aplikasi
pm2 status

# Lihat logs
pm2 logs tomo-batik-api

# Restart aplikasi
pm2 restart tomo-batik-api
```

### 7.2 Update Aplikasi

```bash
cd /var/www/tomo-batik

# Pull perubahan terbaru
git pull origin main

# Install dependencies baru (jika ada)
npm install

# Rebuild aplikasi
npm run build

# Restart Nginx
sudo systemctl reload nginx
```

## Troubleshooting

### Cek Log Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Cek Status Services

```bash
sudo systemctl status nginx
pm2 status
```

### Test Koneksi Backend

```bash
curl http://localhost:8181/api/health
```

## Keamanan Tambahan

1. **Setup Fail2Ban** (opsional):
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

2. **Disable root login SSH** (edit `/etc/ssh/sshd_config`):
```
PermitRootLogin no
```

3. **Setup automatic security updates**:
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Struktur Direktori Final

```
/var/www/tomo-batik/
├── dist/              # Build output (dilayani oleh Nginx)
├── src/               # Source code
├── database/          # Backend dan database
└── ...
```

## Catatan Penting

1. Pastikan port 80 dan 443 terbuka di firewall
2. Jika menggunakan domain, pastikan DNS sudah diarahkan ke IP VPS
3. Backup database secara berkala
4. Monitor resource usage (CPU, RAM, Disk) secara berkala

## Support

Jika ada masalah, cek:
- Log Nginx: `/var/log/nginx/`
- Log PM2: `pm2 logs`
- Log sistem: `journalctl -u nginx`




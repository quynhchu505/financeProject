# Hướng Dẫn Deploy Lên AWS EC2

## Yêu Cầu
- AWS EC2 instance (Ubuntu 20.04+)
- Docker & Docker Compose đã cài đặt
- Domain: `depmaxau.io.vn` đã trỏ về IP EC2

---

## Các Bước Deploy

### 1. SSH vào EC2
```bash
ssh -i your-key.pem ubuntu@<EC2-IP>
```

### 2. Cài đặt Docker & Docker Compose
```bash
# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# Docker Compose V2 (tích hợp sẵn trong Docker mới)
# Hoặc cài riêng:
sudo apt update && sudo apt install -y docker-compose
```

### 3. Tải code lên EC2
```bash
# Cách 1: Git clone (nếu push lên GitHub trước)
git clone https://github.com/YOUR_USERNAME/DATN.git
cd DATN

# Cách 2: SCP
scp -i your-key.pem -r ./DATN ubuntu@<EC2-IP>:/home/ubuntu/
```

### 4. Tạo file .env
```bash
cd /home/ubuntu/DATN
cp .env.production backend/.env
nano backend/.env
# Chỉnh sửa:
#   SECRET_KEY: tạo khóa mới ngẫu nhiên (openssl rand -hex 64)
#   GROQ_API_KEY: API key của bạn
#   SMTP_USER/SMTP_PASSWORD: email gửi thông báo
```

### 5. Build và Chạy
```bash
cd /home/ubuntu/DATN
docker-compose up -d --build

# Kiểm tra trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f
```

### 6. Mở Port trên AWS Security Group
- **Inbound Rules**: mở `80` (HTTP) và `443` (HTTPS)

### 7. Cấu Hình HTTPS
Thêm container `nginx-proxy` để handle HTTPS với Let's Encrypt:

```bash
cd /home/ubuntu/DATN
mkdir -p nginx/ssl
```

Tạo file `docker-compose.prod.yml`:
```yaml
services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/proxy.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend

  nginx-letsencrypt:
    image: nginxproxy/acme-companion
    environment:
      - DEFAULT_EMAIL=your@email.com
    volumes_from:
      - nginx-proxy
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

Tạo file `nginx/proxy.conf`:
```nginx
server {
    listen 80;
    server_name depmaxau.io.vn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name depmaxau.io.vn;

    ssl_certificate /etc/nginx/ssl/live/depmaxau.io.vn/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/depmaxau.io.vn/privkey.pem;

    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Chạy HTTPS:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Các Lệnh Quản Lý

```bash
# Restart
docker-compose restart

# Stop
docker-compose down

# Rebuild không dùng cache
docker-compose build --no-cache

# Shell vào container
docker exec -it finance_backend /bin/bash
```

---

## Xử Lý Sự Cố

```bash
# Kiểm tra logs
docker-compose logs

# Kiểm tra container có chạy không
docker ps

# Kiểm tra API
curl http://localhost/api/v1/auth/me
```





# 1. Copy code lên EC2
scp -i key.pem -r . ubuntu@<EC2-IP>:/home/ubuntu/DATN

# 2. Tạo .env ở backend
cp .env.production backend/.env
# Chỉnh SECRET_KEY, GROQ_API_KEY, SMTP...

# 3. Chạy (không HTTPS - port 80)
docker-compose up -d --build

# HOẶC chạy với HTTPS
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

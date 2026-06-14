#!/usr/bin/env bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "Run as root or use sudo: sudo $0 <domain> <email>"
  exit 1
fi

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Usage: sudo $0 example.api.domain.com you@example.com"
  exit 1
fi

echo "Installing nginx and certbot..."
apt-get update
apt-get install -y nginx curl

systemctl enable --now nginx

CONF="/etc/nginx/sites-available/$DOMAIN"
BACKEND_UPSTREAM="http://127.0.0.1:8000"

cat > "$CONF" <<'NGINXCONF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    client_max_body_size 200M;

    location / {
        proxy_pass BACKEND_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_buffering off;
    }
}
NGINXCONF

# Replace placeholders
sed -i "s|DOMAIN_PLACEHOLDER|$DOMAIN|g" "$CONF"
sed -i "s|BACKEND_PLACEHOLDER|$BACKEND_UPSTREAM|g" "$CONF"

ln -sf "$CONF" /etc/nginx/sites-enabled/$DOMAIN

nginx -t
systemctl reload nginx

echo "Requesting TLS certificate from Let's Encrypt (certbot)..."
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || {
  echo "certbot failed — check DNS and that port 80 is reachable from the internet." >&2
  exit 1
}

echo "TLS installed and Nginx configured for $DOMAIN"
echo "Verify with: curl -I https://$DOMAIN/api/v1/health"

**Deploy Nginx + Let's Encrypt on EC2**

1. SSH to your EC2 instance and git clone this repo:

```bash
git clone <your-repo-url>
cd DATN
```

2. Make the setup script executable and run it as root:

```bash
sudo chmod +x deploy/setup_nginx_certbot.sh
sudo deploy/setup_nginx_certbot.sh api.your-domain.com you@your.email
```

3. What the script does:
- Installs `nginx` and `certbot` (Let's Encrypt plugin)
- Writes an Nginx site config at `/etc/nginx/sites-available/<domain>` that proxies requests to `http://127.0.0.1:8000`
- Enables the site and reloads Nginx
- Requests and installs TLS cert via `certbot --nginx` and enables automatic HTTP→HTTPS redirect

4. Post-steps to verify:

```bash
curl -I https://api.your-domain.com/api/v1/health
```

5. Notes:
- The script assumes your backend listens on host `127.0.0.1:8000` (docker mapping `-p 8000:8000`).
- Ensure EC2 Security Group allows inbound TCP 80 and 443.
- If your distribution is not Debian/Ubuntu, adapt package manager commands (`yum`, `dnf`, etc.).

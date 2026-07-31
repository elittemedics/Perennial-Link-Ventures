# Hostinger Cloud Startup Deployment Guide
## Perennial Link Ventures Business Directory Platform

This guide deploys the self-hosted **Perennial Link Ventures Business Directory Platform** on a **Hostinger VPS or Cloud server with Node.js access**, PostgreSQL, PM2, and Nginx. Shared web hosting cannot run this full Next.js/Prisma application.

> **Important:** Do not deploy the `.next` folder or an exported static site to `public_html`. This app uses Next.js API routes (`/api/*`), Prisma, authentication, and uploads. Serving it as static files makes API calls return Hostinger's HTML 404 page, which browsers may otherwise report as `Unexpected token '<'` when code expects JSON.

---

## 1. Hostinger Cloud Startup Server Prerequisites

- **OS:** Ubuntu 22.04 LTS
- **RAM:** Minimum 3GB (Hostinger Cloud Startup comes with 3GB+ RAM & 2 vCPU)
- **Node.js:** v20.x LTS
- **Database:** PostgreSQL Server v16+
- **Process Manager:** PM2
- **Web Server:** Nginx

---

## 2. Server Environment Setup

Connect to your Hostinger VPS via SSH:
```bash
ssh root@your-hostinger-ip-address
```

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx postgresql postgresql-contrib
```

Install Node.js 20 LTS:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

---

## 3. PostgreSQL Database Configuration

Log into PostgreSQL as the database administrator:
```bash
sudo -u postgres psql
```

Create the directory database and dedicated user:
```sql
CREATE USER perennial_user WITH PASSWORD 'YourStrongPassword123!';
CREATE DATABASE perennial_directory OWNER perennial_user;
\\q
```

---

## 4. Code Base Deployment & Installation

Clone or upload your project code to `/var/www/perennial-directory`:
```bash
sudo mkdir -p /var/www/perennial-directory
sudo chown -R $USER:$USER /var/www/perennial-directory
cd /var/www/perennial-directory
```

Install the locked production dependencies:
```bash
corepack enable
pnpm install --frozen-lockfile
```

Configure production environment variables in `.env`:
```bash
nano .env
```
Ensure the following variables match your server:
```env
DATABASE_URL="postgresql://perennial_user:YourStrongPassword123!@localhost:5432/perennial_directory?schema=public"
NEXTAUTH_SECRET="your-32-character-random-secret-key"
NEXTAUTH_URL="https://perenniallink.com"
NEXT_PUBLIC_APP_NAME="Perennial Link Ventures"
NEXT_PUBLIC_APP_URL="https://perenniallink.com"
NEXT_PUBLIC_CONTACT_PHONE="0545898775"
NEXT_PUBLIC_CONTACT_LOCATION="Tuba/Weija, Greater Accra, Ghana"
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="noreply@perenniallink.com"
SMTP_PASSWORD="your-email-password"
EMAIL_FROM_NAME="Perennial Link Directory"
EMAIL_FROM="noreply@perenniallink.com"
UPLOAD_DIR="./public/uploads"
SEED_DEFAULT_PASSWORD="use-a-unique-long-password-here"
```

---

## 5. Prisma Database Migration & Seeding

Run Prisma schema push to generate PostgreSQL tables:
```bash
npx prisma db push
```

Run the seed script to populate default Admin credentials and initial categories/businesses:
```bash
pnpm run db:seed
```

The seed command requires `SEED_DEFAULT_PASSWORD` in production. Use a unique password manager-generated password, sign in once to confirm it works, then rotate it or remove the seed-only environment variable. Never use a documented/default administrator password on a public deployment.

---

## 6. Next.js Production Build & PM2 Process Execution

Build the Next.js production bundle:
```bash
pnpm run build
```

Start the application with PM2:
```bash
pm2 start pnpm --name "perennial-directory" -- start
pm2 save
pm2 startup
```

---

## 7. Nginx Reverse Proxy & SSL Configuration

Create an Nginx configuration file for your domain:
```bash
sudo nano /etc/nginx/sites-available/perenniallink.com
```

Add the following Nginx server block:
```nginx
server {
    listen 80;
    server_name perenniallink.com www.perenniallink.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    }

    location /uploads/ {
        alias /var/www/perennial-directory/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/perenniallink.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Install Certbot for free SSL:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d perenniallink.com -d www.perenniallink.com
```

---

## 8. Verification & Maintenance Checklist

- [x] Test registration and login flow (`/login`, `/register`).
- [x] Test image uploads (verified Sharp WebP output in `/public/uploads/`).
- [x] Check Admin approval dashboard at `/dashboard/admin/listings`.
- [x] Verify dynamic `sitemap.xml` and `robots.txt` URLs.
- [x] Confirm Nodemailer transactional email delivery.

Your **Perennial Link Ventures Business Directory Platform** is now fully operational on Hostinger Cloud Startup!

---

## 9. Troubleshooting

### ❌ `The table 'public.User' does not exist in the current database`

**Full error message:**
```
Invalid `prisma.user.findUnique()` invocation:
The table `public.User` does not exist in the current database.
```

**What it means:**  
Prisma can connect to PostgreSQL successfully, but the database schema has not been applied yet. The `User` table (and all other application tables) are missing from the `public` schema. This typically happens when:

- `npx prisma db push` was skipped or failed silently during deployment.
- The `DATABASE_URL` in `.env` points to a different database than the one where the schema was pushed.
- The schema was pushed to a different schema namespace (e.g., a non-`public` schema).
- The PostgreSQL user lacks the `CREATE TABLE` privilege required to apply the schema.

**Fix — re-run the schema push:**

SSH into your server and navigate to the project root:
```bash
cd /var/www/perennial-directory
```

Confirm the `DATABASE_URL` is correct:
```bash
grep DATABASE_URL .env
```

Re-apply the Prisma schema to create all tables:
```bash
npx prisma db push
```

If the push fails with a permissions error, grant the required privileges first:
```bash
sudo -u postgres psql
```
```sql
GRANT ALL PRIVILEGES ON DATABASE perennial_directory TO perennial_user;
GRANT ALL ON SCHEMA public TO perennial_user;
\q
```

Then retry:
```bash
npx prisma db push
```

After a successful push, re-seed the database and restart the PM2 process:
```bash
pnpm run db:seed
pm2 restart perennial-directory
```

Verify the tables now exist:
```bash
sudo -u postgres psql -d perennial_directory -c "\dt public.*"
```

You should see a list of tables including `User`, `Business`, `Category`, etc. The application should now respond correctly to authentication and data requests.

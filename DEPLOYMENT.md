# 🚀 Production Deployment Guide

This guide covers multiple deployment options for the Baseball Stats App on customer infrastructure.

## 📋 Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows with WSL2
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: 10GB free space
- **Network**: Internet access for API calls and package downloads

### Required Software
- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git** (for code deployment)
- **curl** (for health checks)

## 🐳 Option 1: Docker Deployment (Recommended)

### Quick Start
```bash
# 1. Clone the repository
git clone <repository-url>
cd fractional_work

# 2. Configure environment
cp env.production.example .env
# Edit .env with your settings (DB_PASSWORD, GEMINI_API_KEY)

# 3. Deploy
./deploy.sh
```

### Manual Docker Deployment
```bash
# Build and start services
docker-compose up -d --build

# Initialize database
docker-compose exec app python database_setup.py

# Check health
curl http://localhost:5000/api/health
```

### Access Points
- **Application**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health
- **Database**: localhost:5432 (PostgreSQL)

## 🖥️ Option 2: Traditional Server Deployment

### Ubuntu/Debian Server Setup

#### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm postgresql postgresql-contrib nginx

# Install Node.js 18+ (if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Database Setup
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE baseball_db;
CREATE USER baseball_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE baseball_db TO baseball_user;
\q
```

#### 3. Application Deployment
```bash
# Create application directory
sudo mkdir -p /opt/baseball-stats
sudo chown $USER:$USER /opt/baseball-stats
cd /opt/baseball-stats

# Clone repository
git clone <repository-url> .

# Backend setup
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm ci
npm run build

# Configure environment
cp ../env.production.example ../.env
# Edit .env with your settings
```

#### 4. Systemd Service Setup
```bash
# Create systemd service
sudo tee /etc/systemd/system/baseball-stats.service > /dev/null <<EOF
[Unit]
Description=Baseball Stats App
After=network.target postgresql.service

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/opt/baseball-stats/backend
Environment=PATH=/opt/baseball-stats/backend/venv/bin
ExecStart=/opt/baseball-stats/backend/venv/bin/python run_production.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable baseball-stats
sudo systemctl start baseball-stats
```

#### 5. Nginx Configuration
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/baseball-stats > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Static files
    location /static/ {
        alias /opt/baseball-stats/frontend/build/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Frontend routes
    location / {
        root /opt/baseball-stats/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/baseball-stats /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## ☁️ Option 3: Cloud Platform Deployment

### AWS EC2 Deployment
```bash
# Launch EC2 instance (Ubuntu 20.04, t3.medium recommended)
# Security Group: Allow HTTP (80), HTTPS (443), SSH (22)

# Connect and deploy
ssh -i your-key.pem ubuntu@your-ec2-ip
# Follow Option 2 steps above
```

### DigitalOcean Droplet
```bash
# Create droplet (Ubuntu 20.04, 2GB RAM minimum)
# Follow Option 2 steps above
```

### Google Cloud Platform
```bash
# Create VM instance
gcloud compute instances create baseball-stats \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-medium \
    --zone=us-central1-a

# SSH and deploy
gcloud compute ssh baseball-stats --zone=us-central1-a
# Follow Option 2 steps above
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
DB_PASSWORD=your_secure_database_password
GEMINI_API_KEY=your_gemini_api_key

# Optional
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your_secret_key
EXTERNAL_API_URL=https://api.hirefraction.com/api/test/baseball
```

### SSL/HTTPS Setup (Recommended)
```bash
# Using Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Application health
curl http://your-domain.com/api/health

# Database connection
sudo -u postgres psql -d baseball_db -c "SELECT COUNT(*) FROM players;"

# Service status
sudo systemctl status baseball-stats
```

### Logs
```bash
# Application logs
sudo journalctl -u baseball-stats -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Docker logs (if using Docker)
docker-compose logs -f
```

### Backup Strategy
```bash
# Database backup
sudo -u postgres pg_dump baseball_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
sudo tee /opt/backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/opt/backups"
mkdir -p \$BACKUP_DIR
sudo -u postgres pg_dump baseball_db > \$BACKUP_DIR/backup_\$(date +%Y%m%d_%H%M%S).sql
find \$BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

sudo chmod +x /opt/backup.sh
# Add to crontab: 0 2 * * * /opt/backup.sh
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Docker deployment
git pull
docker-compose down
docker-compose up -d --build

# Traditional deployment
git pull
cd backend && source venv/bin/activate && pip install -r requirements.txt
cd ../frontend && npm ci && npm run build
sudo systemctl restart baseball-stats
```

### Database Migrations
```bash
# If schema changes are needed
cd backend
source venv/bin/activate
python database_setup.py
```

## 🛡️ Security Considerations

### Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Database Security
- Use strong passwords
- Limit database access to application server only
- Regular security updates

### Application Security
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting
- Regular security audits

## 📞 Support & Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 80, 443, 5000, 5432 are available
2. **Database connection**: Check PostgreSQL service and credentials
3. **API key issues**: Verify Gemini API key is valid
4. **Memory issues**: Ensure sufficient RAM (2GB+ recommended)

### Performance Optimization
- Use SSD storage for database
- Configure PostgreSQL for production
- Enable gzip compression in Nginx
- Use CDN for static assets (optional)

### Contact Information
- **Technical Support**: [Your support contact]
- **Documentation**: [Your documentation URL]
- **Issues**: [Your issue tracking system]

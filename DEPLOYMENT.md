# 🚀 Deployment Guide

Complete guide for deploying the File Search Application to various platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
  - [Docker Compose (Simple)](#1-docker-compose-simple)
  - [AWS Deployment](#2-aws-deployment)
  - [Azure Deployment](#3-azure-deployment)
  - [Google Cloud Platform](#4-google-cloud-platform)
  - [Kubernetes](#5-kubernetes)
  - [DigitalOcean](#6-digitalocean)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## 🔧 Prerequisites

### Required:
- Docker & Docker Compose
- Git
- PostgreSQL (or managed database service)
- Domain name (for production)
- SSL certificate (for HTTPS)

### Optional but Recommended:
- CDN service (CloudFlare, CloudFront)
- Monitoring tool (Datadog, New Relic)
- Log aggregation (ELK, CloudWatch)
- CI/CD pipeline (GitHub Actions, GitLab CI)

## ⚙️ Environment Configuration

### 1. Create Environment File

Create `.env.production` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/filesearch
POSTGRES_DB=filesearch
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_secure_password

# Backend
BACKEND_PORT=8000
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com

# Search Configuration
SEARCH_ROOT=/app/host_root
MAX_FILE_SIZE=10485760  # 10MB
MAX_SEARCH_RESULTS=1000

# Security
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=INFO
```

### 2. Update docker-compose.yml for Production

```yaml
version: '3.8'

services:
  backend:
    image: your-registry/file-search-backend:latest
    env_file: .env.production
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  frontend:
    image: your-registry/file-search-frontend:latest
    env_file: .env.production
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

## 🎯 Deployment Options

### 1. 🐳 Docker Compose (Simple)

**Best for:** Small deployments, single server, development

#### Steps:

1. **Prepare the Server**
```bash
# SSH into your server
ssh user@your-server.com

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone and Configure**
```bash
git clone https://github.com/your-username/file-search-app.git
cd file-search-app
cp .env.example .env.production
nano .env.production  # Edit with your values
```

3. **Deploy**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

4. **Setup Reverse Proxy (Nginx)**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### 2. ☁️ AWS Deployment

**Best for:** Scalable production deployments

#### Option A: AWS ECS (Elastic Container Service)

1. **Push Images to ECR**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name file-search-backend
aws ecr create-repository --repository-name file-search-frontend

# Build and push
docker build -t file-search-backend ./backend
docker tag file-search-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/file-search-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/file-search-backend:latest

docker build -t file-search-frontend ./frontend
docker tag file-search-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/file-search-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/file-search-frontend:latest
```

2. **Create RDS PostgreSQL Instance**
```bash
aws rds create-db-instance \
    --db-instance-identifier file-search-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username admin \
    --master-user-password YourPassword123! \
    --allocated-storage 20
```

3. **Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name file-search-cluster
```

4. **Create Task Definition** (save as `task-definition.json`)
```json
{
  "family": "file-search",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/file-search-backend:latest",
      "portMappings": [{"containerPort": 8000}],
      "environment": [
        {"name": "DATABASE_URL", "value": "postgresql://..."}
      ]
    },
    {
      "name": "frontend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/file-search-frontend:latest",
      "portMappings": [{"containerPort": 3000}]
    }
  ]
}
```

5. **Create and Deploy Service**
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json

aws ecs create-service \
    --cluster file-search-cluster \
    --service-name file-search-service \
    --task-definition file-search \
    --desired-count 2 \
    --launch-type FARGATE
```

#### Option B: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init -p docker file-search-app --region us-east-1

# Create environment
eb create file-search-env

# Deploy
eb deploy
```

**Cost Estimate (AWS):**
- ECS Fargate: ~$50-100/month
- RDS t3.micro: ~$15/month
- ALB: ~$20/month
- Total: ~$85-135/month

---

### 3. 🔷 Azure Deployment

**Best for:** Microsoft ecosystem, enterprise

#### Steps:

1. **Create Resource Group**
```bash
az group create --name file-search-rg --location eastus
```

2. **Create Container Registry**
```bash
az acr create --resource-group file-search-rg --name filesearchacr --sku Basic
az acr login --name filesearchacr

# Build and push
docker build -t filesearchacr.azurecr.io/backend:latest ./backend
docker push filesearchacr.azurecr.io/backend:latest

docker build -t filesearchacr.azurecr.io/frontend:latest ./frontend
docker push filesearchacr.azurecr.io/frontend:latest
```

3. **Create PostgreSQL Database**
```bash
az postgres server create \
    --resource-group file-search-rg \
    --name filesearch-db \
    --location eastus \
    --admin-user adminuser \
    --admin-password "YourPassword123!" \
    --sku-name B_Gen5_1
```

4. **Deploy to Azure Container Instances**
```bash
az container create \
    --resource-group file-search-rg \
    --name file-search-backend \
    --image filesearchacr.azurecr.io/backend:latest \
    --ports 8000 \
    --dns-name-label file-search-backend \
    --environment-variables DATABASE_URL="postgresql://..."

az container create \
    --resource-group file-search-rg \
    --name file-search-frontend \
    --image filesearchacr.azurecr.io/frontend:latest \
    --ports 3000 \
    --dns-name-label file-search-frontend
```

**Cost Estimate (Azure):**
- Container Instances: ~$30-60/month
- PostgreSQL Basic: ~$25/month
- Total: ~$55-85/month

---

### 4. 🌐 Google Cloud Platform

**Best for:** Google ecosystem, Kubernetes

#### Using Cloud Run:

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/file-search-backend ./backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/file-search-frontend ./frontend

# Create Cloud SQL instance
gcloud sql instances create filesearch-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1

# Deploy to Cloud Run
gcloud run deploy file-search-backend \
    --image gcr.io/YOUR_PROJECT_ID/file-search-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

gcloud run deploy file-search-frontend \
    --image gcr.io/YOUR_PROJECT_ID/file-search-frontend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

**Cost Estimate (GCP):**
- Cloud Run: ~$5-20/month (pay-per-use)
- Cloud SQL f1-micro: ~$7/month
- Total: ~$12-27/month

---

### 5. 🚢 Kubernetes (Advanced)

**Best for:** Large scale, multi-region, complex requirements

Create Kubernetes manifests in `k8s/` directory:

**namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: file-search
```

**postgres.yaml**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: file-search
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: file-search
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: filesearch
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: file-search
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
```

**backend.yaml**, **frontend.yaml**, **ingress.yaml** (similar structure)

Deploy:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

---

### 6. 🔧 DigitalOcean (Budget-Friendly)

**Best for:** Startups, cost-effective deployments

1. **Create App Spec** (`.do/app.yaml`)
```yaml
name: file-search-app
region: nyc
services:
- name: backend
  github:
    repo: your-username/file-search-app
    branch: main
    deploy_on_push: true
  dockerfile_path: backend/Dockerfile
  http_port: 8000
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}

- name: frontend
  github:
    repo: your-username/file-search-app
    branch: main
    deploy_on_push: true
  dockerfile_path: frontend/Dockerfile
  http_port: 3000
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: db
  engine: PG
  version: "14"
  size: db-s-dev-database
```

2. **Deploy**
```bash
doctl apps create --spec .do/app.yaml
```

**Cost Estimate (DigitalOcean):**
- Basic containers: ~$10-20/month
- Dev database: ~$7/month
- Total: ~$17-27/month

---

## 🔒 Post-Deployment Checklist

### Security:
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up WAF (if available)
- [ ] Enable DDoS protection
- [ ] Rotate all default passwords
- [ ] Set up VPC/Private network
- [ ] Enable audit logging
- [ ] Configure security groups
- [ ] Implement rate limiting
- [ ] Enable database encryption

### Monitoring:
- [ ] Set up application monitoring
- [ ] Configure log aggregation
- [ ] Set up alerts for errors
- [ ] Monitor resource usage
- [ ] Set up uptime monitoring
- [ ] Configure backup alerts
- [ ] Track API performance

### Backup:
- [ ] Enable automated database backups
- [ ] Test backup restoration
- [ ] Set up disaster recovery plan
- [ ] Configure retention policy
- [ ] Document recovery procedures

### Performance:
- [ ] Enable CDN for static assets
- [ ] Configure caching
- [ ] Set up load balancing
- [ ] Optimize database queries
- [ ] Enable compression
- [ ] Configure auto-scaling

## 📊 Monitoring & Maintenance

### Recommended Tools:

**Monitoring:**
- Datadog
- New Relic
- Prometheus + Grafana
- Cloud-native solutions (CloudWatch, Azure Monitor, GCP Operations)

**Log Aggregation:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- CloudWatch Logs
- Datadog Logs

**Uptime Monitoring:**
- UptimeRobot
- Pingdom
- StatusCake

### Regular Maintenance:

```bash
# Weekly
- Check error logs
- Review security alerts
- Monitor resource usage
- Review performance metrics

# Monthly
- Update dependencies
- Review and optimize costs
- Test backup restoration
- Security audit

# Quarterly
- Review and update documentation
- Disaster recovery drill
- Capacity planning
- Performance optimization
```

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check DATABASE_URL is correct
   - Verify network connectivity
   - Check database credentials
   - Ensure database is running

2. **Container Won't Start**
   - Check logs: `docker logs <container-id>`
   - Verify environment variables
   - Check resource limits
   - Ensure ports aren't in use

3. **High Memory Usage**
   - Adjust container resource limits
   - Optimize search query size
   - Implement result pagination
   - Enable caching

4. **Slow Performance**
   - Add database indexes
   - Enable query caching
   - Optimize file search patterns
   - Scale horizontally

## 📞 Support

For deployment issues:
1. Check GitHub Issues
2. Review logs and error messages
3. Consult platform documentation
4. Create detailed bug report

---

**🎉 Congratulations on your deployment!**
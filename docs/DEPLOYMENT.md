# Deployment Commands & Instructions

## Overview
This document contains all the commands needed to deploy the latest version of the File Search Application with the Top 5 Quick Win features.

---

## Docker Commands

### Option 1: Complete Rebuild (Recommended)
```bash
cd /Users/vndr/Projects/local-comp/file-search-app

# Stop all running containers
docker-compose down

# Remove volumes (optional - clears database)
# docker-compose down -v

# Build with no cache to ensure fresh build
docker-compose build --no-cache

# Start all services
docker-compose up
```

### Option 2: Quick Rebuild
```bash
cd /Users/vndr/Projects/local-comp/file-search-app

# Stop and remove containers
docker-compose down

# Build and start
docker-compose build
docker-compose up
```

### Option 3: Background Mode
```bash
cd /Users/vndr/Projects/local-comp/file-search-app

docker-compose down
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 4: Rebuild Only Frontend (Faster)
```bash
cd /Users/vndr/Projects/local-comp/file-search-app

# Stop containers
docker-compose stop

# Rebuild only frontend
docker-compose build frontend

# Start everything
docker-compose up
```

---

## Git Commands

### Commit Changes

**Short Version:**
```bash
cd /Users/vndr/Projects/local-comp/file-search-app

git add .

git commit -m "feat: Implement Top 5 Quick Win UX Improvements

Add dark mode, CSV export, file size filtering, saved configurations, and empty directory cleanup"
```

**Detailed Version:**
```bash
cd /Users/vndr/Projects/local-comp/file-search-app

git add .

# Open editor for detailed commit message
git commit

# Paste the detailed commit message from COMMIT_MESSAGE.md
```

### Tag Release
```bash
# Create annotated tag
git tag -a v2.0.0 -m "Release v2.0.0 - Top 5 Quick Win Features"

# List tags to verify
git tag -l
```

### Push to GitHub
```bash
# Push commits
git push origin main

# Push tags
git push origin v2.0.0

# Or push everything
git push origin main --tags
```

### Create GitHub Release
1. Go to: https://github.com/vndr/file-search-app/releases/new
2. Select tag: v2.0.0
3. Title: "Release v2.0.0 - Top 5 Quick Win Features"
4. Copy description from COMMIT_MESSAGE.md "For GitHub Release Notes" section
5. Click "Publish release"

---

## Verification Steps

### 1. Check Docker Containers
```bash
# Verify all containers are running
docker-compose ps

# Should show:
# - file-search-app-frontend-1 (port 3000)
# - file-search-app-backend-1 (port 8000)
# - file-search-app-db-1 (port 5432)
```

### 2. Check Application Access
```bash
# Frontend should be accessible
open http://localhost:3000

# Backend health check
curl http://localhost:8000/health

# Should return: {"status":"healthy"}
```

### 3. Verify New Features

**Dark Mode:**
- Open app
- Click moon/sun icon in top-right
- Page should switch themes
- Refresh page - theme should persist

**CSV Export:**
- Go to Analyzer page
- Run an analysis
- Click "Export File List" button
- CSV file should download

**File Size Filter:**
- Go to Analyzer page
- Scroll to "File Size Filter" section
- Try entering values or clicking preset chips
- Run analysis - results should be filtered

**Saved Configurations:**
- Configure an analysis
- Click "Save Config" button (bookmark icon)
- Enter a name and save
- Click "Saved Configs" button (bookmarks icon)
- Your saved config should appear

**Empty Directories:**
- Run an analysis
- Scroll to "Empty Directories" card (if any found)
- Select a directory and click "Delete Selected"
- Confirm deletion

**Help Menu:**
- Click "?" icon in top navigation
- Menu should open with documentation links
- Click any link - should open in new tab

---

## Post-Deployment Checklist

- [ ] All Docker containers running
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend health check passes
- [ ] Dark mode toggle works
- [ ] CSV export downloads files
- [ ] File size filter works in analyzer
- [ ] File size filter works in results
- [ ] Saved configurations save and load
- [ ] Empty directories can be deleted
- [ ] Help menu opens and links work
- [ ] No errors in console logs
- [ ] No errors in Docker logs
- [ ] Git commit pushed successfully
- [ ] Git tag pushed successfully

---

**Deployment Date**: October 26, 2025  
**Version**: 2.0.0  
**Status**: Ready for deployment

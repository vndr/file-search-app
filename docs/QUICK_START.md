# Quick Start Guide

Get up and running with the File Search Application in under 5 minutes!

## Prerequisites

- ✅ Docker Desktop for Mac installed
- ✅ At least 4GB free disk space
- ✅ macOS with file system access enabled for Docker

## Installation Steps

### Step 1: Get the Code

```bash
# Clone the repository
git clone https://github.com/vndr/file-search-app.git
cd file-search-app
```

### Step 2: Start the Application

**Option A: Using the startup script (Recommended)**
```bash
./start.sh
```

**Option B: Using Docker Compose directly**
```bash
docker-compose up --build
```

**Option C: Run in background**
```bash
docker-compose up --build -d
```

### Step 3: Access the Application

The application will automatically open in your browser at:
```
http://localhost:3000
```

If it doesn't open automatically, open your browser and navigate to the URL above.

---

## Your First Analysis

### Analyze a Directory

1. **Click "Analyze Directory"** from the home page

2. **Choose a directory** to analyze:
   - Type a path: `/Users/yourusername/Documents`
   - Or click "Desktop" for quick access

3. **Configure options**:
   - ✅ Find Duplicate Files (recommended)
   - Set Max Hash Size: 10 MB (default)

4. **Click "Analyze"** and wait for results

5. **View results**:
   - Summary statistics
   - File type distribution chart
   - Largest files
   - Duplicate groups (if any)

### Your First Search

1. **Click "Search Files"** from the home page

2. **Enter a search term**:
   - Example: "TODO" to find all TODO comments
   - Example: "password" to find potential security issues

3. **Choose where to search**:
   - Click "Desktop" for a quick search
   - Or enter custom path

4. **Configure options**:
   - Case Sensitive: Off (for broader results)
   - Include ZIP Files: Off (for faster search)

5. **Click "Search"** and watch the progress

6. **View results**:
   - Click any file to see match details
   - Use filter box to narrow results

---

## Quick Actions

### Export Analysis to CSV

After running an analysis:
1. Scroll to the results section
2. Click "Export File List" button
3. Open the downloaded CSV in Excel or Google Sheets

### Enable Dark Mode

1. Look for the theme toggle in the top-right corner
2. Click to switch between light and dark modes
3. Your preference is saved automatically

### Save a Configuration

After setting up a search or analysis:
1. Click the "Save Config" button (bookmark icon)
2. Enter a name like "Weekly Desktop Scan"
3. Click "Save"
4. Load it anytime from the "Saved Configs" menu

### Clean Up Empty Directories

After running an analysis:
1. Scroll to "Empty Directories" card
2. Select directories you want to remove
3. Click "Delete Selected"
4. Confirm the deletion

---

## Common Tasks

### Find Large Files

1. Go to Analyzer page
2. Enter a directory path
3. Set **Minimum File Size** to 100 MB (104857600 bytes)
   - Or click the "100 MB" preset chip
4. Click "Analyze"
5. View the largest files in results

### Find Duplicate Files

1. Go to Analyzer page
2. Enter a directory path
3. Enable **Find Duplicate Files**
4. Click "Analyze"
5. Scroll to "Duplicate Files" section
6. Review groups and potential space savings

### Search in Specific File Types

1. Go to Search page
2. Enter your search term
3. After getting results, use the filter box
4. Type the file extension (e.g., ".py" for Python files)
5. Results filter instantly

### View Search History

1. Click "History" in the navigation menu
2. Browse all past searches
3. Click "View Results" to revisit any search
4. Click trash icon to delete old searches

---

## Tips for Better Results

### For Large Directories (10,000+ files)

- ✅ Disable duplicate detection for speed
- ✅ Use file size filters to limit scope
- ✅ Search subdirectories separately
- ✅ Monitor progress and stop if needed

### For Finding Duplicates

- ✅ Start with smaller directories
- ✅ Reduce max hash size for speed
- ✅ Filter by minimum size (skip tiny files)
- ✅ Export results to CSV for analysis

### For Text Searching

- ✅ Be specific with search terms
- ✅ Use case sensitivity for exact matches
- ✅ Disable ZIP search for speed
- ✅ Filter results to find specific files

---

## Stopping the Application

### Stop all services:
```bash
docker-compose down
```

### Stop and remove all data:
```bash
docker-compose down -v
```

### View logs if something goes wrong:
```bash
docker-compose logs -f
```

---

## Troubleshooting

### Application won't start?
```bash
# Check Docker is running
docker info

# Restart Docker Desktop and try again
./start.sh
```

### Port already in use?
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Stop the conflicting service or change ports in docker-compose.yml
```

### Permission denied?
```bash
# Ensure Docker has file system access
# Go to: Docker Desktop → Preferences → Resources → File Sharing
# Add your home directory if not already there
```

### Database errors?
```bash
# Restart just the database
docker-compose restart db

# Or reset everything
docker-compose down -v
./start.sh
```

---

## Next Steps

- 📖 Read the [User Guide](USER_GUIDE.md) for detailed feature documentation
- 🎯 Check out [Features](FEATURES.md) for technical details
- 🔧 See [README.md](../README.md) for configuration options

---

## Getting Help

- **In-App Help**: Click (?) icons throughout the application
- **Documentation**: Browse docs folder for detailed guides
- **Issues**: Report bugs on GitHub
- **Questions**: Check existing issues or create a new one

---

**Happy Searching! 🔍✨**

**Estimated time to first search**: 3-5 minutes

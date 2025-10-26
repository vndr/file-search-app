# File Search Application

[![CI/CD Pipeline](https://github.com/vndr/file-search-app/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/vndr/file-search-app/actions/workflows/ci.yml)
[![Security Scanning](https://github.com/vndr/file-search-app/workflows/Security%20Scanning/badge.svg)](https://github.com/vndr/file-search-app/actions/workflows/security.yml)
[![Code Quality](https://github.com/vndr/file-search-app/workflows/Code%20Quality/badge.svg)](https://github.com/vndr/file-search-app/actions/workflows/quality.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful web-based file search application that can search for text patterns across directories and files, including inside ZIP archives. Built with a modern tech stack and runs entirely in Docker containers.

## 🌟 Features

### Core Functionality
- **Deep File Search**: Search across all files in directories and subdirectories
- **Directory Analysis**: Comprehensive directory statistics, file type distribution, and size analysis
- **Archive Support**: Search inside ZIP, TAR, TAR.GZ, TAR.BZ2, and TGZ files
- **Document Search**: Search in Microsoft Office (DOCX, XLSX, PPTX) and LibreOffice (ODT, ODS, ODP) documents
- **Duplicate Detection**: Find duplicate files using fast MD5 hashing algorithm
- **Real-time Progress**: Live updates during search with WebSocket connection

### New Features ✨
- **🎨 Dark Mode**: Toggle between light and dark themes with persistent preference
- **📊 CSV Export**: Export analysis results (file lists, duplicates, statistics) to CSV format
- **📏 File Size Filtering**: Filter files by size range in both analysis and search results
- **💾 Saved Configurations**: Save and load frequently used search and analysis configurations
- **🗑️ Empty Directory Cleanup**: Detect and batch delete empty directories safely

### User Interface
- **Modern Web UI**: Clean, responsive interface built with React and Material-UI
- **Interactive Charts**: Visual file type distribution and size charts with Recharts
- **Search History**: Track and revisit previous searches with full session management
- **Detailed Results**: View match context, line numbers, and file details
- **Filter & Navigate**: Filter results in real-time and click through matches
- **Smart Navigation**: Breadcrumb navigation and quick access buttons

### Performance & Storage
- **Database Storage**: Persistent storage of search results and history in PostgreSQL
- **Parallel Processing**: Multi-threaded file processing for optimal performance
- **Smart Filtering**: Automatic binary file detection and hidden directory exclusion
- **Memory Efficient**: Streaming file operations for large file handling
- **Timer Tracking**: Monitor search duration and performance metrics

## 🏗️ Architecture

- **Frontend**: React 18 with Material-UI components
- **Backend**: FastAPI (Python) with async processing
- **Database**: PostgreSQL for storing search results
- **File System**: Direct mount of macOS file system
- **Communication**: WebSocket for real-time updates
- **Containerization**: Docker Compose for easy deployment
- **CI/CD**: GitHub Actions for automated testing and deployment

## 🔄 CI/CD & Quality Assurance

This project includes comprehensive GitHub Actions workflows that automatically run on every pull request:

### Automated Checks:
- ✅ **Code Quality**: Linting (ESLint, Flake8), formatting (Prettier, Black), complexity analysis
- ✅ **Security Scanning**: CodeQL, Trivy, OWASP dependency check, secret scanning
- ✅ **Testing**: Unit tests, coverage reports, build validation
- ✅ **Docker**: Container build tests and security scans
- ✅ **Documentation**: Automated deployment guides and best practices

### What Happens on Pull Requests:
1. Automated security scans identify vulnerabilities
2. Code quality checks ensure standards are met
3. Automated comments provide deployment guidance
4. Status checks must pass before merge

See [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) for detailed workflow documentation.

## 🚀 Quick Start

### Prerequisites

- Docker Desktop for Mac
- At least 4GB of free disk space
- macOS with Docker access to file system

### Installation & Startup

1. **Clone or download the project** to your local machine

2. **Navigate to the project directory**:
   ```bash
   cd file-search-app
   ```

3. **Run the startup script**:
   ```bash
   ./start.sh
   ```

   The script will:
   - Check Docker availability
   - Build and start all containers
   - Set up the database
   - Open your browser to http://localhost:3000

### Manual Startup (Alternative)

If you prefer to start manually:

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

## 🖥️ Usage

### Quick Start

1. **Open the Web Interface**: Go to http://localhost:3000
2. **Choose Your Task**:
   - **Analyze Directory**: Get comprehensive directory statistics
   - **Search Files**: Find text patterns across files

### Directory Analysis

1. **Select a Directory**: Use the path selector or quick buttons (Desktop, Documents, Downloads)
2. **Configure Options**:
   - **Find Duplicates**: Enable to detect duplicate files (uses MD5 hashing)
   - **Max Hash Size**: Only hash files smaller than this size (1-100 MB)
   - **File Size Filter**: Set min/max file size to narrow analysis scope
3. **Start Analysis**: Click "Analyze" and watch real-time progress
4. **View Results**: 
   - Summary statistics (files, directories, total size)
   - Interactive charts (file types, size distribution)
   - Top 10 largest files
   - Duplicate file groups with space savings
   - Empty directories list
5. **Export Results**: Download file lists, duplicates, or statistics as CSV
6. **Clean Up**: Batch delete empty directories if found

### Text Search

1. **Enter Search Term**: Type what you're looking for
2. **Choose Search Path**: Select any directory on your Mac
3. **Configure Options**:
   - **Case Sensitive**: Toggle for exact case matching
   - **Include ZIP Files**: Enable to search inside compressed files
   - **Search Filenames**: Include filename matching
4. **Start Search**: Click search and watch real-time progress
5. **View Results**: Browse found files and click to see match details
6. **Filter Results**: Use search box and file size filters to narrow results

### Additional Features

- **Dark Mode**: Toggle theme using the icon in the top-right corner
- **Save Configurations**: Save your frequently used settings for quick access
- **Search History**: Access previous searches from the History page
- **Copy File Paths**: Click copy icon to copy paths to clipboard

## 🔧 Configuration

### Search Directory

By default, the application searches your entire file system starting from `/`. To change this:

1. Edit `docker-compose.yml`
2. Modify the volume mount in the backend service:
   ```yaml
   volumes:
     - /your/custom/path:/app/host_root:rw
   ```
   Note: Use `:rw` for read-write access (required for empty directory deletion) or `:ro` for read-only.

### Analysis Options

**Duplicate Detection**:
- Enable/disable via checkbox
- Adjustable max hash size (1-100 MB)
- Uses MD5 hashing for content comparison

**File Size Filtering**:
- Set minimum file size in bytes
- Set maximum file size in bytes
- Use preset buttons for common sizes
- Filters applied during analysis for better performance

**Performance Tuning**:
- Disable duplicates for 10x faster analysis
- Reduce max hash size for speed
- Use file size filters to limit scope
- Hidden directories (.git, .cache, etc.) automatically excluded

### Supported File Types

The application automatically detects and searches these file types:

- **Code Files**: .js, .ts, .py, .java, .cpp, .c, .go, .rs, .php, .rb, etc.
- **Web Files**: .html, .css, .json, .xml, .yml, .yaml
- **Documentation**: .md, .rst, .txt
- **Configuration**: .cfg, .conf, .ini, .properties
- **Scripts**: .sh, .bash, .ps1, .bat
- **Archives**: .zip, .tar, .tar.gz, .tar.bz2, .tgz (searches inside)
- **Microsoft Office**: .docx, .xlsx, .pptx (Word, Excel, PowerPoint)
- **LibreOffice**: .odt, .ods, .odp (Writer, Calc, Impress)
- **And many more...**

## 🐳 Docker Services

The application consists of three main services:

### Backend (Port 8000)
- FastAPI application
- File search engine
- WebSocket support
- Database integration

### Frontend (Port 3000)
- React application
- Material-UI components
- Real-time updates

### Database (Port 5432)
- PostgreSQL database
- Search result storage
- Session management

## 📊 API Endpoints

The backend provides a REST API with the following endpoints:

### Health & Status
- `GET /health` - Health check

### Search Operations
- `POST /search` - Start a new search
- `WS /ws/search` - WebSocket for real-time search updates
- `GET /sessions` - List all search sessions
- `GET /sessions/{id}` - Get specific session details
- `GET /sessions/{id}/results` - Get search results
- `GET /results/{id}/matches` - Get match details for a result
- `GET /results/{id}/preview` - Get file preview
- `DELETE /sessions/{id}` - Delete a search session

### Analysis Operations
- `POST /api/analyze-directory` - Analyze a directory
- `POST /api/stop-analysis` - Stop ongoing analysis
- `GET /api/export-csv` - Export results to CSV (file_list, duplicates, file_types)
- `POST /api/delete-empty-directories` - Delete empty directories

### Configuration Management
- `GET /api/saved-searches` - List all saved configurations
- `POST /api/saved-searches` - Save a new configuration
- `DELETE /api/saved-searches/{id}` - Delete a saved configuration

## 🛠️ Development

### Running in Development Mode

```bash
# Start only the database
docker-compose up db -d

# Run backend locally
cd backend
pip install -r requirements.txt
python main.py

# Run frontend locally
cd frontend
npm install
npm start
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d filesearch
```

## 🔍 Search Performance

The application is optimized for performance:

- **Async Processing**: Non-blocking file operations
- **Smart File Detection**: Skips binary files automatically
- **Progress Tracking**: Real-time updates every 100 files
- **Memory Efficient**: Streams large files instead of loading entirely
- **ZIP Optimization**: Efficient extraction and search
- **Database Indexing**: Fast result retrieval and filtering

### Expected Performance

- **Text Files**: ~1000 files/second
- **ZIP Files**: ~100 files/second (depends on compression)
- **Large Files**: Automatically skips files >10MB
- **Memory Usage**: ~100-500MB depending on file sizes

## 🚨 Troubleshooting

### Common Issues

1. **Docker not running**:
   ```bash
   # Start Docker Desktop and try again
   docker info
   ```

2. **Port conflicts**:
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :8000
   lsof -i :5432
   ```

3. **Permission issues**:
   ```bash
   # Ensure Docker has file system access
   # Check Docker Desktop → Preferences → Resources → File Sharing
   ```

4. **Database connection errors**:
   ```bash
   # Restart the database
   docker-compose restart db
   ```

### Reset Everything

```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
./start.sh
```

## 📝 File Structure

```
file-search-app/
├── backend/
│   ├── Dockerfile
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── Dockerfile
│   ├── package.json         # Node.js dependencies
│   ├── public/
│   └── src/
│       ├── App.js           # Main React component
│       ├── ThemeContext.js  # Dark mode theme provider
│       └── components/      # React components
│           ├── SearchPage.js       # Text search interface
│           ├── ResultsPage.js      # Search results display
│           ├── HistoryPage.js      # Search history
│           └── AnalyzerPage.js     # Directory analysis
├── docs/                    # Documentation
│   ├── USER_GUIDE.md       # Comprehensive user guide
│   ├── FEATURES.md         # Detailed feature documentation
│   └── QUICK_START.md      # Quick start guide
├── docker-compose.yml       # Multi-container setup
├── init.sql                 # Database initialization
├── start.sh                 # Startup script
├── stop.sh                  # Stop script
├── setup-git.sh             # Git setup helper
├── git-push.sh              # Quick push script
├── GIT_GUIDE.md            # Git usage guide
├── GITHUB_ACTIONS.md       # CI/CD documentation
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🔗 GitHub Setup

### Quick Setup

1. **Run the setup script**:
   ```bash
   ./setup-git.sh
   ```
   Follow the prompts to enter your GitHub repository URL.

2. **Or setup manually**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

### Making Changes

After making changes to the code:

```bash
# Quick method
./git-push.sh

# Or manually
git add .
git commit -m "Description of changes"
git push
```

For more detailed Git instructions, see [GIT_GUIDE.md](GIT_GUIDE.md).

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Quick Start Guide](docs/QUICK_START.md)**: Get up and running in under 5 minutes
- **[User Guide](docs/USER_GUIDE.md)**: Detailed instructions for all features
- **[Features Documentation](docs/FEATURES.md)**: Technical details and specifications

### In-App Help

- Look for **(?)** help icons throughout the application
- Hover over controls for tooltips with quick explanations
- Access documentation links from the Help menu

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Searching! 🔍✨**
# File Search Application

[![CI/CD Pipeline](https://github.com/vndr/file-search-app/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/vndr/file-search-app/actions/workflows/ci.yml)
[![Security Scanning](https://github.com/vndr/file-search-app/workflows/Security%20Scanning/badge.svg)](https://github.com/vndr/file-search-app/actions/workflows/security.yml)
[![Code Quality](https://github.com/vndr/file-search-app/workflows/Code%20Quality/badge.svg)](https://github.com/vndr/file-search-app/actions/workflows/quality.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful web-based file search application that can search for text patterns across directories and files, including inside ZIP archives. Built with a modern tech stack and runs entirely in Docker containers.

## 🌟 Features

- **Deep File Search**: Search across all files in directories and subdirectories
- **Archive Support**: Search inside ZIP, TAR, TAR.GZ, TAR.BZ2, and TGZ files
- **Document Search**: Search in Microsoft Office (DOCX, XLSX, PPTX) and LibreOffice (ODT, ODS, ODP) documents
- **Real-time Progress**: Live updates during search with WebSocket connection
- **Modern Web UI**: Clean, responsive interface built with React and Material-UI
- **Search History**: Track and revisit previous searches
- **Detailed Results**: View match context, line numbers, and file details
- **Filter & Navigate**: Filter results and click through matches
- **Database Storage**: Persistent storage of search results and history
- **Timer Tracking**: Monitor search duration and performance

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

### Basic Search

1. **Open the Web Interface**: Go to http://localhost:3000
2. **Enter Search Term**: Type what you're looking for (e.g., "John Doe")
3. **Choose Search Path**: Select any directory on your Mac using the path selector or quick buttons
4. **Configure Options**:
   - **Case Sensitive**: Toggle for exact case matching
   - **Include ZIP Files**: Enable to search inside compressed files
5. **Start Search**: Click the search button and watch real-time progress
6. **Completion Summary**: View the search completion modal with results summary
7. **View Results**: Browse through found files and click to see match details (if matches found)

### Advanced Features

- **Filter Results**: Use the search box in results to filter by filename or content
- **View Match Context**: Click on any result to see surrounding code/text
- **Search History**: Access previous searches from the sidebar or history page
- **Copy File Paths**: Click the copy icon to copy file paths to clipboard

## 🔧 Configuration

### Search Directory

By default, the application searches your `/Users/vndr` directory. To change this:

1. Edit `docker-compose.yml`
2. Modify the volume mount in the backend service:
   ```yaml
   volumes:
     - /your/custom/path:/app/search_root:ro
   ```

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

- `GET /health` - Health check
- `POST /search` - Start a new search
- `WS /ws/search` - WebSocket for real-time search
- `GET /sessions` - List all search sessions
- `GET /sessions/{id}` - Get specific session details
- `GET /sessions/{id}/results` - Get search results
- `GET /results/{id}/matches` - Get match details
- `DELETE /sessions/{id}` - Delete a search session

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
│       └── components/      # React components
│           ├── SearchPage.js
│           ├── ResultsPage.js
│           └── HistoryPage.js
├── docker-compose.yml       # Multi-container setup
├── init.sql                 # Database initialization
├── start.sh                 # Startup script
├── stop.sh                  # Stop script
├── setup-git.sh             # Git setup helper
├── git-push.sh              # Quick push script
├── GIT_GUIDE.md            # Git usage guide
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

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Searching! 🔍✨**
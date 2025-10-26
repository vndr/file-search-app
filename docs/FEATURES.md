# Feature Documentation

## Overview

This document provides detailed information about all features in the File Search Application.

---

## Core Features

### 1. Directory Analysis

**Description**: Comprehensive analysis of directory structure, file statistics, and storage usage.

**Key Capabilities**:
- Recursive directory scanning
- File type detection and statistics
- Size distribution analysis
- Duplicate file detection with MD5 hashing
- Empty directory detection
- Visual charts and graphs

**Technical Details**:
- Parallel file processing using ThreadPoolExecutor
- Async/await for non-blocking operations
- Smart binary file detection
- Hidden directory exclusion (.git, .cache, etc.)
- Optimized for 100,000+ files

**Configuration Options**:
- Find duplicates (on/off)
- Max hash size (1-100 MB)
- File size filters (min/max in bytes)

**Output**:
- Summary statistics (files, dirs, total size)
- Top 10 largest files
- File type distribution (pie chart)
- Size distribution (bar chart)
- Duplicate groups with size savings
- Empty directories list

---

### 2. Text Search

**Description**: Search for text patterns across files, archives, and documents.

**Key Capabilities**:
- Full-text content search
- Archive searching (ZIP, TAR, etc.)
- Document searching (DOCX, XLSX, PPTX, ODT, etc.)
- Filename searching
- Case-sensitive/insensitive matching
- Match context display
- Real-time progress updates

**Technical Details**:
- Streaming file reading for memory efficiency
- Archive extraction with tempfile cleanup
- Document parsing with python-docx, openpyxl
- Binary file detection and skipping
- WebSocket for real-time updates
- PostgreSQL storage for results

**Configuration Options**:
- Search term (required)
- Search path (required)
- Case sensitive (on/off)
- Include ZIP files (on/off)
- Search filenames (on/off)

**Output**:
- List of matching files
- Match count per file
- Line numbers and context
- File metadata (size, type, path)
- Preview text for each match

---

### 3. File Size Filtering *(NEW)*

**Description**: Filter files by size range in both analysis and search results.

**Key Capabilities**:
- Backend filtering during analysis (performance optimized)
- Frontend filtering of search results (client-side)
- Preset buttons for common sizes
- Byte-level precision
- Saved with configurations

**Use Cases**:
- Find large files consuming storage
- Identify small temporary files
- Filter by specific size ranges
- Exclude system files

**Preset Sizes**:
- Minimum: 1KB, 10KB, 100KB, 1MB, 10MB
- Maximum: 100KB, 1MB, 10MB, 100MB, 1GB

**Technical Details**:
- Backend: Filters before processing (saves time)
- Frontend: Real-time filtering without re-search
- Combines with text search filter
- Stored in saved configurations

---

### 4. Dark Mode *(NEW)*

**Description**: Toggle between light and dark themes for comfortable viewing.

**Key Capabilities**:
- System-wide theme switching
- localStorage persistence
- Instant theme changes
- Theme-aware components
- Chart color adaptation

**Technical Details**:
- React Context API for global state
- Material-UI theming system
- Custom color palettes
- Responsive to system preferences (optional)
- CSS-in-JS styling

**Colors**:
- Light mode: Clean whites and grays
- Dark mode: Deep blues and purples
- Action colors adapt to theme
- Chart colors optimized for visibility

---

### 5. CSV Export *(NEW)*

**Description**: Export analysis results to CSV format for external processing.

**Export Types**:

**File List**:
- All files from analysis
- Columns: path, name, size, type, modified_date
- Sorted by path

**Duplicates**:
- Duplicate file groups
- Columns: hash, file_paths, count, size
- Shows all files in each group

**File Types**:
- File extension statistics
- Columns: extension, count, total_size
- Sorted by count descending

**Technical Details**:
- Server-side CSV generation
- Streaming response for large datasets
- UTF-8 encoding with BOM
- RFC 4180 compliant
- Filename includes timestamp

**Use Cases**:
- Import into Excel/Google Sheets
- Custom analysis and reporting
- Data visualization in BI tools
- Storage audit documentation

---

### 6. Saved Configurations *(NEW)*

**Description**: Save and load frequently used search and analysis configurations.

**What Gets Saved**:

**Analysis Configs**:
- Directory path
- Find duplicates setting
- Max hash size
- Min/max file size filters

**Search Configs**:
- Search term
- Search path
- Case sensitivity
- Include ZIP files
- Search filenames

**Key Capabilities**:
- Quick load of common configurations
- Descriptive naming
- Delete unwanted configs
- Shared storage (reuses saved_searches table)
- Automatic timestamp tracking

**Technical Details**:
- Stored in PostgreSQL database
- JSON serialization for complex options
- RESTful API endpoints
- Unique naming enforcement
- Cascade delete with cleanup

---

### 7. Empty Directory Detection & Cleanup *(NEW)*

**Description**: Identify and remove directories containing no files.

**Detection Logic**:
- Directories with zero files
- Recursive scanning
- Excludes directories with only subdirectories
- Hidden directories included

**Cleanup Features**:
- Select individual directories
- Select all option
- Batch deletion
- Confirmation dialog
- Safety checks

**Technical Details**:
- Detected during directory analysis
- Server-side deletion with error handling
- Read-write Docker volume mount required
- Transaction safety
- Immediate UI update

**Safety Features**:
- Confirmation required
- Only empty directories deletable
- No file deletion risk
- Error handling and reporting
- Can be cancelled anytime

---

### 8. Search History

**Description**: Track and manage all previous searches and analyses.

**Stored Information**:
- Session ID
- Search term or description
- Search path
- Start time
- Completion time
- Result count
- Status (completed/cancelled)

**Key Capabilities**:
- View all past searches
- Access previous results
- Delete old sessions
- Filter by term or path
- Sort by date

**Technical Details**:
- PostgreSQL storage
- Foreign key relationships
- Cascade delete for cleanup
- Indexed for performance
- Pagination support

---

## Advanced Features

### Real-time Progress Updates

**Description**: Live updates during long-running operations.

**Technical Details**:
- WebSocket connections
- Progress percentage calculation
- File count updates
- Current file display
- Cancellation support

**Update Frequency**:
- Every 100 files processed
- Every second (time-based)
- Completion notification
- Error reporting

---

### Archive Support

**Description**: Search inside compressed files without manual extraction.

**Supported Formats**:
- ZIP (.zip)
- TAR (.tar)
- GZIP (.tar.gz, .tgz)
- BZIP2 (.tar.bz2)

**Technical Details**:
- Temporary extraction
- Automatic cleanup
- Nested archive support
- Memory-efficient streaming
- Path tracking

---

### Document Support

**Description**: Search inside office documents.

**Microsoft Office**:
- Word (.docx)
- Excel (.xlsx)
- PowerPoint (.pptx)

**LibreOffice**:
- Writer (.odt)
- Calc (.ods)
- Impress (.odp)

**Technical Details**:
- python-docx for Word/Writer
- openpyxl for Excel/Calc
- python-pptx for PowerPoint/Impress
- XML parsing
- Text extraction

---

## Performance Features

### Optimization Strategies

1. **Parallel Processing**
   - ThreadPoolExecutor for file operations
   - Concurrent hashing for duplicates
   - Async file I/O

2. **Smart Filtering**
   - Binary file detection
   - Size-based skipping
   - Hidden directory exclusion
   - Early filtering with size ranges

3. **Memory Management**
   - File streaming
   - Chunked reading
   - Temporary file cleanup
   - Connection pooling

4. **Database Optimization**
   - Indexed columns
   - Batch inserts
   - Connection pooling
   - Query optimization

### Performance Metrics

**Expected Speeds**:
- Text files: ~1000 files/second
- ZIP files: ~100 files/second
- Duplicate detection: ~500 files/second
- Document parsing: ~200 files/second

**Limits**:
- Max file size for search: 10 MB
- Max lines per preview: 100
- Max results per page: 1000
- Session timeout: 1 hour

---

## Security Features

### File System Access

- Read-only mount (default)
- Read-write for empty dir deletion
- Path validation
- Symlink handling
- Permission checks

### Data Protection

- SQL injection prevention
- XSS protection
- CORS configuration
- Input validation
- Error message sanitization

---

## Integration Features

### API Endpoints

**Analysis**:
- `POST /api/analyze-directory` - Run analysis
- `GET /api/export-csv` - Export results

**Search**:
- `POST /search` - Create search
- `WS /ws/search` - Real-time updates
- `GET /sessions/{id}` - Get session
- `GET /sessions/{id}/results` - Get results

**Configuration**:
- `GET /api/saved-searches` - List configs
- `POST /api/saved-searches` - Save config
- `DELETE /api/saved-searches/{id}` - Delete config

**Maintenance**:
- `POST /api/delete-empty-directories` - Cleanup
- `DELETE /sessions/{id}` - Delete session

---

## Future Enhancements

### Planned Features

1. **Advanced Search**
   - Regular expressions
   - Multiple search terms
   - Boolean operators
   - Fuzzy matching

2. **File Operations**
   - Bulk file operations
   - Move/copy files
   - Rename operations
   - File compression

3. **Enhanced Filtering**
   - Date range filters
   - Owner/permission filters
   - Custom file type filters
   - Exclude patterns

4. **Reporting**
   - PDF reports
   - Email notifications
   - Scheduled analysis
   - Trend analysis

5. **Collaboration**
   - User accounts
   - Shared searches
   - Comments/annotations
   - Team dashboards

---

## Version History

### v2.0.0 (Current)
- ✨ File size range filtering
- 🌙 Dark mode theme
- 💾 CSV export functionality
- 📋 Saved configurations
- 🗑️ Empty directory cleanup

### v1.0.0
- 📂 Directory analysis
- 🔍 Text search
- 📦 Archive support
- 📄 Document support
- 📊 Statistics and charts
- 📜 Search history

---

**Last Updated**: October 26, 2025

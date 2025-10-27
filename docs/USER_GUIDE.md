# File Search Application - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Directory Analysis](#directory-analysis)
3. [Text Search](#text-search)
4. [File Size Filtering](#file-size-filtering)
5. [Dark Mode](#dark-mode)
6. [CSV Export](#csv-export)
7. [Saved Configurations](#saved-configurations)
8. [Empty Directories](#empty-directories)
9. [Search History](#search-history)
10. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Accessing the Application
1. Start the application using `./start.sh` or `docker-compose up`
2. Open your browser and navigate to `http://localhost:3000`
3. You'll see the home page with options to analyze directories or search for text

### Main Navigation
- **Home**: Quick start page with navigation buttons
- **Analyze Directory**: Comprehensive directory analysis with statistics
- **Search**: Text search across files and archives
- **History**: View and manage past searches

---

## Directory Analysis

The Directory Analyzer provides comprehensive statistics about any directory on your system.

### How to Use

1. **Navigate to Analyzer Page**
   - Click "Analyze Directory" from the home page
   - Or use the navigation menu

2. **Select a Directory**
   - Enter a path manually (e.g., `/Users/username/Documents`)
   - Or click "Browse" to navigate through directories
   - Quick access buttons: Home, Desktop, Documents, Downloads

3. **Configure Analysis Options**

   **Find Duplicate Files**
   - Enable to detect files with identical content
   - Uses fast MD5 hashing algorithm
   - Can be disabled for faster analysis of large directories

   **Max File Size for Hashing**
   - Only files smaller than this size will be hashed for duplicates
   - Default: 10 MB
   - Range: 1-100 MB
   - Larger files are skipped to save time

   **File Size Filter** *(NEW)*
   - Set minimum file size (e.g., only files > 1MB)
   - Set maximum file size (e.g., only files < 100MB)
   - Use preset buttons for common sizes
   - Leave empty for no filtering

4. **Start Analysis**
   - Click "Analyze" with the chart icon
   - Progress updates appear in real-time
   - Analysis can be stopped at any time

5. **View Results**

   **Summary Cards**
   - Total files and directories
   - Total size with human-readable format
   - File types breakdown
   - Largest files list

   **File Types Chart**
   - Interactive pie chart showing distribution
   - Hover for detailed counts and percentages

   **File Size Distribution**
   - Bar chart showing size ranges
   - Helps identify storage usage patterns

   **Top 10 Largest Files**
   - Sortable table with file details
   - Click column headers to sort
   - Sizes in human-readable format

   **Duplicate Files** (if enabled)
   - Groups of files with identical content
   - Size savings if duplicates were removed
   - Click to view all files in each duplicate group

   **Empty Directories** *(NEW)*
   - List of directories containing no files
   - Batch delete option for cleanup
   - Confirmation dialog before deletion

---

## Text Search

Search for text patterns across your entire file system, including inside archives and documents.

### How to Use

1. **Navigate to Search Page**
   - Click "Search Files" from home page
   - Or use the navigation menu

2. **Enter Search Term**
   - Type the text you want to find
   - Can be a word, phrase, or pattern

3. **Select Search Path**
   - Choose where to search using the directory browser
   - Quick buttons: Home, Desktop, Documents, Downloads

4. **Configure Search Options**

   **Case Sensitive**
   - Enable for exact case matching
   - Disable to find "apple", "Apple", "APPLE" all as matches

   **Include ZIP Files**
   - Enable to search inside compressed archives
   - Supports: ZIP, TAR, TAR.GZ, TAR.BZ2, TGZ
   - Slower but more thorough

   **Search Filenames**
   - Enable to search in filenames in addition to content
   - Useful for finding files by name pattern

5. **Start Search**
   - Click "Search" to begin
   - Real-time progress updates
   - Can be stopped at any time

6. **View Results**
   - List of all matching files
   - Click any result to see match details
   - Filter results using the search box
   - View line numbers and context

### Supported File Types

**Code & Scripts**
- JavaScript, TypeScript, Python, Java, C/C++, Go, Rust, PHP, Ruby
- Shell scripts, PowerShell, Batch files

**Web Files**
- HTML, CSS, JSON, XML, YAML, SVG

**Documents**
- Plain text, Markdown, reStructuredText
- Microsoft Office: DOCX, XLSX, PPTX
- LibreOffice: ODT, ODS, ODP

**Configuration**
- INI, TOML, YAML, JSON, Properties files

**Archives**
- ZIP, TAR, GZIP, BZIP2, TGZ

---

## File Size Filtering

Filter files by size in both directory analysis and search results.

### In Directory Analysis

1. **Expand the File Size Filter Section**
   - Located in the Analysis Options panel

2. **Set Minimum Size** (optional)
   - Enter value in bytes
   - Or click preset buttons: 1KB, 10KB, 100KB, 1MB, 10MB
   - Files smaller than this will be excluded

3. **Set Maximum Size** (optional)
   - Enter value in bytes
   - Or click preset buttons: 100KB, 1MB, 10MB, 100MB, 1GB
   - Files larger than this will be excluded

4. **Clear Filters**
   - Click "Clear" chip to remove the filter
   - Or delete the number in the input field

### In Search Results

1. **Open the File Size Filter Accordion**
   - Located below the results count
   - Shows "Active" badge when filters are applied

2. **Apply Filters**
   - Same controls as directory analysis
   - Filters apply in real-time without re-running search

3. **Combine with Text Filter**
   - Use alongside the text search box
   - Both filters apply simultaneously

### Use Cases

- Find large files: Set minimum to 100MB
- Find small files: Set maximum to 1KB
- Find medium files: Set min 1MB and max 100MB
- Exclude system files: Set minimum to exclude tiny files

---

## Dark Mode

Toggle between light and dark themes for comfortable viewing.

### How to Enable

1. **Find the Theme Toggle**
   - Located in the top-right corner of the navigation bar
   - Sun icon = Light mode active
   - Moon icon = Dark mode active

2. **Click to Toggle**
   - Switches between light and dark themes
   - Changes apply instantly across all pages

3. **Persistence**
   - Your preference is saved in browser localStorage
   - Theme automatically loads on next visit

### Features

- Fully theme-aware components
- Comfortable colors for extended use
- Consistent styling across all pages
- Charts adapt to theme colors

---

## CSV Export

Export analysis results to CSV format for further processing.

### Available Exports

1. **File List**
   - Exports all files found during analysis
   - Columns: Path, Name, Size (bytes), Type, Last Modified

2. **Duplicates**
   - Exports duplicate file groups
   - Columns: Hash, File Paths (comma-separated), Count, Size (bytes)
   - Only available when duplicates are found

3. **File Types**
   - Exports file type statistics
   - Columns: Extension, Count, Total Size (bytes)

### How to Export

1. **Complete a Directory Analysis**
   - Run an analysis to generate results

2. **Click Export Button**
   - "Export File List" for all files
   - "Export Duplicates" for duplicate groups
   - "Export File Types" for statistics

3. **Save the CSV File**
   - Browser downloads the file automatically
   - Filename includes timestamp
   - Open in Excel, Google Sheets, or any CSV reader

### Use Cases

- Import into spreadsheet for custom analysis
- Create reports for storage audits
- Identify cleanup opportunities
- Share analysis results with team

---

## Saved Configurations

Save and load your frequently used search and analysis configurations.

### Saving a Configuration

**On Analysis Page:**
1. Configure all options (path, duplicates, file size filters)
2. Click the "Save Config" button (bookmark icon)
3. Enter a descriptive name (e.g., "Desktop Large Files")
4. Click "Save"

**On Search Page:**
1. Configure search options (term, path, case sensitivity, etc.)
2. Click the "Save Search" button
3. Enter a descriptive name
4. Click "Save"

### Loading a Configuration

1. Click the "Saved Configs" or "Saved Searches" button (bookmarks icon)
2. Browse your saved configurations in the dropdown menu
3. Click on any saved configuration to load it
4. All settings are restored instantly
5. Delete unwanted configs using the trash icon

### What Gets Saved

**Analysis Configurations:**
- Directory path
- Find duplicates setting
- Max hash size
- File size filters (min/max)

**Search Configurations:**
- Search term
- Search path
- Case sensitivity
- Include ZIP files
- Search filenames option

---

## Empty Directories

Detect and clean up directories that contain no files.

### Detection

Empty directories are automatically detected during directory analysis:
- Directories with zero files (subdirectories don't count)
- Nested empty directories are all listed
- Shown in a dedicated card in analysis results

### Viewing Empty Directories

1. **Run a Directory Analysis**
2. **Scroll to "Empty Directories" Card**
   - Shows count of empty directories found
   - Displays full path of each directory

### Deleting Empty Directories

1. **Select Directories**
   - Click checkboxes next to directories you want to delete
   - Or click "Select All" to choose all at once

2. **Click "Delete Selected"**
   - Red button with trash icon
   - Shows count of selected directories

3. **Confirm Deletion**
   - Review the list in the confirmation dialog
   - Click "Delete" to proceed
   - Or "Cancel" to abort

4. **Verification**
   - Success message appears
   - Empty directories card updates
   - Directories are permanently removed from file system

### Safety Features

- Confirmation dialog prevents accidental deletion
- Only empty directories can be deleted
- No files are affected
- Operation can be cancelled at any time

---

## Search History

Track and revisit all your previous searches.

### Viewing History

1. Click "History" in the navigation menu
2. See list of all past searches with:
   - Search term or analysis description
   - Search path
   - Timestamp
   - Result count
   - Status (completed/cancelled)

### Managing History

**View Results:**
- Click "View Results" button to see search results
- Opens results page with all matches

**Delete Entry:**
- Click trash icon to remove from history
- Confirmation required
- Results are permanently deleted

**Filter History:**
- Use search box to filter by term or path
- Results update in real-time

---

## Tips & Best Practices

### Performance Optimization

1. **Large Directories**
   - Disable duplicate detection for faster analysis
   - Use file size filters to limit scope
   - Consider analyzing subdirectories separately

2. **ZIP File Searching**
   - Only enable when needed (slower)
   - Combine with file type filters
   - Limit search path to specific areas

3. **Duplicate Detection**
   - Reduce max hash size for faster processing
   - Start with smaller directories to test
   - Use file size filters to exclude small files

### Effective Searching

1. **Be Specific**
   - Use unique terms to reduce false positives
   - Enable case sensitivity for exact matches
   - Search filenames when looking for files by name

2. **Use Filters**
   - Combine text and size filters
   - Filter results to find specific files
   - Use saved searches for repeated queries

3. **Organize Saved Configs**
   - Use descriptive names
   - Create configs for common tasks
   - Clean up unused configurations

### Storage Management

1. **Find Large Files**
   - Set minimum file size to 100MB
   - Sort by size in analysis results
   - Export to CSV for detailed review

2. **Clean Up Duplicates**
   - Run analysis with duplicates enabled
   - Review duplicate groups carefully
   - Keep one copy, delete others manually

3. **Remove Empty Directories**
   - Run analysis on root directories
   - Review empty directory list
   - Batch delete to clean up

### Data Export

1. **CSV Analysis**
   - Export file list for custom analysis
   - Use spreadsheet pivot tables
   - Create charts and reports

2. **Reporting**
   - Export file type statistics
   - Share duplicate findings
   - Document storage usage

---

## Keyboard Shortcuts

- **Enter** in search box: Start search/analysis
- **Escape** in dialogs: Close dialog
- **Ctrl/Cmd + K**: Focus search box (where available)

---

## Getting Help

- **In-App Help Icons**: Click (?) icons throughout the app for context-specific help
- **Documentation**: Access this guide from the Help menu
- **Tooltips**: Hover over controls for quick explanations
- **Examples**: Sample paths and values shown in placeholders

---

**Need more help?** Check the main README.md or open an issue on GitHub.

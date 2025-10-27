import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  Box,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  History as HistoryIcon, 
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ArrowUpward as ArrowUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  BookmarkAdd as BookmarkAddIcon,
  Bookmarks as BookmarksIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPath, setSearchPath] = useState('/Users/vndr');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [includeZipFiles, setIncludeZipFiles] = useState(true);
  const [searchFilenames, setSearchFilenames] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState({
    currentFile: '',
    filesSearched: 0,
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [showDirectoryBrowser, setShowDirectoryBrowser] = useState(false);
  const [currentBrowsePath, setCurrentBrowsePath] = useState('/Users/vndr');
  const [directories, setDirectories] = useState([]);
  const [loadingDirs, setLoadingDirs] = useState(false);
  const wsRef = useRef(null);

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [savedSearchesAnchor, setSavedSearchesAnchor] = useState(null);

  useEffect(() => {
    fetchSearchHistory();
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/saved-searches`);
      setSavedSearches(response.data);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    }
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) {
      setError('Please enter a name for the saved search');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/saved-searches`, {
        name: saveSearchName,
        search_term: searchTerm,
        search_path: searchPath,
        case_sensitive: caseSensitive,
        include_zip_files: includeZipFiles,
        search_filenames: searchFilenames,
      });
      
      setShowSaveDialog(false);
      setSaveSearchName('');
      fetchSavedSearches();
      setError('');
    } catch (error) {
      setError(error.response?.data?.detail || 'Error saving search');
    }
  };

  const handleLoadSearch = (search) => {
    setSearchTerm(search.search_term);
    setSearchPath(search.search_path);
    setCaseSensitive(search.case_sensitive);
    setIncludeZipFiles(search.include_zip_files);
    setSearchFilenames(search.search_filenames);
    setSavedSearchesAnchor(null);
  };

  const handleDeleteSavedSearch = async (searchId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/saved-searches/${searchId}`);
      fetchSavedSearches();
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions`);
      setSearchHistory(response.data.slice(0, 5)); // Show last 5 searches
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  const fetchDirectories = async (path) => {
    setLoadingDirs(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/filesystem/directories`, {
        params: { path }
      });
      setDirectories(response.data.directories);
      setCurrentBrowsePath(response.data.current_path);
      return response.data;
    } catch (error) {
      console.error('Error fetching directories:', error);
      setError('Error loading directories: ' + (error.response?.data?.detail || error.message));
      return null;
    } finally {
      setLoadingDirs(false);
    }
  };

  const handleOpenDirectoryBrowser = async () => {
    setShowDirectoryBrowser(true);
    await fetchDirectories(searchPath);
  };

  const handleCloseDirectoryBrowser = () => {
    setShowDirectoryBrowser(false);
  };

  const handleSelectDirectory = () => {
    setSearchPath(currentBrowsePath);
    setShowDirectoryBrowser(false);
  };

  const handleNavigateToDirectory = async (path) => {
    await fetchDirectories(path);
  };

  const handleNavigateUp = async () => {
    const parent = currentBrowsePath.split('/').slice(0, -1).join('/') || '/';
    await fetchDirectories(parent);
  };

  const startSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchProgress({ currentFile: '', filesSearched: 0 });

    // Create WebSocket connection
    const wsUrl = `ws://localhost:8000/ws/search`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      // Send search request
      wsRef.current.send(JSON.stringify({
        search_term: searchTerm,
        search_path: searchPath,
        case_sensitive: caseSensitive,
        include_zip_files: includeZipFiles,
        search_filenames: searchFilenames,
      }));
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'progress') {
        setSearchProgress({
          currentFile: data.current_file,
          filesSearched: data.files_searched,
        });
      } else if (data.type === 'completed') {
        setIsSearching(false);
        setSearchResults({
          session_id: data.session_id,
          total_files: data.total_files,
          total_matches: data.total_matches,
          duration: data.duration
        });
        setShowCompletionModal(true);
        wsRef.current.close();
      } else if (data.type === 'error') {
        setError(data.message);
        setIsSearching(false);
        wsRef.current.close();
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error occurred');
      setIsSearching(false);
    };

    wsRef.current.onclose = () => {
      setIsSearching(false);
    };
  };

  const stopSearch = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsSearching(false);
  };

  const viewSearchHistory = (sessionId) => {
    navigate(`/results/${sessionId}`);
  };

  const handleViewResults = () => {
    setShowCompletionModal(false);
    if (searchResults && searchResults.session_id) {
      navigate(`/results/${searchResults.session_id}`);
    }
  };

  const handleStartNewSearch = () => {
    setShowCompletionModal(false);
    setSearchResults(null);
    setSearchTerm('');
    setError('');
    fetchSearchHistory(); // Refresh history
  };

  const getCommonPaths = () => {
    return [
      '/Users/vndr',
      '/Users/vndr/Documents',
      '/Users/vndr/Downloads',
      '/Users/vndr/Desktop',
      '/Users/vndr/Projects',
      '/Applications',
      '/System/Library'
    ];
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              File Search
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Search for text patterns across files and directories, including inside ZIP archives.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" noValidate autoComplete="off">
              <TextField
                fullWidth
                label={searchFilenames ? "Filename Pattern" : "Search Term"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchFilenames ? "e.g., *.pdf or report" : "e.g., John Doe"}
                sx={{ mb: 2 }}
                disabled={isSearching}
                helperText={searchFilenames 
                  ? "Enter a pattern to match filenames (supports wildcards like *.txt)"
                  : "Enter text to search within file contents"}
              />

              <TextField
                fullWidth
                label="Search Path"
                value={searchPath}
                onChange={(e) => setSearchPath(e.target.value)}
                sx={{ mb: 2 }}
                disabled={isSearching}
                helperText="Choose the directory path to search on your local machine"
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      edge="end" 
                      onClick={handleOpenDirectoryBrowser}
                    >
                      <FolderIcon />
                    </IconButton>
                  ),
                }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Quick paths:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {getCommonPaths().slice(0, 4).map((path) => (
                    <Button
                      key={path}
                      variant="outlined"
                      size="small"
                      onClick={() => setSearchPath(path)}
                      disabled={isSearching}
                    >
                      {path.split('/').pop() || path}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      disabled={isSearching}
                    />
                  }
                  label="Case Sensitive"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={searchFilenames}
                      onChange={(e) => {
                        setSearchFilenames(e.target.checked);
                        if (e.target.checked) {
                          setIncludeZipFiles(false); // Disable archive search for filename mode
                        }
                      }}
                      disabled={isSearching}
                    />
                  }
                  label="Search Filenames Only"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: -1, mb: 2 }}>
                  {searchFilenames 
                    ? "Searches for files matching the pattern in their names"
                    : "Searches for text content inside files"}
                </Typography>
                
                {!searchFilenames && (
                  <>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={includeZipFiles}
                          onChange={(e) => setIncludeZipFiles(e.target.checked)}
                          disabled={isSearching}
                        />
                      }
                      label="Include Archive & Document Files"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: -1, mb: 2 }}>
                      Searches inside: ZIP, TAR, TAR.GZ, TAR.BZ2, DOCX, XLSX, PPTX, ODT, ODS, ODP
                    </Typography>
                  </>
                )}
              </Box>

              {isSearching ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={stopSearch}
                      sx={{ mr: 2 }}
                    >
                      Stop Search
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      Files searched: {searchProgress.filesSearched}
                    </Typography>
                  </Box>
                  
                  <LinearProgress sx={{ mb: 2 }} />
                  
                  {searchProgress.currentFile && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Current file: {searchProgress.currentFile}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SearchIcon />}
                    onClick={startSearch}
                    disabled={!searchTerm.trim()}
                    sx={{ flexGrow: 1 }}
                  >
                    Start Search
                  </Button>
                  
                  <Tooltip title="Save this search configuration">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={() => setShowSaveDialog(true)}
                        disabled={!searchTerm.trim()}
                        size="large"
                        sx={{ border: '1px solid', borderColor: 'primary.main' }}
                      >
                        <BookmarkAddIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  
                  <Tooltip title="Load saved search">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={(e) => setSavedSearchesAnchor(e.currentTarget)}
                        disabled={savedSearches.length === 0}
                        size="large"
                        sx={{ border: '1px solid', borderColor: savedSearches.length > 0 ? 'primary.main' : 'grey.400' }}
                      >
                        <BookmarksIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Searches
              </Typography>
              
              {searchHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent searches
                </Typography>
              ) : (
                <List dense>
                  {searchHistory.map((session) => (
                    <ListItem
                      key={session.id}
                      button
                      onClick={() => viewSearchHistory(session.id)}
                      sx={{ 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1 
                      }}
                    >
                      <ListItemText
                        primary={session.search_term}
                        secondary={
                          <span>
                            {session.total_matches} matches • {' '}
                            {new Date(session.start_time).toLocaleDateString()}
                          </span>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/history')}
              >
                View All History
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Completion Modal */}
      <Dialog
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {searchResults?.total_matches > 0 ? (
            <CheckCircleIcon color="success" />
          ) : (
            <WarningIcon color="warning" />
          )}
          Search Completed
          <IconButton
            onClick={() => setShowCompletionModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText component="div">
            {searchResults && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Search Results for "{searchTerm}"
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {searchResults.total_matches.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Matches
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="text.primary">
                        {searchResults.total_files.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Files Searched
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Search Path:</strong> {searchPath}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Duration:</strong> {searchResults.duration?.toFixed(2)}s
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Case Sensitive:</strong> {caseSensitive ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Include ZIP Files:</strong> {includeZipFiles ? 'Yes' : 'No'}
                  </Typography>
                </Box>

                {searchResults.total_matches === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No matches found for "{searchTerm}" in the specified directory.
                    Try adjusting your search term or checking a different directory.
                  </Alert>
                )}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleStartNewSearch} color="inherit">
            New Search
          </Button>
          {searchResults?.total_matches > 0 && (
            <Button 
              onClick={handleViewResults} 
              variant="contained" 
              startIcon={<SearchIcon />}
            >
              View Results
            </Button>
          )}
          {searchResults?.total_matches === 0 && (
            <Button 
              onClick={handleStartNewSearch} 
              variant="contained" 
              color="primary"
            >
              Try Again
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Directory Browser Modal */}
      <Dialog
        open={showDirectoryBrowser}
        onClose={handleCloseDirectoryBrowser}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FolderOpenIcon color="primary" />
          Browse Directories
          <IconButton
            onClick={handleCloseDirectoryBrowser}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Path:
            </Typography>
            <Paper elevation={1} sx={{ p: 1.5, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
              {currentBrowsePath || '/'}
            </Paper>
          </Box>

          {loadingDirs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {currentBrowsePath !== '/' && currentBrowsePath !== '' && (
                <>
                  <ListItemButton onClick={handleNavigateUp}>
                    <ListItemIcon>
                      <ArrowUpIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary=".. (Parent Directory)"
                      secondary="Go up one level"
                    />
                  </ListItemButton>
                  <Divider />
                </>
              )}

              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {directories.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No subdirectories found"
                      secondary="This directory is empty or contains only files"
                    />
                  </ListItem>
                ) : (
                  directories.map((dir) => (
                    <ListItemButton
                      key={dir.path}
                      onClick={() => handleNavigateToDirectory(dir.path)}
                    >
                      <ListItemIcon>
                        <FolderIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={dir.name}
                        secondary={dir.display_path}
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDirectoryBrowser} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSelectDirectory} 
            variant="contained" 
            startIcon={<CheckCircleIcon />}
          >
            Select This Directory
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Search Configuration</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Give this search a memorable name so you can quickly load it later.
          </DialogContentText>
          
          <TextField
            autoFocus
            fullWidth
            label="Search Name"
            value={saveSearchName}
            onChange={(e) => setSaveSearchName(e.target.value)}
            placeholder="e.g., 'Python files in projects'"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveSearch();
              }
            }}
          />
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Current Configuration:
            </Typography>
            <Typography variant="body2">
              <strong>Term:</strong> {searchTerm}
            </Typography>
            <Typography variant="body2">
              <strong>Path:</strong> {searchPath}
            </Typography>
            <Typography variant="body2">
              <strong>Options:</strong> {[
                caseSensitive && 'Case Sensitive',
                includeZipFiles && 'Include Archives',
                searchFilenames && 'Search Filenames'
              ].filter(Boolean).join(', ') || 'None'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSearch} variant="contained" startIcon={<BookmarkAddIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Saved Searches Menu */}
      <Menu
        anchorEl={savedSearchesAnchor}
        open={Boolean(savedSearchesAnchor)}
        onClose={() => setSavedSearchesAnchor(null)}
        PaperProps={{
          sx: { minWidth: 350, maxHeight: 400 }
        }}
      >
        <MenuItem disabled sx={{ opacity: 1, '&.Mui-disabled': { opacity: 1 } }}>
          <Typography variant="subtitle2" color="primary">
            <BookmarksIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
            Saved Searches ({savedSearches.length})
          </Typography>
        </MenuItem>
        <Divider />
        
        {savedSearches.map((search) => (
          <MenuItem
            key={search.id}
            onClick={() => handleLoadSearch(search)}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              py: 1.5
            }}
          >
            <Box sx={{ flexGrow: 1, pr: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {search.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {search.search_term}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {search.search_path}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSavedSearch(search.id);
              }}
              sx={{ mt: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}
        
        {savedSearches.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No saved searches yet
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export default SearchPage;
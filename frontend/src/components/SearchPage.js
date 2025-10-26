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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
} from '@mui/material';
import { 
  Search as SearchIcon, 
  History as HistoryIcon, 
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPath, setSearchPath] = useState('/Users/vndr');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [includeZipFiles, setIncludeZipFiles] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState({
    currentFile: '',
    filesSearched: 0,
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions`);
      setSearchHistory(response.data.slice(0, 5)); // Show last 5 searches
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
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
                label="Search Term"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., John Doe"
                sx={{ mb: 2 }}
                disabled={isSearching}
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
                      onClick={() => {
                        const paths = getCommonPaths();
                        const pathList = paths.map(p => `• ${p}`).join('\n');
                        alert(`Common paths:\n${pathList}\n\nOr enter any custom path on your system.`);
                      }}
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
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={startSearch}
                  disabled={!searchTerm.trim()}
                >
                  Start Search
                </Button>
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

                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
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
    </Box>
  );
}

export default SearchPage;
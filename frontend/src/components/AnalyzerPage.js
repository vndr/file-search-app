import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Slider,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  DialogContentText
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import StopIcon from '@mui/icons-material/Stop';
import DownloadIcon from '@mui/icons-material/Download';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import DeleteIcon from '@mui/icons-material/Delete';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to format file sizes
const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) return 'N/A';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

function AnalyzerPage() {
  const [directoryPath, setDirectoryPath] = useState('/');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Analysis options
  const [findDuplicates, setFindDuplicates] = useState(true);
  const [maxHashSize, setMaxHashSize] = useState(10);
  const [minFileSize, setMinFileSize] = useState(null); // In bytes, null means no filter
  const [maxFileSize, setMaxFileSize] = useState(null); // In bytes, null means no filter

  // Directory browser state
  const [showDirectoryBrowser, setShowDirectoryBrowser] = useState(false);
  const [currentBrowsePath, setCurrentBrowsePath] = useState('/');
  const [directories, setDirectories] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);

  // Duplicates modal state
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);

  // Empty directories state
  const [showEmptyDirsModal, setShowEmptyDirsModal] = useState(false);
  const [selectedEmptyDirs, setSelectedEmptyDirs] = useState([]);
  const [deletingEmptyDirs, setDeletingEmptyDirs] = useState(false);

  // Saved analysis configurations state
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [showSaveAnalysisDialog, setShowSaveAnalysisDialog] = useState(false);
  const [saveAnalysisName, setSaveAnalysisName] = useState('');
  const [savedAnalysesAnchor, setSavedAnalysesAnchor] = useState(null);

  // Table sorting state
  const [orderBy, setOrderBy] = useState('size');
  const [order, setOrder] = useState('desc');

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  // Fetch saved analyses on mount
  React.useEffect(() => {
    fetchSavedAnalyses();
  }, []);

  const fetchSavedAnalyses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/saved-searches`);
      // Filter for analysis-type searches (those without search_term or with analysis-specific fields)
      setSavedAnalyses(response.data.filter(s => !s.search_term || s.search_term === ''));
    } catch (error) {
      console.error('Error fetching saved analyses:', error);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!saveAnalysisName.trim()) {
      setError('Please enter a name for the saved analysis');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/saved-searches`, {
        name: saveAnalysisName,
        search_term: '', // Empty for analysis configs
        search_path: directoryPath,
        case_sensitive: false,
        include_zip_files: false,
        search_filenames: false,
        // Store analysis-specific options as JSON in file_type field
        file_type: JSON.stringify({
          find_duplicates: findDuplicates,
          max_hash_size: maxHashSize,
          min_file_size: minFileSize,
          max_file_size: maxFileSize
        })
      });
      
      setShowSaveAnalysisDialog(false);
      setSaveAnalysisName('');
      fetchSavedAnalyses();
      setSuccessMessage('Analysis configuration saved successfully!');
      setError(null);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error saving analysis configuration');
    }
  };

  const handleLoadAnalysis = (analysis) => {
    setDirectoryPath(analysis.search_path);
    
    // Parse analysis-specific options from file_type field
    if (analysis.file_type) {
      try {
        const options = JSON.parse(analysis.file_type);
        setFindDuplicates(options.find_duplicates ?? true);
        setMaxHashSize(options.max_hash_size ?? 10);
        setMinFileSize(options.min_file_size ?? null);
        setMaxFileSize(options.max_file_size ?? null);
      } catch (e) {
        console.error('Error parsing analysis options:', e);
      }
    }
    
    setSavedAnalysesAnchor(null);
    setSuccessMessage(`Loaded analysis configuration: ${analysis.name}`);
  };

  const handleDeleteSavedAnalysis = async (analysisId) => {
    try {
      await axios.delete(`${API_URL}/api/saved-searches/${analysisId}`);
      fetchSavedAnalyses();
      setSuccessMessage('Analysis configuration deleted');
    } catch (error) {
      console.error('Error deleting saved analysis:', error);
      setError('Error deleting analysis configuration');
    }
  };

  // Fetch directories for browser
  const fetchDirectories = async (path) => {
    setDirectoryLoading(true);
    try {
      const response = await axios.get(`${API_URL}/filesystem/directories`, {
        params: { path }
      });
      setDirectories(response.data.directories || []);
      setCurrentBrowsePath(response.data.current_path || path);
    } catch (error) {
      console.error('Error fetching directories:', error);
      setDirectories([]);
    } finally {
      setDirectoryLoading(false);
    }
  };

  // Handle directory navigation
  const handleDirectoryClick = (path) => {
    fetchDirectories(path);
  };

  // Handle analyze button
  const handleAnalyze = async () => {
    setError(null);
    setAnalyzing(true);
    setAnalysisData(null);
    
    // Generate a cryptographically secure session ID
    const randomBytes = new Uint8Array(9);
    crypto.getRandomValues(randomBytes);
    const randomString = Array.from(randomBytes, byte => byte.toString(36).padStart(2, '0')).join('').substr(0, 9);
    const sessionId = `analysis_${Date.now()}_${randomString}`;
    setCurrentSessionId(sessionId);

    try {
      const response = await axios.post(`${API_URL}/api/analyze-directory`, null, {
        params: { 
          path: directoryPath,
          find_duplicates: findDuplicates,
          max_hash_size: maxHashSize,
          session_id: sessionId,
          min_size: minFileSize,
          max_size: maxFileSize
        }
      });
      setAnalysisData(response.data);
      
      // Show message if cancelled
      if (response.data.cancelled) {
        setError('Analysis was stopped. Showing partial results.');
      }
    } catch (error) {
      console.error('Error analyzing directory:', error);
      setError(error.response?.data?.detail || 'Error analyzing directory');
    } finally {
      setAnalyzing(false);
      setCurrentSessionId(null);
    }
  };

  // Handle stop button
  const handleStop = async () => {
    if (!currentSessionId) return;
    
    try {
      await axios.post(`${API_URL}/api/cancel-analysis/${currentSessionId}`);
      // The analyze request will return with partial results
    } catch (error) {
      console.error('Error cancelling analysis:', error);
    }
  };

  // Handle CSV export
  const handleExport = async (exportType) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/export-analysis-csv`,
        analysisData,
        {
          params: { export_type: exportType },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `export_${exportType}_${Date.now()}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Error exporting data to CSV');
    }
  };

  const handleDeleteEmptyDirectories = async () => {
    if (selectedEmptyDirs.length === 0) {
      setError('No directories selected');
      return;
    }

    console.log('Deleting directories:', selectedEmptyDirs);
    setDeletingEmptyDirs(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/delete-empty-directories`, {
        directories: selectedEmptyDirs
      });

      console.log('Delete response:', response.data);

      // Show results
      const { total_deleted, total_failed, deleted, failed } = response.data;
      
      if (total_deleted > 0) {
        setSuccessMessage(`Successfully deleted ${total_deleted} empty director${total_deleted > 1 ? 'ies' : 'y'}!`);
        
        // Update analysis data to remove deleted directories
        setAnalysisData(prev => ({
          ...prev,
          empty_directories: prev.empty_directories.filter(dir => !deleted.includes(dir.path)),
          summary: {
            ...prev.summary,
            empty_directories: prev.summary.empty_directories - total_deleted
          }
        }));
        
        setSelectedEmptyDirs([]);
      }
      
      if (total_failed > 0) {
        console.error('Failed to delete some directories:', failed);
        const errorMsg = `${total_failed} director${total_failed > 1 ? 'ies' : 'y'} could not be deleted: ${failed.map(f => f.error).join(', ')}`;
        if (total_deleted > 0) {
          setSuccessMessage(prev => prev + ` However, ${errorMsg}`);
        } else {
          setError(errorMsg);
        }
      }
    } catch (error) {
      console.error('Error deleting empty directories:', error);
      console.error('Error details:', error.response?.data);
      setError(`Error deleting empty directories: ${error.response?.data?.detail || error.message}`);
    } finally {
      setDeletingEmptyDirs(false);
    }
  };

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Get breadcrumb parts
  const getBreadcrumbs = () => {
    if (!currentBrowsePath || currentBrowsePath === '/') {
      return [{ label: 'Root', path: '/' }];
    }
    const parts = currentBrowsePath.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Root', path: '/' }];
    let currentPath = '';
    parts.forEach((part) => {
      currentPath += '/' + part;
      breadcrumbs.push({ label: part, path: currentPath });
    });
    return breadcrumbs;
  };

  // Handle table sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort files
  const sortFiles = (files) => {
    return [...files].sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];
      
      if (orderBy === 'size') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Directory Analyzer
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Analyze a directory to see detailed statistics about file types, sizes, duplicates, and more.
        </Typography>

        {/* Directory Selection */}
        <Box sx={{ mt: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Directory Path"
                value={directoryPath}
                onChange={(e) => setDirectoryPath(e.target.value)}
                placeholder="/path/to/directory"
                disabled={analyzing}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FolderOpenIcon />}
                onClick={() => {
                  setShowDirectoryBrowser(true);
                  fetchDirectories(directoryPath || '/');
                }}
                disabled={analyzing}
              >
                Browse
              </Button>
            </Grid>
            <Grid item xs={12} md={5}>
              {analyzing ? (
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  onClick={handleStop}
                  startIcon={<StopIcon />}
                >
                  Stop
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch', width: '100%' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAnalyze}
                    disabled={!directoryPath}
                    startIcon={<AnalyticsIcon />}
                    sx={{ flexGrow: 1, minWidth: 120 }}
                  >
                    Analyze
                  </Button>
                  
                  <Tooltip title="Save this analysis configuration">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={() => setShowSaveAnalysisDialog(true)}
                        disabled={!directoryPath}
                        sx={{ 
                          border: '1px solid', 
                          borderColor: directoryPath ? 'primary.main' : 'grey.400',
                          borderRadius: 1,
                          flexShrink: 0
                        }}
                      >
                        <BookmarkAddIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  
                  <Tooltip title="Load saved analysis">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={(e) => setSavedAnalysesAnchor(e.currentTarget)}
                        disabled={savedAnalyses.length === 0}
                        sx={{ 
                          border: '1px solid', 
                          borderColor: savedAnalyses.length > 0 ? 'primary.main' : 'grey.400',
                          borderRadius: 1,
                          flexShrink: 0
                        }}
                      >
                        <BookmarksIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Analyzing Progress Indicator */}
        {analyzing && (
          <Alert severity="info" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="body2">
                <strong>Analyzing directory...</strong> This may take a while for large directories.
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Click <strong>Stop</strong> to cancel and see partial results.
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Analysis Options */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
          <Typography variant="subtitle2" gutterBottom>
            Analysis Options
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Tooltip title="Disable duplicate detection for faster analysis of large directories">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={findDuplicates}
                      onChange={(e) => setFindDuplicates(e.target.checked)}
                      disabled={analyzing}
                    />
                  }
                  label="Find Duplicate Files (slower)"
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={6}>
              <Tooltip title="Only hash files smaller than this size for duplicate detection">
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Max File Size for Hashing: {maxHashSize} MB
                  </Typography>
                  <Slider
                    value={maxHashSize}
                    onChange={(e, value) => setMaxHashSize(value)}
                    min={1}
                    max={100}
                    step={1}
                    marks={[
                      { value: 1, label: '1MB' },
                      { value: 10, label: '10MB' },
                      { value: 50, label: '50MB' },
                      { value: 100, label: '100MB' }
                    ]}
                    disabled={analyzing || !findDuplicates}
                  />
                </Box>
              </Tooltip>
            </Grid>
            
            {/* File Size Filter */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold' }}>
                File Size Filter (optional)
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Minimum File Size"
                type="number"
                value={minFileSize !== null ? minFileSize : ''}
                onChange={(e) => setMinFileSize(e.target.value ? parseInt(e.target.value) : null)}
                fullWidth
                size="small"
                disabled={analyzing}
                helperText="Leave empty for no minimum"
                InputProps={{
                  endAdornment: <Typography variant="caption">bytes</Typography>
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Clear" size="small" onClick={() => setMinFileSize(null)} disabled={analyzing} />
                <Chip label="1 KB" size="small" onClick={() => setMinFileSize(1024)} disabled={analyzing} />
                <Chip label="10 KB" size="small" onClick={() => setMinFileSize(10240)} disabled={analyzing} />
                <Chip label="100 KB" size="small" onClick={() => setMinFileSize(102400)} disabled={analyzing} />
                <Chip label="1 MB" size="small" onClick={() => setMinFileSize(1048576)} disabled={analyzing} />
                <Chip label="10 MB" size="small" onClick={() => setMinFileSize(10485760)} disabled={analyzing} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Maximum File Size"
                type="number"
                value={maxFileSize !== null ? maxFileSize : ''}
                onChange={(e) => setMaxFileSize(e.target.value ? parseInt(e.target.value) : null)}
                fullWidth
                size="small"
                disabled={analyzing}
                helperText="Leave empty for no maximum"
                InputProps={{
                  endAdornment: <Typography variant="caption">bytes</Typography>
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Clear" size="small" onClick={() => setMaxFileSize(null)} disabled={analyzing} />
                <Chip label="100 KB" size="small" onClick={() => setMaxFileSize(102400)} disabled={analyzing} />
                <Chip label="1 MB" size="small" onClick={() => setMaxFileSize(1048576)} disabled={analyzing} />
                <Chip label="10 MB" size="small" onClick={() => setMaxFileSize(10485760)} disabled={analyzing} />
                <Chip label="100 MB" size="small" onClick={() => setMaxFileSize(104857600)} disabled={analyzing} />
                <Chip label="1 GB" size="small" onClick={() => setMaxFileSize(1073741824)} disabled={analyzing} />
              </Box>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Performance Tips:</strong> For directories with 100,000+ files, disable duplicate detection or reduce max hash size for faster analysis. 
              The optimized algorithm uses parallel processing and smart sampling for better performance.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Note:</strong> Hidden directories (starting with ".") like .git, .cache, .npm are automatically excluded from analysis.
            </Typography>
          </Alert>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Success Display */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Summary Cards */}
        {analysisData && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Files
                    </Typography>
                    <Typography variant="h4">
                      {analysisData.summary.total_files.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Size
                    </Typography>
                    <Typography variant="h4">
                      {formatBytes(analysisData.summary.total_size)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      File Types
                    </Typography>
                    <Typography variant="h4">
                      {analysisData.summary.unique_file_types}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    cursor: analysisData.summary.duplicate_files > 0 ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': analysisData.summary.duplicate_files > 0 ? {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    } : {}
                  }}
                  onClick={() => {
                    if (analysisData.summary.duplicate_files > 0) {
                      setShowDuplicatesModal(true);
                    }
                  }}
                >
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Duplicate Files
                      {analysisData.summary.duplicate_files > 0 && (
                        <Chip 
                          label="Click to view" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </Typography>
                    {!findDuplicates ? (
                      <Typography variant="body1" color="text.secondary">
                        Not analyzed
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="h4" color="error">
                          {analysisData.summary.duplicate_files}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Wasted: {formatBytes(analysisData.summary.wasted_space)}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    cursor: analysisData?.summary?.empty_directories > 0 ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': analysisData?.summary?.empty_directories > 0 ? {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    } : {}
                  }}
                  onClick={() => {
                    if (analysisData?.summary?.empty_directories > 0) {
                      setShowEmptyDirsModal(true);
                    }
                  }}
                >
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Empty Directories
                      {analysisData?.summary?.empty_directories > 0 && (
                        <Chip 
                          label="Click to view" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </Typography>
                    <Typography variant="h4" color={analysisData?.summary?.empty_directories > 0 ? 'warning.main' : 'text.primary'}>
                      {analysisData?.summary?.empty_directories || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analysisData?.summary?.empty_directories > 0 ? 'Can be cleaned up' : 'All clean'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tabs for different views */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', alignItems: 'center' }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ flexGrow: 1 }}>
                <Tab label="Overview" />
                <Tab label="All Files" />
                <Tab label="Duplicates" />
              </Tabs>
              <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                {activeTab === 1 && (
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('all_files')}
                    variant="outlined"
                  >
                    Export All Files
                  </Button>
                )}
                {activeTab === 2 && analysisData.duplicates && analysisData.duplicates.length > 0 && (
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport('duplicates')}
                    variant="outlined"
                  >
                    Export Duplicates
                  </Button>
                )}
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('file_types')}
                  variant="outlined"
                >
                  Export File Types
                </Button>
              </Box>
            </Box>

            {/* Tab 0: Overview with Charts */}
            {activeTab === 0 && (
              <Box>
                {/* File Type Distribution */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  File Type Distribution
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        By Count
                      </Typography>
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={analysisData.file_types.slice(0, 8)}
                            dataKey="count"
                            nameKey="extension"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.extension} (${entry.count})`}
                          >
                            {analysisData.file_types.slice(0, 8).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        By Size
                      </Typography>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={analysisData.file_types.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="extension" />
                          <YAxis tickFormatter={(value) => formatBytes(value)} />
                          <RechartsTooltip formatter={(value) => formatBytes(value)} />
                          <Legend />
                          <Bar dataKey="total_size" fill="#8884d8" name="Total Size" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Size Distribution */}
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Size Distribution
                </Typography>
                <Paper sx={{ p: 2, height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(analysisData.size_distribution).map(([range, count]) => ({
                        range,
                        count
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#00C49F" name="Number of Files" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>

                {/* Top 10 Largest Files */}
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Top 10 Largest Files
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>File Name</TableCell>
                        <TableCell>Path</TableCell>
                        <TableCell align="right">Size</TableCell>
                        <TableCell>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analysisData.largest_files.map((file, index) => (
                        <TableRow key={index}>
                          <TableCell>{file.name}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                            {file.path}
                          </TableCell>
                          <TableCell align="right">{formatBytes(file.size)}</TableCell>
                          <TableCell>
                            <Chip label={file.extension} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Tab 1: All Files Table */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  All Files ({analysisData.all_files.length.toLocaleString()})
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'name'}
                            direction={orderBy === 'name' ? order : 'asc'}
                            onClick={() => handleSort('name')}
                          >
                            File Name
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'path'}
                            direction={orderBy === 'path' ? order : 'asc'}
                            onClick={() => handleSort('path')}
                          >
                            Path
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right">
                          <TableSortLabel
                            active={orderBy === 'size'}
                            direction={orderBy === 'size' ? order : 'asc'}
                            onClick={() => handleSort('size')}
                          >
                            Size
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'extension'}
                            direction={orderBy === 'extension' ? order : 'asc'}
                            onClick={() => handleSort('extension')}
                          >
                            Type
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>
                          <TableSortLabel
                            active={orderBy === 'modified'}
                            direction={orderBy === 'modified' ? order : 'asc'}
                            onClick={() => handleSort('modified')}
                          >
                            Modified
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortFiles(analysisData.all_files).slice(0, 1000).map((file, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <InsertDriveFileIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              {file.name}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                            {file.path}
                          </TableCell>
                          <TableCell align="right">{formatBytes(file.size)}</TableCell>
                          <TableCell>
                            <Chip label={file.extension} size="small" />
                          </TableCell>
                          <TableCell>{new Date(file.modified).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {analysisData.all_files.length > 1000 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Showing first 1000 files out of {analysisData.all_files.length.toLocaleString()} total files.
                  </Alert>
                )}
              </Box>
            )}

            {/* Tab 2: Duplicates */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Duplicate Files ({analysisData.duplicates.length} groups)
                </Typography>
                {analysisData.duplicates.length === 0 ? (
                  <Alert severity="success">
                    No duplicate files found! All files in this directory are unique.
                  </Alert>
                ) : (
                  <>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Found {analysisData.summary.duplicate_files} duplicate files wasting{' '}
                      {formatBytes(analysisData.summary.wasted_space)} of space.
                    </Alert>
                    {analysisData.duplicates.map((duplicate, index) => (
                      <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <FileCopyIcon sx={{ mr: 2, color: 'error.main' }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1">
                                {duplicate.count} copies • {formatBytes(duplicate.size)} each
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Wasted space: {formatBytes(duplicate.wasted_space)}
                              </Typography>
                            </Box>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {duplicate.files.map((file, fileIndex) => (
                              <ListItemButton key={fileIndex}>
                                <ListItemIcon>
                                  <InsertDriveFileIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={file.name}
                                  secondary={file.path}
                                />
                              </ListItemButton>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Duplicates Modal */}
      <Dialog
        open={showDuplicatesModal}
        onClose={() => setShowDuplicatesModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FileCopyIcon sx={{ mr: 1, color: 'error.main' }} />
            Duplicate Files
          </Box>
          {analysisData && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Found {analysisData.summary.duplicate_files} duplicate files in{' '}
              {analysisData.duplicates.length} groups, wasting{' '}
              {formatBytes(analysisData.summary.wasted_space)} of space.
            </Alert>
          )}
        </DialogTitle>
        <DialogContent>
          {analysisData && analysisData.duplicates.length === 0 ? (
            <Alert severity="success">
              No duplicate files found! All files in this directory are unique.
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              {analysisData && analysisData.duplicates.map((duplicate, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <FileCopyIcon sx={{ mr: 2, color: 'error.main' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">
                          <strong>{duplicate.count} copies</strong> • {formatBytes(duplicate.size)} each
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Wasted space: <strong>{formatBytes(duplicate.wasted_space)}</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>File Name</TableCell>
                            <TableCell>Full Path</TableCell>
                            <TableCell align="right">Size</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {duplicate.files.map((file, fileIndex) => (
                            <TableRow key={fileIndex} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <InsertDriveFileIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                  {file.name}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                {file.path}
                              </TableCell>
                              <TableCell align="right">{formatBytes(duplicate.size)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDuplicatesModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Empty Directories Modal */}
      <Dialog
        open={showEmptyDirsModal}
        onClose={() => setShowEmptyDirsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FolderOffIcon sx={{ mr: 1, color: 'warning.main' }} />
              Empty Directories
            </Box>
            {selectedEmptyDirs.length > 0 && (
              <Chip 
                label={`${selectedEmptyDirs.length} selected`}
                color="primary"
                size="small"
              />
            )}
          </Box>
          {analysisData && analysisData.empty_directories && analysisData.empty_directories.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Found {analysisData.empty_directories.length} empty director{analysisData.empty_directories.length > 1 ? 'ies' : 'y'} that can be cleaned up.
            </Alert>
          )}
        </DialogTitle>
        <DialogContent>
          {analysisData && analysisData.empty_directories && analysisData.empty_directories.length === 0 ? (
            <Alert severity="success">
              No empty directories found! Your directory structure is clean.
            </Alert>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedEmptyDirs.length === analysisData?.empty_directories?.length}
                      indeterminate={selectedEmptyDirs.length > 0 && selectedEmptyDirs.length < analysisData?.empty_directories?.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmptyDirs(analysisData?.empty_directories?.map(d => d.path) || []);
                        } else {
                          setSelectedEmptyDirs([]);
                        }
                      }}
                    />
                  }
                  label="Select All"
                />
                {selectedEmptyDirs.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteEmptyDirectories}
                    disabled={deletingEmptyDirs}
                  >
                    {deletingEmptyDirs ? 'Deleting...' : `Delete Selected (${selectedEmptyDirs.length})`}
                  </Button>
                )}
              </Box>
              
              <List>
                {analysisData?.empty_directories?.map((dir, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => {
                      setSelectedEmptyDirs(prev => {
                        if (prev.includes(dir.path)) {
                          return prev.filter(p => p !== dir.path);
                        } else {
                          return [...prev, dir.path];
                        }
                      });
                    }}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={selectedEmptyDirs.includes(dir.path)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      <FolderOffIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={dir.name}
                      secondary={dir.path}
                      secondaryTypographyProps={{
                        sx: { fontFamily: 'monospace', fontSize: '0.85rem' }
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowEmptyDirsModal(false);
            setSelectedEmptyDirs([]);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Directory Browser Modal */}
      <Dialog
        open={showDirectoryBrowser}
        onClose={() => setShowDirectoryBrowser(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Select Directory
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mt: 1 }}
          >
            {getBreadcrumbs().map((crumb, index) => (
              <Link
                key={index}
                component="button"
                variant="body2"
                onClick={() => handleDirectoryClick(crumb.path)}
                sx={{ cursor: 'pointer' }}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        </DialogTitle>
        <DialogContent>
          {directoryLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {directories.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  No subdirectories found
                </Typography>
              ) : (
                directories.map((dir) => (
                  <ListItemButton
                    key={dir.path}
                    onClick={() => handleDirectoryClick(dir.path)}
                  >
                    <ListItemIcon>
                      <FolderIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={dir.name}
                      secondary={dir.display_path || dir.path}
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDirectoryBrowser(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setDirectoryPath(currentBrowsePath);
              setShowDirectoryBrowser(false);
            }}
          >
            Select This Directory
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Analysis Dialog */}
      <Dialog open={showSaveAnalysisDialog} onClose={() => setShowSaveAnalysisDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Analysis Configuration</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Give this analysis configuration a memorable name so you can quickly load it later.
          </DialogContentText>
          
          <TextField
            autoFocus
            fullWidth
            label="Configuration Name"
            value={saveAnalysisName}
            onChange={(e) => setSaveAnalysisName(e.target.value)}
            placeholder="e.g., 'Project folder analysis'"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveAnalysis();
              }
            }}
            sx={{ mt: 2 }}
          />
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Current Configuration:
            </Typography>
            <Typography variant="body2">
              <strong>Directory:</strong> {directoryPath}
            </Typography>
            <Typography variant="body2">
              <strong>Find Duplicates:</strong> {findDuplicates ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body2">
              <strong>Max Hash Size:</strong> {maxHashSize} MB
            </Typography>
            <Typography variant="body2">
              <strong>Min File Size:</strong> {minFileSize !== null ? `${minFileSize.toLocaleString()} bytes` : 'None'}
            </Typography>
            <Typography variant="body2">
              <strong>Max File Size:</strong> {maxFileSize !== null ? `${maxFileSize.toLocaleString()} bytes` : 'None'}
            </Typography>
            <Typography variant="body2">
              <strong>Min File Size:</strong> {formatFileSize(minFileSize)}
            </Typography>
            <Typography variant="body2">
              <strong>Max File Size:</strong> {formatFileSize(maxFileSize)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveAnalysisDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAnalysis} variant="contained" startIcon={<BookmarkAddIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Saved Analyses Menu */}
      <Menu
        anchorEl={savedAnalysesAnchor}
        open={Boolean(savedAnalysesAnchor)}
        onClose={() => setSavedAnalysesAnchor(null)}
        PaperProps={{
          sx: { minWidth: 350, maxHeight: 400 }
        }}
      >
        <MenuItem disabled sx={{ opacity: 1, '&.Mui-disabled': { opacity: 1 } }}>
          <Typography variant="subtitle2" color="primary">
            <BookmarksIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
            Saved Analyses ({savedAnalyses.length})
          </Typography>
        </MenuItem>
        <Divider />
        
        {savedAnalyses.map((analysis) => (
          <MenuItem
            key={analysis.id}
            onClick={() => handleLoadAnalysis(analysis)}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              py: 1.5
            }}
          >
            <Box sx={{ flexGrow: 1, pr: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {analysis.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {analysis.search_path}
              </Typography>
              {analysis.file_type && (() => {
                try {
                  const options = JSON.parse(analysis.file_type);
                  return (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Duplicates: {options.find_duplicates ? 'Yes' : 'No'} | Max: {options.max_hash_size}MB
                    </Typography>
                  );
                } catch (e) {
                  return null;
                }
              })()}
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSavedAnalysis(analysis.id);
              }}
              sx={{ mt: 0.5 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}
        
        {savedAnalyses.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No saved analyses yet
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
}

export default AnalyzerPage;

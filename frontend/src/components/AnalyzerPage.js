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
  Tooltip
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

function AnalyzerPage() {
  const [directoryPath, setDirectoryPath] = useState('/');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Analysis options
  const [findDuplicates, setFindDuplicates] = useState(true);
  const [maxHashSize, setMaxHashSize] = useState(10);

  // Directory browser state
  const [showDirectoryBrowser, setShowDirectoryBrowser] = useState(false);
  const [currentBrowsePath, setCurrentBrowsePath] = useState('/');
  const [directories, setDirectories] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);

  // Duplicates modal state
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);

  // Table sorting state
  const [orderBy, setOrderBy] = useState('size');
  const [order, setOrder] = useState('desc');

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

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
    
    // Generate a session ID
    const sessionId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(sessionId);

    try {
      const response = await axios.post(`${API_URL}/api/analyze-directory`, null, {
        params: { 
          path: directoryPath,
          find_duplicates: findDuplicates,
          max_hash_size: maxHashSize,
          session_id: sessionId
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
            <Grid item xs={6} md={2}>
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
            <Grid item xs={6} md={2}>
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
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleAnalyze}
                  disabled={!directoryPath}
                  startIcon={<AnalyticsIcon />}
                >
                  Analyze
                </Button>
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
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
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
    </Container>
  );
}

export default AnalyzerPage;

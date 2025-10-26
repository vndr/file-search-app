import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
  Grid,
  Divider,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Search as SearchIcon,
  ExpandMore,
  FileCopy,
  Folder,
  Schedule,
  FindInPage,
  Close as CloseIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [matchDetails, setMatchDetails] = useState([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filePreview, setFilePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [resultsPerPage] = useState(20);

  const fetchSessionData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`);
      setSession(response.data);
    } catch (error) {
      setError('Error fetching session data');
      console.error(error);
    }
  }, [sessionId]);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/results?limit=1000`);
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching results');
      setLoading(false);
      console.error(error);
    }
  }, [sessionId]);

  const filterResults = useCallback(() => {
    if (!searchFilter.trim()) {
      setFilteredResults(results);
    } else {
      const filtered = results.filter(result =>
        result.file_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        result.file_path.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (result.preview_text && result.preview_text.toLowerCase().includes(searchFilter.toLowerCase()))
      );
      setFilteredResults(filtered);
    }
    setPage(1); // Reset to first page when filtering
  }, [results, searchFilter]);

  useEffect(() => {
    fetchSessionData();
    fetchResults();
  }, [sessionId, fetchSessionData, fetchResults]);

  useEffect(() => {
    filterResults();
  }, [results, searchFilter, filterResults]);

  const fetchMatchDetails = async (resultId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/results/${resultId}/matches`);
      setMatchDetails(response.data);
    } catch (error) {
      console.error('Error fetching match details:', error);
    }
  };

  const handleResultClick = async (result) => {
    setSelectedResult(result);
    setShowDetailsDialog(true);
    setFilePreview('Loading preview...');
    await fetchMatchDetails(result.id);
    
    // Fetch actual file preview from server
    try {
      const response = await axios.get(`${API_BASE_URL}/results/${result.id}/preview?max_lines=100`);
      if (response.data && response.data.content) {
        setFilePreview(response.data.content);
      } else {
        setFilePreview('No preview available');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      setFilePreview('Error loading file preview. The file may not be accessible.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeColor = (fileType) => {
    const colors = {
      '.js': 'warning',
      '.ts': 'info',
      '.py': 'success',
      '.html': 'error',
      '.css': 'secondary',
      '.json': 'primary',
      '.txt': 'default',
    };
    return colors[fileType] || 'default';
  };

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const paginatedResults = filteredResults.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading results...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Search Results</Typography>
        </Box>

        {session && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box display="flex" alignItems="center">
                <FindInPage sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Search Term</Typography>
                  <Typography variant="body1" fontWeight="bold">{session.search_term}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box display="flex" alignItems="center">
                <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">
                    {session.end_time 
                      ? moment(session.end_time).diff(moment(session.start_time), 'seconds') + 's'
                      : 'In progress'
                    }
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Files Searched</Typography>
                <Typography variant="body1">{session.total_files_searched.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Matches</Typography>
                <Typography variant="body1" color="primary.main" fontWeight="bold">
                  {session.total_matches.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">Started</Typography>
                <Typography variant="body1">{moment(session.start_time).format('MMM DD, YYYY HH:mm')}</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Results List */}
        <Grid item xs={12} md={selectedResult ? 6 : 12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Results ({filteredResults.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Filter results..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Box>

            {paginatedResults.length === 0 ? (
              <Typography color="text.secondary">No results found.</Typography>
            ) : (
              <>
                <List>
                  {paginatedResults.map((result, index) => (
                    <React.Fragment key={result.id}>
                      <ListItem
                        button
                        onClick={() => handleResultClick(result)}
                        selected={selectedResult?.id === result.id}
                        sx={{ 
                          borderRadius: 1,
                          mb: 1,
                          border: selectedResult?.id === result.id ? 2 : 1,
                          borderColor: selectedResult?.id === result.id ? 'primary.main' : 'divider'
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                              {result.is_zip_file ? <FileCopy color="action" /> : <Folder color="action" />}
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {result.file_name}
                              </Typography>
                              <Chip 
                                label={result.file_type || 'unknown'} 
                                size="small" 
                                color={getFileTypeColor(result.file_type)}
                                variant="outlined"
                              />
                              <Chip 
                                label={`${result.match_count} matches`} 
                                size="small" 
                                color="primary"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {result.is_zip_file ? `${result.zip_parent_path} > ${result.file_path}` : result.file_path}
                              </Typography>
                              {result.preview_text && (
                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  {result.preview_text}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                Size: {formatFileSize(result.file_size)}
                              </Typography>
                            </Box>
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(result.file_path);
                          }}
                        >
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </ListItem>
                      {index < paginatedResults.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Match Details */}
        {selectedResult && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Match Details: {selectedResult.file_name}
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Path:</strong> {selectedResult.file_path}
                </Typography>
                {selectedResult.is_zip_file && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>ZIP Parent:</strong> {selectedResult.zip_parent_path}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  <strong>Matches:</strong> {selectedResult.match_count}
                </Typography>
              </Box>

              {matchDetails.length === 0 ? (
                <Typography color="text.secondary">Loading match details...</Typography>
              ) : (
                <List>
                  {matchDetails.map((match, index) => (
                    <Accordion key={index} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2">
                          Line {match.line_number}: {match.line_content.substring(0, 80)}
                          {match.line_content.length > 80 && '...'}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box>
                          {match.context_before && (
                            <Box mb={1}>
                              <Typography variant="caption" color="text.secondary">Context Before:</Typography>
                              <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, fontFamily: 'monospace' }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                  {match.context_before}
                                </pre>
                              </Box>
                            </Box>
                          )}
                          
                          <Box mb={1}>
                            <Typography variant="caption" color="primary.main">Matched Line:</Typography>
                            <Box sx={{ bgcolor: 'primary.50', p: 1, borderRadius: 1, fontFamily: 'monospace' }}>
                              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                {match.line_content}
                              </pre>
                            </Box>
                          </Box>

                          {match.context_after && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">Context After:</Typography>
                              <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, fontFamily: 'monospace' }}>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                  {match.context_after}
                                </pre>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* File Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <FileIcon color="primary" />
              <Typography variant="h6">File Details</Typography>
            </Box>
            <IconButton onClick={() => setShowDetailsDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedResult && (
            <Box>
              {/* File Information Card */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📄 {selectedResult.file_name}
                  </Typography>
                  
                  <Table size="small" sx={{ mt: 2 }}>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>File Name:</TableCell>
                        <TableCell>{selectedResult.file_name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Full Path:</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                              {selectedResult.is_zip_file 
                                ? `${selectedResult.zip_parent_path} > ${selectedResult.file_path}`
                                : selectedResult.file_path}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(selectedResult.file_path)}
                              title="Copy path"
                            >
                              <FileCopy fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>File Type:</TableCell>
                        <TableCell>
                          <Chip 
                            label={selectedResult.file_type || 'unknown'} 
                            size="small" 
                            color={getFileTypeColor(selectedResult.file_type)}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>File Size:</TableCell>
                        <TableCell>
                          {formatFileSize(selectedResult.file_size)} 
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({selectedResult.file_size?.toLocaleString()} bytes)
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Matches Found:</TableCell>
                        <TableCell>
                          <Chip label={`${selectedResult.match_count} matches`} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Location Type:</TableCell>
                        <TableCell>
                          <Chip 
                            label={selectedResult.is_zip_file ? 'Inside Archive' : 'Regular File'} 
                            color={selectedResult.is_zip_file ? 'warning' : 'success'}
                            size="small"
                            icon={selectedResult.is_zip_file ? <FileCopy /> : <Folder />}
                          />
                        </TableCell>
                      </TableRow>
                      {selectedResult.is_zip_file && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Archive Path:</TableCell>
                          <TableCell>{selectedResult.zip_parent_path}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Preview Card */}
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <VisibilityIcon color="primary" />
                    <Typography variant="h6">File Preview</Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      bgcolor: 'action.hover', 
                      p: 2, 
                      borderRadius: 1, 
                      maxHeight: 400, 
                      overflow: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {filePreview}
                    </pre>
                  </Box>
                  
                  {matchDetails.length > 10 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Showing first 10 of {matchDetails.length} matches. Scroll down to see all matches in the results panel.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Match Summary */}
              {matchDetails.length > 0 && (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <FindInPage color="primary" />
                      <Typography variant="h6">Match Summary</Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Total Matches:</Typography>
                        <Typography variant="h6">{selectedResult.match_count}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Lines with Matches:</Typography>
                        <Typography variant="h6">{matchDetails.length}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => copyToClipboard(selectedResult?.file_path || '')}
            startIcon={<FileCopy />}
          >
            Copy Path
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ResultsPage;
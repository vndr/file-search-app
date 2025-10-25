import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Alert,
  TablePagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  Delete,
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';
import moment from 'moment';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function HistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/sessions`);
      setSessions(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching search history');
      setLoading(false);
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filterSessions = useCallback(() => {
    if (!searchFilter.trim()) {
      setFilteredSessions(sessions);
    } else {
      const filtered = sessions.filter(session =>
        session.search_term.toLowerCase().includes(searchFilter.toLowerCase()) ||
        session.search_path.toLowerCase().includes(searchFilter.toLowerCase())
      );
      setFilteredSessions(filtered);
    }
    setPage(0); // Reset to first page when filtering
  }, [sessions, searchFilter]);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchFilter, filterSessions]);

  const deleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this search session?')) {
      try {
        await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`);
        setSessions(sessions.filter(session => session.id !== sessionId));
      } catch (error) {
        console.error('Error deleting session:', error);
        setError('Error deleting session');
      }
    }
  };

  const viewResults = (sessionId) => {
    navigate(`/results/${sessionId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'In progress';
    return moment(endTime).diff(moment(startTime), 'seconds') + 's';
  };

  // Pagination
  const paginatedSessions = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading search history...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4">Search History</Typography>
          </Box>
          
          <TextField
            size="small"
            placeholder="Filter by search term or path..."
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {filteredSessions.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No search history found
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Start a New Search
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Search Term</TableCell>
                    <TableCell>Path</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Files</TableCell>
                    <TableCell>Matches</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSessions.map((session) => (
                    <TableRow key={session.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {session.search_term}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {session.search_path}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={session.status}
                          color={getStatusColor(session.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {moment(session.start_time).format('MMM DD, YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {moment(session.start_time).format('HH:mm:ss')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDuration(session.start_time, session.end_time)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {session.total_files_searched.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={session.total_matches > 0 ? 'primary.main' : 'text.secondary'}
                          fontWeight={session.total_matches > 0 ? 'medium' : 'normal'}
                        >
                          {session.total_matches.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => viewResults(session.id)}
                            color="primary"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => deleteSession(session.id)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredSessions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}

export default HistoryPage;
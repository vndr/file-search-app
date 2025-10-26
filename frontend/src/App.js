import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import SearchPage from './components/SearchPage';
import ResultsPage from './components/ResultsPage';
import HistoryPage from './components/HistoryPage';
import AnalyzerPage from './components/AnalyzerPage';

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <SearchIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            File Search Application
          </Typography>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/analyzer"
            startIcon={<AnalyticsIcon />}
          >
            Analyzer
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/history"
            startIcon={<HistoryIcon />}
          >
            History
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/results/:sessionId" element={<ResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/analyzer" element={<AnalyzerPage />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
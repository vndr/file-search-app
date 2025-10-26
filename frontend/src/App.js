import React, { useState } from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FeaturesIcon from '@mui/icons-material/Stars';
import GitHubIcon from '@mui/icons-material/GitHub';
import SearchPage from './components/SearchPage';
import ResultsPage from './components/ResultsPage';
import HistoryPage from './components/HistoryPage';
import AnalyzerPage from './components/AnalyzerPage';
import { useTheme } from './theme/ThemeContext';

function App() {
  const { mode, toggleTheme } = useTheme();
  const [helpAnchor, setHelpAnchor] = useState(null);

  const handleHelpClick = (event) => {
    setHelpAnchor(event.currentTarget);
  };

  const handleHelpClose = () => {
    setHelpAnchor(null);
  };

  const openDocumentation = (doc) => {
    const baseUrl = 'https://github.com/vndr/file-search-app/blob/main/docs/';
    const urls = {
      'quick-start': `${baseUrl}QUICK_START.md`,
      'user-guide': `${baseUrl}USER_GUIDE.md`,
      'features': `${baseUrl}FEATURES.md`,
      'github': 'https://github.com/vndr/file-search-app'
    };
    window.open(urls[doc], '_blank');
    handleHelpClose();
  };

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
          <Tooltip title="Help & Documentation">
            <IconButton color="inherit" onClick={handleHelpClick} sx={{ ml: 1 }}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Help Menu */}
      <Menu
        anchorEl={helpAnchor}
        open={Boolean(helpAnchor)}
        onClose={handleHelpClose}
        PaperProps={{
          sx: { minWidth: 250 }
        }}
      >
        <MenuItem onClick={() => openDocumentation('quick-start')}>
          <ListItemIcon>
            <RocketLaunchIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Quick Start Guide"
            secondary="Get started in 5 minutes"
          />
        </MenuItem>
        <MenuItem onClick={() => openDocumentation('user-guide')}>
          <ListItemIcon>
            <MenuBookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="User Guide"
            secondary="Complete documentation"
          />
        </MenuItem>
        <MenuItem onClick={() => openDocumentation('features')}>
          <ListItemIcon>
            <FeaturesIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Features"
            secondary="Technical details"
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => openDocumentation('github')}>
          <ListItemIcon>
            <GitHubIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="GitHub Repository"
            secondary="Issues & contributions"
          />
        </MenuItem>
      </Menu>
      
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
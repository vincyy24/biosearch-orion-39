
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AnalyticsProvider } from './contexts/AnalyticsContext';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Index from './pages/Index';
import Voltammetry from './pages/Voltammetry';
import NotFound from './pages/NotFound';
import Upload from './pages/Upload';
import ResetPassword from './pages/ResetPassword';
import DataBrowser from './pages/DataBrowser';
import SearchResults from './pages/SearchResults';
import ResearchProjects from './pages/ResearchProjects';
import ResearchProjectDetail from './pages/ResearchProjectDetail';
import Publications from './pages/Publications';
import PublicationDetail from './pages/PublicationDetail';
import UserProfile from './pages/UserProfile';
import AccountSettings from './pages/AccountSettings';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Community from './pages/Community';
import Tools from './pages/Tools';
import Documentation from './pages/Documentation';
import AdvancedSearch from './pages/AdvancedSearch';
import Support from './pages/Support';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AnalyticsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/voltammetry" element={<Voltammetry />} />
              <Route path="/voltammetry/:id" element={<Voltammetry />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/browse" element={<DataBrowser />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/advanced-search" element={<AdvancedSearch />} />
              
              <Route path="/research" element={<ProtectedRoute><ResearchProjects /></ProtectedRoute>} />
              <Route path="/research/:id" element={<ProtectedRoute><ResearchProjectDetail /></ProtectedRoute>} />
              
              <Route path="/publications" element={<Publications />} />
              <Route path="/publications/:doi" element={<PublicationDetail />} />
              
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
              <Route path="/community" element={<Community />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/support" element={<Support />} />
              
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <Toaster />
          </AnalyticsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

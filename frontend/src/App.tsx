
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
import ResearchRegistration from './pages/ResearchRegistration';
import PublicationRegistration from './pages/PublicationRegistration';
import Analytics from './pages/Analytics';

const routes = [
  { path: "/", element: <Index /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: "/voltammetry", element: <Voltammetry /> },
  { path: "/voltammetry/:id", element: <Voltammetry /> },
  { path: "/upload", element: <ProtectedRoute><Upload /></ProtectedRoute> },
  { path: "/browse", element: <DataBrowser /> },
  { path: "/search", element: <SearchResults /> },
  { path: "/advanced-search", element: <AdvancedSearch /> },
  { path: "/research", element: <ResearchProjects /> },
  { path: "/research/new", element: <ProtectedRoute><ResearchRegistration /></ProtectedRoute> },
  { path: "/research/:id", element: <ResearchProjectDetail /> },
  { path: "/publications", element: <Publications /> },
  { path: "/publications/new", element: <ProtectedRoute><PublicationRegistration /></ProtectedRoute> },
  { path: "/publications/details", element: <PublicationDetail /> },
  { path: "/profile", element: <ProtectedRoute><UserProfile /></ProtectedRoute> },
  { path: "/profile/:username", element: <UserProfile /> },
  { path: "/account-settings", element: <ProtectedRoute><AccountSettings /></ProtectedRoute> },
  { path: "/notifications", element: <ProtectedRoute><Notifications /></ProtectedRoute> },
  { path: "/settings", element: <ProtectedRoute><Settings /></ProtectedRoute> },
  { path: "/community", element: <Community /> },
  { path: "/tools", element: <Tools /> },
  { path: "/documentation", element: <Documentation /> },
  { path: "/support", element: <Support /> },
  { path: "/analytics", element: <ProtectedRoute><Analytics /></ProtectedRoute> },
  { path: "/404", element: <NotFound /> },
  { path: "*", element: <Navigate to="/404" replace /> }
]


function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AnalyticsProvider>
            <Routes>
              {routes.map(
                ({ path, element }) => <Route key={path} path={path} element={element} />
              )}
            </Routes>
            <Toaster />
          </AnalyticsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

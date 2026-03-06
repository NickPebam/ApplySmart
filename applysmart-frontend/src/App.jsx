import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import JobDescription from './pages/JobDescription';
import AIResults from './pages/AIResults';
import ApplicationTracker from './pages/ApplicationTracker';
import PrivateRoute from './components/auth/PrivateRoute';
import NotificationToast from './components/common/NotificationToast';
import ErrorBoundary from './components/common/ErrorBoundary';

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <NotificationToast />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload-resume"
              element={
                <PrivateRoute>
                  <UploadResume />
                </PrivateRoute>
              }
            />
            <Route
              path="/job-description"
              element={
                <PrivateRoute>
                  <JobDescription />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-results"
              element={
                <PrivateRoute>
                  <ErrorBoundary>
                    <AIResults />
                  </ErrorBoundary>
                </PrivateRoute>
              }
            />
            <Route
              path="/tracker"
              element={
                <PrivateRoute>
                  <ApplicationTracker />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
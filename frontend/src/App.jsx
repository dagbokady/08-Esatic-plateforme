import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import DashboardPage  from './pages/DashboardPage';
import UploadPage     from './pages/UploadPage';
import DelegatePage   from './pages/DelegatePage';
import RejoindrePage  from './pages/RejoindrePage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminPage from './pages/AdminPage';

// Dans les routes :

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/rejoindre/:token" element={<RejoindrePage />} />
      <Route path="/admin" element={
        <ProtectedRoute><AdminPage /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/upload" element={
        <ProtectedRoute><UploadPage /></ProtectedRoute>
      } />
      <Route path="/delegue" element={
        <ProtectedRoute><DelegatePage /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
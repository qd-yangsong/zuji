import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Themes from './pages/Themes';
import Reviews from './pages/Reviews';
import Announcements from './pages/Announcements';
import Feedbacks from './pages/Feedbacks';
import Users from './pages/Users';
import Logs from './pages/Logs';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="assets" element={<Assets />} />
        <Route path="themes" element={<Themes />} />
        <Route path="tags" element={<div style={{ textAlign: 'center', padding: 80, color: '#999' }}>标签管理（即将上线）</div>} />
        <Route path="feedbacks" element={<Feedbacks />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="users" element={<Users />} />
        <Route path="logs" element={<Logs />} />
      </Route>
    </Routes>
  );
}

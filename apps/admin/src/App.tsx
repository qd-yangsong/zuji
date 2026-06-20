import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Themes from './pages/Themes';

// 占位组件（Plan 8 实现）
const Placeholder = ({ title }: { title: string }) => (
  <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>{title}（即将上线）</div>
);

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
        <Route path="tags" element={<Placeholder title="标签管理" />} />
        <Route path="feedbacks" element={<Placeholder title="用户反馈" />} />
        <Route path="reviews" element={<Placeholder title="内容审核" />} />
        <Route path="announcements" element={<Placeholder title="公告推送" />} />
        <Route path="users" element={<Placeholder title="用户管理" />} />
      </Route>
    </Routes>
  );
}

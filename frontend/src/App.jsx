import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout              from './components/Layout';
import Dashboard           from './pages/Dashboard';
import Login               from './pages/Login';
import Signup              from './pages/Signup';
import Problems            from './pages/Problems';
import Submissions         from './pages/Submissions';
import Progress            from './pages/Progress';
import Recommendations     from './pages/Recommendations';
import Profile             from './pages/Profile';
import GitHubIntelligence  from './pages/GitHubIntelligence';
import CodeforcesProfile   from './pages/CodeforcesProfile';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center h-screen" style={{ background: '#FAFAFA' }}>
            <div style={{ color: '#6B7280', fontSize: 14 }}>Loading...</div>
        </div>
    );
    return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const AppRoutes = () => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center h-screen" style={{ background: '#FAFAFA' }}>
            <div style={{ color: '#6B7280', fontSize: 14 }}>Loading...</div>
        </div>
    );

    return (
        <Routes>
            <Route path="/login"  element={!user ? <Login />  : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />

            {/* problem solving */}
            <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/problems"       element={<ProtectedRoute><Problems /></ProtectedRoute>} />
            <Route path="/submissions"    element={<ProtectedRoute><Submissions /></ProtectedRoute>} />
            <Route path="/progress"       element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />

            {/* github intelligence */}
            <Route path="/github-intelligence" element={<ProtectedRoute><GitHubIntelligence /></ProtectedRoute>} />
            <Route path="/codeforces"          element={<ProtectedRoute><CodeforcesProfile /></ProtectedRoute>} />

            {/* profile */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
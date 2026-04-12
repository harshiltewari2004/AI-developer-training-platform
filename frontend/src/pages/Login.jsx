import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Paper, Alert, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { setUser }      = useAuth();
    const navigate         = useNavigate();
    const [form, setForm]  = useState({ email: '', password: '' });
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await API.post('/auth/login', form);
            if (res.data.success) {
                const me = await API.get('/auth/me');
                setUser(me.data.user);
                navigate('/dashboard');
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGitHub = () => {
        window.location.href = 'http://localhost:9000/auth/github';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* logo */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">DevTrack</h1>
                    <p className="text-sm text-gray-400 mt-1">AI Developer Training Platform</p>
                </div>

                <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 4 }}>
                    <h2 className="text-base font-medium text-gray-900 mb-6">Sign in</h2>

                    {/* GitHub OAuth button */}
                    <button
                        onClick={handleGitHub}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors mb-4"
                    >
                        <FontAwesomeIcon icon={faGithub} />
                        Continue with GitHub
                    </button>

                    {/* divider */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* error */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, fontSize: 13, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <TextField
                            fullWidth
                            size="small"
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-1"
                        >
                            {loading
                                ? <CircularProgress size={16} color="inherit" />
                                : <FontAwesomeIcon icon={faRightToBracket} />
                            }
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-600 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </Paper>
            </div>
        </div>
    );
}
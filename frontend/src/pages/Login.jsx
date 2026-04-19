import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Alert, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { setUser }           = useAuth();
    const navigate              = useNavigate();
    const [form, setForm]       = useState({ email: '', password: '' });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/login', form);
            if (res.data.success) {
                const me = await API.get('/auth/me');
                setUser(me.data.user);
                navigate('/dashboard');
            } else {
                setError(res.data.message);
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGitHub = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/auth/github`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0A0A0A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ width: '100%', maxWidth: 380 }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: '#FAFAFA',
                        letterSpacing: '-0.5px',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        DevTrack
                    </h1>
                    <p style={{
                        fontSize: 13,
                        color: '#525252',
                        marginTop: 4,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        AI Developer Training Platform
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    backgroundColor: '#111111',
                    border: '1px solid #262626',
                    borderRadius: 16,
                    padding: 32
                }}>
                    <h2 style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#FAFAFA',
                        marginBottom: 24,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Sign in
                    </h2>

                    {/* GitHub button */}
                    <button
                        onClick={handleGitHub}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            backgroundColor: '#FAFAFA',
                            color: '#0A0A0A',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            marginBottom: 20,
                            transition: 'opacity 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <FontAwesomeIcon icon={faGithub} />
                        Continue with GitHub
                    </button>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 20
                    }}>
                        <div style={{ flex: 1, height: 1, backgroundColor: '#1A1A1A' }} />
                        <span style={{
                            fontSize: 11,
                            color: '#525252',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            or
                        </span>
                        <div style={{ flex: 1, height: 1, backgroundColor: '#1A1A1A' }} />
                    </div>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                                fontSize: 12,
                                borderRadius: 2,
                                backgroundColor: '#1A1A1A !important',
                                border: '1px solid #262626 !important',
                                color: '#FAFAFA !important'
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: 13,
                                    backgroundColor: '#1A1A1A',
                                    color: '#FAFAFA',
                                    fontFamily: 'Inter, sans-serif',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#262626',
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: 13,
                                    color: '#525252',
                                    fontFamily: 'Inter, sans-serif',
                                },
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontSize: 13,
                                    backgroundColor: '#1A1A1A',
                                    color: '#FAFAFA',
                                    fontFamily: 'Inter, sans-serif',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#262626',
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: 13,
                                    color: '#525252',
                                    fontFamily: 'Inter, sans-serif',
                                },
                            }}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px 16px',
                                backgroundColor: '#FAFAFA',
                                color: '#0A0A0A',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                fontFamily: 'Inter, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                marginTop: 4,
                                transition: 'opacity 0.15s'
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.6' : '1'; }}
                        >
                            {loading && (
                                <CircularProgress size={13} style={{ color: '#0A0A0A' }} />
                            )}
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p style={{
                        fontSize: 12,
                        color: '#525252',
                        textAlign: 'center',
                        marginTop: 20,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{
                            color: '#FAFAFA',
                            fontWeight: 500,
                            textDecoration: 'none'
                        }}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
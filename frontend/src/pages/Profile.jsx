import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Skeleton, Alert, LinearProgress } from '@mui/material';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRotate, faCodeBranch, faStar, faFire, faCode
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

function StatBox({ icon, label, value }) {
    return (
        <Card padding={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #262626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <FontAwesomeIcon icon={icon} style={{ color: '#A3A3A3', fontSize: 12 }} />
                </div>
                <div>
                    <p style={{
                        fontSize: 11, color: '#525252',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {label}
                    </p>
                    <p style={{
                        fontSize: 18, fontWeight: 700, color: '#FAFAFA',
                        lineHeight: 1.2, marginTop: 2,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {value ?? '—'}
                    </p>
                </div>
            </div>
        </Card>
    );
}

export default function Profile() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [syncing, setSyncing]     = useState(false);
    const [error, setError]         = useState('');

    const fetchAll = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await API.get('/contributions/my').catch(() => null);
            if (res?.data?.success) setAnalytics(res.data.analytics);
        } catch (err) {
            setError('Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setError('');
        try {
            await API.post('/repositories/sync');
            await API.post('/skills/calculate');
            await API.post('/contributions/calculate');
            await fetchAll();
        } catch (err) {
            setError('Sync failed. Make sure your GitHub handle is set.');
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    return (
        <div>
            {/* user header — custom layout instead of PageHeader */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 32
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            style={{
                                width: 56, height: 56, borderRadius: 12,
                                border: '1px solid #262626',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: 56, height: 56, borderRadius: 12,
                            backgroundColor: '#1A1A1A',
                            border: '1px solid #262626',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, fontWeight: 700,
                            color: '#FAFAFA',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            {user?.name?.[0]?.toUpperCase() || user?.user?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 style={{
                            fontSize: 22, fontWeight: 700, color: '#FAFAFA',
                            letterSpacing: '-0.5px',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            {user?.name || user?.user}
                        </h1>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10, marginTop: 4
                        }}>
                            {user?.github_handle && (
                                
                                   <a href={`https://github.com/${user.github_handle}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        fontSize: 12, color: '#525252',
                                        textDecoration: 'none',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                >
                                    <FontAwesomeIcon icon={faGithub} style={{ fontSize: 11 }} />
                                    {user.github_handle}
                                </a>
                            )}
                            {user?.email && (
                                <>
                                    <span style={{ fontSize: 11, color: '#333333' }}>·</span>
                                    <span style={{
                                        fontSize: 12, color: '#525252',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                        {user.email}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSync}
                    disabled={syncing || loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600,
                        padding: '8px 14px',
                        background: '#FAFAFA',
                        color: '#0A0A0A',
                        border: 'none',
                        borderRadius: 8,
                        cursor: syncing ? 'not-allowed' : 'pointer',
                        opacity: syncing ? 0.6 : 1,
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    <FontAwesomeIcon icon={faRotate} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing...' : 'Sync GitHub'}
                </button>
            </div>

            {syncing && (
                <LinearProgress sx={{
                    borderRadius: 1, mb: 2,
                    bgcolor: '#1A1A1A',
                    '& .MuiLinearProgress-bar': { bgcolor: '#FAFAFA' }
                }} />
            )}

            {error && (
                <Alert
                    severity="error"
                    sx={{ borderRadius: 2, fontSize: 12, mb: 2, backgroundColor: '#1A1A1A !important', color: '#FAFAFA !important' }}
                >
                    {error}
                </Alert>
            )}

            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[...Array(2)].map((_, i) => (
                        <Card key={i} padding={24}>
                            <Skeleton variant="rounded" height={60} sx={{ bgcolor: '#1A1A1A' }} />
                        </Card>
                    ))}
                </div>
            )}

            {!loading && analytics && (
                <>
                    {/* stat boxes */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 16,
                        marginBottom: 16
                    }}>
                        <StatBox icon={faCodeBranch} label="Total Repos"     value={analytics.total_repos} />
                        <StatBox icon={faCode}       label="Total Commits"   value={analytics.total_commits} />
                        <StatBox icon={faFire}       label="Active Days"     value={analytics.active_days} />
                        <StatBox icon={faStar}       label="Top Language"    value={analytics.top_language || 'N/A'} />
                    </div>

                    {/* activity score */}
                    <Card padding={24} style={{ marginBottom: 16 }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginBottom: 16
                        }}>
                            <h2 style={{
                                fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                Activity Score
                            </h2>
                            <span style={{
                                fontSize: 10, fontWeight: 600,
                                padding: '3px 10px', borderRadius: 999,
                                backgroundColor: '#1A1A1A',
                                border: '1px solid #262626',
                                color: '#A3A3A3',
                                textTransform: 'uppercase', letterSpacing: '0.6px',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {analytics.consistency_score >= 70 ? 'Highly Active' :
                                 analytics.consistency_score >= 40 ? 'Moderately Active' :
                                 analytics.consistency_score >= 10 ? 'Occasionally Active' :
                                 'Getting Started'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <p style={{
                                fontSize: 30, fontWeight: 700, color: '#FAFAFA',
                                letterSpacing: '-1px',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {analytics.consistency_score}
                                <span style={{ fontSize: 14, color: '#525252', fontWeight: 400 }}>/100</span>
                            </p>
                            <div style={{ flex: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={analytics.consistency_score}
                                    sx={{
                                        height: 6, borderRadius: 3,
                                        bgcolor: '#1A1A1A',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            bgcolor: '#FAFAFA'
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                            marginTop: 20, paddingTop: 16,
                            borderTop: '1px solid #1A1A1A'
                        }}>
                            <div>
                                <p style={{
                                    fontSize: 11, color: '#525252',
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    Avg stars / repo
                                </p>
                                <p style={{
                                    fontSize: 14, fontWeight: 600, color: '#FAFAFA', marginTop: 2,
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    {analytics.avg_stars_per_repo ?? '—'}
                                </p>
                            </div>
                            <div>
                                <p style={{
                                    fontSize: 11, color: '#525252',
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    Avg commits / repo
                                </p>
                                <p style={{
                                    fontSize: 14, fontWeight: 600, color: '#FAFAFA', marginTop: 2,
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    {analytics.avg_commits_per_repo ?? '—'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* language breakdown */}
                    {analytics.language_breakdown?.length > 0 && (
                        <Card padding={24}>
                            <h2 style={{
                                fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                                marginBottom: 20,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                Language Breakdown
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {analytics.language_breakdown.slice(0, 6).map((lang, i) => (
                                    <div key={i}>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            marginBottom: 6
                                        }}>
                                            <span style={{
                                                fontSize: 13, fontWeight: 500, color: '#A3A3A3',
                                                fontFamily: 'Inter, sans-serif'
                                            }}>
                                                {lang.language}
                                            </span>
                                            <span style={{
                                                fontSize: 11, color: '#525252',
                                                fontFamily: 'Inter, sans-serif'
                                            }}>
                                                {lang.repo_count} repo{lang.repo_count !== 1 ? 's' : ''} · {lang.percentage}%
                                            </span>
                                        </div>
                                        <div style={{
                                            width: '100%', height: 4,
                                            backgroundColor: '#1A1A1A', borderRadius: 2,
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${lang.percentage}%`, height: '100%',
                                                backgroundColor: '#FAFAFA', borderRadius: 2
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}

            {!loading && !analytics && (
                <Card padding={48}>
                    <div style={{ textAlign: 'center' }}>
                        <FontAwesomeIcon icon={faGithub} style={{ fontSize: 24, color: '#333333', marginBottom: 12 }} />
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                            No GitHub data yet
                        </p>
                        <p style={{ fontSize: 12, color: '#525252', maxWidth: 320, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
                            Click "Sync GitHub" to fetch your repos and unlock insights.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
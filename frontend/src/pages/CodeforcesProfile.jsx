import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Skeleton, Alert, LinearProgress } from '@mui/material';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRotate, faTrophy, faCode,
    faArrowTrendUp, faArrowTrendDown
} from '@fortawesome/free-solid-svg-icons';

function SectionCard({ title, subtitle, children }) {
    return (
        <Card padding={24} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{
                    fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {title}
                </h2>
                {subtitle && (
                    <p style={{
                        fontSize: 12, color: '#525252', marginTop: 4,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {children}
        </Card>
    );
}

export default function CodeforcesProfile() {
    const [profile, setProfile]       = useState(null);
    const [contests, setContests]     = useState([]);
    const [tags, setTags]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [syncing, setSyncing]       = useState(false);
    const [handle, setHandle]         = useState('');
    const [showHandle, setShowHandle] = useState(false);
    const [error, setError]           = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [profileRes, contestRes, tagRes] = await Promise.all([
                API.get('/codeforces/profile').catch(() => null),
                API.get('/codeforces/contests').catch(() => null),
                API.get('/codeforces/tags').catch(() => null),
            ]);
            if (profileRes?.data?.success)  setProfile(profileRes.data.profile);
            if (contestRes?.data?.success)  setContests(contestRes.data.contest_history || []);
            if (tagRes?.data?.success)      setTags(tagRes.data.tag_performance || []);
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSaveHandle = async () => {
        if (!handle.trim()) return;
        try {
            const res = await API.post('/codeforces/handle', { handle: handle.trim() });
            if (res.data.success) {
                setShowHandle(false);
                setHandle('');
            }
        } catch (err) {
            setError('Handle not found on Codeforces.');
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setError('');
        try {
            await API.post('/codeforces/sync');
            await fetchAll();
        } catch (err) {
            setError('Sync failed. Make sure your handle is saved.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Codeforces Profile"
                subtitle="Contest performance, rating history, and tag accuracy."
                action={
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => setShowHandle(!showHandle)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                fontSize: 12, fontWeight: 500,
                                padding: '8px 14px',
                                background: 'transparent',
                                color: '#A3A3A3',
                                border: '1px solid #262626',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif'
                            }}
                        >
                            <FontAwesomeIcon icon={faCode} />
                            {profile ? 'Change Handle' : 'Add Handle'}
                        </button>
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
                            {syncing ? 'Syncing...' : 'Sync Codeforces'}
                        </button>
                    </div>
                }
            />

            {syncing && (
                <LinearProgress sx={{
                    borderRadius: 1, mb: 2,
                    bgcolor: '#1A1A1A',
                    '& .MuiLinearProgress-bar': { bgcolor: '#FAFAFA' }
                }} />
            )}

            {/* handle input */}
            {showHandle && (
                <Card padding={20} style={{ marginBottom: 16 }}>
                    <p style={{
                        fontSize: 12, fontWeight: 600, color: '#FAFAFA',
                        marginBottom: 6, fontFamily: 'Inter, sans-serif'
                    }}>
                        Codeforces Handle
                    </p>
                    <p style={{
                        fontSize: 11, color: '#525252', marginBottom: 12,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Enter your Codeforces username exactly as it appears on your profile.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="text"
                            value={handle}
                            onChange={e => setHandle(e.target.value)}
                            placeholder="e.g. tourist"
                            style={{
                                flex: 1, padding: '8px 12px', fontSize: 13,
                                backgroundColor: '#1A1A1A',
                                border: '1px solid #262626',
                                borderRadius: 8, color: '#FAFAFA',
                                outline: 'none', fontFamily: 'Inter, sans-serif'
                            }}
                        />
                        <button
                            onClick={handleSaveHandle}
                            style={{
                                fontSize: 12, fontWeight: 600,
                                padding: '8px 16px',
                                backgroundColor: '#FAFAFA', color: '#0A0A0A',
                                border: 'none', borderRadius: 8,
                                cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                            }}
                        >
                            Save
                        </button>
                    </div>
                </Card>
            )}

            {error && (
                <Alert
                    severity="error"
                    sx={{ borderRadius: 2, fontSize: 12, mb: 2, backgroundColor: '#1A1A1A !important', color: '#FAFAFA !important' }}
                    onClose={() => setError('')}
                >
                    {error}
                </Alert>
            )}

            {/* no data */}
            {!loading && !profile && (
                <Card padding={48}>
                    <div style={{ textAlign: 'center' }}>
                        <FontAwesomeIcon icon={faTrophy} style={{ fontSize: 24, color: '#333333', marginBottom: 12 }} />
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                            Codeforces not connected
                        </p>
                        <p style={{ fontSize: 12, color: '#525252', maxWidth: 320, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
                            Add your handle and sync to see your rating, contest history, and tag performance.
                        </p>
                    </div>
                </Card>
            )}

            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} padding={24}>
                            <Skeleton variant="text" width="40%" sx={{ bgcolor: '#1A1A1A' }} />
                            <Skeleton variant="rounded" height={80} sx={{ bgcolor: '#1A1A1A', mt: 2 }} />
                        </Card>
                    ))}
                </div>
            )}

            {!loading && profile && (
                <>
                    {/* profile header card */}
                    <Card padding={24} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            {profile.avatar && (
                                <img
                                    src={profile.avatar}
                                    alt={profile.handle}
                                    style={{
                                        width: 60, height: 60, borderRadius: 12,
                                        objectFit: 'cover',
                                        border: '1px solid #262626'
                                    }}
                                />
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    
                                       <a href={`https://codeforces.com/profile/${profile.handle}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            fontSize: 17, fontWeight: 700, color: '#FAFAFA',
                                            textDecoration: 'none', fontFamily: 'Inter, sans-serif'
                                        }}
                                    >
                                        {profile.handle}
                                    </a>
                                    <span style={{
                                        fontSize: 10, fontWeight: 500,
                                        padding: '3px 10px', borderRadius: 999,
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid #262626',
                                        color: '#A3A3A3',
                                        textTransform: 'capitalize',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                        {profile.rank}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 32, marginTop: 14 }}>
                                    {[
                                        { label: 'Current Rating', value: profile.rating },
                                        { label: 'Max Rating',     value: profile.max_rating },
                                        { label: 'Problems Solved', value: profile.problems_solved },
                                        { label: 'Contests',        value: profile.contests_participated },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <p style={{
                                                fontSize: 10, fontWeight: 600, color: '#525252',
                                                textTransform: 'uppercase', letterSpacing: '0.6px',
                                                fontFamily: 'Inter, sans-serif'
                                            }}>
                                                {item.label}
                                            </p>
                                            <p style={{
                                                fontSize: 22, fontWeight: 700, color: '#FAFAFA',
                                                lineHeight: 1.2, marginTop: 4,
                                                letterSpacing: '-0.5px',
                                                fontFamily: 'Inter, sans-serif'
                                            }}>
                                                {item.value ?? '—'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* tag performance */}
                    {tags.length > 0 && (
                        <SectionCard title="Tag Performance" subtitle="Your accuracy across Codeforces problem tags">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {tags.slice(0, 12).map((tag, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{
                                                fontSize: 13, fontWeight: 500, color: '#A3A3A3',
                                                textTransform: 'capitalize', fontFamily: 'Inter, sans-serif'
                                            }}>
                                                {tag.tag}
                                            </span>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <span style={{ fontSize: 11, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                                                    {tag.accepted}/{tag.attempted}
                                                </span>
                                                <span style={{
                                                    fontSize: 12, fontWeight: 600, color: '#FAFAFA',
                                                    fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    {tag.accuracy}%
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '100%', height: 3,
                                            backgroundColor: '#1A1A1A', borderRadius: 2,
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${tag.accuracy}%`, height: '100%',
                                                backgroundColor: '#FAFAFA', borderRadius: 2,
                                                transition: 'width 0.6s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* contest history */}
                    {contests.length > 0 && (
                        <SectionCard
                            title="Contest History"
                            subtitle={`${contests.length} contests participated · Best rank: ${profile.best_rank ?? '—'}`}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {contests.slice(0, 12).map((contest, i) => (
                                    <div key={i}>
                                        {i > 0 && (
                                            <div style={{ height: 1, backgroundColor: '#1A1A1A', margin: '14px 0' }} />
                                        )}
                                        <div style={{
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', gap: 16
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: 13, fontWeight: 500, color: '#FAFAFA',
                                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    {contest.contestName}
                                                </p>
                                                <p style={{
                                                    fontSize: 11, color: '#525252', marginTop: 4,
                                                    fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    Rank #{contest.rank} · {new Date(contest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                                <p style={{
                                                    fontSize: 14, fontWeight: 700, color: '#FAFAFA',
                                                    fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    {contest.newRating}
                                                </p>
                                                <p style={{
                                                    fontSize: 11, fontWeight: 600,
                                                    color: '#A3A3A3',
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                    justifyContent: 'flex-end',
                                                    marginTop: 2,
                                                    fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    <FontAwesomeIcon
                                                        icon={contest.ratingChange >= 0 ? faArrowTrendUp : faArrowTrendDown}
                                                        style={{ fontSize: 9 }}
                                                    />
                                                    {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </>
            )}
        </div>
    );
}
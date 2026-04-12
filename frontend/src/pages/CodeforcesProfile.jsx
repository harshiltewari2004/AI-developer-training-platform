import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
    Paper, LinearProgress, Chip,
    Alert, Skeleton, Divider
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRotate, faTrophy, faFire,
    faChartLine, faCode, faCircleCheck,
    faArrowTrendUp, faArrowTrendDown
} from '@fortawesome/free-solid-svg-icons';

const rankColors = {
    'newbie':          { color: '#9CA3AF', bg: '#F9FAFB' },
    'pupil':           { color: '#059669', bg: '#ECFDF5' },
    'specialist':      { color: '#0EA5E9', bg: '#F0F9FF' },
    'expert':          { color: '#4F46E5', bg: '#EEF2FF' },
    'candidate master':{ color: '#A855F7', bg: '#FAF5FF' },
    'master':          { color: '#F97316', bg: '#FFF7ED' },
    'international master': { color: '#EF4444', bg: '#FEF2F2' },
    'grandmaster':     { color: '#DC2626', bg: '#FEF2F2' },
    'international grandmaster': { color: '#DC2626', bg: '#FEF2F2' },
    'legendary grandmaster':     { color: '#7C3AED', bg: '#F5F3FF' },
    'unrated':         { color: '#9CA3AF', bg: '#F9FAFB' },
};

function SectionCard({ title, subtitle, children }) {
    return (
        <Paper elevation={0} sx={{
            border: '1px solid #F0F0F0',
            borderRadius: 3,
            p: 3,
            backgroundColor: '#FFFFFF'
        }}>
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>{title}</div>
                {subtitle && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{subtitle}</div>}
            </div>
            {children}
        </Paper>
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
    const [handleSaved, setHandleSaved] = useState(false);

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
                setHandleSaved(true);
                setShowHandle(false);
                setHandle('');
            }
        } catch (err) {
            setError('Handle not found on Codeforces. Check and try again.');
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

    const rankStyle = rankColors[profile?.rank?.toLowerCase()] || rankColors['unrated'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.5px' }}>
                        Codeforces Profile
                    </div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                        Contest performance, rating history, and tag accuracy.
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => setShowHandle(!showHandle)}
                        style={{
                            fontSize: 12, padding: '8px 16px',
                            border: '1px solid #E5E7EB', borderRadius: 8,
                            background: '#FFFFFF', color: '#374151',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                    >
                        <FontAwesomeIcon icon={faCode} />
                        {profile ? 'Change Handle' : 'Add Handle'}
                    </button>

                    <button
                        onClick={handleSync}
                        disabled={syncing || loading}
                        style={{
                            fontSize: 12, padding: '8px 16px',
                            border: 'none', borderRadius: 8,
                            background: syncing ? '#6B7280' : '#1890FF',
                            color: '#FFFFFF', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            opacity: syncing ? 0.7 : 1
                        }}
                    >
                        <FontAwesomeIcon icon={faRotate} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Codeforces'}
                    </button>
                </div>
            </div>

            {syncing && (
                <LinearProgress sx={{
                    borderRadius: 1,
                    bgcolor: '#E0F2FE',
                    '& .MuiLinearProgress-bar': { bgcolor: '#1890FF' }
                }} />
            )}

            {/* handle input */}
            {showHandle && (
                <Paper elevation={0} sx={{ border: '1px solid #BAE6FD', borderRadius: 3, p: 3, backgroundColor: '#F0F9FF' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0369A1', marginBottom: 8 }}>
                        Codeforces Handle
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
                        Enter your Codeforces username exactly as it appears on your profile.
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="text"
                            value={handle}
                            onChange={e => setHandle(e.target.value)}
                            placeholder="e.g. tourist"
                            style={{
                                flex: 1, padding: '8px 12px', fontSize: 13,
                                border: '1px solid #BAE6FD', borderRadius: 8,
                                outline: 'none', backgroundColor: '#FFFFFF'
                            }}
                        />
                        <button
                            onClick={handleSaveHandle}
                            style={{
                                padding: '8px 20px', fontSize: 12,
                                background: '#1890FF', color: '#FFFFFF',
                                border: 'none', borderRadius: 8, cursor: 'pointer'
                            }}
                        >
                            Save
                        </button>
                    </div>
                </Paper>
            )}

            {error && (
                <Alert severity="error" sx={{ borderRadius: 2, fontSize: 12 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* no data */}
            {!loading && !profile && (
                <Paper elevation={0} sx={{ border: '1px solid #F0F0F0', borderRadius: 3, p: 6, backgroundColor: '#FFFFFF' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            backgroundColor: '#F0F9FF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <FontAwesomeIcon icon={faTrophy} style={{ fontSize: 24, color: '#1890FF' }} />
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', marginBottom: 6 }}>
                            Codeforces not connected
                        </div>
                        <div style={{ fontSize: 13, color: '#6B7280', maxWidth: 300, margin: '0 auto' }}>
                            Add your handle and sync to see your rating, contest history, and tag performance.
                        </div>
                    </div>
                </Paper>
            )}

            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[...Array(3)].map((_, i) => (
                        <Paper key={i} elevation={0} sx={{ border: '1px solid #F0F0F0', borderRadius: 3, p: 3 }}>
                            <Skeleton variant="text" width="40%" height={24} />
                            <Skeleton variant="rounded" height={80} sx={{ mt: 2 }} />
                        </Paper>
                    ))}
                </div>
            )}

            {!loading && profile && (
                <>
                    {/* profile header card */}
                    <Paper elevation={0} sx={{ border: '1px solid #F0F0F0', borderRadius: 3, p: 3, backgroundColor: '#FFFFFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            {profile.avatar && (
                                <img
                                    src={profile.avatar}
                                    alt={profile.handle}
                                    style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '2px solid #F0F0F0' }}
                                />
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <a
                                        href={`https://codeforces.com/profile/${profile.handle}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ fontSize: 18, fontWeight: 700, color: '#0A0A0A', textDecoration: 'none' }}>
                                        {profile.handle}
                                    </a>
                                    <Chip
                                        label={profile.rank}
                                        size="small"
                                        sx={{
                                            bgcolor: rankStyle.bg,
                                            color: rankStyle.color,
                                            fontWeight: 600,
                                            fontSize: 11,
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 24, marginTop: 10 }}>
                                    {[
                                        { label: 'Current Rating', value: profile.rating, color: rankStyle.color },
                                        { label: 'Max Rating', value: profile.max_rating, color: '#6B7280' },
                                        { label: 'Problems Solved', value: profile.problems_solved, color: '#059669' },
                                        { label: 'Contests', value: profile.contests_participated, color: '#4F46E5' },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{item.label}</div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: item.color, lineHeight: 1.3 }}>
                                                {item.value ?? '—'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Paper>

                    {/* tag performance */}
                    {tags.length > 0 && (
                        <SectionCard title="Tag Performance" subtitle="Your accuracy across Codeforces problem tags">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {tags.slice(0, 10).map((tag, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>
                                                {tag.tag}
                                            </span>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                                                    {tag.accepted}/{tag.attempted}
                                                </span>
                                                <span style={{
                                                    fontSize: 12, fontWeight: 700,
                                                    color: tag.accuracy >= 70 ? '#059669' : tag.accuracy >= 40 ? '#D97706' : '#E11D48'
                                                }}>
                                                    {tag.accuracy}%
                                                </span>
                                            </div>
                                        </div>
                                        <LinearProgress
                                            variant="determinate"
                                            value={tag.accuracy}
                                            sx={{
                                                height: 6, borderRadius: 3,
                                                bgcolor: '#F0F0F0',
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 3,
                                                    bgcolor: tag.accuracy >= 70 ? '#059669' : tag.accuracy >= 40 ? '#D97706' : '#E11D48'
                                                }
                                            }}
                                        />
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {contests.slice(0, 10).map((contest, i) => (
                                    <div key={i}>
                                        {i > 0 && <Divider sx={{ borderColor: '#F8FAFC', my: 1.5 }} />}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {contest.contestName}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                                                    Rank #{contest.rank} · {new Date(contest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0A0A' }}>
                                                        {contest.newRating}
                                                    </div>
                                                    <div style={{
                                                        fontSize: 12, fontWeight: 600,
                                                        color: contest.ratingChange >= 0 ? '#059669' : '#E11D48',
                                                        display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end'
                                                    }}>
                                                        <FontAwesomeIcon
                                                            icon={contest.ratingChange >= 0 ? faArrowTrendUp : faArrowTrendDown}
                                                            style={{ fontSize: 10 }}
                                                        />
                                                        {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                                                    </div>
                                                </div>
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
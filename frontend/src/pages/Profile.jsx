import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Paper, Chip, CircularProgress, Alert, Skeleton, LinearProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRotate, faCodeBranch, faStar,
    faFire, faCode, faLightbulb,
    faArrowTrendUp, faArrowTrendDown,
    faMinus, faTriangleExclamation,
    faCircleCheck, faChartBar
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '../context/AuthContext';

// severity styles for insights
const severityStyle = {
    high:     { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: faTriangleExclamation },
    medium:   { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: faMinus },
    positive: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: faCircleCheck },
};

// stat card for GitHub numbers
function GitHubStatCard({ icon, label, value, color = '#6366f1' }) {
    return (
        <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 2.5 }}>
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <FontAwesomeIcon icon={icon} style={{ color }} className="text-sm" />
                </div>
                <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-lg font-semibold text-gray-900">{value ?? '—'}</p>
                </div>
            </div>
        </Paper>
    );
}

// loading skeleton
function ProfileSkeleton() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Paper key={i} elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 2.5 }}>
                        <Skeleton variant="rounded" height={60} />
                    </Paper>
                ))}
            </div>
            <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 3 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />
            </Paper>
        </div>
    );
}

export default function Profile() {
    const { user } = useAuth();
    const [analytics, setAnalytics]   = useState(null);
    const [skills, setSkills]         = useState([]);
    const [insights, setInsights]     = useState([]);
    const [repos, setRepos]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [syncing, setSyncing]       = useState(false);
    const [error, setError]           = useState('');
    const [insightMsg, setInsightMsg] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        setError('');
        try {
            const [analyticsRes, skillsRes, insightsRes, reposRes] = await Promise.all([
                API.get('/contributions/my').catch(() => null),
                API.get('/skills/my').catch(() => null),
                API.get('/insights/generate').catch(() => null),
                API.get('/repositories/my').catch(() => null),
            ]);

            if (analyticsRes?.data?.success) setAnalytics(analyticsRes.data.analytics);
            if (skillsRes?.data?.success)    setSkills(skillsRes.data.skills || []);
            if (insightsRes?.data?.success) {
                setInsights(insightsRes.data.insights || []);
                setInsightMsg(insightsRes.data.message || '');
            }
            if (reposRes?.data?.success)     setRepos(reposRes.data.repositories || []);
        } catch (err) {
            setError('Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    };

    // sync github repos + recalculate everything
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

    if (!user) return null;

    return (
        <div className="space-y-6">

            {/* header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {user?.avatar
                        ? <img src={user.avatar} className="w-14 h-14 rounded-full border-2 border-gray-100" alt="avatar" />
                        : <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-500">
                            {user?.name?.[0]?.toUpperCase()}
                          </div>
                    }
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {user?.name || user?.user}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            {user?.github_handle && (
                                <a
                                    href={`https://github.com/${user.github_handle}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faGithub} />
                                    {user.github_handle}
                                </a>
                            )}
                            {user?.email && (
                                <span className="text-xs text-gray-300">·</span>
                            )}
                            {user?.email && (
                                <span className="text-xs text-gray-400">{user.email}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* sync button */}
                <button
                    onClick={handleSync}
                    disabled={syncing || loading}
                    className="flex items-center gap-2 text-xs px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <FontAwesomeIcon
                        icon={faRotate}
                        className={syncing ? 'animate-spin' : ''}
                    />
                    {syncing ? 'Syncing...' : 'Sync GitHub'}
                </button>
            </div>

            {/* syncing progress bar */}
            {syncing && (
                <LinearProgress sx={{ borderRadius: 1 }} />
            )}

            {/* error */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2, fontSize: 13 }}>
                    {error}
                </Alert>
            )}

            {loading ? <ProfileSkeleton /> : (
                <>
                    {/* GitHub stats */}
                    {analytics ? (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <GitHubStatCard
                                    icon={faCodeBranch}
                                    label="Total Repos"
                                    value={analytics.total_repos}
                                    color="#6366f1"
                                />
                                <GitHubStatCard
                                    icon={faCode}
                                    label="Total Commits"
                                    value={analytics.total_commits}
                                    color="#0ea5e9"
                                />
                                <GitHubStatCard
                                    icon={faFire}
                                    label="Active Last 30d"
                                    value={analytics.active_days}
                                    color="#f97316"
                                />
                                <GitHubStatCard
                                    icon={faStar}
                                    label="Top Language"
                                    value={analytics.top_language || 'N/A'}
                                    color="#eab308"
                                />
                            </div>

                            {/* activity score + behavior label */}
                            <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 3 }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-medium text-gray-900">
                                        Activity Score
                                    </h2>
                                    <Chip
                                        label={
                                            analytics.consistency_score >= 70 ? 'Highly Active' :
                                            analytics.consistency_score >= 40 ? 'Moderately Active' :
                                            analytics.consistency_score >= 10 ? 'Occasionally Active' :
                                            'Getting Started'
                                        }
                                        size="small"
                                        sx={{
                                            bgcolor: analytics.consistency_score >= 70 ? '#f0fdf4' : analytics.consistency_score >= 40 ? '#fffbeb' : '#fef2f2',
                                            color:   analytics.consistency_score >= 70 ? '#16a34a' : analytics.consistency_score >= 40 ? '#d97706' : '#dc2626',
                                            fontWeight: 500,
                                            fontSize: 11
                                        }}
                                    />
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {analytics.consistency_score}
                                        <span className="text-lg text-gray-400 font-normal">/100</span>
                                    </div>
                                    <div className="flex-1">
                                        <LinearProgress
                                            variant="determinate"
                                            value={analytics.consistency_score}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: '#f3f4f6',
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 4,
                                                    bgcolor: analytics.consistency_score >= 70 ? '#22c55e' : analytics.consistency_score >= 40 ? '#f59e0b' : '#ef4444'
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-xs text-gray-400">Avg stars / repo</p>
                                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                                            {analytics.avg_stars_per_repo ?? '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Avg commits / repo</p>
                                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                                            {analytics.avg_commits_per_repo ?? '—'}
                                        </p>
                                    </div>
                                </div>
                            </Paper>

                            {/* language breakdown */}
                            {analytics.language_breakdown?.length > 0 && (
                                <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 3 }}>
                                    <h2 className="text-sm font-medium text-gray-900 mb-4">
                                        Language Breakdown
                                    </h2>
                                    <div className="space-y-3">
                                        {analytics.language_breakdown.slice(0, 6).map((lang, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-gray-700 font-medium">{lang.language}</span>
                                                    <span className="text-gray-400">
                                                        {lang.repo_count} repo{lang.repo_count !== 1 ? 's' : ''} · {lang.percentage}%
                                                    </span>
                                                </div>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={lang.percentage}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: '#f3f4f6',
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: 3,
                                                            bgcolor: '#6366f1'
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Paper>
                            )}
                        </>
                    ) : (
                        /* no github data yet */
                        <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 5 }}>
                            <div className="text-center">
                                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FontAwesomeIcon icon={faGithub} className="text-gray-400 text-2xl" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                    No GitHub data yet
                                </p>
                                <p className="text-xs text-gray-400 mb-4">
                                    Click "Sync GitHub" to fetch your repos, calculate skills, and unlock insights.
                                </p>
                            </div>
                        </Paper>
                    )}

                    {/* skill scores */}
                    {skills.length > 0 && (
                        <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 3 }}>
                            <h2 className="text-sm font-medium text-gray-900 mb-4">
                                Skill Scores
                                <span className="ml-2 text-xs text-gray-400 font-normal">
                                    from GitHub activity
                                </span>
                            </h2>
                            <div className="space-y-3">
                                {skills.slice(0, 6).map((skill, i) => {
                                    const maxScore = skills[0]?.skill_score || 1;
                                    const pct = Math.round((skill.skill_score / maxScore) * 100);
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-gray-700 font-medium">
                                                    {skill.skill_name}
                                                </span>
                                                <div className="flex items-center gap-3 text-gray-400">
                                                    <span>{skill.repo_count} repos</span>
                                                    <span className="font-semibold text-gray-700">
                                                        {skill.skill_score} pts
                                                    </span>
                                                </div>
                                            </div>
                                            <LinearProgress
                                                variant="determinate"
                                                value={pct}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: '#f3f4f6',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 3,
                                                        bgcolor: '#6366f1'
                                                    }
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </Paper>
                    )}

                    {/* AI insights */}
                    <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 3 }}>
                        <h2 className="text-sm font-medium text-gray-900 mb-4">
                            <FontAwesomeIcon icon={faLightbulb} className="text-amber-400 mr-2" />
                            AI Insights
                        </h2>

                        {insights.length === 0 ? (
                            <p className="text-xs text-gray-400">
                                {insightMsg || 'Sync your GitHub and log DSA submissions to unlock insights.'}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {insights.map((insight, i) => {
                                    const style = severityStyle[insight.severity] || severityStyle.medium;
                                    return (
                                        <div
                                            key={i}
                                            className="p-3 rounded-xl border text-xs"
                                            style={{
                                                backgroundColor: style.bg,
                                                borderColor: style.border,
                                                color: style.text
                                            }}
                                        >
                                            <div className="flex items-start gap-2">
                                                <FontAwesomeIcon
                                                    icon={style.icon}
                                                    className="mt-0.5 shrink-0"
                                                />
                                                <div>
                                                    <p className="font-medium mb-0.5">{insight.title}</p>
                                                    <p className="opacity-75">{insight.action}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Paper>

                    {/* top repos */}
                    {repos.length > 0 && (
                        <Paper elevation={0} sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 3 }}>
                            <h2 className="text-sm font-medium text-gray-900 mb-4">
                                Top Repositories
                            </h2>
                            <div className="space-y-3">
                                {repos
                                    .sort((a, b) => b.stars - a.stars)
                                    .slice(0, 5)
                                    .map((repo, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <a
                                                    href={repo.github_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-medium text-gray-800 hover:text-indigo-600 transition-colors truncate block"
                                                >
                                                    {repo.name}
                                                </a>
                                                {repo.description && (
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                                        {repo.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 ml-4 shrink-0">
                                                {repo.language && (
                                                    <span className="text-xs text-gray-400">
                                                        {repo.language}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                                    {repo.stars}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <FontAwesomeIcon icon={faCodeBranch} className="text-gray-300" />
                                                    {repo.forks}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </Paper>
                    )}
                </>
            )}
        </div>
    );
}
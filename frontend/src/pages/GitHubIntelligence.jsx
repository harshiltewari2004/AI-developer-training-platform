import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
    Paper, LinearProgress, Chip,
    Alert, Skeleton, Divider
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRotate, faCodeBranch, faStar,
    faFire, faCode, faLightbulb,
    faCircleCheck, faTriangleExclamation,
    faMinus, faListCheck, faArrowTrendUp
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const insightStyle = {
    positive: { bg: '#ECFDF5', border: '#A7F3D0', color: '#059669', icon: faCircleCheck },
    warning:  { bg: '#FFF1F2', border: '#FECDD3', color: '#E11D48', icon: faTriangleExclamation },
    neutral:  { bg: '#F8FAFC', border: '#E2E8F0', color: '#6B7280', icon: faMinus },
};

const priorityStyle = {
    high:   { bg: '#FFF1F2', color: '#E11D48' },
    medium: { bg: '#FFFBEB', color: '#D97706' },
    low:    { bg: '#ECFDF5', color: '#059669' },
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

function StatBox({ icon, iconColor, iconBg, label, value }) {
    return (
        <Paper elevation={0} sx={{ border: '1px solid #F0F0F0', borderRadius: 3, p: 2.5, backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <FontAwesomeIcon icon={icon} style={{ color: iconColor, fontSize: 14 }} />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0A0A0A', lineHeight: 1.2, marginTop: 2 }}>
                        {value ?? '—'}
                    </div>
                </div>
            </div>
        </Paper>
    );
}

export default function GitHubIntelligence() {
    const [activity, setActivity]     = useState(null);
    const [score, setScore]           = useState(null);
    const [insights, setInsights]     = useState([]);
    const [tasks, setTasks]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [syncing, setSyncing]       = useState(false);
    const [tokenInput, setTokenInput] = useState('');
    const [showToken, setShowToken]   = useState(false);
    const [error, setError]           = useState('');
    const [tokenSaved, setTokenSaved] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [actRes, scoreRes, insightRes, taskRes] = await Promise.all([
                API.get('/github-intelligence/activity').catch(() => null),
                API.get('/github-intelligence/score').catch(() => null),
                API.get('/github-intelligence/insights').catch(() => null),
                API.get('/github-intelligence/weekly-tasks').catch(() => null),
            ]);
            if (actRes?.data?.success)     setActivity(actRes.data.activity);
            if (scoreRes?.data?.success)   setScore(scoreRes.data.developer_score);
            if (insightRes?.data?.success) setInsights(insightRes.data.insights || []);
            if (taskRes?.data?.success)    setTasks(taskRes.data.tasks || []);
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleSaveToken = async () => {
        if (!tokenInput.trim()) return;
        try {
            await API.post('/github-intelligence/token', { token: tokenInput.trim() });
            setTokenSaved(true);
            setShowToken(false);
            setTokenInput('');
        } catch (err) {
            setError('Failed to save token.');
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setError('');
        try {
            await API.post('/github-intelligence/sync');
            await fetchAll();
        } catch (err) {
            setError('Sync failed. Make sure your GitHub PAT is saved and has correct permissions.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.5px' }}>
                        GitHub Intelligence
                    </div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                        Your development activity, open source impact, and consistency.
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => setShowToken(!showToken)}
                        style={{
                            fontSize: 12, padding: '8px 16px',
                            border: '1px solid #E5E7EB', borderRadius: 8,
                            background: '#FFFFFF', color: '#374151',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                    >
                        <FontAwesomeIcon icon={faGithub} />
                        {tokenSaved ? 'Update Token' : 'Add Token'}
                    </button>

                    <button
                        onClick={handleSync}
                        disabled={syncing || loading}
                        style={{
                            fontSize: 12, padding: '8px 16px',
                            border: 'none', borderRadius: 8,
                            background: syncing ? '#6B7280' : '#0A0A0A',
                            color: '#FFFFFF', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            opacity: syncing ? 0.7 : 1
                        }}
                    >
                        <FontAwesomeIcon icon={faRotate} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync GitHub'}
                    </button>
                </div>
            </div>

            {/* syncing bar */}
            {syncing && <LinearProgress sx={{ borderRadius: 1, bgcolor: '#EEF2FF', '& .MuiLinearProgress-bar': { bgcolor: '#4F46E5' } }} />}

            {/* token input */}
            {showToken && (
                <Paper elevation={0} sx={{ border: '1px solid #C7D2FE', borderRadius: 3, p: 3, backgroundColor: '#EEF2FF' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#4F46E5', marginBottom: 8 }}>
                        GitHub Personal Access Token
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
                        Generate at: GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
                        <br />Required scopes: <strong>repo</strong>, <strong>read:user</strong>, <strong>read:org</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="password"
                            value={tokenInput}
                            onChange={e => setTokenInput(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            style={{
                                flex: 1, padding: '8px 12px', fontSize: 12,
                                border: '1px solid #C7D2FE', borderRadius: 8,
                                outline: 'none', fontFamily: 'monospace',
                                backgroundColor: '#FFFFFF'
                            }}
                        />
                        <button
                            onClick={handleSaveToken}
                            style={{
                                padding: '8px 20px', fontSize: 12,
                                background: '#4F46E5', color: '#FFFFFF',
                                border: 'none', borderRadius: 8, cursor: 'pointer'
                            }}
                        >
                            Save
                        </button>
                    </div>
                </Paper>
            )}

            {/* error */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2, fontSize: 12 }}
                    onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* no data state */}
            {!loading && !activity && (
                <Paper elevation={0} sx={{ border: '1px solid #F0F0F0', borderRadius: 3, p: 6, backgroundColor: '#FFFFFF' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            backgroundColor: '#F8FAFC',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <FontAwesomeIcon icon={faGithub} style={{ fontSize: 24, color: '#9CA3AF' }} />
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', marginBottom: 6 }}>
                            No GitHub data yet
                        </div>
                        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>
                            Add your GitHub Personal Access Token and click Sync to unlock your full development intelligence.
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

            {!loading && activity && (
                <>
                    {/* stat boxes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <StatBox icon={faCodeBranch} iconColor="#4F46E5" iconBg="#EEF2FF" label="Total Repos" value={activity.total_repos} />
                        <StatBox icon={faCode} iconColor="#0EA5E9" iconBg="#F0F9FF" label="Total Commits" value={activity.total_commits} />
                        <StatBox icon={faFire} iconColor="#F97316" iconBg="#FFF7ED" label="Active Days" value={activity.active_days} />
                        <StatBox icon={faStar} iconColor="#EAB308" iconBg="#FEFCE8" label="Total Stars" value={activity.total_stars} />
                    </div>

                    {/* developer score */}
                    {score && (
                        <SectionCard title="Developer Score" subtitle="Based on commits, PRs, open source activity, and consistency">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                <div>
                                    <div style={{ fontSize: 48, fontWeight: 800, color: '#0A0A0A', lineHeight: 1, letterSpacing: '-2px' }}>
                                        {score.total_score}
                                        <span style={{ fontSize: 20, color: '#9CA3AF', fontWeight: 400 }}>/100</span>
                                    </div>
                                    <Chip
                                        label={score.label}
                                        size="small"
                                        sx={{
                                            mt: 1,
                                            bgcolor: score.total_score >= 60 ? '#ECFDF5' : score.total_score >= 40 ? '#FFFBEB' : '#F8FAFC',
                                            color: score.total_score >= 60 ? '#059669' : score.total_score >= 40 ? '#D97706' : '#6B7280',
                                            fontWeight: 600, fontSize: 11
                                        }}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={score.total_score}
                                        sx={{
                                            height: 10, borderRadius: 5,
                                            bgcolor: '#F0F0F0',
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 5,
                                                bgcolor: score.total_score >= 60 ? '#059669' : score.total_score >= 40 ? '#D97706' : '#4F46E5'
                                            }
                                        }}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
                                        {[
                                            { label: 'Commits', value: score.commit_score, max: 25 },
                                            { label: 'Pull Requests', value: score.pr_score, max: 25 },
                                            { label: 'Open Source', value: score.open_source_score, max: 25 },
                                            { label: 'Consistency', value: score.consistency_score, max: 25 },
                                        ].map((item, i) => (
                                            <div key={i} style={{ textAlign: 'center', padding: '10px 8px', backgroundColor: '#FAFAFA', borderRadius: 8 }}>
                                                <div style={{ fontSize: 16, fontWeight: 700, color: '#0A0A0A' }}>
                                                    {item.value}
                                                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>/{item.max}</span>
                                                </div>
                                                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{item.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {/* contribution analysis */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                        {/* this month */}
                        <SectionCard title="This Month" subtitle={activity.monthly_snapshot?.month}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { label: 'Commits', value: activity.monthly_snapshot?.commits, color: '#4F46E5' },
                                    { label: 'Pull Requests', value: activity.monthly_snapshot?.prs, color: '#0EA5E9' },
                                    { label: 'Issues Opened', value: activity.monthly_snapshot?.issues, color: '#F97316' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: item.color }}>
                                            {item.value ?? 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* open source */}
                        <SectionCard title="Open Source Activity" subtitle="Contributions to external repos">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { label: 'PRs Merged', value: activity.open_source_prs_merged, color: '#059669' },
                                    { label: 'Issues Solved', value: activity.issues_closed, color: '#059669' },
                                    { label: 'Repos Contributed', value: activity.open_source_repos_contributed, color: '#059669' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: item.color }}>
                                            {item.value ?? 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    {/* consistency score */}
                    <SectionCard title="Consistency Score" subtitle="active_days / total_days tracked × 100">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <div style={{ fontSize: 40, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-1px', flexShrink: 0 }}>
                                {activity.consistency_score}
                                <span style={{ fontSize: 18, color: '#9CA3AF', fontWeight: 400 }}>%</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={activity.consistency_score}
                                    sx={{
                                        height: 8, borderRadius: 4,
                                        bgcolor: '#F0F0F0',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 4,
                                            bgcolor: activity.consistency_score >= 70 ? '#059669' : activity.consistency_score >= 40 ? '#D97706' : '#E11D48'
                                        }
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>{activity.active_days} active days</span>
                                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>{activity.total_days_tracked} days tracked</span>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* language breakdown */}
                    {activity.language_breakdown?.length > 0 && (
                        <SectionCard title="Language Breakdown" subtitle="Based on your repositories">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {activity.language_breakdown.slice(0, 6).map((lang, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{lang.language}</span>
                                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                                                {lang.repo_count} repo{lang.repo_count !== 1 ? 's' : ''} · {lang.percentage}%
                                            </span>
                                        </div>
                                        <LinearProgress
                                            variant="determinate"
                                            value={lang.percentage}
                                            sx={{
                                                height: 6, borderRadius: 3,
                                                bgcolor: '#F0F0F0',
                                                '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#4F46E5' }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* growth insights */}
                    {insights.length > 0 && (
                        <SectionCard title="Growth Insights" subtitle="Based on your GitHub activity patterns">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {insights.map((insight, i) => {
                                    const style = insightStyle[insight.type] || insightStyle.neutral;
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                            padding: '12px 14px', borderRadius: 10,
                                            backgroundColor: style.bg,
                                            border: `1px solid ${style.border}`
                                        }}>
                                            <FontAwesomeIcon icon={style.icon} style={{ color: style.color, marginTop: 1, flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                                                {insight.insight}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </SectionCard>
                    )}

                    {/* weekly tasks */}
                    {tasks.length > 0 && (
                        <SectionCard title="This Week's Tasks" subtitle="Generated from your activity gaps">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {tasks.map((task, i) => {
                                    const style = priorityStyle[task.priority] || priorityStyle.low;
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '12px 14px', borderRadius: 10,
                                            border: '1px solid #F0F0F0',
                                            backgroundColor: '#FAFAFA'
                                        }}>
                                            <FontAwesomeIcon icon={faListCheck} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>
                                                {task.task}
                                            </span>
                                            <span style={{
                                                fontSize: 10, fontWeight: 600, padding: '3px 8px',
                                                borderRadius: 20, textTransform: 'uppercase',
                                                backgroundColor: style.bg, color: style.color
                                            }}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </SectionCard>
                    )}

                    {/* top repos */}
                    {activity.top_repos?.length > 0 && (
                        <SectionCard title="Top Repositories" subtitle="Sorted by stars">
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {activity.top_repos.map((repo, i) => (
                                    <div key={i}>
                                        {i > 0 && <Divider sx={{ borderColor: '#F8FAFC', my: 1.5 }} />}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <a
                                                    href={repo.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ fontSize: 13, fontWeight: 500, color: '#4F46E5', textDecoration: 'none' }}
                                                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                                                >
                                                    {repo.name}
                                                </a>
                                                {repo.description && (
                                                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {repo.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                                                {repo.language && (
                                                    <span style={{ fontSize: 11, color: '#6B7280' }}>{repo.language}</span>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                                                    <FontAwesomeIcon icon={faStar} style={{ color: '#EAB308', fontSize: 11 }} />
                                                    {repo.stars}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}>
                                                    <FontAwesomeIcon icon={faCodeBranch} style={{ fontSize: 11 }} />
                                                    {repo.forks}
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
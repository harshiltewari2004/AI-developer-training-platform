import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Skeleton, Alert, LinearProgress } from '@mui/material';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRotate, faCodeBranch, faStar,
    faFire, faCode, faListCheck
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

function SectionCard({ title, subtitle, children, style = {} }) {
    return (
        <Card padding={24} style={{ marginBottom: 16, ...style }}>
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
            setError('Sync failed. Make sure your GitHub PAT is saved.');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="GitHub Intelligence"
                subtitle="Your development activity, open source impact, and consistency."
                action={
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => setShowToken(!showToken)}
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
                            <FontAwesomeIcon icon={faGithub} />
                            {tokenSaved ? 'Update Token' : 'Add Token'}
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
                            {syncing ? 'Syncing...' : 'Sync GitHub'}
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

            {/* token input */}
            {showToken && (
                <Card padding={20} style={{ marginBottom: 16 }}>
                    <p style={{
                        fontSize: 12, fontWeight: 600, color: '#FAFAFA',
                        marginBottom: 6, fontFamily: 'Inter, sans-serif'
                    }}>
                        GitHub Personal Access Token
                    </p>
                    <p style={{
                        fontSize: 11, color: '#525252', marginBottom: 12,
                        lineHeight: 1.5, fontFamily: 'Inter, sans-serif'
                    }}>
                        Generate at: GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
                        <br />Required scopes: <span style={{ color: '#A3A3A3' }}>repo, read:user, read:org</span>
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="password"
                            value={tokenInput}
                            onChange={e => setTokenInput(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            style={{
                                flex: 1, padding: '8px 12px', fontSize: 13,
                                fontFamily: 'monospace',
                                backgroundColor: '#1A1A1A',
                                border: '1px solid #262626',
                                borderRadius: 8, color: '#FAFAFA',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleSaveToken}
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

            {/* no data state */}
            {!loading && !activity && (
                <Card padding={48}>
                    <div style={{ textAlign: 'center' }}>
                        <FontAwesomeIcon icon={faGithub} style={{ fontSize: 24, color: '#333333', marginBottom: 12 }} />
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                            No GitHub data yet
                        </p>
                        <p style={{ fontSize: 12, color: '#525252', maxWidth: 320, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
                            Add your GitHub Personal Access Token and click Sync to unlock your full development intelligence.
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

            {!loading && activity && (
                <>
                    {/* stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                        <StatCard
                            label="Total Repos"
                            value={activity.total_repos}
                            icon={<FontAwesomeIcon icon={faCodeBranch} style={{ color: '#A3A3A3', fontSize: 12 }} />}
                        />
                        <StatCard
                            label="Total Commits"
                            value={activity.total_commits}
                            icon={<FontAwesomeIcon icon={faCode} style={{ color: '#A3A3A3', fontSize: 12 }} />}
                        />
                        <StatCard
                            label="Active Days"
                            value={activity.active_days}
                            icon={<FontAwesomeIcon icon={faFire} style={{ color: '#A3A3A3', fontSize: 12 }} />}
                        />
                        <StatCard
                            label="Total Stars"
                            value={activity.total_stars}
                            icon={<FontAwesomeIcon icon={faStar} style={{ color: '#A3A3A3', fontSize: 12 }} />}
                        />
                    </div>

                    {/* developer score */}
                    {score && (
                        <SectionCard
                            title="Developer Score"
                            subtitle="Based on commits, PRs, open source activity, and consistency"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                                <div style={{ flexShrink: 0 }}>
                                    <p style={{
                                        fontSize: 48, fontWeight: 800, color: '#FAFAFA',
                                        lineHeight: 1, letterSpacing: '-2px',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                        {score.total_score}
                                        <span style={{ fontSize: 18, color: '#525252', fontWeight: 400 }}>/100</span>
                                    </p>
                                    <span style={{
                                        display: 'inline-block', marginTop: 8,
                                        fontSize: 10, fontWeight: 600,
                                        padding: '3px 10px', borderRadius: 999,
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid #262626',
                                        color: '#A3A3A3',
                                        textTransform: 'uppercase', letterSpacing: '0.6px',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                        {score.label}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={score.total_score}
                                        sx={{
                                            height: 8, borderRadius: 4,
                                            bgcolor: '#1A1A1A',
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 4,
                                                bgcolor: '#FAFAFA'
                                            }
                                        }}
                                    />
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        gap: 10, marginTop: 16
                                    }}>
                                        {[
                                            { label: 'Commits',  value: score.commit_score },
                                            { label: 'PRs',      value: score.pr_score },
                                            { label: 'OS',       value: score.open_source_score },
                                            { label: 'Streak',   value: score.consistency_score },
                                        ].map((item, i) => (
                                            <div key={i} style={{
                                                textAlign: 'center', padding: '10px 8px',
                                                backgroundColor: '#1A1A1A',
                                                border: '1px solid #262626',
                                                borderRadius: 8
                                            }}>
                                                <p style={{
                                                    fontSize: 16, fontWeight: 700, color: '#FAFAFA',
                                                    fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    {item.value}
                                                    <span style={{ fontSize: 10, color: '#525252' }}>/25</span>
                                                </p>
                                                <p style={{
                                                    fontSize: 10, color: '#525252', marginTop: 2,
                                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                                    fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    {item.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {/* contribution analysis */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                        {/* this month */}
                        <Card padding={24}>
                            <h2 style={{
                                fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                This Month
                            </h2>
                            <p style={{
                                fontSize: 12, color: '#525252', marginTop: 4, marginBottom: 20,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {activity.monthly_snapshot?.month}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { label: 'Commits',       value: activity.monthly_snapshot?.commits },
                                    { label: 'Pull Requests', value: activity.monthly_snapshot?.prs },
                                    { label: 'Issues Opened', value: activity.monthly_snapshot?.issues },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{
                                            fontSize: 13, color: '#A3A3A3',
                                            fontFamily: 'Inter, sans-serif'
                                        }}>
                                            {item.label}
                                        </span>
                                        <span style={{
                                            fontSize: 18, fontWeight: 700, color: '#FAFAFA',
                                            fontFamily: 'Inter, sans-serif'
                                        }}>
                                            {item.value ?? 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* open source */}
                        <Card padding={24}>
                            <h2 style={{
                                fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                Open Source Activity
                            </h2>
                            <p style={{
                                fontSize: 12, color: '#525252', marginTop: 4, marginBottom: 20,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                Contributions to external repos
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { label: 'PRs Merged',         value: activity.open_source_prs_merged },
                                    { label: 'Issues Solved',      value: activity.issues_closed },
                                    { label: 'Repos Contributed',  value: activity.open_source_repos_contributed },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{
                                            fontSize: 13, color: '#A3A3A3',
                                            fontFamily: 'Inter, sans-serif'
                                        }}>
                                            {item.label}
                                        </span>
                                        <span style={{
                                            fontSize: 18, fontWeight: 700, color: '#FAFAFA',
                                            fontFamily: 'Inter, sans-serif'
                                        }}>
                                            {item.value ?? 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* consistency */}
                    <SectionCard title="Consistency Score" subtitle="active_days / total_days tracked × 100">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <p style={{
                                fontSize: 36, fontWeight: 800, color: '#FAFAFA',
                                letterSpacing: '-1px', flexShrink: 0,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {activity.consistency_score}
                                <span style={{ fontSize: 16, color: '#525252', fontWeight: 400 }}>%</span>
                            </p>
                            <div style={{ flex: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={activity.consistency_score}
                                    sx={{
                                        height: 6, borderRadius: 3,
                                        bgcolor: '#1A1A1A',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            bgcolor: '#FAFAFA'
                                        }
                                    }}
                                />
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    marginTop: 8
                                }}>
                                    <span style={{
                                        fontSize: 11, color: '#525252',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                        {activity.active_days} active days
                                    </span>
                                    <span style={{
                                        fontSize: 11, color: '#525252',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                        {activity.total_days_tracked} days tracked
                                    </span>
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
                        </SectionCard>
                    )}

                    {/* growth insights */}
                    {insights.length > 0 && (
                        <SectionCard title="Growth Insights" subtitle="Based on your GitHub activity patterns">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {insights.map((insight, i) => (
                                    <div key={i} style={{
                                        padding: '12px 14px', borderRadius: 10,
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid #262626'
                                    }}>
                                        <p style={{
                                            fontSize: 13, color: '#FAFAFA', lineHeight: 1.5,
                                            fontFamily: 'Inter, sans-serif'
                                        }}>
                                            {insight.insight}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* weekly tasks */}
                    {tasks.length > 0 && (
                        <SectionCard title="This Week's Tasks" subtitle="Generated from your activity gaps">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {tasks.map((task, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 14px', borderRadius: 10,
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid #262626'
                                    }}>
                                        <FontAwesomeIcon
                                            icon={faListCheck}
                                            style={{ color: '#525252', fontSize: 12, flexShrink: 0 }}
                                        />
                                        <span style={{
                                            fontSize: 13, color: '#FAFAFA', flex: 1,
                                            fontFamily: 'Inter, sans-serif'
                                        }}>
                                            {task.task}
                                        </span>
                                        <span style={{
                                            fontSize: 9, fontWeight: 600,
                                            padding: '2px 8px', borderRadius: 999,
                                            backgroundColor: '#0A0A0A',
                                            border: '1px solid #262626',
                                            color: '#A3A3A3',
                                            textTransform: 'uppercase', letterSpacing: '0.6px',
                                            fontFamily: 'Inter, sans-serif'
                                        }}>
                                            {task.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* top repos */}
                    {activity.top_repos?.length > 0 && (
                        <SectionCard title="Top Repositories" subtitle="Sorted by stars">
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {activity.top_repos.map((repo, i) => (
                                    <div key={i}>
                                        {i > 0 && (
                                            <div style={{ height: 1, backgroundColor: '#1A1A1A', margin: '14px 0' }} />
                                        )}
                                        <div style={{
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', gap: 16
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                
                                                  <a  href={repo.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        fontSize: 13, fontWeight: 500, color: '#FAFAFA',
                                                        textDecoration: 'none',
                                                        fontFamily: 'Inter, sans-serif'
                                                    }}
                                                >
                                                    {repo.name}
                                                </a>
                                                {repo.description && (
                                                    <p style={{
                                                        fontSize: 12, color: '#525252', marginTop: 2,
                                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        fontFamily: 'Inter, sans-serif'
                                                    }}>
                                                        {repo.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 16,
                                                flexShrink: 0
                                            }}>
                                                {repo.language && (
                                                    <span style={{
                                                        fontSize: 11, color: '#A3A3A3',
                                                        fontFamily: 'Inter, sans-serif'
                                                    }}>
                                                        {repo.language}
                                                    </span>
                                                )}
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                    fontSize: 12, color: '#A3A3A3',
                                                    fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    <FontAwesomeIcon icon={faStar} style={{ fontSize: 10 }} />
                                                    {repo.stars}
                                                </span>
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                    fontSize: 12, color: '#A3A3A3',
                                                    fontFamily: 'Inter, sans-serif'
                                                }}>
                                                    <FontAwesomeIcon icon={faCodeBranch} style={{ fontSize: 10 }} />
                                                    {repo.forks}
                                                </span>
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
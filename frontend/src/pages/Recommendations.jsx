import { useEffect, useState } from 'react';
import API from '../api/axios';
import {
    Paper, Chip, CircularProgress,
    Skeleton, Alert, Tooltip
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStar,
    faArrowUpRightFromSquare,
    faRotate,
    faTriangleExclamation,
    faFire,
    faCircleInfo
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const difficultyConfig = {
    Easy:   { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    Medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    Hard:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

// single problem card
function ProblemCard({ problem, reason, index }) {
    const diff = difficultyConfig[problem.difficulty] || difficultyConfig.Medium;

    return (
        <Paper
            elevation={0}
            sx={{
                border: '1px solid #f3f4f6',
                borderRadius: 3,
                p: 2.5,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
            }}
        >
            <div className="flex items-start justify-between gap-4">

                {/* left — number + title + meta */}
                <div className="flex items-start gap-3 flex-1 min-w-0">

                    {/* index number */}
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0 mt-0.5">
                        {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* title */}
                        <a
                            href={problem.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5 group"
                        >
                            <span className="truncate">{problem.title}</span>
                            <FontAwesomeIcon
                                icon={faArrowUpRightFromSquare}
                                className="text-gray-300 group-hover:text-indigo-400 text-xs shrink-0 transition-colors"
                            />
                        </a>

                        {/* topics */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {problem.topics?.map((topic, i) => (
                                <span
                                    key={i}
                                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>

                        {/* reason */}
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCircleInfo} className="text-gray-300 shrink-0" />
                            {reason}
                        </p>
                    </div>
                </div>

                {/* right — difficulty + platform */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full border"
                        style={{
                            color: diff.color,
                            backgroundColor: diff.bg,
                            borderColor: diff.border
                        }}
                    >
                        {problem.difficulty}
                    </span>
                    <span className="text-xs text-gray-400">{problem.platform}</span>
                </div>
            </div>
    </Paper>
    );
}

// loading skeleton
function LoadingSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <Paper
                    key={i}
                    elevation={0}
                    sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 2.5 }}
                >
                    <div className="flex items-start gap-3">
                        <Skeleton variant="circular" width={28} height={28} />
                        <div className="flex-1">
                            <Skeleton variant="text" width="60%" height={20} />
                            <Skeleton variant="text" width="30%" height={16} sx={{ mt: 1 }} />
                            <Skeleton variant="text" width="80%" height={14} sx={{ mt: 1 }} />
                        </div>
                        <Skeleton variant="rounded" width={60} height={26} />
                    </div>
                </Paper>
            ))}
        </div>
    );
}

// empty state
function EmptyState() {
    return (
        <Paper
            elevation={0}
            sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 6 }}
        >
            <div className="text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faStar} className="text-gray-300 text-xl" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                    No recommendations yet
                </p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Add problems to your problem set and log some submissions to get personalised daily recommendations.
                </p>
            </div>
        </Paper>
    );
}

export default function Recommendations() {
    const [recs, setRecs]       = useState([]);
    const [meta, setMeta]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [limit, setLimit]     = useState(5);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRecs = async (currentLimit = limit, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const res = await API.get(`/recommendations/daily?limit=${currentLimit}`);
            setRecs(res.data.recommendations || []);
            setMeta(res.data.meta || null);
        } catch (err) {
            setError('Failed to load recommendations. Make sure your backend is running.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchRecs(); }, []);

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        fetchRecs(newLimit);
    };

    return (
        <div className="space-y-6">

            {/* header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Daily Recommendations
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Personalised problems based on your weak topics and skill level.
                    </p>
                </div>

                {/* refresh button */}
                <button
                    onClick={() => fetchRecs(limit, true)}
                    disabled={refreshing || loading}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
                >
                    <FontAwesomeIcon
                        icon={faRotate}
                        className={refreshing ? 'animate-spin' : ''}
                    />
                    Refresh
                </button>
            </div>

            {/* meta info bar */}
            {meta && !loading && (
                <Paper
                    elevation={0}
                    sx={{ border: '1px solid #f3f4f6', borderRadius: 3, p: 2 }}
                >
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">

                        <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faFire} className="text-orange-400" />
                            <span>Based on <strong className="text-gray-700">{meta.based_on_accuracy}%</strong> accuracy</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Difficulty:</span>
                            {meta.recommended_difficulty?.map(d => (
                                <span
                                    key={d}
                                    className="px-2 py-0.5 rounded-full text-xs font-medium border"
                                    style={{
                                        color: difficultyConfig[d]?.color,
                                        backgroundColor: difficultyConfig[d]?.bg,
                                        borderColor: difficultyConfig[d]?.border
                                    }}
                                >
                                    {d}
                                </span>
                            ))}
                        </div>

                        {meta.weak_topics_found?.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">Weak topics:</span>
                                {meta.weak_topics_found.map(t => (
                                    <span
                                        key={t}
                                        className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full capitalize"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </Paper>
            )}

            {/* limit selector */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Show:</span>
                    {[3, 5, 8, 10].map(n => (
                        <button
                            key={n}
                            onClick={() => handleLimitChange(n)}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                                limit === n
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                    <span className="text-xs text-gray-400">problems</span>
                </div>
            )}

            {/* error state */}
            {error && (
                <Alert
                    severity="error"
                    icon={<FontAwesomeIcon icon={faTriangleExclamation} />}
                    sx={{ borderRadius: 2, fontSize: 13 }}
                >
                    {error}
                </Alert>
            )}

            {/* loading state */}
            {loading && <LoadingSkeleton />}

            {/* empty state */}
            {!loading && !error && recs.length === 0 && <EmptyState />}

            {/* problem cards */}
            {!loading && !error && recs.length > 0 && (
                <div className="space-y-3">
                    {recs.map((r, i) => (
                        <ProblemCard
                            key={i}
                            index={i}
                            problem={r.problem}
                            reason={r.reason}
                        />
                    ))}
                </div>
            )}

            {/* footer note */}
            {!loading && recs.length > 0 && (
                <p className="text-xs text-gray-400 text-center">
                    Problems are refreshed daily based on your latest performance.
                    Solved problems are automatically excluded.
                </p>
            )}
        </div>
    );
}
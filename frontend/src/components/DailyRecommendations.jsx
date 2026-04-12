import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Skeleton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

const difficultyColor = {
    Easy:   'text-green-500',
    Medium: 'text-amber-500',
    Hard:   'text-red-500',
};

export default function DailyRecommendations() {
    const [recs, setRecs]       = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/recommendations/daily?limit=5')
            .then(res => setRecs(res.data.recommendations || []))
            .catch(() => setRecs([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h2 className="text-sm font-medium text-gray-900 mb-4">
                Daily Recommendations
            </h2>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} variant="rounded" height={40} />
                    ))}
                </div>
            ) : recs.length === 0 ? (
                <p className="text-xs text-gray-400">
                    No recommendations yet — add problems first.
                </p>
            ) : (
                <div className="space-y-3">
                    {recs.map((r, i) => (
                        <div key={i} className="flex items-center justify-between gap-3">
                            <a
                                href={r.problem.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-indigo-600 transition-colors truncate group"
                            >
                                <span className="truncate">{r.problem.title}</span>
                                <FontAwesomeIcon
                                    icon={faArrowUpRightFromSquare}
                                    className="text-gray-300 group-hover:text-indigo-400 shrink-0 text-xs"
                                />
                            </a>
                            <span className={`text-xs font-medium shrink-0 ${difficultyColor[r.problem.difficulty]}`}>
                                {r.problem.difficulty}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
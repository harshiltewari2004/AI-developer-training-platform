import { useEffect, useState } from 'react';
import API from '../api/axios';

const severityStyle = {
    high:       'bg-red-50 border-red-100 text-red-700',
    medium:     'bg-yellow-50 border-yellow-100 text-yellow-700',
    positive:   'bg-green-50 border-green-100 text-green-700',
};

export default function GitHubInsights() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [message, setMessage]   = useState('');

    useEffect(() => {
        API.get('/insights/generate')
            .then(res => {
                setInsights(res.data.insights || []);
                setMessage(res.data.message || '');
            })
            .catch(() => setInsights([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h2 className="text-sm font-medium text-gray-900 mb-4">
                GitHub Insights
            </h2>

            {loading ? (
                <p className="text-xs text-gray-400">Loading...</p>
            ) : insights.length === 0 ? (
                <p className="text-xs text-gray-400">
                    {message || 'Sync your GitHub repos to unlock insights.'}
                </p>
            ) : (
                <div className="space-y-2">
                    {insights.slice(0, 4).map((insight, i) => (
                        <div
                            key={i}
                            className={`text-xs p-3 rounded-lg border ${severityStyle[insight.severity] || severityStyle.medium}`}
                        >
                            <p className="font-medium mb-0.5">{insight.title}</p>
                            <p className="opacity-80">{insight.action}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
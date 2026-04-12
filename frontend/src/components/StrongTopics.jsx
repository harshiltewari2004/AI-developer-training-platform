import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function StrongTopics() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/submissions/my/strong-topics')
            .then(res => setTopics(res.data.strongTopics || []))
            .catch(() => setTopics([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h2 className="text-sm font-medium text-gray-900 mb-4">
                Strong Topics
                <span className="ml-2 text-xs text-gray-400 font-normal">above 70%</span>
            </h2>

            {loading ? (
                <p className="text-xs text-gray-400">Loading...</p>
            ) : topics.length === 0 ? (
                <p className="text-xs text-gray-400">Keep practicing to unlock strong topics 💪</p>
            ) : (
                <div className="space-y-3">
                    {topics.map(t => (
                        <div key={t.topic}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-700 capitalize">{t.topic}</span>
                                <span className="text-green-500">{t.accuracy}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                    className="bg-green-400 h-1.5 rounded-full"
                                    style={{ width: t.accuracy }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
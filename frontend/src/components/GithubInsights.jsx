import { useEffect, useState } from 'react';
import API from '../api/axios';
import Card from './ui/Card';

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
        <Card>
            <h2 style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#FAFAFA',
                marginBottom: 20,
                fontFamily: 'Inter, sans-serif'
            }}>
                GitHub Insights
            </h2>

            {loading ? (
                <p style={{
                    fontSize: 12,
                    color: '#525252',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    Loading...
                </p>
            ) : insights.length === 0 ? (
                <p style={{
                    fontSize: 12,
                    color: '#525252',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {message || 'Sync your GitHub repos to unlock insights.'}
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {insights.slice(0, 4).map((insight, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 12,
                                borderRadius: 10,
                                border: '1px solid #262626',
                                backgroundColor: '#1A1A1A'
                            }}
                        >
                            <p style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#FAFAFA',
                                marginBottom: 4,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {insight.title}
                            </p>
                            <p style={{
                                fontSize: 11,
                                color: '#A3A3A3',
                                lineHeight: 1.5,
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {insight.action}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
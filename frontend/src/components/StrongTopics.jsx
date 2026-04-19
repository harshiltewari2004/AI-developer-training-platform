import { useEffect, useState } from 'react';
import API from '../api/axios';
import Card from './ui/Card';

function TopicBar({ topic, accuracy }) {
    const pct = parseFloat(accuracy);

    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 7
            }}>
                <span style={{
                    fontSize: 13,
                    color: '#A3A3A3',
                    fontWeight: 400,
                    textTransform: 'capitalize',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {topic}
                </span>
                <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#FAFAFA',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {accuracy}
                </span>
            </div>
            <div style={{
                width: '100%',
                height: 3,
                backgroundColor: '#1A1A1A',
                borderRadius: 2,
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: '#FAFAFA',
                    borderRadius: 2,
                    transition: 'width 0.6s ease'
                }} />
            </div>
        </div>
    );
}

export default function StrongTopics() {
    const [topics, setTopics]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/submissions/my/strong-topics')
            .then(res => setTopics(res.data.strongTopics || []))
            .catch(() => setTopics([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Card>
            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 20
            }}>
                <h2 style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#FAFAFA',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    Strong Topics
                </h2>
                <span style={{
                    fontSize: 11,
                    color: '#525252',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    above 70%
                </span>
            </div>

            {loading ? (
                <p style={{
                    fontSize: 13,
                    color: '#525252',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    Loading...
                </p>
            ) : topics.length === 0 ? (
                <p style={{
                    fontSize: 13,
                    color: '#525252',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    Keep practicing to unlock strong topics
                </p>
            ) : (
                topics.map(t => (
                    <TopicBar
                        key={t.topic}
                        topic={t.topic}
                        accuracy={t.accuracy}
                    />
                ))
            )}
        </Card>
    );
}
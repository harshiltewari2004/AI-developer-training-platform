import { useEffect, useState } from 'react';
import API from '../api/axios';
import Card from './ui/Card';

function TopicBar({ topic, accuracy, color }) {
    const pct = parseFloat(accuracy);
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6
            }}>
                <span style={{
                    fontSize: 13,
                    color: '#525252',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {topic}
                </span>
                <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color,
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {accuracy}
                </span>
            </div>
            <div style={{
                width: '100%',
                height: 4,
                backgroundColor: '#F5F5F5',
                borderRadius: 2,
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: 2,
                    transition: 'width 0.6s ease'
                }} />
            </div>
        </div>
    );
}

export default function WeakTopics() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/submissions/my/weak-topics')
            .then(res => setTopics(res.data.weakTopics || []))
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
                    color: '#0A0A0A',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    Weak Topics
                </h2>
                <span style={{
                    fontSize: 11,
                    color: '#A3A3A3',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    below 40%
                </span>
            </div>

            {loading ? (
                <p style={{ fontSize: 13, color: '#A3A3A3', fontFamily: 'Inter, sans-serif' }}>
                    Loading...
                </p>
            ) : topics.length === 0 ? (
                <p style={{ fontSize: 13, color: '#A3A3A3', fontFamily: 'Inter, sans-serif' }}>
                    No weak topics — great job! 🎉
                </p>
            ) : (
                topics.map(t => (
                    <TopicBar
                        key={t.topic}
                        topic={t.topic}
                        accuracy={t.accuracy}
                        color="#0A0A0A"
                    />
                ))
            )}
        </Card>
    );
}
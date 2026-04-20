import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Skeleton, Alert } from '@mui/material';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRotate, faArrowUpRightFromSquare, faStar, faFire
} from '@fortawesome/free-solid-svg-icons';

function RecommendationCard({ rec, index }) {
    return (
        <Card hoverable padding={20}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #262626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 11, fontWeight: 600, color: '#A3A3A3',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {index + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            
                              <a  href={rec.problem.link}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    fontSize: 14, fontWeight: 500,
                                    color: '#FAFAFA',
                                    textDecoration: 'none',
                                    fontFamily: 'Inter, sans-serif'
                                }}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {rec.problem.title}
                                </span>
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 10, color: '#525252' }} />
                            </a>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                {rec.problem.topics?.map((topic, i) => (
                                    <span key={i} style={{
                                        fontSize: 11, padding: '3px 8px',
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid #262626',
                                        color: '#A3A3A3', borderRadius: 999,
                                        textTransform: 'capitalize',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                        {typeof topic === 'object' ? topic.name : topic}
                                    </span>
                                ))}
                            </div>

                            {rec.reason && (
                                <p style={{ fontSize: 11, color: '#525252', marginTop: 10, fontFamily: 'Inter, sans-serif' }}>
                                    {rec.reason}
                                </p>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                            <span style={{
                                fontSize: 11, fontWeight: 500,
                                padding: '3px 10px', borderRadius: 999,
                                backgroundColor: '#1A1A1A',
                                border: '1px solid #262626',
                                color: '#FAFAFA',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {rec.problem.difficulty}
                            </span>
                            <span style={{ fontSize: 11, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                                {rec.problem.platform}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default function Recommendations() {
    const [recs, setRecs]         = useState([]);
    const [meta, setMeta]         = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [limit, setLimit]       = useState(5);

    const fetchRecs = async (newLimit = limit) => {
        setLoading(true);
        try {
            const res = await API.get(`/recommendations/daily?limit=${newLimit}`);
            setRecs(res.data.recommendations || []);
            setMeta({
                accuracy: res.data.recent_accuracy,
                difficulty: res.data.target_difficulty,
                count: res.data.count
            });
        } catch (err) {
            setError('Failed to load recommendations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecs(); }, []);

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        fetchRecs(newLimit);
    };

    return (
        <div>
            <PageHeader
                title="Daily Recommendations"
                subtitle="Personalised problems based on your weak topics and skill level."
                action={
                    <button
                        onClick={() => fetchRecs()}
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
                        <FontAwesomeIcon icon={faRotate} />
                        Refresh
                    </button>
                }
            />

            {meta && (
                <Card padding={16} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FontAwesomeIcon icon={faFire} style={{ color: '#A3A3A3', fontSize: 12 }} />
                            <span style={{ fontSize: 12, color: '#A3A3A3', fontFamily: 'Inter, sans-serif' }}>
                                Based on <span style={{ color: '#FAFAFA', fontWeight: 600 }}>{meta.accuracy}%</span> accuracy
                            </span>
                        </div>
                        <div style={{ width: 1, height: 14, backgroundColor: '#262626' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                                Difficulty:
                            </span>
                            {meta.difficulty?.split(' / ').map((d, i) => (
                                <span key={i} style={{
                                    fontSize: 11, fontWeight: 500,
                                    padding: '3px 10px', borderRadius: 999,
                                    backgroundColor: '#1A1A1A',
                                    border: '1px solid #262626',
                                    color: '#FAFAFA',
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 12, color: '#525252', fontFamily: 'Inter, sans-serif' }}>Show:</span>
                {[3, 5, 8, 10].map(n => (
                    <button
                        key={n}
                        onClick={() => handleLimitChange(n)}
                        style={{
                            width: 28, height: 28,
                            fontSize: 12, fontWeight: 600,
                            border: '1px solid #262626',
                            borderRadius: '50%',
                            backgroundColor: limit === n ? '#FAFAFA' : 'transparent',
                            color: limit === n ? '#0A0A0A' : '#A3A3A3',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif'
                        }}
                    >
                        {n}
                    </button>
                ))}
                <span style={{ fontSize: 12, color: '#525252', fontFamily: 'Inter, sans-serif' }}>problems</span>
            </div>

            {error && (
                <Alert severity="error" sx={{ borderRadius: 2, fontSize: 12, mb: 2, backgroundColor: '#1A1A1A !important', color: '#FAFAFA !important' }}>
                    {error}
                </Alert>
            )}

            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} padding={20}>
                            <Skeleton variant="text" width="50%" sx={{ bgcolor: '#1A1A1A' }} />
                            <Skeleton variant="text" width="30%" sx={{ bgcolor: '#1A1A1A', mt: 1 }} />
                        </Card>
                    ))}
                </div>
            )}

            {!loading && recs.length === 0 && (
                <Card padding={48}>
                    <div style={{ textAlign: 'center' }}>
                        <FontAwesomeIcon icon={faStar} style={{ fontSize: 24, color: '#333333', marginBottom: 12 }} />
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                            No recommendations yet
                        </p>
                        <p style={{ fontSize: 12, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                            Add problems to your set first
                        </p>
                    </div>
                </Card>
            )}

            {!loading && recs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recs.map((rec, i) => <RecommendationCard key={i} rec={rec} index={i} />)}
                </div>
            )}

            {!loading && recs.length > 0 && (
                <p style={{
                    fontSize: 11, color: '#333333', textAlign: 'center', marginTop: 24,
                    fontFamily: 'Inter, sans-serif'
                }}>
                    Problems refresh daily based on your latest performance · Solved problems automatically excluded
                </p>
            )}
        </div>
    );
}
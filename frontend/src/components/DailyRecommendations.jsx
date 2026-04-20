import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Skeleton } from '@mui/material';
import Card from './ui/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

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
        <Card>
            <h2 style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#FAFAFA',
                marginBottom: 20,
                fontFamily: 'Inter, sans-serif'
            }}>
                Daily Recommendations
            </h2>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton
                            key={i}
                            variant="rounded"
                            height={36}
                            sx={{ bgcolor: '#1A1A1A' }}
                        />
                    ))}
                </div>
            ) : recs.length === 0 ? (
                <p style={{
                    fontSize: 12,
                    color: '#525252',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    No recommendations yet — add problems first.
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {recs.map((r, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12
                        }}>
                            
                                <a href={r.problem.link}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: 13,
                                    color: '#A3A3A3',
                                    textDecoration: 'none',
                                    fontFamily: 'Inter, sans-serif',
                                    overflow: 'hidden',
                                    transition: 'color 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#FAFAFA'}
                                onMouseLeave={e => e.currentTarget.style.color = '#A3A3A3'}
                            >
                                <span style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {r.problem.title}
                                </span>
                                <FontAwesomeIcon
                                    icon={faArrowUpRightFromSquare}
                                    style={{
                                        fontSize: 10,
                                        color: '#333333',
                                        flexShrink: 0
                                    }}
                                />
                            </a>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 500,
                                color: '#525252',
                                flexShrink: 0,
                                fontFamily: 'Inter, sans-serif',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {r.problem.difficulty}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
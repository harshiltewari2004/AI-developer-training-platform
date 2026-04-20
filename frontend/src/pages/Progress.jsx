import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Skeleton, Alert } from '@mui/material';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line, Legend
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowTrendUp, faArrowTrendDown, faMinus
} from '@fortawesome/free-solid-svg-icons';

// chart theme constants — keep everything monochrome
const CHART_GRID  = '#1A1A1A';
const CHART_AXIS  = '#525252';
const CHART_BAR   = '#FAFAFA';
const CHART_LINE  = '#FAFAFA';

// custom tooltip styled for dark theme
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            backgroundColor: '#0A0A0A',
            border: '1px solid #262626',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            fontFamily: 'Inter, sans-serif'
        }}>
            <p style={{ color: '#FAFAFA', fontWeight: 600, marginBottom: 4 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: '#A3A3A3' }}>
                    {p.name}: <span style={{ color: '#FAFAFA' }}>{p.value}{typeof p.value === 'number' && p.dataKey === 'accuracy' ? '%' : ''}</span>
                </p>
            ))}
        </div>
    );
};

function TopicBreakdownItem({ topic, accuracy, attempted }) {
    const pct = parseFloat(accuracy);

    // determine status label
    let label = 'Weak';
    if (pct >= 70) label = 'Strong';
    else if (pct >= 40) label = 'Average';

    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                        fontSize: 13, fontWeight: 500, color: '#FAFAFA',
                        textTransform: 'capitalize', fontFamily: 'Inter, sans-serif'
                    }}>
                        {topic}
                    </span>
                    <span style={{
                        fontSize: 10, fontWeight: 500,
                        padding: '2px 8px', borderRadius: 999,
                        backgroundColor: '#1A1A1A',
                        border: '1px solid #262626',
                        color: '#A3A3A3',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {label}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                        /{attempted}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
                        {accuracy}%
                    </span>
                </div>
            </div>
            <div style={{
                width: '100%', height: 3,
                backgroundColor: '#1A1A1A', borderRadius: 2,
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${pct}%`, height: '100%',
                    backgroundColor: '#FAFAFA', borderRadius: 2,
                    transition: 'width 0.6s ease'
                }} />
            </div>
        </div>
    );
}

export default function Progress() {
    const [topicData, setTopicData]               = useState([]);
    const [weeklyData, setWeeklyData]             = useState([]);
    const [topicImprovement, setTopicImprovement] = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [error, setError]                       = useState('');

    const fetchData = async () => {
        try {
            const [topicRes, progressRes, insightRes] = await Promise.all([
                API.get('/submissions/my/topic-accuracy'),
                API.get('/progress/my'),
                API.get('/progress/my/insights').catch(() => null)
            ]);

            const topics = (topicRes.data.topic_accuracy || []).map(t => ({
                topic: t.topic,
                accuracy: parseFloat(t.accuracy),
                attempted: t.attempted,
                accepted: t.accepted
            }));
            setTopicData(topics);

            const weekly = (progressRes.data.progress || []).map(w => ({
                week: `W${w.week}`,
                accuracy: w.accuracy,
                attempted: w.attempted,
                accepted: w.accepted
            }));
            setWeeklyData(weekly);

            if (insightRes?.data?.insights) {
                const topicInsights = insightRes.data.insights.filter(i =>
                    i.metric?.startsWith('topic_')
                );
                setTopicImprovement(topicInsights);
            }
        } catch (err) {
            setError('Failed to load progress data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div>
                <PageHeader
                    title="Topic Performance"
                    subtitle="Your accuracy breakdown across all practiced topics."
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} padding={24}>
                            <Skeleton variant="text" width="40%" sx={{ bgcolor: '#1A1A1A' }} />
                            <Skeleton variant="rounded" height={200} sx={{ bgcolor: '#1A1A1A', mt: 2 }} />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // counts
    const strongCnt  = topicData.filter(t => t.accuracy >= 70).length;
    const averageCnt = topicData.filter(t => t.accuracy >= 40 && t.accuracy < 70).length;
    const weakCnt    = topicData.filter(t => t.accuracy < 40).length;

    return (
        <div>
            <PageHeader
                title="Topic Performance"
                subtitle="Your accuracy breakdown across all practiced topics."
            />

            {/* summary chips */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                    { label: 'Strong',  count: strongCnt,  icon: faArrowTrendUp },
                    { label: 'Average', count: averageCnt, icon: faMinus },
                    { label: 'Weak',    count: weakCnt,    icon: faArrowTrendDown },
                ].map((item, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontFamily: 'Inter, sans-serif'
                    }}>
                        <FontAwesomeIcon icon={item.icon} style={{ color: '#525252', fontSize: 11 }} />
                        <span style={{ color: '#FAFAFA', fontWeight: 600 }}>{item.count}</span>
                        <span style={{ color: '#525252' }}>{item.label}</span>
                    </div>
                ))}
            </div>

            {error && (
                <Alert severity="error" sx={{ mb: 2, fontSize: 12, backgroundColor: '#1A1A1A !important', color: '#FAFAFA !important' }}>
                    {error}
                </Alert>
            )}

            {/* accuracy per topic — bar chart */}
            {topicData.length > 0 && (
                <Card padding={24} style={{ marginBottom: 16 }}>
                    <h2 style={{
                        fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                        marginBottom: 24, fontFamily: 'Inter, sans-serif'
                    }}>
                        Accuracy per Topic
                    </h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={topicData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                            <XAxis
                                dataKey="topic"
                                tick={{ fontSize: 10, fill: CHART_AXIS, fontFamily: 'Inter' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 11, fill: CHART_AXIS, fontFamily: 'Inter' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={v => `${v}%`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1A1A1A' }} />
                            <Bar dataKey="accuracy" fill={CHART_BAR} radius={[3, 3, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* radar chart */}
            {topicData.length >= 3 && (
                <Card padding={24} style={{ marginBottom: 16 }}>
                    <h2 style={{
                        fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                        marginBottom: 4, fontFamily: 'Inter, sans-serif'
                    }}>
                        Topic Radar
                    </h2>
                    <p style={{
                        fontSize: 12, color: '#525252', marginBottom: 24,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Shows your skill shape across all topics
                    </p>
                    <ResponsiveContainer width="100%" height={320}>
                        <RadarChart data={topicData}>
                            <PolarGrid stroke={CHART_GRID} />
                            <PolarAngleAxis
                                dataKey="topic"
                                tick={{ fontSize: 10, fill: CHART_AXIS, fontFamily: 'Inter' }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fontSize: 9, fill: CHART_AXIS }}
                                axisLine={false}
                            />
                            <Radar
                                name="Accuracy"
                                dataKey="accuracy"
                                stroke="#FAFAFA"
                                fill="#FAFAFA"
                                fillOpacity={0.15}
                                strokeWidth={1.5}
                            />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* topic breakdown list */}
            {topicData.length > 0 && (
                <Card padding={24} style={{ marginBottom: 16 }}>
                    <h2 style={{
                        fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                        marginBottom: 20, fontFamily: 'Inter, sans-serif'
                    }}>
                        Topic Breakdown
                    </h2>
                    {topicData
                        .sort((a, b) => b.accuracy - a.accuracy)
                        .map(t => (
                            <TopicBreakdownItem
                                key={t.topic}
                                topic={t.topic}
                                accuracy={t.accuracy}
                                attempted={t.attempted}
                            />
                        ))
                    }
                </Card>
            )}

            {/* weekly trend */}
            {weeklyData.length > 0 && (
                <Card padding={24} style={{ marginBottom: 16 }}>
                    <h2 style={{
                        fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                        marginBottom: 4, fontFamily: 'Inter, sans-serif'
                    }}>
                        Weekly Accuracy Trend
                    </h2>
                    <p style={{
                        fontSize: 12, color: '#525252', marginBottom: 24,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Your accuracy over the last {weeklyData.length} week{weeklyData.length !== 1 ? 's' : ''}
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={weeklyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                            <XAxis
                                dataKey="week"
                                tick={{ fontSize: 11, fill: CHART_AXIS, fontFamily: 'Inter' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 11, fill: CHART_AXIS, fontFamily: 'Inter' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={v => `${v}%`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: 11, color: '#A3A3A3', fontFamily: 'Inter' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="accuracy"
                                stroke={CHART_LINE}
                                strokeWidth={2}
                                dot={{ fill: CHART_LINE, r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="attempted"
                                stroke="#525252"
                                strokeWidth={1}
                                dot={{ fill: '#525252', r: 2, strokeWidth: 0 }}
                                strokeDasharray="4 4"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* topic improvement */}
            {topicImprovement.length > 0 && (
                <Card padding={24}>
                    <h2 style={{
                        fontSize: 13, fontWeight: 600, color: '#FAFAFA',
                        marginBottom: 4, fontFamily: 'Inter, sans-serif'
                    }}>
                        Topic Improvement
                    </h2>
                    <p style={{
                        fontSize: 12, color: '#525252', marginBottom: 16,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        This week vs last week
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {topicImprovement.map((insight, i) => {
                            const isImprovement = insight.type === 'improvement';
                            const isDecline = insight.type === 'decline';
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: '12px 14px', borderRadius: 10,
                                    backgroundColor: '#1A1A1A',
                                    border: '1px solid #262626'
                                }}>
                                    <FontAwesomeIcon
                                        icon={isImprovement ? faArrowTrendUp : isDecline ? faArrowTrendDown : faMinus}
                                        style={{ marginTop: 1, color: '#A3A3A3', fontSize: 12 }}
                                    />
                                    <p style={{ fontSize: 12, color: '#FAFAFA', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                                        {insight.insight}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {!loading && topicData.length === 0 && (
                <Card padding={48}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#FAFAFA', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                            No data yet
                        </p>
                        <p style={{ fontSize: 12, color: '#525252', fontFamily: 'Inter, sans-serif' }}>
                            Log your submissions to see your progress here
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}
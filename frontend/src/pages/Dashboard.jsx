import { useEffect, useState } from 'react';
import API from '../api/axios';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import WeakTopics from '../components/WeakTopics';
import StrongTopics from '../components/StrongTopics';
import DailyRecommendations from '../components/DailyRecommendations';
import GitHubInsights from '../components/GitHubInsights';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faListCheck, faCircleCheck,
    faPercent, faClock
} from '@fortawesome/free-solid-svg-icons';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        API.get('/submissions/my/stats')
            .then(res => setStats(res.data.stats))
            .catch(() => setStats(null));
    }, []);

    const firstName = user?.name?.split(' ')[0] || user?.user;

    return (
        <div>
            <PageHeader
                title={`Welcome back, ${firstName}`}
                subtitle="Here's your training summary for today."
            />

            {/* stat cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 24
            }}>
                <StatCard
                    label="Total Submissions"
                    value={stats?.total_submissions}
                    icon={<FontAwesomeIcon icon={faListCheck} style={{ fontSize: 13, color: '#A3A3A3' }} />}
                />
                <StatCard
                    label="Accepted"
                    value={stats?.accepted}
                    icon={<FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 13, color: '#A3A3A3' }} />}
                />
                <StatCard
                    label="Acceptance Rate"
                    value={stats ? `${stats.accepted_rate}%` : null}
                    icon={<FontAwesomeIcon icon={faPercent} style={{ fontSize: 13, color: '#A3A3A3' }} />}
                />
                <StatCard
                    label="Avg Time Taken"
                    value={stats?.avg_time_taken_minutes ? `${stats.avg_time_taken_minutes} min` : null}
                    sub="accepted only"
                    icon={<FontAwesomeIcon icon={faClock} style={{ fontSize: 13, color: '#A3A3A3' }} />}
                />
            </div>

            {/* weak + strong */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 24
            }}>
                <WeakTopics />
                <StrongTopics />
            </div>

            {/* recommendations + insights */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16
            }}>
                <DailyRecommendations />
                <GitHubInsights />
            </div>
        </div>
    );
}
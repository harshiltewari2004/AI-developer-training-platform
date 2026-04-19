import { useEffect, useState } from "react";
import API from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faCircleCheck,
  faPercent,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import StatCard from '../components/ui/StatCard';
import WeakTopics from "../components/WeakTopics";
import StrongTopics from "../components/StrongTopics";
import DailyRecommendations from "../components/DailyRecommendations";
import GitHubInsights from "../components/GithubInsights";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/submissions/my/stats")
      .then((res) => setStats(res.data.stats))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] || user?.user} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Here's your training summary for today.
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={stats?.total_submissions}
          icon={faListCheck}
        />
        <StatCard
          title="Accepted"
          value={stats?.accepted}
          icon={faCircleCheck}
          color="text-green-500"
        />
        <StatCard
          title="Acceptance Rate"
          value={stats ? `${stats.accepted_rate}%` : null}
          icon={faPercent}
          color="text-blue-500"
        />
        <StatCard
          title="Avg Time Taken"
          value={
            stats?.avg_time_taken_minutes
              ? `${stats.avg_time_taken_minutes} min`
              : null
          }
          sub="accepted only"
          icon={faClock}
        />
      </div>
      {/* weak + strong topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeakTopics />
        <StrongTopics />
      </div>

      {/* recommendations + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyRecommendations />
        <GitHubInsights />
      </div>
    </div>
  );
}

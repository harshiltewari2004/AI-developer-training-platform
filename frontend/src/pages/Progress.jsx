import { useEffect, useState } from "react";
import API from "../api/axios";
import { Paper, Chip, CircularProgress } from "@mui/material";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";

// color based on accuracy value
const getColor = (accuracy) => {
  if (accuracy >= 70) return "#22c55e"; // green
  if (accuracy >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // red
};

const getLabel = (accuracy) => {
  if (accuracy >= 70) return { label: "Strong", color: "success" };
  if (accuracy >= 40) return { label: "Average", color: "warning" };
  return { label: "Weak", color: "error" };
};

// custom tooltip for bar chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm text-xs">
        <p className="font-medium text-gray-900 capitalize mb-1">{d.topic}</p>
        <p className="text-gray-500">
          Accuracy:{" "}
          <span
            className="font-semibold"
            style={{ color: getColor(d.accuracy) }}
          >
            {d.accuracy}%
          </span>
        </p>
        <p className="text-gray-500">Attempted: {d.attempted}</p>
        <p className="text-gray-500">Accepted: {d.accepted}</p>
      </div>
    );
  }
  return null;
};

export default function Progress() {
  const [topicData, setTopicData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [topicImprovement, setTopicImprovement] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicRes, progressRes, insightRes] = await Promise.all([
          API.get("/submissions/my/topic-accuracy"),
          API.get("/progress/my"),
          API.get("/progress/my/insights").catch(() => null),
        ]);

        const topics = (topicRes.data.topic_accuracy || []).map((t) => ({
          topic: t.topic,
          accuracy: parseFloat(t.accuracy),
          attempted: t.attempted,
          accepted: t.accepted,
        }));
        setTopicData(topics);

        const weekly = (progressRes.data.progress || []).map((w) => ({
          week: `W${w.week}`,
          accuracy: w.accuracy,
          attempted: w.attempted,
          accepted: w.accepted,
        }));
        setWeeklyData(weekly);

        // extract topic insights for improvement section
        if (insightRes?.data?.insights) {
          const topicInsights = insightRes.data.insights.filter((i) =>
            i.metric?.startsWith("topic_"),
          );
          setTopicImprovement(topicInsights);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress size={28} />
      </div>
    );

  const weakCount = topicData.filter((t) => t.accuracy < 40).length;
  const strongCount = topicData.filter((t) => t.accuracy >= 70).length;
  const averageCount = topicData.length - weakCount - strongCount;

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Topic Performance
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Your accuracy breakdown across all practiced topics.
        </p>
      </div>

      {/* summary chips */}
      <div className="flex gap-3 flex-wrap">
        <Chip
          icon={
            <FontAwesomeIcon
              icon={faArrowTrendUp}
              className="text-green-500 text-xs"
            />
          }
          label={`${strongCount} Strong`}
          size="small"
          sx={{ bgcolor: "#f0fdf4", color: "#16a34a", fontWeight: 500 }}
        />
        <Chip
          icon={
            <FontAwesomeIcon
              icon={faMinus}
              className="text-amber-500 text-xs"
            />
          }
          label={`${averageCount} Average`}
          size="small"
          sx={{ bgcolor: "#fffbeb", color: "#d97706", fontWeight: 500 }}
        />
        <Chip
          icon={
            <FontAwesomeIcon
              icon={faArrowTrendDown}
              className="text-red-500 text-xs"
            />
          }
          label={`${weakCount} Weak`}
          size="small"
          sx={{ bgcolor: "#fef2f2", color: "#dc2626", fontWeight: 500 }}
        />
      </div>

      {topicData.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ border: "1px solid #f3f4f6", borderRadius: 3, p: 4 }}
        >
          <p className="text-sm text-gray-400 text-center">
            No topic data yet. Start solving problems to see your performance
            here.
          </p>
        </Paper>
      ) : (
        <>
          {/* bar chart — accuracy per topic */}
          <Paper
            elevation={0}
            sx={{ border: "1px solid #f3f4f6", borderRadius: 3, p: 3 }}
          >
            <h2 className="text-sm font-medium text-gray-900 mb-6">
              Accuracy per Topic
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topicData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="topic"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {topicData.map((entry, i) => (
                    <Cell key={i} fill={getColor(entry.accuracy)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* radar chart — topic shape */}
          {topicData.length >= 3 && (
            <Paper
              elevation={0}
              sx={{ border: "1px solid #f3f4f6", borderRadius: 3, p: 3 }}
            >
              <h2 className="text-sm font-medium text-gray-900 mb-2">
                Topic Radar
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Shows your skill shape across all topics
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={topicData}>
                  <PolarGrid stroke="#f3f4f6" />
                  <PolarAngleAxis
                    dataKey="topic"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickCount={4}
                  />
                  <Radar
                    dataKey="accuracy"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, "Accuracy"]} />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* topic cards list */}
          <Paper
            elevation={0}
            sx={{ border: "1px solid #f3f4f6", borderRadius: 3, p: 3 }}
          >
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              Topic Breakdown
            </h2>
            <div className="space-y-4">
              {topicData
                .sort((a, b) => b.accuracy - a.accuracy)
                .map((t, i) => {
                  const { label, color } = getLabel(t.accuracy);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 capitalize font-medium">
                            {t.topic}
                          </span>
                          <Chip
                            label={label}
                            color={color}
                            size="small"
                            sx={{ height: 18, fontSize: 10 }}
                          />
                        </div>
                        <div className="text-right">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: getColor(t.accuracy) }}
                          >
                            {t.accuracy}%
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {t.accepted}/{t.attempted}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${t.accuracy}%`,
                            backgroundColor: getColor(t.accuracy),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Paper>

          {/* weekly accuracy trend */}
          {/* weekly accuracy trend — line chart */}
          {weeklyData.length > 0 && (
            <Paper
              elevation={0}
              sx={{ border: "1px solid #f3f4f6", borderRadius: 3, p: 3 }}
            >
              <h2 className="text-sm font-medium text-gray-900 mb-1">
                Weekly Accuracy Trend
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Your accuracy over the last {weeklyData.length} week
                {weeklyData.length !== 1 ? "s" : ""}
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={weeklyData}
                  margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value}${name === "accuracy" ? "%" : ""}`,
                      name === "accuracy"
                        ? "Accuracy"
                        : name === "attempted"
                          ? "Attempted"
                          : "Accepted",
                    ]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #f3f4f6",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attempted"
                    stroke="#e5e7eb"
                    strokeWidth={1.5}
                    dot={{ fill: "#e5e7eb", r: 3, strokeWidth: 0 }}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          )}
          {/* topic improvement week over week */}
          {topicImprovement.length > 0 && (
            <Paper
              elevation={0}
              sx={{ border: "1px solid #f3f4f6", borderRadius: 3, p: 3 }}
            >
              <h2 className="text-sm font-medium text-gray-900 mb-1">
                Topic Improvement
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                This week vs last week
              </p>
              <div className="space-y-3">
                {topicImprovement.map((insight, i) => {
                  const isImprovement = insight.type === "improvement";
                  const isDecline = insight.type === "decline";
                  const isNew = insight.type === "new";

                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border text-xs"
                      style={{
                        backgroundColor: isImprovement
                          ? "#f0fdf4"
                          : isDecline
                            ? "#fef2f2"
                            : "#f8fafc",
                        borderColor: isImprovement
                          ? "#bbf7d0"
                          : isDecline
                            ? "#fecaca"
                            : "#e2e8f0",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={
                          isImprovement
                            ? faArrowTrendUp
                            : isDecline
                              ? faArrowTrendDown
                              : faMinus
                        }
                        className="mt-0.5 shrink-0"
                        style={{
                          color: isImprovement
                            ? "#16a34a"
                            : isDecline
                              ? "#dc2626"
                              : "#94a3b8",
                        }}
                      />
                      <p
                        style={{
                          color: isImprovement
                            ? "#15803d"
                            : isDecline
                              ? "#b91c1c"
                              : "#64748b",
                        }}
                      >
                        {insight.insight}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Paper>
          )}

          {/* not enough data for improvement */}
          {topicImprovement.length === 0 && weeklyData.length < 2 && (
            <Paper
              elevation={0}
              sx={{ border: "1px solid #f3f4f6", borderRadius: 3, p: 3 }}
            >
              <h2 className="text-sm font-medium text-gray-900 mb-2">
                Topic Improvement
              </h2>
              <p className="text-xs text-gray-400">
                Keep practicing for 2 weeks to see your topic improvement trends
                here.
              </p>
            </Paper>
          )}
        </>
      )}
    </div>
  );
}

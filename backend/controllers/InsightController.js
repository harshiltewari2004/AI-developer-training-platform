const Submission = require("../models/Submission");
const WeeklyProgress = require("../models/WeeklyProgress");
const mongoose = require("mongoose");

// helper — get topic accuracy map for user
const getTopicAccuracyMap = async (userId) => {
  const topicAccuracy = await Submission.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "problems",
        localField: "problem",
        foreignField: "_id",
        as: "problemData",
      },
    },
    { $unwind: "$problemData" },
    { $unwind: "$problemData.topics" },
    {
      $lookup: {
        from: "topics",
        localField: "problemData.topics",
        foreignField: "_id",
        as: "topicData",
      },
    },
    { $unwind: "$topicData" },
    {
      $group: {
        _id: "$topicData.name",
        attempted: { $sum: 1 },
        accepted: {
          $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] },
        },
      },
    },
  ]);

  const map = {};
  topicAccuracy.forEach((t) => {
    map[t._id] = {
      attempted: t.attempted,
      accepted: t.accepted,
      accuracy: Math.round((t.accepted / t.attempted) * 100),
    };
  });
  return map;
};

// GET — generate all insights for the user
module.exports.generateInsights = async (req, res) => {
  try {
    const userId = req.userId;
    const insights = [];

    // fetch all data sources in parallel
    const [contributions, recentProgress, topicAccuracyMap] = await Promise.all(
      [
        ContributionAnalytics.findOne({ user: userId }),
        WeeklyProgress.find({ user: userId })
          .sort({ year: -1, week: -1 })
          .limit(2),
        getTopicAccuracyMap(userId),
      ],
    );

    const totalSubmissions = Object.values(topicAccuracyMap).reduce(
      (sum, t) => sum + t.attempted,
      0,
    );

    const totalAccepted = Object.values(topicAccuracyMap).reduce(
      (sum, t) => sum + t.accepted,
      0,
    );

    const overallAccuracy =
      totalSubmissions > 0
        ? Math.round((totalAccepted / totalSubmissions) * 100)
        : 0;
    const dataReadiness = {
      has_submissions: totalSubmissions > 0,
      has_contributions: !!contributions,
      has_weekly_progress: recentProgress.length > 0,
    };

    // tell the frontend what data is missing
    if (!dataReadiness.has_submissions) {
      return res.status(200).json({
        success: true,
        count: 0,
        data_readiness: dataReadiness,
        message:
          "Complete your profile to unlock insights: sync GitHub repos and log your first DSA submission.",
        insights: [],
      });
    }

    // ================================================================
    // PATTERN 2 — High activity but low problem-solving accuracy
    // ================================================================
    if (
      contributions &&
      contributions.consistency_score >= 50 &&
      overallAccuracy < 40
    ) {
      insights.push({
        type: "high_activity_low_accuracy",
        severity: "high",
        title: "High activity but low problem-solving accuracy",
        detail: `Your GitHub consistency score is ${contributions.consistency_score}% — you code regularly. But your overall DSA accuracy is only ${overallAccuracy}%. Recruiters test both. Active coders who can't solve algorithmic problems get filtered out early.`,
        action:
          "Spend 30 minutes daily on DSA — focus on Easy problems first to build confidence",
      });
    }
    // ================================================================
    // PATTERN 4 — Improving week over week
    // ================================================================
    if (recentProgress.length === 2) {
      const thisWeek = recentProgress[0];
      const lastWeek = recentProgress[1];
      const diff = thisWeek.accuracy - lastWeek.accuracy;

      if (diff >= 10) {
        insights.push({
          type: "weekly_improvement",
          severity: "positive",
          title: `Accuracy improved by ${diff}% this week`,
          detail: `Last week: ${lastWeek.accuracy}% → This week: ${thisWeek.accuracy}%. You are on an upward trajectory. Consistency at this rate will put you interview-ready in weeks, not months.`,
          action: "Keep the momentum — try one Medium problem today",
        });
      } else if (diff <= -10) {
        insights.push({
          type: "weekly_decline",
          severity: "medium",
          title: `Accuracy dropped by ${Math.abs(diff)}% this week`,
          detail: `Last week: ${lastWeek.accuracy}% → This week: ${thisWeek.accuracy}%. A drop often means you moved to harder topics too fast.`,
          action:
            "Go back to Easy problems in your weakest topic for 2–3 days to rebuild confidence",
        });
      }
    }

    // ================================================================
    // PATTERN 5 — Topic never attempted but required by top skill
    // ================================================================
    if (skills.length > 0) {
      const topSkill = skills[0];
      const required = getTopicsForSkill(topSkill.skill_name);
      const neverTried = required.filter((t) => !topicAccuracyMap[t]);

      if (neverTried.length > 0) {
        insights.push({
          type: "never_attempted_critical_topic",
          severity: "medium",
          title: `Never practiced ${neverTried[0]} — critical for your profile`,
          detail: `${neverTried[0]} is a required topic for ${topSkill.skill_name} developers but you have zero submissions in it. This is a blind spot that will hurt you in interviews.`,
          action: `Start with one Easy ${neverTried[0]} problem today`,
        });
      }
    }

    // ================================================================
    // PATTERN 6 — Well rounded profile (positive insight)
    // ================================================================
    const strongTopics = Object.entries(topicAccuracyMap).filter(
      ([_, data]) => data.accuracy >= 70,
    ).length;

    if (strongTopics >= 3 && overallAccuracy >= 60) {
      insights.push({
        type: "well_rounded",
        severity: "positive",
        title: "Well-rounded profile — strong in multiple areas",
        detail: `You have ${strongTopics} topics above 70% accuracy and an overall accuracy of ${overallAccuracy}%. Combined with your GitHub activity, this is a competitive profile for mid-level engineering roles.`,
        action:
          "Start targeting Hard problems to push toward senior-level readiness",
      });
    }

    // ================================================================
    // PATTERN 7 — High stars but low commits (many projects, low depth)
    // ================================================================
    if (contributions) {
      const { avg_stars_per_repo, avg_commits_per_repo } = contributions;
      if (avg_stars_per_repo >= 2 && avg_commits_per_repo < 15) {
        insights.push({
          type: "shallow_repos",
          severity: "medium",
          title: "Many starred repos but low average depth",
          detail: `Your repos average ${avg_stars_per_repo} stars but only ${avg_commits_per_repo} commits each. Recruiters looking at GitHub prefer fewer, deeper projects over many shallow ones.`,
          action:
            "Pick your best 2–3 repos and add meaningful commits — documentation, tests, features",
        });
      }
    }

    // ================================================================
    // PATTERN 8 — No submissions at all
    // ================================================================
    if (totalSubmissions === 0) {
      insights.push({
        type: "no_dsa_activity",
        severity: "high",
        title: "No DSA practice recorded yet",
        detail:
          "Your GitHub profile shows development activity but there are no problem submissions yet. DSA performance is the primary filter in most tech interviews.",
        action:
          "Start with 1 Easy problem today — Two Sum is a classic first problem",
      });
    }

    // sort by severity — high first, then medium, then positive
    const severityOrder = { high: 0, medium: 1, positive: 2 };
    insights.sort(
      (a, b) =>
        (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3),
    );

    res.status(200).json({
      success: true,
      count: insights.length,
      overall_accuracy: overallAccuracy,
      insights,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

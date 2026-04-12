const Submission = require('../models/Submission');
const WeeklyProgress = require('../models/WeeklyProgress');
const mongoose = require('mongoose');

// helper — get ISO week number and year from a date
const getWeekAndYear = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(
        ((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7
    );
    return { week, year: d.getFullYear() };
};

// POST — calculate and save weekly progress for current week
module.exports.saveWeeklyProgress = async (req, res) => {
    try {
        const userId = req.userId;
        const { week, year } = getWeekAndYear(new Date());

        // find start and end of current week
        const now = new Date();
        const dayOfWeek = now.getDay() || 7; // make Sunday = 7
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek + 1); // Monday
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sunday
        weekEnd.setHours(23, 59, 59, 999);

        // get all submissions from this week
        const submissions = await Submission.find({
            user: userId,
            createdAt: { $gte: weekStart, $lte: weekEnd }
        }).populate({
            path: 'problem',
            populate: { path: 'topics', select: 'name' }
        });

        const attempted = submissions.length;
        const accepted = submissions.filter(s => s.status === 'Accepted').length;
        const accuracy = attempted > 0
            ? Math.round((accepted / attempted) * 100)
            : 0;

        // build topic breakdown for this week
        const topicMap = {};
        submissions.forEach(submission => {
            const problem = submission.problem;
            if (!problem || !problem.topics) return;

            problem.topics.forEach(topic => {
                const name = topic.name;
                if (!topicMap[name]) {
                    topicMap[name] = { attempted: 0, accepted: 0 };
                }
                topicMap[name].attempted++;
                if (submission.status === 'Accepted') {
                    topicMap[name].accepted++;
                }
            });
        });

        const topic_breakdown = Object.entries(topicMap).map(([topic, data]) => ({
            topic,
            attempted: data.attempted,
            accepted: data.accepted,
            accuracy: Math.round((data.accepted / data.attempted) * 100)
        }));

        // upsert — update if exists, create if not
        const progress = await WeeklyProgress.findOneAndUpdate(
            { user: userId, week, year },
            { attempted, accepted, accuracy, topic_breakdown },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, progress });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — all weekly progress for logged in user
module.exports.getMyProgress = async (req, res) => {
    try {
        const progress = await WeeklyProgress.find({ user: req.userId })
            .sort({ year: 1, week: 1 }); // chronological order

        res.status(200).json({ success: true, progress });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — progress for a specific week
module.exports.getWeekProgress = async (req, res) => {
    try {
        const { week, year } = req.params;

        const progress = await WeeklyProgress.findOne({
            user: req.userId,
            week: parseInt(week),
            year: parseInt(year)
        });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: `No progress found for week ${week} of ${year}`
            });
        }

        res.status(200).json({ success: true, progress });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — last 4 weeks of progress (for dashboard chart)
module.exports.getRecentProgress = async (req, res) => {
    try {
        const progress = await WeeklyProgress.find({ user: req.userId })
            .sort({ year: -1, week: -1 })
            .limit(4);

        // reverse so it goes oldest to newest (better for charts)
        progress.reverse();

        res.status(200).json({ success: true, progress });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
module.exports.getAnalyticsInsights=async(req,res)=>{
    try{
        const userId = req.userId;
        const recentProgress = await WeeklyProgress.find({user:userId})
        .sort({year:-1,week:-1})
        .limit(2);

        if(recentProgress.length<2){
            return res.status(200).json({
                success:true,
                insights:[],
                message:'Not enough data yet. Keep submitting - insights will appear after your second week'
            });
        }

        const thisWeek = recentProgress[0];
        const lastWeek = recentProgress[1];

        const insights=[];

        const accuracyDiff = Math.round(thisWeek.accuracy-lastWeek.accuracy);
        if(accuracyDiff>0){
            insights.push({
                type:'improvement',
                metric:'overall_accuracy',
                insight:'Overall accuracy improved by ${accuracyDiff}%this week (${lastWeek.accuracy}%->${thisWeek.accuracy}%)'
            });
        }
        else if (accuracyDiff<0){
            insights.push({
                type: 'decline',
                metric: 'overall_accuracy',
                insight: `Overall accuracy dropped by ${Math.abs(accuracyDiff)}% this week (${lastWeek.accuracy}% → ${thisWeek.accuracy}%)`
            });
        }
        else{
                insights.push({
                type: 'neutral',
                metric: 'overall_accuracy',
                insight: `Overall accuracy stayed the same at ${thisWeek.accuracy}% this week`
            });
        }
        const attemptDiff = thisWeek.attempted-lastWeek.attempted;
        if(attemptDiff>0){
                insights.push({
                type: 'improvement',
                metric: 'volume',
                insight: `You attempted ${attemptDiff} more problems this week than last week`
            });
        }
        else if(attemptDiff<0){
                insights.push({
                type: 'decline',
                metric: 'volume',
                insight: `You attempted ${Math.abs(attemptDiff)} fewer problems this week than last week`
            });
        }

        const lastWeekTopicMap={};
                lastWeek.topic_breakdown.forEach(t => {
            lastWeekTopicMap[t.topic] = t;
        });

        thisWeek.topic_breakdown.forEach(thisTopicData => {
            const topicName = thisTopicData.topic;
            const lastTopicData = lastWeekTopicMap[topicName];

            // new topic this week — wasn't attempted last week
            if (!lastTopicData) {
                insights.push({
                    type: 'new',
                    metric: `topic_${topicName}`,
                    insight: `You started practicing ${topicName} this week with ${thisTopicData.accuracy}% accuracy`
                });
                return;
            }

            const topicDiff = Math.round(thisTopicData.accuracy - lastTopicData.accuracy);

            if (topicDiff > 0) {
                insights.push({
                    type: 'improvement',
                    metric: `topic_${topicName}`,
                    insight: `${topicName} accuracy improved by ${topicDiff}% (${lastTopicData.accuracy}% → ${thisTopicData.accuracy}%)`
                });
            } else if (topicDiff < 0) {
                insights.push({
                    type: 'decline',
                    metric: `topic_${topicName}`,
                    insight: `${topicName} accuracy dropped by ${Math.abs(topicDiff)}% (${lastTopicData.accuracy}% → ${thisTopicData.accuracy}%)`
                });
            } else {
                insights.push({
                    type: 'neutral',
                    metric: `topic_${topicName}`,
                    insight: `${topicName} accuracy stayed at ${thisTopicData.accuracy}% this week`
                });
            }
        });

        // ---- Best and worst topic this week ----
        if (thisWeek.topic_breakdown.length > 0) {
            const sorted = [...thisWeek.topic_breakdown].sort(
                (a, b) => b.accuracy - a.accuracy
            );

            const best = sorted[0];
            const worst = sorted[sorted.length - 1];

            insights.push({
                type: 'highlight',
                metric: 'best_topic',
                insight: `Your strongest topic this week is ${best.topic} at ${best.accuracy}% accuracy`
            });

            if (sorted.length > 1) {
                insights.push({
                    type: 'highlight',
                    metric: 'worst_topic',
                    insight: `Your weakest topic this week is ${worst.topic} at ${worst.accuracy}% accuracy — focus here next week`
                });
            }
        }

        // sort — improvements first, then declines, then neutral, then highlights
        const order = { improvement: 0, decline: 1, new: 2, neutral: 3, highlight: 4 };
        insights.sort((a, b) => order[a.type] - order[b.type]);

        res.status(200).json({
            success: true,
            period: {
                this_week: { week: thisWeek.week, year: thisWeek.year },
                last_week: { week: lastWeek.week, year: lastWeek.year }
            },
            count: insights.length,
            insights
        });

    }
    catch(error){
        res.status(500).json({ success: false, message: err.message });
    }
};
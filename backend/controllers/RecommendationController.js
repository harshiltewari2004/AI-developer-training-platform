const Submission = require('../models/Submission.js');
const Problem = require('../models/Problem.js');
const WeeklyProgress = require('../models/WeeklyProgress.js');
const mongoose = require('mongoose');

// helper — figure out recommended difficulty based on recent accuracy
const getRecommendedDifficulty = (accuracy) => {
    if (accuracy >= 70) return ['Medium', 'Hard'];   // doing well → push harder
    if (accuracy >= 40) return ['Easy', 'Medium'];   // average → mix
    return ['Easy'];                                  // struggling → start easy
};

// helper — get weak topics for this user
const getUserWeakTopics = async (userId) => {
    const submissions = await Submission.find({ user: userId })
        .populate({
            path: 'problem',
            populate: { path: 'topics', select: 'name _id' }
        });

    const topicMap = {};

    submissions.forEach(submission => {
        const problem = submission.problem;
        if (!problem || !problem.topics) return;

        problem.topics.forEach(topic => {
            const id = topic._id.toString();
            if (!topicMap[id]) {
                topicMap[id] = { name: topic.name, attempted: 0, accepted: 0 };
            }
            topicMap[id].attempted++;
            if (submission.status === 'Accepted') {
                topicMap[id].accepted++;
            }
        });
    });

    // return topic IDs where accuracy < 40%
    return Object.entries(topicMap)
        .filter(([_, data]) => {
            const accuracy = (data.accepted / data.attempted) * 100;
            return accuracy < 40;
        })
        .map(([id, data]) => ({ id, name: data.name }));
};

// helper — get problem IDs user already solved correctly
const getSolvedProblemIds = async (userId) => {
    const acceptedSubmissions = await Submission.find({
        user: userId,
        status: 'Accepted'
    }).distinct('problem'); // returns array of unique problem IDs

    return acceptedSubmissions.map(id => id.toString());
};

// GET — get daily recommended problems
module.exports.getDailyRecommendations = async (req, res) => {
    try {
        const userId = req.userId;
        const DAILY_LIMIT = parseInt(req.query.limit) || 5; // default 5 problems per day

        // step 1 — get weak topics
        const weakTopics = await getUserWeakTopics(userId);

        // step 2 — get recent accuracy to determine difficulty
        const recentProgress = await WeeklyProgress.find({ user: userId })
            .sort({ year: -1, week: -1 })
            .limit(1);

        const recentAccuracy = recentProgress.length > 0
            ? recentProgress[0].accuracy
            : 0; // new user — start with Easy

        const recommendedDifficulties = getRecommendedDifficulty(recentAccuracy);

        // step 3 — get problems user already solved
        const solvedIds = await getSolvedProblemIds(userId);

        let recommendations = [];

        // step 4 — if user has weak topics, prioritise those
        if (weakTopics.length > 0) {
            const weakTopicIds = weakTopics.map(t => t.id);

            const weakTopicProblems = await Problem.find({
                topics: { $in: weakTopicIds },           // matches weak topics
                difficulty: { $in: recommendedDifficulties }, // matches difficulty level
                _id: { $nin: solvedIds }                  // exclude already solved
            })
            .populate('topics', 'name')
            .limit(DAILY_LIMIT);

            recommendations = weakTopicProblems;
        }

        // step 5 — if not enough problems from weak topics, fill with general problems
        if (recommendations.length < DAILY_LIMIT) {
            const remaining = DAILY_LIMIT - recommendations.length;
            const existingIds = recommendations.map(p => p._id.toString());

            const fillerProblems = await Problem.find({
                difficulty: { $in: recommendedDifficulties },
                _id: {
                    $nin: [...solvedIds, ...existingIds] // exclude solved + already in list
                }
            })
            .populate('topics', 'name')
            .limit(remaining);

            recommendations = [...recommendations, ...fillerProblems];
        }

        // step 6 — if still not enough, relax difficulty filter completely
        if (recommendations.length < DAILY_LIMIT) {
            const remaining = DAILY_LIMIT - recommendations.length;
            const existingIds = recommendations.map(p => p._id.toString());

            const fallbackProblems = await Problem.find({
                _id: { $nin: [...solvedIds, ...existingIds] }
            })
            .populate('topics', 'name')
            .limit(remaining);

            recommendations = [...recommendations, ...fallbackProblems];
        }

        // build response with reason for each recommendation
        const result = recommendations.map(problem => {
            const problemTopicIds = problem.topics.map(t => t._id.toString());
            const matchedWeakTopics = weakTopics.filter(wt =>
                problemTopicIds.includes(wt.id)
            );

            let reason = '';
            if (matchedWeakTopics.length > 0) {
                reason = `Recommended to improve your weak topic: ${matchedWeakTopics.map(t => t.name).join(', ')}`;
            } else {
                reason = `Recommended based on your current difficulty level (${recommendedDifficulties.join(' / ')})`;
            }

            return {
                problem: {
                    _id: problem._id,
                    title: problem.title,
                    difficulty: problem.difficulty,
                    platform: problem.platform,
                    link: problem.link,
                    topics: problem.topics.map(t => t.name)
                },
                reason
            };
        });

        res.status(200).json({
            success: true,
            meta: {
                based_on_accuracy: recentAccuracy,
                recommended_difficulty: recommendedDifficulties,
                weak_topics_found: weakTopics.map(t => t.name),
                total_recommendations: result.length
            },
            recommendations: result
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — get recommendations for a specific topic
module.exports.getTopicRecommendations = async (req, res) => {
    try {
        const userId = req.userId;
        const { topicId } = req.params;
        const LIMIT = parseInt(req.query.limit) || 5;

        const solvedIds = await getSolvedProblemIds(userId);

        const problems = await Problem.find({
            topics: topicId,
            _id: { $nin: solvedIds }
        })
        .populate('topics', 'name')
        .limit(LIMIT);

        if (problems.length === 0) {
            return res.status(200).json({
                success: true,
                recommendations: [],
                message: 'No unsolved problems found for this topic'
            });
        }

        res.status(200).json({
            success: true,
            count: problems.length,
            recommendations: problems.map(p => ({
                problem: {
                    _id: p._id,
                    title: p.title,
                    difficulty: p.difficulty,
                    platform: p.platform,
                    link: p.link,
                    topics: p.topics.map(t => t.name)
                },
                reason: `Practice problem for this topic`
            }))
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
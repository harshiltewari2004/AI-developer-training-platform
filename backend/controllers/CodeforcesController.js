const axios = require('axios');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');
const Submission = require('../models/Submission');
const CodeforcesProfile = require('../models/CodeforcesProfile');
const { getTopicsFromCFTags } = require('../utils/codeforcesTagMap');

const CF_API = 'https://codeforces.com/api';

// helper — map CF verdict to your status enum
const mapVerdict = (verdict) => {
    const map = {
        'OK':                       'Accepted',
        'WRONG_ANSWER':             'Wrong Answer',
        'TIME_LIMIT_EXCEEDED':      'Time Limit Exceeded',
        'RUNTIME_ERROR':            'Runtime Error',
        'COMPILATION_ERROR':        'Compilation Error',
        'MEMORY_LIMIT_EXCEEDED':    'Runtime Error',
        'IDLENESS_LIMIT_EXCEEDED':  'Time Limit Exceeded',
        'CRASHED':                  'Runtime Error',
        'CHALLENGED':               'Wrong Answer',
        'FAILED':                   'Wrong Answer',
        'PARTIAL':                  'Wrong Answer',
        'SKIPPED':                  'Wrong Answer',
    };
    return map[verdict] || 'Wrong Answer';
};

// helper — get or create topic by name
const getOrCreateTopic = async (topicName) => {
    let topic = await Topic.findOne({ name: topicName.toLowerCase() });
    if (!topic) {
        topic = await Topic.create({ name: topicName.toLowerCase() });
    }
    return topic;
};

// helper — get or create problem from CF submission
const getOrCreateProblem = async (cfProblem, topicIds) => {
    const cfLink = `https://codeforces.com/problemset/problem/${cfProblem.contestId}/${cfProblem.index}`;

    // check if problem already exists by link
    let problem = await Problem.findOne({ link: cfLink });
    if (problem) return problem;

    // determine difficulty from CF rating
    let difficulty = 'Medium';
    if (cfProblem.rating) {
        if (cfProblem.rating <= 1200) difficulty = 'Easy';
        else if (cfProblem.rating >= 2000) difficulty = 'Hard';
    }

    // create new problem
    problem = await Problem.create({
        title: `${cfProblem.name}`,
        difficulty,
        platform: 'Codeforces',
        link: cfLink,
        topics: topicIds
    });

    return problem;
};

// POST — save codeforces handle
module.exports.saveHandle = async (req, res) => {
    try {
        const { handle } = req.body;
        if (!handle) {
            return res.status(400).json({ success: false, message: 'Handle is required' });
        }

        // verify handle exists on Codeforces
        const response = await axios.get(`${CF_API}/user.info?handles=${handle}`);
        if (response.data.status !== 'OK') {
            return res.status(400).json({ success: false, message: 'Codeforces handle not found' });
        }

        await User.findByIdAndUpdate(req.userId, { codeforces_handle: handle });
        res.status(200).json({
            success: true,
            message: `Handle "${handle}" saved successfully`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to verify handle. Check if it exists on Codeforces.' });
    }
};

// POST — full sync
module.exports.syncCodeforces = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user.codeforces_handle) {
            return res.status(400).json({
                success: false,
                message: 'No Codeforces handle found. Save it first via POST /codeforces/handle'
            });
        }

        const handle = user.codeforces_handle;

        // fetch all data in parallel
        const [profileRes, submissionsRes, ratingRes] = await Promise.all([
            axios.get(`${CF_API}/user.info?handles=${handle}`),
            axios.get(`${CF_API}/user.status?handle=${handle}`),
            axios.get(`${CF_API}/user.rating?handle=${handle}`)
        ]);

        if (profileRes.data.status !== 'OK') {
            return res.status(400).json({ success: false, message: 'Failed to fetch Codeforces profile' });
        }

        // ---- profile data ----
        const cfProfile = profileRes.data.result[0];

        // ---- contest history ----
        const contestHistory = ratingRes.data.status === 'OK'
            ? ratingRes.data.result.map(c => ({
                contestId: c.contestId,
                contestName: c.contestName,
                rank: c.rank,
                oldRating: c.oldRating,
                newRating: c.newRating,
                ratingChange: c.newRating - c.oldRating,
                date: new Date(c.ratingUpdateTimeSeconds * 1000)
            }))
            : [];

        const bestRank = contestHistory.length > 0
            ? Math.min(...contestHistory.map(c => c.rank))
            : null;

        const maxRatingChange = contestHistory.length > 0
            ? Math.max(...contestHistory.map(c => c.ratingChange))
            : 0;

        // ---- submissions ----
        const allSubmissions = submissionsRes.data.status === 'OK'
            ? submissionsRes.data.result
            : [];

        // filter out submissions without verdict (still judging)
        const validSubmissions = allSubmissions.filter(s => s.verdict && s.verdict !== 'TESTING');

        // count unique accepted problems
        const acceptedProblemKeys = new Set(
            validSubmissions
                .filter(s => s.verdict === 'OK')
                .map(s => `${s.problem.contestId}-${s.problem.index}`)
        );
        const problems_solved = acceptedProblemKeys.size;

        // tag performance
        const tagMap = {};
        validSubmissions.forEach(s => {
            (s.problem.tags || []).forEach(tag => {
                if (!tagMap[tag]) tagMap[tag] = { attempted: 0, accepted: 0 };
                tagMap[tag].attempted++;
                if (s.verdict === 'OK') tagMap[tag].accepted++;
            });
        });

        const tag_performance = Object.entries(tagMap).map(([tag, data]) => ({
            tag,
            attempted: data.attempted,
            accepted: data.accepted,
            accuracy: Math.round((data.accepted / data.attempted) * 100)
        }));

        // ---- save CF profile ----
        const savedProfile = await CodeforcesProfile.findOneAndUpdate(
            { user: userId },
            {
                user: userId,
                handle,
                rating: cfProfile.rating || 0,
                max_rating: cfProfile.maxRating || 0,
                rank: cfProfile.rank || 'unrated',
                max_rank: cfProfile.maxRank || 'unrated',
                avatar: cfProfile.avatar,
                problems_solved,
                total_submissions: validSubmissions.length,
                accepted_submissions: validSubmissions.filter(s => s.verdict === 'OK').length,
                contests_participated: contestHistory.length,
                best_rank: bestRank,
                max_rating_change: maxRatingChange,
                contest_history: contestHistory,
                tag_performance,
                last_synced: new Date()
            },
            { new: true, upsert: true }
        );

        // ---- sync submissions into your DB ----
        let synced = 0;
        let skipped = 0;
        let errors = 0;

        for (const sub of validSubmissions) {
            try {
                // skip if already synced
                const existing = await Submission.findOne({
                    user: userId,
                    cf_submission_id: sub.id
                });
                if (existing) { skipped++; continue; }

                // get topic IDs
                const cfTags = sub.problem.tags || [];
                const topicNames = getTopicsFromCFTags(cfTags);

                const topicIds = [];
                for (const name of topicNames) {
                    const topic = await getOrCreateTopic(name);
                    topicIds.push(topic._id);
                }

                // get or create problem
                const problem = await getOrCreateProblem(sub.problem, topicIds);

                // map verdict
                const status = mapVerdict(sub.verdict);

                // create submission
                await Submission.create({
                    user: userId,
                    problem: problem._id,
                    status,
                    time_taken: sub.timeConsumedMillis
                        ? Math.round(sub.timeConsumedMillis / 60000)  // ms to minutes
                        : null,
                    source: 'codeforces',
                    cf_submission_id: sub.id,
                    cf_language: sub.programmingLanguage
                });

                synced++;
            } catch (err) {
                errors++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Codeforces sync complete`,
            profile: savedProfile,
            sync_summary: {
                total_cf_submissions: validSubmissions.length,
                newly_synced: synced,
                already_existed: skipped,
                errors
            }
        });

    } catch (err) {
        console.error('Codeforces sync error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — codeforces profile
module.exports.getProfile = async (req, res) => {
    try {
        const profile = await CodeforcesProfile.findOne({ user: req.userId });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'No Codeforces data found. Run POST /codeforces/sync first.'
            });
        }
        res.status(200).json({ success: true, profile });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — contest history
module.exports.getContestHistory = async (req, res) => {
    try {
        const profile = await CodeforcesProfile.findOne({ user: req.userId })
            .select('handle rating max_rating rank contest_history');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'No Codeforces data found. Run POST /codeforces/sync first.'
            });
        }

        // sort newest first
        const sorted = [...profile.contest_history].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        res.status(200).json({
            success: true,
            handle: profile.handle,
            current_rating: profile.rating,
            max_rating: profile.max_rating,
            rank: profile.rank,
            contests_participated: sorted.length,
            contest_history: sorted
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — tag performance (how well user does per CF tag)
module.exports.getTagPerformance = async (req, res) => {
    try {
        const profile = await CodeforcesProfile.findOne({ user: req.userId })
            .select('tag_performance handle');

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'No Codeforces data found. Run POST /codeforces/sync first.'
            });
        }

        const sorted = [...profile.tag_performance]
            .sort((a, b) => b.attempted - a.attempted);

        res.status(200).json({
            success: true,
            handle: profile.handle,
            tag_performance: sorted
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — summary (for dashboard card)
module.exports.getSummary = async (req, res) => {
    try {
        const profile = await CodeforcesProfile.findOne({ user: req.userId })
            .select('handle rating max_rating rank max_rank problems_solved contests_participated best_rank last_synced');

        if (!profile) {
            return res.status(200).json({
                success: true,
                connected: false,
                message: 'Codeforces not connected yet.'
            });
        }

        res.status(200).json({
            success: true,
            connected: true,
            summary: {
                handle: profile.handle,
                rating: profile.rating,
                max_rating: profile.max_rating,
                rank: profile.rank,
                max_rank: profile.max_rank,
                problems_solved: profile.problems_solved,
                contests_participated: profile.contests_participated,
                best_rank: profile.best_rank,
                last_synced: profile.last_synced
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
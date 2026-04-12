const express = require('express');
const router = express.Router();
const { generateInsights } = require('../controllers/InsightController.js');
const { requireAuth } = require('../middleware/AuthMiddleware');

router.get('/generate', requireAuth, generateInsights);

router.get('/status', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const [skills, contributions, submissions, progress] = await Promise.all([
            Skill.countDocuments({ user: userId }),
            ContributionAnalytics.countDocuments({ user: userId }),
            Submission.countDocuments({ user: userId }),
            WeeklyProgress.countDocuments({ user: userId })
        ]);

        res.status(200).json({
            success: true,
            status: {
                github_synced:      skills > 0,
                skills_calculated:  skills > 0,
                contributions_calculated: contributions > 0,
                has_submissions:    submissions > 0,
                has_weekly_progress: progress > 0,
                ready_for_insights: skills > 0 && submissions > 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = router;
const express = require('express');
const router = express.Router();
const {
    saveGitHubToken,
    syncGitHubIntelligence,
    getActivity,
    getDeveloperScore,
    getGrowthInsights,
    getWeeklyProgress,
    getWeeklyTasks,
    getContributionAnalysis
} = require('../controllers/GitHubIntelligenceController');
const { requireAuth } = require('../middleware/AuthMiddleware');

router.post('/token',                   requireAuth, saveGitHubToken);
router.post('/sync',                    requireAuth, syncGitHubIntelligence);
router.get('/activity',                 requireAuth, getActivity);
router.get('/score',                    requireAuth, getDeveloperScore);
router.get('/insights',                 requireAuth, getGrowthInsights);
router.get('/weekly-progress',          requireAuth, getWeeklyProgress);
router.get('/weekly-tasks',             requireAuth, getWeeklyTasks);
router.get('/contribution-analysis',    requireAuth, getContributionAnalysis);

module.exports = router;
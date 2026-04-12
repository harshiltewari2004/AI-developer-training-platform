const express = require('express');
const router = express.Router();
const {
    saveHandle,
    syncCodeforces,
    getProfile,
    getContestHistory,
    getTagPerformance,
    getSummary
} = require('../controllers/CodeforcesController');
const { requireAuth } = require('../middleware/AuthMiddleware');

router.post('/handle',          requireAuth, saveHandle);
router.post('/sync',            requireAuth, syncCodeforces);
router.get('/profile',          requireAuth, getProfile);
router.get('/contests',         requireAuth, getContestHistory);
router.get('/tags',             requireAuth, getTagPerformance);
router.get('/summary',          requireAuth, getSummary);

module.exports = router;
const express = require('express');
const router = express.Router();

const{
    saveWeeklyProgress,
    getMyProgress,
    getWeekProgress,
    getRecentProgress,
    getAnalyticsInsights
} = require('../controllers/ProgressController.js');

const{requireAuth} = require('../middleware/AuthMiddleware.js');

router.post('/weekly',requireAuth,saveWeeklyProgress);
router.get('/my',requireAuth,getMyProgress);
router.get('/my/recent',requireAuth,getRecentProgress);
router.get('/my/:year/:week',requireAuth,getWeekProgress);
router.get('/my/insights',requireAuth,getAnalyticsInsights);

module.exports = router;
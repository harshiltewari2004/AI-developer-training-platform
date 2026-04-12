const express = require('express');
const router = express.Router();
const {
    getDailyRecommendations,
    getTopicRecommendations
} = require('../controllers/RecommendationController');
const { requireAuth } = require('../middleware/AuthMiddleware');

router.get('/daily',            requireAuth, getDailyRecommendations);
router.get('/topic/:topicId',   requireAuth, getTopicRecommendations);

module.exports = router;
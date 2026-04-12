const express = require('express');
const router = express.Router();
const{
    createSubmission,
    getMySubmissions,
    getSubmissionsForProblem,
    getMyStats,
    getTopicAccuracy,
    getWeakTopics,
    getStrongTopics
} = require('../controllers/SubmissionController.js');

const {requireAuth} = require('../middleware/AuthMiddleware.js');

router.post('/',requireAuth,createSubmission);
router.get('/my',requireAuth,getMySubmissions);
router.get('/my/stats',requireAuth,getMyStats);
router.get('/my/topic-accuracy',requireAuth,getTopicAccuracy);
router.get('/problem/:problemId',requireAuth,getSubmissionsForProblem);
router.get('/my/weak-topics',requireAuth,getWeakTopics);
router.get('/my/strong-topics',requireAuth,getStrongTopics);

module.exports = router;
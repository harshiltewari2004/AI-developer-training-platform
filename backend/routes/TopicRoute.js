const express = require('express');
const router = express.Router();

const{
    getTopics,
    createTopic,
    deleteTopic,
    addTopicToProblem,
    removeTopicFromProblem
} = require('../controllers/TopicController');

const{requireAuth} = require('../middleware/AuthMiddleware.js');

router.get('/',getTopics);
router.post('/',requireAuth,createTopic);
router.delete('/:id',requireAuth,deleteTopic);
router.post('/tag',requireAuth,addTopicToProblem);
router.delete('/tag',requireAuth,removeTopicFromProblem);

module.exports = router;
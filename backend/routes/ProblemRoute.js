const express = require('express');
const router = express.Router();
const{getProblem,getProblems,createProblem,updateProblem,deleteProblem} = require('../controllers/ProblemController');
const{requireAuth} = require('../middleware/AuthMiddleware.js');

router.get('/',getProblems);
router.get('/:id',getProblem);
router.post('/',requireAuth,createProblem);
router.put('/:id',requireAuth,updateProblem);
router.delete('/:id',requireAuth,deleteProblem);

module.exports = router;
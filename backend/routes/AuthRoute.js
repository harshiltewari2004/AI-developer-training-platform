const express = require('express');
const router = express.Router();
const { Signup, Login, githubLogin, githubCallBack, getMe, logout } = require('../controllers/AuthController');
const { userVerification,requireAuth } = require('../middleware/AuthMiddleware');

router.post('/signup', Signup);
router.post('/login', Login);
router.post('/verify', userVerification);
router.get('/me', requireAuth,getMe);
router.get('/github', githubLogin);
router.post('/logout', logout);
router.get('/github/callback', githubCallBack);
// call this from frontend to check if user is logged in

module.exports = router;
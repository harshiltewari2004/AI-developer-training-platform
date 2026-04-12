const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Used to verify a token and return user status (for frontend checks)
module.exports.userVerification = (req, res) => {
    let token = req.cookies.token;

    if(!token){
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) return res.json({ status: false });

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) return res.json({ status: false });

        const user = await User.findById(data.id);
        return user
            ? res.json({ status: true, user: user.name })
            : res.json({ status: false });
    });
};

// Used to protect routes — attach to any route that requires login
module.exports.requireAuth = (req, res, next) => {
    let token = req.cookies.token;

    if(!token){
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }
    if (!token) return res.status(401).json({ message: 'Unauthorized: No token' });

    jwt.verify(token, process.env.TOKEN_KEY, (err, data) => {
        if (err) return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        req.userId = data.id;
        next();
    });
};
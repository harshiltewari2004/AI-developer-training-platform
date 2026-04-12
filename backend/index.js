require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const connectDB = require('./config/db.js');

// routes
const authRoute               = require('./routes/AuthRoute.js');
const problemRoute            = require('./routes/ProblemRoute.js');
const topicRoute              = require('./routes/TopicRoute.js');
const submissionRoute         = require('./routes/SubmissionRoute.js');
const progressRoute           = require('./routes/ProgressRoute.js');
const recommendationRoute     = require('./routes/RecommendationRoute.js');
const insightsRoute           = require('./routes/InsightsRoute.js');
const gitHubIntelligenceRoute = require('./routes/GitHubIntelligenceRoute.js');
const codeforcesRoute            = require('./routes/CodeforcesRoute.js');

const app = express();

// database
connectDB();

// middleware
app.use(cors({
    origin: function(origin, callback) {
        const allowed = [
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.FRONTEND_URL
        ].filter(Boolean);

        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// health check
app.get('/', (req, res) => res.send('API is running'));

// problem solving section
app.use('/auth',            authRoute);
app.use('/problems',        problemRoute);
app.use('/topics',          topicRoute);
app.use('/submissions',     submissionRoute);
app.use('/progress',        progressRoute);
app.use('/recommendations', recommendationRoute);
app.use('/codeforces',      codeforcesRoute);

// github intelligence section
app.use('/insights',            insightsRoute);
app.use('/github-intelligence', gitHubIntelligenceRoute);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`
    });
});

// global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong on the server'
    });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const connectDB = require('../config/db');

const topics = ['arrays', 'graphs', 'trees', 'dynamic programming', 'greedy'];

const seed = async () => {
    await connectDB();
    for (const name of topics) {
        await Topic.findOneAndUpdate(
            { name },
            { name },
            { upsert: true }
        );
    }
    console.log('Topics seeded successfully');
    process.exit();
};

seed();
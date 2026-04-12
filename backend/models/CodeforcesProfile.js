const mongoose = require('mongoose');

const contestHistorySchema = new mongoose.Schema({
    contestId: Number,
    contestName: String,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    ratingChange: Number,
    date: Date
}, { _id: false });

const codeforcesProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    handle: {
        type: String,
        required: true
    },

    // current profile
    rating: { type: Number, default: 0 },
    max_rating: { type: Number, default: 0 },
    rank: { type: String, default: 'unrated' },
    max_rank: { type: String, default: 'unrated' },
    avatar: { type: String },

    // problem stats
    problems_solved: { type: Number, default: 0 },
    total_submissions: { type: Number, default: 0 },
    accepted_submissions: { type: Number, default: 0 },

    // contest stats
    contests_participated: { type: Number, default: 0 },
    best_rank: { type: Number, default: null },
    max_rating_change: { type: Number, default: 0 },

    // contest history
    contest_history: [contestHistorySchema],

    // tag performance — how well user does per topic
    tag_performance: [
        {
            tag: String,
            attempted: Number,
            accepted: Number,
            accuracy: Number
        }
    ],

    last_synced: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('CodeforcesProfile', codeforcesProfileSchema);
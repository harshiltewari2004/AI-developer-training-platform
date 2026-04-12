const mongoose = require('mongoose');

const developerScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // final score out of 100
    total_score: { type: Number, default: 0 },

    // individual component scores
    commit_score: { type: Number, default: 0 },       // max 25
    pr_score: { type: Number, default: 0 },           // max 25
    open_source_score: { type: Number, default: 0 },  // max 25
    consistency_score: { type: Number, default: 0 },  // max 25

    // score breakdown explanation
    breakdown: {
        commits: Number,
        prs_merged: Number,
        open_source_contributions: Number,
        consistency_percentage: Number
    },

    // label based on score
    label: {
        type: String,
        enum: [
            'Getting Started',
            'Active Learner',
            'Consistent Contributor',
            'Open Source Advocate',
            'Elite Developer'
        ],
        default: 'Getting Started'
    },

    last_calculated: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('DeveloperScore', developerScoreSchema);
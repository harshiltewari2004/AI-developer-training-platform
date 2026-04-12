const mongoose = require('mongoose');

const weeklyDevProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    week: { type: Number, required: true },
    year: { type: Number, required: true },

    commits: { type: Number, default: 0 },
    prs: { type: Number, default: 0 },
    issues_solved: { type: Number, default: 0 },
    open_source_contributions: { type: Number, default: 0 },

    // generated tasks for next week
    weekly_tasks: [
        {
            task: String,
            priority: { type: String, enum: ['high', 'medium', 'low'] }
        }
    ]

}, { timestamps: true });

weeklyDevProgressSchema.index({ user: 1, week: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyDevProgress', weeklyDevProgressSchema);
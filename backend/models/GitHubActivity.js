const mongoose = require('mongoose');

const gitHubActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // raw activity numbers
    total_repos: { type: Number, default: 0 },
    total_commits: { type: Number, default: 0 },
    total_stars: { type: Number, default: 0 },
    total_forks: { type: Number, default: 0 },

    // pull requests
    total_prs: { type: Number, default: 0 },
    prs_merged: { type: Number, default: 0 },
    prs_open: { type: Number, default: 0 },

    // issues
    total_issues: { type: Number, default: 0 },
    issues_closed: { type: Number, default: 0 },
    issues_open: { type: Number, default: 0 },

    // open source (repos not owned by user)
    open_source_repos_contributed: { type: Number, default: 0 },
    open_source_prs_merged: { type: Number, default: 0 },

    // monthly snapshot
    monthly_snapshot: {
        commits: { type: Number, default: 0 },
        prs: { type: Number, default: 0 },
        issues: { type: Number, default: 0 },
        month: { type: String }    // e.g. "2026-04"
    },

    // consistency
    active_days: { type: Number, default: 0 },
    total_days_tracked: { type: Number, default: 0 },
    consistency_score: { type: Number, default: 0 },   // percentage

    // top repos
    top_repos: [
        {
            name: String,
            url: String,
            stars: Number,
            forks: Number,
            commits: Number,
            language: String,
            is_fork: Boolean,
            description: String
        }
    ],

    // language breakdown
    language_breakdown: [
        {
            language: String,
            repo_count: Number,
            percentage: Number
        }
    ],

    last_synced: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('GitHubActivity', gitHubActivitySchema);
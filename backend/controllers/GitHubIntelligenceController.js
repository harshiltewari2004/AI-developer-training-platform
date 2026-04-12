const User = require('../models/User');
const GitHubActivity = require('../models/GitHubActivity');
const DeveloperScore = require('../models/DeveloperScore');
const WeeklyDevProgress = require('../models/WeeklyDevProgress');
const {
    fetchUserProfile,
    fetchPullRequests,
    fetchIssues
} = require('../utils/githubGraphQL');

// helper — get week number
const getWeekAndYear = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(
        ((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7
    );
    return { week, year: d.getFullYear() };
};

// helper — calculate developer score out of 100
const calculateDeveloperScore = (data) => {
    const {
        total_commits,
        prs_merged,
        open_source_prs_merged,
        open_source_repos_contributed,
        consistency_score
    } = data;

    // commit score — max 25 pts
    // 100+ commits = full score
    const commitScore = Math.min(25, Math.round((total_commits / 100) * 25));

    // PR score — max 25 pts
    // 20+ merged PRs = full score
    const prScore = Math.min(25, Math.round((prs_merged / 20) * 25));

    // open source score — max 25 pts
    // combination of PRs merged to other repos + repos contributed
    const osActivity = open_source_prs_merged + (open_source_repos_contributed * 2);
    const openSourceScore = Math.min(25, Math.round((osActivity / 30) * 25));

    // consistency score — max 25 pts
    // already a percentage, just scale to 25
    const consistencyPoints = Math.round((consistency_score / 100) * 25);

    const total = commitScore + prScore + openSourceScore + consistencyPoints;

    // label
    let label = 'Getting Started';
    if (total >= 80) label = 'Elite Developer';
    else if (total >= 60) label = 'Open Source Advocate';
    else if (total >= 40) label = 'Consistent Contributor';
    else if (total >= 20) label = 'Active Learner';

    return {
        total_score: total,
        commit_score: commitScore,
        pr_score: prScore,
        open_source_score: openSourceScore,
        consistency_score: consistencyPoints,
        label
    };
};

// helper — generate weekly tasks based on activity gaps
const generateWeeklyTasks = (activity) => {
    const tasks = [];

    if (activity.prs_merged < 5) {
        tasks.push({ task: 'Make 2 pull requests to any open source repo', priority: 'high' });
    }
    if (activity.open_source_repos_contributed < 3) {
        tasks.push({ task: 'Contribute to 1 open source repository', priority: 'high' });
    }
    if (activity.issues_closed < 5) {
        tasks.push({ task: 'Fix 2 issues in your repos or external repos', priority: 'medium' });
    }
    if (activity.consistency_score < 50) {
        tasks.push({ task: 'Code for at least 5 days this week', priority: 'high' });
    }
    if (activity.total_commits < 20) {
        tasks.push({ task: 'Make at least 10 commits this week', priority: 'medium' });
    }
    if (tasks.length === 0) {
        tasks.push({ task: 'Maintain your streak — keep contributing daily', priority: 'low' });
        tasks.push({ task: 'Review and merge any pending pull requests', priority: 'low' });
    }

    return tasks.slice(0, 4); // max 4 tasks per week
};

// helper — generate growth insights
const generateGrowthInsights = (activity) => {
    const insights = [];

    // consistency insight
    if (activity.consistency_score >= 70) {
        insights.push({
            type: 'positive',
            insight: 'You are consistent with commits — great coding habit'
        });
    } else if (activity.consistency_score >= 40) {
        insights.push({
            type: 'neutral',
            insight: `Your consistency score is ${activity.consistency_score}% — aim for daily contributions`
        });
    } else {
        insights.push({
            type: 'warning',
            insight: 'Low coding consistency — try to commit something every day, even small changes'
        });
    }

    // open source insight
    if (activity.open_source_repos_contributed === 0) {
        insights.push({
            type: 'warning',
            insight: 'No open source contributions yet — start with good-first-issue labels on GitHub'
        });
    } else if (activity.open_source_repos_contributed < 3) {
        insights.push({
            type: 'neutral',
            insight: `Low open-source contributions (${activity.open_source_repos_contributed} repos) — aim for at least 5`
        });
    } else {
        insights.push({
            type: 'positive',
            insight: `Active open source contributor — ${activity.open_source_repos_contributed} external repos contributed`
        });
    }

    // personal vs open source balance
    const osRatio = activity.total_repos > 0
        ? (activity.open_source_repos_contributed / activity.total_repos) * 100
        : 0;

    if (osRatio < 20) {
        insights.push({
            type: 'neutral',
            insight: 'Mostly working on personal projects — balance with open source contributions'
        });
    } else {
        insights.push({
            type: 'positive',
            insight: 'Good balance between personal projects and open source work'
        });
    }

    // PR insight
    if (activity.prs_merged === 0) {
        insights.push({
            type: 'warning',
            insight: 'No merged pull requests yet — start contributing PRs to build your profile'
        });
    } else if (activity.prs_merged >= 10) {
        insights.push({
            type: 'positive',
            insight: `Strong PR history — ${activity.prs_merged} PRs merged shows real collaborative development`
        });
    }

    // issue insight
    if (activity.issues_closed >= 5) {
        insights.push({
            type: 'positive',
            insight: `${activity.issues_closed} issues resolved — shows problem ownership`
        });
    }

    return insights;
};

// ================================================================
// ROUTES
// ================================================================

// POST — save GitHub PAT
module.exports.saveGitHubToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        await User.findByIdAndUpdate(req.userId, { github_pat: token });
        res.status(200).json({ success: true, message: 'GitHub token saved successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST — full sync using PAT
module.exports.syncGitHubIntelligence = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('+github_pat');

        if (!user.github_pat) {
            return res.status(400).json({
                success: false,
                message: 'No GitHub token found. Please save your GitHub PAT first via POST /github-intelligence/token'
            });
        }

        const token = user.github_pat;

        // fetch all data in parallel
        const [profileData, prData, issueData] = await Promise.all([
            fetchUserProfile(token),
            fetchPullRequests(token),
            fetchIssues(token)
        ]);

        const viewer = profileData.viewer;
        const repos = viewer.repositories.nodes;
        const contributions = viewer.contributionsCollection;
        const calendar = contributions.contributionCalendar;

        // ---- repos ----
        const total_repos = viewer.repositories.totalCount;
        const total_stars = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
        const total_forks = repos.reduce((sum, r) => sum + r.forkCount, 0);

        // ---- commits ----
        const total_commits = contributions.totalCommitContributions;

        // ---- consistency ----
        const allDays = calendar.weeks.flatMap(w => w.contributionDays);
        const total_days_tracked = allDays.length;
        const active_days = allDays.filter(d => d.contributionCount > 0).length;
        const consistency_score = Math.round((active_days / total_days_tracked) * 100);

        // ---- language breakdown ----
        const langMap = {};
        repos.forEach(repo => {
            if (repo.primaryLanguage?.name) {
                const lang = repo.primaryLanguage.name;
                langMap[lang] = (langMap[lang] || 0) + 1;
            }
        });
        const totalWithLang = Object.values(langMap).reduce((s, c) => s + c, 0);
        const language_breakdown = Object.entries(langMap)
            .map(([language, count]) => ({
                language,
                repo_count: count,
                percentage: Math.round((count / totalWithLang) * 100)
            }))
            .sort((a, b) => b.repo_count - a.repo_count);

        // ---- top repos ----
        const top_repos = repos
            .sort((a, b) => b.stargazerCount - a.stargazerCount)
            .slice(0, 6)
            .map(r => ({
                name: r.name,
                url: r.url,
                stars: r.stargazerCount,
                forks: r.forkCount,
                commits: r.defaultBranchRef?.target?.history?.totalCount || 0,
                language: r.primaryLanguage?.name || null,
                is_fork: r.isFork,
                description: r.description
            }));

        // ---- pull requests ----
        const allPRs = prData.viewer.pullRequests.nodes;
        const total_prs = prData.viewer.pullRequests.totalCount;
        const prs_merged = allPRs.filter(pr => pr.merged).length;
        const prs_open = allPRs.filter(pr => pr.state === 'OPEN').length;

        // open source PRs = PRs to repos not owned by viewer
        const viewerLogin = viewer.login;
        const open_source_prs_merged = allPRs.filter(
            pr => pr.merged && pr.repository.owner.login !== viewerLogin
        ).length;

        // ---- issues ----
        const allIssues = issueData.viewer.issues.nodes;
        const total_issues = issueData.viewer.issues.totalCount;
        const issues_closed = allIssues.filter(i => i.state === 'CLOSED').length;
        const issues_open = allIssues.filter(i => i.state === 'OPEN').length;

        // open source contributions = issues in repos not owned by viewer
        const open_source_repos_set = new Set(
            allPRs
                .filter(pr => pr.repository.owner.login !== viewerLogin)
                .map(pr => pr.repository.nameWithOwner)
        );
        const open_source_repos_contributed = open_source_repos_set.size;

        // ---- monthly snapshot ----
        const currentMonth = new Date().toISOString().slice(0, 7); // "2026-04"
        const monthStart = new Date(`${currentMonth}-01`);

        const monthly_commits = allDays
            .filter(d => new Date(d.date) >= monthStart)
            .reduce((sum, d) => sum + d.contributionCount, 0);

        const monthly_prs = allPRs.filter(
            pr => new Date(pr.createdAt) >= monthStart
        ).length;

        const monthly_issues = allIssues.filter(
            i => new Date(i.createdAt) >= monthStart
        ).length;

        // ---- save GitHubActivity ----
        const activityData = {
            user: userId,
            total_repos,
            total_commits,
            total_stars,
            total_forks,
            total_prs,
            prs_merged,
            prs_open,
            total_issues,
            issues_closed,
            issues_open,
            open_source_repos_contributed,
            open_source_prs_merged,
            monthly_snapshot: {
                commits: monthly_commits,
                prs: monthly_prs,
                issues: monthly_issues,
                month: currentMonth
            },
            active_days,
            total_days_tracked,
            consistency_score,
            top_repos,
            language_breakdown,
            last_synced: new Date()
        };

        const activity = await GitHubActivity.findOneAndUpdate(
            { user: userId },
            activityData,
            { new: true, upsert: true }
        );

        // ---- calculate developer score ----
        const scoreData = calculateDeveloperScore({
            total_commits,
            prs_merged,
            open_source_prs_merged,
            open_source_repos_contributed,
            consistency_score
        });

        const developerScore = await DeveloperScore.findOneAndUpdate(
            { user: userId },
            {
                user: userId,
                ...scoreData,
                breakdown: {
                    commits: total_commits,
                    prs_merged,
                    open_source_contributions: open_source_repos_contributed,
                    consistency_percentage: consistency_score
                },
                last_calculated: new Date()
            },
            { new: true, upsert: true }
        );

        // ---- save weekly dev progress ----
        const { week, year } = getWeekAndYear(new Date());
        const weekly_tasks = generateWeeklyTasks({
            prs_merged,
            open_source_repos_contributed,
            issues_closed,
            consistency_score,
            total_commits: monthly_commits
        });

        await WeeklyDevProgress.findOneAndUpdate(
            { user: userId, week, year },
            {
                user: userId,
                week,
                year,
                commits: monthly_commits,
                prs: monthly_prs,
                issues_solved: issues_closed,
                open_source_contributions: open_source_repos_contributed,
                weekly_tasks
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'GitHub Intelligence synced successfully',
            activity,
            developer_score: developerScore,
            weekly_tasks
        });

    } catch (err) {
        console.error('GitHub Intelligence sync error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — full activity data
module.exports.getActivity = async (req, res) => {
    try {
        const activity = await GitHubActivity.findOne({ user: req.userId });
        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'No data found. Run POST /github-intelligence/sync first.'
            });
        }
        res.status(200).json({ success: true, activity });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — developer score
module.exports.getDeveloperScore = async (req, res) => {
    try {
        const score = await DeveloperScore.findOne({ user: req.userId });
        if (!score) {
            return res.status(404).json({
                success: false,
                message: 'No score found. Run POST /github-intelligence/sync first.'
            });
        }
        res.status(200).json({ success: true, developer_score: score });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — growth insights
module.exports.getGrowthInsights = async (req, res) => {
    try {
        const activity = await GitHubActivity.findOne({ user: req.userId });
        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'No data found. Run POST /github-intelligence/sync first.'
            });
        }
        const insights = generateGrowthInsights(activity);
        res.status(200).json({ success: true, count: insights.length, insights });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — weekly dev progress history
module.exports.getWeeklyProgress = async (req, res) => {
    try {
        const progress = await WeeklyDevProgress.find({ user: req.userId })
            .sort({ year: -1, week: -1 })
            .limit(12); // last 12 weeks
        res.status(200).json({ success: true, progress });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — this week's tasks
module.exports.getWeeklyTasks = async (req, res) => {
    try {
        const { week, year } = getWeekAndYear(new Date());
        const progress = await WeeklyDevProgress.findOne({
            user: req.userId, week, year
        });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'No tasks for this week. Run POST /github-intelligence/sync to generate tasks.'
            });
        }

        res.status(200).json({
            success: true,
            week,
            year,
            tasks: progress.weekly_tasks
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET — contribution analysis (monthly breakdown)
module.exports.getContributionAnalysis = async (req, res) => {
    try {
        const activity = await GitHubActivity.findOne({ user: req.userId });
        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'No data found. Run POST /github-intelligence/sync first.'
            });
        }

        res.status(200).json({
            success: true,
            contribution_analysis: {
                this_month: {
                    month: activity.monthly_snapshot.month,
                    commits: activity.monthly_snapshot.commits,
                    prs: activity.monthly_snapshot.prs,
                    issues: activity.monthly_snapshot.issues
                },
                open_source: {
                    prs_merged: activity.open_source_prs_merged,
                    issues_solved: activity.issues_closed,
                    repos_contributed: activity.open_source_repos_contributed
                },
                consistency: {
                    active_days: activity.active_days,
                    total_days: activity.total_days_tracked,
                    score: activity.consistency_score
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
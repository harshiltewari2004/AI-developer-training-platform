const axios = require('axios');

const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

// helper — make a GraphQL request with user's PAT
const graphql = async (token, query, variables = {}) => {
    const response = await axios.post(
        GITHUB_GRAPHQL,
        { query, variables },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
    }
    return response.data.data;
};

// fetch basic profile + repo stats
module.exports.fetchUserProfile = async (token) => {
    const query = `
        query {
            viewer {
                login
                name
                avatarUrl
                repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: UPDATED_AT, direction: DESC}) {
                    totalCount
                    nodes {
                        name
                        url
                        stargazerCount
                        forkCount
                        isFork
                        description
                        primaryLanguage { name }
                        defaultBranchRef {
                            target {
                                ... on Commit {
                                    history(first: 1) {
                                        totalCount
                                    }
                                }
                            }
                        }
                    }
                }
                contributionsCollection {
                    totalCommitContributions
                    totalPullRequestContributions
                    totalIssueContributions
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                            }
                        }
                    }
                }
            }
        }
    `;
    return graphql(token, query);
};

// fetch PR data
module.exports.fetchPullRequests = async (token) => {
    const query = `
        query {
            viewer {
                pullRequests(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
                    totalCount
                    nodes {
                        state
                        merged
                        repository {
                            owner { login }
                            nameWithOwner
                        }
                        createdAt
                        mergedAt
                    }
                }
            }
        }
    `;
    return graphql(token, query);
};

// fetch issues data
module.exports.fetchIssues = async (token) => {
    const query = `
        query {
            viewer {
                issues(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
                    totalCount
                    nodes {
                        state
                        repository {
                            owner { login }
                            nameWithOwner
                        }
                        createdAt
                        closedAt
                    }
                }
            }
        }
    `;
    return graphql(token, query);
};
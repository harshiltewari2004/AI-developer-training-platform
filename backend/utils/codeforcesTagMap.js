// Codeforces tag → your topic name
const CF_TAG_TO_TOPIC = {
    // arrays / data structures
    'arrays':               'arrays',
    'data structures':      'arrays',
    'implementation':       'arrays',
    'brute force':          'arrays',
    'two pointers':         'arrays',
    'sliding window':       'arrays',
    'sorting':              'arrays',
    'binary search':        'arrays',

    // graphs
    'graphs':               'graphs',
    'graph matchings':      'graphs',
    'shortest paths':       'graphs',
    'dfs and similar':      'graphs',
    'trees':                'trees',
    'dsu':                  'graphs',
    'flows':                'graphs',

    // dynamic programming
    'dp':                   'dynamic programming',
    'dynamic programming':  'dynamic programming',
    'bitmask dp':           'dynamic programming',

    // greedy
    'greedy':               'greedy',
    'constructive algorithms': 'greedy',

    // math
    'math':                 'math',
    'number theory':        'math',
    'combinatorics':        'math',
    'probabilities':        'math',
    'geometry':             'math',

    // strings
    'strings':              'strings',
    'string suffix structures': 'strings',
    'hashing':              'strings',

    // recursion / divide and conquer
    'divide and conquer':   'recursion',
    'recursion':            'recursion',

    // backtracking
    'backtracking':         'backtracking',

    // bit manipulation
    'bitmasks':             'bit manipulation',

    // stack / queue
    'stack':                'stack',
    'queue':                'queue',
};

// get your topic name from a CF tag
// returns null if no mapping found
module.exports.mapCFTagToTopic = (cfTag) => {
    return CF_TAG_TO_TOPIC[cfTag.toLowerCase()] || null;
};

// get all unique topic names from an array of CF tags
module.exports.getTopicsFromCFTags = (cfTags) => {
    const topics = new Set();
    cfTags.forEach(tag => {
        const mapped = CF_TAG_TO_TOPIC[tag.toLowerCase()];
        if (mapped) topics.add(mapped);
    });
    return [...topics];
};
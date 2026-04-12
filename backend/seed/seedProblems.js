require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Topic = require('../models/Topic');

const topics = [
  'Array', 'String', 'Linked List', 'Stack', 'Queue',
  'Binary Search', 'Sorting', 'Recursion', 'Dynamic Programming',
  'Tree', 'Graph', 'Hashing', 'Two Pointers', 'Sliding Window', 'Greedy'
];

const problems = [
  // --- Easy ---
  { title: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/two-sum/', topics: ['Array', 'Hashing'] },
  { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', topics: ['Array', 'Sliding Window'] },
  { title: 'Contains Duplicate', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/contains-duplicate/', topics: ['Array', 'Hashing'] },
  { title: 'Valid Anagram', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/valid-anagram/', topics: ['String', 'Hashing'] },
  { title: 'Valid Parentheses', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/valid-parentheses/', topics: ['Stack', 'String'] },
  { title: 'Reverse Linked List', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/reverse-linked-list/', topics: ['Linked List'] },
  { title: 'Merge Two Sorted Lists', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/merge-two-sorted-lists/', topics: ['Linked List', 'Sorting'] },
  { title: 'Maximum Subarray', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/maximum-subarray/', topics: ['Array', 'Dynamic Programming'] },
  { title: 'Climbing Stairs', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/climbing-stairs/', topics: ['Dynamic Programming', 'Recursion'] },
  { title: 'Binary Search', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/binary-search/', topics: ['Binary Search', 'Array'] },
  { title: 'Flood Fill', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/flood-fill/', topics: ['Graph', 'Recursion'] },
  { title: 'Majority Element', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/majority-element/', topics: ['Array', 'Hashing'] },
  { title: 'Move Zeroes', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/move-zeroes/', topics: ['Array', 'Two Pointers'] },
  { title: 'Palindrome Number', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/palindrome-number/', topics: ['String'] },
  { title: 'Roman to Integer', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/roman-to-integer/', topics: ['String', 'Hashing'] },
  { title: 'Linked List Cycle', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/linked-list-cycle/', topics: ['Linked List', 'Two Pointers'] },
  { title: 'Invert Binary Tree', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/invert-binary-tree/', topics: ['Tree', 'Recursion'] },
  { title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', topics: ['Tree', 'Recursion'] },
  { title: 'Symmetric Tree', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/symmetric-tree/', topics: ['Tree', 'Recursion'] },
  { title: 'Single Number', difficulty: 'Easy', platform: 'LeetCode', link: 'https://leetcode.com/problems/single-number/', topics: ['Array', 'Hashing'] },
  { title: 'Counting Soldiers', difficulty: 'Easy', platform: 'Codeforces', link: 'https://codeforces.com/problemset/problem/546/A', topics: ['Array', 'Sorting'] },
  { title: 'Ultra-Fast Mathematician', difficulty: 'Easy', platform: 'Codeforces', link: 'https://codeforces.com/problemset/problem/61/A', topics: ['Array', 'String'] },
  { title: 'Theatre Square', difficulty: 'Easy', platform: 'Codeforces', link: 'https://codeforces.com/problemset/problem/1/A', topics: ['Greedy'] },
  { title: 'Way Too Long Words', difficulty: 'Easy', platform: 'Codeforces', link: 'https://codeforces.com/problemset/problem/71/A', topics: ['String'] },
  { title: 'Helpful Maths', difficulty: 'Easy', platform: 'Codeforces', link: 'https://codeforces.com/problemset/problem/339/A', topics: ['String', 'Sorting'] },

  // --- Medium ---
  { title: 'Group Anagrams', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/group-anagrams/', topics: ['String', 'Hashing'] },
  { title: 'Top K Frequent Elements', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/top-k-frequent-elements/', topics: ['Array', 'Hashing', 'Sorting'] },
  { title: 'Product of Array Except Self', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/product-of-array-except-self/', topics: ['Array'] },
  { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', topics: ['String', 'Sliding Window', 'Hashing'] },
  { title: 'Longest Consecutive Sequence', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/longest-consecutive-sequence/', topics: ['Array', 'Hashing'] },
  { title: '3Sum', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/3sum/', topics: ['Array', 'Two Pointers', 'Sorting'] },
  { title: 'Container With Most Water', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/container-with-most-water/', topics: ['Array', 'Two Pointers', 'Greedy'] },
  { title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', topics: ['Array', 'Binary Search'] },
  { title: 'Search in Rotated Sorted Array', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', topics: ['Array', 'Binary Search'] },
  { title: 'Add Two Numbers', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/add-two-numbers/', topics: ['Linked List'] },
  { title: 'Remove Nth Node From End of List', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', topics: ['Linked List', 'Two Pointers'] },
  { title: 'Reorder List', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/reorder-list/', topics: ['Linked List', 'Two Pointers'] },
  { title: 'Min Stack', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/min-stack/', topics: ['Stack'] },
  { title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', topics: ['Stack', 'Array'] },
  { title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', topics: ['Tree', 'Queue'] },
  { title: 'Binary Tree Right Side View', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/binary-tree-right-side-view/', topics: ['Tree', 'Queue'] },
  { title: 'Validate Binary Search Tree', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/validate-binary-search-tree/', topics: ['Tree', 'Recursion'] },
  { title: 'Kth Smallest Element in a BST', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', topics: ['Tree', 'Binary Search'] },
  { title: 'Number of Islands', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/number-of-islands/', topics: ['Graph', 'Recursion'] },
  { title: 'Clone Graph', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/clone-graph/', topics: ['Graph'] },
  { title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', topics: ['Graph'] },
  { title: 'Coin Change', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/coin-change/', topics: ['Dynamic Programming'] },
  { title: 'Longest Increasing Subsequence', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/longest-increasing-subsequence/', topics: ['Dynamic Programming', 'Binary Search'] },
  { title: 'Unique Paths', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/unique-paths/', topics: ['Dynamic Programming'] },
  { title: 'Jump Game', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/jump-game/', topics: ['Greedy', 'Dynamic Programming'] },
  { title: 'Maximum Product Subarray', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/maximum-product-subarray/', topics: ['Array', 'Dynamic Programming'] },
  { title: 'Spiral Matrix', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/spiral-matrix/', topics: ['Array'] },
  { title: 'Rotate Image', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/rotate-image/', topics: ['Array'] },
  { title: 'Set Matrix Zeroes', difficulty: 'Medium', platform: 'LeetCode', link: 'https://leetcode.com/problems/set-matrix-zeroes/', topics: ['Array'] },
  { title: 'Subarray Sum Equals K', difficulty: 'Medium', platform: 'Codeforces', link: 'https://leetcode.com/problems/subarray-sum-equals-k/', topics: ['Array', 'Hashing'] },
  { title: 'Nearest Lesser Values', difficulty: 'Medium', platform: 'Codeforces', link: 'https://codeforces.com/problemset/problem/547/C', topics: ['Stack', 'Array'] },
  { title: 'Forming Teams', difficulty: 'Medium', platform: 'Codeforces', link: 'https://codeforces.com/problemset/problem/216/A', topics: ['Greedy'] },
  { title: 'Queue on a Tree', difficulty: 'Medium', platform: 'Codeforces', link: 'https://codeforces.com/problemset/problem/368/C', topics: ['Tree', 'Queue'] },

  // --- Hard ---
  { title: 'Minimum Window Substring', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/minimum-window-substring/', topics: ['String', 'Sliding Window', 'Hashing'] },
  { title: 'Sliding Window Maximum', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/sliding-window-maximum/', topics: ['Sliding Window', 'Queue'] },
  { title: 'Trapping Rain Water', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/trapping-rain-water/', topics: ['Array', 'Two Pointers', 'Stack'] },
  { title: 'Merge K Sorted Lists', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/merge-k-sorted-lists/', topics: ['Linked List', 'Sorting'] },
  { title: 'LRU Cache', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/lru-cache/', topics: ['Hashing', 'Linked List'] },
  { title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', topics: ['Tree', 'Dynamic Programming'] },
  { title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', topics: ['Tree', 'String'] },
  { title: 'Word Search II', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/word-search-ii/', topics: ['Graph', 'Recursion', 'String'] },
  { title: 'Course Schedule II', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/course-schedule-ii/', topics: ['Graph'] },
  { title: 'Alien Dictionary', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/alien-dictionary/', topics: ['Graph', 'String'] },
  { title: 'Edit Distance', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/edit-distance/', topics: ['Dynamic Programming', 'String'] },
  { title: 'Regular Expression Matching', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/regular-expression-matching/', topics: ['Dynamic Programming', 'String', 'Recursion'] },
  { title: 'Burst Balloons', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/burst-balloons/', topics: ['Dynamic Programming'] },
  { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', topics: ['Array', 'Binary Search'] },
  { title: 'Largest Rectangle in Histogram', difficulty: 'Hard', platform: 'LeetCode', link: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', topics: ['Stack', 'Array'] },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to MongoDB');

  // 1. Upsert all topics and build a name → ObjectId map
  const topicMap = {};
  for (const name of topics) {
    const topic = await Topic.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true }
    );
    topicMap[name] = topic._id;
  }
  console.log(`✔ ${topics.length} topics ready`);

  // 2. Upsert problems by title (safe to re-run without duplicates)
  let inserted = 0, updated = 0;
  for (const p of problems) {
    const topicIds = (p.topics || []).map(t => topicMap[t]);
    const result = await Problem.findOneAndUpdate(
      { title: p.title },
      { ...p, topics: topicIds },
      { upsert: true, new: true, rawResult: true }
    );
    result.lastErrorObject?.updatedExisting ? updated++ : inserted++;
  }

  console.log(`✔ ${inserted} problems inserted, ${updated} updated`);
  console.log('Seeding complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
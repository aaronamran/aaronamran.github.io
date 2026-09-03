---
title: 'Longest Consecutive Numbers in an Array'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Longest Consecutive Numbers in an Array</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array of integers, find the size of the largest subset of consecutive integers. The order of elements doesn't matter, as they can be rearranged to form the consecutive sequence, and the array may contain duplicate values.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains a single integer <code>N</code> — the number of elements in the array.</li>
    <li>The next line contains <code>N</code> space-separated integers representing the elements of the array.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print a single integer — the size of the longest consecutive sequence.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>nums.length</code> ≤ 100,000</li>
    <li>-10<sup>9</sup> ≤ <code>nums[i]</code> ≤ 10<sup>9</sup></li>
    <li>Duplicate values may exist.</li>
</ul>

<h4 class="mb-3">Input</h4>

```
3
5
15 12 14 16 13
7
50 3 2 1 4 9 6
6
100 300 101 103 102 105
```

<h4 class="mb-3">Output</h4>

```
5
4
4
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int longestConsecutive(vector<int>& nums) {
    if (nums.empty()) return 0;

    // Use a hash set for O(1) average lookups, and to deduplicate values
    unordered_set<int> s(nums.begin(), nums.end());
    int longest = 0;

    for (int num : s) {
        // Only start counting from the beginning of a sequence:
        // if 'num - 1' exists in the set, num is not a sequence start
        if (s.find(num - 1) == s.end()) {
            int currentNum = num;
            int currentLength = 1;

            // Walk forward as far as the consecutive run continues
            while (s.find(currentNum + 1) != s.end()) {
                currentNum++;
                currentLength++;
            }

            longest = max(longest, currentLength);
        }
    }

    return longest;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;

        // Use a vector instead of a VLA to protect stack memory
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];

        cout << longestConsecutive(nums) << '\n'; // '\n' is significantly faster than endl
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">A maximal run of consecutive integers like <code>12, 13, 14, 15, 16</code> always has a unique starting point — the smallest value in the run, which is exactly the one value <code>v</code> for which <code>v - 1</code> is not present anywhere in the array. If every value is checked as a potential sequence start only when its predecessor is missing, then each maximal run gets counted exactly once, from its true beginning, rather than being recounted repeatedly from every one of its interior elements. Once a run's start is identified, simply walking forward (checking <code>v+1</code>, then <code>v+2</code>, and so on) while each successor exists measures that run's full length.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code first loads all values into an <code>unordered_set</code>, which both deduplicates the input and gives O(1) average-time membership checks. It then iterates over the distinct values in the set; for each value <code>num</code>, it checks whether <code>num - 1</code> is present. If it is, <code>num</code> is somewhere in the middle or end of a run rather than its start, so it's skipped — this run will already get fully counted when its true starting value is reached during the iteration. If <code>num - 1</code> is absent, <code>num</code> is confirmed to be a sequence start, and the code repeatedly checks for <code>currentNum + 1</code> in the set, extending <code>currentLength</code> for as long as the next consecutive value exists. The running maximum <code>longest</code> is updated after each run is fully measured.</p>
<p class="mb-2">Because every element is only ever walked forward from its run's start, and never re-walked from an interior point, the total work across all runs combined stays linear in the size of the set rather than quadratic.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2"><code>unordered_set</code> is preferred over a sorted structure here since only fast membership testing is needed and no ordering is required, giving average O(1) lookups instead of O(log N).</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>N = 100,000</code> elements per test case.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> average time, since the inner <code>while</code> loop across all iterations collectively visits each element of the set at most once overall, and uses <code>O(N)</code> space for the hash set, comfortably satisfying the problem's constraints.</p>


</div>
</div>
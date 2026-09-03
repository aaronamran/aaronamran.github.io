---
title: 'Merge Overlapping intervals'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Merge Overlapping intervals</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given a list of intervals, where each interval is represented as a pair of integers <code>[start, end]</code>. Merge all overlapping intervals and return a list of non-overlapping intervals that cover all the intervals in the input. Intervals may be given in any order, and intervals that touch at the endpoints (e.g., <code>[1,4]</code> and <code>[4,5]</code>) are considered overlapping. The output should be sorted by start value.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case:
    <ul>
        <li>The first line contains a single integer <code>N</code> — the number of intervals.</li>
        <li>The next <code>N</code> lines each contain two space-separated integers <code>start</code> and <code>end</code>, denoting one interval.</li>
    </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print the merged intervals on a single line, each in the form <code>[start,end]</code>, separated by a space.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>0 ≤ <code>T</code> ≤ 100</li>
    <li>1 ≤ number of intervals per test case ≤ 10<sup>5</sup></li>
    <li>0 ≤ <code>start</code> ≤ <code>end</code> ≤ 10<sup>5</sup></li>
    <li>Intervals may overlap or be disjoint</li>
</ul>
<h4 class="mb-3">Input</h4>

```
1
4
1 5
3 7
8 10
9 12
```

<h4 class="mb-3">Output</h4>

```
[1,7] [8,12]
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N log N) per test case &nbsp;•&nbsp; Space O(N) per test case</p>

```C++
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) return {};

        // 1. Sort intervals primarily by start time (default behavior of vector sort)
        sort(intervals.begin(), intervals.end());

        vector<vector<int>> merged;
        // 2. Start with the first interval
        merged.push_back(intervals[0]);

        // 3. Iterate through the sorted intervals
        for (int i = 1; i < intervals.size(); ++i) {
            // Check if current interval overlaps with the last added interval
            // Access the last element in 'merged'
            if (intervals[i][0] <= merged.back()[1]) {
                // There is an overlap, merge by extending the end time
                merged.back()[1] = max(merged.back()[1], intervals[i][1]);
            } else {
                // No overlap, add the current interval to the list
                merged.push_back(intervals[i]);
            }
        }

        return merged;
    }
};
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Two intervals <code>[a, b]</code> and <code>[c, d]</code> overlap (or touch) precisely when <code>c &le; b</code>, assuming they're already ordered so <code>a &le; c</code>. Once intervals are sorted by their start values, any interval that overlaps with the current merged group must do so with the most recently merged interval specifically — it cannot "skip over" it to overlap only with an earlier one, since starts are processed in non-decreasing order. This means a single left-to-right scan, comparing each interval only against the last interval merged so far, is sufficient to correctly group every overlapping run together.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code first sorts <code>intervals</code> using the default lexicographic ordering of <code>vector&lt;int&gt;</code>, which sorts primarily by the start value (and by end value as a tiebreaker, though that tiebreak doesn't affect correctness here). It then seeds the result vector <code>merged</code> with the first sorted interval and scans through the rest:</p>
<ul>
    <li>If the current interval's start (<code>intervals[i][0]</code>) is <code>&le;</code> the end of the last merged interval (<code>merged.back()[1]</code>), the two overlap or touch, so the last merged interval's end is extended to <code>max(merged.back()[1], intervals[i][1])</code> — the <code>max</code> is necessary because a later interval, despite starting after the current group, could still end earlier than the group's current end (e.g., a small interval fully contained within a larger one), so the end must never be allowed to shrink.</li>
    <li>Otherwise, the current interval starts strictly after the last merged interval ends, so it cannot overlap with anything already merged (by the sorted-order argument above), and it's pushed as a new, separate entry in <code>merged</code>.</li>
</ul>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the classic sort-then-sweep technique for interval merging: sorting by start value reduces an otherwise <code>O(N&sup2;)</code> all-pairs overlap check down to a single linear pass, since overlap can only ever need to be checked against the most recently merged interval.</p>
<p class="mb-2">The use of <code>&le;</code> rather than strict <code>&lt;</code> in the overlap check correctly implements the problem's rule that touching intervals (sharing an endpoint) count as overlapping and must be merged together, rather than being treated as adjacent-but-separate.</p>
<p class="mb-2">This algorithm runs in <code>O(N log N)</code> time per test case, dominated by the initial sort (the merging sweep itself is <code>O(N)</code>), and uses <code>O(N)</code> space per test case to store the resulting merged intervals.</p>

</div>
</div>

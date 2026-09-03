---
title: 'Remove Duplicates from Sorted Array'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Remove Duplicates from Sorted Array</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef has an integer array sorted in non-decreasing order and wants to remove all duplicate elements in-place so each unique element appears only once, preserving relative order. If K is the resulting number of unique elements, the first K positions of the array should contain those unique values in order. Find K and print the first K elements.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains an integer <code>N</code> — the size of the array.</li>
    <li>The second line contains <code>N</code> space-separated integers sorted in non-decreasing order.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print <code>K</code> — the number of unique elements. On the next line, print the first <code>K</code> unique elements of the modified array.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N</code> ≤ 30,000</li>
    <li>-100 ≤ <code>nums[i]</code> ≤ 100 for each valid <code>i</code></li>
    <li><code>nums</code> is sorted in non-decreasing order.</li>
</ul>

<h4 class="mb-3">Input</h4>

```
6
1 1 2 2 3 3
```

<h4 class="mb-3">Output</h4>

```
3
1 2 3
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int removeDuplicates(vector<int>& nums) {
    if (nums.empty()) return 0;

    int k = 1; // Index where the next unique element will be placed
    for (int i = 1; i < (int)nums.size(); i++) {
        // If current element differs from the last unique element kept so far
        if (nums[i] != nums[k - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k; // This is the count of unique elements
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    cin >> n;

    // Use a vector instead of a VLA to protect stack memory
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    int k = removeDuplicates(nums);

    cout << k << '\n'; // '\n' is significantly faster than endl
    for (int i = 0; i < k; i++) {
        cout << nums[i] << (i == k - 1 ? "" : " ");
    }
    cout << '\n';

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Since the array is already sorted in non-decreasing order, every group of duplicate values is guaranteed to sit together in one contiguous run. This means deduplication can be done with a single forward pass: an element is "new" (the first occurrence of its value) exactly when it differs from the most recently kept unique value. There's no need to look further back or use any auxiliary structure to detect duplicates — the sortedness guarantees that comparing against just the last kept element is sufficient.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code uses a two-pointer technique: <code>i</code> scans through every element of the array starting from index <code>1</code>, while <code>k</code> tracks how many unique elements have been written so far and where the next one should go. <code>nums[0]</code> is always kept implicitly as the first unique element, so <code>k</code> starts at <code>1</code>. Whenever <code>nums[i]</code> differs from <code>nums[k - 1]</code> (the last unique value placed), it's a new unique value: it gets copied into position <code>k</code>, and <code>k</code> is incremented. Matching values are simply skipped over since <code>i</code> keeps advancing regardless. After the loop, <code>k</code> holds the count of unique elements, and the first <code>k</code> positions of <code>nums</code> hold them in original order.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>N = 30,000</code> elements.</p>
<p class="mb-2">The in-place overwrite never reads from a position it has already overwritten before it needs to, since <code>i</code> always stays at or ahead of <code>k</code>, so no data is lost during the compaction.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time with a single pass over the array and uses only <code>O(1)</code> extra space beyond the input vector itself, comfortably satisfying the problem's constraints.</p>


</div>
</div>

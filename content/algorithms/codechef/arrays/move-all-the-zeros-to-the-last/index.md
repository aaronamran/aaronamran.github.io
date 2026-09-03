---
title: 'Move all the zeros to the last'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Move all the zeros to the last</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an integer array nums, shift all zeroes to the end of the array while keeping the relative order of the non-zero elements unchanged. The transformation must be done in-place without using an extra array.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains an integer <code>N</code> — the length of the array.</li>
    <li>The second line contains <code>N</code> space-separated integers representing the array.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print the modified array after all zeroes have been moved to the end. If the array has only non-zero numbers, print it unchanged.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>nums.length</code> ≤ 10,000</li>
    <li>-2<sup>31</sup> ≤ <code>nums[i]</code> ≤ 2<sup>31</sup> - 1 for each valid <code>i</code></li>
</ul>

<h4 class="mb-3">Input</h4>

```
3
7
4 0 5 0 0 7 8
5
0 2 0 0 9
1
3
```

<h4 class="mb-3">Output</h4>

```
4 5 7 8 0 0 0
2 9 0 0 0
3
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void moveZeroes(vector<int>& nums) {
    int lastNonZeroFoundAt = 0;

    // Move all non-zero elements to the front, preserving their relative order
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] != 0) {
            nums[lastNonZeroFoundAt] = nums[i];
            lastNonZeroFoundAt++;
        }
    }

    // Fill the remaining trailing positions with zero
    for (int i = lastNonZeroFoundAt; i < (int)nums.size(); i++) {
        nums[i] = 0;
    }
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

        moveZeroes(nums);

        for (int i = 0; i < n; i++) {
            cout << nums[i] << (i == n - 1 ? "" : " ");
        }
        cout << '\n'; // '\n' is significantly faster than endl
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">The non-zero elements need to end up at the front of the array in their original relative order, with every zero pushed to the tail. This is a compaction problem: if we know how many non-zero elements exist and write them consecutively starting from index <code>0</code>, the remaining suffix of the array is exactly where the zeroes belong. There's no need to track or copy the zeroes individually — once the non-zero elements are compacted, everything after them is simply overwritten with <code>0</code>.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code uses a two-pointer technique in two passes over the array. In the first pass, <code>lastNonZeroFoundAt</code> tracks the next position to write a non-zero value, starting at <code>0</code>. As <code>i</code> scans the whole array, every time <code>nums[i]</code> is non-zero, it gets copied into <code>nums[lastNonZeroFoundAt]</code> and the write pointer advances. Since <code>i</code> always stays at or ahead of <code>lastNonZeroFoundAt</code>, no value is overwritten before it has already been read, so the in-place compaction is safe. After this pass, all non-zero values sit at the front in original order, and <code>lastNonZeroFoundAt</code> equals their count. The second pass then simply fills every position from <code>lastNonZeroFoundAt</code> to the end of the array with <code>0</code>.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially across multiple test cases with up to <code>N = 10,000</code> elements each.</p>
<p class="mb-2">No auxiliary array is ever allocated; both passes operate directly on the input vector, satisfying the problem's explicit in-place requirement.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time across its two linear passes and uses only <code>O(1)</code> extra space beyond the input vector itself, comfortably satisfying the problem's constraints.</p>


</div>
</div>

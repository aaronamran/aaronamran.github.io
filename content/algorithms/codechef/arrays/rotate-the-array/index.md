---
title: 'Rotate the array'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Rotate the array</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an integer array nums. Rotate the array to the right by k positions, where k is a non-negative integer. The rotation must be done in-place, using only O(1) additional space.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains two integers <code>N</code> and <code>K</code> — the size of the array and the number of right rotations.</li>
    <li>The second line contains <code>N</code> space-separated integers representing the array elements.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print the rotated array on a line, space-separated.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>nums.length</code> ≤ 100,000</li>
    <li>-2<sup>31</sup> ≤ <code>nums[i]</code> ≤ 2<sup>31</sup> - 1 for each valid <code>i</code></li>
    <li>0 ≤ <code>k</code> ≤ 100,000</li>
    <li>Rotation must be done using O(1) extra space.</li>
</ul>
<h4 class="mb-3">Follow-up</h4>
<p class="mb-3">There are at least three different strategies for this problem: the reversal trick used below, cyclic-replacement (following each element along its rotation cycle and overwriting in place), or copying into an auxiliary array indexed with modulo arithmetic and copying back (the only one of the three that does not satisfy O(1) extra space).</p>

<h4 class="mb-3">Input</h4>

```
5 2
10 20 30 40 50
```

<h4 class="mb-3">Output</h4>

```
40 50 10 20 30
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void rotate(vector<int>& nums, int k) {
    int n = nums.size();
    if (n == 0) return;

    // Normalize k in case it exceeds the array length
    k = k % n;
    if (k == 0) return;

    // 1. Reverse the whole array
    reverse(nums.begin(), nums.end());

    // 2. Reverse the first k elements to restore their original relative order
    reverse(nums.begin(), nums.begin() + k);

    // 3. Reverse the remaining n - k elements to restore their original relative order
    reverse(nums.begin() + k, nums.end());
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, k;
    cin >> n >> k;

    // Use a vector instead of a VLA to protect stack memory
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    rotate(nums, k);

    for (int i = 0; i < n; i++) {
        cout << nums[i] << (i == n - 1 ? "" : " ");
    }
    cout << '\n'; // '\n' is significantly faster than endl

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Rotating an array right by <code>k</code> positions moves the last <code>k</code> elements to the front and shifts everything else back, while preserving the relative order within each of those two blocks. The classic reversal trick achieves this using only whole-array and sub-array reversals: reversing the entire array flips both blocks' internal order and swaps their positions at the same time, and reversing each block individually afterward undoes the unwanted internal flip while leaving the desired block swap intact. Since <code>k</code> can exceed <code>n</code>, taking <code>k mod n</code> first collapses redundant full rotations down to the equivalent effective shift.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code first normalizes <code>k</code> with <code>k % n</code>, and returns immediately if the effective rotation is <code>0</code>. It then performs three reversals using <code>std::reverse</code>: first the entire array <code>[0, n)</code>, which reverses everything including flipping the relative order within both the to-be-front and to-be-back blocks; then the first <code>k</code> elements <code>[0, k)</code>, which restores the original relative order of what is now the front block (the elements that used to be the last <code>k</code>); and finally the remaining elements <code>[k, n)</code>, which restores the original relative order of the back block. The net effect of these three passes is exactly a right rotation by <code>k</code>.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>N = 100,000</code> elements.</p>
<p class="mb-2">Taking <code>k % n</code> upfront correctly handles the edge case where <code>k</code> is larger than the array itself, since rotating by a multiple of <code>n</code> always returns the array to its original arrangement.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time, since each element is touched a constant number of times across the three reversals, and uses only <code>O(1)</code> extra space beyond the input vector itself, satisfying the problem's explicit in-place and space requirements.</p>


</div>
</div>
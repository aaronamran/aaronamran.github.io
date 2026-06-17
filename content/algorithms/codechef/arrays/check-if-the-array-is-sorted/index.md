---
title: 'Check if the array is sorted'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Check if the array is sorted</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array nums, determine whether it could have come from a non-decreasing sorted array that was rotated by some number of positions (possibly zero). Rotation means some suffix of the original sorted array was moved to the front, keeping the relative order of elements. Duplicates are allowed.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains an integer <code>N</code> — the size of the array.</li>
    <li>The second line contains <code>N</code> space-separated integers — the elements of the array <code>nums</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print <code>true</code> if the array is a non-decreasing sorted array that has been rotated any number of times (including zero), and <code>false</code> otherwise.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>nums.length</code> ≤ 100,000</li>
    <li>1 ≤ <code>nums[i]</code> ≤ 100</li>
</ul>

<h4 class="mb-3">Input</h4>

```
7
6 7 1 2 3 4 5
```

<h4 class="mb-3">Output</h4>

```
true
```

<h4 class="mb-3">Input</h4>

```
5
68 97 10 21 45
```

<h4 class="mb-3">Output</h4>

```
true
```

<h4 class="mb-3">Input</h4>

```
5
4 5 2 3 1
```

<h4 class="mb-3">Output</h4>

```
false
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

bool check(vector<int>& nums) {
    int n = nums.size();
    int countDrops = 0;

    for (int i = 0; i < n; i++) {
        // Compare current element with the next, wrapping around circularly
        if (nums[i] > nums[(i + 1) % n]) {
            countDrops++;
            // More than one drop means it can't be a rotated sorted array
            if (countDrops > 1) break;
        }
    }

    return countDrops <= 1;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    cin >> n;

    // Use a vector instead of a VLA to protect stack memory
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    cout << (check(nums) ? "true" : "false") << '\n'; // '\n' is significantly faster than endl

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">A non-decreasing array, when walked from start to end, never has an element greater than the one right after it — there are zero "drops." Rotating that array by <code>k</code> positions cuts it at one point and moves the suffix to the front; this introduces exactly one drop at the rotation seam (the old last element followed by the old first element), unless <code>k = 0</code>, in which case there are still zero drops. So a valid sorted-and-rotated array can have at most one place where an element is followed by a strictly smaller one, treating the array circularly so the wrap-around from the last element back to the first also counts as a potential drop.</p>
<p class="mb-2">If there are two or more such drops, the array cannot be explained by a single rotation point and is therefore not a rotated sorted array.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code makes a single pass over the array with index <code>i</code> from <code>0</code> to <code>n - 1</code>, comparing each element <code>nums[i]</code> against its circular successor <code>nums[(i + 1) % n]</code>. Whenever the current element is strictly greater than its successor, that counts as a drop and <code>countDrops</code> is incremented. As soon as <code>countDrops</code> exceeds <code>1</code>, the loop breaks early since the answer is already determined to be <code>false</code>. After the loop, the array qualifies as sorted-and-rotated exactly when <code>countDrops</code> is <code>0</code> or <code>1</code>.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>N = 100,000</code> elements.</p>
<p class="mb-2">The circular comparison via the modulo operator elegantly handles both the interior of the array and the wrap-around seam between the last and first elements in the same loop, without needing special-case logic for the boundary.</p>
<p class="mb-2">Breaking out of the loop as soon as a second drop is found avoids unnecessary work once the answer is already determined.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time and uses only <code>O(1)</code> extra space beyond the input vector, comfortably satisfying the problem's constraints.</p>


</div>
</div>
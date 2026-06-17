---
title: 'Single number in multiple numbers'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Single number in multiple numbers</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given a non-empty array of integers where every number occurs exactly twice except for one number that occurs only once. Find and return that unique number. The solution must run in O(n) time and use O(1) extra space.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>N</code> — the number of elements in the array.</li>
    <li>The second line contains <code>N</code> space-separated integers representing the array <code>nums</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print the single number that appears exactly once.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>nums.length</code> ≤ 30,000</li>
    <li>-30,000 ≤ <code>nums[i]</code> ≤ 30,000</li>
    <li>Exactly one element in the array appears once, and all others appear exactly twice.</li>
</ul>

<h4 class="mb-3">Input</h4>

```
3
1
10
5
9 1 9 2 1
5
7 3 5 3 7
```

<h4 class="mb-3">Output</h4>

```
10
2
5
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int singleNumber(vector<int>& nums) {
    int result = 0;
    // XOR every element together; pairs cancel out, leaving the unique value
    for (int num : nums) {
        result ^= num;
    }
    return result;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    cin >> n;

    // Use a vector instead of a VLA to protect stack memory
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    cout << singleNumber(nums) << '\n'; // '\n' is significantly faster than endl

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">The bitwise XOR operator has three properties that make it perfect for this problem: any value XORed with itself is <code>0</code> (<code>x ^ x = 0</code>), any value XORed with <code>0</code> is itself (<code>x ^ 0 = x</code>), and XOR is both commutative and associative, so the order of operations doesn't matter. If every number except one appears exactly twice, then XORing the entire array together causes every paired value to cancel itself out to <code>0</code>, leaving only the one unpaired value as the final result.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code initializes <code>result</code> to <code>0</code> and makes a single linear pass over the array, XORing each element into <code>result</code> in turn. Because of the cancellation property, every value that appears twice contributes nothing to the final result by the time the pass finishes — only the value that appears exactly once survives. That surviving value is returned directly as the answer.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>N = 30,000</code> elements.</p>
<p class="mb-2">No auxiliary hash set or map is needed at all, since the XOR trick handles duplicate cancellation implicitly using just one integer variable.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time and uses only <code>O(1)</code> extra space beyond the input array itself, satisfying the problem's explicit complexity requirement.</p>


</div>
</div>

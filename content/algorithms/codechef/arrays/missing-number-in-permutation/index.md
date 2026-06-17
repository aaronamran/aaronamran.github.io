---
title: 'Missing number in permutation'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Missing number in permutation</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array of N distinct integers chosen from the range [0, N], where the array represents a permutation of N numbers from that range except one element is missing, find the single missing number.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains a single integer <code>N</code> — the size of the array.</li>
    <li>The second line contains <code>N</code> space-separated integers representing the permutation array.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print the missing number on a new line.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 100</li>
    <li><code>N</code> equals the length of the array</li>
    <li>1 ≤ <code>N</code> ≤ 10,000</li>
    <li>0 ≤ <code>nums[i]</code> ≤ <code>N</code> for each valid <code>i</code></li>
    <li>All elements in <code>nums</code> are unique</li>
</ul>
<h4 class="mb-3">Follow-up</h4>
<p class="mb-3">Can this be solved in O(N) time and O(1) extra space? Yes — the solution below already achieves this, using only a couple of accumulator variables alongside the input array.</p>

<h4 class="mb-3">Input</h4>

```
3
2
2 0
4
4 2 1 0
3
1 2 3
```

<h4 class="mb-3">Output</h4>

```
1
3
0
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int missingNumber(vector<int>& nums) {
    int n = nums.size();

    // The sum of numbers from 0 to n is (n * (n + 1)) / 2
    long long expectedSum = (long long)n * (n + 1) / 2;
    long long actualSum = 0;

    for (int num : nums) {
        actualSum += num;
    }

    return (int)(expectedSum - actualSum);
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

        cout << missingNumber(nums) << '\n'; // '\n' is significantly faster than endl
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">The array is supposed to be a permutation of every integer from <code>0</code> to <code>N</code> inclusive — that's <code>N + 1</code> distinct values — but it only holds <code>N</code> of them, so exactly one value is missing. The sum of all integers from <code>0</code> to <code>N</code> has a closed form: <code>N(N+1)/2</code>. If we sum up the <code>N</code> values that are actually present, the gap between the expected full sum and the actual sum is precisely the one number that never made it into the array.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code computes <code>expectedSum</code> directly from the formula <code>n * (n + 1) / 2</code>, where <code>n</code> is the array's length. It then makes a single linear pass over the array, accumulating every element into <code>actualSum</code>. The missing number is simply <code>expectedSum - actualSum</code>, since every present value cancels out and only the absent one remains as the difference.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">Both <code>expectedSum</code> and <code>actualSum</code> are stored as <code>long long</code> as a defensive habit against overflow, even though with <code>N ≤ 10,000</code> the maximum possible sum (around <code>5 &times; 10<sup>7</sup></code>) comfortably fits in a 32-bit <code>int</code>.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially across up to <code>T = 100</code> test cases.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time per test case using only a constant number of extra variables beyond the input array itself, satisfying the follow-up's O(N) time and O(1) extra space requirement.</p>


</div>
</div>

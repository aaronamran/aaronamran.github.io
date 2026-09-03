---
title: 'Chef and Pair of Elements'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Chef and Pair of Elements</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef has an array of integers nums and a target value X. Find the indices of the two numbers in the array whose sum is exactly X. Exactly one valid pair exists, the same element cannot be used twice, and the index that appears first in the array must be printed before the index that appears later.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>N</code> — the size of the array.</li>
    <li>The second line contains <code>N</code> space-separated integers representing the array.</li>
    <li>The third line contains a single integer — the target sum <code>X</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print the two 0-based indices whose values sum to <code>X</code>, with the earlier index printed first.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>2 ≤ <code>nums.length</code> ≤ 10,000</li>
    <li>-10<sup>9</sup> ≤ <code>nums[i]</code> ≤ 10<sup>9</sup></li>
    <li>-10<sup>9</sup> ≤ <code>target</code> ≤ 10<sup>9</sup></li>
    <li>Exactly one valid answer exists.</li>
</ul>

<h4 class="mb-3">Input</h4>

```
4
3 5 2 6
7
```

<h4 class="mb-3">Output</h4>

```
1 2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

pair<int, int> findPair(vector<int>& nums, long long target) {
    // Map to store: Value -> Index
    unordered_map<long long, int> mp;
    mp.reserve(nums.size());

    for (int i = 0; i < (int)nums.size(); i++) {
        long long complement = target - nums[i];

        // If the complement was seen earlier, we've found the pair
        auto it = mp.find(complement);
        if (it != mp.end()) {
            return {it->second, i};
        }

        // Otherwise, record the current value and its index for future lookups
        mp[nums[i]] = i;
    }

    return {-1, -1}; // Unreachable per the problem's guarantee
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    cin >> n;

    // Use a vector instead of a VLA to protect stack memory
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    long long target;
    cin >> target;

    pair<int, int> ans = findPair(nums, target);

    cout << ans.first << " " << ans.second << '\n'; // '\n' is significantly faster than endl

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">For any index <code>i</code>, finding a valid partner index requires checking whether the value <code>target - nums[i]</code> (its "complement") appears somewhere else in the array. Brute-force checking every pair takes <code>O(N&sup2;)</code> time, but this can be reduced to <code>O(N)</code> by processing the array left to right while remembering every value already seen, paired with its index. As soon as the complement of the current element is found among previously seen values, a valid pair has been located — and since we only ever look backward at already-recorded indices, the earlier index is naturally the one stored in the map and the later index is the current position, satisfying the required output order automatically.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains an <code>unordered_map</code> from value to index, built incrementally during a single forward pass. At each index <code>i</code>, it first computes <code>complement = target - nums[i]</code> and checks whether that complement is already a key in the map. If it is, the pair has been found: the map's stored index for the complement is the earlier index (since it was inserted on a previous iteration), and <code>i</code> is the later index, so they're returned in that order. If the complement isn't found, the current value and its index are inserted into the map before moving to the next element, making it available as a potential complement for some future index.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">Both <code>target</code> and <code>complement</code> are computed using <code>long long</code> arithmetic as a defensive habit against overflow, even though with <code>nums[i]</code> and <code>target</code> bounded by 10<sup>9</sup> in magnitude, a 32-bit <code>int</code> subtraction here would not actually overflow.</p>
<p class="mb-2"><code>unordered_map</code> is preferred over <code>map</code> since only fast lookups by value are needed and no ordering of keys is required, giving average O(1) insertions and lookups instead of O(log N).</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>N = 10,000</code> elements.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> average time with a single linear pass and uses <code>O(N)</code> space for the hash map in the worst case, comfortably satisfying the problem's constraints.</p>


</div>
</div>
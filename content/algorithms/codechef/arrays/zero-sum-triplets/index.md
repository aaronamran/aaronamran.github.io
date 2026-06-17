---
title: 'Zero Sum Triplets'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Zero Sum Triplets</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef is arranging dishes, each with a number on it that may be positive, negative, or zero. Find all unique triplets of dishes from different indices whose values sum to exactly 0, printing each triplet in non-decreasing order with no triplet repeated. If no such triplet exists, print -1.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>N</code> — the number of elements in the array.</li>
    <li>The second line contains <code>N</code> space-separated integers representing the array elements.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print all valid triplets, one triplet per line, each with three space-separated integers in non-decreasing order. If no triplet exists, print <code>-1</code>.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>3 ≤ <code>N</code> ≤ 3,000</li>
    <li>-100,000 ≤ <code>nums[i]</code> ≤ 100,000</li>
</ul>

<h4 class="mb-3">Input</h4>

```
5
2 -2 0 1 -1
```

<h4 class="mb-3">Output</h4>

```
-2 0 2
-1 0 1
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N&sup2;) &nbsp;•&nbsp; Space O(N) (excluding output)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> findZeroSumTriplets(vector<int>& nums) {
    int n = nums.size();
    sort(nums.begin(), nums.end());
    vector<vector<int>> result;

    for (int i = 0; i < n - 2; i++) {
        // Skip duplicate anchor values to avoid repeating the same triplet family
        if (i > 0 && nums[i] == nums[i - 1]) continue;

        int left = i + 1;
        int right = n - 1;

        while (left < right) {
            long long sum = (long long)nums[i] + nums[left] + nums[right];

            if (sum == 0) {
                result.push_back({nums[i], nums[left], nums[right]});

                // Skip duplicate values on both sides to avoid repeating the same triplet
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;

                left++;
                right--;
            } else if (sum < 0) {
                left++; // Sum too small, move left pointer to a larger value
            } else {
                right--; // Sum too large, move right pointer to a smaller value
            }
        }
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

    vector<vector<int>> triplets = findZeroSumTriplets(nums);

    if (triplets.empty()) {
        cout << -1 << '\n';
    } else {
        for (const auto& triplet : triplets) {
            cout << triplet[0] << " " << triplet[1] << " " << triplet[2] << '\n'; // '\n' is significantly faster than endl
        }
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Brute-force checking every triplet would take <code>O(N&sup3;)</code> time. Sorting the array first reduces this to <code>O(N&sup2;)</code>: for each fixed "anchor" element <code>nums[i]</code>, the remaining problem becomes finding two other elements in the sorted suffix that sum to exactly <code>-nums[i]</code>, which is the classic two-pointer "two sum on a sorted array" problem solvable in linear time. Sorting also makes duplicate triplets easy to detect and skip, since identical values end up adjacent to each other, so duplicate anchors and duplicate two-pointer matches can be filtered out by simply comparing neighboring array positions rather than needing a separate deduplication structure.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code first sorts <code>nums</code>, then iterates <code>i</code> as the anchor index from <code>0</code> to <code>n - 3</code>. To avoid generating the same triplet family more than once, it skips any <code>i</code> whose value matches the previous anchor's value. For each distinct anchor, it runs a two-pointer sweep with <code>left</code> starting just after <code>i</code> and <code>right</code> starting at the end of the array: it computes the three-way sum, and if it's exactly <code>0</code>, the triplet is recorded and both pointers move inward past any further duplicate values to avoid emitting the same triplet again; if the sum is negative, <code>left</code> advances to increase the sum; if positive, <code>right</code> retreats to decrease it. This sweep continues until <code>left</code> and <code>right</code> meet, after which the outer loop moves to the next distinct anchor value.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">The three-way sum is computed using a <code>long long</code> as a defensive habit against overflow, even though with <code>|nums[i]| ≤ 100,000</code> the maximum possible sum magnitude (<code>300,000</code>) comfortably fits within a 32-bit <code>int</code>.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially given the potentially large number of output triplets.</p>
<p class="mb-2">This algorithm runs in <code>O(N&sup2;)</code> time, since the outer loop over anchors combined with the inner two-pointer sweep (which itself is linear per anchor) gives a quadratic bound overall, and uses <code>O(N)</code> auxiliary space beyond the input vector and the output triplets themselves, comfortably satisfying the problem's constraints given <code>N ≤ 3,000</code>.</p>


</div>
</div>
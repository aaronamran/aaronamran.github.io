---
title: 'Largest Subarray with Sum 0'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Largest Subarray with Sum 0</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef has an array of integers <code>arr</code> which may contain both positive and negative values. Find the length of the longest contiguous subarray whose sum is equal to <code>0</code>. If no such subarray exists, output <code>0</code>.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>n</code> — the number of elements in the array.</li>
    <li>The next line contains <code>n</code> space-separated integers <code>arr<sub>i</sub></code> — the elements of the array.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print a single integer — the length of the longest subarray whose sum is <code>0</code>.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>n</code> ≤ 10<sup>6</sup></li>
    <li>−10<sup>3</sup> ≤ <code>arr<sub>i</sub></code> ≤ 10<sup>3</sup></li>
    <li>Array elements can be positive, negative, or zero</li>
</ul>
<h4 class="mb-3">Input</h4>

```
7
4 -3 1 -2 2 6 -6
```

<h4 class="mb-3">Output</h4>

```
4
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

int largestSubarrayWithSumZero(vector<int>& arr) {
    unordered_map<int, int> prefixMap;
    int prefixSum = 0;
    int maxLen = 0;

    for (int i = 0; i < arr.size(); i++) {
        prefixSum += arr[i];

        // Case 1: The subarray from the beginning (index 0) has sum 0
        if (prefixSum == 0) {
            maxLen = i + 1;
        }

        // Case 2: We have seen this prefixSum before
        if (prefixMap.find(prefixSum) != prefixMap.end()) {
            // Distance between the current index and the first occurrence index
            maxLen = max(maxLen, i - prefixMap[prefixSum]);
        } else {
            // Store the first occurrence index of this prefix sum
            prefixMap[prefixSum] = i;
        }
    }

    return maxLen;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Let <code>prefix[i]</code> denote the sum of the first <code>i</code> elements (so <code>prefix[0] = 0</code>, and the sum of <code>arr[j..i-1]</code> equals <code>prefix[i] - prefix[j]</code>). A subarray sums to <code>0</code> exactly when its two boundary prefix sums are equal, i.e. <code>prefix[i] = prefix[j]</code> for some <code>j &lt; i</code>. To maximize the length <code>i - j</code> for a fixed <code>i</code>, we want the smallest possible <code>j</code> — meaning, among all earlier positions sharing the same prefix sum, the very first one gives the longest zero-sum subarray ending at <code>i</code>. This is the special case of the "longest subarray with a given sum" problem where the target sum is fixed at <code>0</code>.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains <code>prefixSum</code> as a running total and an <code>unordered_map</code> called <code>prefixMap</code> that, for each distinct prefix sum value, stores only the earliest index at which it occurred. Storing only the first occurrence is essential: since the goal is the longest subarray rather than a count, an earlier matching index always yields a longer (or equal) zero-sum subarray than a later one would.</p>
<p class="mb-2">At each index <code>i</code>, after updating <code>prefixSum</code>, two cases are checked. If <code>prefixSum</code> itself is <code>0</code>, the subarray from index <code>0</code> through <code>i</code> is a valid zero-sum candidate of length <code>i + 1</code> — this must be checked explicitly since no "prefix sum of <code>0</code> at index <code>-1</code>" is pre-seeded in the map the way some sum-counting variants do. Otherwise, if the current <code>prefixSum</code> has been seen before at some index stored in <code>prefixMap</code>, then the subarray between that stored index and <code>i</code> sums to zero, and its length <code>i - prefixMap[prefixSum]</code> is compared against <code>maxLen</code>. The map is updated with the current index only when <code>prefixSum</code> is being seen for the first time, which is what preserves the earliest-occurrence invariant needed for correctness.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the prefix-sum-with-hashmap technique specialized for a target sum of <code>0</code>: two prefix sums being equal is exactly the condition for the subarray between them to sum to zero, and storing only the first occurrence of each prefix sum value guarantees the longest such subarray is found for every possible end index.</p>
<p class="mb-2">Negative, positive, and zero elements are all handled uniformly, since the prefix sum can move up, down, or stay flat without affecting the correctness of the equal-prefix-sum argument — unlike sliding-window techniques that typically require non-negative elements to maintain a monotonic window.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time (amortized, due to hash map operations) and uses <code>O(N)</code> space in the worst case to store up to <code>N</code> distinct prefix sums in the map — a significant improvement over the brute-force <code>O(N&sup2;)</code> approach of checking every subarray's sum directly.</p>

</div>
</div>

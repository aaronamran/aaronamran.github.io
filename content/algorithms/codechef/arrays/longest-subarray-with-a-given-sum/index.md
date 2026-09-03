---
title: 'Longest subarray with a given sum'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Longest subarray with a given sum</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an array of integers <code>nums</code> with length <code>n</code> and an integer <code>k</code>. Determine the length of the longest continuous subarray whose elements sum up exactly to <code>k</code>. If there is no such subarray, return <code>0</code>.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case:
    <ul>
        <li>The first line contains two space-separated integers <code>n</code> and <code>k</code> — the length of the array and the required sum respectively.</li>
        <li>The next line contains <code>n</code> space-separated integers, representing the array <code>nums</code>.</li>
    </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line a single integer — the length of the longest continuous subarray whose sum is exactly <code>k</code>. If no such subarray exists, output <code>0</code>.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 10<sup>5</sup></li>
    <li>1 ≤ <code>n</code> ≤ 10<sup>5</sup></li>
    <li>−10<sup>5</sup> ≤ <code>arr<sub>i</sub></code> ≤ 10<sup>5</sup></li>
    <li>−10<sup>9</sup> ≤ <code>k</code> ≤ 10<sup>9</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
3
6 15
10 5 2 7 1 9
3 6
-3 2 1
5 5
1 2 3 2 1
```

<h4 class="mb-3">Output</h4>

```
4
0
2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) per test case &nbsp;•&nbsp; Space O(N) per test case</p>

```C++
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

class Solution {
public:
    int longestSubarraySum(vector<int>& arr, int k) {
        int n = arr.size();
        // Use a map to store the first index where a specific prefix sum occurs
        unordered_map<long long, int> prefixIndex;
        long long currentSum = 0;
        int maxLen = 0;

        for (int i = 0; i < n; i++) {
            currentSum += arr[i];

            // Case: The subarray starts from index 0
            if (currentSum == k) {
                maxLen = i + 1;
            }

            // Case: Check if (currentSum - k) has been seen before
            // If yes, the subarray between that index and i sums to k
            if (prefixIndex.find(currentSum - k) != prefixIndex.end()) {
                maxLen = max(maxLen, i - prefixIndex[currentSum - k]);
            }

            // Only store the first occurrence of currentSum to maximize length
            if (prefixIndex.find(currentSum) == prefixIndex.end()) {
                prefixIndex[currentSum] = i;
            }
        }

        return maxLen;
    }
};
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Let <code>prefix[i]</code> denote the sum of the first <code>i</code> elements (so <code>prefix[0] = 0</code>, and the sum of <code>arr[j..i-1]</code> equals <code>prefix[i] - prefix[j]</code>). We want a subarray summing to <code>k</code>, i.e. indices <code>j &lt; i</code> with <code>prefix[i] - prefix[j] = k</code>, while maximizing its length <code>i - j</code>. For a fixed end index <code>i</code>, the length is maximized by choosing the smallest valid <code>j</code> — meaning, among all earlier positions whose prefix sum equals <code>prefix[i] - k</code>, we want the very first one, since a leftmost matching start gives the longest possible subarray ending at <code>i</code>.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains <code>currentSum</code> as a running prefix sum and an <code>unordered_map</code> called <code>prefixIndex</code> that, for each prefix sum value seen, stores only the earliest index at which it occurred. This is the critical design choice that differs from a frequency-counting map: since we want the longest subarray rather than a count of subarrays, storing only the first occurrence of each prefix sum guarantees the maximum possible length whenever that value is looked up later.</p>
<p class="mb-2">At each index <code>i</code>, after updating <code>currentSum</code>, two cases are handled. First, if <code>currentSum</code> itself equals <code>k</code>, the subarray from index <code>0</code> to <code>i</code> is a valid candidate of length <code>i + 1</code> — this case is needed because there's no "earlier prefix sum of <code>0</code>" stored in the map by default the way the previous counting-based problems seeded one, so it must be checked explicitly. Second, the code looks up <code>currentSum - k</code> in the map; if found at some earlier index <code>j</code>, the subarray <code>arr[j+1..i]</code> sums to exactly <code>k</code> and has length <code>i - j</code>, which is compared against <code>maxLen</code>. Finally, <code>currentSum</code> is recorded into the map only if it hasn't been seen before, preserving the earliest-index invariant for all future lookups.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the same prefix-sum-with-hashmap technique used for counting subarrays with a given sum, but adapted for length-maximization by storing the first occurrence of each prefix sum instead of a frequency count, since the earliest matching start index always yields the longest subarray for any given end index.</p>
<p class="mb-2"><code>long long</code> is used for <code>currentSum</code> and as the map's key type as a defensive measure against overflow, since with <code>n ≤ 10<sup>5</sup></code> and <code>|arr<sub>i</sub>| ≤ 10<sup>5</sup></code>, the running prefix sum can reach magnitude <code>10<sup>10</sup></code>, which would overflow a 32-bit <code>int</code>.</p>
<p class="mb-2">For each test case, this algorithm runs in <code>O(N)</code> time (amortized, due to hash map operations) and uses <code>O(N)</code> space in the worst case to store up to <code>N</code> distinct prefix sums in the map — a significant improvement over the brute-force <code>O(N&sup2;)</code> approach of checking every subarray's sum directly.</p>

</div>
</div>

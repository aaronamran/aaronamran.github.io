---
title: 'Count subarrays with given sum'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Count subarrays with given sum</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an integer array <code>arr</code> and a target integer <code>k</code>. Find the number of contiguous subarrays in <code>arr</code> whose sum is exactly equal to <code>k</code>. A subarray is defined as a continuous and non-empty sequence of elements within the array.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains <code>T</code> — the number of test cases.</li>
    <li>For each test case:
    <ul>
        <li>The first line contains <code>n</code> and <code>k</code>.</li>
        <li>The second line contains <code>n</code> integers representing the array.</li>
    </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output a single integer: the number of contiguous subarrays whose sum is exactly <code>k</code>.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 100</li>
    <li>1 ≤ <code>arr.length</code> ≤ 10<sup>5</sup></li>
    <li>−1000 ≤ <code>arr<sub>i</sub></code> ≤ 1000</li>
    <li>−10<sup>7</sup> ≤ <code>k</code> ≤ 10<sup>7</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
5
4 5
2 3 -1 4
4 1
1 -1 1 1
5 3
1 2 1 -1 1
3 0
0 0 0
6 -2
-1 -1 2 -2 1 -1
```

<h4 class="mb-3">Output</h4>

```
1
5
4
6
5
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) per test case &nbsp;•&nbsp; Space O(N) per test case</p>

```C++
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& arr, int k) {
        int n = arr.size();
        int count = 0;
        int current_sum = 0;
        
        // Map to store (prefix_sum, frequency)
        unordered_map<int, int> prefix_sum_map;
        
        // Base case: a sum of 0 has been seen once
        prefix_sum_map[0] = 1;
        
        for (int i = 0; i < n; i++) {
            current_sum += arr[i];
            
            // Check if (current_sum - k) exists in the map
            if (prefix_sum_map.find(current_sum - k) != prefix_sum_map.end()) {
                count += prefix_sum_map[current_sum - k];
            }
            
            // Record the current prefix sum in the map
            prefix_sum_map[current_sum]++;
        }
        
        return count;
    }
};
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Let <code>prefix[i]</code> denote the sum of all elements from index <code>0</code> to <code>i-1</code> (so <code>prefix[0] = 0</code>). The sum of any subarray <code>arr[j..i-1]</code> is exactly <code>prefix[i] - prefix[j]</code>. We want to count the number of pairs <code>(j, i)</code> with <code>j &lt; i</code> such that <code>prefix[i] - prefix[j] = k</code>, which rearranges to <code>prefix[j] = prefix[i] - k</code>. So for each index <code>i</code>, the number of valid subarrays ending at <code>i-1</code> equals the number of earlier prefix sums that equal <code>prefix[i] - k</code>.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains <code>current_sum</code> as the running prefix sum and an <code>unordered_map</code> called <code>prefix_sum_map</code> that records how many times each prefix sum value has occurred so far. It's seeded with <code>prefix_sum_map[0] = 1</code> to account for the empty prefix before the array starts, which is what allows a subarray beginning at index <code>0</code> to be counted correctly.</p>
<p class="mb-2">For each element, <code>current_sum</code> is updated first, then the code looks up <code>current_sum - k</code> in the map. Every time this value has appeared as a prefix sum before, it means there's a prior index <code>j</code> from which the subarray ending at the current index sums to exactly <code>k</code>, so <code>count</code> is incremented by however many times that prefix sum has occurred (since each occurrence corresponds to a distinct valid starting point). Only after this lookup is <code>current_sum</code> itself recorded into the map, which ensures a subarray is never counted against itself (i.e., the current prefix sum can't be used as its own "earlier" occurrence for the same index).</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the prefix-sum-with-hashmap technique: instead of recomputing the sum of every possible subarray (which would be <code>O(N&sup2;)</code>), the problem is reframed as counting pairs of equal-valued prefix sums offset by <code>k</code>, and a hash map lets each of these lookups happen in <code>O(1)</code> amortized time.</p>
<p class="mb-2">Negative numbers and zeros in <code>arr</code> are handled naturally, since prefix sums can decrease, stay flat, or increase, and the hashmap approach doesn't rely on any monotonicity of <code>current_sum</code> the way a sliding-window technique would require. A run of zeros (as in test case 4) correctly produces multiple matches, since every prefix sum in that run is identical and each one pairs validly with every other.</p>
<p class="mb-2">For each test case, this algorithm runs in <code>O(N)</code> time (amortized, due to hash map operations) and uses <code>O(N)</code> space in the worst case to store up to <code>N+1</code> distinct prefix sums in the map — a significant improvement over the brute-force <code>O(N&sup2;)</code> approach of checking every subarray's sum directly.</p>

</div>
</div>

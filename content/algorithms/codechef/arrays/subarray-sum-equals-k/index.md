---
title: 'Subarray Sum equals k'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Subarray Sum equals k</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array of integers <code>nums</code> and an integer <code>k</code>, return the total number of subarrays whose sum equals <code>k</code>. A subarray is a contiguous non-empty sequence of elements within an array.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains <code>n</code> — the length of the array.</li>
    <li>The second line contains <code>n</code> space-separated integers representing the array elements.</li>
    <li>The third line contains an integer <code>k</code> representing the target sum.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Output the total number of subarrays whose sum equals <code>k</code>.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N</code> ≤ 2 × 10<sup>4</sup></li>
    <li>−1000 ≤ <code>nums<sub>i</sub></code> ≤ 1000</li>
    <li>−10<sup>7</sup> ≤ <code>k</code> ≤ 10<sup>7</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
3
1 1 1
2
```

<h4 class="mb-3">Output</h4>

```
2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <unordered_map>

class Solution {
public:
    int subarraySum(int nums[], int n, int k) {
        int count = 0;
        int current_sum = 0;
        // Map to store (prefix_sum, frequency)
        std::unordered_map<int, int> prefix_freq;
        
        // Base case: a sum of 0 exists once (before starting the array)
        prefix_freq[0] = 1;
        
        for (int i = 0; i < n; i++) {
            current_sum += nums[i];
            
            // If (current_sum - k) exists in map, it means we found subarrays summing to k
            if (prefix_freq.find(current_sum - k) != prefix_freq.end()) {
                count += prefix_freq[current_sum - k];
            }
            
            // Store/update the current prefix sum in the map
            prefix_freq[current_sum]++;
        }
        
        return count;
    }
};
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Let <code>prefix[i]</code> denote the sum of all elements from index <code>0</code> to <code>i-1</code> (so <code>prefix[0] = 0</code>). The sum of any subarray <code>nums[j..i-1]</code> is exactly <code>prefix[i] - prefix[j]</code>. We want to count the number of pairs <code>(j, i)</code> with <code>j &lt; i</code> such that <code>prefix[i] - prefix[j] = k</code>, which rearranges to <code>prefix[j] = prefix[i] - k</code>. So for each index <code>i</code>, the number of valid subarrays ending at <code>i-1</code> equals the number of earlier prefix sums that equal <code>prefix[i] - k</code>.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains <code>current_sum</code> as the running prefix sum and an <code>unordered_map</code> called <code>prefix_freq</code> that records how many times each prefix sum value has occurred so far. It's seeded with <code>prefix_freq[0] = 1</code> to account for the empty prefix before the array starts, which is what allows a subarray beginning at index <code>0</code> to be counted correctly.</p>
<p class="mb-2">For each element, <code>current_sum</code> is updated first, then the code looks up <code>current_sum - k</code> in the map. Every time this value has appeared as a prefix sum before, it means there's a prior index <code>j</code> from which the subarray ending at the current index sums to exactly <code>k</code>, so <code>count</code> is incremented by however many times that prefix sum has occurred (since each occurrence corresponds to a distinct valid starting point). Only after this lookup is <code>current_sum</code> itself recorded into the map, which ensures a subarray is never counted against itself (i.e., the current prefix sum can't be used as its own "earlier" occurrence for the same index).</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the prefix-sum-with-hashmap technique: instead of recomputing the sum of every possible subarray (which would be <code>O(N&sup2;)</code>), the problem is reframed as counting pairs of equal-valued prefix sums offset by <code>k</code>, and a hash map lets each of these lookups happen in <code>O(1)</code> amortized time.</p>
<p class="mb-2">Negative numbers in <code>nums</code> are handled naturally, since prefix sums can decrease as well as increase, and the hashmap approach doesn't rely on any monotonicity of <code>current_sum</code> the way a sliding-window technique would require.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time (amortized, due to hash map operations) and uses <code>O(N)</code> space in the worst case to store up to <code>N+1</code> distinct prefix sums in the map — a significant improvement over the brute-force <code>O(N&sup2;)</code> approach of checking every subarray's sum directly.</p>

</div>
</div>

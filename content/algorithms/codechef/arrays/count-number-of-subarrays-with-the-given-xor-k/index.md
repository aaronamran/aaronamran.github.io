---
title: 'Count number of subarrays with the given xor K'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Count number of subarrays with the given xor K</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an array of integers <code>arr</code> and a target integer <code>targetXOR</code>. Compute the total number of contiguous subarrays whose XOR of all elements equals <code>targetXOR</code>.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains <code>T</code> — the number of test cases.</li>
    <li>For each test case:
    <ul>
        <li>The first line contains <code>n</code> (array size) and <code>k</code> (target XOR).</li>
        <li>The second line contains <code>n</code> integers representing the array.</li>
    </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Output one number per test case — the number of contiguous subarrays whose XOR equals <code>k</code>.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>arr.length</code> ≤ 10<sup>5</sup></li>
    <li>0 ≤ <code>arr<sub>i</sub></code> ≤ 10<sup>9</sup></li>
    <li>0 ≤ <code>targetXOR</code> ≤ 10<sup>9</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
3
5 5
3 8 2 6 3
5 1
1 2 3 4 5
3 0
7 1 3
```

<h4 class="mb-3">Output</h4>

```
1
4
0
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) per test case &nbsp;•&nbsp; Space O(N) per test case</p>

```C++
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    int countSubarraysWithXOR(vector<int>& arr, int k) {
        unordered_map<int, int> freq; 
        int prefixXOR = 0;
        int count = 0;

        for (int num : arr) {
            prefixXOR ^= num;

            // Check if current prefix XOR is k
            if (prefixXOR == k) {
                count++;
            }

            // Check if there is a previous prefix such that:
            // prevPrefixXOR ^ prefixXOR == k 
            // which simplifies to prevPrefixXOR == (prefixXOR ^ k)
            if (freq.find(prefixXOR ^ k) != freq.end()) {
                count += freq[prefixXOR ^ k];
            }

            // Update frequency of the current prefix XOR
            freq[prefixXOR]++;
        }

        return count;
    }
};
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Let <code>prefixXOR[i]</code> denote the XOR of the first <code>i</code> elements (so <code>prefixXOR[0] = 0</code>). Since XOR-ing a value with itself cancels it out, the XOR of a subarray <code>arr[j..i-1]</code> equals <code>prefixXOR[i] ^ prefixXOR[j]</code> — this is the XOR analogue of the subtraction trick used for sums. We want this to equal <code>k</code>, i.e. <code>prefixXOR[i] ^ prefixXOR[j] = k</code>, which rearranges to <code>prefixXOR[j] = prefixXOR[i] ^ k</code> (XOR is its own inverse, so isolating <code>prefixXOR[j]</code> just means XOR-ing both sides by <code>k</code> again). So for each index <code>i</code>, the number of valid subarrays ending there equals the number of earlier prefix XOR values equal to <code>prefixXOR[i] ^ k</code>.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains <code>prefixXOR</code> as the running XOR of all elements processed so far, and an <code>unordered_map</code> called <code>freq</code> that tracks how many times each prefix XOR value has occurred. Unlike the sum-based counting problem, no base case of <code>freq[0] = 1</code> is seeded upfront; instead, the case where the subarray starts at index <code>0</code> (i.e., where the implicit "prefix XOR before the array" of <code>0</code> would be needed) is handled by the separate explicit check <code>if (prefixXOR == k) count++</code>, which directly accounts for whole-prefix subarrays starting at the very beginning.</p>
<p class="mb-2">For every element, <code>prefixXOR</code> is updated first via XOR. Then the code checks whether <code>prefixXOR ^ k</code> exists in <code>freq</code>; each time it does, every one of those earlier occurrences marks a valid starting point for a subarray ending at the current index with XOR exactly <code>k</code>, so <code>count</code> is incremented by the full stored frequency. Only after this lookup is the current <code>prefixXOR</code> itself recorded into <code>freq</code>, which prevents a subarray from being incorrectly matched against itself at the same index.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This mirrors the prefix-sum-with-hashmap technique exactly, but swaps addition/subtraction for XOR throughout: instead of recomputing the XOR of every possible subarray (which would be <code>O(N&sup2;)</code>), the problem is reframed as counting pairs of prefix XOR values related by <code>k</code>, and a hash map allows each such lookup in <code>O(1)</code> amortized time.</p>
<p class="mb-2">Because XOR has no notion of "increasing" or "decreasing" the way sums do, there's no risk of overflow concerns the way sum-based variants need <code>long long</code> safeguards — <code>int</code> is sufficient throughout since XOR-ing values up to <code>10<sup>9</sup></code> never produces a result exceeding that same bit-width.</p>
<p class="mb-2">For each test case, this algorithm runs in <code>O(N)</code> time (amortized, due to hash map operations) and uses <code>O(N)</code> space in the worst case to store up to <code>N</code> distinct prefix XOR values in the map — a significant improvement over the brute-force <code>O(N&sup2;)</code> approach of checking every subarray's XOR directly.</p>

</div>
</div>

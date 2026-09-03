---
title: 'Print subarray with maximum subarray sum'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Print subarray with maximum subarray sum</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an integer array <code>nums</code>, find the longest contiguous subarray (containing at least one element) with the largest sum and print the elements of that subarray. If two or more subarrays have the same length and same max sum, return the leftmost one.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains an integer <code>N</code> — the size of the array.</li>
    <li>The next line contains <code>N</code> space-separated integers representing the array elements.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print the elements of the longest maximum-sum subarray on a new line.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>nums.length</code> ≤ 10<sup>5</sup></li>
    <li>−10<sup>4</sup> ≤ <code>nums<sub>i</sub></code> ≤ 10<sup>4</sup></li>
    <li>The solution must run in <code>O(N)</code> time due to input size.</li>
</ul>
<h4 class="mb-3">Input</h4>

```
2
6
4 -1 2 1 -5 4
5
1 2 -1 -2 5
```

<h4 class="mb-3">Output</h4>

```
4 -1 2 1
1 2 -1 -2 5
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(K), where K is the size of the output subarray</p>

```C++
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> maxSubArray(vector<int>& nums) {
        long long maxSum = -2e18; // Initialize with a very small value
        long long currSum = 0;
        int start = 0, end = 0, tempStart = 0;

        for (int i = 0; i < nums.size(); i++) {
            if (currSum < 0) {
                currSum = nums[i];
                tempStart = i;
            } else {
                currSum += nums[i];
            }

            if (currSum > maxSum || (currSum == maxSum && (i - tempStart) > (end - start))) {
                maxSum = currSum;
                start = tempStart;
                end = i;
            }
        }

        vector<int> result;
        for (int i = start; i <= end; i++) {
            result.push_back(nums[i]);
        }
        return result;
    }
};
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">This is a variant of Kadane's algorithm. We need the contiguous subarray <code>nums[start..end]</code> whose sum is maximal, but with two tie-breaking rules layered on top: among all subarrays achieving the maximum sum, prefer the longest one, and among those, prefer the leftmost one. A naive Kadane's pass only tracks the best sum, so it must be extended to also track the candidate's starting index and its length so ties can be resolved correctly.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code keeps a running sum <code>currSum</code> over a "current" subarray that starts at index <code>tempStart</code>, alongside the best answer found so far, recorded as <code>maxSum</code>, <code>start</code>, and <code>end</code>:</p>
<ul>
    <li>If <code>currSum</code> has dropped below <code>0</code>, the running subarray is reset to begin fresh at the current index <code>i</code>, since any negative prefix can only drag down future sums and can never help reach a higher total.</li>
    <li>Otherwise, the current element is simply added on, extending the running subarray.</li>
</ul>
<p class="mb-2">After updating <code>currSum</code>, the code checks whether this candidate should replace the best answer so far. It does so if <code>currSum</code> strictly exceeds <code>maxSum</code>, or if it ties <code>maxSum</code> but the candidate subarray (<code>i - tempStart</code>) is strictly longer than the current best (<code>end - start</code>). This ordering of conditions automatically enforces the leftmost tie-break too: since the loop scans left to right and only overwrites on a strict improvement in sum or length, an equally-good, equally-long subarray encountered later never overwrites an earlier one.</p>
<p class="mb-2"><code>maxSum</code> is initialized to a very small sentinel (<code>-2e18</code>) rather than <code>0</code>, which is essential for correctness when every element in <code>nums</code> is negative; the answer must still be a non-empty subarray (the single largest, i.e. least negative, element), and a <code>0</code> sentinel would incorrectly suggest an empty subarray beats it.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is Kadane's algorithm augmented with index bookkeeping: instead of only tracking the best sum, it tracks the best sum together with the boundaries of the subarray that produced it, and breaks ties deterministically using length and left-to-right scan order.</p>
<p class="mb-2"><code>long long</code> is used for the running and best sums as a defensive measure against overflow, even though with <code>N ≤ 10<sup>5</sup></code> and <code>|nums<sub>i</sub>| ≤ 10<sup>4</sup></code> the true maximum possible sum (around 10<sup>9</sup>) still comfortably fits inside a 32-bit <code>int</code>.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time, satisfying the problem's requirement, and uses <code>O(K)</code> space for the output vector, where <code>K</code> is the length of the resulting subarray.</p>

</div>
</div>

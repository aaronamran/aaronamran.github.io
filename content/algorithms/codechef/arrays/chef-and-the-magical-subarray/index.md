---
title: 'Chef and the Magical Subarray'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Chef and the Magical Subarray</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef found a magical array of integers <code>arr</code> in his kitchen. He believes that somewhere inside this array, there exists a contiguous sequence of dishes (subarray) whose product of tastiness values is the highest possible. Can you help him find the maximum product among all possible subarrays?</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>N</code> — the number of elements in the array.</li>
    <li>The second line contains <code>N</code> space-separated integers representing the array elements.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Output a single integer — the maximum product of any contiguous subarray.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N</code> ≤ 2 × 10<sup>4</sup></li>
    <li>−10 ≤ <code>arr<sub>i</sub></code> ≤ 10</li>
    <li>The product of any subarray fits in a 32-bit signed integer</li>
</ul>
<h4 class="mb-3">Input</h4>

```
5
-1 -2 -3 4 -2
```

<h4 class="mb-3">Output</h4>

```
48
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <vector>
#include <algorithm>
#include <iostream>

using namespace std;

int maxProductSubarray(vector<int>& arr) {
    int n = arr.size();
    if (n == 0) return 0;

    // Initialize with the first element
    int maxProd = arr[0];
    int currMax = arr[0];
    int currMin = arr[0];

    for (int i = 1; i < n; i++) {
        int num = arr[i];

        // If the current number is negative, swapping max and min 
        // helps to potentially flip a small negative to a large positive
        if (num < 0) {
            swap(currMax, currMin);
        }

        // currMax stores the max product ending at index i
        currMax = max(num, currMax * num);
        // currMin stores the min product ending at index i
        currMin = min(num, currMin * num);

        // Update the global result
        maxProd = max(maxProd, currMax);
    }

    return maxProd;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Unlike maximum subarray sum, products behave non-monotonically with sign: a large negative product can flip into the overall maximum if multiplied by another negative number later, and any product involving <code>0</code> resets to <code>0</code>. So tracking only "the best product ending at each index" is not enough — we must also track "the worst (most negative) product ending at each index," since that worst product is exactly what's capable of becoming the new best after one more negative multiplication.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code performs a single pass while maintaining two running values, each initialized to <code>arr[0]</code>:</p>
<ul>
    <li><code>currMax</code> — the maximum product of any subarray ending exactly at the current index.</li>
    <li><code>currMin</code> — the minimum (most negative) product of any subarray ending exactly at the current index.</li>
</ul>
<p class="mb-2">At each step, if the current number <code>num</code> is negative, <code>currMax</code> and <code>currMin</code> are swapped before being updated. This is the key trick: multiplying a negative number flips the sign relationship, so what was the most negative running product becomes the candidate for the new largest product, and vice versa. After this potential swap, both running values are refreshed: <code>currMax</code> becomes <code>max(num, currMax * num)</code> and <code>currMin</code> becomes <code>min(num, currMin * num)</code>, where comparing against the bare <code>num</code> handles the case where it's better to restart the subarray at the current element entirely (for instance, right after a <code>0</code>). Finally, <code>maxProd</code>, the best answer seen across all ending positions, is updated against the freshly computed <code>currMax</code>.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is Kadane's algorithm adapted for products by tracking a max-ending-here and a min-ending-here pair instead of just one running value, with a swap-on-negative step to correctly propagate the "most negative so far" candidate into a future maximum.</p>
<p class="mb-2">A zero in the array naturally breaks the chain: since <code>currMax</code> and <code>currMin</code> are both compared against the bare <code>num</code>, a zero resets both running values to <code>0</code>, correctly preventing it from contributing to either side of any later product.</p>
<p class="mb-2">The problem statement guarantees that every subarray's product fits in a 32-bit signed integer, so plain <code>int</code> is sufficient throughout, with no need for <code>long long</code> overflow protection.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time with <code>O(1)</code> extra space, since it tracks only three scalar variables regardless of input size — a substantial improvement over the brute-force <code>O(N&sup2;)</code> approach of evaluating every subarray's product directly.</p>

</div>
</div>

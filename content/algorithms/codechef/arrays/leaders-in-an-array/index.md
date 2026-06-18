---
title: 'Leaders in an array'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Leaders in an array</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an integer array <code>nums</code>. An element is called a leader if it is strictly larger than every element to its right. The last element in the array is always considered a leader. Return a list of all such leaders, preserving the order in which they appear in the original array.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case:
    <ul>
        <li>The first line contains an integer <code>n</code> — the size of the array.</li>
        <li>The second line contains <code>n</code> integers representing the array <code>nums</code>.</li>
    </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print all leader elements in the same order they appear in the array, separated by spaces.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>nums.length</code> ≤ 10<sup>5</sup></li>
    <li>−10<sup>4</sup> ≤ <code>nums<sub>i</sub></code> ≤ 10<sup>4</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
1
6
10 7 8 3 5 2
```

<h4 class="mb-3">Output</h4>

```
10 8 5 2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> findLeaders(vector<int>& nums) {
        int n = nums.size();
        if (n == 0) return {};

        vector<int> leaders;
        // The last element is always a leader
        int maxFromRight = nums[n - 1];
        leaders.push_back(maxFromRight);

        // Traverse from the second-to-last element to the beginning
        for (int i = n - 2; i >= 0; i--) {
            if (nums[i] > maxFromRight) {
                leaders.push_back(nums[i]);
                maxFromRight = nums[i]; // Update the maximum
            }
        }

        // The list is currently [last_leader, ..., first_leader]
        // Reverse it to get [first_leader, ..., last_leader]
        reverse(leaders.begin(), leaders.end());
        
        return leaders;
    }
};
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">An element <code>nums[i]</code> is a leader exactly when it's strictly greater than every element after it, which is equivalent to saying it's strictly greater than the maximum of everything to its right. Checking this directly for every index would require comparing against all elements to the right, an <code>O(N&sup2;)</code> approach. Instead, observe that the "maximum so far, scanning from the right" can be maintained incrementally: if we process the array from the last element backward, we always know the maximum of everything we've already seen, which is exactly the maximum of everything to the right of the current position.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code initializes <code>maxFromRight</code> to <code>nums[n-1]</code>, the last element, and immediately adds it to <code>leaders</code> since the last element is always a leader by definition (it has nothing to its right to exceed). It then scans backward from index <code>n-2</code> down to <code>0</code>: for each <code>nums[i]</code>, if it's strictly greater than <code>maxFromRight</code> (which, at this point in the scan, correctly holds the maximum of all elements at indices greater than <code>i</code>), then <code>nums[i]</code> is a leader, so it's appended to <code>leaders</code> and <code>maxFromRight</code> is updated to this new, larger value.</p>
<p class="mb-2">Because the scan moves right-to-left but leaders should be reported left-to-right (in their original array order), the elements get appended to <code>leaders</code> in reverse order of how they should appear in the final answer. The code resolves this with a single <code>reverse(leaders.begin(), leaders.end())</code> call at the end, restoring the correct left-to-right order before returning.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the running-maximum-from-the-right technique: by scanning backward and maintaining the best value seen so far, each element's "is it greater than everything to its right" check collapses from an <code>O(N)</code> per-element comparison into a single <code>O(1)</code> comparison against one running variable.</p>
<p class="mb-2">The strict inequality (<code>&gt;</code>, not <code>&ge;</code>) in the comparison correctly handles duplicate values: if two equal maximum values appear, only the rightmost occurrence among them is recorded as a leader, since the leftward duplicate is not strictly greater than the rightward one already captured in <code>maxFromRight</code>.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time (one backward pass plus one reversal, both linear) and uses <code>O(N)</code> space in the worst case to store the leaders list (which occurs when the array is entirely in decreasing order, making every element a leader) — a substantial improvement over the brute-force <code>O(N&sup2;)</code> approach of checking every element against all elements to its right.</p>

</div>
</div>

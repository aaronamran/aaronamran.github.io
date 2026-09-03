---
title: 'Color Sorting Challenge'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Color Sorting Challenge</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef has an array of N balls, each painted red (0), white (1), or blue (2). Sort the array in-place so that all balls of the same color are grouped together in the order Red, White, then Blue, without using any built-in sorting functions.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains an integer <code>N</code> — the number of balls.</li>
    <li>The next line contains <code>N</code> space-separated integers representing the ball colors.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print the sorted array on a new line, where all 0s come first, followed by all 1s, then all 2s.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 10</li>
    <li>1 ≤ <code>N</code> ≤ 300</li>
    <li><code>nums[i]</code> &isin; {0, 1, 2}</li>
</ul>

<h4 class="mb-3">Input</h4>

```
7
0 2 1 2 0 1 0
```

<h4 class="mb-3">Output</h4>

```
0 0 0 1 1 2 2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void sortColors(vector<int>& nums) {
    int low = 0;                     // Boundary: next position for a 0
    int mid = 0;                     // Current scanning pointer
    int high = (int)nums.size() - 1; // Boundary: next position for a 2

    while (mid <= high) {
        if (nums[mid] == 0) {
            // Swap into the red zone and advance both low and mid
            swap(nums[low], nums[mid]);
            low++;
            mid++;
        } else if (nums[mid] == 1) {
            // Already in the correct middle zone, just move on
            mid++;
        } else {
            // Swap into the blue zone; don't advance mid since the
            // swapped-in value still needs to be classified
            swap(nums[mid], nums[high]);
            high--;
        }
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;

        // Use a vector instead of a VLA to protect stack memory
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];

        sortColors(nums);

        for (int i = 0; i < n; i++) {
            cout << nums[i] << (i == n - 1 ? "" : " ");
        }
        cout << '\n'; // '\n' is significantly faster than endl
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Since there are only three possible values, the array can be partitioned into three contiguous zones in a single pass using three boundary pointers, an approach known as the Dutch National Flag algorithm. At any point during the scan, everything before <code>low</code> is known to be <code>0</code>, everything from <code>low</code> to <code>mid - 1</code> is known to be <code>1</code>, everything after <code>high</code> is known to be <code>2</code>, and the region between <code>mid</code> and <code>high</code> is still unclassified. Maintaining this invariant throughout the scan means that by the time <code>mid</code> passes <code>high</code>, the entire array has been correctly partitioned without ever needing a full comparison-based sort.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains three pointers: <code>low</code> and <code>mid</code> both start at index <code>0</code>, and <code>high</code> starts at the last index. On each iteration, it inspects <code>nums[mid]</code>. If it's <code>0</code>, it's swapped with <code>nums[low]</code> to place it correctly in the red zone, and both <code>low</code> and <code>mid</code> advance, since the element now at <code>mid</code> (previously at <code>low</code>) is guaranteed to have already been classified as <code>1</code> in earlier iterations, or is the same <code>0</code> just placed if <code>low == mid</code>. If it's <code>1</code>, it's already correctly positioned in the middle zone, so only <code>mid</code> advances. If it's <code>2</code>, it's swapped with <code>nums[high]</code> to place it in the blue zone, and only <code>high</code> decrements — <code>mid</code> deliberately does not advance here, since the value just swapped into position <code>mid</code> from <code>high</code> hasn't been classified yet and needs to be examined on the next iteration. The loop continues until <code>mid</code> exceeds <code>high</code>, at which point every element has been correctly bucketed.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">No built-in sorting function is used anywhere, satisfying the problem's explicit requirement; the partitioning is achieved purely through pointer movement and swaps.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, though with <code>N ≤ 300</code> this problem is fast enough regardless.</p>
<p class="mb-2">This algorithm runs in a single pass of <code>O(N)</code> time, since <code>mid</code> moves forward on every iteration except when swapping with <code>high</code> (which itself is bounded by at most <code>N</code> decrements), and uses only <code>O(1)</code> extra space beyond the input vector, comfortably satisfying the problem's constraints.</p>


</div>
</div>

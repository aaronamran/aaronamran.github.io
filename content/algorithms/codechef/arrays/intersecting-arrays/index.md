---
title: 'Intersecting arrays'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Intersecting arrays</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given two integer arrays nums1 and nums2, find their intersection, where each common element appears in the result as many times as it shows in both arrays, and the result is returned in sorted order.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains two integers <code>N</code> and <code>M</code> — the size of <code>nums1</code> and <code>nums2</code>.</li>
    <li>The second line contains <code>N</code> integers — the elements of <code>nums1</code>.</li>
    <li>The third line contains <code>M</code> integers — the elements of <code>nums2</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print all the elements that appear in both arrays, in sorted order.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N, M</code> ≤ 100</li>
    <li>0 ≤ <code>a<sub>i</sub></code> ≤ 100</li>
    <li>0 ≤ <code>b<sub>i</sub></code> ≤ 100</li>
</ul>

<h4 class="mb-3">Input</h4>

```
2 3
1 2
2 1 3
```

<h4 class="mb-3">Output</h4>

```
1 2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N log N + M log M) &nbsp;•&nbsp; Space O(min(N, M))</p>

```C++
#include <bits/stdc++.h>
using namespace std;

vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {
    // Sort both arrays so a two-pointer sweep can find common elements in order
    sort(nums1.begin(), nums1.end());
    sort(nums2.begin(), nums2.end());

    vector<int> result;
    int i = 0, j = 0;

    while (i < (int)nums1.size() && j < (int)nums2.size()) {
        if (nums1[i] == nums2[j]) {
            result.push_back(nums1[i]);
            i++;
            j++;
        } else if (nums1[i] < nums2[j]) {
            i++; // Advance the pointer sitting on the smaller value
        } else {
            j++; // Advance the pointer sitting on the smaller value
        }
    }
    return result;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    cin >> n >> m;

    // Use vectors instead of VLAs to protect stack memory
    vector<int> nums1(n), nums2(m);
    for (int i = 0; i < n; i++) cin >> nums1[i];
    for (int i = 0; i < m; i++) cin >> nums2[i];

    vector<int> result = intersect(nums1, nums2);

    for (size_t i = 0; i < result.size(); i++) {
        cout << result[i] << (i == result.size() - 1 ? "" : " ");
    }
    cout << '\n'; // '\n' is significantly faster than endl

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Once both arrays are sorted, the smallest unconsumed elements of each array are directly comparable: if they're equal, that value is part of the intersection and both occurrences are consumed together; if one is smaller than the other, that smaller value can never match anything later in the other array (since it's already sorted), so its pointer can safely move forward alone. This greedy two-pointer sweep naturally produces the intersection already in sorted order, with each shared value emitted exactly as many times as it's matched between the two arrays.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code first sorts both <code>nums1</code> and <code>nums2</code> with <code>std::sort</code>. It then walks pointers <code>i</code> and <code>j</code> through the two sorted arrays simultaneously: whenever <code>nums1[i] == nums2[j]</code>, that value is appended to <code>result</code> and both pointers advance, correctly handling repeated values since each match consumes one occurrence from each array. Whenever the values differ, only the pointer pointing at the smaller value advances, since that element has no chance of matching anything still ahead in the other (sorted) array. The loop terminates once either pointer runs out of elements, at which point no further matches are possible.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int nums1[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, though with <code>N, M ≤ 100</code> this problem is fast enough regardless.</p>
<p class="mb-2">This algorithm runs in <code>O(N log N + M log M)</code> time dominated by the two sorts, with the merge sweep itself contributing only <code>O(N + M)</code>, and uses <code>O(min(N, M))</code> space for the result vector in the worst case, comfortably satisfying the problem's small constraints.</p>


</div>
</div>

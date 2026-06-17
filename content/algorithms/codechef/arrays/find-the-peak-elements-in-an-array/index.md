---
title: 'Find the Peak Elements in an Array'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Find the Peak Elements in an Array</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array A of size N, find and print all the peak elements in the array. A peak element is one that is strictly greater than its neighboring elements; for the first and last elements, only their single adjacent element is considered. If no peak element exists in the array, print -1.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains the integer <code>N</code> — the size of the array.</li>
    <li>The second line contains all <code>N</code> elements of the array <code>A</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Output all the peak elements in the array, in the order they appear in the original array. If no peak element exists, output <code>-1</code>.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N</code> ≤ 10<sup>5</sup></li>
    <li>1 ≤ <code>A<sub>i</sub></code> ≤ 10<sup>5</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
5
1 2 4 3 1
```

<h4 class="mb-3">Output</h4>

```
4
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    cin >> n;

    // Use a vector instead of a VLA to protect stack memory
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    vector<int> peaks;
    for (int i = 0; i < n; i++) {
        // Boundary elements only need to satisfy their single existing neighbor
        bool leftOk = (i == 0) || (a[i] > a[i - 1]);
        bool rightOk = (i == n - 1) || (a[i] > a[i + 1]);

        if (leftOk && rightOk) peaks.push_back(a[i]);
    }

    if (peaks.empty()) {
        cout << -1 << '\n';
    } else {
        // Print space-separated without a trailing space
        for (int i = 0; i < (int)peaks.size(); i++) {
            cout << peaks[i] << " \n"[i == (int)peaks.size() - 1];
        }
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">An element at index <code>i</code> qualifies as a peak if it is strictly greater than every neighbor it has. For interior elements, that means strictly greater than both <code>A<sub>i-1</sub></code> and <code>A<sub>i+1</sub></code>. For the first element, only the right neighbor <code>A<sub>2</sub></code> matters; for the last element, only the left neighbor matters — so boundary elements only need to beat the one neighbor they actually have.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code performs a single linear pass over the array, checking each element independently:</p>
<ul>
    <li><code>leftOk</code> is <code>true</code> either when <code>i</code> is the first index (no left neighbor to violate) or when <code>a[i]</code> strictly exceeds its left neighbor.</li>
    <li><code>rightOk</code> follows the same pattern for the right neighbor.</li>
    <li>If both conditions hold, <code>a[i]</code> is a peak and gets pushed into the <code>peaks</code> vector.</li>
</ul>
<p class="mb-2">After the pass, if <code>peaks</code> is empty, <code>-1</code> is printed; otherwise all collected peaks are printed space-separated, with the array-indexing trick <code>" \n"[i == size - 1]</code> selecting a trailing newline only after the very last peak, avoiding an unwanted trailing space.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using a standard C-style array (<code>int a[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs (up to <code>N = 10<sup>5</sup></code>).</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which prevents Time Limit Exceeded (TLE) verdicts in competitive environments.</p>
<p class="mb-2">Collecting peaks into a vector first, rather than printing each one immediately inside the scanning loop, makes it simple to detect the no-peaks case and to format the output cleanly without a trailing space.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time with a single pass and uses <code>O(N)</code> space in the worst case (an alternating array where every element could be a peak), comfortably satisfying the problem's performance constraints.</p>


</div>
</div>

---
title: 'Merge two sorted arrays'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Merge two sorted arrays</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given two sorted arrays A and B of size N and M respectively. Merge these two arrays into a single sorted array.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains two integers <code>N</code> and <code>M</code> — the size of array <code>A</code> and <code>B</code>.</li>
    <li>The second line contains all the elements of array <code>A</code>.</li>
    <li>The third line contains all the elements of array <code>B</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Output the merged array elements on a single line.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N, M</code> ≤ 100,000</li>
    <li>1 ≤ <code>A<sub>i</sub>, B<sub>i</sub></code> ≤ 100,000</li>
</ul>

<h4 class="mb-3">Input</h4>

```
5 4
1 4 8 9 10
2 3 5 6
```

<h4 class="mb-3">Output</h4>

```
1 2 3 4 5 6 8 9 10
```

<h4 class="mb-3">Input</h4>

```
1 2
10
1 2
```

<h4 class="mb-3">Output</h4>

```
1 2 10
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N + M) &nbsp;•&nbsp; Space O(N + M)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    cin >> n >> m;

    // Use vectors instead of VLAs to protect stack memory
    vector<int> a(n), b(m);
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = 0; i < m; i++) cin >> b[i];

    // Build output into a single string buffer instead of streaming
    // individual cout calls, which is much faster for large N + M
    string output;
    output.reserve((n + m) * 7);

    int i = 0, j = 0;
    while (i < n && j < m) {
        if (a[i] <= b[j]) {
            output += to_string(a[i++]);
        } else {
            output += to_string(b[j++]);
        }
        output += ' ';
    }

    // Append whichever array still has remaining elements
    while (i < n) {
        output += to_string(a[i++]);
        output += ' ';
    }
    while (j < m) {
        output += to_string(b[j++]);
        output += ' ';
    }

    if (!output.empty()) output.pop_back(); // drop trailing space
    cout << output << '\n'; // '\n' is significantly faster than endl

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Since both <code>A</code> and <code>B</code> are already individually sorted, the smallest element of the merged result must be either the current smallest unused element of <code>A</code> or the current smallest unused element of <code>B</code> — never anything further down either array. This means the merge can be built greedily from left to right: at every step, compare the next available element of each array and take the smaller one. Once one array is exhausted, every remaining element of the other array is already in sorted order and can simply be appended in bulk.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code uses the classic two-pointer merge: <code>i</code> and <code>j</code> track the next unconsumed index in <code>a</code> and <code>b</code> respectively. While both pointers are still in bounds, the code compares <code>a[i]</code> and <code>b[j]</code> and appends the smaller of the two to the output, advancing only that pointer. Using <code>&lt;=</code> for the comparison means that when values are equal, the element from <code>a</code> is emitted first, which is a stable and consistent tie-breaking rule. Once the loop ends because one pointer reaches its array's length, the two trailing <code>while</code> loops drain whichever array still has leftover elements, since those remaining elements are already sorted relative to each other and don't need further comparison.</p>
<p class="mb-2">All output is accumulated into a single reserved <code>string</code> buffer rather than issued through many small <code>cout &lt;&lt;</code> calls, with the trailing extra space trimmed off before the final print.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int a[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and batch all output into a single reserved string buffer flushed once with <code>cout</code>, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>N + M = 200,000</code> elements to print.</p>
<p class="mb-2">This algorithm runs in <code>O(N + M)</code> time, since each element from both arrays is visited and appended exactly once, and uses <code>O(N + M)</code> space for the input vectors and output buffer, comfortably satisfying the problem's constraints.</p>


</div>
</div>

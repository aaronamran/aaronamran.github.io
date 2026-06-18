---
title: 'Min To Max'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Min To Max</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an array A of size N. Let M be the minimum value present in the array initially. In one operation, you can choose an element A<sub>i</sub> (1≤i≤N) and an integer X (1≤X≤100), and set A<sub>i</sub>=X. Determine the minimum number of operations required to make M the maximum value in the array A.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code>, denoting the number of test cases.</li>
    <li>Each test case consists of multiple lines of input.
        <ul>
            <li>The first line of each test case contains a single integer <code>N</code> — the size of the array.</li>
            <li>The next line of each test case contains <code>N</code> space-separated integers <code>A<sub>1</sub>, A<sub>2</sub>, …, A<sub>N</sub></code> — the elements of the array.</li>
        </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line, the minimum number of operations required to make M the maximum value in the array A.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 100</li>
    <li>1 ≤ <code>N</code> ≤ 100</li>
    <li>1 ≤ <code>A<sub>i</sub></code> ≤ 100</li>
</ul>
<h4 class="mb-3">Input</h4>

```
3
2
1 2
4
2 2 3 4
1
1
```

<h4 class="mb-3">Output</h4>

```
1
2
0
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    cin >> t;

    while (t--) {
        int n;
        cin >> n;

        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];

        // Step 1: Find the minimum value M in a single pass
        int M = *min_element(a.begin(), a.end());

        // Step 2: Every element strictly greater than M must be
        // overwritten (set to M) so that M becomes the maximum too;
        // elements already equal to M need no operation.
        int operations = 0;
        for (int x : a) {
            if (x > M) operations++;
        }

        cout << operations << '\n'; // '\n' is significantly faster than endl
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">M is fixed as the array's original minimum and can never increase, so the only way for M to also become the maximum is to eliminate every value that currently exceeds it. Each operation can rewrite exactly one element to any value in [1, 100], and the cheapest way to neutralize an element larger than M is to set it equal to M (any operation that sets it to some value ≤ M also works, but setting it to M is sufficient and one operation always suffices per offending element — there is no benefit to "fixing" the same element twice or touching elements already equal to M).</p>
<p class="mb-2">Therefore the answer is exactly the count of elements strictly greater than M; each contributes exactly one required operation, and no fewer operations can work since every such element individually violates the "M is the maximum" condition until changed.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">For each test case, the code reads the array and uses <code>min_element</code> to find <code>M</code> in a single linear scan. It then makes a second linear pass, incrementing <code>operations</code> for every element strictly greater than <code>M</code>. Elements equal to <code>M</code> are skipped since they already satisfy the final condition, and no element can be less than <code>M</code> by definition of <code>M</code> being the minimum.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Input is read with fast I/O (<code>sync_with_stdio(false)</code>, <code>cin.tie(NULL)</code>, and <code>'\n'</code> instead of <code>endl</code>) to comfortably handle up to <code>T = 100</code> test cases with <code>N ≤ 100</code> each, though the input size here is small enough that this is more habit than necessity.</p>
<p class="mb-2"><code>std::vector&lt;int&gt;</code> is used instead of a raw array to avoid manual memory management and potential stack issues, and is reused (resized) each test case rather than re-declared, keeping the per-test-case work proportional to <code>N</code>.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time and <code>O(1)</code> extra space (beyond storing the input itself) per test case, for an overall <code>O(T·N)</code> time complexity, comfortably satisfying the problem's constraints.</p>


</div>
</div>

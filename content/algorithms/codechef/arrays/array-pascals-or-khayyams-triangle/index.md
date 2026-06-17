---
title: 'Array - Pascals or Khayyams triangle'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Array - Pascals or Khayyams triangle</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an integer N, generate and output the N<sup>th</sup> row of Pascal's triangle (also known as Khayyam's triangle). Note that elements of a row may not fit into a 32-bit signed integer data type.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code> — the number of test cases.</li>
    <li>Each test case consists of one line of input — the integer <code>N</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line the <code>N<sup>th</sup></code> row of Pascal's triangle with a single space between all elements of the row.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 30,000</li>
    <li>1 ≤ <code>N</code> ≤ 50</li>
</ul>

<h4 class="mb-3">Input</h4>

```
4
1
2
3
4
```

<h4 class="mb-3">Output</h4>

```
1
1 1
1 2 1
1 3 3 1
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) per test case &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    cin >> t;

    // Reserve space upfront to avoid repeated reallocation of the output buffer
    string output;
    output.reserve(1 << 20);

    while (t--) {
        int n;
        cin >> n;

        // row is the 0-indexed row number, so row n has n+1 entries
        long long row = n - 1;
        unsigned long long element = 1;

        for (int k = 0; k < n; k++) {
            output += to_string(element);
            output += (k == n - 1 ? '\n' : ' ');

            // Calculate next element: C(row, k+1) = C(row, k) * (row - k) / (k + 1)
            element = element * (row - k) / (k + 1);
        }
    }

    cout << output;
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">The N<sup>th</sup> row of Pascal's triangle (1-indexed) corresponds to the 0-indexed row <code>n = N - 1</code>, and its entries are the binomial coefficients <code>C(n, 0), C(n, 1), …, C(n, n)</code>. Rather than building the entire triangle from scratch with an O(N<sup>2</sup>) DP table, a single row can be generated directly using the multiplicative recurrence <code>C(n, k+1) = C(n, k) &times; (n - k) / (k + 1)</code>, starting from <code>C(n, 0) = 1</code>. This produces each successive entry in O(1) time using only the previous one.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">For each test case, the code sets <code>row = n - 1</code> and initializes <code>element = 1</code>, representing <code>C(row, 0)</code>. It then loops <code>k</code> from <code>0</code> to <code>n - 1</code>, printing the current <code>element</code> followed by a space (or newline on the last entry), then advancing to the next coefficient via the recurrence <code>element = element * (row - k) / (k + 1)</code>. Because the multiplication is always performed before the division, the intermediate product is guaranteed to be exactly divisible, so no fractional truncation occurs.</p>
<p class="mb-2">Output is accumulated into a single <code>string</code> buffer rather than being streamed to <code>cout</code> on every iteration, then flushed once at the very end — this matters here since <code>T</code> can be as large as 30,000 and frequent small writes to <code>cout</code> would otherwise add unnecessary overhead.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2"><code>unsigned long long</code> is used for <code>element</code> since the problem explicitly warns that row entries may exceed the range of a 32-bit signed integer; for <code>N</code> up to 50, the largest entry (the central binomial coefficient of row 49) comfortably fits within 64 bits.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> to speed up input, and batch all output into a reserved <code>string</code> buffer flushed with a single <code>cout</code> call, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments with up to <code>T = 30,000</code> test cases.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time per test case and uses only <code>O(1)</code> extra space beyond the output buffer, since each row is generated incrementally without ever storing the full triangle.</p>


</div>
</div>

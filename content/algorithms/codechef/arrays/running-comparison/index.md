---
title: 'Running Comparison'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Running Comparison</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Alice and Bob recently got into running, and decided to compare how much they ran on different days. They each ran for N days — on the i<sup>th</sup> day, Alice ran A<sub>i</sub> meters and Bob ran B<sub>i</sub> meters. On each day, Alice is unhappy if Bob ran strictly more than twice her distance, and happy otherwise. Similarly, Bob is unhappy if Alice ran strictly more than twice his distance, and happy otherwise. Find the number of days when both Alice and Bob were happy.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input will contain a single integer <code>T</code>, denoting the number of test cases.</li>
    <li>Each test case consists of three lines of input.</li>
    <li>The first line of each test case contains a single integer <code>N</code> — the number of days.</li>
    <li>The second line of each test case contains <code>N</code> space-separated integers <code>A<sub>1</sub>, A<sub>2</sub>, …, A<sub>N</sub></code> — the distances run by Alice on the N days.</li>
    <li>The third line of each test case contains <code>N</code> space-separated integers <code>B<sub>1</sub>, B<sub>2</sub>, …, B<sub>N</sub></code> — the distances run by Bob on the N days.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line the number of days when both Alice and Bob were happy.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 1000</li>
    <li>1 ≤ <code>N</code> ≤ 100</li>
    <li>0 ≤ <code>A<sub>i</sub></code>, <code>B<sub>i</sub></code>,  ≤ 10<sup>5</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
4
3
100 200 300
300 200 100
4
1000 1000 1000 1000
400 500 600 1200
4
800 399 1400 532
2053 2300 3400 23
5
800 850 900 950 1000
600 800 1000 1200 1400
```

<h4 class="mb-3">Output</h4>

```
1
3
0
5
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    cin >> n;
    
    // Use vectors instead of VLAs to protect stack memory
    vector<int> a(n);
    vector<int> b(n);
    
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = 0; i < n; i++) cin >> b[i];
    
    int happyDays = 0;
    for (int i = 0; i < n; i++) {
        // Core condition: Neither ran strictly more than twice the other's distance
        if (a[i] <= 2 * b[i] && b[i] <= 2 * a[i]) {
            happyDays++;
        }
    }
    cout << happyDays << '\n'; // '\n' is significantly faster than endl
}

int main() {
    // Fast I/O: Essential boilerplate for CP to optimize stream speeds
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int t;
    cin >> t;
    while (t--) {
        solve(); // Modularizing per testcase prevents variable leakage
    }
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">We need to determine how many days both Alice and Bob are satisfied with their respective running distances.</p>
<ul>
    <li><strong>Alice is happy:</strong> Bob's distance must not be strictly more than twice her own, which mathematically means <code>B<sub>i</sub> ≤ 2 × A<sub>i</sub></code>.</li>
    <li><strong>Bob is happy:</strong> Alice's distance must not be strictly more than twice his own, which mathematically means <code>A<sub>i</sub> ≤ 2 × B<sub>i</sub></code>.</li>
</ul>
<p class="mb-2">The goal is to count the total number of days where both conditions are met simultaneously.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code evaluates the records by running a single linear pass across both datasets:</p>
<ul>
    <li><code>happyDays</code> acts as an accumulator counter initialized to 0, tracking the days of mutual satisfaction.</li>
    <li>Inside the loop, the compound conditional statement <code>if (a[i] &lt;= 2 * b[i] &amp;&amp; b[i] &lt;= 2 * a[i])</code> checks both athletes' safety boundaries at the same time. If both relations hold true for day <code>i</code>, <code>happyDays</code> increments by 1.</li>
</ul>
<p class="mb-2">By checking both upper limits concurrently inside a single loop, we instantly discard any days where even one runner is unhappy.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int a[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors.</p>
<p class="mb-2">We also include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up the input/output operations, which prevents Time Limit Exceeded (TLE) verdicts in competitive environments.</p>
<p class="mb-2">This algorithm evaluates the data in <code>O(N)</code> time complexity and uses <code>O(N)</code> space complexity to store the vectors, which perfectly satisfies the problem's performance constraints.</p>


</div>
</div>
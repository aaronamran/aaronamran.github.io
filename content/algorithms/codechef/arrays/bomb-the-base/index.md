---
title: 'Bomb the Base'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Bomb the Base</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">In Chefland, there are N houses numbered from 1 to N, where the i<sup>th</sup> house has a defence system of strength A<sub>i</sub>. Chef suspects a bomb drop on one of the houses very soon. A bomb with attack strength X can destroy the i<sup>th</sup> house if A<sub>i</sub> is strictly less than X. Whenever the i<sup>th</sup> house is destroyed, all houses with indices j such that 1 ≤ j < i are destroyed as well, regardless of their own defence strength. Given one bomb with attack strength X, find the maximum number of houses that can be destroyed.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>The first line of each test case contains two integers <code>N</code> and <code>X</code>.</li>
    <li>The second line of each test case contains <code>N</code> space-separated integers <code>A<sub>1</sub>, A<sub>2</sub>, …, A<sub>N</sub></code> — the defence strengths of the houses.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line the maximum number of houses that can be destroyed if the bomb can be aimed at any house.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 100</li>
    <li>1 ≤ <code>N</code> ≤ 10<sup>5</sup></li>
    <li>1 ≤ <code>X</code> ≤ 10<sup>9</sup></li>
    <li>1 ≤ <code>A<sub>i</sub></code> ≤ 10<sup>9</sup></li>
    <li>Sum of <code>N</code> over all test cases does not exceed 10<sup>5</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
2
8 6
4 1 6 1 6 5 6 8
2 1
3 5
```

<h4 class="mb-3">Output</h4>

```
6
0
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) per test case &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    long long x; // Use long long for X to safely match A_i's comparison type
    cin >> n >> x;

    // Use vectors instead of VLAs to protect stack memory
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    int ans = 0;
    // Scan from the rightmost house backward: the first weak house found
    // is the furthest-right target, maximizing the destroyed prefix.
    for (int i = n - 1; i >= 0; i--) {
        if (a[i] < x) {
            ans = i + 1; // 1-indexed: houses 1..i+1 all get destroyed
            break;        // furthest valid target found, no need to continue
        }
    }
    cout << ans << '\n'; // '\n' is significantly faster than endl
}

int main() {
    // Fast I/O: essential boilerplate for CP to optimize stream speeds
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    cin >> t;
    while (t--) {
        solve(); // Modularizing per test case prevents variable leakage
    }
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">A single bomb targets exactly one house, but destroying house <code>i</code> destroys every house to its left as well — so the number of houses destroyed when targeting house <code>i</code> is simply <code>i</code> (1-indexed), provided <code>A<sub>i</sub> &lt; X</code>. To maximize the destroyed count, Chef should target the rightmost (highest-indexed) house whose defence is strictly weaker than <code>X</code>. If no such house exists, the bomb destroys nothing.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code scans the array from right to left:</p>
<ul>
    <li>The loop variable <code>i</code> starts at <code>n - 1</code> (the last house) and decreases toward <code>0</code>.</li>
    <li>The first house encountered with <code>a[i] &lt; x</code> is guaranteed to be the rightmost destroyable house, since the scan moves from right to left.</li>
    <li>As soon as that house is found, <code>ans</code> is set to <code>i + 1</code> (converting to 1-indexed count) and the loop breaks immediately — there's no need to keep scanning once the best target is found.</li>
    <li>If the loop finishes without finding any house weaker than <code>X</code>, <code>ans</code> stays at its initial value of <code>0</code>, correctly representing that the bomb can destroy nothing.</li>
</ul>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int a[n]</code>), we use <code>std::vector&lt;long long&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors, and to keep types consistent with <code>X</code> during comparisons.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which prevents Time Limit Exceeded (TLE) verdicts in competitive environments — especially relevant here since the sum of <code>N</code> across all test cases can reach 10<sup>5</sup>.</p>
<p class="mb-2">Wrapping the per-test-case logic in a <code>solve()</code> function, re-declared and re-read on every call, ensures no stale state leaks between test cases.</p>
<p class="mb-2">This algorithm processes each test case in <code>O(N)</code> time (with an early break the moment the answer is found) and uses <code>O(N)</code> space to store the array, comfortably satisfying the problem's performance constraints given the bound on the total sum of <code>N</code>.</p>


</div>
</div>

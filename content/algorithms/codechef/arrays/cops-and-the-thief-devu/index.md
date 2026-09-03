---
title: 'Cops and the Thief Devu'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Cops and the Thief Devu</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">There are 100 houses located on a straight line, numbered from 1 to 100. Some M of these houses are occupied by cops. Thief Devu has just stolen PeePee's bag and is hiding in one of the houses. PeePee alerts all the cops, who know Devu ran into some house. The cops run at a maximum speed of x houses per minute in a straight line and will search for a maximum of y minutes. Find how many houses are safe for Devu to hide in, given that no cop's search range can reach them.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>The first line of each test case contains three space-separated integers <code>M</code>, <code>x</code>, and <code>y</code>.</li>
    <li>The second line of each test case contains <code>M</code> space-separated integers — the house numbers where the cops reside.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line the number of houses which are safe to hide from the cops.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 10<sup>4</sup></li>
    <li>1 ≤ <code>x</code>, <code>y</code>, <code>M</code> ≤ 10</li>
</ul>
<h4 class="mb-3">Input</h4>

```
3
4 7 8
12 52 56 8
2 10 2
21 75
2 5 8
10 51
```

<h4 class="mb-3">Output</h4>

```
0
18
9
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(M · x · y) per test case &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int M, x, y;
    cin >> M >> x >> y;

    // Each cop can cover a distance of x houses/min for y minutes
    int dist = x * y;

    // Fixed-size array since the problem guarantees exactly 100 houses
    vector<bool> is_covered(101, false);

    for (int i = 0; i < M; i++) {
        int house;
        cin >> house;

        // Clamp the cop's reach to stay within valid house numbers [1, 100]
        int start = max(1, house - dist);
        int end = min(100, house + dist);

        for (int j = start; j <= end; j++) {
            is_covered[j] = true;
        }
    }

    // Count houses that remain uncovered by any cop's search range
    int safe_houses = 0;
    for (int i = 1; i <= 100; i++) {
        if (!is_covered[i]) safe_houses++;
    }
    cout << safe_houses << '\n'; // '\n' is significantly faster than endl
}

int main() {
    // Fast I/O: essential boilerplate for CP to optimize stream speeds
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int T;
    cin >> T;
    while (T--) {
        solve(); // Modularizing per test case prevents variable leakage
    }
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Each cop can search any house within a fixed distance, since moving at <code>x</code> houses per minute for up to <code>y</code> minutes gives a maximum reach of <code>dist = x &times; y</code> houses in either direction. A house is therefore unsafe if it falls within <code>[house - dist, house + dist]</code> for any cop's location, clamped to the valid range <code>[1, 100]</code>. Devu's safe houses are exactly those not covered by the union of every cop's search range.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code uses a boolean array to directly mark coverage:</p>
<ul>
    <li><code>is_covered</code> is a size-101 vector (indices 1 through 100 used), initialized entirely to <code>false</code>.</li>
    <li>For each cop's house, <code>start</code> and <code>end</code> compute the clamped boundaries of that cop's reach using <code>max(1, …)</code> and <code>min(100, …)</code>.</li>
    <li>Every house index within <code>[start, end]</code> is marked <code>true</code> in <code>is_covered</code>, directly representing the union of all cops' search ranges as they're processed.</li>
    <li>After all cops are processed, a final pass counts how many houses from 1 to 100 remain <code>false</code> — these are the safe houses.</li>
</ul>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Since the problem fixes the number of houses at exactly 100 regardless of input size, a constant-size <code>vector&lt;bool&gt;</code> of length 101 is used rather than scaling with <code>M</code>, keeping the solution simple and memory-efficient.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is good practice to avoid Time Limit Exceeded (TLE) verdicts — relevant here since <code>T</code> can reach 10<sup>4</sup> test cases.</p>
<p class="mb-2">With <code>x, y, M ≤ 10</code>, each cop's marking loop touches at most <code>2 &times; x &times; y + 1 = 21</code> houses, so the per-test-case work is tiny and well within time limits even across the maximum number of test cases.</p>
<p class="mb-2">Wrapping the per-test-case logic in a <code>solve()</code> function, with a freshly initialized <code>is_covered</code> vector on every call, ensures no stale coverage data leaks between test cases.</p>
<p class="mb-2">This algorithm runs in <code>O(M &middot; x &middot; y)</code> time per test case and uses <code>O(1)</code> space (a fixed 101-element array), comfortably satisfying the problem's performance constraints.</p>


</div>
</div>

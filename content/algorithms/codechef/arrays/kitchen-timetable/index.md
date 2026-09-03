---
title: 'Kitchen Timetable'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Kitchen Timetable</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">There are N students living in a dormitory, and the head of the dormitory has set up a kitchen usage timetable to avoid conflicts: the first student starts at time 0 and must finish by time A<sub>1</sub>, the second student starts at time A<sub>1</sub> and must finish by time A<sub>2</sub>, and so on, with the i<sup>th</sup> student starting at time A<sub>i-1</sub> and needing to finish by time A<sub>i</sub>. Each student i wants to cook pancakes requiring B<sub>i</sub> units of time. Find how many students will be able to finish cooking without violating the schedule.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code> — the number of test cases.</li>
    <li>Each test case consists of three lines of input.</li>
    <li>The first line of each test case contains a single integer <code>N</code> — the number of students.</li>
    <li>The second line contains <code>N</code> space-separated integers <code>A<sub>1</sub>, A<sub>2</sub>, …, A<sub>N</sub></code> — the deadline by which each corresponding student must finish cooking.</li>
    <li>The third line contains <code>N</code> space-separated integers <code>B<sub>1</sub>, B<sub>2</sub>, …, B<sub>N</sub></code> — the time required for each student to cook.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line the number of students who will be able to finish cooking.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 10</li>
    <li>1 ≤ <code>N</code> ≤ 10<sup>4</sup></li>
    <li>0 &lt; <code>A<sub>1</sub></code> &lt; <code>A<sub>2</sub></code> &lt; … &lt; <code>A<sub>N</sub></code> &lt; 10<sup>9</sup></li>
    <li>1 ≤ <code>B<sub>i</sub></code> ≤ 10<sup>9</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
2
3
1 10 15
1 10 3
3
10 20 30
15 5 20
```

<h4 class="mb-3">Output</h4>

```
2
1
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    cin >> n;

    // Use vectors instead of VLAs to protect stack memory
    // a[0] = 0 represents the start time of the very first student's slot
    vector<long long> a(n + 1);
    a[0] = 0;
    for (int i = 1; i <= n; i++) cin >> a[i];

    vector<long long> b(n + 1);
    for (int i = 1; i <= n; i++) cin >> b[i];

    int count = 0;
    for (int i = 1; i <= n; i++) {
        // Student i's available window is [a[i-1], a[i]], a span of a[i] - a[i-1]
        long long window = a[i] - a[i - 1];
        if (b[i] <= window) count++;
    }
    cout << count << '\n'; // '\n' is significantly faster than endl
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
<p class="mb-2">The timetable rigidly fixes each student's slot: student <code>i</code> starts exactly at <code>A<sub>i-1</sub></code> (with <code>A<sub>0</sub> = 0</code>) and must finish by <code>A<sub>i</sub></code>, giving them a fixed window of length <code>A<sub>i</sub> - A<sub>i-1</sub></code>. Crucially, these slots are independent of each other — a student cannot borrow time from a neighboring slot, and finishing early doesn't help anyone else. So a student succeeds if and only if their required cooking time <code>B<sub>i</sub></code> fits within their own fixed window:</p>
<p class="mb-2"><code>B<sub>i</sub> ≤ A<sub>i</sub> - A<sub>i-1</sub></code></p>
<p class="mb-2">The answer is simply the count of students satisfying this inequality.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code evaluates each student's slot independently in a single linear pass:</p>
<ul>
    <li><code>a[0]</code> is explicitly set to <code>0</code>, representing the start of the very first student's window, while <code>a[1..n]</code> stores the given deadlines.</li>
    <li>For each student <code>i</code> from <code>1</code> to <code>n</code>, <code>window</code> computes the available time as <code>a[i] - a[i - 1]</code>.</li>
    <li>If <code>b[i]</code> (the time that student needs) does not exceed <code>window</code>, the <code>count</code> accumulator increments by 1.</li>
</ul>
<p class="mb-2">Since the constraints guarantee <code>A<sub>1</sub> &lt; A<sub>2</sub> &lt; … &lt; A<sub>N</sub></code>, every computed <code>window</code> is guaranteed to be positive, so there's no need to guard against negative or zero-length slots.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int a[n]</code>), we use <code>std::vector&lt;long long&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2"><code>long long</code> is used for both <code>a</code> and <code>b</code> rather than <code>int</code>, since <code>A<sub>i</sub></code> and <code>B<sub>i</sub></code> can each approach 10<sup>9</sup>, and although a single value fits in a 32-bit <code>int</code>, keeping both arrays in <code>long long</code> avoids any risk of overflow or signed comparison pitfalls when computing differences.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which prevents Time Limit Exceeded (TLE) verdicts in competitive environments.</p>
<p class="mb-2">Wrapping the per-test-case logic in a <code>solve()</code> function, with fresh local vectors declared on every call, ensures no stale state leaks between test cases.</p>
<p class="mb-2">This algorithm processes each test case in <code>O(N)</code> time and uses <code>O(N)</code> space to store the input vectors, comfortably satisfying the problem's performance constraints.</p>


</div>
</div>

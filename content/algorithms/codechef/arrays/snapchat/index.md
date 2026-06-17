---
title: 'Snapchat'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Snapchat</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">The most popular feature on snapchat is Snapchat Streak. A streak is maintained between two people if both of them send at least one snap to each other daily. If, on any day, either person forgets to send at least one snap, the streak breaks and the streak count is set to 0.
Chef and Chefina like maintaining their snapchat streak. You observed the snap count of both of them for N consecutive days. On the i<sup>th</sup> day, Chef sent A<sub>i</sub> snaps to Chefina while Chefina sent B<sub>i</sub> snaps to Chef. Find the maximum streak count they achieved in those N days.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input will contain a single integer <code>T</code>, denoting the number of test cases. The description of the test cases follows.</li>
    <li>Each test case consists of multiple lines of input.</li>
    <li>The first line of the test case contains an integer <code>N</code> — the number of days you observed.</li>
    <li>The second line contains <code>N</code> space-separated integers — <code>A<sub>1</sub>, A<sub>2</sub>, …, A<sub>N</sub></code>, the number of snaps Chef sent to Chefina on the i<sup>th</sup> day.</li>
    <li>The third line contains <code>N</code> space-separated integers — <code>B<sub>1</sub>, B<sub>2</sub>, …, B<sub>N</sub></code>, the number of snaps Chefina sent to Chef on the i<sup>th</sup> day.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line, the maximum streak count they achieved in those N days.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 100</li>
    <li>1 ≤ <code>N</code> ≤ 1000</li>
    <li>0 ≤ <code>A<sub>i</sub></code>, <code>B<sub>i</sub></code>,  ≤ 100</li>
</ul>
<h4 class="mb-3">Input</h4>

```
4
3
3 1 2
2 4 1
2
0 0
10 10
4
5 4 0 2
3 1 1 0
5
0 1 1 2 0
1 1 0 0 3
```

<h4 class="mb-3">Output</h4>

```
3
0
2
1
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    cin >> n;
    
    // Using vectors instead of standard arrays
    vector<int> a(n), b(n);
    for(int i = 0; i < n; i++) cin >> a[i];
    for(int i = 0; i < n; i++) cin >> b[i];

    int max_streak = 0;
    int current_streak = 0;

    for(int i = 0; i < n; i++) {
        if(a[i] > 0 && b[i] > 0) {
            current_streak++;
            max_streak = max(max_streak, current_streak); // Shorthand cleaner way to update max
        } else {
            current_streak = 0;
        }
    }
    cout << max_streak << '\n';
}

int main() {
    // Fast I/O for Competitive Programming
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int t;
    cin >> t;
    while(t--) {
        solve(); // Moving logic to a separate function keeps code modular
    }
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">We need to find the longest consecutive sequence of days where both Chef and Chefina successfully exchanged snaps.</p>
<ul>
    <li><strong>A streak day:</strong> Both <code>A<sub>i</sub> > 0</code> and <code>B<sub>i</sub> > 0</code> must be true simultaneously.</li>
    <li><strong>A broken day:</strong> If either <code>A<sub>i</sub> = 0</code> or <code>B<sub>i</sub> = 0</code>, the streak immediately resets back to zero.</li>
</ul>
<p class="mb-2">The goal is to capture the highest value the streak ever reached before resetting.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code uses a single pass loop over the arrays to track both the live sequence and the historical record:</p>
<ul>
    <li><code>current_streak</code> acts as a counter that increments by 1 every day both users send a snap. It drops to 0 the moment anyone fails.</li>
    <li><code>max_streak = max(max_streak, current_streak);</code> takes a snapshot of the high score. It updates only when the current streak surpasses the best streak seen so far.</li>
</ul>
<p class="mb-2">By checking and updating the maximum inside the loop, we ensure that even if a streak breaks later on, its peak value is safely recorded.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int a[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors.</p>
<p class="mb-2">We also include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up the input/output operations, which prevents Time Limit Exceeded (TLE) verdicts in competitive environments.</p>
<p class="mb-2">This algorithm evaluates the data in <code>O(N)</code> time complexity and uses <code>O(N)</code> space complexity, which perfectly satisfies the problem's performance constraints.</p>


</div>
</div>
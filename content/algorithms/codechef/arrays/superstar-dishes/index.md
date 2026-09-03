---
title: 'Superstar Dishes'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Superstar Dishes</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef served n different dishes at a Grand Feast, and each friend picked their favourite. Find all dishes that were chosen by more than floor(n/3) friends, and print them in increasing order. By the pigeonhole principle, at most two such dishes can exist.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>n</code> — the number of dishes.</li>
    <li>The next line contains <code>n</code> space-separated integers — the dishes chosen by friends.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print on a new line all dishes chosen by more than <code>floor(n/3)</code> friends, in increasing order. If no such dish exists, print nothing.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>n</code> ≤ 50,000</li>
    <li>-10<sup>9</sup> ≤ <code>a[i]</code> ≤ 10<sup>9</sup></li>
    <li>The output may contain at most two dishes (by the pigeonhole principle).</li>
</ul>

<h4 class="mb-3">Input</h4>

```
6
2 2 1 1 1 2
```

<h4 class="mb-3">Output</h4>

```
1 2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

vector<long long> findSuperstarDishes(vector<long long>& a, long long n) {
    long long el1 = LLONG_MIN, el2 = LLONG_MIN;
    long long cnt1 = 0, cnt2 = 0;

    // Phase 1: Generalized Boyer-Moore voting for up to two candidates
    for (long long x : a) {
        if (x == el1) cnt1++;
        else if (x == el2) cnt2++;
        else if (cnt1 == 0) { el1 = x; cnt1 = 1; }
        else if (cnt2 == 0) { el2 = x; cnt2 = 1; }
        else { cnt1--; cnt2--; }
    }

    // Phase 2: Validate the surviving candidates with a true count
    cnt1 = 0; cnt2 = 0;
    for (long long x : a) {
        if (x == el1) cnt1++;
        else if (x == el2) cnt2++;
    }

    vector<long long> ans;
    if (cnt1 > n / 3) ans.push_back(el1);
    if (cnt2 > n / 3) ans.push_back(el2);

    sort(ans.begin(), ans.end());
    return ans;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long n;
    cin >> n;

    // Use a vector instead of a VLA to protect stack memory
    vector<long long> a(n);
    for (long long i = 0; i < n; i++) cin >> a[i];

    vector<long long> ans = findSuperstarDishes(a, n);

    for (size_t i = 0; i < ans.size(); i++) {
        cout << ans[i] << (i == ans.size() - 1 ? "" : " ");
    }
    cout << '\n'; // '\n' is significantly faster than endl

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">By the pigeonhole principle, at most two distinct values can each appear more than <code>n/3</code> times in an array of size <code>n</code>, since three such values would together require strictly more than <code>n</code> total occurrences. This generalizes the classic Boyer-Moore majority vote (which tracks one candidate for "more than <code>n/2</code>") into a two-candidate version: maintain two running candidates and two counters, and whenever an element doesn't match either current candidate, weaken both counters together rather than just one, treating it as opposition to both. Any value with a true count exceeding <code>n/3</code> is guaranteed to survive this voting process as one of the two final candidates, although the converse isn't guaranteed, so the survivors still need to be checked against the real threshold afterward.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code runs two phases. In the voting phase, it tracks two candidate values <code>el1</code> and <code>el2</code> with associated counters <code>cnt1</code> and <code>cnt2</code>. For each element <code>x</code>: if it matches an existing candidate, that candidate's counter increments; if it doesn't match either candidate but one counter is currently <code>0</code>, <code>x</code> takes over that empty slot as a fresh candidate with count <code>1</code>; and if neither slot is free, both counters are decremented together, representing <code>x</code> opposing both current candidates at once. After this pass, <code>el1</code> and <code>el2</code> hold the only two values that could possibly exceed the <code>n/3</code> threshold. The validation phase then does a straightforward second pass over the array, counting the real number of occurrences of <code>el1</code> and <code>el2</code> specifically, and only values whose true count exceeds <code>n / 3</code> are kept in the final answer. The result is sorted before being returned to satisfy the required ascending order.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>long long a[n]</code>), we use <code>std::vector&lt;long long&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2"><code>long long</code> is used throughout since <code>a[i]</code> can be as large in magnitude as 10<sup>9</sup>, and using <code>LLONG_MIN</code> as the initial sentinel candidate value avoids any risk of accidentally colliding with a real input value the way a smaller sentinel like <code>INT_MIN</code> conceivably might in an adjacent problem with wider bounds.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>n = 50,000</code> elements.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time across its two linear passes and uses only <code>O(1)</code> extra space beyond the input vector and the small fixed-size answer vector, comfortably satisfying the problem's constraints.</p>


</div>
</div>
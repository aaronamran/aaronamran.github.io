---
title: 'Count max Subarray'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Count max Subarray</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array <code>arr</code> of <code>N</code> integers and an integer <code>K</code>, find the number of subarrays whose maximum value is equal to <code>K</code>.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains two integers <code>N</code> and <code>K</code> — the size of <code>arr</code> and the maximum value that should be in the subarray.</li>
    <li>The second line contains <code>N</code> integers <code>arr<sub>1</sub>, arr<sub>2</sub>, …, arr<sub>n</sub></code> — the elements of <code>arr</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print the number of subarrays having <code>K</code> as the maximum value.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N, K</code> ≤ 10000</li>
    <li>0 ≤ <code>arr<sub>i</sub></code> ≤ 10000</li>
</ul>
<h4 class="mb-3">Input</h4>

```
4 3
2 1 3 4
```

<h4 class="mb-3">Output</h4>

```
3
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

// Helper to count subarrays where all elements are <= limit
long long countAtMost(int arr[], int N, int limit) {
    long long total = 0;
    long long count = 0;
    for (int i = 0; i < N; i++) {
        if (arr[i] <= limit) {
            count++;
        } else {
            total += (count * (count + 1)) / 2;
            count = 0;
        }
    }
    total += (count * (count + 1)) / 2;
    return total;
}

int countSubarrays(int arr[], int N, int K) {
    // Result is (subarrays with max <= K) - (subarrays with max <= K-1)
    return countAtMost(arr, N, K) - countAtMost(arr, N, K - 1);
}

int main() {
    int N, K;
    if (!(cin >> N >> K)) return 0;
    int arr[N];
    for (int i = 0; i < N; i++) {
        cin >> arr[i];
    }
    cout << countSubarrays(arr, N, K) << endl;
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Directly counting subarrays whose maximum equals exactly <code>K</code> is awkward, since the maximum of a subarray changes unpredictably as it grows or shrinks. The standard trick is to instead define <code>f(limit)</code> = the number of subarrays where every element is <code>≤ limit</code> (equivalently, where the maximum is <code>≤ limit</code>). Then the count of subarrays whose maximum is exactly <code>K</code> can be obtained by subtraction: <code>f(K) - f(K-1)</code>, since every subarray counted in <code>f(K)</code> but not in <code>f(K-1)</code> must contain at least one element equal to <code>K</code> and no element exceeding <code>K</code> — meaning its maximum is exactly <code>K</code>.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The helper function <code>countAtMost(arr, N, limit)</code> computes <code>f(limit)</code> using a classic "break at violations" scan: it walks through the array maintaining <code>count</code>, the length of the current run of consecutive elements all <code>≤ limit</code>. Whenever an element exceeds <code>limit</code>, that run is closed off, and the number of subarrays entirely within a run of length <code>count</code> is added to <code>total</code> using the formula <code>count * (count + 1) / 2</code> (the number of contiguous subarrays fully inside a segment of that length), after which <code>count</code> resets to <code>0</code> to start tracking the next run. A final flush after the loop ends accounts for whatever run was still open when the array finished.</p>
<p class="mb-2"><code>countSubarrays</code> then simply computes <code>countAtMost(arr, N, K) - countAtMost(arr, N, K - 1)</code> to isolate subarrays whose maximum is exactly <code>K</code>, as derived above. Each call to <code>countAtMost</code> independently re-scans the array with a different threshold, but since each scan is itself linear, the combined cost stays linear overall.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the "count subarrays with max ≤ X" decomposition technique: rather than tracking a sliding-window maximum directly, the problem is split into two simpler counting subproblems whose difference gives the exact answer, with each subproblem solvable by a single linear pass that sums up triangular-number counts of valid runs.</p>
<p class="mb-2"><code>long long</code> is used inside <code>countAtMost</code> as a defensive measure, since the number of subarrays in a single run of length <code>N</code> (up to <code>10000</code>) can reach roughly <code>5 × 10<sup>7</sup></code>, which still technically fits in a 32-bit <code>int</code> here but is kept as <code>long long</code> as safe practice for this style of triangular-sum computation.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time overall (two linear passes, each <code>O(N)</code>) and uses <code>O(1)</code> extra space beyond the input array, since both <code>countAtMost</code> calls only maintain a couple of scalar accumulators — a substantial improvement over a brute-force <code>O(N&sup2;)</code> approach of checking every subarray's maximum directly.</p>

</div>
</div>

---
title: 'Maximum Subarray'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Maximum Subarray</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given two arrays <code>A</code> and <code>B</code> of sizes <code>N</code> and <code>M</code> respectively, repeatedly choose either the first or last element of <code>B</code>, insert it into either the front or back of <code>A</code>, and remove it from <code>B</code>, until <code>B</code> is empty. Find the maximum sum of any subarray of <code>A</code> achievable after performing exactly <code>M</code> operations.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case:
    <ul>
        <li>The first line contains a single integer <code>N</code> — the size of array <code>A</code>.</li>
        <li>The next line contains <code>N</code> space-separated integers, the elements of <code>A</code>.</li>
        <li>The third line contains a single integer <code>M</code> — the size of array <code>B</code>.</li>
        <li>The next line contains <code>M</code> space-separated integers, the elements of <code>B</code>.</li>
    </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line the maximum sum of any subarray of array <code>A</code> achievable after performing exactly <code>M</code> operations.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 10</li>
    <li>1 ≤ <code>N</code> ≤ 10<sup>5</sup></li>
    <li>1 ≤ <code>M</code> ≤ 10<sup>5</sup></li>
    <li>−10<sup>8</sup> ≤ <code>A<sub>i</sub>, B<sub>i</sub></code> ≤ 10<sup>8</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
3
5
3 26 -79 72 23
2
66 44
1
81
1
-97
5
10 -5 14 -20 4
3
-10 5 -2
```

<h4 class="mb-3">Output</h4>

```
205
81
24
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N + M) per test case &nbsp;•&nbsp; Space O(N + M)</p>

```C++
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

typedef long long lli;

// Standard Kadane's algorithm to find max subarray sum
lli kadane(const vector<lli>& a) {
    lli max_so_far = -1e18; // Initialize with a very small value
    lli current_max = 0;
    for (lli x : a) {
        current_max += x;
        if (max_so_far < current_max) max_so_far = current_max;
        if (current_max < 0) current_max = 0;
    }
    return max_so_far;
}

void solve() {
    int n, m;
    cin >> n;
    vector<lli> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    cin >> m;
    vector<lli> b(m);
    lli sum_pos = 0;
    for (int i = 0; i < m; i++) {
        cin >> b[i];
        if (b[i] > 0) sum_pos += b[i];
    }

    // Option 1: Max subarray sum of original A
    lli ans = kadane(a);

    // Option 2: Add all positive B to the front
    vector<lli> front_a = a;
    front_a.insert(front_a.begin(), sum_pos);
    ans = max(ans, kadane(front_a));

    // Option 3: Add all positive B to the back
    vector<lli> back_a = a;
    back_a.push_back(sum_pos);
    ans = max(ans, kadane(back_a));

    cout << ans << endl;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int t;
    cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">All <code>M</code> elements of <code>B</code> must eventually be inserted into <code>A</code>, but each insertion always lands at the current front or back of <code>A</code>. This means every element taken from <code>B</code> ends up forming one contiguous block attached to either the left end or the right end of the original <code>A</code> — elements from <code>B</code> can never be interleaved into the middle of <code>A</code>, and crucially, they can never be split across both ends, since once even one element from <code>B</code> is placed on one side, every subsequent insertion still has the choice of side, but mixing sides would only ever hurt a contiguous subarray that wants to include both an A-suffix/prefix and B-elements together. Within that single block of <code>B</code>-elements (on whichever side it's built), since the block itself can be freely reordered by choosing which end of <code>B</code> to pull from and which end of the block to place it at, the elements of <code>B</code> can be arranged in any order — so the best a contiguous subarray can do with the <code>B</code>-block is take a contiguous prefix or suffix of it, and the maximum such sum is achieved by including only the positive elements (dropping all negatives), since any reachable contiguous segment's sum is upper-bounded by the sum of all positive elements. So the problem reduces to: try inserting one combined "super-element" equal to the sum of <code>B</code>'s positive elements at the front of <code>A</code>, try it at the back of <code>A</code>, and also consider not using any of <code>B</code> at all (in case all of <code>B</code> is negative and best left untouched) — then run Kadane's algorithm on each candidate array and take the overall best.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code reads in array <code>a</code> normally, then reads <code>b</code> while accumulating <code>sum_pos</code>, the sum of only the positive elements of <code>B</code>. Three candidate arrays are then evaluated with the helper function <code>kadane</code>, which implements the standard maximum-subarray-sum algorithm: it maintains <code>current_max</code> as the best sum of a subarray ending at the current position, resetting it to <code>0</code> whenever it goes negative (since a negative running sum can never help a future subarray), while <code>max_so_far</code> tracks the best value seen across the whole array.</p>
<ul>
    <li><code>ans</code> starts as <code>kadane(a)</code> — the best subarray sum using only the original <code>A</code>, ignoring <code>B</code> entirely.</li>
    <li><code>front_a</code> prepends <code>sum_pos</code> as a single element to the front of <code>A</code>, modeling the case where all of <code>B</code>'s positive contribution is attached to the left end.</li>
    <li><code>back_a</code> appends <code>sum_pos</code> to the back of <code>A</code>, modeling the symmetric case on the right end.</li>
</ul>
<p class="mb-2">Collapsing all of <code>B</code>'s useful contribution into one combined element is valid specifically because Kadane's algorithm only cares about a contiguous segment's total sum, not the count or order of individual elements within it; since any best achievable subarray either fully includes the <code>B</code>-block's positive sum or doesn't touch it at all, representing it as a single super-element produces exactly the same optimal answer while keeping the array small. The final answer is the maximum of the three candidates.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">The key insight is that <code>B</code>'s elements always attach as one contiguous block to one end of <code>A</code>, never interleaved or split, which collapses an apparently complex insertion process into a simple three-way comparison: ignore <code>B</code>, attach its positive sum to the front, or attach its positive sum to the back.</p>
<p class="mb-2"><code>long long</code> is used throughout (via the <code>lli</code> typedef) since with <code>N, M ≤ 10<sup>5</sup></code> and values up to <code>10<sup>8</sup></code> in magnitude, the maximum possible subarray sum can reach roughly <code>2 × 10<sup>13</sup></code>, which overflows a 32-bit <code>int</code>.</p>
<p class="mb-2">This algorithm runs in <code>O(N + M)</code> time per test case, since reading the arrays and running Kadane's algorithm a constant number of times are both linear operations, and uses <code>O(N + M)</code> space to store the input and candidate arrays.</p>

</div>
</div>

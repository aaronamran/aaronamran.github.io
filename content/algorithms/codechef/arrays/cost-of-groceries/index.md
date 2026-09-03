---
title: 'Cost of Groceries'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Cost of Groceries</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef visited a grocery store for fresh supplies. There are N items in the store where the i<sup>th</sup> item has a freshness value of A<sub>i</sub> and cost B<sub>i</sub>. Chef has decided to purchase all the items having a freshness value greater than equal to X. Find the total cost of the groceries Chef buys.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input will contain a single integer <code>T</code>, denoting the number of test cases.</li>
    <li>Each test case consists of multiple lines of input.</li>
    <li>The first line of each test case contains two space-separated integers <code>N</code> and <code>X</code> — the number of items and the minimum freshness value an item should have.</li>
    <li>The second line contains <code>N</code> space-separated integers, the array <code>A</code>, denoting the freshness value of each item.</li>
    <li>The third line contains <code>N</code> space-separated integers, the array <code>B</code>, denoting the cost of each item.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line, the total cost of the groceries Chef buys.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 100</li>
    <li>1 ≤ <code>N, X</code> ≤ 100</li>
    <li>0 ≤ <code>A<sub>i</sub></code>, <code>B<sub>i</sub></code>,  ≤ 100</li>
</ul>
<h4 class="mb-3">Input</h4>

```
4
2 20
15 67
10 90
3 1
1 2 3
1 2 3
3 100
10 90 50
30 7 93
4 50
12 78 50 40
40 30 20 10
```

<h4 class="mb-3">Output</h4>

```
90
6
0
50
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

// Function to solve a single testcase
void solve() {
    int n, x;
    cin >> n >> x;
    
    vector<int> a(n);
    vector<int> b(n);
    
    // Read freshness values
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    
    // Read cost values
    for (int i = 0; i < n; i++) {
        cin >> b[i];
    }
    
    int totalCost = 0;
    
    // Calculate total cost for items meeting the freshness threshold
    for (int i = 0; i < n; i++) {
        if (a[i] >= x) {
            totalCost += b[i];
        }
    }
    
    cout << totalCost << '\n';
}

int main() {
    // Optimize standard input/output streams for speed in CP
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
<p class="mb-2">We need to calculate the total financial cost of purchasing all grocery items that meet a specific quality standard.</p>
<ul>
    <li><strong>Eligible item:</strong> The item's freshness value must satisfy the condition <code>A<sub>i</sub> ≥ X</code>.</li>
    <li><strong>Ineligible item:</strong> If the freshness value <code>A<sub>i</sub> &lt; X</code>, the item is ignored, and its cost contributes nothing to the total.</li>
</ul>
<p class="mb-2">The goal is to compute the sum of the costs (<code>B<sub>i</sub></code>) only for the items that pass the freshness threshold.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code processes the data systematically by checking each item exactly once in a single linear pass:</p>
<ul>
    <li><code>totalCost</code> acts as an accumulator, initialized to 0, which keeps a running total of the money spent.</li>
    <li>Inside the loop, the conditional statement <code>if (a[i] >= x)</code> filters the items. When an item qualifies, its corresponding price <code>b[i]</code> is immediately added to <code>totalCost</code> using the addition assignment operator.</li>
</ul>
<p class="mb-2">By tracking this conditionally within a single pass, we ensure that every item is evaluated precisely in sync with its own price index.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int a[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors.</p>
<p class="mb-2">We also include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up the input/output operations, which prevents Time Limit Exceeded (TLE) verdicts in competitive environments.</p>
<p class="mb-2">This algorithm evaluates the data in <code>O(N)</code> time complexity and uses <code>O(N)</code> space complexity to store the vectors, which perfectly satisfies the problem's performance constraints.</p>


</div>
</div>
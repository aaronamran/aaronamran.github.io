---
title: 'Workers'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Workers</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">There are N workers; each worker is of one of three types: a translator translates text from Chef's language to another language, an author writes text in Chef's language, and an author-translator can do both. Chef wants a text written and translated into some other language, but cannot do either task himself — he must hire workers, and hiring the i<sup>th</sup> worker costs c<sub>i</sub> coins. Find the minimum total coins needed so that both writing and translation get done. It is guaranteed that this is possible.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>N</code> — the number of workers.</li>
    <li>The second line contains <code>N</code> space-separated integers <code>c<sub>1</sub>, c<sub>2</sub>, …, c<sub>N</sub></code> — the cost to hire each worker.</li>
    <li>The third line contains <code>N</code> space-separated integers <code>t<sub>1</sub>, t<sub>2</sub>, …, t<sub>N</sub></code> — the type of each worker: <code>1</code> for translator, <code>2</code> for author, <code>3</code> for author-translator.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print a single line containing the minimum number of coins Chef has to pay.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N</code> ≤ 1,000</li>
    <li>1 ≤ <code>c<sub>i</sub></code> ≤ 100,000 for each valid <code>i</code></li>
    <li>1 ≤ <code>t<sub>i</sub></code> ≤ 3 for each valid <code>i</code></li>
</ul>
<h4 class="mb-3">Subtasks</h4>
<ul>
    <li><strong>Subtask #1 (15 points):</strong> all workers are author-translators</li>
    <li><strong>Subtask #2 (85 points):</strong> original constraints</li>
</ul>
<h4 class="mb-3">Input</h4>

```
5
1 3 4 6 8
1 2 1 2 3
```

<h4 class="mb-3">Output</h4>

```
4
```

<h4 class="mb-3">Input</h4>

```
4
10 8 2 5
1 2 3 3
```

<h4 class="mb-3">Output</h4>

```
2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    cin >> n;

    // Use vectors instead of VLAs to protect stack memory
    vector<int> c(n), t(n);
    for (int i = 0; i < n; i++) cin >> c[i];
    for (int i = 0; i < n; i++) cin >> t[i];

    const int INF = 1e9;
    int minTranslator = INF;
    int minAuthor = INF;
    int minBoth = INF;

    for (int i = 0; i < n; i++) {
        if (t[i] == 1) minTranslator = min(minTranslator, c[i]);
        else if (t[i] == 2) minAuthor = min(minAuthor, c[i]);
        else minBoth = min(minBoth, c[i]); // t[i] == 3
    }

    // Use long long to safely sum two large sentinel/cost values
    long long separateCost = (long long)minTranslator + minAuthor;
    long long ans = min((long long)minBoth, separateCost);

    cout << ans << '\n'; // '\n' is significantly faster than endl

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Chef needs both a writing task and a translation task completed, and only has two ways to cover both:</p>
<ul>
    <li><strong>Hire separately:</strong> pick the cheapest pure translator (<code>t<sub>i</sub> = 1</code>) and the cheapest pure author (<code>t<sub>i</sub> = 2</code>), paying the sum of both.</li>
    <li><strong>Hire one generalist:</strong> pick the cheapest author-translator (<code>t<sub>i</sub> = 3</code>), who alone covers both tasks.</li>
</ul>
<p class="mb-2">The answer is the smaller of these two options. Mixing a translator with an author-translator, or hiring two author-translators, can never beat just hiring the single cheapest author-translator, since one author-translator alone is sufficient and adding more workers only adds cost.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code makes a single linear pass over the workers, tracking three running minimums:</p>
<ul>
    <li><code>minTranslator</code> — the cheapest worker with <code>t[i] == 1</code>.</li>
    <li><code>minAuthor</code> — the cheapest worker with <code>t[i] == 2</code>.</li>
    <li><code>minBoth</code> — the cheapest worker with <code>t[i] == 3</code>.</li>
</ul>
<p class="mb-2">All three are initialized to a sentinel <code>INF</code> larger than any possible cost, so a missing type naturally fails to undercut a valid option. After the pass, <code>separateCost</code> sums the two specialist minimums, and the final answer takes <code>min(minBoth, separateCost)</code>.</p>
<p class="mb-2">The problem guarantees a valid solution exists, so at least one of <code>minBoth</code> or <code>(minTranslator + minAuthor)</code> is guaranteed to be a real, achievable value rather than leftover infinity.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int c[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments — though with <code>N ≤ 1,000</code> this problem is fast enough either way.</p>
<p class="mb-2">The summed cost is stored in a <code>long long</code> as a defensive habit against overflow, even though with these constraints (<code>c<sub>i</sub> ≤ 100,000</code>) a 32-bit <code>int</code> would not actually overflow here.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time and uses <code>O(N)</code> space to store the input vectors, comfortably satisfying the problem's constraints.</p>


</div>
</div>
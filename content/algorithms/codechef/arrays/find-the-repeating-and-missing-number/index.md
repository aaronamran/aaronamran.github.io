---
title: 'Find the repeating and missing number'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Find the repeating and missing number</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an integer array arr of size n containing numbers in the range [1, n], where exactly one number appears twice (the repeating number) and exactly one number is missing from the range. Find both numbers without modifying the original array.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains a single integer <code>n</code> — the size of the array.</li>
    <li>The second line contains <code>n</code> space-separated integers representing the array <code>arr</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print two space-separated integers: the repeating number, followed by the missing number.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 10</li>
    <li>2 ≤ <code>n</code> ≤ 100,000</li>
    <li><code>n</code> equals the length of the array</li>
    <li>1 ≤ <code>arr[i]</code> ≤ <code>n</code> for each valid <code>i</code></li>
    <li>Exactly one number appears twice, and exactly one number is missing.</li>
    <li>The original array must not be modified.</li>
</ul>

<h4 class="mb-3">Input</h4>

```
2
5
4 1 2 2 5
7
7 1 3 4 5 6 7
```

<h4 class="mb-3">Output</h4>

```
2 3
7 2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

pair<int, int> findRepeatingAndMissing(const vector<int>& arr) {
    int n = arr.size();

    // Use a frequency vector of size n+1 (indices 1..n used, 0 unused)
    vector<int> freq(n + 1, 0);

    // Count occurrences without touching the original array
    for (int num : arr) {
        freq[num]++;
    }

    int repeating = -1, missing = -1;
    for (int i = 1; i <= n; i++) {
        if (freq[i] == 2) repeating = i;
        else if (freq[i] == 0) missing = i;
    }

    return {repeating, missing};
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;

        // Use a vector instead of a VLA to protect stack memory
        vector<int> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];

        pair<int, int> ans = findRepeatingAndMissing(arr);

        cout << ans.first << " " << ans.second << '\n'; // '\n' is significantly faster than endl
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">A valid array of this kind would normally contain every integer from <code>1</code> to <code>n</code> exactly once. Here, one value is duplicated and another is entirely absent, so counting how many times each candidate value from <code>1</code> to <code>n</code> actually appears in the array directly reveals both anomalies: the value with a count of <code>2</code> is the repeating number, and the value with a count of <code>0</code> is the missing one. Every other value will show a count of exactly <code>1</code>, as expected in a normal permutation.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code allocates a separate <code>freq</code> vector of size <code>n + 1</code>, distinct from the input array, so the original <code>arr</code> is never touched — satisfying the problem's explicit no-modification requirement. It makes one pass over <code>arr</code>, incrementing <code>freq[num]</code> for each value encountered. It then makes a second pass over the range <code>1</code> to <code>n</code>, checking each index's count: a count of <code>2</code> marks that index as the <code>repeating</code> value, and a count of <code>0</code> marks it as the <code>missing</code> value. Once both passes finish, <code>repeating</code> and <code>missing</code> hold the two required answers.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int arr[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">A dedicated frequency array (rather than any in-place marking trick on <code>arr</code> itself, such as negating visited values) is used specifically because the problem forbids modifying the original array.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>n = 100,000</code> elements across up to <code>T = 10</code> test cases.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time across its two linear passes per test case, and uses <code>O(N)</code> space for the frequency vector, comfortably satisfying the problem's constraints.</p>


</div>
</div>
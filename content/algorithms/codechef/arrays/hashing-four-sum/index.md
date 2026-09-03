---
title: 'Hashing - Four Sum'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Hashing - Four Sum</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array A of N integers and an integer X, find all unique quadruples (a, b, c, d) with a &le; b &le; c &le; d such that a + b + c + d = X. Two quadruples are different if at least one element differs, and an array element can be used at most once per quadruple. Quadruples must be printed in lexicographically increasing order.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains two space-separated integers <code>N</code> and <code>X</code> — the number of elements and the target sum.</li>
    <li>The next line contains <code>N</code> space-separated integers, the elements of the array.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output <code>M + 1</code> lines, where <code>M</code> is the number of unique quadruples: first a single integer <code>M</code>, then <code>M</code> lines each containing four space-separated integers (a, b, c, d) in lexicographically increasing order.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 1,000</li>
    <li>4 ≤ <code>N</code> ≤ 200</li>
    <li>-10<sup>9</sup> ≤ <code>X</code> ≤ 10<sup>9</sup></li>
    <li>-100,000 ≤ <code>A<sub>i</sub></code> ≤ 100,000</li>
    <li>The sum of <code>N</code> over all test cases won't exceed 20,000.</li>
</ul>

<h4 class="mb-3">Input</h4>

```
3
4 4
1 1 1 1
4 5
1 1 1 1
6 6
1 2 3 2 1 0
```

<h4 class="mb-3">Output</h4>

```
1
1 1 1 1
0
2
0 1 2 3
1 1 2 2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N&sup3;) per test case &nbsp;•&nbsp; Space O(N) (excluding output)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    long long x;
    cin >> n >> x;

    // Use a vector instead of a VLA to protect stack memory
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    sort(a.begin(), a.end());
    vector<array<int, 4>> result;

    for (int i = 0; i < n - 3; i++) {
        // Skip duplicate values for the first slot
        if (i > 0 && a[i] == a[i - 1]) continue;

        for (int j = i + 1; j < n - 2; j++) {
            // Skip duplicate values for the second slot
            if (j > i + 1 && a[j] == a[j - 1]) continue;

            int left = j + 1;
            int right = n - 1;
            while (left < right) {
                long long sum = (long long)a[i] + a[j] + a[left] + a[right];

                if (sum == x) {
                    result.push_back({a[i], a[j], a[left], a[right]});

                    // Skip duplicate values on both inner pointers
                    while (left < right && a[left] == a[left + 1]) left++;
                    while (left < right && a[right] == a[right - 1]) right--;

                    left++;
                    right--;
                } else if (sum < x) {
                    left++; // Sum too small, move left pointer to a larger value
                } else {
                    right--; // Sum too large, move right pointer to a smaller value
                }
            }
        }
    }

    // Build output into a single string buffer instead of repeated cout calls
    string output;
    output += to_string(result.size());
    output += '\n';
    for (const auto& quad : result) {
        output += to_string(quad[0]);
        output += ' ';
        output += to_string(quad[1]);
        output += ' ';
        output += to_string(quad[2]);
        output += ' ';
        output += to_string(quad[3]);
        output += '\n';
    }
    cout << output;
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
<p class="mb-2">This problem extends the classic three-sum two-pointer technique by one more layer. Brute-force checking every quadruple is <code>O(N&#8308;)</code>, but fixing the first two elements with nested loops and then solving the remaining two-element subproblem with a sorted two-pointer sweep brings the total down to <code>O(N&sup3;)</code>. Sorting the array upfront is essential for two reasons: it makes the two-pointer sweep on the last two slots possible at all, and it makes the required <code>a ≤ b ≤ c ≤ d</code> ordering and lexicographic output ordering fall out automatically, since fixing the two outer loop indices in increasing sorted order and then scanning the remaining two pointers inward naturally produces quadruples in non-decreasing, lexicographic order.</p>
<p class="mb-2">Duplicate quadruples are avoided by skipping over repeated values at each of the four positions: since the array is sorted, all occurrences of a repeated value are adjacent, so checking against the immediately preceding chosen value at each level is sufficient to prevent generating the same quadruple more than once.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">After sorting <code>a</code>, the code uses two nested loops for indices <code>i</code> and <code>j</code> to fix the first two elements of each candidate quadruple, skipping a repeated <code>i</code> or <code>j</code> value when it would duplicate the immediately preceding choice at that level. For each fixed <code>(i, j)</code> pair, a two-pointer sweep with <code>left</code> and <code>right</code> searches the remaining sorted suffix for two more elements completing the sum to exactly <code>x</code>: matching sums are recorded (after skipping duplicate values on both <code>left</code> and <code>right</code> to avoid re-emitting the same combination), sums that are too small advance <code>left</code>, and sums too large retreat <code>right</code>. Because the array is sorted and the loop indices only ever increase, every emitted quadruple is automatically in non-decreasing order internally and the quadruples themselves come out in lexicographically increasing order overall, with no extra sorting step needed afterward.</p>
<p class="mb-2">All output is built into a single string buffer rather than emitted through repeated <code>cout</code> calls, then flushed once per test case.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int a[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">The four-way sum is computed using <code>long long</code> as a defensive habit against overflow, which matters here since with <code>|A<sub>i</sub>| ≤ 100,000</code> the maximum possible sum magnitude (<code>400,000</code>) still fits in a 32-bit <code>int</code>, but <code>X</code> itself is read as <code>long long</code> since it can be as large as 10<sup>9</sup> in magnitude.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and batch all output into a reserved string buffer flushed once per test case, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>T = 1,000</code> test cases and potentially many quadruples per case.</p>
<p class="mb-2">This algorithm runs in <code>O(N&sup3;)</code> time per test case, since the two-pointer sweep contributes only a linear factor inside the two nested loops over <code>i</code> and <code>j</code>, and uses <code>O(N)</code> auxiliary space beyond the input vector and the output quadruples themselves, comfortably satisfying the problem's constraints given the bound on the sum of <code>N</code> across test cases.</p>


</div>
</div>
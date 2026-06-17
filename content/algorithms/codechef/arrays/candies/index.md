---
title: 'Candies'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Candies</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Abhi sells two types of candies in N cities, and each type must have distinct prices across all N cities. He wrote the 2N prices for both candy types together on one page in random order. Given the merged array of size 2N, determine whether it can be split into two arrays of length N each, such that both arrays consist of distinct elements.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains a single integer <code>N</code> — the number of cities.</li>
    <li>The second line contains <code>2N</code> space-separated integers <code>A<sub>1</sub>, A<sub>2</sub>, …, A<sub>2N</sub></code> — the elements of the array <code>A</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print a single line containing <code>Yes</code> if the array represents a valid list of prices, and <code>No</code> otherwise.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 1,000</li>
    <li>1 ≤ <code>N</code> ≤ 1,000</li>
    <li>1 ≤ <code>A<sub>i</sub></code> ≤ 10<sup>9</sup></li>
    <li>The sum of <code>N</code> over all test cases does not exceed 2,000</li>
</ul>

<h4 class="mb-3">Input</h4>

```
4
3
4 8 4 6 7 3
3
4 8 6 8 7 8
2
2 4 5 3
4
8 7 9 8 4 6 2 8
```

<h4 class="mb-3">Output</h4>

```
Yes
No
Yes
No
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N log N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    cin >> n;

    // Use a vector instead of a VLA to protect stack memory
    vector<int> a(2 * n);
    for (int i = 0; i < 2 * n; i++) cin >> a[i];

    // unordered_map gives O(1) average lookups instead of O(log N) for map
    unordered_map<int, int> freq;
    freq.reserve(2 * n);

    bool possible = true;
    for (int i = 0; i < 2 * n; i++) {
        freq[a[i]]++;
        // If any value appears more than twice, splitting is impossible
        if (freq[a[i]] > 2) {
            possible = false;
            break; // early exit, no need to keep counting
        }
    }

    cout << (possible ? "Yes" : "No") << '\n'; // '\n' is significantly faster than endl
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
<p class="mb-2">Each value can be placed in at most one of the two arrays per array, since each array's elements must be distinct. So a single value can appear in the merged array <code>A</code> at most twice — once routed to the "candy 1" array, once routed to the "candy 2" array. If any value appears three or more times, there's no way to distribute its occurrences across only two arrays without a repeat in at least one of them, so the split is impossible.</p>
<p class="mb-2">Conversely, if every distinct value occurs at most twice in <code>A</code>, a valid split always exists: simply assign the first occurrence of each repeated value to one array and the second occurrence to the other, then distribute the singly-occurring values to whichever array still needs elements to reach length <code>N</code>. The exact sizes always work out because the array has exactly <code>2N</code> elements total.</p>
<p class="mb-2">So the entire problem reduces to one check: does any value appear more than twice in <code>A</code>?</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code reads all <code>2N</code> values into a vector, then makes a single linear pass while maintaining a frequency count in an <code>unordered_map</code>. For each element, its count is incremented immediately on read, and if that count ever exceeds 2, the array is flagged invalid via the <code>possible</code> flag and the loop breaks early, since no further elements need to be checked.</p>
<p class="mb-2">After the loop, the code simply prints <code>Yes</code> if no value ever exceeded a frequency of 2, and <code>No</code> otherwise.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int a[2*n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2"><code>unordered_map</code> is preferred over <code>map</code> here since we only need frequency counts and don't need the keys sorted, giving average O(1) insertions and lookups instead of O(log N).</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>T = 1000</code> test cases.</p>
<p class="mb-2">Breaking out of the loop as soon as a value exceeds a count of 2 avoids unnecessary work once the answer is already determined.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> average time per test case and uses <code>O(N)</code> space to store the input vector and frequency map, comfortably satisfying the problem's constraints given the bound on the sum of <code>N</code> across test cases.</p>


</div>
</div>

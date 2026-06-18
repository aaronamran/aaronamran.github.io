---
title: 'Largest and Second Largest'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Largest and Second Largest</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an array <code>A</code> of <code>N</code> integers. Find the maximum sum of two distinct integers in the array — that is, the largest value plus the largest value strictly smaller than it. It is guaranteed that there exist at least two distinct integers in the array.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case:
    <ul>
        <li>The first line contains a single integer <code>N</code> — the size of the array.</li>
        <li>The next line contains <code>N</code> space-separated integers, denoting the array <code>A</code>.</li>
    </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line the maximum sum of two distinct integers in the array.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 1000</li>
    <li>2 ≤ <code>N</code> ≤ 10<sup>5</sup></li>
    <li>1 ≤ <code>A<sub>i</sub></code> ≤ 1000</li>
    <li>The sum of <code>N</code> over all test cases does not exceed 2 × 10<sup>5</sup>.</li>
</ul>
<h4 class="mb-3">Input</h4>

```
4
3
4 1 6
7
3 7 2 1 1 5 3
5
8 2 9 4 9
2
1 2
```

<h4 class="mb-3">Output</h4>

```
10
12
17
3
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) per test case &nbsp;•&nbsp; Space O(1) per test case</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        int firstMax = -1;
        int secondMax = -1;

        for (int i = 0; i < n; i++) {
            int x;
            cin >> x;
            // Update logic for the two largest distinct values
            if (x > firstMax) {
                secondMax = firstMax;
                firstMax = x;
            } else if (x > secondMax && x != firstMax) {
                secondMax = x;
            }
        }
        cout << firstMax + secondMax << "\n";
    }
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">"Two distinct integers" here refers to two distinct <em>values</em>, not merely two distinct array positions — this matters because the array can contain duplicate values, as in test case 3 (<code>8 2 9 4 9</code>), where the answer is <code>17</code> (<code>9 + 8</code>) rather than <code>18</code> (<code>9 + 9</code>), even though two separate <code>9</code>s exist at different positions. So the actual goal is to find the largest value in the array, then separately find the largest value that is strictly smaller than it, and sum the two.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains two running values, <code>firstMax</code> and <code>secondMax</code>, both initialized to <code>-1</code> (a safe sentinel since the constraints guarantee every array value is <code>≥ 1</code>). Each input value <code>x</code> is processed as it's read, without ever being stored in an array, since no further use of the full input is needed beyond this single pass. Two cases are handled:</p>
<ul>
    <li>If <code>x</code> exceeds the current <code>firstMax</code>, it becomes the new overall maximum. Crucially, before overwriting <code>firstMax</code>, its old value is pushed down into <code>secondMax</code> — this correctly demotes the previous largest value to "second largest" rather than discarding it.</li>
    <li>Otherwise, if <code>x</code> exceeds the current <code>secondMax</code> <em>and</em> is not equal to <code>firstMax</code>, it becomes the new second-largest distinct value. The explicit <code>x != firstMax</code> check is what enforces distinctness: without it, a duplicate of the current maximum (like the second <code>9</code> in test case 3) would incorrectly overwrite <code>secondMax</code> with a value equal to <code>firstMax</code>, producing a sum of two copies of the same value rather than two distinct ones.</li>
</ul>
<p class="mb-2">After the full array has been scanned, <code>firstMax + secondMax</code> is exactly the maximum achievable sum of two distinct values, since both running variables are guaranteed to hold valid distinct values once at least two distinct integers exist in the array, as the constraints promise.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is a single-pass running-maximum technique extended to track the two largest distinct values simultaneously, with the distinctness check (<code>x != firstMax</code>) being the one detail that distinguishes this from a simpler "two largest elements" problem.</p>
<p class="mb-2">Reading each value directly into a local variable <code>x</code> instead of storing the full array in a <code>vector</code> keeps memory usage at <code>O(1)</code> per test case rather than <code>O(N)</code>, which is a meaningful saving given the combined constraint that the sum of <code>N</code> across all test cases can reach <code>2 × 10<sup>5</sup></code>.</p>
<p class="mb-2">For each test case, this algorithm runs in <code>O(N)</code> time (a single linear scan) and uses <code>O(1)</code> extra space, which is optimal since every element must be examined at least once to determine the answer.</p>

</div>
</div>

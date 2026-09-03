---
title: 'Find the majority element'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Find the majority element</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an array of n integers. Return the majority element — the element that occurs more than floor(n/2) times. It is guaranteed that such an element always exists.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains a single integer <code>n</code> — the array size.</li>
    <li>The second line contains <code>n</code> integers representing the array.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print the majority element on its own line.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>n</code> ≤ 50,000</li>
    <li>-10<sup>9</sup> ≤ <code>arr[i]</code> ≤ 10<sup>9</sup></li>
</ul>
<h4 class="mb-3">Follow-up</h4>
<p class="mb-3">Can this be solved in O(n) time and O(1) extra space? Yes — the Boyer-Moore voting algorithm used below achieves exactly this, tracking only a candidate value and a counter.</p>

<h4 class="mb-3">Input</h4>

```
2
6
7 1 7 7 3 7
3
5 5 2
```

<h4 class="mb-3">Output</h4>

```
7
5
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1) extra</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int majorityElement(vector<int>& arr) {
    int candidate = 0;
    int count = 0;

    for (int num : arr) {
        // If the running count drops to 0, adopt a new candidate
        if (count == 0) {
            candidate = num;
        }

        // Reinforce the candidate on a match, otherwise weaken it
        if (num == candidate) {
            count++;
        } else {
            count--;
        }
    }

    return candidate;
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

        cout << majorityElement(arr) << '\n'; // '\n' is significantly faster than endl
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Since the majority element appears more than half the array, it outnumbers the combined total of every other element put together. This is exactly the setup the Boyer-Moore voting algorithm exploits: treat each occurrence of the current leading candidate as a "+1 vote" and every occurrence of anything else as a "-1 vote" against it. If we walk through the array maintaining a running tally for whichever value currently holds the lead, that tally can only ever be driven to zero by an equal number of opposing votes — and since the true majority element has strictly more votes than all other elements combined, it can never be fully cancelled out by the time the array ends. Whichever value is being tracked as the candidate at the very end must therefore be the majority element.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains two variables: <code>candidate</code>, the value currently believed to be the majority element, and <code>count</code>, a signed tally of support for that candidate. On each element, if <code>count</code> has dropped to <code>0</code>, the current element becomes the new <code>candidate</code> (effectively restarting the count with a fresh contender). Then, regardless of whether the candidate was just replaced, the code checks whether the current element matches <code>candidate</code>: a match increments <code>count</code>, while a mismatch decrements it. Because the problem guarantees a true majority element exists, by the end of this single pass <code>candidate</code> is guaranteed to hold that value.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Instead of using standard C-style arrays (<code>int arr[n]</code>), we use <code>std::vector&lt;int&gt;</code> to safely allocate memory on the heap, preventing potential stack overflow errors for larger inputs.</p>
<p class="mb-2">We include <code>ios_base::sync_with_stdio(false); cin.tie(NULL);</code> and use <code>'\n'</code> instead of <code>endl</code> to speed up input/output, which is standard practice to avoid Time Limit Exceeded (TLE) verdicts in competitive environments, especially with up to <code>n = 50,000</code> elements per test case.</p>
<p class="mb-2">No hash map or sorting step is used at all, since the voting algorithm tracks the leading contender using only two scalar variables.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time with a single linear pass per test case and uses only <code>O(1)</code> extra space beyond the input array itself, satisfying the follow-up's explicit O(N) time and O(1) extra space requirement.</p>


</div>
</div>
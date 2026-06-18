---
title: 'Red Light, Green Light'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Red Light, Green Light</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">“You won't get caught if you hide behind someone.” Sang-Woo advises Gi-Hun to hide behind someone to avoid getting shot. Gi-Hun follows Sang-Woo's advice and hides behind Ali, who saved his life earlier. Gi-Hun and Ali both have the same height, K. Many players saw this trick and also started hiding behind Ali. Now, there are N players standing between Gi-Hun and Ali in a straight line, with the i<sup>th</sup> player having height H<sub>i</sub>. Gi-Hun wants to know the minimum number of players who need to get shot so that Ali is visible in his line of sight.</p>
<p class="mb-3"><strong>Note:</strong> Line of sight is a straight line drawn between the topmost point of two objects. Ali is visible to Gi-Hun if nobody between them crosses this line. Even if there are some players who have the same height as that of Gi-Hun and Ali, Ali will be visible in Gi-Hun's line of sight. Gi-Hun and Ali have the same height.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code>, denoting the number of test cases. The description of <code>T</code> test cases follows.</li>
    <li>The first line of each test case contains two space-separated integers <code>N</code> and <code>K</code>, denoting the total number of players between Gi-Hun and Ali and the height of both of them respectively.</li>
    <li>The second line of each test case contains <code>N</code> space-separated integers, denoting the heights of the players between Gi-Hun and Ali.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output in a single line the minimum number of players who need to get shot so that Ali is visible in Gi-Hun's line of sight.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 10<sup>5</sup></li>
    <li>1 ≤ <code>N</code> ≤ 10<sup>5</sup></li>
    <li>1 ≤ <code>K</code> ≤ 10<sup>6</sup></li>
    <li>1 ≤ <code>H<sub>i</sub></code> ≤ 10<sup>6</sup> for every 1 ≤ <code>i</code> ≤ <code>N</code></li>
    <li>The sum of <code>N</code> across all test cases does not exceed 5·10<sup>5</sup></li>
</ul>
<h4 class="mb-3">Input</h4>

```
3
4 10
2 13 4 16
5 8
9 3 8 8 4
4 6
1 2 3 4
```

<h4 class="mb-3">Output</h4>

```
2
1
0
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    cin >> t;

    while (t--) {
        int n, k;
        cin >> n >> k;

        // Read heights and count blockers on the fly,
        // avoiding the need to store the whole array
        int count = 0;
        for (int i = 0; i < n; i++) {
            int height;
            cin >> height;
            // A player strictly taller than K blocks the line of sight
            // drawn between Gi-Hun's and Ali's (equal) heights K,
            // so that player must be removed.
            if (height > k) {
                count++;
            }
        }

        cout << count << '\n'; // '\n' is significantly faster than endl
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Gi-Hun and Ali stand at the same height K, so the line of sight between their topmost points is a perfectly horizontal line at height K. Any player standing strictly above this line — that is, with height H<sub>i</sub> &gt; K — physically crosses it and blocks the view, regardless of where in the row that player stands, since the line is flat rather than sloped. A player with height exactly K (or less) never crosses the line, as the problem explicitly states ties don't block visibility.</p>
<p class="mb-2">Because the blocking condition depends only on each player's own height compared to K and not on their position relative to other players, every player with H<sub>i</sub> &gt; K must individually be removed, and no removal can be "shared" or avoided by removing a different player. The minimum number of shots is therefore exactly the count of players strictly taller than K.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">For each test case, the code reads <code>N</code> and <code>K</code>, then streams in each height one at a time. Rather than storing the heights in an array, it checks each height immediately against <code>K</code> and increments a running <code>count</code> whenever <code>height &gt; k</code>. Since each player is judged independently and order doesn't matter, there's no need to retain the array after reading — this keeps the solution to a single pass with no extra storage.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Input is read with fast I/O (<code>sync_with_stdio(false)</code>, <code>cin.tie(NULL)</code>, and <code>'\n'</code> instead of <code>endl</code>) to comfortably handle up to <code>T = 10<sup>5</sup></code> test cases and a total of <code>5·10<sup>5</sup></code> integers across all test cases without risking a Time Limit Exceeded verdict.</p>
<p class="mb-2">Heights are processed on the fly rather than stored in a <code>vector</code>, since the answer only requires a per-element comparison against <code>K</code> with no need to revisit earlier values — this avoids unnecessary memory allocation per test case.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time and <code>O(1)</code> extra space per test case, for an overall <code>O(ΣN)</code> time complexity, comfortably satisfying the problem's constraints.</p>


</div>
</div>

---
title: 'Array - Matrix operations'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Array - Matrix operations</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given a matrix <code>A</code> of size <code>N×N</code>. You need to rotate the matrix <code>A</code> by 180 degrees, either in clockwise or anti-clockwise direction (the result is identical either way).</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case:
    <ul>
        <li>The first line contains the size of the matrix <code>N</code>.</li>
        <li>This is followed by <code>N</code> lines, each containing <code>N</code> space-separated integers, forming the <code>N×N</code> matrix.</li>
    </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output <code>N</code> lines, where each line has <code>N</code> space-separated integers, denoting the matrix after rotating it 180 degrees.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 5000</li>
    <li>1 ≤ <code>N</code> ≤ 100</li>
    <li>1 ≤ <code>A(i,j)</code> ≤ 10<sup>5</sup>, where <code>A(i,j)</code> denotes the j<sup>th</sup> element of the i<sup>th</sup> row.</li>
</ul>
<h4 class="mb-3">Input</h4>

```
4
1
1
2
1 2
3 4
3
1 2 3
4 5 6
7 8 9
4
1 2 3 4
5 6 7 8
9 10 11 12
13 14 15 16
```

<h4 class="mb-3">Output</h4>

```
1
4 3
2 1
9 8 7
6 5 4
3 2 1
16 15 14 13
12 11 10 9
8 7 6 5
4 3 2 1
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N&sup2;) per test case &nbsp;•&nbsp; Space O(N&sup2;) per test case</p>

```C++
#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        vector<vector<int>> matrix(n, vector<int>(n));
        
        // Reading the matrix
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                cin >> matrix[i][j];
            }
        }

        // Printing in reverse order (180 degree rotation)
        for (int i = n - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 0; j--) {
                cout << matrix[i][j] << (j == 0 ? "" : " ");
            }
            cout << "\n";
        }
    }
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">A 180 degree rotation sends the element originally at position <code>(i, j)</code> to position <code>(N-1-i, N-1-j)</code> (using 0-indexed rows and columns). Equivalently, viewed from the output's perspective, the element that should appear at output position <code>(i, j)</code> is the original element at <code>(N-1-i, N-1-j)</code>. This means the entire matrix, read out in standard row-major order, is simply the original matrix read out in the exact opposite order — last row to first row, and within each row, last column to first column.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code first reads the full <code>N×N</code> matrix into a 2D vector using a standard nested loop. Rather than computing any rotated copy of the matrix in memory, it directly prints the result by iterating the row index <code>i</code> from <code>n-1</code> down to <code>0</code>, and within each row, iterating the column index <code>j</code> from <code>n-1</code> down to <code>0</code>. This double-reversed traversal order is exactly equivalent to a 180 degree rotation, since printing <code>matrix[i][j]</code> in this reversed order naturally produces the same output as if the rotated values had been computed and then printed normally.</p>
<p class="mb-2">The conditional <code>(j == 0 ? "" : " ")</code> places a space after every printed value except the last one in each row, ensuring no trailing whitespace at the end of a line while keeping all values correctly separated. A newline is emitted after each completed row.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Since a 180 degree rotation is just a full reversal of both row and column order simultaneously, no auxiliary rotated matrix needs to be constructed — the original stored matrix can be read out in reverse order on both axes directly during output, saving both time and memory compared to explicitly building a second matrix.</p>
<p class="mb-2"><code>ios_base::sync_with_stdio(false)</code> and <code>cin.tie(NULL)</code> are included to speed up I/O, which matters here since <code>T</code> can be as large as <code>5000</code> and each test case involves up to <code>10<sup>4</sup></code> values, making fast input/output meaningfully impactful for avoiding a Time Limit Exceeded verdict.</p>
<p class="mb-2">This algorithm runs in <code>O(N&sup2;)</code> time and <code>O(N&sup2;)</code> space per test case, which is optimal since every one of the <code>N&sup2;</code> elements must be read and then written out at least once.</p>

</div>
</div>

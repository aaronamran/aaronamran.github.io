---
title: 'Set Matrix Zeroes'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Set Matrix Zeroes</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an <code>N x M</code> integer matrix, if an element is <code>0</code>, set its entire row and column to <code>0</code>s. You don't need to repeat the process for new <code>0</code>s that are formed during the operation. For example, the matrix</p>

```
4 3 19 4
12 0 5 0
6 8 4 1
```

<p class="mb-3">becomes</p>

```
4 0 19 0
0 0 0 0
6 0 4 0
```

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains two integers <code>N</code> and <code>M</code> — the number of rows and columns in the matrix.</li>
    <li>The next <code>N</code> lines each contain <code>M</code> space-separated integers representing the matrix elements.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Output the modified matrix of size <code>N×M</code>. Each row should be printed on a new line with space-separated integers.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N, M</code> ≤ 1000</li>
    <li>0 ≤ <code>mat[i][j]</code> ≤ 1000</li>
</ul>
<h4 class="mb-3">Input</h4>

```
3 3
4 6 0
8 2 1
3 1 5
```

<h4 class="mb-3">Output</h4>

```
0 0 0
8 2 0
3 1 0
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N&times;M) &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <vector>
using namespace std;

void setZeroes(vector<vector<int>> &mat) {
    int n = mat.size();
    int m = mat[0].size();
    bool firstColZero = false;

    // Use first row and column as markers
    for (int i = 0; i < n; i++) {
        if (mat[i][0] == 0) firstColZero = true;
        for (int j = 1; j < m; j++) {
            if (mat[i][j] == 0) {
                mat[i][0] = 0;
                mat[0][j] = 0;
            }
        }
    }

    // Update internal cells based on markers
    for (int i = 1; i < n; i++) {
        for (int j = 1; j < m; j++) {
            if (mat[i][0] == 0 || mat[0][j] == 0) {
                mat[i][j] = 0;
            }
        }
    }

    // Handle the first row
    if (mat[0][0] == 0) {
        for (int j = 0; j < m; j++) mat[0][j] = 0;
    }

    // Handle the first column
    if (firstColZero) {
        for (int i = 0; i < n; i++) mat[i][0] = 0;
    }
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">A naive approach would mark every row and column containing a <code>0</code> using two auxiliary arrays of size <code>N</code> and <code>M</code>, then sweep the matrix again applying those marks — this works but costs <code>O(N+M)</code> extra space. The key realization here is that the matrix's own first row and first column can be repurposed as those marker arrays instead of allocating new ones, since the original values of the first row and column are no longer needed once we know which positions must become <code>0</code> anyway. The only complication is that the first row and first column overlap at cell <code>(0,0)</code>, and the original value of the first row/column would otherwise be lost before being read — both issues the algorithm must handle carefully.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code proceeds in four passes. In the first pass, it scans every cell <code>mat[i][j]</code> for <code>j ≥ 1</code> (skipping the first column to avoid disturbing its marker role prematurely); whenever a <code>0</code> is found, it marks both <code>mat[i][0] = 0</code> (flagging row <code>i</code>) and <code>mat[0][j] = 0</code> (flagging column <code>j</code>). Within this same pass, <code>mat[i][0]</code> is also checked directly to set the separate boolean flag <code>firstColZero</code>, since the first column's own original zero-status would otherwise be overwritten and lost during the marking process.</p>
<p class="mb-2">The second pass then sweeps all interior cells (<code>i ≥ 1, j ≥ 1</code>) and zeroes out <code>mat[i][j]</code> if either its row marker <code>mat[i][0]</code> or its column marker <code>mat[0][j]</code> is <code>0</code>. This pass must come before the first row and column are themselves finalized, since it relies on reading their marker values as still-valid signals.</p>
<p class="mb-2">Finally, the first row and first column are resolved using the information gathered earlier: if <code>mat[0][0]</code> ended up <code>0</code> (meaning column <code>0</code> was flagged by some cell in row <code>0</code>), the entire first row is zeroed; and if the separately tracked <code>firstColZero</code> flag is true (meaning the original first column contained a zero), the entire first column is zeroed. Doing these last, and using the independent <code>firstColZero</code> flag rather than re-reading from the matrix, avoids the chicken-and-egg problem of the shared <code>(0,0)</code> cell corrupting one signal with the other.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the in-place marker technique: instead of new <code>O(N)</code> and <code>O(M)</code> boolean arrays, the matrix's own first row and column double as those markers, with a single extra boolean (<code>firstColZero</code>) needed only to resolve the ambiguity at the shared corner cell <code>(0,0)</code>.</p>
<p class="mb-2">The order of operations matters critically: marking happens first, then interior cells are zeroed using the markers, and only then are the first row and column themselves finalized — reversing this order would destroy the marker information before it could be used.</p>
<p class="mb-2">This algorithm runs in <code>O(N&times;M)</code> time, since it makes a small constant number of full passes over the matrix, and uses only <code>O(1)</code> extra space (a single boolean variable), a meaningful improvement over the straightforward approach of using separate <code>O(N)</code> and <code>O(M)</code> marker arrays.</p>

</div>
</div>

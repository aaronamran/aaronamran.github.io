---
title: 'Spiral Matrix Traversal'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Spiral Matrix Traversal</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given a 2D matrix of size <code>m×n</code>, return all its elements in spiral order. For example, the 3x2 matrix below is traversed right, then down, then left, then up, spiraling inward:</p>

```
5 ——> 1
      |  
      v
9     2
^     |
|     v
8 <—— 3
```

<p class="mb-3">which yields the spiral order <code>5 1 2 3 8 9</code>.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of each test case contains two space-separated integers <code>m</code> and <code>n</code> — the number of rows and columns of the matrix.</li>
    <li>The next <code>m</code> lines each contain <code>n</code> space-separated integers, representing the rows of the matrix.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output on a new line all elements of the matrix in spiral order, separated by spaces.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>m, n</code> ≤ 10</li>
    <li>−100 ≤ <code>matrix[i][j]</code> ≤ 100</li>
    <li>The matrix is non-empty</li>
</ul>
<h4 class="mb-3">Input</h4>

```
3 3
1 2 3
4 5 6
7 8 9
```

<h4 class="mb-3">Output</h4>

```
1 2 3 6 9 8 7 4 5
```

<h4 class="mb-3">Input</h4>

```
3 4
2 4 6 8
10 12 14 16
18 20 22 24
```

<h4 class="mb-3">Output</h4>

```
2 4 6 8 16 24 22 20 18 10 12 14
```

<h4 class="mb-3">Input</h4>

```
3 2
5 1
9 2
8 3
```

<h4 class="mb-3">Output</h4>

```
5 1 2 3 8 9
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(m&times;n) &nbsp;•&nbsp; Space O(m&times;n)</p>

```C++
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> result;
        if (matrix.empty()) return result;

        int top = 0, bottom = matrix.size() - 1;
        int left = 0, right = matrix[0].size() - 1;

        while (top <= bottom && left <= right) {
            // 1. Move Right
            for (int j = left; j <= right; j++) result.push_back(matrix[top][j]);
            top++;

            // 2. Move Down
            for (int i = top; i <= bottom; i++) result.push_back(matrix[i][right]);
            right--;

            // 3. Move Left (Check if row still exists)
            if (top <= bottom) {
                for (int j = right; j >= left; j--) result.push_back(matrix[bottom][j]);
                bottom--;
            }

            // 4. Move Up (Check if column still exists)
            if (left <= right) {
                for (int i = bottom; i >= top; i--) result.push_back(matrix[i][left]);
                left++;
            }
        }
        return result;
    }
};
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">A spiral traversal visits the matrix as a sequence of shrinking concentric rectangular rings: the outermost ring is traced first (top row left-to-right, right column top-to-bottom, bottom row right-to-left, left column bottom-to-top), and then the same four-sided pattern repeats on the next ring inward, continuing until every element has been visited. The challenge is correctly tracking which rows and columns remain unvisited as each ring is completed, and avoiding revisiting or skipping cells when the remaining region collapses to a single row or column.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code maintains four boundary pointers — <code>top</code>, <code>bottom</code>, <code>left</code>, and <code>right</code> — that define the rectangular region not yet visited. Each iteration of the outer <code>while</code> loop traces one full ring in four steps:</p>
<ul>
    <li><strong>Move Right</strong> along the current <code>top</code> row from <code>left</code> to <code>right</code>, then increment <code>top</code> since that row is now fully visited.</li>
    <li><strong>Move Down</strong> along the current <code>right</code> column from the new <code>top</code> to <code>bottom</code>, then decrement <code>right</code> since that column is now fully visited.</li>
    <li><strong>Move Left</strong> along the current <code>bottom</code> row from <code>right</code> to <code>left</code>, then decrement <code>bottom</code> — but only if <code>top &lt;= bottom</code> still holds. This guard is essential: without it, a matrix with a single remaining row would have its top row re-traversed a second time as the "bottom" row, double-counting elements.</li>
    <li><strong>Move Up</strong> along the current <code>left</code> column from <code>bottom</code> to <code>top</code>, then increment <code>left</code> — similarly guarded by <code>left &lt;= right</code> to prevent re-traversing a single remaining column that was already covered by the "Move Down" step.</li>
</ul>
<p class="mb-2">The outer loop condition <code>top &lt;= bottom && left &lt;= right</code> ensures the process stops the moment the unvisited region disappears, whether the matrix is square, wide, tall, or reduces to a single row, column, or cell.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the boundary-shrinking technique: four pointers carve out concentric rings of the matrix one layer at a time, and the two extra guard conditions before the "Move Left" and "Move Up" steps are what correctly handle degenerate rings that have collapsed into a single row or column, preventing duplicate visits.</p>
<p class="mb-2">Each of the four directional loops naturally has zero iterations when its boundary range is already invalid by the time it runs, so no separate special-casing is needed for rectangular (non-square) matrices — the same four-step pattern handles them uniformly, as confirmed by sample 2 (3 rows, 4 columns) and sample 3 (3 rows, 2 columns).</p>
<p class="mb-2">This algorithm runs in <code>O(m&times;n)</code> time, since every cell is visited and appended to the result exactly once, and uses <code>O(m&times;n)</code> space to store the output vector containing all matrix elements.</p>

</div>
</div>

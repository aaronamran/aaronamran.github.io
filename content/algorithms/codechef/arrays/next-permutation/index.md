---
title: 'Next Permutation'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Next Permutation</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given a permutation of <code>1, 2, …, N</code>, generate the next permutation in lexicographic (dictionary) order. For example, for <code>2 3 1 4</code> the answer is <code>2 3 4 1</code>. It is guaranteed that a lexicographically next permutation always exists for every given input.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains two integers <code>N</code> and <code>K</code>.</li>
    <li>This is followed by <code>K</code> lines, each containing one permutation of <code>1, 2, …, N</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">The output should consist of <code>K</code> lines, each containing the lexicographically next permutation of the corresponding input permutation.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N</code> ≤ 1000</li>
    <li>1 ≤ <code>K</code> ≤ 10</li>
</ul>
<h4 class="mb-3">Input</h4>

```
3 2
3 1 2
2 3 1
```

<h4 class="mb-3">Output</h4>

```
3 2 1
3 1 2
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) per permutation &nbsp;•&nbsp; Space O(N) per permutation</p>

```C++
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    // Optimize I/O operations
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int N, K;
    if (!(cin >> N >> K)) return 0;

    while (K--) {
        vector<int> p(N);
        for (int i = 0; i < N; i++) {
            cin >> p[i];
        }

        // std::next_permutation modifies the vector to the next lexicographical order
        next_permutation(p.begin(), p.end());

        // Print the result
        for (int i = 0; i < N; i++) {
            cout << p[i] << (i == N - 1 ? "" : " ");
        }
        cout << "\n";
    }

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">To find the next lexicographically greater permutation, we want the smallest possible increase to the sequence's "value" when read as a number. The standard algorithm works from the right: find the longest non-increasing suffix (the largest tail that's already in descending order, meaning it's already at its maximum possible arrangement and can't be increased further by rearranging it alone). The element immediately to the left of this suffix, called the pivot, must be increased to the smallest value in the suffix that's still larger than it, and the suffix must then be rearranged into ascending order to make the overall result as small as possible given that the pivot has increased.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code reads each permutation into a vector <code>p</code> and calls <code>std::next_permutation(p.begin(), p.end())</code>, the C++ standard library function that implements exactly the algorithm described above in-place: it locates the pivot by scanning from the right for the first position where the sequence stops being non-increasing, swaps it with the smallest larger element in the suffix, and reverses the suffix to restore ascending order. Since the problem guarantees a next permutation always exists for every input, there's no need to handle the wrap-around case where <code>next_permutation</code> would return <code>false</code> (indicating the input was already the last permutation and the sequence was reset to its first, ascending arrangement).</p>
<p class="mb-2">The result is printed space-separated with no trailing space, using the same <code>(i == N - 1 ? "" : " ")</code> pattern as in earlier problems, and this read-process-print cycle repeats <code>K</code> times for each of the <code>K</code> input permutations.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">Rather than reimplementing the suffix-pivot-swap-reverse algorithm by hand, the code relies on the C++ Standard Library's built-in <code>next_permutation</code>, which implements this exact algorithm with the same <code>O(N)</code> time complexity, since it's a well-established, heavily optimized routine for precisely this task.</p>
<p class="mb-2"><code>ios::sync_with_stdio(false)</code> and <code>cin.tie(nullptr)</code> are included to speed up I/O, which is worthwhile here since <code>N</code> can be as large as <code>1000</code> and reading/printing each permutation involves that many tokens.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time per permutation (the suffix scan, element swap, and suffix reversal are each linear), and uses <code>O(N)</code> space per permutation to store the array being processed — a vast improvement over naively generating and sorting all permutations to find the next one.</p>

</div>
</div>

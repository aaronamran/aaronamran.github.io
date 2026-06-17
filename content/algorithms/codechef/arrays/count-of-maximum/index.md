---
title: 'Count of Maximum'
date: '2026-06-17'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Count of Maximum</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array A of length N, find the element which repeats the maximum number of times, along with its exact frequency count. If there is a tie between multiple elements sharing the same maximum frequency, the smallest such element must be chosen.</p>

<h4 class="mb-3">Function Declaration</h4>
<p class="mb-2"><strong>Function Name:</strong> <code>mostFrequent</code> — this function processes the array and finds the required element and its count.</p>
<p class="mb-2"><strong>Parameters:</strong></p>
<ul>
    <li><code>N</code> : an integer representing the length of the array <code>A</code>.</li>
    <li><code>A</code> : an array (or list) of <code>N</code> integers.</li>
</ul>
<p class="mb-2"><strong>Return Value:</strong> Returns a pair of two integers:</p>
<ol>
    <li>The most frequent element (the smallest one in case of a tie).</li>
    <li>Its corresponding frequency count.</li>
</ol>

<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 100</li>
    <li>1 ≤ <code>N</code> ≤ 10<sup>5</sup></li>
    <li>1 ≤ <code>A[i]</code> ≤ 10<sup>9</sup></li>
    <li>Sum of <code>N</code> over all test cases does not exceed 2 &times; 10<sup>5</sup></li>
</ul>
<p class="mb-3">The input and output formats below are only for testing with custom inputs. Only the logic function needs to be completed; parsing inputs, looping over test cases, and printing are handled automatically by the platform.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case, the first line contains a single integer <code>N</code> — the length of the array.</li>
    <li>The second line contains <code>N</code> space-separated integers representing the elements of array <code>A</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, print two space-separated integers on a new line: the chosen element followed by its frequency count.</p>
<h4 class="mb-3">Input</h4>

```
2
5
1 2 3 2 5
6
1 2 2 1 1 2
```

<h4 class="mb-3">Output</h4>

```
2 2
1 3
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    pair<int, int> mostFrequent(int N, vector<int>& A) {
        // Tally occurrences of every element in a single pass
        unordered_map<int, int> freq;
        freq.reserve(N * 2);
        for (int x : A) freq[x]++;

        int max_freq = 0;
        int best_elem = -1;

        for (auto const& [num, count] : freq) {
            // Strictly higher frequency always wins
            if (count > max_freq) {
                max_freq = count;
                best_elem = num;
            }
            // On a tie, keep the smaller element
            else if (count == max_freq && num < best_elem) {
                best_elem = num;
            }
        }
        return {best_elem, max_freq};
    }
};
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">The task reduces to two steps: first compute the frequency of every distinct value in the array, then select the value with the highest frequency, breaking ties by choosing the smaller value.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">An <code>unordered_map</code> tallies each element's count in a single linear pass over <code>A</code>. The map is then iterated once: whenever a strictly higher frequency is found, both <code>max_freq</code> and <code>best_elem</code> update; when a frequency ties the current maximum, <code>best_elem</code> only updates if the new element is smaller, enforcing the tie-breaking rule.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2"><code>unordered_map</code> is used instead of sorting, since counting frequencies only requires <code>O(N)</code> hashing rather than <code>O(N log N)</code> comparisons. Reserving capacity upfront (<code>freq.reserve(N * 2)</code>) reduces the number of internal rehashes during insertion, which matters since the sum of <code>N</code> across test cases can reach 2 &times; 10<sup>5</sup>. Since <code>A[i] ≥ 1</code>, the sentinel <code>best_elem = -1</code> can never collide with a real element, so the first entry processed always safely initializes the running answer.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time and uses <code>O(N)</code> space per test case for the hash map, comfortably satisfying the problem's performance constraints.</p>


</div>
</div>

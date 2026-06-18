---
title: 'Count Inversions'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Count Inversions</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef has an array <code>arr</code> consisting of integers and wants to know how far the array is from being sorted. Two elements <code>arr[i]</code> and <code>arr[j]</code> form an inversion if <code>arr[i] &gt; arr[j]</code> and <code>i &lt; j</code>. Count the total number of inversions in the array.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>N</code> — the size of the array.</li>
    <li>The second line contains <code>N</code> space-separated integers representing the array <code>arr</code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Output a single integer — the total number of inversions in the array.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>N</code> ≤ 10<sup>5</sup></li>
    <li>−10<sup>4</sup> ≤ <code>arr<sub>i</sub></code> ≤ 10<sup>4</sup></li>
    <li>The answer can be large, so use a data type capable of storing large values.</li>
</ul>
<h4 class="mb-3">Input</h4>

```
5
3 1 4 2 5
```

<h4 class="mb-3">Output</h4>

```
3
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N log N) &nbsp;•&nbsp; Space O(N)</p>

```C++
#include <bits/stdc++.h>
using namespace std;

long long mergeCount(vector<int>& arr, vector<int>& temp, int left, int right) {
    if (left >= right) return 0;

    int mid = left + (right - left) / 2;
    long long invCount = 0;

    invCount += mergeCount(arr, temp, left, mid);
    invCount += mergeCount(arr, temp, mid + 1, right);

    int i = left, j = mid + 1, k = left;

    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            // Since left and right halves are sorted, if arr[i] > arr[j],
            // then all elements from arr[i] to arr[mid] are > arr[j].
            temp[k++] = arr[j++];
            invCount += (mid - i + 1);
        }
    }

    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];

    for (int p = left; p <= right; p++)
        arr[p] = temp[p];

    return invCount;
}

long long countInversion(vector<int>& arr, int n) {
    // Allocate the scratch buffer once and reuse it across all merge calls
    vector<int> temp(n);
    return mergeCount(arr, temp, 0, n - 1);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    cout << countInversion(arr, n) << "\n";

    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">A brute-force approach would compare every pair <code>(i, j)</code> with <code>i &lt; j</code>, costing <code>O(N&sup2;)</code>. The merge-sort-based technique instead counts inversions as a byproduct of sorting: when merging two already-sorted halves, every time an element from the right half is placed before some remaining elements of the left half, each of those remaining left-half elements forms an inversion with it (since they appear earlier in the original array but are larger). Counting these "cross inversions" during every merge step, combined with inversions counted recursively within each half, captures every inversion in the array exactly once.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The recursive function <code>mergeCount</code> follows the standard merge sort structure: it splits <code>arr[left..right]</code> at the midpoint, recursively counts and sorts inversions within the left half and the right half, and then merges the two sorted halves back together while counting cross inversions. During the merge, two pointers <code>i</code> and <code>j</code> walk the left half (<code>left..mid</code>) and right half (<code>mid+1..right</code>) respectively. Whenever <code>arr[j]</code> is smaller than <code>arr[i]</code>, that single comparison reveals that <code>arr[j]</code> is smaller than every remaining element in the left half too (since the left half is already sorted), so <code>mid - i + 1</code> inversions — one for each remaining left-half element — are added to <code>invCount</code> in one step, rather than counting them individually.</p>
<p class="mb-2">The scratch buffer <code>temp</code> is allocated exactly once in <code>countInversion</code> and passed by reference into every recursive call, rather than being freshly allocated inside each merge step; this keeps the total auxiliary space at <code>O(N)</code> instead of <code>O(N log N)</code> worth of repeated allocations, which matters for performance at the upper constraint of <code>N = 10<sup>5</sup></code>. After each merge, the relevant slice of <code>arr</code> is overwritten with the merged, sorted result from <code>temp</code>, which is what allows the parent call's merge step to correctly assume both its halves are fully sorted.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the merge-sort-with-inversion-counting technique: sorting is performed anyway as a side effect, and the specific moment where a right-half element "jumps ahead of" remaining left-half elements during the merge is exactly the signal needed to count a batch of inversions in <code>O(1)</code> per batch rather than <code>O(N)</code> per individual pair.</p>
<p class="mb-2"><code>long long</code> is used for the inversion count since, with <code>N</code> up to <code>10<sup>5</sup></code>, a fully reverse-sorted array produces close to <code>N(N-1)/2 ≈ 5 × 10<sup>9</sup></code> inversions, which overflows a 32-bit <code>int</code>.</p>
<p class="mb-2">This algorithm runs in <code>O(N log N)</code> time, matching the time complexity of merge sort itself, and uses <code>O(N)</code> extra space for the single reusable scratch buffer — a substantial improvement over the brute-force <code>O(N&sup2;)</code> approach of checking every pair of indices directly.</p>

</div>
</div>

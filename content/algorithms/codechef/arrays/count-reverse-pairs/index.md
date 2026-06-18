---
title: 'Count Reverse Pairs'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Count Reverse Pairs</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">You are given an integer array <code>nums</code>. Count the number of reverse pairs in the array, where a reverse pair is a pair of indices <code>(i, j)</code> such that <code>0 &le; i &lt; j &lt; nums.length</code> and <code>nums[i] &gt; 2 * nums[j]</code>.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line contains a single integer <code>T</code> — the number of test cases.</li>
    <li>For each test case:
    <ul>
        <li>The first line contains a single integer <code>N</code> — the size of the array.</li>
        <li>The second line contains <code>N</code> space-separated integers representing the array elements.</li>
    </ul>
    </li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output a single integer — the number of reverse pairs in the array.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 100</li>
    <li>1 ≤ <code>N</code> ≤ 5 × 10<sup>4</sup></li>
    <li>−2<sup>31</sup> ≤ <code>nums<sub>i</sub></code> ≤ 2<sup>31</sup> − 1</li>
    <li>Time-efficient solutions are expected due to large input size.</li>
</ul>
<h4 class="mb-3">Input</h4>

```
2
5
5 1 2 1 4
5
6 1 7 3 1
```

<h4 class="mb-3">Output</h4>

```
3
5
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N log N) per test case &nbsp;•&nbsp; Space O(N) per test case</p>

```C++
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    long long mergeAndCount(vector<int>& nums, vector<int>& temp, int low, int mid, int high) {
        long long count = 0;
        int j = mid + 1;

        // Count pairs before merging, while both halves are still sorted
        for (int i = low; i <= mid; i++) {
            while (j <= high && (long long)nums[i] > 2LL * nums[j]) {
                j++;
            }
            count += (j - (mid + 1));
        }

        // Standard merge step, using the pre-allocated scratch buffer
        int left = low, right = mid + 1, k = low;
        while (left <= mid && right <= high) {
            if (nums[left] <= nums[right]) temp[k++] = nums[left++];
            else temp[k++] = nums[right++];
        }
        while (left <= mid) temp[k++] = nums[left++];
        while (right <= high) temp[k++] = nums[right++];

        for (int p = low; p <= high; p++) nums[p] = temp[p];

        return count;
    }

    long long mergeSort(vector<int>& nums, vector<int>& temp, int low, int high) {
        if (low >= high) return 0;
        int mid = low + (high - low) / 2;
        long long count = mergeSort(nums, temp, low, mid);
        count += mergeSort(nums, temp, mid + 1, high);
        count += mergeAndCount(nums, temp, low, mid, high);
        return count;
    }

    long long reversePairs(vector<int>& nums) {
        vector<int> temp(nums.size());
        return mergeSort(nums, temp, 0, (int)nums.size() - 1);
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        Solution sol;
        cout << sol.reversePairs(nums) << "\n";
    }
    return 0;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Checking every pair <code>(i, j)</code> directly costs <code>O(N&sup2;)</code>. As with counting inversions, this can be sped up using a merge-sort-based approach: once the left half <code>nums[low..mid]</code> and right half <code>nums[mid+1..high]</code> are each individually sorted, the condition <code>nums[i] &gt; 2 * nums[j]</code> can be checked across the two halves far more efficiently than pairwise, because both halves being sorted means the count of valid <code>j</code> values for each <code>i</code> only ever grows as <code>i</code> increases through the left half — allowing a two-pointer sweep instead of nested loops.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The function <code>mergeAndCount</code> is called on each merge step of the sort, after both halves are already sorted (but before they're merged into one combined sorted run). It performs a counting pass first: for each index <code>i</code> in the left half, the pointer <code>j</code> (starting in the right half) is advanced as far as possible while <code>nums[i] &gt; 2 * nums[j]</code> still holds. Critically, <code>j</code> is never reset between iterations of <code>i</code> — since the left half is sorted in non-decreasing order, increasing <code>nums[i]</code> can only make the condition <code>nums[i] &gt; 2 * nums[j]</code> easier to satisfy, so the valid range of <code>j</code> for the next <code>i</code> can only extend further right, never retreat. This means the entire counting pass across both halves runs in <code>O(mid - low + high - mid)</code> total time, i.e. linear in the size of the merged segment, rather than the <code>O((mid-low)&times;(high-mid))</code> a nested loop would cost.</p>
<p class="mb-2">After counting, a completely separate, standard merge step combines the two sorted halves into a single sorted run inside the pre-allocated <code>temp</code> buffer, which is passed down through every recursive call rather than being freshly allocated each time — this keeps total auxiliary allocation at <code>O(N)</code> instead of <code>O(N log N)</code> worth of repeated allocations across the recursion. <code>mergeSort</code> recursively sorts and counts both halves before calling <code>mergeAndCount</code>, accumulating the total reverse-pair count from all three contributions: pairs entirely within the left half, pairs entirely within the right half, and the cross-half pairs found during the merge.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is the merge-sort-with-counting technique, similar in spirit to counting inversions, but with a two-pointer scan replacing the simpler single-comparison check, since the condition here involves a multiplicative factor of <code>2</code> rather than a direct element comparison.</p>
<p class="mb-2"><code>long long</code> is used both for the running pair count (since <code>N</code> up to <code>5 × 10<sup>4</sup></code> can produce up to roughly <code>1.25 × 10<sup>9</sup></code> reverse pairs, uncomfortably close to the 32-bit <code>int</code> limit) and, critically, for the comparison <code>(long long)nums[i] &gt; 2LL * nums[j]</code> itself — since <code>nums[i]</code> can be as negative as <code>-2<sup>31</sup></code>, doubling it via <code>2LL * nums[j]</code> can reach magnitude <code>2<sup>32</sup></code>, which would silently overflow if computed in 32-bit <code>int</code> arithmetic.</p>
<p class="mb-2">For each test case, this algorithm runs in <code>O(N log N)</code> time, matching the time complexity of merge sort itself, and uses <code>O(N)</code> extra space for the single reusable scratch buffer — a substantial improvement over the brute-force <code>O(N&sup2;)</code> approach of checking every pair of indices directly.</p>

</div>
</div>

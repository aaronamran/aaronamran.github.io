---
title: 'Chef and Stock Profits'
date: '2026-06-18'
prog: 'Arrays · June 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Chef and Stock Profits</h1>
<div class="writeup-date">June 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Chef is observing stock prices. You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the i<sup>th</sup> day. Chef wants to maximize his profit by choosing one day to buy and a different future day to sell. Return the maximum profit Chef can achieve. If no profit is possible, return <code>0</code>.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input contains a single integer <code>n</code> — the number of days.</li>
    <li>The second line contains <code>n</code> space-separated integers <code>prices<sub>0</sub>, prices<sub>1</sub>, …, prices<sub>n-1</sub></code> — the stock price on each day.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">Print a single line containing the maximum profit Chef can achieve.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>2 ≤ <code>n</code> ≤ 10<sup>5</sup></li>
    <li>0 ≤ <code>prices<sub>i</sub></code> ≤ 10<sup>4</sup> for each valid <code>i</code></li>
</ul>
<h4 class="mb-3">Input</h4>

```
7
2 4 1 7 5 3 6
```

<h4 class="mb-3">Output</h4>

```
6
```

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

```C++
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

int findMaxProfit(vector<int>& prices) {
    int minPrice = INT_MAX;
    int maxProfit = 0;

    for (int price : prices) {
        // Update the lowest price found so far
        if (price < minPrice) {
            minPrice = price;
        }
        // Check if selling at the current price yields a better profit
        else if (price - minPrice > maxProfit) {
            maxProfit = price - minPrice;
        }
    }

    return maxProfit;
}
```

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">Chef must pick two days <code>i &lt; j</code> to maximize <code>prices[j] - prices[i]</code>. For any fixed sell day <code>j</code>, the best possible profit is achieved by buying at the lowest price seen among all days before <code>j</code>. So the answer is the maximum, over all <code>j</code>, of <code>prices[j] - min(prices[0..j-1])</code>, with the answer clamped to <code>0</code> if every such difference is negative.</p>
<br />

<p class="mb-2"><strong>2. How The Code Implements This</strong></p>
<p class="mb-2">The code makes a single linear pass over the array, tracking two running values:</p>
<ul>
    <li><code>minPrice</code> — the lowest price encountered so far, initialized to <code>INT_MAX</code> so the very first price always replaces it.</li>
    <li><code>maxProfit</code> — the best profit found so far, initialized to <code>0</code> to naturally handle the case where no profitable transaction exists.</li>
</ul>
<p class="mb-2">For each price, the code first checks whether it is a new minimum; if so, it updates <code>minPrice</code> and moves on, since a day that sets a new low can't simultaneously be the most profitable sell day relative to an earlier low. Otherwise, the price is tested as a potential sell point against the best <code>minPrice</code> seen up to that point, and <code>maxProfit</code> is updated if this beats the current best. Because <code>minPrice</code> always reflects the smallest price strictly before the current index by the time the comparison happens, the buy day is implicitly guaranteed to come before the sell day.</p>
<br />

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2">This is a single forward pass that never needs to look back at the array or consider all <code>O(N&sup2;)</code> day pairs explicitly; the running minimum compresses all earlier days into one value, so each day is processed in constant time.</p>
<p class="mb-2"><code>INT_MAX</code> and <code>0</code> are chosen as sentinels so that the very first day can never be mistaken for a profitable sell, and so an all-decreasing price array correctly yields a profit of <code>0</code> rather than a negative number.</p>
<p class="mb-2">This algorithm runs in <code>O(N)</code> time with only <code>O(1)</code> extra space, since it tracks just two scalar variables regardless of input size — an improvement over the brute-force <code>O(N&sup2;)</code> approach of checking every buy/sell pair.</p>

</div>
</div>

---
title: 'Take Discount or Not'
date: '2026-04-15'
prog: 'Arrays · April 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Take Discount or Not</h1>
<div class="writeup-date">April 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">There are N items in a shop. You know that the price of the i-th item is A<sub>i</sub>. Chef wants to buy all the N items. There is also a discount coupon that costs X rupees and reduces the cost of every item by Y rupees. If the price of an item was initially ≤Y, it becomes free, i.e, costs 0. Determine whether Chef should buy the discount coupon or not. Chef will buy the discount coupon if and only if the total price he pays after buying the discount coupon is strictly less than the price he pays without buying the discount coupon.</p>

<h4 class="mb-3">Input Format</h4>
<ul>
    <li>The first line of input will contain a single integer <code>T</code>, denoting the number of test cases. The description of the test cases follows.</li>
    <li>Each test case consists of two lines of input.</li>
    <li>The first line of the test case contains three space-separated integers — <code>N</code>, <code>X</code>, and <code>Y</code>.</li>
    <li>The second line contains <code>N</code> space-separated integers — <code>A<sub>1</sub>, A<sub>2</sub>, …, A<sub>N</sub></code>.</li>
</ul>
<h4 class="mb-3">Output Format</h4>
<p class="mb-3">For each test case, output <strong>COUPON</strong> if Chef should buy the discount coupon, and <strong>NO COUPON</strong> otherwise.</p>
<p class="mb-3">Each letter of the output may be printed in either lowercase or uppercase. For example, the strings coupon, CouPoN, and COUPON will all be treated as equivalent.</p>
<h4 class="mb-3">Constraints</h4>
<ul>
    <li>1 ≤ <code>T</code> ≤ 1000</li>
    <li>1 ≤ <code>N</code> ≤ 100</li>
    <li>1 ≤ <code>X</code>, <code>Y</code> ≤ 10<sup>5</sup></li>
    <li>1 ≤ <code>A<sub>i</sub></code> ≤ 10<sup>5</sup></li>
</ul>
<h4 class="mb-3">Input</h4>
<pre>5
4 30 10
15 8 22 6
4 40 10
15 8 22 6
4 34 10
15 8 22 6
2 10 100
60 80
3 30 5
50 60 50
</pre>
<h4 class="mb-3">Output</h4>
<pre>COUPON
NO COUPON
NO COUPON
COUPON
NO COUPON
</pre>

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

<pre>// C++
class Solution {
public:
    string checkCoupon(int n, int x, int y, vector<int>& prices) {
        long long save = 0;
        for (int i = 0; i < n; i++) {
            if (prices[i] >= y) {
                save += y;
            } else {
                save += prices[i];
            }
        }

        if (save > x) {
            return "COUPON";
        } else {
            return "NO COUPON";
        }
    }
};
</pre>

<h4 class="mb-3">Code Explanation</h4>
<p class="mb-2"><strong>1. The Mathematical Objective</strong></p>
<p class="mb-2">We compare the cost without the coupon against the total cost after buying it.</p>
<ul>
    <li><strong>Without coupon:</strong> pay the full sum of all <code>A<sub>i</sub></code>.</li>
    <li><strong>With coupon:</strong> pay <code>X</code> plus the discounted prices of all items.</li>
</ul>
<p class="mb-2">The coupon is useful only when the money saved is more than its cost.</p>

<p class="mb-2"><strong>2. How Your Code Implements This</strong></p>
<p class="mb-2">Your code tracks savings directly with <code>min(price, Y)</code>:</p>
<ul>
    <li>If <code>A<sub>i</sub> ≥ Y</code>, the discount saves exactly <code>Y</code>.</li>
    <li>If <code>A<sub>i</sub> < Y</code>, the item becomes free, so the saving is <code>A_i</code>.</li>
</ul>
<p class="mb-2">Adding <code>min(price, Y)</code> for every item gives the total savings from the coupon.</p>

<p class="mb-2"><strong>3. Summary of Logic</strong></p>
<p class="mb-2"><code>total_saved += min(price, Y);</code> keeps a running total of the savings.</p>
<p class="mb-2"><code>if (total_saved > X)</code> means the savings beat the coupon cost, so we return <strong>COUPON</strong>; otherwise, we return <strong>NO COUPON</strong>.</p>
<p class="mb-2">This works in <code>O(N)</code> time with <code>O(1)</code> extra space, and <code>long long</code> keeps the savings total safe from overflow.</p>


</div>
</div>
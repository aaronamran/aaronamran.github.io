---
title: 'Find Maxmimum in an Array'
date: '2026-04-15'
prog: 'Arrays · April 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Find Maxmimum in an Array</h1>
<div class="writeup-date">April 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given a list of N integers, representing height of mountains. Find the height of the tallest mountain.</p>

<p class="mb-2"><strong>Input:</strong> Two space-separated integers N and X (array size and element to search), followed by N array elements.</p>
<p class="mb-3"><strong>Output:</strong> "YES" if X is present in A, otherwise "NO".</p>
<p class="mb-3"><strong>Constraints:</strong> 1 ≤ N, X ≤ 10<sup>5</sup> &nbsp;•&nbsp; 1 ≤ A<sub>i</sub> ≤ 10<sup>5</sup></p>

<h4 class="mb-3">Examples</h4>
<p class="mb-2"><strong>Input:</strong></p>
<ul>
    <li>The first line contains <code>T</code>, the number of testcases.</li>
    <li>For each testcase:</li>
    <ul>
        <li>The first line contains one integer <code>N</code> (number of mountains).</li>
        <li>The second line contains <code>N</code> space separated integers: the height of each mountain.</li>
    </ul>
</ul>
<p class="mb-2"><strong>Output:</strong> For each testcase, output one line with one integer: the height of the tallest mountain for that test case.</p>
<p class="mb-3"><strong>Constraints:</strong></p>
<ul>
    <li>1 ≤ T ≤ 10</li>
    <li>1 ≤ N ≤ 100000</li>
    <li>0 ≤ height of each mountain ≤ 10<sup>9</sup></li>
</ul>
<h4 class="mb-3">Sample Input</h4>
<pre>1
5
4 7 6 3 1
</pre>
<h4 class="mb-3">Sample Output</h4>
<pre>7
</pre>

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

<pre>// C++
#include <iostream>
#include <algorithm> // For std::max

using namespace std;

int main() {
    // Optimization: Speed up input and output operations
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int T;
    if (!(cin >> T)) return 0;
    
    while (T--) {
        int N;
        cin >> N;
        
        int max_h = 0; // Initialize to the lowest possible constraint value
        for (int i = 0; i < N; i++) {
            int current_h;
            cin >> current_h;
            // Use std::max for cleaner code
            max_h = max(max_h, current_h);
        }
        cout << max_h << "\n"; // "\n" is faster than endl
    }
    return 0;
}
</pre>

<h4 class="mb-3">Code Explanation</h4>

<p class="mb-2"><strong>1. The Setup (Speeding things up)</strong></p>
<pre>ios_base::sync_with_stdio(false);
cin.tie(NULL);</pre>
<p class="mb-2">In competitive programming, you often deal with millions of numbers. C++ normally keeps "safe" settings that make cin and cout communicate with older C-language systems. By setting <code>sync_with_stdio(false)</code> and <code>cin.tie(NULL)</code>, you tell the program: "Ignore the old C rules, I want you to read and write data as fast as possible."</p>

<p class="mb-2"><strong>2. The Test Case Loop</strong></p>
<pre>int T;
cin >> T;
while (T--) { ... }</pre>
<p class="mb-2">The problem provides <code>T</code> batches (test cases). The <code>while (T--)</code> is a clean way of saying: "Run this block of code <code>T</code> times, subtracting 1 from <code>T</code> each time until we hit 0."</p>

<p class="mb-2"><strong>3. The "Record-Keeper" Variable</strong></p>
<pre>int N;
cin >> N;
int max_h = 0;</pre>
<p class="mb-2">For every batch, we first read how many mountains (<code>N</code>) exist. We create <code>max_h</code> (the record holder) and initialize it to 0. Since the problem says mountain heights are &ge; 0, starting at 0 is perfectly safe.</p>

<p class="mb-2"><strong>4. Processing One-by-One (The Loop)</strong></p>
<pre>for (int i = 0; i < N; i++) {
    int current_h;
    cin >> current_h;
    max_h = max(max_h, current_h);
}</pre>
<p class="mb-2">
This is the heart of the code:
<ul>
<li>Instead of creating a giant array (like <code>int arr[100000]</code>) to store every single number, you create a tiny variable <code>current_h</code>.</li>
<li>As you read each new mountain height, you ask: "Is this new mountain taller than the tallest one I've seen so far?"</li>
<li><code>max(max_h, current_h)</code> does exactly this comparison. If the new one is taller, <code>max_h</code> updates to the new value. If it's shorter, <code>max_h</code> stays the same.</li>
</ul>
</p>

<p class="mb-2"><strong>5. Efficient Printing</strong></p>
<pre>cout << max_h << "\n";</pre>
<p class="mb-2">You print the result after checking every mountain in the batch. By using <code>"\n"</code> instead of <code>endl</code>, you avoid a process called "flushing the buffer." Flushing is like hitting "Enter" on a printer—it forces the printer to print immediately, which is slow if you have thousands of lines to print. <code>"\n"</code> is like just moving to the next line on the page, allowing the system to print more efficiently.</p>


</div>
</div>
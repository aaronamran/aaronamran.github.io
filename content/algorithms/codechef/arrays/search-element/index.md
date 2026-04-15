---
title: 'Search an Element in an Array'
date: '2026-04-14'
prog: 'Arrays · April 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Search an Element in an Array</h1>
<div class="writeup-date">April 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array A of size N and an element X. Find whether the array A contains the element X or not.</p>

<p class="mb-2"><strong>Input:</strong> Two space-separated integers N and X (array size and element to search), followed by N array elements.</p>
<p class="mb-3"><strong>Output:</strong> "YES" if X is present in A, otherwise "NO".</p>
<p class="mb-3"><strong>Constraints:</strong> 1 ≤ N, X ≤ 10<sup>5</sup> &nbsp;•&nbsp; 1 ≤ A<sub>i</sub> ≤ 10<sup>5</sup></p>

<h4 class="mb-3">Examples</h4>
<pre>Input:  
5 3
7 3 5 2 1
Output: YES</pre>

<pre>Input:  
5 10
7 3 5 2 1
Output: NO</pre>

<h4 class="mb-3">Solution (C++)</h4>
<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(1)</p>

<pre>// C++
#include <iostream>
using namespace std;

int main() {
    // Optimization: Speed up input and output
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int N, X;
    if (!(cin >> N >> X)) return 0;
    
    bool found = false;
    for (int i = 0; i < N; i++) {
        int element;
        cin >> element;
        // If we already found it, we just consume the rest of the input
        if (element == X) {
            found = true;
        }
    }
    
    if (found) cout << "YES" << "\n";
    else cout << "NO" << "\n";
    
    return 0;
}
</pre>

<h4 class="mb-3">Code Explanation</h4>

<p class="mb-2"><strong>1. Fast I/O Optimization</strong></p>
<pre>ios_base::sync_with_stdio(false);</pre>
<p class="mb-2">By default, C++ streams are synchronized with C stdio (such as <code>printf</code> and <code>scanf</code>). Disabling this synchronization makes <code>cin</code>/<code>cout</code> faster for large input/output.</p>
<pre>cin.tie(NULL);</pre>
<p class="mb-3">By default, <code>cin</code> is tied to <code>cout</code>, so <code>cout</code> is flushed before every input operation. Untying avoids unnecessary flushes and improves performance.</p>

<p class="mb-2"><strong>2. Input Handling</strong></p>
<pre>if (!(cin &gt;&gt; N &gt;&gt; X)) return 0;</pre>
<p class="mb-3">This safely reads <code>N</code> and <code>X</code>. If input fails (for example, empty input), the program exits gracefully.</p>

<p class="mb-2"><strong>3. On-the-fly Search Logic</strong></p>
<pre>bool found = false;
for (int i = 0; i &lt; N; i++) {
    int element;
    cin &gt;&gt; element;
    if (element == X) {
        found = true;
    }
}</pre>
<p class="mb-2">We do not store the whole array. Each element is read, checked, then discarded.</p>
<p class="mb-2"><strong>Why this is better for memory:</strong> space becomes <code>O(1)</code> instead of <code>O(N)</code>.</p>
<p class="mb-3"><strong>Important:</strong> even if <code>X</code> is found early, we still continue reading all remaining values so input is fully consumed.</p>

<p class="mb-2"><strong>4. Output</strong></p>
<pre>if (found) cout &lt;&lt; "YES" &lt;&lt; "\n";
else cout &lt;&lt; "NO" &lt;&lt; "\n";</pre>
<p class="mb-3">Using <code>"\n"</code> is typically faster than <code>endl</code> because <code>endl</code> also flushes the output buffer.</p>


</div>
</div>
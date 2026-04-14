---
title: 'Search an Element in an Array'
date: '2026-04-01'
excerpt: 'Given an array of size N and an element X, determine whether the array contains the element X or not. Practice linear search and array traversal.'
prog: 'Arrays · Easy · April 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">CodeChef</div>
<h1 class="writeup-title">Search an Element in an Array</h1>
<div class="writeup-date">April 2026 &middot; Arrays</div>
</div>
</div>
<p class="lead mb-4">Given an array A of size N and an element X, determine whether the array contains the element X or not.</p>

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

<h4 class="mb-3">Solution</h4>
<pre># Python
n, x = map(int, input().split())
arr = list(map(int, input().split()))
print("YES" if x in arr else "NO")</pre>

<pre>// C++
#include <bits/stdc++.h>
using namespace std;

int main() {
    int N, X;
    cin >> N >> X;
    
    int A[N];
    for (int i = 0; i < N; i++) {
        cin >> A[i];
    }
    
    bool found = false;
    for (int i = 0; i < N; i++) {
        if (A[i] == X) {
            found = true;
            break; // Stop searching once found
        }
    }
    
    if (found) {
        cout << "YES" << endl;
    } else {
        cout << "NO" << endl;
    }
    
    return 0;
}
</pre>

<p class="mb-3"><strong>Complexity:</strong> Time O(N) &nbsp;•&nbsp; Space O(N)</p>
</div>
</div>
---
title: 'XSS Game'
date: '2026-06-14'
excerpt: 'Execute alert function in JavaScript through an XSS vulnerability'
prog: 'Google XSS Game'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Google</div>
<h1 class="writeup-title">XSS Game</h1>
<div class="writeup-date">June 2026</div>
</div>
</div>
<p class="lead mb-4">This is a walkthrough of the <a href="http://www.xssgame.com" target="_blank" referrerpolicy="no-referrer">XSS Game by Google</a>. The goal of each level is to execute the alert function in JavaScript through an XSS vulnerability.</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Level 1: Foogle</strong> This level demonstrates a common cause of XSS where user input is directly written to the page without proper escaping.
Interact with the vulnerable application window below and find a way to make it execute JavaScript of your choosing. You can take actions inside the vulnerable window or directly edit its URL bar.
Enter an input that will cause the application to execute the <code>alert()</code> function in JavaScript. Once you pop up the alert, the solution will be validated on the server side, and you will be able to advance to the next level. It is important that the solution shouldn't require user interaction — opening the URL should be enough to trigger the alert.</p>
<img src="/assets/hackinglabs/google/xssgame/xssgame_google_image1.png" alt="XSS Game 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/google/xssgame/xssgame_google_image2.png" alt="XSS Game 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>XSS Payload:</strong> &lt;script&gt;alert(&apos;XSS&apos;)&lt;/script&gt;</p>
<br />


<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Level 2: Time's out!</strong> Every bit of user-supplied data must be correctly escaped for the context of the page in which it will appear. This level shows why. Enter an input that will cause the application to execute the <code>alert()</code> function in JavaScript.</p>
<img src="/assets/hackinglabs/google/xssgame/xssgame_google_image3.png" alt="XSS Game 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```html
<html>
  <head>
    <script src="/static/js/js_frame.js"></script>
    <script>
      function startTimer(seconds) {
        seconds = parseInt(seconds) || 3;
        setTimeout(function() {
          window.confirm("Time is up!");
          window.loading.style.display = 'none';
          window.message.innerHTML = '<a href="?">Go back</a> to the timer setup page';
        }, seconds * 1000);
      }

    </script>
  </head>
  <body style="background-color: white;">
    <center>
      <h1 style="font-family: serif">
        webtim<span style="color: teal">r</span> <span style="color: green">pro</span>
      </h1>
      <!-- Source: https://commons.wikimedia.org/wiki/File:Loading_icon.gif -->
      <img id="loading" src="/static/img/loading.gif" style="width: 50%" onload="startTimer('3');" />
      <br>
      <div id="message">Your timer will execute in 3 seconds.</div>
      
  </center>
  </body>
</html>
```

<p class="mb-3">Notice that the <code>timer</code> parameter has a value of 3. This will be our injection point. The application takes the value of the timer URL parameter and inserts it directly into the HTML source. Because the input is injected directly into an inline JavaScript event handler (<code>onload</code>), we can break out of the string literal (<code>'3'</code>) and inject our own JavaScript commands. To achieve this, we need to open the target in a new tab and enter the payload <code>3&apos;); alert(1); //</code> to trigger the alert function.</p>
<img src="/assets/hackinglabs/google/xssgame/xssgame_google_image4.png" alt="XSS Game 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>XSS Payload:</strong> 3&apos;); alert(1); //</p>
<br />


<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Level 3: Gallery</strong> Complex web applications often generate parts of their UI in JavaScript. Some common JS functions are execution sinks, which means that they will cause the browser to execute any scripts that appear in their input.
The application on this level is using one such sink.
Since you can't enter your payload anywhere in the application, you will have to edit the address manually in the URL bar provided. The goal is to exploit a vulnerability in the application to make it execute the JavaScript <code>alert()</code> function.</p>
<img src="/assets/hackinglabs/google/xssgame/xssgame_google_image5.png" alt="XSS Game 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```html

<html>
  <head>
    <link rel="stylesheet" href="/static/css/level_style.css" />
    <script src="/static/js/jquery2.min.js"></script>
    <script src="/static/js/js_frame.js"></script>

    <script>
      window.onvalidationready = null;
      function validate() {
        $.post(location.pathname, {'h': location.hash}, function(data, status) {
          $('#result').html(data);
          if (window.onvalidationready) {
            window.onvalidationready();
            window.onvalidationready = null;
          }
        });
      }

      function chooseTab(name) {
        var html = "Cat " + parseInt(name) + "<br>";
        html += "<img src='/static/img/cat" + name + ".jpg' />";

        document.getElementById('tabContent').innerHTML = html;

        // Select the current tab
        var tabs = document.querySelectorAll('.tab');
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].id == "tab" + parseInt(name)) {
            tabs[i].className = "tab active";
            } else {
            tabs[i].className = "tab";
          }
        }

        window.location.hash = name;

        // Tell parent we've changed the tab
        top.postMessage({'url': self.location.toString()}, "*");
      }

      function hashchange() {
        if (self.location.hash) {
          chooseTab(decodeURIComponent(self.location.hash.substr(1)));
          validate();
        } else {
          chooseTab(1);
        }
      }

      window.onload = hashchange;
      window.onhashchange = hashchange;
    </script>

  </head>
  <body id="dom-demo">
    <div id="result"></div>
    <div id="header">
      <span>Cat Image</span> <span>X</span><span>S</span><span>S</span> Library
    </div>

    <!-- Source: https://www.flickr.com/photos/eraphernalia_vintage/2988746750
         CC BY-SA 2.0 https://creativecommons.org/licenses/by-sa/2.0/
         Created by Cheryl, published here without modifications -->
    <div class="tab" id="tab1" onclick="chooseTab('1')">Cat 1</div>
    <!-- Source: https://pixabay.com/en/cat-red-christmas-santa-hat-funny-1898512/ (License: Public Domain) -->
    <div class="tab" id="tab2" onclick="chooseTab('2')">Cat 2</div>
    <!-- Source: https://pixabay.com/en/cat-kitten-cute-funny-whiskers-1686730/ (License: Public Domain) -->
    <div class="tab" id="tab3" onclick="chooseTab('3')">Cat 3</div>

    <div id="tabContent"> </div>
  </body>
</html>
```

<p class="mb-3">The application controls the visible content based on the URL hash (<code>location.hash</code>). When the page loads or the hash changes, the <code>hashchange()</code> function takes everything after the <code>#</code> symbol, decodes it, and passes it directly into the <code>chooseTab(name)</code> function as the <code>name</code> variable. Inside <code>chooseTab(name)</code>, the code dynamically builds an HTML string using the <code>name</code> variable and injects it into the DOM via <code>innerHTML</code>. 
</p>
<img src="/assets/hackinglabs/google/xssgame/xssgame_google_image6.png" alt="XSS Game 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>XSS Payload:</strong> &apos;onerror=&apos;alert()&apos;</p>
<br />







<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">March 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
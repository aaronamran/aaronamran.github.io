---
title: 'Encoding Techniques'
date: '2026-04-01'
excerpt: 'Practice Encoding Techniques in multiple lab exercises.'
prog: 'Hackviser Cryptanalysis Labs  -  April 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/cryptanalysislabs/encodingtechniques_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Encoding Techniques</h1>
<div class="writeup-date">April 2026 · Cryptanalysis Labs</div>
</div>
</div>
<p class="lead mb-4">Practice encoding techniques in multiple lab exercises.</p>

<h5 class="mb-2">1. ASCII</h5>
<p class="mb-3"><strong>ASCII (American Standard Code for Information Interchange) is a character encoding standard used to represent text in computers and other devices that use text. This system primarily includes printable characters such as letters of English alphabet (upper and lower case), numbers, and punctuation marks. Each ASCII character is assigned a unique number between 0 and 127. What is the decoded message of the text that has been encoded using ASCII inside the file?</strong></p>
<p class="mb-3"><strong>File content: </strong>83 116 97 114 114 121 78 105 103 104 116 86 97 110 71 111 103 104</p>
<p class="mb-5"><strong>Answer:</strong> StarryNightVanGogh</p>
<br />

<h5 class="mb-2">2. Base64</h5>
<p class="mb-3"><strong>Base64 is a encoding algorithm that allows you to transform any characters into an alphabet which consists of Latin letters, digits, plus, and slash. Thanks to it, you can convert Chinese characters, emoji, and even images into a “readable” string, which can be saved or transferred anywhere. What is the decoded message of the text that has been encoded using Base64 inside the file?</strong></p>
<p class="mb-3"><strong>File content: </strong>TW9uYUxpc2FEYVZpbmNp</p>
<p class="mb-5"><strong>Answer:</strong> MonaLisaDaVinci</p>
<br />

<h5 class="mb-2">3. URL Encoding</h5>
<p class="mb-3"><strong>URL Encoding converts reserved, unsafe, and non-ASCII characters in URLs to a format that is universally accepted and understood by all web browsers and servers. It first converts the character to one or more bytes. Then each byte is represented by two hexadecimal digits preceded by a percent sign (%) - (e.g. %xy). The percent sign is used as an escape character. What is the decoded message of the text that has been encoded using URL Encoding inside the file?</strong></p>
<p class="mb-3"><strong>File content: </strong>%54%68%65%53%63%72%65%61%6D%4D%75%6E%63%68</p>
<p class="mb-5"><strong>Answer:</strong> TheScreamMunch</p>
<br />

<h5 class="mb-2">4. Hex Encoding</h5>
<p class="mb-3"><strong>Hex encoding is a transfer encoding in which each byte is converted to the 2-digit base-16 encoding of that byte (preserving leading zeroes), which is then usually encoded in ASCII. It is inefficient, but it is a simple, commonly-used way to represent binary data in plain text. What is the decoded message of the text that has been encoded using Hex Encoding inside the file?</strong></p>
<p class="mb-3"><strong>File content: </strong>54686542697274684F6656656E7573426F74746963656C6C69</p>
<p class="mb-5"><strong>Answer:</strong> TheBirthOfVenusBotticelli</p>
<br />

<h5 class="mb-2">5. Binary Encoding</h5>
<p class="mb-3"><strong>Binary encoding is a digital technique transforming data into a two-state system—often represented as 1s and 0s. It represents data using only two symbols: 0 and 1. In binary encoding, each byte (consisting of 8 bits) is directly translated into a sequence of eight 0s and 1s. What is the decoded message of the text that has been encoded using Binary Encoding inside the file?</strong></p>
<p class="mb-3"><strong>File content: </strong>01000111 01101001 01110010 01101100 01010111 01101001 01110100 01101000 01000001 01010000 01100101 01100001 01110010 01101100 01000101 01100001 01110010 01110010 01101001 01101110 01100111 01010110 01100101 01110010 01101101 01100101 01100101 01110010</p>
<p class="mb-5"><strong>Answer:</strong> GirlWithAPearlEarringVermeer</p>
<br />

<h5 class="mb-2">6. Base32</h5>
<p class="mb-3"><strong>Base32 encoding algorithm is designed to encode any data to 32-printable characters. It is similar to Base64 encoding, except that it uses an alphabet of 32 characters rather than 64. This alphabet consists of the characters A to Z, and numbers 2 to 7. What is the decoded message of the text that has been encoded using Base32 Encoding inside the file?</strong></p>
<p class="mb-3"><strong>File content: </strong>KRUGKUDFOJZWS43UMVXGGZKPMZGWK3LPOJ4UIYLMNE======</p>
<p class="mb-5"><strong>Answer:</strong> ThePersistenceOfMemoryDali</p>
<br />

<h5 class="mb-2">7. Quoted-printable</h5>
<p class="mb-3"><strong>Quoted-printable is an encoding method defined in the MIME standard. It is used primarily to encode 8-bit text (such as text that includes foreign characters) into 7-bit US ASCII, creating a document that is mostly readable by humans, even in its encoded form. All MIME-compliant applications can decode quoted-printable text, though they may not necessarily be able to properly display the document as it was originally intended. What is the decoded message of the text that has been encoded using Quoted-printable encoding inside the file?</strong></p>
<p class="mb-3"><strong>File content: </strong>=54=68=65=4E=69=67=68=74=57=61=74=63=68=52=65=6D=62=72=61=6E=64=74</p>
<p class="mb-5"><strong>Answer:</strong> TheNightWatchRembrandt</p>
<br />

<h5 class="mb-2">8. HTML Character Entities</h5>
<p class="mb-3"><strong>HTML character entities are basically a set of characters (entity) used to represent few characters reserved by the HTML, especially invisible characters or characters difficult to type out using a regular keyboard. HTML provides some entity names and entity numbers to use these symbols. What is the decoded message of the text that has been encoded using HTML character entities encoding inside the file?</strong></p>
<p class="mb-3"><strong>File content: </strong>&amp;#70;&amp;#105;&amp;#115;&amp;#104;&amp;#101;&amp;#114;&amp;#109;&amp;#101;&amp;#110;&amp;#65;&amp;#116;&amp;#83;&amp;#101;&amp;#97;&amp;#84;&amp;#117;&amp;#114;&amp;#110;&amp;#101;&amp;#114;</p>
<p class="mb-5"><strong>Answer:</strong> FishermenAtSeaTurner</p>
<br />

<h5 class="mb-2">9. Uuncoding</h5>
<p class="mb-3"><strong>Uuencode (also called Uuencode/Uudecode) is a utility for encoding and decoding files. Originally this term stood for "UNIX-to-UNIX encoding" however this encoding and decoding utility is now commonly available on multiple platforms and in many clients. Uuencode translates or converts a file or e-mail attachment from its binary or bit-stream representation into the 7-bit ASCII set of text characters. This format is more easily handled by older systems which may not handle binary files well plus larger files can more easily be divided into several separate transmissions. What is the decoded message of the text that has been encoded using Uuencoding inside the file?</strong></p>
<p class="mb-3"><strong>File content: </strong>&#98;&#101;&#103;&#105;&#110;&#32;&#48;&#55;&#52;&#52;&#32;&#111;&#100;&#116;&lowbar;&#117;&#117;&#101;&#110;&#99;&#111;&#100;&#105;&#110;&#103;&lowbar;&#102;&#105;&#108;&#101;&period;&#100;&#97;&#116;&#13;&NewLine;&comma;&#53;&amp;&#65;&#69;&#50;&#86;&#69;&#83;&lt;&#84;&#77;&#76;&colon;&#54;&#85;&#84;&#13;&NewLine;&grave;&#13;&NewLine;&#101;&#110;&#100;</p>
<p class="mb-5"><strong>Answer:</strong> TheKissKlimt</p>

<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">April 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
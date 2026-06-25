---
title: 'Binary Analysis'
date: '2026-06-23'
excerpt: 'Practice Binary Analysis in multiple lab exercises.'
prog: 'Hackviser Mobile Application Security Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/mobileapplicationsecurity_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Binary Analysis</h1>
<div class="writeup-date">June 2026 · Mobile Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Binary Analysis in multiple lab exercises.</p>


<h5 class="mb-2"><strong>1. Hardcoded Secret</strong></h5>
<p class="mb-3">This lab includes analyzing hard-coded sensitive data in Android apps.

To complete the lab you need to find the authentication key.

What is the Authentication Key?</p>
<p class="mb-3"><strong>Steps: </strong>First we open the apk file in JADX-GUI. In the left panel, we navigate to <code>Source code &gt; com &gt; selector.hardcodedsecret &gt; MainActivity</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/binaryanalysis/binaryanalysis_hackviser_image1.png" alt="Binary Analysis 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Unfortunately we will not find any authentication key written as plaintext in this code. Look at these two specific parts of the code:</p>

```Java
public native int getAuthenticationKey();

static {
    System.loadLibrary("hardcodedsecret");
}
```

<p class="mb-3"><code>System.loadLibrary("hardcodedsecret");</code> tells the app to load a native binary file named <code>libhardcodedsecret.s</code> <code>public native int getAuthenticationKey();</code> indicates that the method returning the key is executing compiled C/C++ code inside that <code>.so</code> file, rather than Java. <code>Integer.parseInt(...)</code> tells us that the final authentication key is a regular integer (number). Now that we have the clues we need, we need to extract the native library by renaming the apk file from <code>filename.apk</code> to <code>filename.zip</code>. Then we navigate to the <code>/lib</code> folder inside which contains separate folders for different CPU architectures. We open any of those folders (in my case I open the x86 folder) and locate the file named <code>libhardcodedsecret.so</code>. Because the key is a regular number (an <code>int</code>), the compiler didn't store it as text. Instead, it is baked directly into the assembly code as a numeric instruction (for example, <code>mov eax, 0x5c3a</code>). Therefore we can just use <code>objdump</code> tool in the Linux terminal.</p>

```Bash
user@linux:~$ objdump -d libhardcodedsecret.so | grep -A 10 "getAuthenticationKey"
000004f0 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base-0xd0>:
 4f0:   53                      push   %ebx
 4f1:   83 ec 08                sub    $0x8,%esp
 4f4:   e8 00 00 00 00          call   4f9 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base-0xc7>
 4f9:   5b                      pop    %ebx
 4fa:   81 c3 fb 11 00 00       add    $0x11fb,%ebx
 500:   8d 83 1c ff ff ff       lea    -0xe4(%ebx),%eax
 506:   89 04 24                mov    %eax,(%esp)
 509:   e8 d2 00 00 00          call   5e0 <__cxa_finalize@plt>
 50e:   83 c4 08                add    $0x8,%esp
 511:   5b                      pop    %ebx
 512:   c3                      ret
 513:   90                      nop
 514:   90                      nop
--
 530:   e9 eb ff ff ff          jmp    520 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base-0xa0>
 535:   90                      nop
 536:   90                      nop
 537:   90                      nop
 538:   90                      nop
 539:   90                      nop
 53a:   90                      nop
 53b:   90                      nop
 53c:   90                      nop
 53d:   90                      nop
 53e:   90                      nop
--
 544:   e8 00 00 00 00          call   549 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base-0x77>
 549:   5b                      pop    %ebx
 54a:   81 c3 ab 11 00 00       add    $0x11ab,%ebx
 550:   8b 44 24 10             mov    0x10(%esp),%eax
 554:   85 c0                   test   %eax,%eax
 556:   74 02                   je     55a <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base-0x66>
 558:   ff d0                   call   *%eax
 55a:   83 c4 08                add    $0x8,%esp
 55d:   5b                      pop    %ebx
 55e:   c3                      ret
 55f:   90                      nop
 560:   53                      push   %ebx
 561:   83 ec 08                sub    $0x8,%esp
 564:   e8 00 00 00 00          call   569 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base-0x57>
 569:   5b                      pop    %ebx
 56a:   81 c3 8b 11 00 00       add    $0x118b,%ebx
 570:   83 ec 04                sub    $0x4,%esp
 573:   8d 83 1c ff ff ff       lea    -0xe4(%ebx),%eax
 579:   8d 8b 4c ee ff ff       lea    -0x11b4(%ebx),%ecx
 57f:   50                      push   %eax
 580:   ff 74 24 18             pushl  0x18(%esp)
 584:   51                      push   %ecx
 585:   e8 66 00 00 00          call   5f0 <__cxa_atexit@plt>
 58a:   83 c4 18                add    $0x18,%esp
--
 594:   e8 00 00 00 00          call   599 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base-0x27>
 599:   5b                      pop    %ebx
 59a:   81 c3 5b 11 00 00       add    $0x115b,%ebx
 5a0:   8d 83 1c ff ff ff       lea    -0xe4(%ebx),%eax
 5a6:   50                      push   %eax
 5a7:   ff 74 24 1c             pushl  0x1c(%esp)
 5ab:   ff 74 24 1c             pushl  0x1c(%esp)
 5af:   ff 74 24 1c             pushl  0x1c(%esp)
 5b3:   e8 48 00 00 00          call   600 <__register_atfork@plt>
 5b8:   83 c4 18                add    $0x18,%esp
 5bb:   5b                      pop    %ebx
--
000005c0 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base>:
 5c0:   b8 38 9c ca 00          mov    $0xca9c38,%eax
 5c5:   c3                      ret

Disassembly of section .plt:

000005d0 <__cxa_finalize@plt-0x10>:
 5d0:   ff b3 04 00 00 00       pushl  0x4(%ebx)
 5d6:   ff a3 08 00 00 00       jmp    *0x8(%ebx)
 5dc:   90                      nop
 5dd:   90                      nop
--
 5eb:   e9 e0 ff ff ff          jmp    5d0 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base+0x10>

000005f0 <__cxa_atexit@plt>:
 5f0:   ff a3 10 00 00 00       jmp    *0x10(%ebx)
 5f6:   68 08 00 00 00          push   $0x8
 5fb:   e9 d0 ff ff ff          jmp    5d0 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base+0x10>

00000600 <__register_atfork@plt>:
 600:   ff a3 14 00 00 00       jmp    *0x14(%ebx)
 606:   68 10 00 00 00          push   $0x10
 60b:   e9 c0 ff ff ff          jmp    5d0 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base+0x10>
```

<p class="mb-3">Because of how the symbols were resolved, the earlier blocks were just framework/setup hooks (<code>@@Base-0xd0</code>, etc.). The real implementation of the function starts at address <code>000005c0</code>:</p>

```Assembly
000005c0 <Java_com_selector_hardcodedsecret_MainActivity_getAuthenticationKey@@Base>:
 5c0:   b8 38 9c ca 00          mov    $0xca9c38,%eax
 5c5:   c3                      ret
``` 

<p class="mb-3">The assembly instruction <code>mov $0xca9c38,%eax</code> is loading the hexadecimal value <code>0xca9c38</code> into the return register (<code>%eax</code>), right before the function hits <code>ret</code> (return). Since the Android Java code uses <code>Integer.parseInt()</code>, it expects this key to be a standard decimal integer. Now we can convert the hex value <code>ca9c38</code> to decimal: 
<br />
c x 16<sup>5</sup> + a x 16<sup>4</sup> + 9 x 16<sup>3</sup> + c x 16<sup>2</sup> + 3 x 16<sup>1</sup> + 8 x 16<sup>0</sup> = 13278264</p>
<p class="mb-5"><strong>Answer:</strong> 13278264</p>
<br />


<h5 class="mb-2"><strong>2. Native Function Call I</strong></h5>
<p class="mb-3">This lab includes the analysis of native function calls in Android applications.

You need to find the pin code to complete the lab.

What is the Pin Code?</p>
<p class="mb-3"><strong>Steps: </strong>First we open the apk file in JADX-GUI. In the left panel, we navigate to <code>Source code &gt; com &gt; selector.nativefunc &gt; LoginActivity</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/binaryanalysis/binaryanalysis_hackviser_image2.png" alt="Binary Analysis 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Again we will not find any pin code being hardcoded as plaintext string in the code. However, take a look at the code below:</p>

```Java
public native boolean getLoginResult(String str);
```

<p class="mb-3">It takes our input string as a parameter (<code>String str</code>) and returns a <code>boolean</code>, the compiled assembly inside the <code>.so</code> file isn't just returning a hardcoded number. Instead, it is highly likely performing a string comparison (like <code>strcmp</code> or <code>strncmp</code>) between our input and the correct pin code stored inside the binary. The next step is to extract the native library by renaming the apk file from <code>filename.apk</code> to <code>filename.zip</code>. Then we navigate to the <code>/lib</code> folder inside which contains separate folders for different CPU architectures. We open any of those folders (in my case I open the x86 folder) and locate the file named <code>libnativefunc.so</code>. In a Linux terminal, we can run the <code>objdump</code> command against the file.</p>


```Bash
user@linux:~$ objdump -d libnativefunc.so | grep -A 40 "getLoginResult"
00018790 <Java_com_selector_nativefunc_LoginActivity_getLoginResult@@Base>:
   18790:       53                      push   %ebx
   18791:       57                      push   %edi
   18792:       56                      push   %esi
   18793:       83 ec 30                sub    $0x30,%esp
   18796:       e8 00 00 00 00          call   1879b <Java_com_selector_nativefunc_LoginActivity_getLoginResult@@Base+0xb>
   1879b:       5b                      pop    %ebx
   1879c:       81 c3 71 91 02 00       add    $0x29171,%ebx
   187a2:       8b 44 24 48             mov    0x48(%esp),%eax
   187a6:       8b 4c 24 40             mov    0x40(%esp),%ecx
   187aa:       65 8b 15 14 00 00 00    mov    %gs:0x14,%edx
   187b1:       89 54 24 2c             mov    %edx,0x2c(%esp)
   187b5:       8b 11                   mov    (%ecx),%edx
   187b7:       89 44 24 04             mov    %eax,0x4(%esp)
   187bb:       89 0c 24                mov    %ecx,(%esp)
   187be:       c7 44 24 08 00 00 00    movl   $0x0,0x8(%esp)
   187c5:       00
   187c6:       ff 92 a4 02 00 00       call   *0x2a4(%edx)
   187cc:       89 c6                   mov    %eax,%esi
   187ce:       c7 04 24 10 00 00 00    movl   $0x10,(%esp)
   187d5:       e8 76 60 02 00          call   3e850 <_Znwj@plt>
   187da:       89 44 24 18             mov    %eax,0x18(%esp)
   187de:       c7 44 24 10 11 00 00    movl   $0x11,0x10(%esp)
   187e5:       00
   187e6:       c7 44 24 14 0e 00 00    movl   $0xe,0x14(%esp)
   187ed:       00
   187ee:       66 c7 40 0c 4d 41       movw   $0x414d,0xc(%eax)
   187f4:       c7 40 08 59 32 49 79    movl   $0x79493259,0x8(%eax)
   187fb:       c7 40 04 4e 32 51 34    movl   $0x3451324e,0x4(%eax)
   18802:       c7 00 4d 6a 51 77       movl   $0x77516a4d,(%eax)
   18808:       c6 40 0e 00             movb   $0x0,0xe(%eax)
   1880c:       8d 44 24 10             lea    0x10(%esp),%eax
   18810:       89 44 24 04             mov    %eax,0x4(%esp)
   18814:       8d 44 24 20             lea    0x20(%esp),%eax
   18818:       89 04 24                mov    %eax,(%esp)
   1881b:       e8 20 60 02 00          call   3e840 <_Z6DecodeRKNSt6__ndk112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE@plt>
   18820:       83 ec 04                sub    $0x4,%esp
   18823:       8a 44 24 20             mov    0x20(%esp),%al
   18827:       88 44 24 0f             mov    %al,0xf(%esp)
   1882b:       a8 01                   test   $0x1,%al
   1882d:       8b 7c 24 28             mov    0x28(%esp),%edi
   18831:       8d 44 24 21             lea    0x21(%esp),%eax
   18835:       0f 45 c7                cmovne %edi,%eax
   18838:       89 44 24 04             mov    %eax,0x4(%esp)
   1883c:       89 34 24                mov    %esi,(%esp)
   1883f:       e8 4c 60 02 00          call   3e890 <strcmp@plt>
--
   1884b:       74 08                   je     18855 <Java_com_selector_nativefunc_LoginActivity_getLoginResult@@Base+0xc5>
   1884d:       89 3c 24                mov    %edi,(%esp)
   18850:       e8 2b 60 02 00          call   3e880 <_ZdlPv@plt>
   18855:       f6 44 24 10 01          testb  $0x1,0x10(%esp)
   1885a:       74 0c                   je     18868 <Java_com_selector_nativefunc_LoginActivity_getLoginResult@@Base+0xd8>
   1885c:       8b 44 24 18             mov    0x18(%esp),%eax
   18860:       89 04 24                mov    %eax,(%esp)
   18863:       e8 18 60 02 00          call   3e880 <_ZdlPv@plt>
   18868:       85 f6                   test   %esi,%esi
   1886a:       0f 94 c0                sete   %al
   1886d:       65 8b 0d 14 00 00 00    mov    %gs:0x14,%ecx
   18874:       3b 4c 24 2c             cmp    0x2c(%esp),%ecx
   18878:       75 07                   jne    18881 <Java_com_selector_nativefunc_LoginActivity_getLoginResult@@Base+0xf1>
   1887a:       83 c4 30                add    $0x30,%esp
   1887d:       5e                      pop    %esi
   1887e:       5f                      pop    %edi
   1887f:       5b                      pop    %ebx
   18880:       c3                      ret
   18881:       e8 1a 60 02 00          call   3e8a0 <__stack_chk_fail@plt>
   18886:       89 c6                   mov    %eax,%esi
   18888:       f6 44 24 10 01          testb  $0x1,0x10(%esp)
   1888d:       74 0c                   je     1889b <Java_com_selector_nativefunc_LoginActivity_getLoginResult@@Base+0x10b>
   1888f:       8b 44 24 18             mov    0x18(%esp),%eax
   18893:       89 04 24                mov    %eax,(%esp)
   18896:       e8 e5 5f 02 00          call   3e880 <_ZdlPv@plt>
   1889b:       89 34 24                mov    %esi,(%esp)
   1889e:       e8 cd 26 02 00          call   3af70 <__emutls_get_address@@Base+0x590>
   188a3:       cc                      int3
   188a4:       cc                      int3
   188a5:       cc                      int3
   188a6:       cc                      int3
   188a7:       cc                      int3
   188a8:       cc                      int3
   188a9:       cc                      int3
   188aa:       cc                      int3
   188ab:       cc                      int3
   188ac:       cc                      int3
   188ad:       cc                      int3
   188ae:       cc                      int3
   188af:       cc                      int3

000188b0 <_ZSt17__throw_bad_allocv@@Base>:
   188b0:       55                      push   %ebp
   188b1:       89 e5                   mov    %esp,%ebp
   188b3:       53                      push   %ebx
   188b4:       56                      push   %esi
   188b5:       83 e4 f0                and    $0xfffffff0,%esp
   188b8:       83 ec 10                sub    $0x10,%esp
   188bb:       e8 00 00 00 00          call   188c0 <_ZSt17__throw_bad_allocv@@Base+0x10>
   188c0:       5b                      pop    %ebx
   188c1:       81 c3 4c 90 02 00       add    $0x2904c,%ebx
   188c7:       c7 04 24 04 00 00 00    movl   $0x4,(%esp)
   188ce:       e8 fd 5f 02 00          call   3e8d0 <__cxa_allocate_exception@plt>
   188d3:       89 c6                   mov    %eax,%esi
   188d5:       89 04 24                mov    %eax,(%esp)
   188d8:       e8 03 60 02 00          call   3e8e0 <_ZNSt9bad_allocC1Ev@plt>
   188dd:       8b 83 7c ff ff ff       mov    -0x84(%ebx),%eax
   188e3:       89 44 24 08             mov    %eax,0x8(%esp)
   188e7:       8b 83 80 ff ff ff       mov    -0x80(%ebx),%eax
   188ed:       89 44 24 04             mov    %eax,0x4(%esp)
   188f1:       89 34 24                mov    %esi,(%esp)
   188f4:       e8 f7 5f 02 00          call   3e8f0 <__cxa_throw@plt>
```

<p class="mb-3">The disassembly lays out exactly how the string obfuscation was handled. Instead of reading it from a hardcoded memory offset file data section, the developer dynamically constructed the obfuscated string right on the stack using multiple stack assignments (<code>movw</code>, <code>movl</code>, <code>movb</code>). Let us take a close look at this specific block of assembly right before the <code>Decode</code> function call:</p>

```Assembly
187ee:       66 c7 40 0c 4d 41       movw   $0x414d,0xc(%eax)
187f4:       c7 40 08 59 32 49 79    movl   $0x79493259,0x8(%eax)
187fb:       c7 40 04 4e 32 51 34    movl   $0x3451324e,0x4(%eax)
18802:       c7 00 4d 6a 51 77       movl   $0x77516a4d,(%eax)
18808:       c6 40 0e 00              movb   $0x0,0xe(%eax)
```

<p class="mb-3">Because x86 architecture uses Little-Endian, bytes are stored in reverse order in memory. When reading these hex values, we need to read them from the lowest offset to the highest offset, and reverse the bytes of each value to construct the true string. <br />
Let's order them properly from offset <code>0x0</code> to <code>0x0e</code>: <br />
1. <code>0x00</code> (<code>movl $0x77516a4d</code>) &gt; Reverse bytes: <code>4d 6a 51 77</code> &gt; ASCII: <code>MjQw</code><br />

2. <code>0x04</code> (<code>movl $0x3451324e</code>) &gt; Reverse bytes: <code>4e 32 51 34</code> &gt; ASCII: <code>N2Q4</code><br />

3. <code>0x08</code> (<code>movl $0x79493259</code>) &gt; Reverse bytes: <code>59 32 49 79</code> &gt; ASCII: <code>Y2Iy</code><br />

4. <code>0x0c</code> (<code>movw $0x414d</code>) &gt; Reverse bytes: <code>4d 41</code> &gt; ASCII: <code>MA</code><br />

5. <code>0x0e</code> (<code>movb $0x00</code>) &gt; Null terminator (<code>\0</code>)<br />

Here is what we get when we stitch those chunks together sequentially: <br /> 
<code>MjQw</code> + <code>N2Q4</code> + <code>Y2Iy</code> + <code>MA</code> = <code>MjQwN2Q4Y2IyMA==</code> <br />
(Padding with <code>==</code> to satisfy standard 4-byte block Base64 constraints since it is 14 characters long). The final step is to decode the base64 string in the terminal:</p>

```Bash
user@linux:~$ echo "MjQwN2Q4Y2IyMA==" | base64 -d
2407d8cb20
```

<p class="mb-5"><strong>Answer:</strong> 2407d8cb20</p>
<br />


<h5 class="mb-2"><strong>3. Native Function Call II</strong></h5>
<p class="mb-3">This lab includes the analysis of native function calls in Android applications.

You need to find the SerialID value to complete the lab.

What is the SerialID?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI. In the left panel, we navigate to <code>Source code &gt; com &gt; selector.swifttasker &gt; App</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/binaryanalysis/binaryanalysis_hackviser_image3.png" alt="Binary Analysis 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Notice the line of code below:</p>

```Java
String strResolveObfuscatedString = StringObfuscator.resolveObfuscatedString("fjgiebbcag");
```

<p class="mb-3">Now we navigate to <code>Source code &gt; com &gt; selector.swifttasker &gt; StringObfuscator</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/binaryanalysis/binaryanalysis_hackviser_image4.png" alt="Binary Analysis 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Understanding the <code>createObfuscationMap()</code> function gives us a clear hint that the letters are mapped to numbers:</p>

```Java
private static Map<Character, Character> createObfuscationMap() {
    HashMap map = new HashMap();
    map.put('0', 'a');
    map.put('1', 'b');
    map.put('2', 'c');
    map.put('3', 'd');
    map.put('4', 'e');
    map.put('5', 'f');
    map.put('6', 'g');
    map.put('7', 'h');
    map.put('8', 'i');
    map.put('9', 'j');
    return map;
}
```

<p class="mb-3">Once we map each character of "<code>fjgiebbcag</code>" back to its number, we get the answer.</p>
<p class="mb-5"><strong>Answer:</strong> 5968411206</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
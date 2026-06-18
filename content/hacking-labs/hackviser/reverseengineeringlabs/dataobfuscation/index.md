---
title: 'Data Obfuscation'
date: '2026-06-15'
excerpt: 'Practice Data Obfuscation in multiple lab exercises.'
prog: 'Hackviser Reverse Engineering Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Data Obfuscation</h1>
<div class="writeup-date">June 2026 · Reverse Engineering Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Data Obfuscation in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. XOR</strong></h5>
<p class="mb-3">This lab includes an application written in C++ that contains important string data encrypted with the XOR algorithm.

To complete the laboratory, you need to find the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong>We start off with static analysis. We run <code>strings xor.exe</code> in our Linux machine and will receive the following output:</p>

```bash
user@linux:~$ strings xor.exe
!This program cannot be run in DOS mode.
bRich
.text
`.rdata
@.data
# [truncated for layout]
SendMessageW
CreateWindowExW
SetWindowPos
DestroyWindow
GetWindowRect
DefWindowProcW
GetMessageW
GetWindowLongW
GetDlgItemTextA
MessageBoxW
USER32.dll
# [truncated for layout]
```

<p class="mb-3">We notice imports like <code>GetDlgItemTextA</code>, <code>CreateWindowExW</code>, and <code>MessageBoxW</code>. This instantly proved that the binary was a standard Graphical User Interface (GUI) application, not a console app. Therefore, we knew the program would wait for user interaction (clicking a button) to check the license key. We also spotted a weird cluster of characters (<code>.4=#</code>, <code>)J"S</code>, etc.). In low-level programming, plain text character patterns are obvious. When characters look like broken punctuation, it usually means standard text has been modified by a mathematical offset—like an XOR operation. </code>

<p class="mb-3">Now for the second phase which is code traversal, we will be peeling the layers of the code using a tool created by the NSA called Ghidra. Upon loading and analyzing the binary in Ghidra, we navigated the Symbol Tree to locate the absolute starting address vector. </p>

<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image1.png" alt="Data Obfuscation 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Looking at the right side of the screen, the compiler-generated initialization wrapper, labeled <code>entry</code>, sets up core binary security cookies <code>(___security_init_cookie())</code> to minimize exploitation risks prior to invoking the primary application runtime wrapper.</p>

```C++
void entry(void)

{
  ___security_init_cookie();
  FUN_00403446();
  return;
}
```

<p class="mb-3">Now we need to isolate runtime initialisation by double-clicking on <code>FUN_00403446</code> which transitioned our view into the C Runtime (CRT) setup logic.</p> 
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image2.png" alt="Data Obfuscation 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
/* WARNING: Function: __SEH_prolog4 replaced with injection: SEH_prolog4 */

int FUN_00403446(void)

{
  code *pcVar1;
  bool bVar2;
  undefined4 uVar3;
  int iVar4;
  int *piVar5;
  uint uVar6;
  int unaff_ESI;
  undefined4 uVar7;
  undefined4 uVar8;
  void *local_14;
  
  uVar3 = ___scrt_initialize_crt(1);
  if ((char)uVar3 != '\0') {
    bVar2 = false;
    uVar3 = ___scrt_acquire_startup_lock();
    if (DAT_004075bc != 1) {
      if (DAT_004075bc == 0) {
        DAT_004075bc = 1;
        iVar4 = initterm_e(&DAT_004051bc,&DAT_004051c8);
        if (iVar4 != 0) {
          ExceptionList = local_14;
          return 0xff;
        }
        initterm(&DAT_004051b0,&DAT_004051b8);
        DAT_004075bc = 2;
      }
      else {
        bVar2 = true;
      }
      ___scrt_release_startup_lock((char)uVar3);
      piVar5 = (int *)FUN_00403a86();
      if ((*piVar5 != 0) &&
         (uVar3 = ___scrt_is_nonwritable_in_current_image((int)piVar5), (char)uVar3 != '\0')) {
        pcVar1 = (code *)*piVar5;
        uVar8 = 0;
        uVar7 = 2;
        uVar3 = 0;
        guard_check_icall();
        (*pcVar1)(uVar3,uVar7,uVar8);
      }
      piVar5 = (int *)FUN_00403a8c();
      if ((*piVar5 != 0) &&
         (uVar3 = ___scrt_is_nonwritable_in_current_image((int)piVar5), (char)uVar3 != '\0')) {
        register_thread_local_exe_atexit_callback(*piVar5);
      }
      ___scrt_get_show_window_mode();
      get_narrow_winmain_command_line();
      unaff_ESI = FUN_00403110((HINSTANCE)&IMAGE_DOS_HEADER_00400000);
      uVar6 = FUN_00403be3();
      if ((char)uVar6 != '\0') {
        if (!bVar2) {
          _cexit();
        }
        ___scrt_uninitialize_crt(1,'\0');
        ExceptionList = local_14;
        return unaff_ESI;
      }
      goto LAB_004035b3;
    }
  }
  FUN_00403a92();
LAB_004035b3:
                    /* WARNING: Subroutine does not return */
  exit(unaff_ESI);
}
```

<p class="mb-3">While mostly filled with environment setup wrappers, the definitive structural landmark appeared at the bottom of the routine:</p>

```C++
unaff_ESI = FUN_00403110((HINSTANCE)&IMAGE_DOS_HEADER_00400000);
```

<p class="mb-3">Passing the baseline image allocation address (<code>IMAGE_DOS_HEADER_00400000</code>) directly as an execution handle is the standard structural signature of a compiler handing execution control off to the true application main loop: <code>WinMain</code>.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image3.png" alt="Data Obfuscation 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />


<p class="mb-3">Next step is inspecting window layout & registration (<code>FUN_00403110</code>). Double-clicking into <code>FUN_00403110</code> exposed the GUI assembly architecture.</p> 
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image4.png" alt="Data Obfuscation 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void FUN_00403110(HINSTANCE param_1)

{
  HWND hWndParent;
  int iVar1;
  undefined1 local_3c [20];
  POINT local_28;
  undefined8 local_20;
  wchar_t *local_18;
  undefined8 local_14;
  uint local_c;
  
  local_c = DAT_00407004 ^ (uint)local_3c;
  local_14 = ZEXT48(param_1);
  local_3c._16_4_ = param_1;
  local_3c._0_4_ = (HWND)0x0;
  local_3c._8_4_ = 0;
  local_3c._12_4_ = 0;
  local_28.x = 0;
  local_28.y = 0;
  local_20._0_4_ = (HBRUSH)0x0;
  local_20._4_4_ = (LPCWSTR)0x0;
  local_3c._4_4_ = FUN_00402bf0;
  local_18 = L"LicenseKeyWindowClass";
  RegisterClassW((WNDCLASSW *)local_3c);
  hWndParent = CreateWindowExW(0,L"LicenseKeyWindowClass",L"License Key",0xcf0000,-0x80000000,
                               -0x80000000,0x140,100,(HWND)0x0,(HMENU)0x0,(HINSTANCE)local_14,
                               &local_14);
  local_14._4_4_ = hWndParent;
  if (hWndParent == (HWND)0x0) {
    MessageBoxW((HWND)0x0,L"Window creation failed",L"Error",0x10);
  }
  else {
    CreateWindowExW(0,L"EDIT",(LPCWSTR)0x0,0x50800080,10,10,200,0x19,hWndParent,(HMENU)0x1,
                    (HINSTANCE)local_14,(LPVOID)0x0);
    CreateWindowExW(0,L"BUTTON",L"Submit",0x50000001,0xdc,10,0x50,0x19,local_14._4_4_,(HMENU)0x2,
                    (HINSTANCE)local_14,(LPVOID)0x0);
    ShowWindow(local_14._4_4_,1);
    UpdateWindow(local_14._4_4_);
  }
  iVar1 = GetMessageW((LPMSG)local_3c,(HWND)0x0,0,0);
  while (iVar1 != 0) {
    TranslateMessage((MSG *)local_3c);
    DispatchMessageW((MSG *)local_3c);
    iVar1 = GetMessageW((LPMSG)local_3c,(HWND)0x0,0,0);
  }
  FUN_00403312(local_c ^ (uint)local_3c);
  return;
}
```

<p class="mb-3">Here, the binary calls <code>RegisterClassW</code> and uses <code>CreateWindowExW</code> to draw the interface layout, instantiate an "<b>EDIT</b>" text input field, and create a "<b>Submit</b>" button. The key pivot point found within this layout registration block was the configuration of the class callback vector:</p>

```C++
local_3c._4_4_ = FUN_00402bf0;
```

<p class="mb-3">In native Win32 engineering, this specific memory block assignment registers the Window Procedure (<code>WndProc</code>). Because Windows operates on an event-driven loop, any user interaction with the GUI window drops messages directly into this function.</p>
<p class="mb-3">Now we need to intercept Window Events (<code>FUN_00402bf0</code>) by double-clicking <code>FUN_00402bf0</code>.</p> 
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image5.png" alt="Data Obfuscation 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
LRESULT FUN_00402bf0(HWND param_1,UINT param_2,WPARAM param_3,LONG *param_4)

{
  undefined4 *dwNewLong;
  LRESULT LVar1;
  
  if (param_2 == 0x81) {
    dwNewLong = (undefined4 *)*param_4;
    SetWindowLongW(param_1,-0x15,(LONG)dwNewLong);
    dwNewLong[1] = param_1;
  }
  else {
    dwNewLong = (undefined4 *)GetWindowLongW(param_1,-0x15);
  }
  if (dwNewLong == (undefined4 *)0x0) {
    LVar1 = DefWindowProcW(param_1,param_2,param_3,(LPARAM)param_4);
    return LVar1;
  }
  if (param_2 == 2) {
    PostQuitMessage(0);
  }
  else {
    if (param_2 != 0x111) {
      LVar1 = DefWindowProcW((HWND)dwNewLong[1],param_2,param_3,(LPARAM)param_4);
      return LVar1;
    }
    if ((short)param_3 == 2) {
      FUN_00402c90(dwNewLong);
      return 0;
    }
  }
  return 0;
}
```

<p class="mb-3">We entered the event distribution engine. This routine actively monitors Windows message codes. We isolated the specific branch managing user button interaction:</p>

```C++
if (param_2 != 0x111) { ... } // 0x111 = WM_COMMAND (Button Interaction)
if ((short)param_3 == 2) {     // Menu ID 2 = The "Submit" Button ID
  FUN_00402c90(dwNewLong);
  return 0;
}
```

<p class="mb-3">This routine proved that clicking the graphical "<b>Submit</b>" button flags execution down a deterministic pipeline directly into <code>FUN_00402c90</code>. This function represents the actual software key verification terminal.</p>

<p class="mb-3">The third phase is cryptographic deconstruction for <code>FUN_00402c90</code>.</p> 
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image6.png" alt="Data Obfuscation 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void __fastcall FUN_00402c90(undefined4 *param_1)

{
  char cVar1;
  undefined4 *puVar2;
  code *pcVar3;
  void *pvVar4;
  undefined4 ***pppuVar5;
  undefined4 ****ppppuVar6;
  uint uVar7;
  uint uVar8;
  char *pcVar9;
  uint uVar10;
  uint uVar11;
  undefined4 ***local_198;
  undefined4 uStack_194;
  undefined4 uStack_190;
  undefined4 uStack_18c;
  uint local_188;
  uint local_184;
  undefined4 *local_180;
  undefined4 *local_17c;
  byte local_178 [32];
  uint local_158;
  undefined4 *local_154;
  undefined4 ***local_150;
  undefined4 local_14c;
  undefined8 local_148;
  undefined4 local_140;
  undefined4 uStack_13c;
  undefined4 uStack_138;
  undefined4 uStack_134;
  uint local_130;
  uint local_12c;
  CHAR local_128 [260];
  uint local_24;
  undefined1 *puStack_20;
  void *local_1c;
  undefined1 *puStack_18;
  undefined4 local_14;
  
  puStack_20 = &stack0xfffffffc;
  local_14 = 0xffffffff;
  puStack_18 = &LAB_00404240;
  local_1c = ExceptionList;
  local_24 = DAT_00407004 ^ (uint)&stack0xfffffff0;
  ExceptionList = &local_1c;
  local_180 = param_1;
  GetDlgItemTextA((HWND)param_1[1],1,local_128,0x100);
  local_130 = 0;
  pcVar9 = local_128;
  local_12c = 0;
  local_140 = (undefined4 *)0x0;
  uStack_13c = 0;
  uStack_138 = 0;
  uStack_134 = 0;
  do {
    cVar1 = *pcVar9;
    pcVar9 = pcVar9 + 1;
  } while (cVar1 != '\0');
  uVar10 = (int)pcVar9 - (int)(local_128 + 1);
  if (uVar10 < 0x80000000) {
    local_12c = 0xf;
    if (uVar10 < 0x10) {
      local_130 = uVar10;
      memcpy(&local_140,local_128,uVar10);
      *(undefined1 *)((int)&local_140 + uVar10) = 0;
      local_158 = local_12c;
      local_154 = local_140;
      uVar10 = local_130;
      uVar11 = local_12c;
    }
    else {
      uVar11 = uVar10 | 0xf;
      if (uVar11 < 0x80000000) {
        if (uVar11 < 0x16) {
          uVar11 = 0x16;
        }
        uVar8 = uVar11 + 1;
        local_158 = uVar11;
        if (0xfff < uVar8) {
          uVar7 = uVar11 + 0x24;
          if (uVar7 <= uVar8) goto LAB_004030f1;
          goto LAB_00402da5;
        }
        if (uVar8 == 0) {
          local_154 = (undefined4 *)0x0;
        }
        else {
          local_154 = (undefined4 *)operator_new(uVar8);
          local_158 = uVar11;
        }
      }
      else {
        local_158 = 0x7fffffff;
        uVar7 = 0x80000023;
LAB_00402da5:
        uVar11 = local_158;
        pvVar4 = operator_new(uVar7);
        if (pvVar4 == (void *)0x0) goto LAB_004030e6;
        local_154 = (undefined4 *)((int)pvVar4 + 0x23U & 0xffffffe0);
        local_154[-1] = pvVar4;
      }
      local_140 = local_154;
      local_130 = uVar10;
      local_12c = uVar11;
      memcpy(local_154,local_128,uVar10);
      *(undefined1 *)((int)local_154 + uVar10) = 0;
    }
    local_14 = 0;
    local_184 = 0;
    local_17c = &local_140;
    if (0xf < uVar11) {
      local_17c = local_154;
    }
    local_198 = (undefined4 ****)0x0;
    uStack_194 = 0;
    uStack_190 = 0;
    uStack_18c = 0;
    if (uVar10 < 0x80000000) {
      if (uVar10 < 0x10) {
        uVar11 = 0xf;
        local_188 = uVar10;
        local_184 = 0xf;
        local_198 = (undefined4 ****)*local_17c;
        uStack_194 = local_17c[1];
        uStack_190 = local_17c[2];
        uStack_18c = local_17c[3];
        local_150 = (undefined4 ****)*local_17c;
      }
      else {
        local_184 = 0xf;
        uVar11 = uVar10 | 0xf;
        if (uVar11 < 0x80000000) {
          if (uVar11 < 0x16) {
            uVar11 = 0x16;
          }
          uVar8 = uVar11 + 1;
          if (0xfff < uVar8) {
            uVar7 = uVar11 + 0x24;
            if (uVar7 <= uVar8) goto LAB_004030fb;
            goto LAB_00402ebd;
          }
          if (uVar8 == 0) {
            local_198 = (undefined4 ****)0x0;
          }
          else {
            local_198 = (undefined4 ***)operator_new(uVar8);
          }
        }
        else {
          uVar11 = 0x7fffffff;
          uVar7 = 0x80000023;
LAB_00402ebd:
          pppuVar5 = (undefined4 ***)operator_new(uVar7);
          if (pppuVar5 == (undefined4 ***)0x0) goto LAB_004030e6;
          local_198 = (undefined4 ***)((int)pppuVar5 + 0x23U & 0xffffffe0);
          ((undefined4 ****)local_198)[-1] = pppuVar5;
        }
        local_188 = uVar10;
        local_184 = uVar11;
        local_150 = local_198;
        memcpy(local_198,local_17c,uVar10 + 1);
      }
      uVar8 = 0;
      local_178[0] = 0x2e;
      local_178[1] = 0x34;
      local_178[2] = 0x3d;
      local_178[3] = 0x23;
      local_178[4] = 0x29;
      local_178[5] = 0x4a;
      local_178[6] = 0x22;
      local_178[7] = 0x53;
      local_178[8] = 0x29;
      local_178[9] = 0x54;
      local_178[10] = 0x55;
      local_178[0xb] = 0x4a;
      local_178[0xc] = 0x2b;
      local_178[0xd] = 0x5f;
      local_178[0xe] = 0x2b;
      local_178[0xf] = 0x25;
      local_178[0x10] = 0x22;
      local_178[0x11] = 0x4a;
      local_178[0x12] = 0x30;
      local_178[0x13] = 0x22;
      local_178[0x14] = 0x2a;
      local_178[0x15] = 0x2f;
      local_178[0x16] = 0x32;
      local_178[0x17] = 0x4a;
      local_178[0x18] = 0x34;
      local_178[0x19] = 0x5f;
      local_178[0x1a] = 0x29;
      local_178[0x1b] = 0x53;
      local_178[0x1c] = 0x3e;
      if (uVar10 != 0) {
        do {
          ppppuVar6 = &local_198;
          if (0xf < uVar11) {
            ppppuVar6 = (undefined4 ****)local_150;
          }
          if ((uint)local_178[uVar8] != ((int)*(char *)((int)ppppuVar6 + uVar8) ^ 0x67U)) {
            if (0xf < uVar11) {
              ppppuVar6 = (undefined4 ****)local_150;
              if ((0xfff < uVar11 + 1) &&
                 (ppppuVar6 = (undefined4 ****)local_150[-1],
                 0x1f < (uint)((int)local_150 + (-4 - (int)ppppuVar6)))) goto LAB_004030e6;
              FUN_00403350(ppppuVar6);
            }
            MessageBoxW((HWND)0x0,L"License key is invalid.",L"Error",0x10);
            goto LAB_0040303b;
          }
          uVar8 = uVar8 + 1;
        } while (uVar8 < uVar10);
      }
      if (0xf < uVar11) {
        ppppuVar6 = (undefined4 ****)local_150;
        if ((0xfff < uVar11 + 1) &&
           (ppppuVar6 = (undefined4 ****)local_150[-1],
           0x1f < (uint)((int)local_150 + (-4 - (int)ppppuVar6)))) goto LAB_004030e6;
        FUN_00403350(ppppuVar6);
      }
      MessageBoxW((HWND)0x0,L"License key verified.",L"Verified",0x40);
      puVar2 = local_180;
      SendMessageW((HWND)local_180[1],0x10,0,0);
      local_14c = *puVar2;
      local_148 = 0;
      FUN_00401170(&local_14c);
LAB_0040303b:
      if (0xf < local_158) {
        if ((0xfff < local_158 + 1) &&
           (puVar2 = (undefined4 *)local_154[-1], uVar10 = (int)local_154 + (-4 - (int)puVar2),
           local_154 = puVar2, 0x1f < uVar10)) {
LAB_004030e6:
                    /* WARNING: Subroutine does not return */
          _invalid_parameter_noinfo_noreturn();
        }
        FUN_00403350(local_154);
      }
      ExceptionList = local_1c;
      FUN_00403312(local_24 ^ (uint)&stack0xfffffff0);
      return;
    }
  }
  else {
    FUN_00401160();
LAB_004030f1:
    FUN_004010c0();
  }
  FUN_00401160();
LAB_004030fb:
  FUN_004010c0();
  pcVar3 = (code *)swi(3);
  (*pcVar3)();
  return;
}
```

<p class="mb-3">Double-clicking into <code>FUN_00402c90</code> exposed the raw validation logic, revealing two critical low-level behaviors executing back-to-back: Input extraction and ciphertext array hardcoding.</p>

<p class="mb-3">The input extraction routine utilizes <code>GetDlgItemTextA</code> to copy user text typed inside the GUI window's edit field into a local buffer. In ciphertext array hardcoding, the stack directly populates a local 29-byte array (<code>local_178</code>) with a hardcoded hexadecimal sequence matching the precise characters observed during our initial static triage:

```C++
local_178[0] = 0x2e;  // '.'
local_178[1] = 0x34;  // '4'
local_178[2] = 0x3d;  // '='
// ... [Truncated for layout]
local_178[0x1c] = 0x3e;
```

<p class="mb-3">The logic then uses a basic counter loop to evaluate the parsed user input array sequentially against the static ciphertext block using an inline logical evaluation check:</p>

```C++
if ((uint)local_178[uVar8] != ((int)*(char *)((int)ppppuVar6 + uVar8) ^ 0x67U))
```

<p class="mb-3">This condition indicates that the program applies an inline XOR (<code>^</code>) transformation against each individual user-input byte using the single-byte master hex key <code>0x67</code>, checking for a strict mathematical identity against the stored array elements. If all characters pass this check, a <code>MessageBoxW</code> displaying "<b>License key verified.</b>" is spawned.</p>

<p class="mb-3">The bitwise Exclusive-OR operation (<code>XOR</code>) is intrinsically symmetric. This foundational mathematical identity states that if:</p>
<div class">A &oplus; B = C</div>

<p class="mb-3">Then it is a mathematical certainty that:</p>
<div class>C &oplus; B = A</div>
<br />
<p class="mb-3"><strong>Algorithmic Translation:</strong></p>
<ul>
  <li><strong>Binary Routine:</strong> <span>User Input Byte</span> &oplus; <span>0x67</span> == <span>Encrypted Hex Array Byte</span></li>
  <li><strong>Reversal Approach:</strong> <span>Encrypted Hex Array Byte</span> &oplus; <span>0x67</span> == <span>Plaintext License Key Character</span></li>
</ul>

<p class="mb-3">By taking the complete raw 29-byte array string extracted from the Ghidra decompiler window, we wrote a quick Python 3 execution script to loop through the ciphertext data array, apply the bitwise symmetric key transformation (<code>0x67</code>), and assemble the flag output stream:</p>

```bash
user@linux:~$ python3 -c 'cipher = [0x2e, 0x34, 0x3d, 0x23, 0x29, 0x4a, 0x22, 0x53, 0x29, 0x54, 0x55, 0x4a, 0x2b, 0x5f, 0x2b, 0x25, 0x22, 0x4a, 0x30, 0x22, 0x2a, 0x2f, 0x32, 0x4a, 0x34, 0x5f, 0x29, 0x53, 0x3e]; print("".join(chr(b ^ 0x67) for b in cipher))'
ISZDN-E4N32-L8LBE-WEMHU-S8N4Y
```

<p class="mb-5"><strong>Answer:</strong> ISZDN-E4N32-L8LBE-WEMHU-S8N4Y</p>
<br />


<h5 class="mb-2"><strong>2. ROL</strong></h5>
<p class="mb-3">This lab contains an application written in C++ that contains important data encrypted with a custom algorithm.

To complete the laboratory, you need to find the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong>Opening the application in Ghidra and analysing it shows the following <code>entry</code> function.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image7.png" alt="Data Obfuscation 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void entry(void)

{
  ___security_init_cookie();
  FUN_00403436();
  return;
}
```

<Once class="mb-3">Every standard Windows executable starts with a small wrapper that sets up security features (like stack cookies). There is almost never any real program logic here. We saw it call <code>FUN_00403436</code> right before returning, meaning that was the next logical step. Once we double-click and enter <code>FUN_00403436</code>, we see the standard C Runtime (CRT) initialisation block.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image8.png" alt="Data Obfuscation 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
/* WARNING: Function: __SEH_prolog4 replaced with injection: SEH_prolog4 */

int FUN_00403436(void)

{
  code *pcVar1;
  bool bVar2;
  undefined4 uVar3;
  int iVar4;
  int *piVar5;
  uint uVar6;
  int unaff_ESI;
  undefined4 uVar7;
  undefined4 uVar8;
  void *local_14;
  
  uVar3 = ___scrt_initialize_crt(1);
  if ((char)uVar3 != '\0') {
    bVar2 = false;
    uVar3 = ___scrt_acquire_startup_lock();
    if (DAT_004075bc != 1) {
      if (DAT_004075bc == 0) {
        DAT_004075bc = 1;
        iVar4 = initterm_e(&DAT_004051bc,&DAT_004051c8);
        if (iVar4 != 0) {
          ExceptionList = local_14;
          return 0xff;
        }
        initterm(&DAT_004051b0,&DAT_004051b8);
        DAT_004075bc = 2;
      }
      else {
        bVar2 = true;
      }
      ___scrt_release_startup_lock((char)uVar3);
      piVar5 = (int *)FUN_00403a76();
      if ((*piVar5 != 0) &&
         (uVar3 = ___scrt_is_nonwritable_in_current_image((int)piVar5), (char)uVar3 != '\0')) {
        pcVar1 = (code *)*piVar5;
        uVar8 = 0;
        uVar7 = 2;
        uVar3 = 0;
        guard_check_icall();
        (*pcVar1)(uVar3,uVar7,uVar8);
      }
      piVar5 = (int *)FUN_00403a7c();
      if ((*piVar5 != 0) &&
         (uVar3 = ___scrt_is_nonwritable_in_current_image((int)piVar5), (char)uVar3 != '\0')) {
        register_thread_local_exe_atexit_callback(*piVar5);
      }
      ___scrt_get_show_window_mode();
      get_narrow_winmain_command_line();
      unaff_ESI = FUN_00403100((HINSTANCE)&IMAGE_DOS_HEADER_00400000);
      uVar6 = FUN_00403bd3();
      if ((char)uVar6 != '\0') {
        if (!bVar2) {
          _cexit();
        }
        ___scrt_uninitialize_crt(1,'\0');
        ExceptionList = local_14;
        return unaff_ESI;
      }
      goto LAB_004035a3;
    }
  }
  FUN_00403a82();
LAB_004035a3:
                    /* WARNING: Subroutine does not return */
  exit(unaff_ESI);
}
```

<p class="mb-3">We know to ignore almost all of it because of function names like <code>___scrt_initialize_crt</code>. Near the bottom we saw: </p> 

```C++
unaff_ESI = FUN_00403100((HINSTANCE)&IMAGE_DOS_HEADER_00400000);
```

<p class="mb-3">Passing <code>IMAGE_DOS_HEADER_00400000</code> (the memory address where the application starts) as an <code>HINSTANCE</code> is the classic Windows signature for launching <code>WinMain</code> (the main GUI thread). That instantly told us <code>FUN_00403100</code> was our actual program entry point, so we double-click on it.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image9.png" alt="Data Obfuscation 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void FUN_00403100(HINSTANCE param_1)

{
  HWND hWndParent;
  int iVar1;
  undefined1 local_3c [20];
  POINT local_28;
  undefined8 local_20;
  wchar_t *local_18;
  undefined8 local_14;
  uint local_c;
  
  local_c = DAT_00407004 ^ (uint)local_3c;
  local_14 = ZEXT48(param_1);
  local_3c._16_4_ = param_1;
  local_3c._0_4_ = (HWND)0x0;
  local_3c._8_4_ = 0;
  local_3c._12_4_ = 0;
  local_28.x = 0;
  local_28.y = 0;
  local_20._0_4_ = (HBRUSH)0x0;
  local_20._4_4_ = (LPCWSTR)0x0;
  local_3c._4_4_ = FUN_00402bf0;
  local_18 = L"LicenseKeyWindowClass";
  RegisterClassW((WNDCLASSW *)local_3c);
  hWndParent = CreateWindowExW(0,L"LicenseKeyWindowClass",L"License Key",0xcf0000,-0x80000000,
                               -0x80000000,0x140,100,(HWND)0x0,(HMENU)0x0,(HINSTANCE)local_14,
                               &local_14);
  local_14._4_4_ = hWndParent;
  if (hWndParent == (HWND)0x0) {
    MessageBoxW((HWND)0x0,L"Window creation failed",L"Error",0x10);
  }
  else {
    CreateWindowExW(0,L"EDIT",(LPCWSTR)0x0,0x50800080,10,10,200,0x19,hWndParent,(HMENU)0x1,
                    (HINSTANCE)local_14,(LPVOID)0x0);
    CreateWindowExW(0,L"BUTTON",L"Submit",0x50000001,0xdc,10,0x50,0x19,local_14._4_4_,(HMENU)0x2,
                    (HINSTANCE)local_14,(LPVOID)0x0);
    ShowWindow(local_14._4_4_,1);
    UpdateWindow(local_14._4_4_);
  }
  iVar1 = GetMessageW((LPMSG)local_3c,(HWND)0x0,0,0);
  while (iVar1 != 0) {
    TranslateMessage((MSG *)local_3c);
    DispatchMessageW((MSG *)local_3c);
    iVar1 = GetMessageW((LPMSG)local_3c,(HWND)0x0,0,0);
  }
  FUN_00403302(local_c ^ (uint)local_3c);
  return;
}
```

<p class="mb-3">Inside this GUI setup, we saw standard Win32 API calls (<code>RegisterClassW</code>, <code>CreateWindowExW</code>). We looked at the structure passed to <code>RegisterClassW</code> and found <code>FUN_00402bf0</code> assigned to the windows's message handler slot (<code>lpfnWndProc</code>). This is where Windows sends all clicks, typing, and window events. We double-click on <code>FUN_00402bf0</code>.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image10.png" alt="Data Obfuscation 10" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
LRESULT FUN_00402bf0(HWND param_1,UINT param_2,WPARAM param_3,LONG *param_4)

{
  undefined4 *dwNewLong;
  LRESULT LVar1;
  
  if (param_2 == 0x81) {
    dwNewLong = (undefined4 *)*param_4;
    SetWindowLongW(param_1,-0x15,(LONG)dwNewLong);
    dwNewLong[1] = param_1;
  }
  else {
    dwNewLong = (undefined4 *)GetWindowLongW(param_1,-0x15);
  }
  if (dwNewLong == (undefined4 *)0x0) {
    LVar1 = DefWindowProcW(param_1,param_2,param_3,(LPARAM)param_4);
    return LVar1;
  }
  if (param_2 == 2) {
    PostQuitMessage(0);
  }
  else {
    if (param_2 != 0x111) {
      LVar1 = DefWindowProcW((HWND)dwNewLong[1],param_2,param_3,(LPARAM)param_4);
      return LVar1;
    }
    if ((short)param_3 == 2) {
      FUN_00402d90(dwNewLong);
      return 0;
    }
  }
  return 0;
}
```

<p class="mb-3">Inside this event handler, we looked for a check for <code>0x111</code> (<code>WM_COMMAND</code>, meaning a button click) and an ID check for <code>2</code> (the Submit button). It led directly to <code>FUN_00402d90</code>.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image11.png" alt="Data Obfuscation 11" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void __fastcall FUN_00402d90(undefined4 *param_1)

{
  code *pcVar1;
  char cVar2;
  uint uVar3;
  void *pvVar4;
  undefined4 *puVar5;
  uint uVar6;
  undefined4 *_Dst;
  char *pcVar7;
  uint _Size;
  uint uVar8;
  undefined4 *local_150;
  undefined4 local_14c;
  undefined8 local_148;
  undefined4 local_140;
  undefined4 uStack_13c;
  undefined4 uStack_138;
  undefined4 uStack_134;
  uint local_130;
  uint local_12c;
  CHAR local_128 [260];
  uint local_24;
  undefined1 *puStack_20;
  void *local_1c;
  undefined1 *puStack_18;
  undefined4 local_14;
  
  puStack_20 = &stack0xfffffffc;
  local_14 = 0xffffffff;
  puStack_18 = &LAB_00404230;
  local_1c = ExceptionList;
  local_24 = DAT_00407004 ^ (uint)&stack0xfffffff0;
  ExceptionList = &local_1c;
  GetDlgItemTextA((HWND)param_1[1],1,local_128,0x100);
  local_130 = 0;
  pcVar7 = local_128;
  local_12c = 0;
  local_140 = (undefined4 *)0x0;
  uStack_13c = 0;
  uStack_138 = 0;
  uStack_134 = 0;
  do {
    cVar2 = *pcVar7;
    pcVar7 = pcVar7 + 1;
  } while (cVar2 != '\0');
  _Size = (int)pcVar7 - (int)(local_128 + 1);
  if (_Size < 0x80000000) {
    local_12c = 0xf;
    if (_Size < 0x10) {
      local_130 = _Size;
      memcpy(&local_140,local_128,_Size);
      *(undefined1 *)((int)&local_140 + _Size) = 0;
      local_150 = local_140;
      _Size = local_130;
      uVar8 = local_12c;
    }
    else {
      uVar8 = _Size | 0xf;
      if (uVar8 < 0x80000000) {
        if (uVar8 < 0x16) {
          uVar8 = 0x16;
        }
        uVar3 = uVar8 + 1;
        if (0xfff < uVar3) {
          uVar6 = uVar8 + 0x24;
          if (uVar6 <= uVar3) goto LAB_004030e9;
          goto LAB_00402e99;
        }
        if (uVar3 == 0) {
          local_150 = (undefined4 *)0x0;
        }
        else {
          local_150 = (undefined4 *)operator_new(uVar3);
        }
      }
      else {
        uVar8 = 0x7fffffff;
        uVar6 = 0x80000023;
LAB_00402e99:
        pvVar4 = operator_new(uVar6);
        if (pvVar4 == (void *)0x0) goto LAB_004030de;
        local_150 = (undefined4 *)((int)pvVar4 + 0x23U & 0xffffffe0);
        local_150[-1] = pvVar4;
      }
      local_140 = local_150;
      local_130 = _Size;
      local_12c = uVar8;
      memcpy(local_150,local_128,_Size);
      *(undefined1 *)((int)local_150 + _Size) = 0;
    }
    local_14 = 0;
    puVar5 = &local_140;
    if (0xf < uVar8) {
      puVar5 = local_150;
    }
    if (_Size < 0x80000000) {
      if (_Size < 0x10) {
        _Dst = (undefined4 *)*puVar5;
      }
      else {
        uVar3 = _Size | 0xf;
        if (uVar3 < 0x80000000) {
          if (uVar3 < 0x16) {
            uVar3 = 0x16;
          }
          uVar6 = uVar3 + 1;
          if (0xfff < uVar6) {
            uVar3 = uVar3 + 0x24;
            if (uVar3 <= uVar6) goto LAB_004030f3;
            goto LAB_00402f93;
          }
          if (uVar6 == 0) {
            _Dst = (undefined4 *)0x0;
          }
          else {
            _Dst = (undefined4 *)operator_new(uVar6);
          }
        }
        else {
          uVar3 = 0x80000023;
LAB_00402f93:
          pvVar4 = operator_new(uVar3);
          if (pvVar4 == (void *)0x0) goto LAB_004030de;
          _Dst = (undefined4 *)((int)pvVar4 + 0x23U & 0xffffffe0);
          _Dst[-1] = pvVar4;
        }
        memcpy(_Dst,puVar5,_Size + 1);
      }
      cVar2 = FUN_00402c90(_Dst);
      if (cVar2 == '\0') {
        MessageBoxW((HWND)0x0,L"License key is invalid.",L"Error",0x10);
      }
      else {
        MessageBoxW((HWND)0x0,L"License key verified.",L"Verified",0x40);
        SendMessageW((HWND)param_1[1],0x10,0,0);
        local_14c = *param_1;
        local_148 = 0;
        FUN_00401170(&local_14c);
      }
      if (0xf < uVar8) {
        puVar5 = local_150;
        if ((0xfff < uVar8 + 1) &&
           (puVar5 = (undefined4 *)local_150[-1], 0x1f < (uint)((int)local_150 + (-4 - (int)puVar5 ))
           )) {
LAB_004030de:
                    /* WARNING: Subroutine does not return */
          _invalid_parameter_noinfo_noreturn();
        }
        FUN_00403340(puVar5);
      }
      ExceptionList = local_1c;
      FUN_00403302(local_24 ^ (uint)&stack0xfffffff0);
      return;
    }
  }
  else {
    FUN_00401160();
LAB_004030e9:
    FUN_004010c0();
  }
  FUN_00401160();
LAB_004030f3:
  FUN_004010c0();
  pcVar1 = (code *)swi(3);
  (*pcVar1)();
  return;
}
```

<p class="mb-3">Finally, we stripped away the messy C++ string allocation boilerplate and looked for the 'gatekeeper' function that took our input text and returned a true/false condition to trigger the success or failure message boxed. That gatekeeper was <code>FUN_00402c90</code>.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/dataobfuscation/dataobfuscation_hackviser_image12.png" alt="Data Obfuscation 12" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
undefined1 FUN_00402c90(undefined4 *param_1)

{
  int iVar1;
  ushort uVar2;
  undefined4 **ppuVar3;
  undefined4 *puVar4;
  undefined1 uVar5;
  int in_stack_00000014;
  uint in_stack_00000018;
  ushort local_40 [30];
  
  if (in_stack_00000014 == 0x1d) {
    local_40[0] = 0x298;
    local_40[1] = 0x148;
    local_40[0x1c] = 0x2a8;
    local_40[2] = 0x108;
    local_40[3] = 0x2a0;
    iVar1 = 0;
    local_40[4] = 0x130;
    local_40[5] = 0x1e0;
    local_40[6] = 0x100;
    local_40[7] = 0x280;
    local_40[8] = 0x2c0;
    local_40[9] = 0x138;
    local_40[10] = 0x120;
    local_40[0xb] = 0x1e0;
    local_40[0xc] = 0x248;
    local_40[0xd] = 0x2f8;
    local_40[0xe] = 0x138;
    local_40[0xf] = 0x2e8;
    local_40[0x10] = 0x220;
    local_40[0x11] = 0x1e0;
    local_40[0x12] = 0x128;
    local_40[0x13] = 0x218;
    local_40[0x14] = 0x110;
    local_40[0x15] = 0x228;
    local_40[0x16] = 0x230;
    local_40[0x17] = 0x1e0;
    local_40[0x18] = 0x2a0;
    local_40[0x19] = 0x138;
    local_40[0x1a] = 0x128;
    local_40[0x1b] = 0x108;
    do {
      ppuVar3 = &param_1;
      if (0xf < in_stack_00000018) {
        ppuVar3 = (undefined4 **)param_1;
      }
      uVar2 = (ushort)(char)(*(byte *)((int)ppuVar3 + iVar1) ^ 0x11);
      if ((ushort)(uVar2 << 3 | uVar2 >> 0xd) != local_40[iVar1]) goto LAB_00402d48;
      iVar1 = iVar1 + 1;
    } while (iVar1 < 0x1d);
    uVar5 = 1;
  }
  else {
LAB_00402d48:
    uVar5 = 0;
  }
  if (0xf < in_stack_00000018) {
    puVar4 = param_1;
    if (0xfff < in_stack_00000018 + 1) {
      puVar4 = (undefined4 *)param_1[-1];
      if (0x1f < (uint)((int)param_1 + (-4 - (int)puVar4))) {
                    /* WARNING: Subroutine does not return */
        _invalid_parameter_noinfo_noreturn();
      }
    }
    FUN_00403340(puVar4);
  }
  return uVar5;
}
```

<p class="mb-3">Right at the start, there is a length check <code>if (in_stack_00000014 == 0x1d)</code>. <code>0x1d</code> in hexadecimal is 29 in decimal. This tells us the license key must be exactly 29 characters long. Inside the <code>if</code> block, Ghidra shows an array of 29 16-bit shorts (<code>local_40</code>) being initialized. Let's arrange them in order from index <code>0</code> to <code>28</code>:</p>

```
0:  0x298    6:  0x100    12: 0x248    18: 0x128    24: 0x2a0
1:  0x148    7:  0x280    13: 0x2f8    19: 0x218    25: 0x138
2:  0x108    8:  0x2c0    14: 0x138    20: 0x110    26: 0x128
3:  0x2a0    9:  0x138    15: 0x2e8    21: 0x228    27: 0x108
4:  0x130    10: 0x120    16: 0x220    22: 0x230    28: 0x2a8
5:  0x1e0    11: 0x1e0    17: 0x1e0    23: 0x1e0
```

<p class="mb-3">Inside the loop, each character of our input string goes through two operations: </p>

```C++
uVar2 = (ushort)(char)(*(byte *)((int)ppuVar3 + iVar1) ^ 0x11);
if ((ushort)(uVar2 << 3 | uVar2 >> 0xd) != local_40[iVar1]) goto LAB_00402d48;
```

<p class="mb-3"><code>XOR 0x11</code>: Our input character is XORed with <code>0x11</code>. <code>ROL 3</code>: The result is cast to a 16-bit short (<code>ushort</code>) and rotated left by 3 bits. Note that <code>uVar2 &lt;&lt; 3 | uVar2 &gt;&gt; 0xd</code> is a classic bitwise implementation of a 16-bit Rotate Left (ROL) operation, because 3 + 13 (0xd) = 16 bits. Then, the final transformed value is compared against the corresponding hardcoded value in <code>local_40</code>. To find the original license key, we just have to perform the operations backward for every value in the array: Take the hardcoded 16-bit short value, Rotate Right (ROR) by 3 bits (the inverse of ROL 3), and XOR with 0x11 (XOR is its own inverse). We use the following Python script to do the mathematical operations:</p>

```Python
# The 29 hardcoded values from local_40 in correct index order
encrypted_data = [
    0x298, 0x148, 0x108, 0x2a0, 0x130, 0x1e0, 0x100, 0x280, 0x2c0, 0x138,
    0x120, 0x1e0, 0x248, 0x2f8, 0x138, 0x2e8, 0x220, 0x1e0, 0x128, 0x218,
    0x110, 0x228, 0x230, 0x1e0, 0x2a0, 0x138, 0x128, 0x108, 0x2a8
]

license_key = ""

for val in encrypted_data:
    # 16-bit Rotate Right (ROR) by 3 bits
    ror_3 = ((val >> 3) | (val << 13)) & 0xFFFF
    
    # XOR with 0x11 and convert back to an ASCII character
    char = chr((ror_3 & 0xFF) ^ 0x11)
    license_key += char

print(f"License Key: {license_key}")
```

```bash
user@linux:~$ python3 rol.py
License Key: B80E7-1AI65-XN6LU-4R3TW-E640D
```

<p class="mb-5"><strong>Answer:</strong> B80E7-1AI65-XN6LU-4R3TW-E640D</p>
<br />


<h5 class="mb-2"><strong>3. RC4</strong></h5>
<p class="mb-3">This lab contains an application written in C++ that contains important data encrypted with a RC4 algorithm.

To complete the laboratory, you need to find the license key.

What is the license key?

Answer Format: *****-*****-*****-*****-*****</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>4. Brute Force</strong></h5>
<p class="mb-3">This lab contains an application written in C++ that contains important data encrypted with a custom algorithm and requires the use of brute force techniques.

To complete the laboratory, you need to find the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>5. Powershell Obfuscation</strong></h5>
<p class="mb-3">This lab includes the analysis of an obfuscated powershell application.

To complete the lab, you need to de-obfuscate the application and access information about the author.

What is the author’s nickname?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
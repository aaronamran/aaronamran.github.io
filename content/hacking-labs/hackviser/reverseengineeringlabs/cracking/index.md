---
title: 'Cracking'
date: '2026-06-14'
excerpt: 'Practice Cracking in multiple lab exercises.'
prog: 'Hackviser Reverse Engineering Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Cracking</h1>
<div class="writeup-date">June 2026 · Reverse Engineering Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Cracking in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Flag Change</strong></h5>
<p class="mb-3">This lab includes an application developed in C++ that allows you to access important data by altering the application's workflow.

To complete the lab, you need to patch the application to change its workflow.

What is the SHA-1 hash value of the license key?</p>
<p class="mb-3"><strong>Steps: </strong> We open and analyse the application in Ghidra. The image below shows the PE entry point and the C/C++ runtime initialisation. We double click on <code>FUN_004057fa</code>.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image1.png" alt="Cracking 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void entry(void)

{
  ___security_init_cookie();
  FUN_004057fa();
  return;
}
```

<p class="mb-3">We are brought next to the code below:</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image2.png" alt="Cracking 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
/* WARNING: Function: __SEH_prolog4 replaced with injection: SEH_prolog4 */

int FUN_004057fa(void)

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
    if (DAT_0040a7ac != 1) {
      if (DAT_0040a7ac == 0) {
        DAT_0040a7ac = 1;
        iVar4 = initterm_e(&DAT_00407218,&DAT_00407224);
        if (iVar4 != 0) {
          ExceptionList = local_14;
          return 0xff;
        }
        initterm(&DAT_0040720c,&DAT_00407214);
        DAT_0040a7ac = 2;
      }
      else {
        bVar2 = true;
      }
      ___scrt_release_startup_lock((char)uVar3);
      piVar5 = (int *)FUN_00405e3a();
      if ((*piVar5 != 0) &&
         (uVar3 = ___scrt_is_nonwritable_in_current_image((int)piVar5), (char)uVar3 != '\0')) {
        pcVar1 = (code *)*piVar5;
        uVar8 = 0;
        uVar7 = 2;
        uVar3 = 0;
        guard_check_icall();
        (*pcVar1)(uVar3,uVar7,uVar8);
      }
      piVar5 = (int *)FUN_00405e40();
      if ((*piVar5 != 0) &&
         (uVar3 = ___scrt_is_nonwritable_in_current_image((int)piVar5), (char)uVar3 != '\0')) {
        register_thread_local_exe_atexit_callback(*piVar5);
      }
      ___scrt_get_show_window_mode();
      get_narrow_winmain_command_line();
      unaff_ESI = FUN_004048f0((HINSTANCE)&IMAGE_DOS_HEADER_00400000);
      uVar6 = FUN_00405f97();
      if ((char)uVar6 != '\0') {
        if (!bVar2) {
          _cexit();
        }
        ___scrt_uninitialize_crt(1,'\0');
        ExceptionList = local_14;
        return unaff_ESI;
      }
      goto LAB_00405967;
    }
  }
  FUN_00405e46();
LAB_00405967:
                    /* WARNING: Subroutine does not return */
  exit(unaff_ESI);
}
```

<p class="mb-3">We can see the actual entry point to the application's code:</p>

```C++
unaff_ESI = FUN_004048f0((HINSTANCE)&IMAGE_DOS_HEADER_00400000);
```

<p class="mb-3">This <code>FUN_004048f0</code> function is passing the base address of the executable, which is exactly how a standard Windows application calls its user-defined <code>WinMain</code> or <code>wWinMain</code> function.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image3.png" alt="Cracking 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void FUN_004048f0(HINSTANCE param_1)

{
  HWND hWndParent;
  int iVar1;
  undefined1 local_3c [20];
  POINT local_28;
  undefined8 local_20;
  wchar_t *local_18;
  undefined8 local_14;
  uint local_c;
  
  local_c = DAT_0040a004 ^ (uint)local_3c;
  local_14 = ZEXT48(param_1);
  local_3c._16_4_ = param_1;
  local_3c._0_4_ = (HWND)0x0;
  local_3c._8_4_ = 0;
  local_3c._12_4_ = 0;
  local_28.x = 0;
  local_28.y = 0;
  local_20._0_4_ = (HBRUSH)0x0;
  local_20._4_4_ = (LPCWSTR)0x0;
  local_3c._4_4_ = FUN_00404280;
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
  FUN_004056c6(local_c ^ (uint)local_3c);
  return;
}
```

<p class="mb-3">The function sets up the GUI for the application. It registers a window class called <code>LicenseKeyWindowClass</code>, spawns a window titled <b>"License Key"</b> and populates it with two elements, which are the <b>EDIT</b> control and a <b>BUTTON</b> control. When we click on the "Submit" button, Windows sends a message to the window's custom callback function, known as the Window Procedure (<code>WndProc</code>). Since the application is passing <code>FUN_00404280</code> as the window procedure, we need to double-clik on it.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image4.png" alt="Cracking 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
LRESULT FUN_00404280(HWND param_1,UINT param_2,WPARAM param_3,LONG *param_4)

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
      FUN_004044d0(dwNewLong);
      return 0;
    }
  }
  return 0;
}
```

<p class="mb-3">The <code>if-else</code> conditionals transfers control directly to <code>FUN_004044d0</code> to extract data from the edit box and validate it.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image5.png" alt="Cracking 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void __fastcall FUN_004044d0(undefined4 *param_1)

{
  byte bVar1;
  code *pcVar2;
  undefined4 *puVar3;
  undefined4 uVar4;
  void *pvVar5;
  byte *pbVar6;
  byte *pbVar7;
  uint uVar8;
  void *pvVar9;
  bool bVar10;
  undefined4 *local_324;
  undefined *local_320 [4];
  undefined **local_310 [2];
  basic_istream<> local_308 [4];
  undefined4 *local_304;
  undefined4 *local_2f4;
  uint *local_2e4;
  int local_2d8;
  undefined4 local_2d4;
  basic_ios<> local_2c0 [72];
  undefined4 local_278;
  undefined4 local_274;
  undefined4 uStack_270;
  undefined4 uStack_26c;
  undefined4 uStack_268;
  void *local_264;
  undefined4 uStack_260;
  undefined4 uStack_25c;
  undefined4 uStack_258;
  undefined4 local_254;
  uint local_250;
  undefined8 local_248;
  void *local_240 [3];
  undefined4 local_234;
  undefined8 local_230;
  WCHAR local_228 [258];
  uint local_24;
  undefined1 *puStack_20;
  void *local_1c;
  undefined1 *puStack_18;
  undefined4 local_14;
  
  puStack_20 = &stack0xfffffffc;
  local_14 = 0xffffffff;
  puStack_18 = &LAB_004066dc;
  local_1c = ExceptionList;
  local_24 = DAT_0040a004 ^ (uint)&stack0xfffffff0;
  ExceptionList = &local_1c;
  GetDlgItemTextW((HWND)param_1[1],1,local_228,0x100);
  local_254 = 0;
  uStack_260 = 0;
  uStack_25c = 0;
  uStack_258 = 0;
  local_250 = 0xf;
  local_264 = (void *)0x0;
  local_14 = 0;
  local_278 = 0x67452301;
  local_274 = 0xefcdab89;
  uStack_270 = 0x98badcfe;
  uStack_26c = 0x10325476;
  uStack_268 = 0xc3d2e1f0;
  FUN_00405240(&local_264,&PTR_004073d0,0);
  local_248 = 0;
  local_14 = 1;
  puVar3 = (undefined4 *)FUN_00404320(local_240,local_228);
  local_14._0_1_ = 2;
  memset(local_320,0,0xa8);
  local_320[0] = &DAT_0040756c;
  std::basic_ios<>::basic_ios<>(local_2c0);
  local_14 = CONCAT31(local_14._1_3_,3);
  std::basic_istream<>::basic_istream<>
            ((basic_istream<> *)local_320,(basic_streambuf<> *)local_310,false);
  local_14 = 4;
  *(undefined ***)((int)local_320 + *(int *)(local_320[0] + 4)) =
       std::basic_istringstream<>::vftable;
  *(int *)((int)local_320 + *(int *)(local_320[0] + 4) + -4) = *(int *)(local_320[0] + 4) + -0x60;
  std::basic_streambuf<>::basic_streambuf<>((basic_streambuf<> *)local_310);
  local_14 = CONCAT31(local_14._1_3_,5);
  local_310[0] = std::basic_stringbuf<>::vftable;
  local_324 = puVar3;
  if (0xf < (uint)puVar3[5]) {
    local_324 = (undefined4 *)*puVar3;
  }
  uVar8 = puVar3[4];
  uVar4 = 2;
  if (0x7fffffff < uVar8) {
    std::_Xbad_alloc();
  }
  if (uVar8 == 0) {
    local_2d8 = 0;
  }
  else {
    if (uVar8 < 0x1000) {
      pvVar9 = operator_new(uVar8);
    }
    else {
      if (uVar8 + 0x23 <= uVar8) {
        FUN_004010c0();
        pcVar2 = (code *)swi(3);
        (*pcVar2)();
        return;
      }
      pvVar5 = operator_new(uVar8 + 0x23);
      if (pvVar5 == (void *)0x0) goto LAB_004047a2;
      pvVar9 = (void *)((int)pvVar5 + 0x23U & 0xffffffe0);
      *(void **)((int)pvVar9 - 4) = pvVar5;
    }
    memcpy(pvVar9,local_324,uVar8);
    local_2d8 = (int)pvVar9 + uVar8;
    *local_304 = pvVar9;
    *local_2f4 = pvVar9;
    *local_2e4 = uVar8;
    uVar4 = 3;
  }
  local_14._0_1_ = 6;
  local_2d4 = uVar4;
  FUN_00403ce0(&local_278,(basic_istream<> *)local_320);
  *(undefined ***)((int)local_320 + *(int *)(local_320[0] + 4)) =
       std::basic_istringstream<>::vftable;
  *(int *)((int)local_320 + *(int *)(local_320[0] + 4) + -4) = *(int *)(local_320[0] + 4) + -0x60;
  FUN_00405050((basic_streambuf<> *)local_310);
  std::basic_istream<>::~basic_istream<>(local_308);
  std::basic_ios<>::~basic_ios<>(local_2c0);
  local_14 = CONCAT31(local_14._1_3_,1);
  if (0xf < local_230._4_4_) {
    pvVar9 = local_240[0];
    if (0xfff < local_230._4_4_ + 1) {
      pvVar9 = *(void **)((int)local_240[0] + -4);
      if (0x1f < (uint)((int)local_240[0] + (-4 - (int)pvVar9))) {
LAB_004047a2:
                    /* WARNING: Subroutine does not return */
        _invalid_parameter_noinfo_noreturn();
      }
    }
    FUN_00405704(pvVar9);
  }
  pbVar6 = (byte *)FUN_00403de0(&local_278,local_240);
  if (0xf < *(uint *)(pbVar6 + 0x14)) {
    pbVar6 = *(byte **)pbVar6;
  }
  pbVar7 = &DAT_00407480;
  do {
    bVar1 = *pbVar6;
    bVar10 = bVar1 < *pbVar7;
    if (bVar1 != *pbVar7) {
LAB_004047f1:
      uVar8 = -(uint)bVar10 | 1;
      goto LAB_004047f6;
    }
    if (bVar1 == 0) break;
    bVar1 = pbVar6[1];
    bVar10 = bVar1 < pbVar7[1];
    if (bVar1 != pbVar7[1]) goto LAB_004047f1;
    pbVar6 = pbVar6 + 2;
    pbVar7 = pbVar7 + 2;
  } while (bVar1 != 0);
  uVar8 = 0;
LAB_004047f6:
  if (0xf < local_230._4_4_) {
    pvVar9 = local_240[0];
    if (0xfff < local_230._4_4_ + 1) {
      pvVar9 = *(void **)((int)local_240[0] + -4);
      if (0x1f < (uint)((int)local_240[0] + (-4 - (int)pvVar9))) {
                    /* WARNING: Subroutine does not return */
        _invalid_parameter_noinfo_noreturn();
      }
    }
    FUN_00405704(pvVar9);
  }
  if (uVar8 == 0) {
    MessageBoxW((HWND)0x0,L"License key verified.",L"Verified",0x40);
    SendMessageW((HWND)param_1[1],0x10,0,0);
    local_234 = *param_1;
    local_230 = 0;
    FUN_00401170(&local_234);
  }
  else {
    MessageBoxW((HWND)0x0,L"License key is invalid.",L"Error",0x10);
  }
  if (0xf < local_250) {
    pvVar9 = local_264;
    if (0xfff < local_250 + 1) {
      pvVar9 = *(void **)((int)local_264 + -4);
      if (0x1f < (uint)((int)local_264 + (-4 - (int)pvVar9))) {
                    /* WARNING: Subroutine does not return */
        _invalid_parameter_noinfo_noreturn();
      }
    }
    FUN_00405704(pvVar9);
  }
  ExceptionList = local_1c;
  FUN_004056c6(local_24 ^ (uint)&stack0xfffffff0);
  return;
}
```

<p class="mb-3">We can see the following variables initialised right after we type our key:</p>

```C++
local_278  = 0x67452301;
local_274  = 0xefcdab89;
uStack_270 = 0x98badcfe;
uStack_26c = 0x10325476;
uStack_268 = 0xc3d2e1f0;
```

<p class="mb-3">Those exact values are the world-famous initialization constants for the SHA-1 hashing algorithm (H<sub>0</sub> through H<sub>4</sub>). This proves the application takes our input license key, hashes it using SHA-1, and converts it into a string format. The code then performs a character-by-character string comparison loop. If our calculated hash matches the string stored at <code>DAT_00407480</code>, <code>uVar8</code> becomes <code>0</code>, and we get the "License key verified." message. Because the program compares the calculated hash directly against the hardcoded string at that memory address, the value sitting at <code>DAT_00407480</code> is the exact SHA-1 hash value of the valid license key.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image6.png" alt="Cracking 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />


```asm
                             DAT_00407480                                    XREF[2]:     FUN_004044d0:004047cc (*) , 
                                                                                          FUN_004044d0:004047d3 (R)   
        00407480 33              undefine   33h
                             DAT_00407481                                    XREF[1]:     FUN_004044d0:004047de (R)   
        00407481 62              undefine   62h
                             s_acb1d35311190af34622e08848908490_00407482     XREF[1]:     FUN_004044d0:004047d3 (R)   
        00407482 61  63  62       ds         "acb1d35311190af34622e088489084907eab46"
                 31  64  33 
                 35  33  31 
```

<p class="mb-3">Ghidra did not group the memory bytes together into a single string label at <code>00407480</code> because it only auto-detected the string starting at two bytes later at <code>00407482</code>. However, looking at the layout, they are all part of the exact same continuous block of ASCII hexadecimal characters. <code>00407480</code> : <code>33h</code> is the ASCII character for <code>3</code>, <code>00407481</code> : <code>62h</code> is the ASCII character for <code>b</code> and <code>00407482</code> : is the rest of the string auto-labeled by Ghidra. Concatenating the characters from all three addresses sequentially gives us the SHA-1 hash answer.</p>
<p class="mb-5"><strong>Answer:</strong> 3bacb1d35311190af34622e088489084907eab46</p>
<br />


<h5 class="mb-2"><strong>2. Character Control</strong></h5>
<p class="mb-3">This lab contains an application developed in C++ that features an array structure holding important data, where the data within the array are checked individually by their index numbers.

To complete the lab, you need to find the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>3. Serialization and Deserialization</strong></h5>
<p class="mb-3">This lab includes an application developed in Java that involves class structures holding user or application information, where serialization and deserialization processes are performed uncontrollably.

To complete the lab, you need to register and send a message.

What is the name and surname of the user who responded to your messages?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>4. Time Based Demo Control</strong></h5>
<p class="mb-3">This lab contains an executable application written in go that checks for a demo license based on system time.

To complete the lab, you need to find the code snippet that checks the demo period within the application using reverse engineering techniques.

What is the date (year-month-day) when the demo period of the app ends?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>5. Registry Key</strong></h5>
<p class="mb-3">This lab involves an application developed in C++ that demonstrates the insecure use of registry keys within the Windows operating system.

To complete the lab, you need to identify the user with VIP privileges.

What is the ID value of the VIP user?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>6. Server Licence Control</strong></h5>
<p class="mb-3">This lab includes an application developed in C++ that controls the license process of applications based on server access.

To complete the lab you need to manipulate the license control process.

What is the title of the application window that opens after bypassing the license check?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>7. Decompile PyC</strong></h5>
<p class="mb-3">This lab includes an application developed in python that requires the application of decompile techniques.

You will need to find the admin password to complete the lab.

What is the admin password?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>8. Fake Instruction</strong></h5>
<p class="mb-3">This lab includes examining function addresses and analyzing their calls in a Windows environment.

To complete the lab, you need to find the license key.

What is the license key?</p>
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
---
title: 'Cracking'
date: '2026-06-14'
excerpt: 'Practice Cracking in multiple lab exercises.'
prog: 'Hackviser Reverse Engineering Labs  -  June 2026'
---

<div class="writeup-header">
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
<p class="mb-3"><strong>Steps: </strong>We open the application in Ghidra. Then we go to <code>Window &gt; Defined Strings</code> and search for relevant keywords related to 'License'.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image7.png" alt="Cracking 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

<p class="mb-3">Double clicking on the <code>XREF</code> in the Listing window takes us to the validation logic in <code>FUN_00402bf0</code>.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image8.png" alt="Cracking 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void FUN_00402bf0(HWND param_1,UINT param_2,WPARAM param_3,LONG *param_4)

{
  char cVar1;
  undefined4 *dwNewLong;
  char *in_stack_fffffdb8;
  undefined1 auStack_224 [4];
  LONG *local_220;
  undefined4 uStack_21c;
  undefined8 uStack_218;
  WCHAR aWStack_210 [258];
  uint local_c;
  
  local_c = DAT_00407004 ^ (uint)auStack_224;
  local_220 = param_4;
  if (param_2 == 0x81) {
    dwNewLong = (undefined4 *)*param_4;
    SetWindowLongW(param_1,-0x15,(LONG)dwNewLong);
    dwNewLong[1] = param_1;
  }
  else {
    dwNewLong = (undefined4 *)GetWindowLongW(param_1,-0x15);
  }
  if (dwNewLong == (undefined4 *)0x0) {
LAB_00402d4e:
    DefWindowProcW(param_1,param_2,param_3,(LPARAM)local_220);
    FUN_0040330b(local_c ^ (uint)auStack_224);
    return;
  }
  if (param_2 == 2) {
    PostQuitMessage(0);
  }
  else {
    if (param_2 != 0x111) {
      param_1 = (HWND)dwNewLong[1];
      goto LAB_00402d4e;
    }
    if ((short)param_3 == 2) {
      GetDlgItemTextW((HWND)dwNewLong[1],1,aWStack_210,0x100);
      FUN_00402d70((undefined4 *)&stack0xfffffdb8,aWStack_210);
      cVar1 = FUN_00402f00(in_stack_fffffdb8);
      if (cVar1 == '\0') {
        MessageBoxW((HWND)0x0,L"License key is invalid.",L"Error",0x10);
        FUN_0040330b(local_c ^ (uint)auStack_224);
        return;
      }
      MessageBoxW((HWND)0x0,L"License key verified.",L"Verified",0x40);
      SendMessageW((HWND)dwNewLong[1],0x10,0,0);
      uStack_21c = *dwNewLong;
      uStack_218 = 0;
      FUN_00401170(&uStack_21c);
      FUN_0040330b(local_c ^ (uint)auStack_224);
      return;
    }
  }
  FUN_0040330b(local_c ^ (uint)auStack_224);
  return;
}
```
<p class="mb-3">Analysing the code reveals that <code>cVar1</code> stores the stores the boolean result (0 or 1) of the license key validation check performed by <code>FUN_00402f00</code>.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image9.png" alt="Cracking 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
undefined1 FUN_00402f00(char *param_1)

{
  char **ppcVar1;
  char *pcVar2;
  undefined1 uVar3;
  int in_stack_00000014;
  uint in_stack_00000018;
  
  if (in_stack_00000014 == 0x1e) {
    ppcVar1 = &param_1;
    if (0xf < in_stack_00000018) {
      ppcVar1 = (char **)param_1;
    }
    if (*(char *)ppcVar1 == 'S') {
      ppcVar1 = &param_1;
      if (0xf < in_stack_00000018) {
        ppcVar1 = (char **)param_1;
      }
      if (*(char *)((int)ppcVar1 + 1) == 'B') {
        ppcVar1 = &param_1;
        if (0xf < in_stack_00000018) {
          ppcVar1 = (char **)param_1;
        }
        if (*(char *)((int)ppcVar1 + 2) == 'R') {
          ppcVar1 = &param_1;
          if (0xf < in_stack_00000018) {
            ppcVar1 = (char **)param_1;
          }
          if (*(char *)((int)ppcVar1 + 3) == 'Q') {
            ppcVar1 = &param_1;
            if (0xf < in_stack_00000018) {
              ppcVar1 = (char **)param_1;
            }
            if (*(char *)(ppcVar1 + 1) == '9') {
              ppcVar1 = &param_1;
              if (0xf < in_stack_00000018) {
                ppcVar1 = (char **)param_1;
              }
              if (*(char *)((int)ppcVar1 + 5) == '-') {
                ppcVar1 = &param_1;
                if (0xf < in_stack_00000018) {
                  ppcVar1 = (char **)param_1;
                }
                if (*(char *)((int)ppcVar1 + 6) == 'W') {
                  ppcVar1 = &param_1;
                  if (0xf < in_stack_00000018) {
                    ppcVar1 = (char **)param_1;
                  }
                  if (*(char *)((int)ppcVar1 + 7) == '8') {
                    ppcVar1 = &param_1;
                    if (0xf < in_stack_00000018) {
                      ppcVar1 = (char **)param_1;
                    }
                    if (*(char *)(ppcVar1 + 2) == 'Z') {
                      ppcVar1 = &param_1;
                      if (0xf < in_stack_00000018) {
                        ppcVar1 = (char **)param_1;
                      }
                      if (*(char *)((int)ppcVar1 + 9) == '1') {
                        ppcVar1 = &param_1;
                        if (0xf < in_stack_00000018) {
                          ppcVar1 = (char **)param_1;
                        }
                        if (*(char *)((int)ppcVar1 + 10) == 'J') {
                          ppcVar1 = &param_1;
                          if (0xf < in_stack_00000018) {
                            ppcVar1 = (char **)param_1;
                          }
                          if (*(char *)((int)ppcVar1 + 0xb) == '-') {
                            ppcVar1 = &param_1;
                            if (0xf < in_stack_00000018) {
                              ppcVar1 = (char **)param_1;
                            }
                            if (*(char *)(ppcVar1 + 3) == '2') {
                              ppcVar1 = &param_1;
                              if (0xf < in_stack_00000018) {
                                ppcVar1 = (char **)param_1;
                              }
                              if (*(char *)((int)ppcVar1 + 0xd) == '9') {
                                ppcVar1 = &param_1;
                                if (0xf < in_stack_00000018) {
                                  ppcVar1 = (char **)param_1;
                                }
                                if (*(char *)((int)ppcVar1 + 0xe) == '5') {
                                  ppcVar1 = &param_1;
                                  if (0xf < in_stack_00000018) {
                                    ppcVar1 = (char **)param_1;
                                  }
                                  if (*(char *)((int)ppcVar1 + 0xf) == 'I') {
                                    ppcVar1 = &param_1;
                                    if (0xf < in_stack_00000018) {
                                      ppcVar1 = (char **)param_1;
                                    }
                                    if (*(char *)(ppcVar1 + 4) == 'G') {
                                      ppcVar1 = &param_1;
                                      if (0xf < in_stack_00000018) {
                                        ppcVar1 = (char **)param_1;
                                      }
                                      if (*(char *)((int)ppcVar1 + 0x11) == '-') {
                                        ppcVar1 = &param_1;
                                        if (0xf < in_stack_00000018) {
                                          ppcVar1 = (char **)param_1;
                                        }
                                        if (*(char *)((int)ppcVar1 + 0x12) == 'W') {
                                          ppcVar1 = &param_1;
                                          if (0xf < in_stack_00000018) {
                                            ppcVar1 = (char **)param_1;
                                          }
                                          if (*(char *)((int)ppcVar1 + 0x13) == 'B') {
                                            ppcVar1 = &param_1;
                                            if (0xf < in_stack_00000018) {
                                              ppcVar1 = (char **)param_1;
                                            }
                                            if (*(char *)(ppcVar1 + 5) == 'S') {
                                              ppcVar1 = &param_1;
                                              if (0xf < in_stack_00000018) {
                                                ppcVar1 = (char **)param_1;
                                              }
                                              if (*(char *)((int)ppcVar1 + 0x15) == 'M') {
                                                ppcVar1 = &param_1;
                                                if (0xf < in_stack_00000018) {
                                                  ppcVar1 = (char **)param_1;
                                                }
                                                if (*(char *)((int)ppcVar1 + 0x16) == 'K') {
                                                  ppcVar1 = &param_1;
                                                  if (0xf < in_stack_00000018) {
                                                    ppcVar1 = (char **)param_1;
                                                  }
                                                  if (*(char *)((int)ppcVar1 + 0x17) == '-') {
                                                    ppcVar1 = &param_1;
                                                    if (0xf < in_stack_00000018) {
                                                      ppcVar1 = (char **)param_1;
                                                    }
                                                    if (*(char *)(ppcVar1 + 6) == 'S') {
                                                      ppcVar1 = &param_1;
                                                      if (0xf < in_stack_00000018) {
                                                        ppcVar1 = (char **)param_1;
                                                      }
                                                      if (*(char *)((int)ppcVar1 + 0x19) == '3') {
                                                        ppcVar1 = &param_1;
                                                        if (0xf < in_stack_00000018) {
                                                          ppcVar1 = (char **)param_1;
                                                        }
                                                        if (*(char *)((int)ppcVar1 + 0x1a) == 'E') {
                                                          ppcVar1 = &param_1;
                                                          if (0xf < in_stack_00000018) {
                                                            ppcVar1 = (char **)param_1;
                                                          }
                                                          if (*(char *)((int)ppcVar1 + 0x1b) == 'S' )
                                                          {
                                                            ppcVar1 = &param_1;
                                                            if (0xf < in_stack_00000018) {
                                                              ppcVar1 = (char **)param_1;
                                                            }
                                                            if (*(char *)(ppcVar1 + 7) == 'K') {
                                                              uVar3 = 1;
                                                              goto LAB_0040311c;
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  uVar3 = 0;
LAB_0040311c:
  if (0xf < in_stack_00000018) {
    pcVar2 = param_1;
    if (0xfff < in_stack_00000018 + 1) {
      pcVar2 = *(char **)(param_1 + -4);
      if ((char *)0x1f < param_1 + (-4 - (int)pcVar2)) {
                    /* WARNING: Subroutine does not return */
        _invalid_parameter_noinfo_noreturn();
      }
    }
    FUN_00403349(pcVar2);
  }
  return uVar3;
}
```

<p class="mb-3">Reading the nested <code>if</code> statements reveals to us the license key.</p>
<p class="mb-5"><strong>Answer:</strong> SBRQ9-W8Z1J-295IG-WBSMK-S3ESK</p>
<br />


<h5 class="mb-2"><strong>3. Serialization and Deserialization</strong></h5>
<p class="mb-3">This lab includes an application developed in Java that involves class structures holding user or application information, where serialization and deserialization processes are performed uncontrollably.

To complete the lab, you need to register and send a message.

What is the name and surname of the user who responded to your messages?</p>
<p class="mb-3"><strong>Steps: </strong>We open the file <code>chatapp.jar</code> in JD-GUI (Java Decompiler GUI). Reading each of the <code>.class</code> gives us a rough idea of the app functionalities. The following code is from <code>ChatAppUI.class</code>.</p>

```Java
import java.awt.BorderLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;

public class ChatAppUI extends JFrame {
  private JTextArea chatTextArea;
  
  private JTextField messageTextField;
  
  private JButton sendButton;
  
  public ChatAppUI() {
    setTitle("Chat App");
    setSize(400, 300);
    setResizable(false);
    setDefaultCloseOperation(3);
    initComponents();
    layoutComponents();
    setVisible(true);
  }
  
  private void initComponents() {
    this.chatTextArea = new JTextArea();
    this.chatTextArea.setEditable(false);
    this.messageTextField = new JTextField();
    this.messageTextField.addActionListener(new ActionListener() {
          public void actionPerformed(ActionEvent param1ActionEvent) {
            ChatAppUI.this.sendMessage();
          }
        });
    this.sendButton = new JButton("Send");
    this.sendButton.addActionListener(new ActionListener() {
          public void actionPerformed(ActionEvent param1ActionEvent) {
            Person person = new Person();
            try {
              person = person.readFromFile("person.ser");
            } catch (ClassNotFoundException|java.io.IOException classNotFoundException) {
              classNotFoundException.printStackTrace();
            } 
            if (person.getVip()) {
              ChatAppUI.this.sendMessage();
            } else {
              JOptionPane.showMessageDialog(ChatAppUI.this.chatTextArea, "Access Denied.", "Error", 0);
            } 
          }
        });
  }
  
  private void layoutComponents() {
    setLayout(new BorderLayout());
    JScrollPane jScrollPane = new JScrollPane(this.chatTextArea);
    add(jScrollPane, "Center");
    JPanel jPanel = new JPanel(new BorderLayout());
    jPanel.add(this.messageTextField, "Center");
    jPanel.add(this.sendButton, "East");
    add(jPanel, "South");
  }
  
  private void sendMessage() {
    String str = this.messageTextField.getText().trim();
    if (!str.isEmpty()) {
      appendMessage("You: " + str);
      appendMessage("\t\t" + ChatAes.getName() + ":" + str);
      this.messageTextField.setText("");
    } 
  }
  
  private void appendMessage(String paramString) {
    this.chatTextArea.append(paramString + "\n");
  }
  
  public static void main(String[] paramArrayOfString) {
    SwingUtilities.invokeLater(new Runnable() {
          public void run() {
            new ChatAppUI();
          }
        });
  }
}
```

<p class="mb-3">Looking at the <code>sendMessage()</code> method reveals that the application gets a reply from an identity retrieved from <code>ChatAes.getName()</code>. So we read the code in <code>ChatAes.class</code> which happens to decrypt a hardcoded hexadecimal string using an AES key.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image10.png" alt="Cracking 10" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Java
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class ChatAes {
  private static final String ALGORITHM = "AES";
  
  private static final String MODE = "AES/ECB/PKCS5Padding";
  
  private static byte[] encrypt(String paramString1, String paramString2) throws Exception {
    SecretKeySpec secretKeySpec = new SecretKeySpec(paramString2.getBytes(), "AES");
    Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
    cipher.init(1, secretKeySpec);
    return cipher.doFinal(paramString1.getBytes());
  }
  
  private static String decrypt(byte[] paramArrayOfbyte, String paramString) throws Exception {
    SecretKeySpec secretKeySpec = new SecretKeySpec(paramString.getBytes(), "AES");
    Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
    cipher.init(2, secretKeySpec);
    byte[] arrayOfByte = cipher.doFinal(paramArrayOfbyte);
    return new String(arrayOfByte);
  }
  
  private static byte[] hexStringToByteArray(String paramString) {
    int i = paramString.length();
    byte[] arrayOfByte = new byte[i / 2];
    for (byte b = 0; b < i; b += 2)
      arrayOfByte[b / 2] = 
        (byte)((Character.digit(paramString.charAt(b), 16) << 4) + Character.digit(paramString.charAt(b + 1), 16)); 
    return arrayOfByte;
  }
  
  public static String getName() {
    try {
      String str = "ThisIsASecretKey";
      return decrypt(hexStringToByteArray("6A642F2BC1BC4E07C1990034CBA6C66D"), str);
    } catch (Exception exception) {
      exception.printStackTrace();
      return "";
    } 
  }
}
```

<p class="mb-3">To get the name and surname needed, we can use CyberChef tool. First we drag <code>From Hex</code> into the Recipe area. Then we drag <code>AES Decrypt</code> into the Recipe area right below it. To configure the <code>AES Decrypt</code> options, for <code>Key</code>, change the dropdown from <code>HEX</code> to <code>UTF8</code> (or <code>Text/Raw</code>) and type <code>ThisIsASecretKey</code>. The Mode will be <code>ECB</code> and the input format is <code>Raw</code>. Then we paste <code>6A642F2BC1BC4E07C1990034CBA6C66D</code> into the <b>Input</b> box. The actual name and surname will appear perfectly in the <b>Output</b> box.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image11.png" alt="Cracking 11" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

<p class="mb-5"><strong>Answer:</strong> Ravi Tan</p>
<br />


<h5 class="mb-2"><strong>4. Time Based Demo Control</strong></h5>
<p class="mb-3">This lab contains an executable application written in go that checks for a demo license based on system time.

To complete the lab, you need to find the code snippet that checks the demo period within the application using reverse engineering techniques.

What is the date (year-month-day) when the demo period of the app ends?</p>
<p class="mb-3"><strong>Steps: </strong>We open and analyse the application in Ghidra.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image12.png" alt="Cracking 12" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

<p class="mb-3">Then we go to <code>Windows &gt; Defined Strings</code> and we search for the keyword 'demo' and find the reference address to it, which is <code>004adf6d</code>. In the Listing window, we notice there is a cross-reference (XREF) to <code>004c6de8</code>, which we double-click.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image13.png" alt="Cracking 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

<p class="mb-3">We are now taken to the reference and can see the string <code>gostr_Your_demo_period_has_expired,_pu</code>. Scrolling the Listing window more to the right and we can see the XREF to <code>main.main:00489dfd</code>. Double-clicking on this brings us to the main function of the demo expiration logic.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image14.png" alt="Cracking 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />


```Golang
/* DWARF original prototype: void main.main(void)
   Golang function info: Flags: []
   Golang source: /Users/user1/system_info_collect/beta_version/v1.1/main.go:27
   Golang stacktrace signature: undefined main.main() */

void main::main.main(void)

{
  bool bVar1;
  io.Writer w;
  io.Writer w_00;
  io.Writer w_01;
  io.Writer w_02;
  time.Time t;
  time.Time u;
  []interface_{} a;
  []interface_{} a_00;
  []interface_{} a_01;
  []interface_{} a_02;
  internal/abi.Type *local_48;
  string *psStack_40;
  internal/abi.Type *local_38;
  string *psStack_30;
  internal/abi.Type *local_28;
  string *psStack_20;
  internal/abi.Type *local_18;
  string *psStack_10;
  
  while (&psStack_20 <= CURRENT_G.stackguard0) {
    runtime::runtime.morestack_noctxt();
  }
  local_18 = &string___internal/abi.Type;
  psStack_10 = &gostr_============>_Welcome_System_Inf;
  w.data = os.Stdout;
  w.tab = &os::*os.File__implements__io.Writer___runtime.itab;
  a.len = 1;
  a.array = (interface_{} *)&local_18;
  a.cap = 1;
  fmt::fmt.Fprintln(w,a);
  local_28 = &string___internal/abi.Type;
  psStack_20 = &gostr_============================>_De;
  w_00.data = os.Stdout;
  w_00.tab = &os::*os.File__implements__io.Writer___runtime.itab;
  a_00.len = 1;
  a_00.array = (interface_{} *)&local_28;
  a_00.cap = 1;
  fmt::fmt.Fprintln(w_00,a_00);
  local_38 = &string___internal/abi.Type;
  psStack_30 = &gostr_;
  w_01.data = os.Stdout;
  w_01.tab = &os::*os.File__implements__io.Writer___runtime.itab;
  a_01.len = 1;
  a_01.array = (interface_{} *)&local_38;
  a_01.cap = 1;
  fmt::fmt.Fprint(w_01,a_01);
  t = time::time.Now();
  u = time::time.Date(1999,4,10,0,0,0,0,time.UTC);
  bVar1 = time::time.Time.Before(t,u);
  if (bVar1) {
    main.CollectData();
  }
  else {
    local_48 = &string___internal/abi.Type;
    psStack_40 = &gostr_Your_demo_period_has_expired,_pu;
    w_02.data = os.Stdout;
    w_02.tab = &os::*os.File__implements__io.Writer___runtime.itab;
    a_02.len = 1;
    a_02.array = (interface_{} *)&local_48;
    a_02.cap = 1;
    fmt::fmt.Fprintln(w_02,a_02);
  }
  return;
}
```

<p class=mb-3">The parameters passed to <code>time.Date</code> are explicitly defined in standard decimal values (<code>1999, 4, 10</code>).</p>
<p class="mb-5"><strong>Answer:</strong> 1999-04-10</p>
<br />


<h5 class="mb-2"><strong>5. Registry Key</strong></h5>
<p class="mb-3">This lab involves an application developed in C++ that demonstrates the insecure use of registry keys within the Windows operating system.

To complete the lab, you need to identify the user with VIP privileges.

What is the ID value of the VIP user?</p>
<p class="mb-3"><strong>Steps: </strong>We open the application in Ghidra. Then in the <b>Symbol Tree</b> section, we expand <code>Imports</code> and <code>ADVAPI32.DLL</code>, which then shows <code>RegGetValueA</code>. Viewing the XREF of this function and double-clicking on <code>FUN_00402bd0</code> brings us to the function that reads the registry and determines if the user is a VIP.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image15.png" alt="Cracking 15" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
/* WARNING: Type propagation algorithm not settling */

void FUN_00402bd0(undefined4 param_1)

{
  int iVar1;
  uint local_470 [21];
  undefined8 local_41c;
  undefined4 local_414;
  int local_410 [2];
  char local_408 [1024];
  uint local_8;
  
  local_8 = DAT_00406004 ^ (uint)&stack0xfffffffc;
  local_410[1] = 4;
  iVar1 = RegGetValueA(0x80000002,
                       "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\ProcessMonitor.exe"
                       ,&DAT_00404370,0x10,0,local_410,local_410 + 1);
  if ((iVar1 == 0) && (local_410[0] != 0)) {
    memset(local_408,0,0x400);
    local_414 = 0x400;
    iVar1 = RegGetValueA(0x80000002,
                         "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\ProcessMonitor.ex e"
                         ,"userid",2,0,local_408,&local_414);
    if (iVar1 == 0) {
      local_470[0] = 0x66;
      iVar1 = 0;
      local_470[1] = 0x7a;
      local_470[2] = 0x77;
      local_470[3] = 0x1e;
      local_470[4] = 0x66;
      local_470[5] = 0x51;
      local_470[6] = 0x51;
      local_470[7] = 0x7e;
      local_470[8] = 0x60;
      local_470[9] = 0x6a;
      local_470[10] = 10;
      local_470[0xb] = 0x79;
      local_470[0xc] = 7;
      local_470[0xd] = 0x66;
      local_470[0xe] = 0x67;
      local_470[0xf] = 0x69;
      local_470[0x10] = 0x59;
      local_470[0x11] = 0x43;
      local_470[0x12] = 0x47;
      local_470[0x13] = 10;
      while (((int)local_408[iVar1] ^ 0x33U) == local_470[iVar1]) {
        iVar1 = iVar1 + 1;
        if (0x13 < iVar1) {
          local_470[0x14] = param_1;
          local_41c = 0;
          FUN_00401170();
          FUN_00402de7();
          return;
        }
      }
    }
  }
  MessageBoxW(0,L"You\'re not VIP",L"Error",0x10);
  FUN_00402de7();
  return;
}
```

<p class=mb-3">To retrieve the true VIP User ID, we just need to reverse the XOR math. Because XOR is symmetrical, we can take the elements of <code>local_470</code> and XOR each one back with <code>0x33</code> to convert them into standard readable characters using the Python script below:</p>

```Python
# The hardcoded array values from local_470 in your Ghidra output
local_470 = [
    0x66, 0x7a, 0x77, 0x1e, 0x66, 0x51, 0x51, 0x7e, 0x60, 0x6a,
    10,   0x79, 7,    0x66, 0x67, 0x69, 0x59, 0x43, 0x47, 10
]

# The key used in the loop: ((int)local_408[iVar1] ^ 0x33U)
xor_key = 0x33

# Reversing the XOR cipher to reconstruct the user ID string
vip_id = "".join(chr(val ^ xor_key) for val in local_470)

print("Decrypted VIP User ID:")
print(vip_id)
```

<p class="mb-5"><strong>Answer:</strong> UID-UbbMSY9J4UTZjpt9</p>
<br />


<h5 class="mb-2"><strong>6. Server Licence Control</strong></h5>
<p class="mb-3">This lab includes an application developed in C++ that controls the license process of applications based on server access.

To complete the lab you need to manipulate the license control process.

What is the title of the application window that opens after bypassing the license check?</p>
<p class="mb-3"><strong>Steps: </strong>Despite the application not having any specific extension, we open it in Ghidra and analyse it.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image16.png" alt="Cracking 16" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
undefined8 main(void)

{
  int iVar1;
  long lVar2;
  
  gtk_init(&stack0xfffffffffff0bd94,&stack0xfffffffffff0bd88);
  lVar2 = curl_easy_init();
  if (lVar2 != 0) {
    curl_easy_setopt(lVar2,0x2712,"user.control.awesometexteditoronworld.com");
    curl_easy_setopt(lVar2,0x34,1);
    curl_easy_setopt(lVar2,0x4e2b,write_callback);
    curl_easy_setopt(lVar2,0x2711,&stack0xfffffffffff0bd98);
    iVar1 = curl_easy_perform(lVar2);
    if (iVar1 == 0) {
      RunEditor();
    }
    else {
      show_error_message("License Connection Failed!");
    }
    curl_easy_cleanup(lVar2);
  }
  gtk_main();
  return 0;
}
```

<p class="mb-3">In the <b>Symbol Tree</b>, we expand the <b>Functions</b> to search for <code>RunEditor</code> and double-click on it.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image17.png" alt="Cracking 17" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void RunEditor(void)

{
  undefined8 uVar1;
  undefined8 local_78;
  undefined3 local_70;
  undefined5 uStack_6d;
  undefined3 uStack_68;
  undefined8 local_65;
  undefined8 local_50;
  undefined8 local_48;
  undefined8 local_40;
  undefined8 local_38;
  undefined8 local_30;
  undefined8 local_28;
  undefined8 local_20;
  undefined8 local_18;
  undefined8 local_10;
  
  gtk_init(0,0);
  local_10 = gtk_window_new(0);
  uVar1 = gtk_window_get_type();
  uVar1 = g_type_check_instance_cast(local_10,uVar1);
  gtk_window_set_default_size(uVar1,800,600);
  local_78 = 0x694b206772777647;
  local_70 = 0x76756c;
  uStack_6d = 0x6d6c726868;
  uStack_68 = 0x206f7a;
  local_65 = 0x6d6c7267727756;
  atbash_decode_string(&local_78);
  uVar1 = gtk_window_get_type();
  uVar1 = g_type_check_instance_cast(local_10,uVar1);
  gtk_window_set_title(uVar1,&local_78);
  g_signal_connect_data(local_10,"destroy",gtk_main_quit,0,0,0);
  local_18 = gtk_box_new(1,0);
  uVar1 = gtk_container_get_type();
  uVar1 = g_type_check_instance_cast(local_10,uVar1);
  gtk_container_add(uVar1,local_18);
  local_20 = gtk_menu_bar_new();
  local_28 = gtk_menu_new();
  local_30 = gtk_menu_item_new_with_label(&DAT_0010305d);
  local_38 = gtk_menu_item_new_with_label(&DAT_00103062);
  local_40 = gtk_menu_item_new_with_label(&DAT_00103067);
  uVar1 = gtk_menu_item_get_type();
  uVar1 = g_type_check_instance_cast(local_30,uVar1);
  gtk_menu_item_set_submenu(uVar1,local_28);
  uVar1 = gtk_menu_shell_get_type();
  uVar1 = g_type_check_instance_cast(local_28,uVar1);
  gtk_menu_shell_append(uVar1,local_38);
  uVar1 = gtk_menu_shell_get_type();
  uVar1 = g_type_check_instance_cast(local_28,uVar1);
  gtk_menu_shell_append(uVar1,local_40);
  uVar1 = gtk_menu_shell_get_type();
  uVar1 = g_type_check_instance_cast(local_20,uVar1);
  gtk_menu_shell_append(uVar1,local_30);
  uVar1 = gtk_box_get_type();
  uVar1 = g_type_check_instance_cast(local_18,uVar1);
  gtk_box_pack_start(uVar1,local_20,0,0,0);
  local_48 = gtk_text_view_new();
  uVar1 = gtk_box_get_type();
  uVar1 = g_type_check_instance_cast(local_18,uVar1);
  gtk_box_pack_start(uVar1,local_48,1,1,0);
  uVar1 = gtk_text_view_get_type();
  uVar1 = g_type_check_instance_cast(local_48,uVar1);
  local_50 = gtk_text_view_get_buffer(uVar1);
  g_signal_connect_data(local_38,"activate",open_file,local_50,0,0);
  g_signal_connect_data(local_40,"activate",save_file,local_50,0,0);
  gtk_widget_show_all(local_10);
  gtk_main();
  return;
}
```

<p class="mb-3">The developers obfuscated the window title string directly on the stack and pass it through a decoding function right before setting it, so we use the following Python script to decode the window title.</p>

```Python
import string

def decrypt_atbash(text):
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    
    # Create Atbash translation table
    translation_table = str.maketrans(
        lowercase + uppercase, 
        lowercase[::-1] + uppercase[::-1]
    )
    return text.translate(translation_table)

def hex_to_ascii_little_endian(hex_values):
    ascii_string = ""
    
    for h_val in hex_values:
        # Remove '0x' prefix if present
        cleaned_hex = h_val.replace("0x", "")
        
        # Ensure even number of characters by padding with a leading zero if necessary
        if len(cleaned_hex) % 2 != 0:
            cleaned_hex = "0" + cleaned_hex
            
        # Convert hex string to raw bytes
        byte_data = bytes.fromhex(cleaned_hex)
        
        # Reverse the bytes because x86/x64 uses Little Endian storage
        reversed_bytes = byte_data[::-1]
        
        # Decode bytes into readable text and append
        ascii_string += reversed_bytes.decode('ascii', errors='ignore')
        
    return ascii_string

# 1. Paste the raw values straight from the Ghidra function variables
ghidra_stack_values = [
    "0x694b206772777647", # local_78
    "0x76756c",           # local_70
    "0x6d6c726868",       # uStack_6d
    "0x206f7a",           # uStack_68
    "0x6d6c7267727756"    # local_65
]

# 2. Automatically handle the endianness conversion
encoded_text = hex_to_ascii_little_endian(ghidra_stack_values)
print(f"Extracted Encoded String: '{encoded_text}'")

# 3. Decode the Atbash cipher
final_answer = decrypt_atbash(encoded_text)
print(f"Decoded Window Title:     '{final_answer}'")
```

```Bash
user@linux:~$ python3 tedit.py
Extracted Encoded String: 'Gvwrg Kiluvhhrlmzo Vwrgrlm'
Decoded Window Title:     'Tedit Professional Edition'
```

<p class="mb-5"><strong>Answer:</strong> Tedit Professional Edition</p>
<br />


<h5 class="mb-2"><strong>7. Decompile PyC</strong></h5>
<p class="mb-3">This lab includes an application developed in python that requires the application of decompile techniques.

You will need to find the admin password to complete the lab.

What is the admin password?</p>
<p class="mb-3"><strong>Steps: </strong> Since the application is a <code>.pyc</code> file which is compiled Python bytecode, we cannot use tools like Ghidra. Instead we need to install and use tools like <code>decompyle3</code> or <code>uncompyle6</code>. We will be using <code>decompyle3</code>, so we install it using <code>pip install decompyle3</code>, then we simply run <code>decompyle3 tasks.pyc</code> in the terminal. We get the following Python code:</p>

```Python
import tkinter as tk
from tkinter import messagebox
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Util.Padding import pad, unpad
import base64

def aes_decrypt(iv, ct, key):
    iv = base64.b64decode(iv)
    ct = base64.b64decode(ct)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    pt = unpad(cipher.decrypt(ct), AES.block_size)
    return pt.decode("utf-8")


def check_password():
    iv = "SNcwvdOH6KWto7rm3u98AQ=="
    ct = "gufUuc8wX9a4RXIh9kSjGTAh7y74Il6V5dReVzWH57Y="
    key = b'\x0c\xd3\xe8\xb1gw\x7f\xdb+\x92\x0b^\x86\xb4}\x10=Kz\x80}\xd2\x9c\x00X|\x1cQ\xdaf\xed"'
    decrypted_check = aes_decrypt(iv, ct, key)
    password = password_entry.get()
    if password == decrypted_check:
        root.destroy()
        run_todo_list_app()
    else:
        messagebox.showerror("Error", "Incorrect password!")


def run_todo_list_app():

    def add_task():
        task = task_entry.get().strip()
        if task:
            task_listbox.insert(tk.END, task)
            task_entry.delete(0, tk.END)
        else:
            messagebox.showwarning("Warning", "Please enter a task.")

    def remove_task():
        try:
            selected_index = task_listbox.curselection()[0]
            task_listbox.delete(selected_index)
        except IndexError:
            messagebox.showwarning("Warning", "Please select a task to remove.")

    root = tk.Tk()
    root.title("Admin To-Do List")
    main_frame = tk.Frame(root)
    main_frame.pack(fill=(tk.BOTH), expand=True)
    task_listbox = tk.Listbox(main_frame, width=50, height=15, font=('Arial', 12))
    task_listbox.pack(pady=10)
    task_entry = tk.Entry(main_frame, width=40, font=('Arial', 12))
    task_entry.pack(side=(tk.LEFT), padx=5)
    add_task_button = tk.Button(main_frame, text="Add Task", command=add_task, font=('Arial',
                                                                                     12))
    add_task_button.pack(side=(tk.LEFT))
    remove_task_button = tk.Button(main_frame, text="Remove Task", command=remove_task, font=('Arial',
                                                                                              12))
    remove_task_button.pack(side=(tk.LEFT), padx=5)
    tasks = []
    for task in tasks:
        task_listbox.insert(tk.END, task)

    root.mainloop()


root = tk.Tk()
root.title("Admin Page")
root.geometry("300x150")
root.configure(background="#f0f0f0")
label = tk.Label(root, text="Enter admin password:", bg="#f0f0f0")
label.pack()
password_entry = tk.Entry(root, show="*", width=20)
password_entry.pack()
submit_button = tk.Button(root, text="Submit", command=check_password, bg="#4CAF50", fg="white")
submit_button.pack(pady=10)
root.mainloop()
```

<p class="mb-3">The application relies on an AES-256 decryption routine to determine what the correct password is. Instead of trying to guess it, we can let Python calculate the decrypted string for us. We will need the <code>pycryptodome</code> library which can be installed using <code>pip install pycryptodome</code> to run the Python script below:</p>

```Python
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

def get_admin_password():
    # Extracted values from the decompiled pyc file
    iv = "SNcwvdOH6KWto7rm3u98AQ=="
    ct = "gufUuc8wX9a4RXIh9kSjGTAh7y74Il6V5dReVzWH57Y="
    key = b'\x0c\xd3\xe8\xb1gw\x7f\xdb+\x92\x0b^\x86\xb4}\x10=Kz\x80}\xd2\x9c\x00X|\x1cQ\xdaf\xed"'
    
    # Standard AES-CBC Decryption
    iv_bytes = base64.b64decode(iv)
    ct_bytes = base64.b64decode(ct)
    
    cipher = AES.new(key, AES.MODE_CBC, iv_bytes)
    pt_bytes = unpad(cipher.decrypt(ct_bytes), AES.block_size)
    
    return pt_bytes.decode("utf-8")

print(f"The Admin Password is: {get_admin_password()}")
```

<p class="mb-5"><strong>Answer:</strong> 6WK1G-CEIZF-G7SR6-D9RHE-NFVZO</p>
<br />


<h5 class="mb-2"><strong>8. Fake Instruction</strong></h5>
<p class="mb-3">This lab includes examining function addresses and analyzing their calls in a Windows environment.

To complete the lab, you need to find the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong>We open and analyse the application in Ghidra. Then we go to <code>Windows &gt; Defined Strings</code> and search fro the keyword 'license'. We select the results with the string value 'License key verified.'.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image18.png" alt="Cracking 18" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Assembly
                             u_License_key_verified._0040547c                XREF[1]:     FUN_00402e90:0040303f (*)   
        0040547c 4c  00  69       unicode    u"License key verified."
                 00  63  00 
                 65  00  6e 
```
<p class="mb-3">In the Listing window, notice the XREF is <code>FUN_00402e90</code> which we double click on.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image19.png" alt="Cracking 19" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void __fastcall FUN_00402e90(undefined4 *param_1)

{
  ushort uVar1;
  uint uVar2;
  ushort *puVar3;
  ushort *puVar4;
  uint uVar5;
  uint uVar6;
  undefined4 *puVar7;
  uint uVar8;
  bool bVar9;
  uint local_250 [4];
  undefined4 local_240;
  uint local_23c;
  undefined4 *local_238;
  undefined4 uStack_234;
  undefined4 uStack_230;
  undefined4 uStack_22c;
  undefined4 local_228;
  uint local_224;
  undefined4 local_220;
  undefined8 local_21c;
  ushort local_214 [256];
  uint local_14;
  void *local_10;
  undefined1 *puStack_c;
  undefined4 local_8;
  
  local_8 = 0xffffffff;
  puStack_c = &LAB_00404380;
  local_10 = ExceptionList;
  uVar2 = DAT_00407000 ^ (uint)&stack0xfffffffc;
  ExceptionList = &local_10;
  local_14 = uVar2;
  GetDlgItemTextW(param_1[1],1,local_214,0x100);
  local_238 = (undefined4 *)0x0;
  uStack_234 = 0;
  uStack_230 = 0;
  uStack_22c = 0;
  local_238 = (undefined4 *)operator_new(0x40);
  local_228 = 0x1d;
  local_224 = 0x1f;
  *local_238 = 0x4f004e;
  local_238[1] = 0x5a0038;
  local_238[2] = 0x2d0057;
  local_238[3] = 0x54005a;
  local_238[4] = 0x590056;
  local_238[5] = 0x2d004c;
  local_238[6] = 0x470057;
  local_238[7] = 0x4e0055;
  local_238[8] = 0x2d0039;
  local_238[9] = 0x460042;
  local_238[10] = 0x4e0051;
  local_238[0xb] = 0x2d0030;
  *(undefined8 *)(local_238 + 0xc) = 0x4b004e004e0033;
  *(undefined2 *)(local_238 + 0xe) = 0x4f;
  *(undefined2 *)((int)local_238 + 0x3a) = 0;
  local_8 = 0;
  puVar3 = (ushort *)FUN_00402d30(local_250,&local_238);
  if (7 < *(uint *)(puVar3 + 10)) {
    puVar3 = *(ushort **)puVar3;
  }
  puVar4 = local_214;
  do {
    uVar1 = *puVar4;
    bVar9 = uVar1 < *puVar3;
    if (uVar1 != *puVar3) {
LAB_00402f8d:
      uVar8 = -(uint)bVar9 | 1;
      goto LAB_00402f92;
    }
    if (uVar1 == 0) break;
    uVar1 = puVar4[1];
    bVar9 = uVar1 < puVar3[1];
    if (uVar1 != puVar3[1]) goto LAB_00402f8d;
    puVar4 = puVar4 + 2;
    puVar3 = puVar3 + 2;
  } while (uVar1 != 0);
  uVar8 = 0;
LAB_00402f92:
  if (7 < local_23c) {
    uVar5 = local_23c * 2 + 2;
    uVar6 = local_250[0];
    if (0xfff < uVar5) {
      uVar6 = *(uint *)(local_250[0] - 4);
      uVar5 = local_23c * 2 + 0x25;
      if (0x1f < (local_250[0] - uVar6) - 4) goto LAB_00403024;
    }
    FUN_00403422(uVar6,uVar5,uVar2);
  }
  local_8 = 0xffffffff;
  local_240 = 0;
  local_23c = 7;
  local_250[0] = local_250[0] & 0xffff0000;
  if (7 < local_224) {
    uVar5 = local_224 * 2 + 2;
    puVar7 = local_238;
    if (0xfff < uVar5) {
      puVar7 = (undefined4 *)local_238[-1];
      uVar5 = local_224 * 2 + 0x25;
      if (0x1f < (uint)((int)local_238 + (-4 - (int)puVar7))) {
LAB_00403024:
                    /* WARNING: Subroutine does not return */
        invalid_parameter_noinfo_noreturn();
      }
    }
    FUN_00403422(puVar7,uVar5,uVar2);
  }
  if (uVar8 == 0) {
    MessageBoxW(0,L"License key verified.",L"Verified",0x40);
    SendMessageW(param_1[1],0x10,0,0);
    local_220 = *param_1;
    local_21c = 0;
    FUN_00401170();
  }
  else {
    MessageBoxW(0,L"License key is invalid.",L"Error",0x10);
  }
  ExceptionList = local_10;
  FUN_004033e4();
  return;
}
```

<p class="mb-3">Notice <code>FUN_00402d30</code>. It takes a reference to the fake key (<code>&local_238</code>) and returns <code>puVar3</code>, which is the string the user input is actually compared against.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/cracking/cracking_hackviser_image20.png" alt="Cracking 20" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
undefined4 * FUN_00402d30(undefined4 *param_1,short *param_2)

{
  short *psVar1;
  uint uVar2;
  int iVar3;
  undefined4 *puVar4;
  uint uVar5;
  uint uVar6;
  short sVar7;
  uint local_24;
  uint local_20;
  uint local_1c;
  short *local_14;
  void *local_10;
  undefined1 *puStack_c;
  undefined4 local_8;
  
  local_10 = ExceptionList;
  puStack_c = &LAB_0040434e;
  uVar2 = DAT_00407000 ^ (uint)&stack0xfffffffc;
  ExceptionList = &local_10;
  *param_1 = 0;
  param_1[1] = 0;
  param_1[2] = 0;
  param_1[3] = 0;
  param_1[4] = 0;
  param_1[5] = 0;
  param_1[4] = 0;
  param_1[5] = 7;
  *(undefined2 *)param_1 = 0;
  local_8 = 0;
  if (*(uint *)(param_2 + 10) < 8) {
    local_14 = param_2;
  }
  else {
    local_14 = *(short **)param_2;
  }
  psVar1 = local_14 + *(int *)(param_2 + 8);
  do {
    if (local_14 == psVar1) {
      ExceptionList = local_10;
      return param_1;
    }
    sVar7 = *local_14;
    iVar3 = iswalpha(sVar7,uVar2);
    if (iVar3 == 0) {
      uVar5 = param_1[4];
      uVar6 = param_1[5];
      if (uVar6 <= uVar5) {
        local_24 = local_24 & 0xffffff00;
        uVar6 = local_24;
        goto LAB_00402e5a;
      }
LAB_00402e36:
      param_1[4] = uVar5 + 1;
      puVar4 = param_1;
      if (7 < uVar6) {
        puVar4 = (undefined4 *)*param_1;
      }
      *(short *)((int)puVar4 + uVar5 * 2) = sVar7;
      *(undefined2 *)((int)puVar4 + uVar5 * 2 + 2) = 0;
    }
    else {
      iVar3 = iswupper(sVar7);
      if (iVar3 == 0) {
        iVar3 = iswlower(sVar7);
        if (iVar3 == 0) goto LAB_00402e62;
        uVar5 = param_1[4];
        uVar6 = param_1[5];
        sVar7 = 0xdb - sVar7;
        if (uVar5 < uVar6) goto LAB_00402e36;
        local_20 = local_20 & 0xffffff00;
        uVar6 = local_20;
      }
      else {
        uVar5 = param_1[4];
        uVar6 = param_1[5];
        sVar7 = 0x9b - sVar7;
        if (uVar5 < uVar6) goto LAB_00402e36;
        local_1c = local_1c & 0xffffff00;
        uVar6 = local_1c;
      }
LAB_00402e5a:
      FUN_00403250(uVar5,uVar6,sVar7);
    }
LAB_00402e62:
    local_14 = local_14 + 1;
  } while( true );
}
```

<p class="mb-3">The function <code>FUN_00402d30</code> acts as a dynamic string obfuscation handler that implements an Atbash cipher to decode the actual license key at runtime. It iterates character-by-character through the hardcoded decoy string, passing each character through wide-character classification functions like <code>iswalpha</code>, <code>iswupper</code>, and <code>iswlower</code>. If a character is identified as a non-alphabetic symbol (such as hyphens or digits), it is written to the destination buffer completely unchanged.</p>

<p class="mb-3">However, if the character is a letter, the function applies a symmetric alphabetic reflection: uppercase letters are transformed via the mathematical expression <code>0x9b - sVar7</code> (effectively mapping 'A' to 'Z', 'B' to 'Y', etc.), while lowercase letters are flipped using <code>0xdb - sVar7</code>. To obtain the license key we need, we use the Python script below:</p>

```Python
# The raw hex values copied directly from your Ghidra output
stack_data = [
    (0x4f004e, 3),   # (value, size in bytes)
    (0x5a0038, 3),
    (0x2d0057, 3),
    (0x54005a, 3),
    (0x590056, 3),
    (0x2d004c, 3),
    (0x470057, 3),
    (0x4e0055, 3),
    (0x2d0039, 3),
    (0x460042, 3),
    (0x4e0051, 3),
    (0x2d0030, 3),
    (0x4b004e004e0033, 7), 
    (0x4f, 1)        
]

extracted_bytes = bytearray()

for value, size in stack_data:
    # Convert integer to bytes using Little-Endian
    byte_len = (size + 1) // 2 * 2
    chunk = value.to_bytes(byte_len, byteorder='little')
    extracted_bytes.extend(chunk)

# Decode initial UTF-16 representation
decoy_key = extracted_bytes.decode('utf-16le').rstrip('\x00')

# Run the string through the Atbash cipher transformation from FUN_00402d30
real_key_chars = []
for char in decoy_key:
    if char.isalpha():
        if char.isupper():
            # sVar7 = 0x9b - sVar7
            real_char = chr(0x9b - ord(char))
        else:
            # sVar7 = 0xdb - sVar7
            real_char = chr(0xdb - ord(char))
        real_key_chars.append(real_char)
    else:
        # Non-alphabet characters pass through untouched
        real_key_chars.append(char)

real_license_key = "".join(real_key_chars)

print(f"Decoy Stack Key:  {decoy_key}")
print(f"Real License Key: {real_license_key}")
```

```Bash
user@linux:~$ python3 fake-instruction.py
Decoy Stack Key:  NO8ZW-ZTVYL-WGUN9-BFQN0-3NNKO
Real License Key: ML8AD-AGEBO-DTFM9-YUJM0-3MMPL
```

<p class="mb-5"><strong>Answer:</strong> ML8AD-AGEBO-DTFM9-YUJM0-3MMPL</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
---
title: 'Packers'
date: '2026-06-12'
excerpt: 'Practice Packers in multiple lab exercises.'
prog: 'Hackviser Reverse Engineering Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/packers/packers_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Packers</h1>
<div class="writeup-date">June 2026 · Reverse Engineering Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Packers in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. ASPack</strong></h5>
<p class="mb-3">This lab includes an application packaged with ASPack.

To complete the lab, you need to unpack the application and access the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong>First we install <code>unipacker</code> using <code>pip install unipacker</code> and unpack the file.</p>

```Bash
user@linux:~$ pip install unipacker
user@linux:~$ unipacker aspack.exe
Next up: Sample: [ASPack] aspack.exe
Emulation starting at 0x409001
Section hopping detected into .text! Address: 0x4032cc
Totalsize:0x1d000, VirtualMemorySize:0x1d000
Allocated Chunks:
Setting unpacked Entry Point
OEP:0x32cc
Fixing Imports...
OrderedDict([('kernel32.dll#0', [('VirtualAlloc', 1943881216), ('VirtualFree', 1943882464), ('VirtualProtect', 1944095216)]), ('KERNEL32.dll#0', [('CreateToolhelp32Snapshot', 1065052), ('Process32NextW', 1065060), ('Process32FirstW', 1065068), ('CloseHandle', 1065076), ('SetUnhandledExceptionFilter', 1065084), ('GetModuleHandleW', 1065092), ('GetStartupInfoW', 1065100), ('IsDebuggerPresent', 1065108), ('InitializeSListHead', 1065116), ('GetSystemTimeAsFileTime', 1065124), ('GetCurrentThreadId', 1065132), ('GetCurrentProcessId', 1065140), ('QueryPerformanceCounter', 1065148), ('IsProcessorFeaturePresent', 1065156), ('TerminateProcess', 1065164), ('GetCurrentProcess', 1065172), ('UnhandledExceptionFilter', 1065180)]), ('USER32.dll#0', [('GetDlgItemTextW', 1064988), ('GetWindowLongW', 1065188), ('GetMessageW', 1065196), ('DefWindowProcW', 1065204), ('GetWindowRect', 1065212), ('MessageBoxW', 1065220), ('DestroyWindow', 1065228), ('SetWindowPos', 1065236), ('CreateWindowExW', 1065244), ('SendMessageW', 1065252), ('ShowWindow', 1065260), ('DispatchMessageW', 1065268), ('RegisterClassW', 1065276), ('TranslateMessage', 1065284), ('SetCapture', 1065292), ('ReleaseCapture', 1065300), ('SetWindowLongW', 1065308), ('PostQuitMessage', 1065316), ('UpdateWindow', 1065324)]), ('MSVCP140.dll#0', [('?good@ios_base@std@@QBE_NXZ', 1064996), ('??1?$basic_iostream@_WU?$char_traits@_W@std@@@std@@UAE@XZ', 1065332), ('??6?$basic_ostream@_WU?$char_traits@_W@std@@@std@@QAEAAV01@K@Z', 1065340), ('??1?$basic_ios@_WU?$char_traits@_W@std@@@std@@UAE@XZ', 1065348), ('?uncaught_exception@std@@YA_NXZ', 1065356), ('?_Xlength_error@std@@YAXPBD@Z', 1065364), ('?sputn@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@QAE_JPB_W_J@Z', 1065372), ('?sputc@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@QAEG_W@Z', 1065380), ('??0?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@IAE@XZ', 1065388), ('?_Osfx@?$basic_ostream@_WU?$char_traits@_W@std@@@std@@QAEXXZ', 1065396), ('?flush@?$basic_ostream@_WU?$char_traits@_W@std@@@std@@QAEAAV12@XZ', 1065404), ('?setstate@?$basic_ios@_WU?$char_traits@_W@std@@@std@@QAEXH_N@Z', 1065412), ('??0?$basic_ios@_WU?$char_traits@_W@std@@@std@@IAE@XZ', 1065420), ('??0?$basic_iostream@_WU?$char_traits@_W@std@@@std@@QAE@PAV?$basic_streambuf@_WU?$char_traits@_W@std@@@1@@Z', 1065428), ('??1?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@UAE@XZ', 1065436), ('?_Lock@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@UAEXXZ', 1065444), ('?_Unlock@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@UAEXXZ', 1065452), ('?showmanyc@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAE_JXZ', 1065460), ('?uflow@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAEGXZ', 1065468), ('?xsgetn@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAE_JPA_W_J@Z', 1065476), ('?xsputn@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAE_JPB_W_J@Z', 1065484), ('?setbuf@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAEPAV12@PA_W_J@Z', 1065492), ('?sync@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAEHXZ', 1065500), ('?imbue@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAEXABVlocale@2@@Z', 1065508)]), ('VCRUNTIME140.dll#0', [('memcpy', 1065004), ('_except_handler4_common', 1065516), ('__current_exception_context', 1065524), ('__current_exception', 1065532), ('_CxxThrowException', 1065540), ('__std_terminate', 1065548), ('__std_exception_copy', 1065556), ('__std_exception_destroy', 1065564), ('__CxxFrameHandler3', 1065572), ('memset', 1065580), ('memmove', 1065588)]), ('api-ms-win-crt-runtime-l1-1-0.dll#0', [('_crt_atexit', 1065012), ('_controlfp_s', 1065596), ('_register_onexit_function', 1065604), ('_initialize_onexit_table', 1065612), ('_cexit', 1065620), ('_invalid_parameter_noinfo_noreturn', 1065628), ('_register_thread_local_exe_atexit_callback', 1065636), ('_exit', 1065644), ('exit', 1065652), ('_initterm_e', 1065660), ('_initterm', 1065668), ('_get_narrow_winmain_command_line', 1065676), ('_initialize_narrow_environment', 1065684), ('_configure_narrow_argv', 1065692), ('terminate', 1065700), ('_set_app_type', 1065708), ('_seh_filter_exe', 1065716), ('_c_exit', 1065724)]), ('api-ms-win-crt-heap-l1-1-0.dll#0', [('_set_new_mode', 1065020), ('free', 1065732), ('_callnewh', 1065740), ('malloc', 1065748)]), ('api-ms-win-crt-math-l1-1-0.dll#0', [('__setusermatherr', 1065028)]), ('api-ms-win-crt-stdio-l1-1-0.dll#0', [('_set_fmode', 1065036), ('__p__commode', 1065756)]), ('api-ms-win-crt-locale-l1-1-0.dll#0', [('_configthreadlocale', 1065044)])])
Not Found!
Not Found!
writing dllname KERNEL32.dll#0 to: 0xf0dc
patch_addr: 0xf224, 0xf23f, 0xf250, 0xf262, 0xf270, 0xf28e, 0xf2a1, 0xf2b3, 0xf2c7, 0xf2dd, 0xf2f7, 0xf30c, 0xf322, 0xf33c, 0xf358, 0xf36b, 0xf37f
ptr_iat: 0x4000
writing dllname USER32.dll#0 to: 0xf0e9
patch_addr: 0xf3fe, 0xf410, 0xf421, 0xf42f, 0xf440, 0xf450, 0xf45e, 0xf46e, 0xf47d, 0xf48f, 0xf49e, 0xf4ab, 0xf4be, 0xf4cf, 0xf4e2, 0xf4ef, 0xf500, 0xf511, 0xf523
ptr_iat: 0x40ac
writing dllname MSVCP140.dll#0 to: 0xf0f4
patch_addr: 0xf5aa, 0xf5c8, 0xf604, 0xf645, 0xf67c, 0xf69e, 0xf6be, 0xf706, 0xf749, 0xf786, 0xf7c5, 0xf809, 0xf84a, 0xf881, 0xf8ee, 0xf92b, 0xf96c, 0xf9af, 0xf9f5, 0xfa36, 0xfa7f, 0xfac8, 0xfb15, 0xfb55
ptr_iat: 0x4048
writing dllname VCRUNTIME140.dll#0 to: 0xf101
patch_addr: 0xfbe6, 0xfbef, 0xfc09, 0xfc27, 0xfc3d, 0xfc52, 0xfc64, 0xfc7b, 0xfc95, 0xfcaa, 0xfcb3
ptr_iat: 0x40fc
writing dllname api-ms-win-crt-runtime-l1-1-0.dll#0 to: 0xf112
patch_addr: 0xfd1d, 0xfd2b, 0xfd3a, 0xfd56, 0xfd71, 0xfd7a, 0xfd9f, 0xfdcc, 0xfdd4, 0xfddb, 0xfde9, 0xfdf5, 0xfe18, 0xfe39, 0xfe52, 0xfe5e, 0xfe6e, 0xfe80
ptr_iat: 0x4150
writing dllname api-ms-win-crt-heap-l1-1-0.dll#0 to: 0xf134
patch_addr: 0xfeb2, 0xfec2, 0xfec9, 0xfed5
ptr_iat: 0x412c
writing dllname api-ms-win-crt-math-l1-1-0.dll#0 to: 0xf153
patch_addr: 0xfefa
ptr_iat: 0x4148
writing dllname api-ms-win-crt-stdio-l1-1-0.dll#0 to: 0xf172
patch_addr: 0xff2d, 0xff3a
ptr_iat: 0x419c
writing dllname api-ms-win-crt-locale-l1-1-0.dll#0 to: 0xf192
patch_addr: 0xff65
ptr_iat: 0x4140
Fixing sections
Size of raw data (.text): 0x1c00, fixed: 0x3000
Size of raw data (.rdata): 0xc00, fixed: 0x2000
Size of raw data (.data): 0x200, fixed: 0x1000
Size of raw data (.rsrc): 0x200, fixed: 0x1000
Size of raw data (.reloc): 0x600, fixed: 0x1000
Size of raw data (.aspack): 0x1400, fixed: 0x2000
Size of raw data (.adata): 0x00, fixed: 0x12000
Set IAT-Directory to 0 (VA and Size)
RVA to import table: 0xf000
Totalsize:0x1d000, VirtualMemorySize:0x1d000, Allocated chunks: []
Fixing SizeOfImage...
Fixing Memory Protection of Sections
.text
Fixing protections for: .text with (False, True, False)
.rdata
Fixing protections for: .rdata with (False, True, True)
.data
Fixing protections for: .data with (False, True, True)
.rsrc
Fixing protections for: .rsrc with (False, True, True)
.reloc
Fixing protections for: .reloc with (False, True, True)
.aspack
Fixing protections for: .aspack with (True, True, True)
.adata
Fixing protections for: .adata with (True, True, True)
Fixing Checksum
Dumping state to ./unpacked_aspack.exe

Emulation of aspack.exe finished.
--- Saved to ./unpacked_aspack.exe ---
```

<p class="mb-3">Next, we open the unpacked file in Ghidra for analysis. Using <code>Windows > Defined Strings</code>, we search for the string 'license' and select the result with the string value 'License key verified.'. Notice the Listing window showing the address <code>004044d8</code> and XREF referencing <code>FUN_00402c50</code> which we double-click on.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/packers/packers_hackviser_image1.png" alt="Packers 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Assembly
                             u_License_key_verified._004044d8                XREF[1]:     FUN_00402c50:00402df6 (*)   
        004044d8 4c  00  69       unicode    u"License key verified."
                 00  63  00 
                 65  00  6e 
```

<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/packers/packers_hackviser_image2.png" alt="Packers 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void __thiscall FUN_00402c50(void *this,UINT param_1,WPARAM param_2,LPARAM param_3)

{
  WCHAR WVar1;
  wchar_t wVar2;
  longlong lVar3;
  wchar_t *pwVar4;
  wchar_t *pwVar5;
  int iVar6;
  uint uVar7;
  WCHAR *pWVar8;
  uint uVar9;
  uint uVar10;
  bool bVar11;
  uint local_220;
  undefined4 local_21c;
  undefined8 local_218;
  WCHAR local_210;
  undefined1 local_20e [514];
  uint local_c;
  
  local_c = DAT_00406004 ^ (uint)&stack0xfffffffc;
  if (param_1 == 2) {
    PostQuitMessage(0);
  }
  else {
    if (param_1 != 0x111) {
      DefWindowProcW(*(HWND *)((int)this + 4),param_1,param_2,param_3);
      FUN_0040301c(local_c ^ (uint)&stack0xfffffffc);
      return;
    }
    if ((short)param_2 == 2) {
      GetDlgItemTextW(*(HWND *)((int)this + 4),1,&local_210,0x100);
      pWVar8 = &local_210;
      do {
        WVar1 = *pWVar8;
        pWVar8 = pWVar8 + 1;
      } while (WVar1 != L'\0');
      uVar9 = (int)pWVar8 - (int)local_20e >> 1;
      lVar3 = (ulonglong)(((uVar9 + 2) / 3) * 4 + 1) * 2;
      pwVar4 = (wchar_t *)malloc(-(uint)((int)((ulonglong)lVar3 >> 0x20) != 0) | (uint)lVar3);
      if (pwVar4 != (wchar_t *)0x0) {
        uVar10 = 0;
        iVar6 = 0;
        local_220 = 0;
        uVar7 = 0;
        if (uVar9 != 0) {
          do {
            iVar6 = iVar6 + 0x10;
            uVar10 = uVar10 << 0x10 | (uint)*(ushort *)(local_20e + local_220 * 2 + -2);
            while (5 < iVar6) {
              iVar6 = iVar6 + -6;
              pwVar4[uVar7] =
                   u_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef_00404538
                   [uVar10 >> ((byte)iVar6 & 0x1f) & 0x3f];
              uVar7 = uVar7 + 1;
            }
            local_220 = local_220 + 1;
          } while (local_220 < uVar9);
          if (0 < iVar6) {
            pwVar4[uVar7] =
                 u_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef_00404538
                 [uVar10 << (6U - (char)iVar6 & 0x1f) & 0x3f];
            uVar7 = uVar7 + 1;
          }
          for (; (uVar7 & 3) != 0; uVar7 = uVar7 + 1) {
            pwVar4[uVar7] = L'=';
          }
        }
        pwVar4[uVar7] = L'\0';
      }
      pwVar5 = u_AFAAQwAxAE8ANwAtADIATAA1AFIANAAt_00404420;
      do {
        wVar2 = *pwVar4;
        bVar11 = (ushort)wVar2 < (ushort)*pwVar5;
        if (wVar2 != *pwVar5) {
LAB_00402de6:
          uVar9 = -(uint)bVar11 | 1;
          goto LAB_00402deb;
        }
        if (wVar2 == L'\0') break;
        wVar2 = pwVar4[1];
        bVar11 = (ushort)wVar2 < (ushort)pwVar5[1];
        if (wVar2 != pwVar5[1]) goto LAB_00402de6;
        pwVar4 = pwVar4 + 2;
        pwVar5 = pwVar5 + 2;
      } while (wVar2 != L'\0');
      uVar9 = 0;
LAB_00402deb:
      if (uVar9 == 0) {
        MessageBoxW((HWND)0x0,u_License_key_verified._004044d8,u_Verified_004044c4,0x40);
        SendMessageW(*(HWND *)((int)this + 4),0x10,0,0);
                    /* WARNING: Load size is inaccurate */
        local_21c = *this;
        local_218 = 0;
        FUN_00401170(&local_21c);
      }
      else {
        MessageBoxW((HWND)0x0,u_License_key_is_invalid._00404504,u_Error_004043b4,0x10);
      }
    }
  }
  FUN_0040301c(local_c ^ (uint)&stack0xfffffffc);
  return;
}
```

<p class="mb-3">The program grabs the key we enter, decodes it into base64 and compares it to a hardcoded string. If it matches, we get the "License key verified." pop-up. In the function code shown above, we double-click on <code>u_AFAAQwAxAE8ANwAtADIATAA1AFIANAAt_00404420</code> to bring us to the address <code>00404420</code>. Then we right-click on it, click <b>Copy Special</b> and select <b>Byte String</b> as the format to extact the raw memory buffer. Next, we run the following command to obtain the full license key.</p>

```Bash
user@linux:~$ python3 -c "h = '4100460041004100510077004100780041004500380041004e007700410074004100440049004100540041004100310041004600490041004e004100410074004100450055004100540067004200540041004400590041005400410041007400410046006300410055004100420057004100450073004100540067004100740041004400450041005100670042004e004100440051004100510067003d003d00'; b64_str = bytes.fromhex(h).decode('utf-16le'); import base64; print(base64.b64decode(b64_str).decode('utf-8'))"
PC1O7-2L5R4-ENS6L-WPVKN-1BM4B
```

<p class="mb-5"><strong>Answer:</strong> PC1O7-2L5R4-ENS6L-WPVKN-1BM4B</p>
<br />


<h5 class="mb-2"><strong>2. MPress</strong></h5>
<p class="mb-3">This lab includes an application packaged with MPress.

To complete the lab, you need to unpack the application and access the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong> We unpack the application using <code>unipacker</code> in the terminal.</p>

```Bash
user@linux:~$ unipacker mpress.exe
Next up: Sample: [MPRESS] mpress.exe
Emulation starting at 0x409293
Section hopping detected into .MPRESS1! Address: 0x4031eb
Totalsize:0x1a000, VirtualMemorySize:0x1a000
Allocated Chunks:
Setting unpacked Entry Point
OEP:0x31eb
Fixing Imports...
OrderedDict([('KERNEL32#0', [('VirtualProtect', 1944095216)]), ('KERNEL32.dll#0', [('CreateToolhelp32Snapshot', 1065044), ('Process32NextW', 1065052), ('Process32FirstW', 1065060), ('CloseHandle', 1065068), ('SetUnhandledExceptionFilter', 1065076), ('GetModuleHandleW', 1065084), ('GetStartupInfoW', 1065092), ('IsDebuggerPresent', 1065100), ('InitializeSListHead', 1065108), ('GetSystemTimeAsFileTime', 1065116), ('GetCurrentThreadId', 1065124), ('GetCurrentProcessId', 1065132), ('QueryPerformanceCounter', 1065140), ('IsProcessorFeaturePresent', 1065148), ('TerminateProcess', 1065156), ('GetCurrentProcess', 1065164), ('UnhandledExceptionFilter', 1065172)]), ('USER32.dll#0', [('GetDlgItemTextW', 1065180), ('GetWindowLongW', 1065188), ('GetMessageW', 1065196), ('DefWindowProcW', 1065204), ('GetWindowRect', 1065212), ('MessageBoxW', 1065220), ('DestroyWindow', 1065228), ('SetWindowPos', 1065236), ('CreateWindowExW', 1065244), ('SendMessageW', 1065252), ('ShowWindow', 1064980), ('DispatchMessageW', 1065260), ('RegisterClassW', 1065268), ('TranslateMessage', 1065276), ('SetCapture', 1065284), ('ReleaseCapture', 1065292), ('SetWindowLongW', 1065300), ('PostQuitMessage', 1065308), ('UpdateWindow', 1065316)]), ('MSVCP140.dll#0', [('?good@ios_base@std@@QBE_NXZ', 1064988), ('??1?$basic_iostream@_WU?$char_traits@_W@std@@@std@@UAE@XZ', 1065324), ('??6?$basic_ostream@_WU?$char_traits@_W@std@@@std@@QAEAAV01@K@Z', 1065332), ('??1?$basic_ios@_WU?$char_traits@_W@std@@@std@@UAE@XZ', 1065340), ('?uncaught_exception@std@@YA_NXZ', 1065348), ('?_Xlength_error@std@@YAXPBD@Z', 1065356), ('?sputn@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@QAE_JPB_W_J@Z', 1065364), ('?sputc@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@QAEG_W@Z', 1065372), ('??0?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@IAE@XZ', 1065380), ('?_Osfx@?$basic_ostream@_WU?$char_traits@_W@std@@@std@@QAEXXZ', 1065388), ('?flush@?$basic_ostream@_WU?$char_traits@_W@std@@@std@@QAEAAV12@XZ', 1065396), ('?setstate@?$basic_ios@_WU?$char_traits@_W@std@@@std@@QAEXH_N@Z', 1065404), ('??0?$basic_ios@_WU?$char_traits@_W@std@@@std@@IAE@XZ', 1065412), ('??0?$basic_iostream@_WU?$char_traits@_W@std@@@std@@QAE@PAV?$basic_streambuf@_WU?$char_traits@_W@std@@@1@@Z', 1065420), ('??1?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@UAE@XZ', 1065428), ('?_Lock@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@UAEXXZ', 1065436), ('?_Unlock@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@UAEXXZ', 1065444), ('?showmanyc@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAE_JXZ', 1065452), ('?uflow@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAEGXZ', 1065460), ('?xsgetn@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAE_JPA_W_J@Z', 1065468), ('?xsputn@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAE_JPB_W_J@Z', 1065476), ('?setbuf@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAEPAV12@PA_W_J@Z', 1065484), ('?sync@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAEHXZ', 1065492), ('?imbue@?$basic_streambuf@_WU?$char_traits@_W@std@@@std@@MAEXABVlocale@2@@Z', 1065500)]), ('VCRUNTIME140.dll#0', [('memcpy', 1064996), ('_except_handler4_common', 1065508), ('__current_exception_context', 1065516), ('__current_exception', 1065524), ('_CxxThrowException', 1065532), ('__std_terminate', 1065540), ('__std_exception_copy', 1065548), ('__std_exception_destroy', 1065556), ('__CxxFrameHandler3', 1065564), ('memset', 1065572), ('memmove', 1065580)]), ('api-ms-win-crt-runtime-l1-1-0.dll#0', [('_crt_atexit', 1065588), ('_controlfp_s', 1065596), ('_register_onexit_function', 1065604), ('_initialize_onexit_table', 1065612), ('_cexit', 1065620), ('_invalid_parameter_noinfo_noreturn', 1065628), ('_register_thread_local_exe_atexit_callback', 1065636), ('_exit', 1065644), ('exit', 1065004), ('_initterm_e', 1065652), ('_initterm', 1065660), ('_get_narrow_winmain_command_line', 1065668), ('_initialize_narrow_environment', 1065676), ('_configure_narrow_argv', 1065684), ('terminate', 1065692), ('_set_app_type', 1065700), ('_seh_filter_exe', 1065708), ('_c_exit', 1065716)]), ('api-ms-win-crt-heap-l1-1-0.dll#0', [('_set_new_mode', 1065724), ('free', 1065012), ('malloc', 1065732), ('_callnewh', 1065740)]), ('api-ms-win-crt-math-l1-1-0.dll#0', [('__setusermatherr', 1065020)]), ('api-ms-win-crt-stdio-l1-1-0.dll#0', [('_set_fmode', 1065028), ('__p__commode', 1065748)]), ('api-ms-win-crt-locale-l1-1-0.dll#0', [('_configthreadlocale', 1065036)])])
writing dllname KERNEL32.dll#0 to: 0xc0dc
patch_addr: 0xc220, 0xc23b, 0xc24c, 0xc25e, 0xc26c, 0xc28a, 0xc29d, 0xc2af, 0xc2c3, 0xc2d9, 0xc2f3, 0xc308, 0xc31e, 0xc338, 0xc354, 0xc367, 0xc37b
ptr_iat: 0x4000
writing dllname USER32.dll#0 to: 0xc0e9
patch_addr: 0xc3fa, 0xc40c, 0xc41d, 0xc42b, 0xc43c, 0xc44c, 0xc45a, 0xc46a, 0xc479, 0xc48b, 0xc49a, 0xc4a7, 0xc4ba, 0xc4cb, 0xc4de, 0xc4eb, 0xc4fc, 0xc50d, 0xc51f
ptr_iat: 0x40ac
writing dllname MSVCP140.dll#0 to: 0xc0f4
patch_addr: 0xc5a6, 0xc5c4, 0xc600, 0xc641, 0xc678, 0xc69a, 0xc6ba, 0xc702, 0xc745, 0xc782, 0xc7c1, 0xc805, 0xc846, 0xc87d, 0xc8ea, 0xc927, 0xc968, 0xc9ab, 0xc9f1, 0xca32, 0xca7b, 0xcac4, 0xcb11, 0xcb51
ptr_iat: 0x4048
writing dllname VCRUNTIME140.dll#0 to: 0xc101
patch_addr: 0xcbe2, 0xcbeb, 0xcc05, 0xcc23, 0xcc39, 0xcc4e, 0xcc60, 0xcc77, 0xcc91, 0xcca6, 0xccaf
ptr_iat: 0x40fc
writing dllname api-ms-win-crt-runtime-l1-1-0.dll#0 to: 0xc112
patch_addr: 0xcd19, 0xcd27, 0xcd36, 0xcd52, 0xcd6d, 0xcd76, 0xcd9b, 0xcdc8, 0xcdd0, 0xcdd7, 0xcde5, 0xcdf1, 0xce14, 0xce35, 0xce4e, 0xce5a, 0xce6a, 0xce7c
ptr_iat: 0x4150
writing dllname api-ms-win-crt-heap-l1-1-0.dll#0 to: 0xc134
patch_addr: 0xceae, 0xcebe, 0xcec5, 0xcece
ptr_iat: 0x412c
writing dllname api-ms-win-crt-math-l1-1-0.dll#0 to: 0xc153
patch_addr: 0xcef6
ptr_iat: 0x4148
writing dllname api-ms-win-crt-stdio-l1-1-0.dll#0 to: 0xc172
patch_addr: 0xcf29, 0xcf36
ptr_iat: 0x419c
writing dllname api-ms-win-crt-locale-l1-1-0.dll#0 to: 0xc192
patch_addr: 0xcf61
ptr_iat: 0x4140
Fixing sections
Size of raw data (.MPRESS1): 0x2a00, fixed: 0x8000
Size of raw data (.MPRESS2): 0x600, fixed: 0x1000
Size of raw data (.rsrc): 0x200, fixed: 0x10000
Set IAT-Directory to 0 (VA and Size)
RVA to import table: 0xc000
Totalsize:0x1a000, VirtualMemorySize:0x1a000, Allocated chunks: []
Fixing SizeOfImage...
Fixing Memory Protection of Sections
.MPRESS1
Fixing protections for: .MPRESS1 with (True, True, True)
.MPRESS2
Fixing protections for: .MPRESS2 with (True, True, True)
.rsrc
Fixing protections for: .rsrc with (False, True, True)
Fixing Checksum
Dumping state to ./unpacked_mpress.exe

Emulation of mpress.exe finished.
--- Saved to ./unpacked_mpress.exe ---
```

<p class="mb-3">We open the unpacked application in Ghidra and analyse it. Then go to <code>Windows &gt; Defined Strings</code> and search for the keyword 'license'. We select the result with the string value "License key verified.".</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/packers/packers_hackviser_image3.png" alt="Packers 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Assembly
                             u_License_key_verified._0040446c                XREF[1]:     FUN_00402bf0:00402cca (*)   
        0040446c 4c  00  69       unicode    u"License key verified."
                 00  63  00 
                 65  00  6e 
```

<p class="mb-3">Notice how the XREF references <code>FUN_00402bf0</code>. Double-clicking on it brings us to the function logic.</p>
<img src="/assets/hackinglabs/hackviser/reverseengineeringlabs/packers/packers_hackviser_image4.png" alt="Packers 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```C++
void FUN_00402bf0(HWND param_1,UINT param_2,WPARAM param_3,LONG *param_4)

{
  WCHAR WVar1;
  undefined4 *dwNewLong;
  WCHAR *pWVar2;
  uint uVar3;
  WCHAR *pWVar4;
  bool bVar5;
  undefined4 local_218;
  undefined8 local_214;
  WCHAR local_20c [258];
  uint local_8;
  
  local_8 = DAT_00406004 ^ (uint)&stack0xfffffffc;
  if (param_2 == 0x81) {
    dwNewLong = (undefined4 *)*param_4;
    SetWindowLongW(param_1,-0x15,(LONG)dwNewLong);
    dwNewLong[1] = param_1;
  }
  else {
    dwNewLong = (undefined4 *)GetWindowLongW(param_1,-0x15);
  }
  if (dwNewLong == (undefined4 *)0x0) {
LAB_00402d69:
    DefWindowProcW(param_1,param_2,param_3,(LPARAM)param_4);
    FUN_00402f3b(local_8 ^ (uint)&stack0xfffffffc);
    return;
  }
  if (param_2 == 2) {
    PostQuitMessage(0);
  }
  else {
    if (param_2 != 0x111) {
      param_1 = (HWND)dwNewLong[1];
      goto LAB_00402d69;
    }
    if ((short)param_3 == 2) {
      GetDlgItemTextW((HWND)dwNewLong[1],1,local_20c,0x100);
      pWVar4 = &DAT_0040441c;
      pWVar2 = local_20c;
      do {
        WVar1 = *pWVar2;
        bVar5 = (ushort)WVar1 < (ushort)*pWVar4;
        if (WVar1 != *pWVar4) {
LAB_00402cba:
          uVar3 = -(uint)bVar5 | 1;
          goto LAB_00402cbf;
        }
        if (WVar1 == L'\0') break;
        WVar1 = pWVar2[1];
        bVar5 = (ushort)WVar1 < (ushort)pWVar4[1];
        if (WVar1 != pWVar4[1]) goto LAB_00402cba;
        pWVar2 = pWVar2 + 2;
        pWVar4 = pWVar4 + 2;
      } while (WVar1 != L'\0');
      uVar3 = 0;
LAB_00402cbf:
      if (uVar3 != 0) {
        MessageBoxW((HWND)0x0,u_License_key_is_invalid._00404498,u_Error_004043b4,0x10);
        FUN_00402f3b(local_8 ^ (uint)&stack0xfffffffc);
        return;
      }
      MessageBoxW((HWND)0x0,u_License_key_verified._0040446c,u_Verified_00404458,0x40);
      SendMessageW((HWND)dwNewLong[1],0x10,0,0);
      local_218 = *dwNewLong;
      local_214 = 0;
      FUN_00401170(&local_218);
      FUN_00402f3b(local_8 ^ (uint)&stack0xfffffffc);
      return;
    }
  }
  FUN_00402f3b(local_8 ^ (uint)&stack0xfffffffc);
  return;
}
```

<p class="mb-3">The function acts as a standard Windows dialog procedure (<code>DlgProc</code>) that handles window messages, specifically intercepting the <code>WM_COMMAND</code> message (<code>0x111</code>) triggered by interacting with the user interface. When the validation button is pressed, the routine extracts the user's input from the text field using <code>GetDlgItemTextW</code> and passes it into an inline-optimized string comparison loop. The loop evaluates the input character-by-character against a hardcoded wide-character string starting at memory address <code>0x0040441c</code>, displaying a success message box and triggering final routines if a flawless match is found. When we click on <code>0x0040441c</code>, we are brought to the Listing shown below:</p>

```Assembly
                             DAT_0040441c                                    XREF[2]:     FUN_00402bf0:00402c89 (*) , 
                                                                                          FUN_00402bf0:00402c97 (R)   
        0040441c 59  00           undefine   0059h
                             DAT_0040441e                                    XREF[1]:     FUN_00402bf0:00402ca5 (R)   
        0040441e 49  00           undefine   0049h
                             u_ERD-VJC6O-W730L-P211E-VGOQK_00404420          XREF[1]:     FUN_00402bf0:00402c97 (R)   
        00404420 45  00  52       unicode    u"ERD-VJC6O-W730L-P211E-VGOQK"
                 00  44  00 
                 2d  00  56 
                             u_Verified_00404458                             XREF[1]:     FUN_00402bf0:00402cc5 (*)   
        00404458 56  00  65       unicode    u"Verified"
                 00  72  00 
                 69  00  66 
        0040446a 00              ??         00h
        0040446b 00              ??         00h
                             u_License_key_verified._0040446c                XREF[1]:     FUN_00402bf0:00402cca (*)   
        0040446c 4c  00  69       unicode    u"License key verified."
                 00  63  00 
                 65  00  6e 
                             u_License_key_is_invalid._00404498              XREF[1]:     FUN_00402bf0:00402d1f (*)   
        00404498 4c  00  69       unicode    u"License key is invalid."
                 00  63  00 
                 65  00  6e 
```

<p class="mb-3">Ghidra's automated analyzer failed to define the entire key as a single string because it only recognized a standard Unicode block starting at address <code>00404420</code>. However, static analysis of the cross-referenced verification loop revealed the pointer actually references address <code>0040441c</code>. By manually decoding the two "undefined" UTF-16LE wide characters directly preceding the recognized block (<code>59 00</code> for 'Y' and <code>49 00</code> for 'I'), the fragmented pieces concatenate perfectly to reveal the complete license key.</p>
<p class="mb-5"><strong>Answer:</strong> YIERD-VJC6O-W730L-P211E-VGOQK</p>
<br />


<h5 class="mb-2"><strong>3. Themida</strong></h5>
<p class="mb-3">This lab includes an application packaged with Themida.

To complete the lab, you need to unpack the application and access the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>4. UPX</strong></h5>
<p class="mb-3">This lab includes an application packaged with UPXi.

To complete the lab, you need to unpack the application and access the license key.

What is the license key?</p>
<p class="mb-3"><strong>Steps: </strong>.</p>
<p class="mb-5"><strong>Answer:</strong> </p>
<br />


<h5 class="mb-2"><strong>5. Pyarmor</strong></h5>
<p class="mb-3">This lab involves analyzing an application packaged with Pyarmor.

To complete the lab, you need to unpack the application and find the 29-character license key.

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
---
title: 'Network Analysis'
date: '2026-06-24'
excerpt: 'Practice Network Analysis in multiple lab exercises.'
prog: 'Hackviser Mobile Application Security Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/mobileapplicationsecurity_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Network Analysis</h1>
<div class="writeup-date">June 2026 · Mobile Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Network Analysis in multiple lab exercises.</p>


<h5 class="mb-2"><strong>1. SSL Pinning Bypass</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in Java where SSL pinning bypass technique can be practiced in android applications.

To complete the lab you need to analyze the application traffic.

What is the user-trace-id value?</p>
<p class="mb-3"><strong>Steps: </strong>We will be using JADX-GUI tool (with JRE) to solve this lab exercise. Once we open the apk file in JADX-GUI, in the left panel, we navigate to <code>Source code &gt; com &gt; selector.httplogin &gt; SendDataTask</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/networkanalysis/networkanalysis_hackviser_image1.png" alt="Network Analysis 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Java
public Integer doInBackground(String... strArr) {
    int responseCode = 0;
    String str = strArr[0];
    String str2 = strArr[1];
    try {
        HttpURLConnection httpURLConnection = (HttpURLConnection) new URL("https://hackviser.space/").openConnection();
        httpURLConnection.setRequestMethod("POST");
        try {
            String strDecrypt = BlowfishEncryption.Decrypt(BlowfishEncryption.HexStringToByteArray("d4384950b8dd0b962fe4471c824eda40af215ae3e08db3630683ac85cf6aab3b648371341818d310"), "ThisIsABlowfishKey");
            httpURLConnection.setDoOutput(true);
            httpURLConnection.setRequestProperty("Content-Type", "text/plain");
            httpURLConnection.setRequestProperty("user-trace-id", strDecrypt);
            httpURLConnection.setRequestProperty("Authorization", "Basic " + encodeCredentials(str, str2));
            BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(httpURLConnection.getOutputStream());
            bufferedOutputStream.flush();
            bufferedOutputStream.close();
            responseCode = httpURLConnection.getResponseCode();
            Log.d(TAG, "Response Code: " + responseCode);
            httpURLConnection.disconnect();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    } catch (Exception e2) {
        Log.e(TAG, "Error: " + e2.getMessage());
    }
    return Integer.valueOf(responseCode);
}
```

<p class="mb-3">This code executes an asynchronous network request that sends a POST request containing Base64-encoded user credentials to <code>https://hackviser.space/</code>. Notably, it includes a <code>user-trace-id</code> HTTP header, whose value is dynamically derived by decrypting a hardcoded hex string using the Blowfish algorithm and the key <code>"ThisIsABlowfishKey"</code>. We can obtain the user-trace-id value using the Python script below:</p>

```Python
from Crypto.Cipher import Blowfish
from Crypto.Util.Padding import unpad

# Given values from Jadx
hex_data = "d4384950b8dd0b962fe4471c824eda40af215ae3e08db3630683ac85cf6aab3b648371341818d310"
key = b"ThisIsABlowfishKey"

# Convert Hex to Bytes
ciphertext = bytes.fromhex(hex_data)

# Decrypt using Blowfish ECB mode (standard Java default when not specified)
cipher = Blowfish.new(key, Blowfish.MODE_ECB)
decrypted_padded = cipher.decrypt(ciphertext)

# Remove PKCS7 padding (standard Java default)
try:
    decrypted = unpad(decrypted_padded, Blowfish.block_size)
    print(f"User-Trace-ID: {decrypted.decode('utf-8')}")
except Exception as e:
    # If standard padding fails, print the raw output to inspect
    print(f"Raw Decrypted: {decrypted_padded}")
```

<p class="mb-5"><strong>Answer:</strong> 803d8a51d83d810ca4254e4b54d0a52a</p>
<br />


<h5 class="mb-2"><strong>2. HTTP Traffic Analysis</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in Java.

To complete the lab you need to analyze HTTP requests.

What is user-trace-id?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI, in the left panel, we navigate to <code>Source code &gt; com &gt; selector.httplogin &gt; SendDataTask</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/networkanalysis/networkanalysis_hackviser_image2.png" alt="Network Analysis 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Java
public Integer doInBackground(String... strArr) {
    int responseCode = 0;
    String str = strArr[0];
    String str2 = strArr[1];
    try {
        HttpURLConnection httpURLConnection = (HttpURLConnection) new URL("http://hackviser.space/").openConnection();
        httpURLConnection.setRequestMethod("POST");
        try {
            String strDecrypt = BlowfishEncryption.Decrypt(BlowfishEncryption.HexStringToByteArray("e27045e453c5891e7bc075e782d048eb557fffc158effc26687b67d021c06cab648371341818d310"), "ThisIsABlowfishKey");
            httpURLConnection.setDoOutput(true);
            httpURLConnection.setRequestProperty("Content-Type", "text/plain");
            httpURLConnection.setRequestProperty("user-trace-id", strDecrypt);
            httpURLConnection.setRequestProperty("Authorization", "Basic " + encodeCredentials(str, str2));
            BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(httpURLConnection.getOutputStream());
            bufferedOutputStream.flush();
            bufferedOutputStream.close();
            responseCode = httpURLConnection.getResponseCode();
            Log.d(TAG, "Response Code: " + responseCode);
            httpURLConnection.disconnect();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    } catch (Exception e2) {
        Log.e(TAG, "Error: " + e2.getMessage());
    }
    return Integer.valueOf(responseCode);
}
```

<p class="mb-3">This code executes an asynchronous background task that transmits user credentials via an unencrypted HTTP POST request to <code>http://hackviser.space/</code>. It explicitly includes a custom <code>user-trace-id</code> request header, which is dynamically populated by decrypting an obfuscated hexadecimal string using the Blowfish encryption algorithm and a static key. We can obtain the user-trace-id value using the Python script below:</p>


```Python
from Crypto.Cipher import Blowfish
from Crypto.Util.Padding import unpad

hex_data = "e27045e453c5891e7bc075e782d048eb557fffc158effc26687b67d021c06cab648371341818d310"
key = b"ThisIsABlowfishKey"

ciphertext = bytes.fromhex(hex_data)
cipher = Blowfish.new(key, Blowfish.MODE_ECB)
decrypted_padded = cipher.decrypt(ciphertext)

try:
    decrypted = unpad(decrypted_padded, Blowfish.block_size)
    print(f"User-Trace-ID: {decrypted.decode('utf-8')}")
except Exception as e:
    print(f"Raw Decrypted: {decrypted_padded}")
```

<p class="mb-5"><strong>Answer:</strong> 5c3ef68b32cabd4c739dba9a5746a5e3</p>
<br />


<h5 class="mb-2"><strong>3. Response Code Manipulation</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in Java.

The HTTP response needs to be modified to complete the lab.

What is the app version?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI, in the left panel, we navigate to <code>Source code &gt; com &gt; selector.responsecode &gt; ChatApp</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/networkanalysis/networkanalysis_hackviser_image3.png" alt="Network Analysis 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We can directly see the app version in plaintext string.</p>
<p class="mb-5"><strong>Answer:</strong> V1.2021.10</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
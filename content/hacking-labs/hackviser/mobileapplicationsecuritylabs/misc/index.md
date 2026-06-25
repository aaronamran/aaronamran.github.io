---
title: 'Misc'
date: '2026-06-22'
excerpt: 'Practice Misc in multiple lab exercises.'
prog: 'Hackviser Mobile Application Security Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/mobileapplicationsecurity_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Misc</h1>
<div class="writeup-date">June 2026 · Mobile Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Misc in multiple lab exercises.</p>


<h5 class="mb-2"><strong>1. File Access</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in Java.

To complete the lab you need to analyze the files generated in the application.

What is User-ID?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI, in the left panel, we navigate to <code>Source code &gt; com &gt; selector.savedfile &gt; AESforTask</code> and also <code>Task</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/misc/misc_hackviser_image1.png" alt="Misc 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/misc/misc_hackviser_image2.png" alt="Misc 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Java
public String AESkey() {
    return AESforTask.DecryptAES("B+miPN+WUXhZUvZtMUOElzJTdDidITUA/ZJ5P/uWrEW/P02HoUMNYZi2uh1qLhGJ", "0123456789abcdef".getBytes(), "1234567890abcdef".getBytes());
}
```

<p class="mb-3">We can see the hardcoded ciphertext found in the <code>AESkey()</code> method. Based on the file <code>AESforTask</code>, it showed us that the app specifies AES, used CBC mode and PKCS5Padding. The final output is encoded in Base64. To obtain the user ID, we can use the following Python script:</p>

```Python
import base64
from crypto.Cipher import AES
from crypto.Util.Padding import unpad

# Data extracted from the Java source code
ciphertext_b64 = "B+miPN+WUXhZUvZtMUOElzJTdDidITUA/ZJ5P/uWrEW/P02HoUMNYZi2uh1qLhGJ"
key = b"0123456789abcdef"
iv = b"1234567890abcdef"

try:
    # 1. Decode the Base64 ciphertext
    ciphertext = base64.b64decode(ciphertext_b64)
    
    # 2. Initialize AES cipher in CBC mode
    cipher = AES.new(key, AES.MODE_CBC, iv)
    
    # 3. Decrypt and remove PKCS7/PKCS5 padding
    decrypted_bytes = unpad(cipher.decrypt(ciphertext), AES.block_size)
    
    # 4. Decode bytes to string
    decrypted_text = decrypted_bytes.decode('utf-8')
    
    print(f"Decrypted Result: {decrypted_text}")

except Exception as e:
    print(f"Error during decryption: {e}")
```

<p class="mb-5"><strong>Answer:</strong> 5226f07de074497a980bbd4118220d37</p>
<br />


<h5 class="mb-2"><strong>2. GPS</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in Java that works on data based on hardware accesses.

To complete the lab you need to manipulate the location information of the application.

What is the UserID?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI, in the left panel, we navigate to <code>Source code &gt; com &gt; selector.locateme &gt; AESforGPS</code> and also <code>App</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/misc/misc_hackviser_image3.png" alt="Misc 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/misc/misc_hackviser_image4.png" alt="Misc 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Java
this.UserID.setText("UserID : " + AESforGPS.DecryptAES("Hx2xWh8zXOOxP8TO3/l2fQ==", "0123456789abcdef".getBytes(), "1234567890abcdef".getBytes()));
```

<p class="mb-3">The application is decrypting the UserID dynamically during the <code>onCreate</code> method and setting it to a TextView layout element as seen in the code excerpt above. To obtain the UserID, we can use the following Python script:</p>

```Python
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

# Data extracted from the App.java onCreate method
ciphertext_b64 = "Hx2xWh8zXOOxP8TO3/l2fQ=="
key = b"0123456789abcdef"
iv = b"1234567890abcdef"

try:
    # 1. Decode the Base64 ciphertext
    ciphertext = base64.b64decode(ciphertext_b64)
    
    # 2. Initialize AES cipher in CBC mode
    cipher = AES.new(key, AES.MODE_CBC, iv)
    
    # 3. Decrypt and remove PKCS7/PKCS5 padding
    decrypted_bytes = unpad(cipher.decrypt(ciphertext), AES.block_size)
    
    # 4. Decode bytes to string
    decrypted_text = decrypted_bytes.decode('utf-8')
    
    print(f"Decrypted UserID: {decrypted_text}")

except Exception as e:
    print(f"Error during decryption: {e}")
```

<p class="mb-5"><strong>Answer:</strong> 195452265</p>
<br />


<h5 class="mb-2"><strong>3. Manifest</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in Java.

To complete the lab you need to analyze the manifest file.

What is the package name of the application?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI and navigate to <code>Resources &gt; AndroidManifest.xml</code> file. Then we search for the line of code containing <code>package="com.hackviser.agendaace"</code>.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/misc/misc_hackviser_image5.png" alt="Misc 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> com.hackviser.agendaace</p>
<br />


<h5 class="mb-2"><strong>4. String Access</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in Java.

To complete the lab you need to analyze string expressions that are insecurely stored in the application.

What is the password?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI, in the left panel, we navigate to <code>Source code &gt; com &gt; selector.strcmp &gt; LoginActivity</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/misc/misc_hackviser_image6.png" alt="Misc 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Look closely at the code snippet below and focus on <code>getString(R.string.app_password)</code>:</p>

```Java
if (this.editTextPassword.getText().toString().equals(new String(Base64.decode(getString(R.string.app_password), 16)))) {
    Toast.makeText(this, "Login successful!", 0).show();
    startActivity(new Intent(this, (Class<?>) MainActivity.class));
    finish();
    return;
}
```

<p class="mb-3">In Android development, strings are typically not written directly in the Java/Kotlin files. They are stored in an XML file called <code>strings.xml</code>. <code>R.string.app_password</code> is just a resource pointer (an integer ID). At runtime, <code>getString()</code> goes to the resources and fetches the actual value mapped to that ID. We now need to look at the decompiled resources of the APK rather than just the Java source code. In the left panel, we navigate to <code>Resources &gt; resources.arsc &gt; res &gt; values &gt; strings.xml</code> to read the code and search for <code>&lt;string name=&quot;app_password&quot;&gt;base64_string&lt;/string&gt;</code>.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/misc/misc_hackviser_image7.png" alt="Misc 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Running it in the terminal as the following gives us the password.</p>

```Bash
user@linux:~$ echo -n "YzFiZDkxNDQ=" | base64 -d
c1bd9144
```

<p class="mb-5"><strong>Answer:</strong> c1bd9144</p>
<br />


<h5 class="mb-2"><strong>5. Smali</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in Java.

To complete the lab, you need to patch the smali codes by modifying them.

What is the app version?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI, in the left panel, we navigate to <code>Source code &gt; com &gt; selector.smalipathcer &gt; AESforSmali</code> and <code>App</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/misc/misc_hackviser_image8.png" alt="Misc 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/misc/misc_hackviser_image9.png" alt="Misc 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Notice the application also uses AES cipher, CBC and PKCS5Padding. In <code>App</code>, the specific line of code below gives us a clue:</p>

```Java
this.UserID.setText("App Version : " + AESforSmali.DecryptAES("oXN/MHCAqVh36GmFz/dYKA==", "0123456789abcdef".getBytes(), "1234567890abcdef".getBytes()));
```

<p class="mb-3">It contains the exact ciphertext needed to get the app version. We use the Python script below to obtain it:</p>

```Python
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

# Data extracted from the App.java onCreate method
ciphertext_b64 = "oXN/MHCAqVh36GmFz/dYKA=="
key = b"0123456789abcdef"
iv = b"1234567890abcdef"

try:
    # 1. Decode the Base64 ciphertext
    ciphertext = base64.b64decode(ciphertext_b64)
    
    # 2. Initialize AES cipher in CBC mode
    cipher = AES.new(key, AES.MODE_CBC, iv)
    
    # 3. Decrypt and remove PKCS7/PKCS5 padding
    decrypted_bytes = unpad(cipher.decrypt(ciphertext), AES.block_size)
    
    # 4. Decode bytes to string
    decrypted_text = decrypted_bytes.decode('utf-8')
    
    print(f"Decrypted App Version: {decrypted_text}")

except Exception as e:
    print(f"Error during decryption: {e}")
```

<p class="mb-5"><strong>Answer:</strong> 526d250e07</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
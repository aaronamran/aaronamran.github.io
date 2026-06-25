---
title: 'Insecure Data Storage'
date: '2026-06-25'
excerpt: 'Practice Insecure Data Storage in multiple lab exercises.'
prog: 'Hackviser Mobile Application Security Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/mobileapplicationsecurity_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Insecure Data Storage</h1>
<div class="writeup-date">June 2026 · Mobile Application Security Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Insecure Data Storage in multiple lab exercises.</p>


<h5 class="mb-2"><strong>1. Authentication Bypass</strong></h5>
<p class="mb-3">This lab contains a mobile application developed in java that requires analyzing and bypassing authentication methods used in android applications.

To complete the lab you need to analyze the database of the application.

What is the Login ID value?</p>
<p class="mb-3"><strong>Steps: </strong> We will be using JADX-GUI tool (with JRE) to solve this lab exercise. Once we open the apk file in JADX-GUI, in the left panel, we navigate to <code>Source code &gt; com &gt; selector.checkdb &gt; ChatApp</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/insecuredatastorage/insecuredatastorage_hackviser_image1.png" alt="Insecure Data Storage 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Notice the code snippet below which is literally hardcoding a cipher text string and decrypting it locally to display the very first message in the chat view.</p>

```Java
if (this.isfirst) {
    sendMessage(AESforDB.DecryptAES("pCFdXlNcKQ91QRMDQfAQfKPZ0BoaZHM42pLHBbHWz+p+Jju/lTD6tePglxmS5ZmV", "0123456789abcdef".getBytes(), "1234567890abcdef".getBytes()));
    this.isfirst = false;
}
```

<p class="mb-3">To obtain the login ID value using a Python script, we first need to ensure pycryptodome library is installed by using <code>pip install pycryptodome</code>. Then we run the Python script below:</p>

```Python
from Crypto.Cipher import AES
import base64

ciphertext = base64.b64decode("pCFdXlNcKQ91QRMDQfAQfKPZ0BoaZHM42pLHBbHWz+p+Jju/lTD6tePglxmS5ZmV")
key = b"0123456789abcdef"
iv = b"1234567890abcdef"

cipher = AES.new(key, AES.MODE_CBC, iv)
decrypted = cipher.decrypt(ciphertext)

# Strip out standard PKCS#7 padding if present
print(decrypted.decode('utf-8', errors='ignore').strip())
```

<p class="mb-5"><strong>Answer:</strong> a405ec6c9faf9123bf9ac1a2c259d59d</p>
<br />


<h5 class="mb-2"><strong>2. Secret Chat</strong></h5>
<p class="mb-3">This lab includes a mobile application developed with java that also accidentally logs sensitive data.

To complete the lab you need to analyze the logs.

What is Session ID?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file again in JADX-GUI. In the left panel, we navigate to <code>Source code &gt; com &gt; selector.loginapp &gt; MainActivity</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/insecuredatastorage/insecuredatastorage_hackviser_image2.png" alt="Insecure Data Storage 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Java
public void onClick(View view) {
    String string = textView.getText().toString();
    Log.d(MainActivity.TAG, "Daily attemp number :" + (((int) (Math.random() * 1000.0d)) + 1));
    Log.d(MainActivity.TAG, "Session ID is :" + LoginAppAes.DecryptAES("k/ar5urlyHajpEidXTv1xU0yVUpyNeZ2Pzt7GE/VNO435gT698R264jc971B1TT4", "0123456789abcdef".getBytes(), "1234567890abcdef".getBytes()));
    Log.d(MainActivity.TAG, (((int) (Math.random() * 100.0d)) + 1) + "th User");
    MainActivity.this.openchat(string);
}
```

<p class="mb-3">In this code, the application uses Android's debugging utility (<code>Log.d</code>) to print a sensitive, dynamically decrypted AES ciphertext containing the user's Session ID directly into the system logs at runtime. Since these logs are universally readable on the device via tools like Android Debug Bridge (<code>logcat</code>), this implementation exposes critical session tokens to any unauthorized application or user with log access, creating an Insecure Data Storage vulnerability. We can then obtain the session ID by using the Python script below:</p>

```Python
from Crypto.Cipher import AES
import base64

# New ciphertext from the Log.d statement
ciphertext = base64.b64decode("k/ar5urlyHajpEidXTv1xU0yVUpyNeZ2Pzt7GE/VNO435gT698R264jc971B1TT4")
key = b"0123456789abcdef"
iv = b"1234567890abcdef"

cipher = AES.new(key, AES.MODE_CBC, iv)
decrypted = cipher.decrypt(ciphertext)

print(decrypted.decode('utf-8', errors='ignore').strip())
```

<p class="mb-5"><strong>Answer:</strong> 5cc20e3debe0d7d26bd70ba19a80ec5a</p>
<br />


<h5 class="mb-2"><strong>3. Activity Access</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in java that contains unused function and class structures.

To complete the lab, you will need to examine the unused function and class structures.

What is Admin ID?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI. In the left panel, we navigate to <code>Source code &gt; com &gt; selector.activity_access &gt; Admin</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/insecuredatastorage/insecuredatastorage_hackviser_image3.png" alt="Insecure Data Storage 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Java
protected void onCreate(Bundle bundle) {
    super.onCreate(bundle);
    setContentView(R.layout.admin_activity);
    this.adminIdTextView = (TextView) findViewById(R.id.adminIdTextView);
    this.peopleListView = (ListView) findViewById(R.id.peopleListView);
    try {
        this.adminIdTextView.setText("Admin ID: " + BlowfishEncryption.Decrypt(BlowfishEncryption.HexStringToByteArray("45f34360e8d3b3677e317c503a5966920eaa43aeb1bc2db82410535fd600f8ed"), "ThisIsABlowfishKey"));
        this.peopleListView.setAdapter((ListAdapter) new ArrayAdapter(this, android.R.layout.simple_list_item_1, generateRandomCredentials(20)));
    } catch (Exception e) {
        throw new RuntimeException(e);
    }
}
```

<p class="mb-3">This implementation contains a dead code vulnerability where an unlinked but fully functional "Admin" activity remains compiled within the production application package. Because the class statically exposes a hardcoded Blowfish encryption key and its corresponding hex ciphertext, a reverse engineer can easily reconstruct the sensitive Admin ID without needing access to a legitimate administrator account. To obtain the admin ID, we use the Python script below:</p>

```Python
from Crypto.Cipher import Blowfish
import binascii

# Convert the hex ciphertext back into raw bytes
ciphertext = binascii.unhexlify("45f34360e8d3b3677e317c503a5966920eaa43aeb1bc2db82410535fd600f8ed")
key = b"ThisIsABlowfishKey"

# Initialize Blowfish cipher. Android crypto utilities typically default to ECB mode if not specified.
cipher = Blowfish.new(key, Blowfish.MODE_ECB)
decrypted = cipher.decrypt(ciphertext)

# Print the decrypted plaintext, stripping any padding
print(decrypted.decode('utf-8', errors='ignore').strip())
```

<p class="mb-5"><strong>Answer:</strong> d24d9d07ac452e146193cz4e3</p>
<br />


<h5 class="mb-2"><strong>4. Shared Preferences</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in java that contains a shared preferences file with important data.

To complete the lab, you need to examine the shared preferences file.

What is Session ID?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI. In the left panel, we navigate to <code>Source code &gt; com &gt; selector.splogin &gt; LoginActivity</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/insecuredatastorage/insecuredatastorage_hackviser_image4.png" alt="Insecure Data Storage 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Java
public void login() {
    String strDecryptAES = AESforSP.DecryptAES("hUQ9g2rfg4N4UqqJYNINf+mdTSa7m+xA+G4dFet5Pk16YHCRyNt4J5k1oKHBEnbb", "0123456789abcdef".getBytes(), "1234567890abcdef".getBytes());
    SharedPreferences.Editor editorEdit = this.sharedPreferences.edit();
    editorEdit.putString(HASH_KEY, strDecryptAES);
    editorEdit.putBoolean(IS_ADMIN, false);
    editorEdit.apply();
    openMainActivity();
}
```

<p class="mb-3">This implementation illustrates an insecure data storage vulnerability where a decrypted, sensitive session token is committed directly to an unencrypted SharedPreferences XML configuration file. Because standard SharedPreferences storage relies on plain-text serialization within the application sandbox, any adversary or local exploit with read access to the application's data directory can easily extract the static token. To obtain the session ID, we use the Python script below:</p>

```Python
from Crypto.Cipher import AES
import base64

ciphertext = base64.b64decode("hUQ9g2rfg4N4UqqJYNINf+mdTSa7m+xA+G4dFet5Pk16YHCRyNt4J5k1oKHBEnbb")
key = b"0123456789abcdef"
iv = b"1234567890abcdef"

cipher = AES.new(key, AES.MODE_CBC, iv)
decrypted = cipher.decrypt(ciphertext)

print(decrypted.decode('utf-8', errors='ignore').strip())
```

<p class="mb-5"><strong>Answer:</strong> c92a088e285d1d9b756f0686d162ee22</p>
<br />


<h5 class="mb-2"><strong>5. Memory Analysis</strong></h5>
<p class="mb-3">This lab includes a mobile application developed in java.

To complete the lab you need to perform memory analysis.

What is UserID?</p>
<p class="mb-3"><strong>Steps: </strong>We open the apk file in JADX-GUI. In the left panel, we navigate to <code>Source code &gt; com &gt; selector.memorydump &gt; MainActivity</code> to read the code.</p>
<img src="/assets/hackinglabs/hackviser/mobileapplicationsecuritylabs/insecuredatastorage/insecuredatastorage_hackviser_image5.png" alt="Insecure Data Storage 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

```Java
protected void onCreate(Bundle bundle) {
    super.onCreate(bundle);
    setContentView(R.layout.activity_main);
    this.editTextTask = (EditText) findViewById(R.id.editTextTask);
    this.listViewTasks = (ListView) findViewById(R.id.listViewTasks);
    this.taskList = new ArrayList<>();
    TaskAdapter taskAdapter = new TaskAdapter(this, this.taskList);
    this.adapter = taskAdapter;
    this.listViewTasks.setAdapter((ListAdapter) taskAdapter);
    this.UserID = new ArrayList<>();
    addDataToMemory("UserID : " + Decode.DecryptAES("sxxxB4Ug0J4lWx6y/NOjOd8t2HgYVOtGHACiEQ7Bsc6wE0jgHG29xzIE8XNcxJ5k", "0123456789abcdef".getBytes(), "1234567890abcdef".getBytes()));
}
```

<p class="mb-3">The vulnerability stems from storing a dynamically decrypted, sensitive UserID string directly inside an in-memory ArrayList collection (<code>this.UserID</code>) for the lifecycle of the activity. Because the sensitive token remains unencrypted in the application's runtime heap memory, an attacker or forensic tool can easily extract it by performing a standard process memory dump. We can use the Python script below to obtain the userID.</p>

```Python
from Crypto.Cipher import AES
import base64

# Ciphertext extracted from the addDataToMemory initialization block
ciphertext = base64.b64decode("sxxxB4Ug0J4lWx6y/NOjOd8t2HgYVOtGHACiEQ7Bsc6wE0jgHG29xzIE8XNcxJ5k")
key = b"0123456789abcdef"
iv = b"1234567890abcdef"

cipher = AES.new(key, AES.MODE_CBC, iv)
decrypted = cipher.decrypt(ciphertext)

# Display the decrypted plaintext UserID
print(decrypted.decode('utf-8', errors='ignore').strip())
```

<p class="mb-5"><strong>Answer:</strong> f4d430e25894c9cab4884751ca63bd1a</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
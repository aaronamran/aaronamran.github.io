---
title: 'Network Analysis'
date: '2026-06-15'
excerpt: 'Practice Network Analysis in multiple lab exercises.'
prog: 'Hackviser Digital Forensics Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Network Analysis</h1>
<div class="writeup-date">June 2026 · Digital Forensics Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Network Analysis in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Telnet Authentication</strong></h5>
<p class="mb-3">This lab contains the network packets recorded during login via the Telnet service.

To complete the lab, analyze the packets sent through the Telnet service and find the password of the "root" user.

What is the password of the "root" user on the server logged on with Telnet?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image1.png" alt="Network Analysis 1" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We filter for the keyword <code>telnet</code> and right click on any packets, then hover over <code>Follow</code> and click on <code>TCP Stream</code>.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image2.png" alt="Network Analysis 2" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">This reveals the password of the root user.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image3.png" alt="Network Analysis 3" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> mypassw0rd123</p>
<br />


<h5 class="mb-2"><strong>2. FTP Authentication</strong></h5>
<p class="mb-3">This lab contains the network packets recorded during login via the FTP service.

To complete the lab, analyze the packets sent through the FTP service and find the password of the "root" user.

What is the password of the "root" user on the server logged on with FTP?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image4.png" alt="Network Analysis 4" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We filter for the keyword <code>ftp</code> and the password can directly be seen in one of the packets.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image5.png" alt="Network Analysis 5" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> r0ckyou</p>
<br />


<h5 class="mb-2"><strong>3. HTTP Authentication</strong></h5>
<p class="mb-3">This lab contains network packets recorded during a website login over HTTP(Hyper-Text Transfer Protocol). Communication over the HTTP protocol can be read as clear-text.

To complete the lab, analyze the HTTP traffic and find the password of the "root" user.

What is the password for user "johndoe" logged in to HVBank?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image6.png" alt="Network Analysis 6" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We filter for the keyword <code>http</code> and the following packets gives us the clues needed. When we check for the first HTTP POST request, we can see the password <code>john1234</code>.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image7.png" alt="Network Analysis 7" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We then check the subsequent HTTP response. Apparently the password is wrong, because it says 'Wrong username or password'.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image8.png" alt="Network Analysis 8" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Next, we check the second HTTP POST request. We now see the password <code>John1234!</code>.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image9.png" alt="Network Analysis 9" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Checking the HTTP response proves that the login credentials are valid.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image10.png" alt="Network Analysis 10" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> John1234!</p>
<br />


<h5 class="mb-2"><strong>4. SMTP Packet Analysis</strong></h5>
<p class="mb-3">This lab contains network packets recorded during an e-mail transmission over SMTP(Simple Mail Transfer Protocol). The content and headers of the e-mail sent via the SMTP protocol can be read unencrypted by network analysis.

To complete the lab, analyze the SMTP traffic and find the new password of the user named "Robert".

What is Robert's new password?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image11.png" alt="Network Analysis 11" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Looking carefully at the packets reveals one of the packets containing the keyword <code>password</code>. Upon further inspection, we notice the new password given to Robert.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image12.png" alt="Network Analysis 12" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> z2u7stE1vKS</p>
<br />


<h5 class="mb-2"><strong>5. HTTP File Extraction</strong></h5>
<p class="mb-3">This lab contains network packets recorded while downloading files over HTTP (Hyper-Text Transfer Protocol).

To complete the lab unzip the ZIP file downloaded from "mywebsite.hv" and find the password inside.

What is the password inside the ZIP file downloaded from mywebsite.hv ?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image13.png" alt="Network Analysis 13" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Looking carefully at the packets reveals packet no. 13 containing the keyword <code>application/zip</code>.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image14.png" alt="Network Analysis 14" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To view the password of the ZIP file, we right click on packet no. 13, then hover over <code>Follow</code> and click on <code>TCP Stream</code>.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image15.png" alt="Network Analysis 15" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Cx689iO7Fu4G</p>
<br />


<h5 class="mb-2"><strong>6. Reverse Shell Analysis</strong></h5>
<p class="mb-3">This lab contains network packets recorded by the attacker sending commands to the victim user using the reverse shell method.

To complete the lab, analyze the traffic between the reverse shell listening on port 1337 and the victim and find the new password of the "root" user that the attacker changed.

What is the new password of the "root" user?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image16.png" alt="Network Analysis 16" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We apply the display filter <code>tcp.port == 1337</code>, we right click on packet no. 28, then hover over <code>Follow</code> and click on <code>TCP Stream</code>.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image17.png" alt="Network Analysis 17" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">The TCP Stream window will open up, displaying the new password of the root user.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image18.png" alt="Network Analysis 18" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> own3dbyhacker</p>
<br />


<h5 class="mb-2"><strong>7. VoIP Packet Analysis</strong></h5>
<p class="mb-3">This lab contains network packets recorded during a phone call made over the VoIP service. To complete the lab, analyze the packets sent over the VoIP service and find the secret password in the conversation.

What is the secret password in the phone call made over VoIP?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded. Click on <code>Telephony</code> in the top menu bar and select <code>VoIP Calls</code>.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image19.png" alt="Network Analysis 19" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">A new window will open up. Click on the detected call to highlight it. Then we click on the <code>Play Streams</code> button at the bottom.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image20.png" alt="Network Analysis 20" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Wireshark RTP Player will open up. We click on the play button at the bottom left, and the phone call will start playing over our speakers/headphones.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image21.png" alt="Network Analysis 21" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 9307</p>
<br />


<h5 class="mb-2"><strong>8. USB HID Data Extraction</strong></h5>
<p class="mb-3">This lab contains hardware packets recorded during data entry via a USB keyboard device. Keystrokes sent using the USB HID (Human Interface Device) protocol can be reconstructed using forensic analysis methods.

To complete the lab, analyze the USB traffic and find the new password for the user named "Robert".

What is Robert's new password?</p>
<p class="mb-3"><strong>Steps: </strong>First we need to ensure we have tshark installed in our Linux machine.</p>

```bash
sudo apt update && sudo apt install -y tshark
```

<p class="mb-3">Run the following command to extract data only from the specific keyboard device stream, strip out any bulk trash, and format it nicely as a text file.</p>

```bash
tshark -r usb_hib_data_extraction.pcap -Y "usb.src == \"1.3.1\" && usb.capdata" -T fields -e usb.capdata | awk 'length($0) == 16' > clean_keyboard.txt
```

<p class="mb-3">This is how <code>clean_keyboard.txt</code> will look like:</p>

```txt
0000110000000000
0000000000000000
0000080000000000
0000000000000000
0000170000000000
0000000000000000
00002c0000000000
0000000000000000
0000180000000000
0000000000000000
0000160000000000
0000000000000000
0000080000000000
0000000000000000
0000150000000000
0000000000000000
00002c0000000000
0000000000000000
0200150000000000
0000000000000000
0000120000000000
0000000000000000
0000050000000000
0000000000000000
0000080000000000
0000000000000000
0000150000000000
0000000000000000
0000170000000000
0000000000000000
00002c0000000000
0000000000000000
0200150000000000
0000000000000000
0000120000000000
0000000000000000
0000050000000000
0000000000000000
0000080000000000
0000000000000000
0000150000000000
0000000000000000
0000170000000000
0000000000000000
0200160000000000
0000000000000000
0000080000000000
0000000000000000
0000060000000000
0000000000000000
0200130000000000
0000000000000000
0000040000000000
0000000000000000
0000160000000000
0000000000000000
0000160000000000
0000000000000000
00001e0000000000
0000000000000000
00001e0000000000
0000000000000000
00001e0000000000
0000000000000000
02001e0000000000
0000000000000000
0000280000000000
0000000000000000
```

<p class="mb-3">Here is a quick Python script. It maps the standard HID scan codes and accounts for the <code>02</code> modifier (Shift key) and <code>2a</code> (Backspace).</p>

```python
import sys

# Standard USB HID Keyboard Mapping
hid_table = {
    0x04:['a','A'], 0x05:['b','B'], 0x06:['c','C'], 0x07:['d','D'], 0x08:['e','E'], 
    0x09:['f','F'], 0x0a:['g','G'], 0x0b:['h','H'], 0x0c:['i','I'], 0x0d:['j','J'], 
    0x0e:['k','K'], 0x0f:['l','L'], 0x10:['m','M'], 0x11:['n','N'], 0x12:['o','O'], 
    0x13:['p','P'], 0x14:['q','Q'], 0x15:['r','R'], 0x16:['s','S'], 0x17:['t','T'], 
    0x18:['u','U'], 0x19:['v','V'], 0x1a:['w','W'], 0x1b:['x','X'], 0x1c:['y','Y'], 
    0x1d:['z','Z'], 0x1e:['1','!'], 0x1f:['2','@'], 0x20:['3','#'], 0x21:['4','$'], 
    0x22:['5','%'], 0x23:['6','^'], 0x24:['7','&'], 0x25:['8','*'], 0x26:['9','('], 
    0x27:['0',')'], 0x2b:['\t','\t'], 0x2c:[' ',' '], 0x2d:['-','_'], 0x2e:['=','+'], 
    0x2f:['[','{'], 0x30:[']','}'], 0x31:['\\','|'], 0x33:[';',':'], 0x34:['\'','"'], 
    0x36:[',','<'], 0x37:['.','>'], 0x38:['/','?']
}

output = []
last_key = 0

with open("clean_keyboard.txt", "r") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        bytes_data = bytes.fromhex(line)
        if len(bytes_data) < 8:
            continue
            
        modifier = bytes_data[0]
        key = bytes_data[2] # 3rd byte holds the active keycode
        
        if key == 0:
            last_key = 0
            continue
            
        if key == last_key:
            continue
        last_key = key
        
        if key == 0x2a: # Backspace
            if output:
                output.pop()
            continue
            
        if key == 0x28: # Enter
            output.append("\n")
            continue

        if key in hid_table:
            shift = 1 if (modifier & 0x22) else 0
            output.append(hid_table[key][shift])

print("Decoded Keystrokes:")
print("".join(output))
```

<p class="mb-3">The following is how the output will look like when we run <code>python3 parse_usb.py</code>.</p>

```bash
user@linux:~$ python3 parse_usb.py
Decoded Keystrokes:
net user Robert RobertSecPass111!
```

<p class="mb-5"><strong>Answer:</strong> RobertSecPass111!</p>
<br />


<h5 class="mb-2"><strong>9. Cryptocurrency Transfer Tracking</strong></h5>
<p class="mb-3">This lab contains network packets recorded during JSON-RPC calls made to a Bitcoin node. Methods and parameters sent via JSON-RPC can be read unencrypted through network analysis.

To complete the lab, analyze the network traffic and find the Bitcoin wallet address located in the PCAP file.

What is the Bitcoin wallet address located in the PCAP file?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image22.png" alt="Network Analysis 22" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">We use the display filter <code>json.value.string contains "address"</code>. Inspecting the params value of this packet reveals the Bitcoin wallet address, which usually starts with <code>bc1</code>.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image23.png" alt="Network Analysis 23" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
<br />


<h5 class="mb-2"><strong>10. Log4j Exploit Detection</strong></h5>
<p class="mb-3">This lab contains network packets recorded during a Log4Shell (CVE-2021-44228) attack against a web server. JNDI (Java Naming and Directory Interface) requests sent using the Log4j vulnerability can be detected unencrypted through network analysis.

To complete the lab, analyze the HTTP traffic and find the IP address of the attacker's command and control (C2) server.

What is the IP address of the attacker's command and control (C2) server?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image24.png" alt="Network Analysis 24" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">Since Log4j attacks are typically delivered via HTTP headers (like <code>User-Agent</code>, <code>X-Api-Version</code>, <code>Referer</code>) or form fields to target web applications, we want to isolate the HTTP layers by using the display filter <code>http contains "jndi:"</code>. Inspecting the <code>User-Agent</code> value of this packet reveals the IP address of the C2 server.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image25.png" alt="Network Analysis 25" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> 45.155.205.233</p>
<br />


<h5 class="mb-2"><strong>11. Ransomware Traffic Analysis</strong></h5>
<p class="mb-3">This lab contains network packets recorded during periodic communication (Beaconing) established by a malicious software (Ransomware) with its command and control server. Signals sent by malware at regular intervals can be detected through traffic density and timing analysis.

To complete the lab, analyze the network traffic and find the domain name that the malware is communicating with.

What is the domain name that the malware is communicating with?</p>
<p class="mb-3"><strong>Steps: </strong>We see the following packet capture being loaded. Notice how packets no. 1 and 2 show the initial DNS query and resolution for <code>malware-c2-beacon.evil.hv</code> to IP <code>185.141.27.99</code>. Packets 3 through 6 then detail the subsequent TCP handshake and HTTP callback (<code>GET /api/status</code>) used to check in with the C2 infrastructure.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image24.png" alt="Network Analysis 24" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">To confirm this beaconing, we use the display filter <code>dns.qry.name contains "beacon" or http.request.uri == "/api/status"</code> which cleanly isolates this traffic from normal background traffic.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/networkanalysis/networkanalysis_hackviser_image25.png" alt="Network Analysis 25" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> malware-c2-beacon.evil.hv</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
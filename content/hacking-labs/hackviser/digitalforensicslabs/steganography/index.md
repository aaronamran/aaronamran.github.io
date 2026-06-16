---
title: 'Steganography'
date: '2026-06-12'
excerpt: 'Practice Steganography in multiple lab exercises.'
prog: 'Hackviser Digital Forensics Labs  -  June 2026'
---

<div class="writeup-header">
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/steganography/steganography_hackviser_logo.webp" alt="Hackviser logo" class="writeup-logo" />
<div class="writeup-header-text">
<div class="writeup-org">Hackviser</div>
<h1 class="writeup-title">Steganography</h1>
<div class="writeup-date">June 2026 · Digital Forensics Labs</div>
</div>
</div>
<p class="lead mb-4">Practice Steganography in multiple lab exercises.</p>

<h5 class="mb-2"><strong>1. Metadata</strong></h5>
<p class="mb-3">Metadata may contain important data about the file.

This lab requires a detailed analysis of the metadata of an image file.

To complete the lab, you need to find the image description by looking at the metadata of the file.

What is the description of the image?</p>
<p class="mb-3"><strong>Steps: </strong>We are given the following image.</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/steganography/metadata.jpg" alt="Metadata.jpg" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-3">In our Linux machine, ensure that exiftool is installed.</p>

```bash
sudo apt update && sudo apt install libimage-exiftool-perl -y
```

<p class="mb-3">Then run the command <code>exiftool metadata.jpg</code> and the following results will appear.</p>

```bash
user@linux:~$ exiftool metadata.jpg
ExifTool Version Number         : 11.88
File Name                       : metadata.jpg
Directory                       : .
File Size                       : 635 kB
File Modification Date/Time     : 2026:06:16 12:21:58+08:00
File Access Date/Time           : 2026:06:16 12:22:05+08:00
File Inode Change Date/Time     : 2026:06:16 12:21:58+08:00
File Permissions                : rwxrwxrwx
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.01
Resolution Unit                 : None
X Resolution                    : 0
Y Resolution                    : 0
Exif Byte Order                 : Big-endian (Motorola, MM)
Image Description               : KingArthur
Image Width                     : 1792
Image Height                    : 1024
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:4:4 (1 1)
Image Size                      : 1792x1024
Megapixels                      : 1.8
```

<p class="mb-5"><strong>Answer:</strong> KingArthur</p>
<br />


<h5 class="mb-2"><strong>2. Audio Spectrum</strong></h5>
<p class="mb-3">Audio files may contain hidden messages that are not recognisable when listened to.

This lab requires spectrum analysis of the audio file.

To complete the lab, you need to find the message hidden in the audio file with the help of spectrum analysis.

What is the text you found in the spectrum analysis?</p>
<p class="mb-3"><strong>Steps: </strong>In our Linux machine, ensure that Sox is installed.</p>

```bash
sudo apt update && sudo apt install sox libsox-fmt-all -y
```

<p class="mb-3">Then generate the spectrogram image.</p>

```bash
sox audio-spectrum.wav -n spectrogram -o spectrogram.png
```

<p class="mb-3">To view the generated spectrogram image use <code>xdg-open</code>.</p>

```bash
xdg-open spectrogram.png
```

<p class="mb-3">If you are using WSL in Windows, run the following command.</p>

```bash
cmd.exe /c start spectrogram.png
```

<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/steganography/spectrogram.png" alt="spectrogram.png" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> RobinHood</p>
<br />


<h5 class="mb-2"><strong>3. Color Conversion</strong></h5>
<p class="mb-3">Images can hide hidden messages behind the colours.

This lab involves analysing an image by changing its colours.

To complete the lab, you must reveal the message hidden in the image using colour transformation methods.

What is the text hidden behind the colours?</p>
<p class="mb-3"><strong>Steps: </strong>We are given the following image:</p>

<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/steganography/color-conversion.png" alt="color-conversion.png" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

<p class="mb-3">First we need to ensure Python Pillow library is installed, and create a script called <code>extract.py</code>.</p>

```bash
sudo apt update && sudo apt install python3-pip -y
pip3 install pillow
vi extract.py
```

<p class="mb-3">Paste the following Python script into <code>extract.py</code>.</p>

```python
from PIL import Image

# Open the lab image
img = Image.open("color-conversion.png").convert("RGB")
pixels = img.load()

# Create a blank canvas to output the hidden data
width, height = img.size
out_img = Image.new("RGB", (width, height))
out_pixels = out_img.load()

for x in range(width):
    for y in range(height):
        r, g, b = pixels[x, y]
        
        # Extract the least significant bit (LSB) of the Red channel
        # and boost it to maximum contrast (0 or 255)
        r_bit = (r & 1) * 255
        g_bit = (g & 1) * 255
        b_bit = (b & 1) * 255
        
        # Test visualizing the Red LSB plane first
        out_pixels[x, y] = (r_bit, r_bit, r_bit)

out_img.save("hidden_flag.png")
print("[+] Extraction complete. Saved to hidden_flag.png")
```

<p class="mb-3">Run the script using <code>python3 extract.py</code> and open the image using <code>xdg-open hidden_flag.png</code>. If you are using WSL terminal in Windows, run <code>cmd.exe /c start hidden_flag.png</code>. The image <code>hidden-flag.png</code> is shown below:</p>

<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/steganography/hidden_flag.png" alt="hidden_flag.png" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />
<p class="mb-5"><strong>Answer:</strong> Tezcatlipoca</p>
<br />


<h5 class="mb-2"><strong>4. Embedded Text</strong></h5>
<p class="mb-3">Images can contain embedded and hidden text.

This lab requires the extraction of text hidden in an image.

To complete the lab, you need to reveal the hidden text in the image using steganography techniques.

What is the embedded and hidden text?</p>
<p class="mb-3"><strong>Steps: </strong>We are given the following image:</p>
<img src="/assets/hackinglabs/hackviser/digitalforensicslabs/steganography/embedded-text.jpg" alt="embedded-text.jpg" class="img-fluid mb-4" width="720" height="405" loading="lazy" decoding="async" />

<p class="mb-3">We run the command <code>steghide extract -sf embedded-text.jpg</code> and don't input any password when prompted. Then we read the contents of the saved text file.</p>

```bash
user@linux:~$ steghide extract -sf embedded-text.jpg
Enter passphrase:
wrote extracted data to "steganopayload777527.txt".
user@linux:~$ cat steganopayload777527.txt
Athena
```
<p class="mb-5"><strong>Answer:</strong> Athena</p>
<br />


<h5 class="mb-2"><strong>5. Whitespace</strong></h5>
<p class="mb-3">There may be messages hidden in spots where there seems to be nothing.

This lab requires finding the text inside a seemingly empty file.

To complete the lab, you will need to use whitespace steganography techniques to decipher the message hidden between seemingly invisible gaps.

What is the secret text?</p>
<p class="mb-3"><strong>Steps: </strong>We are given a file named <code>whitespace.ws</code>.</p>
<p class="mb-3">We need to create a Python script named <code>ws_decode.py</code>. Then we paste the following Python code into the file and save it.</p>

```python
#!/usr/bin/env python3
import sys
import os

def decode_whitespace(file_path):
    if not os.path.exists(file_path):
        print(f"[-] Error: File '{file_path}' not found.")
        sys.exit(1)

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # Filter down to just the core Whitespace tokens
    tokens = [c for c in content if c in (" ", "\t", "\n")]

    idx = 0
    output_chars = []

    while idx < len(tokens):
        # Check for PUSH command: Space Space
        if idx + 1 < len(tokens) and tokens[idx] == " " and tokens[idx+1] == " ":
            idx += 2
            if idx < len(tokens):
                sign = 1 if tokens[idx] == " " else -1
                idx += 1
                
                # Read binary bits until a Newline (\n) is hit
                bin_val = ""
                while idx < len(tokens) and tokens[idx] != "\n":
                    bin_val += "0" if tokens[idx] == " " else "1"
                    idx += 1
                
                if bin_val:
                    val = int(bin_val, 2) * sign
                    # Collect if it is a printable ASCII character
                    if 32 <= val <= 126:
                        output_chars.append(chr(val))
        idx += 1

    print("Decoded Secret Text:", "".join(output_chars))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 ws_decode.py <filename.ws>")
        sys.exit(1)
        
    decode_whitespace(sys.argv[1])
```

<p class="mb-3">Then we run the Python script against the file and we get our answer.</p>

```bash
user@linux:~$ python3 ws_decode.py whitespace.ws
Decoded Secret Text: Hercules
```

<p class="mb-5"><strong>Answer:</strong> Hercules</p>


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hacking Lab.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">June 2026</p>
</section>

<div class="writeup-nav">
</div>
</div>
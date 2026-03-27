// Build script to create minified bookmarklet
// Usage: node build.js

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

(async () => {
console.log('🔨 Building JSPeek Bookmarklet...\n');

// Read the logo and convert to base64
const logoPath = path.join(__dirname, 'jspeek_logo.png');
const logoBuffer = fs.readFileSync(logoPath);
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

// Read the source code and inject logo
let sourceCode = fs.readFileSync('bookmarklet-code.js', 'utf8');
sourceCode = sourceCode.replace('{{LOGO_BASE64}}', logoBase64);

// Use Terser for proper minification (handles regex correctly)
let minified;
try {
  const result = await minify(sourceCode, {
    compress: {
      dead_code: true,
      drop_console: false,
      drop_debugger: true,
      keep_classnames: false,
      keep_fargs: true,
      keep_fnames: false,
      keep_infinity: false
    },
    mangle: false, // Don't mangle names - can break bookmarklet
    format: {
      comments: false,
      beautify: false
    }
  });
  minified = result.code;
} catch (err) {
  console.error('❌ Minification failed:', err.message);
  process.exit(1);
}

// Encode for URL
const encoded = encodeURIComponent(minified);

// Create the bookmarklet URL
const bookmarkletUrl = `javascript:${encoded}`;

// Calculate sizes
const originalSize = Buffer.byteLength(sourceCode, 'utf8');
const minifiedSize = Buffer.byteLength(minified, 'utf8');
const encodedSize = Buffer.byteLength(bookmarkletUrl, 'utf8');

console.log(`📊 Size Comparison:`);
console.log(`   Original:  ${(originalSize / 1024).toFixed(2)} KB`);
console.log(`   Minified:  ${(minifiedSize / 1024).toFixed(2)} KB (${((1 - minifiedSize / originalSize) * 100).toFixed(1)}% reduction)`);
console.log(`   Encoded:   ${(encodedSize / 1024).toFixed(2)} KB`);
console.log();

// Save the minified version
fs.writeFileSync('bookmarklet-min.js', minified);
console.log('✅ Saved minified code to: bookmarklet-min.js');

// Save the bookmarklet URL
fs.writeFileSync('bookmarklet-url.txt', bookmarkletUrl);
console.log('✅ Saved bookmarklet URL to: bookmarklet-url.txt');

// Generate complete index.html with the bookmarklet embedded
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSPeek</title>
    <link rel="icon" type="image/png" href="jspeek_logo.png">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            height: 100vh;
            background: linear-gradient(135deg, #0a1628 0%, #1a2332 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
            color: #fff;
            padding: 20px;
            overflow: hidden;
        }
        .container {
            max-width: 1100px;
            width: 100%;
            text-align: center;
            background: rgba(255, 255, 255, 0.02);
            padding: 35px 45px;
            border-radius: 20px;
            border: 1px solid rgba(59, 130, 246, 0.15);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .logo {
            width: 160px;
            height: auto;
            margin: 0 auto 15px;
            display: block;
            animation: pulse 2s ease-in-out infinite;
            filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.4));
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
        }
        .subtitle {
            color: rgba(255, 255, 255, 0.5);
            font-size: 1rem;
            margin-bottom: 25px;
        }
        .bookmarklet-link {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb, #0284c7);
            color: #fff;
            text-decoration: none;
            padding: 14px 35px;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
            transition: all 0.3s ease;
            border: 2px solid transparent;
            cursor: move;
        }
        .bookmarklet-link img {
            width: 24px;
            height: 24px;
            vertical-align: middle;
            margin-right: 8px;
            display: inline-block;
        }
        .bookmarklet-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(37, 99, 235, 0.6);
            border-color: rgba(255, 255, 255, 0.2);
        }
        .instruction {
            margin-top: 20px;
            color: rgba(255, 255, 255, 0.4);
            font-size: 0.85rem;
            line-height: 1.5;
        }
        .features {
            margin-top: 25px;
            text-align: left;
            background: rgba(0, 0, 0, 0.15);
            padding: 20px 25px;
            border-radius: 12px;
            border: 1px solid rgba(59, 130, 246, 0.1);
        }
        .features h3 {
            color: #06b6d4;
            margin-bottom: 12px;
            font-size: 1rem;
            text-align: center;
        }
        .features ul {
            list-style: none;
            color: rgba(255, 255, 255, 0.65);
            font-size: 0.85rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 20px;
        }
        .features li {
            padding: 6px 0;
        }
        .features li::before {
            content: "✓ ";
            color: #06b6d4;
            font-weight: bold;
            margin-right: 6px;
        }
        .footer {
            margin-top: 35px;
            padding-top: 25px;
            border-top: 1px solid rgba(59, 130, 246, 0.15);
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.85rem;
        }
        .footer p {
            margin-bottom: 15px;
        }
        .footer a {
            color: #06b6d4;
            text-decoration: none;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        .footer a:hover {
            color: #3b82f6;
            text-decoration: underline;
        }
        .kofi-button {
            display: inline-block;
            margin-top: 15px;
            background: linear-gradient(135deg, #FF5E5B, #FF4646);
            color: #fff;
            text-decoration: none;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 70, 70, 0.3);
        }
        .kofi-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 70, 70, 0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="jspeek_logo.png" alt="JSPeek - Cat Peeking Logo" class="logo">
        <h1>JSPeek</h1>
        <p class="subtitle">Web Application Security Reconnaissance Bookmarklet</p>
        
        <a href="${bookmarkletUrl}" class="bookmarklet-link" id="bookmarklet"><img src="jspeek_logo.png" alt="JSPeek"> JSPeek Scanner</a>
        
        <p class="instruction">
            ⬆️ <strong>Drag the button above to your bookmarks bar</strong><br>
            Then click it on any website to extract hidden insights
        </p>

        <div class="features">
            <h3>What JSPeek Detects</h3>
            <ul>
                <li><strong>CMS & Frameworks:</strong> 10+ platforms with version detection</li>
                <li><strong>API Endpoints:</strong> REST/GraphQL, auth paths, webhooks</li>
                <li><strong>Secrets:</strong> AWS keys, API tokens, JWT, DB URIs</li>
                <li><strong>PHP Vulnerabilities:</strong> Nonces, errors, SQL queries</li>
                <li><strong>Config Leaks:</strong> DB credentials, Laravel/WP keys</li>
                <li><strong>Admin Panels:</strong> Common admin path detection</li>
            </ul>
        </div>

        <div class="footer">
            <p>
                Created by <strong>@aaronamran</strong> | 
                <a href="https://www.linkedin.com/in/aaronamran/" target="_blank" rel="noopener noreferrer">LinkedIn</a> | 
                <a href="https://aaronamran.github.io/" target="_blank" rel="noopener noreferrer">Website</a> | 
                <a href="https://github.com/aaronamran" target="_blank" rel="noopener noreferrer">GitHub</a>
            </p>
            <a href="https://ko-fi.com/aaronamran" target="_blank" rel="noopener noreferrer" class="kofi-button">☕ Support me on Ko-fi</a>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync('index.html', indexHtml);
console.log('✅ Generated index.html with embedded bookmarklet');

console.log();
console.log('📝 Next Steps:');
console.log('   1. Open index.html in your browser');
console.log('   2. Drag the "⚡ JSPeek Scanner" button to your bookmarks bar');
console.log('   3. Visit any website and click the bookmark to scan!');
console.log();
console.log('✨ Build complete!');

})();

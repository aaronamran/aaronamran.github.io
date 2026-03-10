# Sentinel-Auth Beta

**API Authentication Debugger & JWT Token Validator**

![Status](https://img.shields.io/badge/status-beta-yellow) ![Environment](https://img.shields.io/badge/env-staging-orange) ![Version](https://img.shields.io/badge/version-2.1.4-blue)

---

## ⚠️ WARNING: INTERNAL USE ONLY

This tool is designed for **internal testing and debugging** of OAuth/JWT authentication flows. Do not use in production without proper security review.

## 🚀 Features

- **JWT Token Decoder**: Decode and inspect JWT token headers, payloads, and signatures
- **Token Verification**: Validate token structure and expiration
- **API Endpoint Testing**: Test authentication against various API endpoints
- **Debug Console**: Real-time logging and monitoring
- **Network Status**: Monitor internal network nodes and active sessions

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Valid JWT tokens for testing
- Access to staging environment (for full functionality)

## 🔧 Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd sentinel-auth
   ```

2. Open `index.html` in your browser:
   ```bash
   # Windows
   start index.html
   
   # macOS
   open index.html
   
   # Linux
   xdg-open index.html
   ```

3. Alternatively, serve with a local HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```

## 🎯 Usage

### Decoding a JWT Token

1. Paste your JWT token into the "Bearer Token" field
2. Click the **"Decode JWT"** button
3. View the decoded header, payload, and signature information

### Verifying a Token

1. Enter your API endpoint (or use the default staging endpoint)
2. Paste your JWT token
3. Click **"Verify Token"** to check validity and expiration
4. Monitor the debug console for detailed results

### Sample Test Tokens

Sample tokens are available in the browser console for testing purposes (press F12 to open DevTools).

## 🔐 Configuration

The application loads configuration from `config.json`. This includes:

- Internal network IPs
- Test accounts and hints
- API endpoints (staging, production, local)
- Feature flags
- Deployment metadata

**Note**: Production secrets are redacted and stored securely in Azure Key Vault.

## 🧪 Test Accounts

Several test accounts are configured for staging:

- `dev_admin` - Administrative access
- `staging_user` - Standard user access  
- `qa_tester` - Limited QA access

See `config.json` for hints on accessing these accounts.

## 🐛 Debugging

Enable debug mode by opening the browser DevTools console (F12). Additional diagnostic information is logged including:

- Configuration load status
- Network status
- Token validation details
- API request/response data

## 📁 File Structure

```
sentinel-auth/
├── index.html          # Main application interface
├── styles.css          # Dark theme styling
├── main.js            # Core functionality & JWT processing
├── config.json        # Configuration & test data
├── README.md          # This file
└── LICENSE            # License information
```

## ⚡ Technical Details

- **Frontend Only**: No backend required (uses mock data for testing)
- **JWT Decoding**: Client-side JWT parsing using Base64 decoding
- **Simulated API**: Mocks authentication responses for testing
- **Local Storage**: Uses browser localStorage for session persistence

## 🔒 Security Notes

- This tool is for **testing purposes only**
- Never commit production secrets to version control
- Test accounts are staging-only with development credentials
- Rate limiting is disabled in staging mode
- Production deployment requires security review

## 🚧 Known Issues

- Admin panel requires internal network access (VPN)
- Documentation links point to internal resources
- Some features only work in staging environment

## 📝 Development

To contribute or modify:

1. Review the code structure in `main.js`
2. Test changes in staging environment first
3. Check browser console for debug messages
4. Ensure `config.json` is not exposing production secrets

## 🔄 Version History

- **2.1.4** (Current) - Staging build with token history
- **2.1.3** - Added JWT expiration checking
- **2.1.0** - Initial beta release

## 🎯 Keyboard Shortcuts

- **Ctrl+Enter** - Verify Token
- **Ctrl+D** - Decode JWT

## 📞 Support

For questions or issues, check the help documentation (click "Help & Shortcuts" in the footer).

---

**Development Note**: Remember to review configuration files before production deployment.
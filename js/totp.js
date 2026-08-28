// ============================================
// TV Tracker - Real TOTP (Two-Factor Auth)
// RFC 6238 TOTP + Base32, using Web Crypto API
// ============================================

// ---- Base32 (RFC 4648) ----
const B32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function bytesToBase32(bytes) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += B32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += B32_CHARS[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32ToBytes(str) {
  const clean = str.replace(/[=\s]/g, '').toUpperCase();
  const bytes = [];
  let bits = 0;
  let value = 0;
  for (let i = 0; i < clean.length; i++) {
    const idx = B32_CHARS.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

function generateSecret(lengthBytes = 20) {
  const bytes = new Uint8Array(lengthBytes);
  crypto.getRandomValues(bytes);
  return bytesToBase32(bytes);
}

// ---- HMAC-SHA1 via Web Crypto (async) ----
async function hmacSha1(keyBytes, messageBytes) {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, messageBytes);
  return new Uint8Array(sig);
}

// ---- Build otpauth:// URI for QR scanners ----
function buildOTPAuthURI(secret, account, issuer) {
  const label = encodeURIComponent(issuer + ':' + (account || 'user'));
  const params = new URLSearchParams({
    secret: secret,
    issuer: issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30'
  });
  return 'otpauth://totp/' + label + '?' + params.toString();
}

// ---- Generate the TOTP code for a given time window ----
async function generateTOTP(secret, timeStep = 30, digits = 6) {
  const period = Math.floor(Date.now() / 1000 / timeStep);
  const counter = new Uint8Array(8);
  let val = period;
  for (let i = 7; i >= 0; i--) {
    counter[i] = val & 255;
    val = Math.floor(val / 256);
  }
  const keyBytes = base32ToBytes(secret);
  const hmac = await hmacSha1(keyBytes, counter);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = bin % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

// ---- Verify a 6-digit code (allows a small time window) ----
async function verifyTOTP(secret, code, window = 1) {
  if (!code || code.length !== 6) return false;
  const now = Math.floor(Date.now() / 1000 / 30);
  for (let t = now - window; t <= now + window; t++) {
    const period = t;
    const counter = new Uint8Array(8);
    let val = period;
    for (let i = 7; i >= 0; i--) {
      counter[i] = val & 255;
      val = Math.floor(val / 256);
    }
    const keyBytes = base32ToBytes(secret);
    const hmac = await hmacSha1(keyBytes, counter);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const bin =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    const otp = (bin % Math.pow(10, 6)).toString().padStart(6, '0');
    if (otp === code) return true;
  }
  return false;
}

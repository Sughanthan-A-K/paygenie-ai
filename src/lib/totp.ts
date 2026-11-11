// RFC 6238 TOTP (Time-based One-Time Password) implementation using Web Crypto API
// Compatible with Google Authenticator, Microsoft Authenticator, Authy, 1Password, etc.

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate a random Base32 secret key (16 characters / 80 bits, standard for Authenticator apps)
export function generateTotpSecret(): string {
  let secret = '';
  const randomBytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 16; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }

  for (let i = 0; i < 16; i++) {
    secret += BASE32_CHARS[randomBytes[i] % 32];
  }
  return secret;
}

// Convert Base32 string to Uint8Array
function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

// Compute 6-digit TOTP code for a given timestamp
export async function generateTotpCode(secret: string, timestampMs = Date.now()): Promise<string> {
  const keyBytes = base32ToBytes(secret);
  const timeStep = Math.floor(timestampMs / 1000 / 30); // 30-second window

  // 8-byte big-endian counter
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setUint32(4, timeStep, false);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes as any,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const hmacSignature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmacBytes = new Uint8Array(hmacSignature);

  // Dynamic truncation (RFC 4226)
  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const binaryCode =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = binaryCode % 1000000;
  return otp.toString().padStart(6, '0');
}

// Verify a 6-digit code against secret with a +/- 1 step grace window (drift tolerance)
export async function verifyTotpCode(secret: string, userCode: string): Promise<boolean> {
  const cleanCode = userCode.trim().replace(/\s+/g, '');
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) return false;

  const now = Date.now();
  // Check current window, previous 30s window, and next 30s window
  for (const offset of [-30000, 0, 30000]) {
    try {
      const validCode = await generateTotpCode(secret, now + offset);
      if (validCode === cleanCode) {
        return true;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return false;
}

// Generate the standard `otpauth://` URI that Google Authenticator recognizes
export function getOtpAuthUri(secret: string, accountName: string, issuer = 'PayGenie PayPal'): string {
  const encodedAccount = encodeURIComponent(accountName || 'merchant@paygenie.ai');
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Minimal JWT helpers (no external dep). Decodes the payload to read `exp`/`sub`
 * for proactive refresh and session restore (be1-app parity).
 */
interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decode base64url (RN-safe — does not rely on global atob). */
function base64UrlDecode(input: string): string {
  let str = input.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';

  let output = '';
  let buffer = 0;
  let bits = 0;
  for (const ch of str) {
    if (ch === '=') break;
    const idx = B64.indexOf(ch);
    if (idx === -1) continue;
    buffer = (buffer << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    return JSON.parse(base64UrlDecode(part)) as JwtPayload;
  } catch {
    return null;
  }
}

/** True when the token is expired, malformed, or has no exp. */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/** True when the token expires within `thresholdMinutes` (default 5). */
export function isTokenAboutToExpire(token: string, thresholdMinutes = 5): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 - Date.now() < thresholdMinutes * 60 * 1000;
}

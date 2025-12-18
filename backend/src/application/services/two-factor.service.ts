import crypto from 'crypto';
import { injectable } from 'inversify';

export interface ITwoFactorService {
  generateSecret(): { secret: string; otpAuthUrl: string };
  generateBackupCodes(): string[];
  verifyToken(secret: string, token: string): boolean;
  generateQRCodeUrl(secret: string, email: string): string;
  isEnabled(): boolean;
}

@injectable()
export class TwoFactorService implements ITwoFactorService {
  private readonly APP_NAME = 'GestorPro';
  private readonly TOKEN_VALIDITY_WINDOW = 1;

  isEnabled(): boolean {
    return process.env['ENABLE_TWO_FACTOR_AUTH'] === 'true';
  }

  generateSecret(): { secret: string; otpAuthUrl: string } {
    const secret = this.generateBase32Secret(20);
    const otpAuthUrl = `otpauth://totp/${this.APP_NAME}?secret=${secret}&issuer=${this.APP_NAME}`;
    
    return { secret, otpAuthUrl };
  }

  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateBackupCode());
    }
    return codes;
  }

  verifyToken(secret: string, token: string): boolean {
    if (!token || token.length !== 6) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000 / 30);
    
    for (let i = -this.TOKEN_VALIDITY_WINDOW; i <= this.TOKEN_VALIDITY_WINDOW; i++) {
      const expectedToken = this.generateTOTP(secret, currentTime + i);
      if (expectedToken === token) {
        return true;
      }
    }
    
    return false;
  }

  generateQRCodeUrl(secret: string, email: string): string {
    const otpAuthUrl = `otpauth://totp/${this.APP_NAME}:${encodeURIComponent(email)}?secret=${secret}&issuer=${this.APP_NAME}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  }

  private generateBase32Secret(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const randomBytes = crypto.randomBytes(length);
    let secret = '';
    
    for (let i = 0; i < length; i++) {
      const byte = randomBytes[i];
      if (byte !== undefined) {
        secret += chars[byte % chars.length];
      }
    }
    
    return secret;
  }

  private generateBackupCode(): string {
    const bytes = crypto.randomBytes(4);
    return bytes.toString('hex').toUpperCase().match(/.{4}/g)?.join('-') || 'XXXX-XXXX';
  }

  private generateTOTP(secret: string, counter: number): string {
    const decodedSecret = this.base32Decode(secret);
    const buffer = Buffer.alloc(8);
    
    for (let i = 7; i >= 0; i--) {
      buffer[i] = counter & 0xff;
      counter = Math.floor(counter / 256);
    }

    const hmac = crypto.createHmac('sha1', decodedSecret);
    hmac.update(buffer);
    const hash = hmac.digest();

    const offset = (hash[hash.length - 1] ?? 0) & 0xf;
    const code = (
      (((hash[offset] ?? 0) & 0x7f) << 24) |
      (((hash[offset + 1] ?? 0) & 0xff) << 16) |
      (((hash[offset + 2] ?? 0) & 0xff) << 8) |
      ((hash[offset + 3] ?? 0) & 0xff)
    ) % 1000000;

    return code.toString().padStart(6, '0');
  }

  private base32Decode(encoded: string): Buffer {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (const char of encoded.toUpperCase()) {
      const index = chars.indexOf(char);
      if (index === -1) continue;

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        output.push((value >> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }
}

export interface TwoFactorSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyData {
  userId: string;
  token: string;
}

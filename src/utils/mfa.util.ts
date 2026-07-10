import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";

export function generateMfaSecret(email: string) {
    const secret = generateSecret();
    const otpauthUrl = generateURI({ issuer: "NurseryApp", label: email, secret });
    return { secret, otpauthUrl };
}

export async function verifyMfaToken(token: string, secret: string): Promise<boolean> {
    const result = await verify({ token, secret });
    return result.valid;
}

export async function generateQrCodeDataUrl(otpauthUrl: string) {
    return QRCode.toDataURL(otpauthUrl);
}

export function generateBackupCodes(count = 8): string[] {
    return Array.from({ length: count }, () =>
        Math.random().toString(36).slice(2, 10).toUpperCase()
    );
}

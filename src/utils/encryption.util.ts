import crypto from "crypto";
import { FIELD_ENCRYPTION_KEY } from "../config";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
    if (!/^[0-9a-f]{64}$/i.test(FIELD_ENCRYPTION_KEY)) {
        throw new Error("FIELD_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
    }
    return Buffer.from(FIELD_ENCRYPTION_KEY, "hex");
}

export function encryptField(plainText: string): string {
    const key = getKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptField(payload: string): string {
    const key = getKey();
    const buf = Buffer.from(payload, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

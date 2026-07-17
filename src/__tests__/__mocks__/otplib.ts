// Manual mock for otplib in tests - the real package pulls in @scure/base, which ships as
// pure ESM and breaks Jest's CommonJS transform pipeline. Tests never need real TOTP
// generation, just for app.ts's module graph to resolve without crashing.
export function generateSecret(): string {
    return "MOCKSECRETMOCKSECRETMOCKSECRET1";
}

export function generateURI(options: { issuer: string; label: string; secret: string }): string {
    return `otpauth://totp/${options.issuer}:${options.label}?secret=${options.secret}`;
}

export async function verify(options: { token: string; secret: string }): Promise<{ valid: boolean; delta?: number }> {
    return { valid: false };
}

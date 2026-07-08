import bcryptjs from "bcryptjs"; 

export const PASSWORD_HISTORY_LIMIT = 5; 
export const PASSWORD_EXPIRY_DAYS = 90; 
export const BCRYPT_COST = 12; 


export async  function isPasswordReused(candidate : string, historyHashes: string[]): Promise<boolean>{
    for (const oldHash of historyHashes){
        if (await bcryptjs.compare(candidate, oldHash)) return true; 
    }
    return false; 
}


export function isPasswordExpired(passwordChangedAt?: Date): boolean {
    if (!passwordChangedAt) return true;
    const expiryMs = PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - new Date(passwordChangedAt).getTime() > expiryMs;
}
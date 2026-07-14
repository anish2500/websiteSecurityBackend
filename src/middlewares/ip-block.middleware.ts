import { Request, Response, NextFunction} from "express"; 
import { skipTrusted} from "./rate-limit.middleware"; 

const OFFENSE_WINDOW_MS = 60 * 60 * 1000; 
const OFFENSE_THRESHOLD = 3; 
const BLOCK_DURATION_MS = 60 * 60 * 1000; 



const offenses = new Map<string, number[]>(); 

const blockedIps = new Map<string, number>();


export function recordOffense(ip: string){
    const now = Date.now(); 
    const existing = (offenses.get(ip) || []).filter(t => now -t < OFFENSE_WINDOW_MS);
    existing.push(now); 
    offenses.set(ip, existing); 


    if ( existing.length >= OFFENSE_THRESHOLD){
        blockedIps.set(ip, now + BLOCK_DURATION_MS);
        offenses.delete(ip);
        console.warn(`[ip-block] BLOCKED ip = "${ip}" for ${BLOCK_DURATION_MS/60000} minutes (${existing.length} rate-limit violations in the last ${OFFENSE_WINDOW_MS/60000} minutes)`);
    }
}

export function ipBlockGuard(req: Request, res: Response, next: NextFunction){
    if (skipTrusted(req)) return next();

    const ip = req.ip as string; 
    const blockedUntil = blockedIps.get(ip);

    if (blockedUntil){
        if (Date.now() < blockedUntil){
            const retryAfterSeconds = Math.ceil((blockedUntil - Date.now())/1000);
            res.setHeader("Retry-After", retryAfterSeconds.toString());
            return res.status(403).json({
                success: false, 
                message: "Your IP has been temporarily blocked due to repeated suspicious activity"
            });
        }
        blockedIps.delete(ip); 
    }

    next(); 
}

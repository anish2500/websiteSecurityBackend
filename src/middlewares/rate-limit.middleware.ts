import rateLimit from "express-rate-limit";
import { recordOffense } from "./ip-block.middleware";


export const TRUSTED_IPS = (process.env.TRUSTED_IPS || "").split(",").map(ip => ip.trim()).filter(Boolean);
console.log(`[rate-limit] TRUSTED_IPS loaded:`, TRUSTED_IPS);
export const skipTrusted = (req: any) => TRUSTED_IPS.includes(req.ip);

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders : true,
    legacyHeaders: false,
    skip: skipTrusted,
    handler: (req, res) => {
        recordOffense(req.ip as string);
        console.warn(`[rate-limit] BLOCKED login from req.ip="${req.ip}" (trusted list: ${JSON.stringify(TRUSTED_IPS)})`);
        res.status(429).json({ success: false, message: "Too many login attempts. Try again in 15 minutes." });
    },

});

export const registerLimiter = rateLimit({
    windowMs: 60 *60 * 1000, 
    max: 5, 
    skip: skipTrusted, 
    handler: (req, res) =>{
        recordOffense(req.ip as string); 
        res.status(429).json({ success: false, message: "Too many accounts created from this network. Try again later."});
    }

}); 

export const passwordResetLimiter = rateLimit({
    windowMs: 60* 60 * 1000,
    max: 5,
    skip: skipTrusted,
    handler: (req, res) =>{
        recordOffense(req.ip as string); 
        res.status(429).json({ success: false, message: "Too many password reset requests. Try again latere"});
    },

});

export const changePasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skip: skipTrusted,
    handler: (req, res) => {
        recordOffense(req.ip as string); 
        res.status(429).json({ success: false, message: "Too many password change attemtps. Try again later"});
    }
});

export const globalApiLimiter = rateLimit({
    windowMs: 15* 60 * 1000, 
    max: 300, 
    skip: skipTrusted, 
    handler: (req, res) =>{
        recordOffense(req.ip as string); 
        res.status(429).json({ success: false, message: "Too many requests. Try again later."});
    }
}); 
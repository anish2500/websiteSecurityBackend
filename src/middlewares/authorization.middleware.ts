import jwt from "jsonwebtoken"; 
import { JWT_SECRET } from "../config";
import { Request, Response, NextFunction } from "express"; 
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import { AdminRepository } from "../repositories/admin/admin.repository";
import { IUser } from "../models/user.model";
import { IAdmin } from "../models/admin/admin.model";

// Extend Express Request to include user and admin
declare global {
    namespace Express {
        interface Request {
            user?: IUser | IAdmin; 
            isAdmin?: boolean;
        }
    }
}

const userRepository = new UserRepository();
const adminRepository = new AdminRepository(); 

export const authorizedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        // 1. Check if header exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError(401, "Unauthorized, Please login first");
        }

        const token = authHeader.split(" ")[1]; 
        
        // 2. Verify Token
        const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>; 
        
        if (!decodedToken || !decodedToken.id) {
            throw new HttpError(401, "Invalid session, please login again");
        }

        // 3. Check both User and Admin collections
        let user = await userRepository.getUserById(decodedToken.id);
        let isAdmin = false;

        if (!user) {
            // If not found in User collection, check Admin collection
            const admin = await adminRepository.getUserById(decodedToken.id);
            if (admin) {
                user = admin;
                isAdmin = true;
            }
        }

        if (!user) {
            throw new HttpError(401, "User no longer exists");
        }

        // 4. Attach user and admin flag to request
        req.user = user;
        req.isAdmin = isAdmin;
        next(); 

    } catch (error: any) {
        // Handle JWT specific errors (like expired tokens)
        const message = error.name === "TokenExpiredError" ? "Session expired" : error.message;
        return res.status(401).json({
            success: false, 
            message: message || "Unauthorized"
        });
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No user found'
        });
    }
 
    // Check either the role field or the isAdmin flag
    if (req.user.role !== 'admin' && !req.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Admin access required'
        });
    }
 
    next();
};
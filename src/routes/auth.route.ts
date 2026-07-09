import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { uploadProfilePicture } from "../middlewares/upload.middleware";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { loginLimiter, registerLimiter, passwordResetLimiter } from "../middlewares/rate-limit.middleware";

const authController = new AuthController();
const router = Router(); 

// Middleware to verify JWT token
const verifyToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

// Auth routes
router.post("/register" ,registerLimiter, authController.register.bind(authController));
router.post("/login", loginLimiter,  authController.login.bind(authController));

// Profile management routes (using controller methods)
router.get("/profile", verifyToken, authController.getProfile.bind(authController));
router.put("/profile", verifyToken, uploadProfilePicture.single("profilePicture"), authController.updateProfile.bind(authController));


router.post("/request-password-reset", passwordResetLimiter,  authController.sendResetPasswordEmail);
router.post("/reset-password/:token",passwordResetLimiter,  authController.resetPassword);
router.post("/change-password", authorizedMiddleware, authController.changePassword);


router.get("/whoami", authorizedMiddleware, authController.getProfile);

export default router;
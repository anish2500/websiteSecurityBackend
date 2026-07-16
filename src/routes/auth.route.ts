import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { uploadProfilePicture } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { loginLimiter, registerLimiter, passwordResetLimiter, changePasswordLimiter } from "../middlewares/rate-limit.middleware";

const authController = new AuthController();
const router = Router();

// Auth routes
router.post("/register" ,registerLimiter, authController.register.bind(authController));
router.post("/login", loginLimiter,  authController.login.bind(authController));

// Profile management routes (using controller methods)
router.get("/profile", authorizedMiddleware, authController.getProfile.bind(authController));
router.put("/profile", authorizedMiddleware, uploadProfilePicture.single("profilePicture"), authController.updateProfile.bind(authController));


router.post("/request-password-reset", passwordResetLimiter,  authController.sendResetPasswordEmail);
router.post("/reset-password/:token",passwordResetLimiter,  authController.resetPassword);
router.post("/change-password", changePasswordLimiter, authorizedMiddleware, authController.changePassword);
router.post("/refresh", loginLimiter, authController.refresh.bind(authController));
router.post("/logout", authController.logout.bind(authController));


router.get("/whoami", authorizedMiddleware, authController.getProfile);

router.post("/mfa/setup", authorizedMiddleware, authController.setupMfa);
router.post("/mfa/verify-setup", authorizedMiddleware, authController.verifyMfaSetup);
router.post("/mfa/challenge", loginLimiter, authController.mfaChallenge); 
router.post("/mfa/disable", authorizedMiddleware, authController.disableMfa);
router.post("/magic-link/request", passwordResetLimiter, authController.requestMagicLink);
router.post("/magic-link/verify", loginLimiter, authController.magicLogin);


export default router;
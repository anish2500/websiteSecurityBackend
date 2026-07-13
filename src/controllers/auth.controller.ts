import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ChangePasswordDto, CreateUserDTO, LoginUserDTO, MfaChallengeDto, UpdateUserDto, VerifyMfaDto } from "../dtos/user.dto";
import { success } from "zod";
import { verifyCaptcha } from "../utils/captch.util";
import { UserRepository } from "../repositories/user.repository";
import { generateBackupCodes, generateMfaSecret, generateQrCodeDataUrl } from "../utils/mfa.util";

const userService = new UserService();
const userRepository = new UserRepository();

export class AuthController {
    
    // Changed to Arrow Function to preserve 'this' context
    register = async (req: Request, res: Response) => {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: parsedData.error.flatten().fieldErrors 
                });
            }

            const newUser = await userService.registerUser(parsedData.data);

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: newUser
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Changed to Arrow Function to preserve 'this' context
    login = async (req: Request, res: Response) => {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: parsedData.error.flatten().fieldErrors
                });
            }

            // CAPTCHA is only required once the account looks under attack (3+ failed
            // attempts), checked before the password compare so it can't leak whether a
            // guessed password was correct.
            const existingUser = await userRepository.getUserbyEmail(parsedData.data.email);
            if (existingUser && (existingUser.failedLoginAttempts || 0) >= 3) {
                const captchaOk = await verifyCaptcha(parsedData.data.captchaToken);
                if (!captchaOk) {
                    return res.status(400).json({ success: false, captchaRequired: true, message: "Please complete the CAPTCHA" });
                }
            }

            // Enforces the 5-attempt lockout.
            const result = await userService.loginUser(parsedData.data);

            if (result.mfaRequired) {
                return res.status(200).json({
                    success: true,
                    mfaRequired: true,
                    mfaChallengeToken: result.mfaChallengeToken
                });
            }

            return res.status(200).json({
                success: true,
                message: "Login successful",
                accessToken: result.accessToken,
                refreshToken: result.refreshToken, 
                data: result.user
            });

        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    // Get User Profile
    getProfile = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                });
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json({
                success: true,
                data: user,
                message: "User Profile fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    // Update User Profile
    updateProfile = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User Id Not found"
                });
            }
            const parsedData = UpdateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: parsedData.error.flatten().fieldErrors
                });
            }
            if (req.file) {
                parsedData.data.profilePicture = req.file.filename;
            }
            const updatedUser = await userService.updateUser(userId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "User profile updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

     async sendResetPasswordEmail(req: Request, res: Response) {
        try {
            const email = req.body.email;
            const user = await userService.sendResetPasswordEmail(email);
            return res.status(200).json(
                { success: true,
                    data: user,
                    message: "If the email is registered, a reset link has been sent." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    


      async resetPassword(req: Request, res: Response) {
        try {
            const token = req.params.token;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    changePassword = async (req: Request, res: Response)=>{
        try {
            const userId = (req as any).user?.id; 
            const parsed = ChangePasswordDto.safeParse(req.body);
            if (!parsed.success){
                return res.status(400).json({ success: false, message: "Validation Error", errors: parsed.error.flatten().fieldErrors});

            }
            await userService.changePassword(userId, parsed.data.currentPassword, parsed.data.newPassword);
            return res.status(200).json({ success: true, message: "Password changed successfully"});

        } catch (error: any){
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server error"});
        }
    }

   setupMfa = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const user = await userService.getUserById(userId);
        const { secret, otpauthUrl } = generateMfaSecret(user.email);
        await userService.storeMfaSecretPending(userId, secret);
        const qr = await generateQrCodeDataUrl(otpauthUrl);
        return res.status(200).json({ success: true, data: { qrCode: qr } });
    } catch (error: any) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
    }
}

verifyMfaSetup = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const parsed = VerifyMfaDto.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Validation Error", errors: parsed.error.flatten().fieldErrors });
        }
        const ok = await userService.confirmMfaEnrollment(userId, parsed.data.token);
        if (!ok) return res.status(400).json({ success: false, message: "Invalid MFA code" });
        const backupCodes = generateBackupCodes();
        await userService.saveBackupCodes(userId, backupCodes);
        return res.status(200).json({ success: true, data: { backupCodes } });
    } catch (error: any) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
    }
}

mfaChallenge = async (req: Request, res: Response) => {
    try {
        const parsed = MfaChallengeDto.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Validation Error", errors: parsed.error.flatten().fieldErrors });
        }
        const { accessToken, refreshToken, user } = await userService.verifyMfaChallenge(parsed.data.mfaChallengeToken, parsed.data.token);
        return res.status(200).json({ success: true, message: "Login successful", accessToken, refreshToken, data: user });
    } catch (error: any) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
    }
}


disableMfa = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        await userService.disableMfa(userId);
        return res.status(200).json({ success: true, message: "MFA disabled" });
    } catch (error: any) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
    }
}



refresh = async (req: Request, res: Response) =>{
    try {
        const {refreshToken} = req.body; 
        if (!refreshToken) return res.status(400).json({ success: false, message : "Refesh Token required "});
        const {accessToken, refreshToken: newRefreshToken} = await userService.refreshAccessToken(refreshToken);
        return res.status(200).json({ success: true, accessToken, refreshToken: newRefreshToken});

    }catch (error: any){
        return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error"});
    }
}

logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken} = req.body; 
        if (refreshToken) await userService.revokeRefreshToken(refreshToken);
        return res.status(200).json({ success: true, message: "Logged out"});

    } catch (error: any){
        return res.status(error.statusCode || 500).json({ success: false, message : error.message || "Internal server error"});
    }
}

}
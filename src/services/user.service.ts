import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";
import { isPasswordReused, isPasswordExpired, BCRYPT_COST, PASSWORD_HISTORY_LIMIT } from "../utils/password-policy-util";
import { UserModel } from "../models/user.model";
import { validate } from "uuid";
import { verifyMfaToken } from "../utils/mfa.util";
import { RefreshTokenModel } from "../models/refresh-token.model";
import { generateRefreshToken, hashRefreshToken } from "../utils/token.util";




const CLIENT_URL = process.env.CLIENT_URI as string; 
const ACCESS_TOKEN_TTL = "15m"; 
const REFRESH_TOKEN_TTL_MS = 7*24*60*60*1000; 


async function issueTokenPair(user:any, userAgent?: string){
    const payload = { id: user._id, email: user.email, fullName: user.fullName, role: user.role};
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL});


    const refreshToken = generateRefreshToken(); 
    await RefreshTokenModel.create({
        userId: user._id, 
        tokenHash: hashRefreshToken(refreshToken), 
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS), 
        userAgent, 

    });

    return {accessToken, refreshToken};
}
// Instantiate the repository to use its methods
const userRepository = new UserRepository();

export class UserService {
    /**
     * Signup Logic
     */
    async registerUser(data: CreateUserDTO) {
        // 1. Check if the email already exists
        const emailCheck = await userRepository.getUserbyEmail(data.email);
        if (emailCheck) {
            throw new HttpError(403, "Email already in use");
        }

        // 2. Handle fullName and username for cross-platform compatibility
        let fullName = data.fullName;
        let username = data.username;
        
        // Auto-generate username from email if not provided (for both web and mobile)
        if (!username) {
            username = data.email.split('@')[0];
        }
        
        // Auto-generate fullName from username if not provided
        if (!fullName && username) {
            fullName = username;
        }
        
        // Auto-generate fullName from email if neither provided
        if (!fullName && !username) {
            fullName = data.email.split('@')[0];
            username = data.email.split('@')[0];
        }

        // 3. Hash password (Complexity level: 10)
        const hashedPassword = await bcryptjs.hash(data.password, BCRYPT_COST);

        // 4. Prepare data for Repository
        // We strip out 'confirmPassword' because the Model doesn't accept it
        const { confirmPassword, ...userData } = data;
        
        // Check if password and confirmPassword match
        if (data.confirmPassword && data.password !== data.confirmPassword) {
            throw new HttpError(400, "Passwords do not match");
        }

        // 5. Create user with hashed password and processed fields
        const newUser = await userRepository.createUser({
            ...userData,
            fullName: fullName || undefined,
            username: username,
            password: hashedPassword,
            passwordChangedAt: new Date(),
            passwordHistory: [hashedPassword], 
            profilePicture: userData.profilePicture || undefined
        });

        return newUser;
    }

    /**
     * Login Logic
     */
    async loginUser(data: LoginUserDTO, userAgent?: string) {
        // 1. Check if the user exists by email
        const user = await userRepository.getUserbyEmail(data.email);
        if (!user) throw new HttpError(401, "Invalid credentials");


        if (user.lockUntil && user.lockUntil > new Date()){
            const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now())/60000);
            throw new HttpError(423, `Account locked. Try again in ${minutesLeft} minute(s).`);
        }

        // 2. Compare the plain-text password with the hashed password in DB
        const isPasswordValid = await bcryptjs.compare(data.password, user.password);
        if (!isPasswordValid) {
            const attempts = (user.failedLoginAttempts || 0) + 1; 
            const update: any = { failedLoginAttempts: attempts}; 
            if (attempts >=5){
                update.lockUntil = new Date(Date.now() + 15 * 60 * 1000 );
                update.failedLoginAttempts = 0; 

            }
            await userRepository.updateOneUser(user._id.toString(), update); 
            throw new HttpError(401, "Invalid credentials");
        }

        if ( (user.failedLoginAttempts || 0) > 0 || user.lockUntil){
            await userRepository.updateOneUser(user._id.toString(), { failedLoginAttempts :0, lockUntil : null});
        }

        if (user.mfaEnabled) {
            const mfaChallengeToken = jwt.sign({ id: user._id, purpose: "mfa" }, JWT_SECRET, { expiresIn: "5m" });
            return { mfaRequired: true as const, mfaChallengeToken };
        }

        const forcePasswordChange =isPasswordExpired(user.passwordChangedAt);

        // 3. Generate JWT Payload
        const payload = {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        };

const { accessToken, refreshToken } = await issueTokenPair(user, userAgent);
return { accessToken, refreshToken, user, forcePasswordChange };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string){
        const user = await userRepository.getUserById(userId); 
        if(!user){
            throw new HttpError(404, "User not found"); 
        }

        const isValid = await bcryptjs.compare(currentPassword, user.password); 
        if(!isValid){
            throw new HttpError(401, "Current password is incorrect");
        }

        const history = [user.password, ...(user.passwordHistory || [])].slice(0, PASSWORD_HISTORY_LIMIT);
        if (await isPasswordReused(newPassword, history)){
            throw new HttpError(400, `New password must differ from your last ${ PASSWORD_HISTORY_LIMIT} passwords`);

        }

        const hashedPassword = await bcryptjs.hash(newPassword, BCRYPT_COST); 
        await userRepository.updateOneUser(userId, {
            password: hashedPassword, 
            passwordChangedAt: new Date(), 
            passwordHistory: history, 
        }); 
    }

    /**
     * Update User Profile
     */
    async updateUserProfile(userId: string, updateData: any) {
        // Find user by ID
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Update user with new data
        const updatedUser = await userRepository.updateOneUser(userId, updateData);
        return updatedUser;
    }

    /**
     * Update User (alias for updateUserProfile)
     */
    async updateUser(userId: string, updateData: any) {
        return await this.updateUserProfile(userId, updateData);
    }

    /**
     * Get User by ID
     */
    async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    /**
     * Get All Users
     */
    async getAllUsers(
        page: number = 1,
        size: number = 10,
        search?: string
    ) {
         return await userRepository.getAllUsers(page, size, search);
        }


    /**
     * Delete User
     */
    async deleteUser(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const result = await userRepository.deleteOneUser(userId);
        return result;
    }



       async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserbyEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
        return user;

    }



       async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new HttpError(404, "User not found");
            }

            const history = [user.password, ...(user.passwordHistory || [])].slice(0, PASSWORD_HISTORY_LIMIT);
            if (await isPasswordReused ( newPassword, history)){
                throw new HttpError(400, `New password must differ from your last ${PASSWORD_HISTORY_LIMIT} passwords`);
            }
            const hashedPassword = await bcryptjs.hash(newPassword, BCRYPT_COST);
            await userRepository.updateOneUser(userId, { password: hashedPassword, passwordChangedAt: new Date(), passwordHistory: history });
            return user;
        } catch (error) {
            if (error instanceof HttpError) throw error; 
            throw new HttpError(400, "Invalid or expired token");
        }
    }


    async storeMfaSecretPending(userId: string, secret: string){
        await userRepository.updateOneUser(userId, { mfaSecret: secret});
    }


    async confirmMfaEnrollment(userId: string, token: string): Promise<boolean>{
        const user = await UserModel.findById(userId).select('+mfaSecret');
        if (!user?.mfaSecret) return false; 
        const valid = await verifyMfaToken(token, user.mfaSecret);
        if (valid) await userRepository.updateOneUser(userId,{mfaEnabled: true} );
        return valid; 
    }

    async saveBackupCodes(userId: string, codes: string[]){
        await userRepository.updateOneUser(userId, { mfaBackupCodes: codes});
    }

    async disableMfa (userId: string){
        await userRepository.updateOneUser(userId, { mfaEnabled: false, mfaSecret: undefined, mfaBackupCodes: []});
    }

    async verifyMfaChallenge(mfaChallengeToken: string, code: string, userAgent?: string) {
        let decoded: any;
        try {
            decoded = jwt.verify(mfaChallengeToken, JWT_SECRET);
        } catch {
            throw new HttpError(401, "MFA challenge expired, please log in again");
        }
        if (decoded.purpose !== "mfa") throw new HttpError(401, "Invalid challenge token");

        const user = await UserModel.findById(decoded.id).select('+mfaSecret');
        if (!user?.mfaSecret) throw new HttpError(400, "MFA not configured");

        const valid = await verifyMfaToken(code, user.mfaSecret);
        if (!valid) throw new HttpError(401, "Invalid MFA code");

        const payload = { id: user._id, email: user.email, fullName: user.fullName, role: user.role };
const { accessToken, refreshToken } = await issueTokenPair(user, userAgent);
return { accessToken, refreshToken, user };
    }



    async refreshAccessToken (rawRefreshToken: string, userAgent?: string){
        const tokenHash = hashRefreshToken(rawRefreshToken);
        const stored  = await RefreshTokenModel.findOne({ tokenHash, revoked: false});
        if (!stored || stored.expiresAt < new Date()){
            throw new HttpError(401, "Invalid or expired refresh token");

        }
        if (stored.userAgent && stored.userAgent !== userAgent){
            stored.revoked = true; 
            await stored.save(); 
            throw new HttpError(401, "Session does not match the original device. Please log in again. ")
        }


        stored.revoked = true; 
        await stored.save();

        const user = await userRepository.getUserById(stored.userId.toString());
        if (!user) throw new HttpError (401, "User no longer exists");


        return await issueTokenPair(user, userAgent);

    
    }

    async revokeRefreshToken(rawRefreshToken: string){
        const tokenHash = hashRefreshToken(rawRefreshToken);
        await RefreshTokenModel.updateOne({ tokenHash}, { revoked: true});
    }


    async sendMagicLink(email: string) {
        const user = await userRepository.getUserbyEmail(email); 
        if (user){
            const magicToken = jwt.sign({ id: user._id, purpose: "magic-login"}, JWT_SECRET, {expiresIn: "15m"});
            const magicLink = `${CLIENT_URL}/magic-login?token=${magicToken}`;
            const html = `<p>Click <a href="${magicLink}">here</a>to log in. This link expires in 15 minutes.</p>`;
            await sendEmail(user.email, "Your login link", html); 
        }


    }

    async verifyMagicLink(token: string){
        let decoded: any; 
        try {
            decoded = jwt.verify(token, JWT_SECRET);

        } catch {
            throw new HttpError(401, "Login link is invalid or has expired"); 
        }

        if (decoded.purpose !=="magic-login") throw new HttpError(401, "Invalid login link");


        const user = await userRepository.getUserById(decoded.id); 
        if (!user) throw new HttpError(401, "user no longer exists");

        const { accessToken, refreshToken} = await issueTokenPair(user); 
        return { accessToken, refreshToken, user}; 
    }
}
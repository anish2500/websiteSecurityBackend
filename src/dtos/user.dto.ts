import { z } from "zod";

const passwordPolicy = z.string()
    .min(12, "Password must be at least 12 characters")
    .max(64, "Password must be at most 64 characters")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"); 

export const CreateUserDTO = z.object({
    fullName: z.string().min(2, "Full name is required").optional().nullable(),
    username: z.string().min(2, "Username is required").optional().nullable(),
    email: z.string().email("Invalid email format"),
    password: passwordPolicy,
    confirmPassword: passwordPolicy.optional(),
    profilePicture: z.string().url("Invalid URL format").optional().nullable(),
    
}).refine(
    (data) => {
        // Only validate password matching if confirmPassword is provided
        if (data.confirmPassword) {
            return data.password === data.confirmPassword;
        }
        return true;
    }, 
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password is required"), 
    captchaToken: z.string().optional(),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const ChangePasswordDto = z.object({
    currentPassword: z.string().min(1), 
    newPassword: passwordPolicy, 
}); 

export type ChangePasswordDto = z.infer<typeof ChangePasswordDto>; 

export const UpdateUserDto = z.object({
    fullName: z.string().min(2, "Full name is required").optional(),
    username: z.string().min(2, "Username is required").optional(),
    email: z.string().email("Invalid email format").optional(),
    profilePicture: z.string().optional().nullable(),
    imageUrl: z.string().optional()
});

export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const VerifyMfaDto = z.object({
    token: z.string().length(6, "Code must be 6 digits ").regex(/^\d+$/, "Code must be numeric"), 

});
export type VerifyMfaDto = z.infer<typeof VerifyMfaDto>;


export const MfaChallengeDto = z.object({
    mfaChallengeToken: z.string().min(1), 
    token: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

export type MfaChallengeDto = z.infer<typeof MfaChallengeDto>;
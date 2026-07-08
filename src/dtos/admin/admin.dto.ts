import { z } from "zod";

export const CreateAdminDTO = z.object({
    fullName: z.string().min(2, "Full name is required").optional().nullable(),
    username: z.string().min(2, "Username is required").optional().nullable(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required").optional(),
    profilePicture: z.string().url("Invalid URL format").optional().nullable(),
    role: z.enum(["admin"]).optional().default("admin")
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

export type CreateAdminDTO = z.infer<typeof CreateAdminDTO>;

export const LoginAdminDTO = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password is required")
});

export type LoginAdminDTO = z.infer<typeof LoginAdminDTO>;

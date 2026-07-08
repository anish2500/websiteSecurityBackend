import z from "zod";

/**
 * Base User Schema
 * This should represent the core data structure of your User entity
 * in alignment with your MongoDB Model.
 */
export const UserSchema = z.object({
    fullName: z.string().min(2, "Full name is required").optional(),
    username: z.string().min(2, "Username is required").optional(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    profilePicture: z.string().url("Invalid URL format").optional(),
    role: z.enum(["user", "admin"]).default("user"),
});

// This type is used by the IUser interface in your model.ts
export type UserType = z.infer<typeof UserSchema>;
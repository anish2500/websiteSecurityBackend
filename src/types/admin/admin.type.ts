import z from "zod";

/**
 * Base Admin Schema
 * This should represent the core data structure of your Admin entity
 * in alignment with your MongoDB Model.
 */
export const AdminSchema = z.object({
    fullName: z.string().min(2, "Full name is required").optional(),
    username: z.string().min(2, "Username is required").optional(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    profilePicture: z.string().url("Invalid URL format").optional(),
    role: z.enum(["admin"]).default("admin"),
});

// This type is used by the IAdmin interface in your model.ts
export type AdminType = z.infer<typeof AdminSchema>;

import { UserService } from "../../../services/user.service";
import { UserRepository } from "../../../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { HttpError } from "../../../errors/http-error";

jest.mock("../../../repositories/user.repository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../config", () => ({
    JWT_SECRET: "test-secret-key",
    CLIENT_URI: "http://localhost:3000",
}));
jest.mock("../../../config/email", () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
}));

describe("UserService Unit Tests", () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        userService = new UserService();
        mockUserRepository = UserRepository.prototype as jest.Mocked<UserRepository>;
        jest.clearAllMocks();
    });

    describe("registerUser", () => {
        const registerData = {
            fullName: "Test User",
            username: "testuser",
            email: "test@example.com",
            password: "Password123!",
            confirmPassword: "Password123!",
            role: "user" as const,
        };

        it("should successfully register a new user", async () => {
            mockUserRepository.getUserbyEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue({
                _id: "user-id-123",
                fullName: "Test User",
                username: "testuser",
                email: "test@example.com",
                password: "hashedPassword",
                role: "user",
            } as any);

            (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPassword");

            const result = await userService.registerUser(registerData);

            expect(mockUserRepository.getUserbyEmail).toHaveBeenCalledWith("test@example.com");
            expect(bcryptjs.hash).toHaveBeenCalledWith("Password123!", 10);
            expect(mockUserRepository.createUser).toHaveBeenCalled();
            expect(result.email).toBe("test@example.com");
        });

        it("should throw error if email already exists", async () => {
            mockUserRepository.getUserbyEmail.mockResolvedValue({
                _id: "existing-user-id",
                email: "test@example.com",
            } as any);

            await expect(userService.registerUser(registerData)).rejects.toThrow(
                new HttpError(403, "Email already in use")
            );
        });
    });

    describe("loginUser", () => {
        const loginData = {
            email: "test@example.com",
            password: "Password123!",
        };

        it("should successfully login a user", async () => {
            const mockUser = {
                _id: "user-id-123",
                email: "test@example.com",
                fullName: "Test User",
                password: "hashedPassword",
                role: "user",
            };

            mockUserRepository.getUserbyEmail.mockResolvedValue(mockUser as any);
            (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue("mock-token");

            const result = await userService.loginUser(loginData);

            expect(result.token).toBe("mock-token");
            expect(result.user).toEqual(mockUser);
        });

        it("should throw error if password is invalid", async () => {
            mockUserRepository.getUserbyEmail.mockResolvedValue({
                _id: "user-id-123",
                email: "test@example.com",
                password: "hashedPassword",
            } as any);
            (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

            await expect(userService.loginUser(loginData)).rejects.toThrow(
                new HttpError(401, "Invalid credentials")
            );
        });
    });

    describe("getUserById", () => {
        it("should return user if found", async () => {
            const mockUser = {
                _id: "user-id-123",
                email: "test@example.com",
                fullName: "Test User",
            };

            mockUserRepository.getUserById.mockResolvedValue(mockUser as any);

            const result = await userService.getUserById("user-id-123");

            expect(result).toEqual(mockUser);
        });

        it("should throw error if user not found", async () => {
            mockUserRepository.getUserById.mockResolvedValue(null);

            await expect(userService.getUserById("invalid-id")).rejects.toThrow(
                new HttpError(404, "User not found")
            );
        });
    });

    describe("updateUserProfile", () => {
        it("should update user profile successfully", async () => {
            const updateData = { fullName: "Updated Name" };
            const mockUser = {
                _id: "user-id-123",
                email: "test@example.com",
                fullName: "Updated Name",
            };

            mockUserRepository.getUserById.mockResolvedValue(mockUser as any);
            mockUserRepository.updateOneUser.mockResolvedValue(mockUser as any);

            const result = await userService.updateUserProfile("user-id-123", updateData);

            expect(result!.fullName).toBe("Updated Name");
        });

      
    });

    describe("deleteUser", () => {
        it("should delete user successfully", async () => {
            mockUserRepository.getUserById.mockResolvedValue({
                _id: "user-id-123",
            } as any);
            mockUserRepository.deleteOneUser.mockResolvedValue(true);

            const result = await userService.deleteUser("user-id-123");

            expect(result).toBe(true);
        });

      
    });

    describe("getAllUsers", () => {
        it("should return users with pagination", async () => {
            const mockUsers = {
                users: [
                    { _id: "user1", email: "user1@example.com" },
                    { _id: "user2", email: "user2@example.com" },
                ],
                total: 2,
            };

            mockUserRepository.getAllUsers.mockResolvedValue(mockUsers as any);

            const result = await userService.getAllUsers(1, 10);

            expect(result.users.length).toBe(2);
            expect(result.total).toBe(2);
        });
    });

    describe("sendResetPasswordEmail", () => {
        it("should send reset password email", async () => {
            const mockUser = {
                _id: "user-id-123",
                email: "test@example.com",
            };

            mockUserRepository.getUserbyEmail.mockResolvedValue(mockUser as any);
            (jwt.sign as jest.Mock).mockReturnValue("reset-token");

            const result = await userService.sendResetPasswordEmail("test@example.com");

            expect(result.email).toBe("test@example.com");
        });

        it("should throw error if email not provided", async () => {
            await expect(userService.sendResetPasswordEmail(undefined)).rejects.toThrow(
                new HttpError(400, "Email is required")
            );
        });

        it("should throw error if user not found", async () => {
            mockUserRepository.getUserbyEmail.mockResolvedValue(null);

            await expect(
                userService.sendResetPasswordEmail("notfound@example.com")
            ).rejects.toThrow(new HttpError(404, "User not found"));
        });
    });

    describe("resetPassword", () => {
        it("should reset password successfully", async () => {
            const mockUser = {
                _id: "user-id-123",
                email: "test@example.com",
            };

            (jwt.verify as jest.Mock).mockReturnValue({ id: "user-id-123" });
            mockUserRepository.getUserById.mockResolvedValue(mockUser as any);
            mockUserRepository.updateOneUser.mockResolvedValue(mockUser as any);
            (bcryptjs.hash as jest.Mock).mockResolvedValue("new-hashed-password");

            const result = await userService.resetPassword("valid-token", "NewPassword123!");

            expect(result).toEqual(mockUser);
        });

        it("should throw error if token or password not provided", async () => {
            await expect(userService.resetPassword(undefined, "password")).rejects.toThrow(
                new HttpError(400, "Invalid or expired token")
            );
            await expect(userService.resetPassword("token", undefined)).rejects.toThrow(
                new HttpError(400, "Invalid or expired token")
            );
        });

        it("should throw error if user not found", async () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error("Invalid token");
            });

            await expect(
                userService.resetPassword("invalid-token", "NewPassword123!")
            ).rejects.toThrow(new HttpError(400, "Invalid or expired token"));
        });
    });
});

import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";
import mongoose from "mongoose";

describe("User Repository Unit Tests", () => {
    let userRepository: UserRepository;

    beforeAll(() => {
        userRepository = new UserRepository();
    });

    afterEach(async () => {
        await UserModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    const userData = {
        fullName: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        // role: "user"
    };

    // ---------------- CREATE ----------------
    test("should create a new user", async () => {
        const newUser = await userRepository.createUser(userData);

        expect(newUser).toBeDefined();
        expect(newUser._id).toBeDefined();
        expect(newUser.email).toBe(userData.email);
        expect(newUser.username).toBe(userData.username);
        expect(newUser.role).toBe("user");
    });

    // ---------------- GET BY EMAIL ----------------
    test("should get user by email", async () => {
        await userRepository.createUser(userData);

        const foundUser = await userRepository.getUserbyEmail("test@example.com");

        expect(foundUser).not.toBeNull();
        expect(foundUser?.email).toBe(userData.email);
    });

    test("should return null if email not found", async () => {
        const user = await userRepository.getUserbyEmail("notfound@example.com");
        expect(user).toBeNull();
    });

    // ---------------- GET BY ID ----------------
    test("should get user by id", async () => {
        const createdUser = await userRepository.createUser(userData);

        const foundUser = await userRepository.getUserById(
            createdUser._id.toString()
        );

        expect(foundUser).not.toBeNull();
        expect(foundUser?._id.toString()).toBe(createdUser._id.toString());
    });

    test("should return null for invalid user id", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const user = await userRepository.getUserById(fakeId);
        expect(user).toBeNull();
    });

    // ---------------- GET ALL USERS ----------------
    test("should return all users with pagination", async () => {
        await userRepository.createUser({
            ...userData,
            email: "user1@example.com"
        });

        await userRepository.createUser({
            ...userData,
            email: "user2@example.com",
            username: "user2"
        });

        const result = await userRepository.getAllUsers(1, 10);

        expect(result.users.length).toBe(2);
        expect(result.total).toBe(2);
    });

    test("should filter users using search", async () => {
        await userRepository.createUser({
            ...userData,
            username: "anish"
        });

        await userRepository.createUser({
            ...userData,
            email: "random@example.com",
            username: "random"
        });

        const result = await userRepository.getAllUsers(1, 10, "anish");

        expect(result.users.length).toBe(1);
        expect(result.users[0].username).toBe("anish");
    });

    // ---------------- UPDATE ----------------
    test("should update user details", async () => {
        const user = await userRepository.createUser(userData);

        const updatedUser = await userRepository.updateOneUser(
            user._id.toString(),
            { fullName: "Updated Name", role: "admin" }
        );

        expect(updatedUser).not.toBeNull();
        expect(updatedUser?.fullName).toBe("Updated Name");
        expect(updatedUser?.role).toBe("admin");
    });

    test("should return null when updating non-existing user", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const result = await userRepository.updateOneUser(fakeId, {
            fullName: "Does Not Exist"
        });

        expect(result).toBeNull();
    });

    // ---------------- DELETE ----------------
    test("should delete user by id", async () => {
        const user = await userRepository.createUser(userData);

        const result = await userRepository.deleteOneUser(
            user._id.toString()
        );

        expect(result).toBe(true);
    });

    test("should return null when deleting non-existing user", async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();

        const result = await userRepository.deleteOneUser(fakeId);

        expect(result).toBeNull();
    });
});

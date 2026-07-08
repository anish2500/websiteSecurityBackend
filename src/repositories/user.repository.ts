import { IUser, UserModel } from "../models/user.model"; 
import { QueryFilter } from "mongoose";
export interface IUserRepository {
    // Removed getUserbyUsername as it is not in your current model
    getUserbyEmail(email: string): Promise<IUser | null>;

    // Five common CRUD functions
    createUser(data: Partial<IUser>): Promise<IUser>; 
    getUserById(id: string): Promise<IUser | null>; 
     getAllUsers(
        page: number, size: number, search?: string
    ): Promise<{users: IUser[], total: number}>;
    updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null>; 
    deleteOneUser(id: string): Promise<boolean | null>; 
}

export class UserRepository implements IUserRepository {
 
    // Create: Used for Signup
    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(data); 
        return await user.save();
    }

    // Read: Used for Login to find the user and check password
    async getUserbyEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "email": email });
        return user; 
    }

    // Read: Find a specific user by MongoDB ID
    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        return user; 
    }

    // Read: Fetch all users (useful for Admin dashboards)
     async getAllUsers(
        page: number, size: number, search?: string
    ): Promise<{users: IUser[], total: number}> {
        const filter: QueryFilter<IUser> = {};
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
            ];
        }
        const [users, total] = await Promise.all([
            UserModel.find(filter)
                .skip((page - 1) * size)
                .limit(size),
            UserModel.countDocuments(filter)
        ]);
        return { users, total };
    }

    // Update: Modify user details
     async updateOneUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        // UserModel.updateOne({ _id: id }, { $set: updateData });
        const updatedUser = await UserModel.findByIdAndUpdate(
            id, updateData, { new: true } // return the updated document
        );
        return updatedUser;
    }

    // Delete: Remove user from database
    async deleteOneUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id); 
        return result ? true : null; 
    }
}
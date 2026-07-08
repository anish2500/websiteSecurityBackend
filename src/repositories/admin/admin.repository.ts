import { IAdmin, AdminModel } from "../../models/admin/admin.model"; 

export interface IAdminRepository {
    getUserbyEmail(email: string): Promise<IAdmin | null>;
    createUser(data: Partial<IAdmin>): Promise<IAdmin>; 
    getUserById(id: string): Promise<IAdmin | null>; 
    getAllAdmins(): Promise<IAdmin[]>;
    updateOneAdmin(id: string, data: Partial<IAdmin>): Promise<IAdmin | null>; 
    deleteOneAdmin(id: string): Promise<boolean | null>; 
}

export class AdminRepository implements IAdminRepository {
 
    async createUser(data: Partial<IAdmin>): Promise<IAdmin> {
        const admin = new AdminModel(data); 
        return await admin.save();
    }

    async getUserbyEmail(email: string): Promise<IAdmin | null> {
        const admin = await AdminModel.findOne({ "email": email });
        return admin; 
    }

    async getUserById(id: string): Promise<IAdmin | null> {
        const admin = await AdminModel.findById(id);
        return admin; 
    }

    async getAllAdmins(): Promise<IAdmin[]> {
        const admins = await AdminModel.find();
        return admins;
    }

    async updateOneAdmin(id: string, data: Partial<IAdmin>): Promise<IAdmin | null> {
        const updatedAdmin = await AdminModel.findByIdAndUpdate(id, data, { new: true });
        return updatedAdmin; 
    }

    async deleteOneAdmin(id: string): Promise<boolean | null> {
        const result = await AdminModel.findByIdAndDelete(id); 
        return result ? true : null; 
    }
}
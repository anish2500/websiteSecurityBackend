import { Request, Response, NextFunction } from "express";
import { AdminService } from "../../services/admin/admin.service";
import { IAdmin } from "../../models/admin/admin.model";
import { UserService } from "../../services/user.service";
import {QueryParams} from "../../types/query.type";
import { OrderService } from "../../services/order.service";


import mongoose from "mongoose";

const adminService = new AdminService();
const userService = new UserService();
const orderService = new OrderService();

export class AdminController {
    async registerAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = req.body;
            const newAdmin = await adminService.registerAdmin(validatedData);
            
            const { password, ...adminResponse } = newAdmin.toObject();
            
            res.status(201).json({
                success: true,
                message: "Admin registered successfully",
                data: adminResponse
            });
        } catch (error) {
            next(error);
        }
    }

    async loginAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const loginData = req.body;
            const result = await adminService.loginAdmin(loginData);
            
            const { password, ...adminResponse } = result.admin.toObject();
            
            res.status(200).json({
                success: true,
                message: "Admin login successful",
                data: {
                    token: result.token,
                    admin: adminResponse
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getAdminProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = (req as any).user.id;
            const admin = await adminService.getAdminById(adminId);
            
            const { password, ...adminResponse } = admin.toObject();
            
            res.status(200).json({
                success: true,
                message: "Admin profile retrieved successfully",
                data: adminResponse
            });
        } catch (error) {
            next(error);
        }
    }

    async updateAdminProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = (req as any).user.id;
            const updateData = req.body;
            
            if (updateData.password) {
                delete updateData.password;
            }
            
            const updatedAdmin = await adminService.updateAdminProfile(adminId, updateData);
            
            if (!updatedAdmin) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }
            
            const { password, ...adminResponse } = updatedAdmin.toObject();
            
            res.status(200).json({
                success: true,
                message: "Admin profile updated successfully",
                data: adminResponse
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllAdmins(req: Request, res: Response, next: NextFunction) {
        try {
            const admins = await adminService.getAllAdmins();
            
            const adminsResponse = admins.map((admin: IAdmin) => {
                const { password, ...adminData } = admin.toObject();
                return adminData;
            });
            
            res.status(200).json({
                success: true,
                message: "All admins retrieved successfully",
                data: adminsResponse
            });
        } catch (error) {
            next(error);
        }
    }

    async getAdminById(req: Request, res: Response, next: NextFunction) {
        try {
            const { adminId } = req.params;
            const admin = await adminService.getAdminById(adminId);
            
            const { password, ...adminResponse } = admin.toObject();
            
            res.status(200).json({
                success: true,
                message: "Admin retrieved successfully",
                data: adminResponse
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { adminId } = req.params;
            const result = await adminService.deleteAdmin(adminId);
            
            res.status(200).json({
                success: true,
                message: "Admin deleted successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // User Management Methods for Admin
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, size, search }: QueryParams = req.query;
            const { users, pagination } = await adminService.getAllUsers(
                page, size, search
            );
            return res.status(200).json(
                { success: true, data: users, pagination: pagination, message: "All Users Retrieved" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid user ID" 
            });
        }

        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        const { password, ...userResponse } = user.toObject();
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: userResponse
        });
    } catch (error) {
        next(error);
    }
}

 async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid user ID" 
            });
        }

        const result = await userService.deleteUser(userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
}

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = req.body;
            
            // Handle file upload if present
            if (req.file) {
                userData.profilePicture = req.file.filename;
            }
            
            const newUser = await userService.registerUser(userData);
            
            // Construct full image URL for response
            if (newUser.profilePicture) {
                newUser.profilePicture = `${req.protocol}://${req.get('host')}/profile_pictures/${newUser.profilePicture}`;
            }
            
            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: newUser
            });
        } catch (error) {
            console.log(error)
            next(error);
        }
    }

async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid user ID" 
            });
        }

        const updateData = req.body;
        if (req.file) {
            updateData.profilePicture = req.file.filename;
        }

        const updatedUser = await userService.updateUser(userId, updateData);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Construct full image URL for response
        if (updatedUser.profilePicture) {
            updatedUser.profilePicture = `${req.protocol}://${req.get('host')}/profile_pictures/${updatedUser.profilePicture}`;
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
}

async getAllOrders (req: Request, res: Response, next: NextFunction){
    try {
        const orders = await orderService.getAllOrders();
        return res.status(200).json({
            success: true, 
            message: "All Orders retrieved Successfully",
            data: orders
        });
    }catch (error : any){
        return res.status(error.statusCode || 500).json ({
            success: false, 
            message: error.message || "Internal Server Error"
        });
    }
}

async getOrderByIdAdmin(req: Request, res: Response, next : NextFunction){
    try {
        const {orderId} = req.params; 
        const order  = await orderService.getOrderByIdAdmin(orderId);
        return res.status(200).json({
            success: true, 
            message: "Order retrieved Successfully", 
            data: order
        });
    } catch(error: any){
        return res.status(error.statusCode || 500).json({
            sucess: false, 
            message: error.message || "Internal Server Error"
        });
    }
}
}
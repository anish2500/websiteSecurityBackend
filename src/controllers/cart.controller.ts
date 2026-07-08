import { Request, Response } from "express";
import { CartService } from "../services/cart.service";
const cartService = new CartService();
export class CartController {
    async getCart(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            const cart = await cartService.getUserCart(userId!);
            return res.status(200).json({
                success: true,
                data: cart,
                message: "Cart fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
    async addToCart(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            const { plantId, quantity } = req.body;
            if (!plantId) {
                return res.status(400).json({
                    success: false,
                    message: "Plant ID is required"
                });
            }
            const cart = await cartService.addToCart(userId!, plantId, quantity || 1);
            return res.status(200).json({
                success: true,
                data: cart,
                message: "Item added to cart"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
    async updateCartItem(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            const { plantId } = req.params;
            const { quantity } = req.body;
            const cart = await cartService.updateCartItem(userId!, plantId, quantity);
            return res.status(200).json({
                success: true,
                data: cart,
                message: "Cart updated successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
    async removeFromCart(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            const { plantId } = req.params;
            const cart = await cartService.removeFromCart(userId!, plantId);
            return res.status(200).json({
                success: true,
                data: cart,
                message: "Item removed from cart"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
    async clearCart(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            await cartService.clearCart(userId!);
            return res.status(200).json({
                success: true,
                message: "Cart cleared successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { CartService } from "../services/cart.service";
import { PlantModel } from "../models/plant.model";
import { logActivity } from "../utils/activity-logger.util";
import { CreateOrderDTO } from "../dtos/order.dto";

const orderService = new OrderService();
const cartService = new CartService();

export class OrderController {
    async createOrder(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();

            const parsed = CreateOrderDTO.safeParse(req.body);
            if (!parsed.success){
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: parsed.error.flatten().fieldErrors
                });
            }

            const { items, totalAmount, shippingAddress, phone, paymentMethod, transactionId } = parsed.data;

            const order = await orderService.createOrder(userId!, items, totalAmount, shippingAddress, phone, {paymentMethod, transactionId});
            await logActivity(userId, "ORDER_CREATED", req, { orderId:order._id, totalAmount});
            await cartService.clearCart(userId!);

            return res.status(201).json({
                success: true,
                data: order,
                message: "Order placed successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getOrders(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            const orders = await orderService.getOrdersByUser(userId!);

            return res.status(200).json({
                success: true,
                data: orders,
                message: "Orders fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getOrderById(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            const { orderId } = req.params;
            const order = await orderService.getOrderById(userId!, orderId);

            return res.status(200).json({
                success: true,
                data: order,
                message: "Order fetched successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async clearOrder(req: Request, res: Response){
        try {
            const userId = req.user?._id?.toString();
            const {orderId} = req.params; 

            await orderService.clearOrder(userId!, orderId);

            return res.status(200).json({
                success: true,
                message: "Order cancelled successfully"
            });
        }catch (error: any){
            return res.status(error.statusCode || 500).json({
                success: false, 
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updatePaymentStatus (req: Request, res: Response) {
        try {
            const { orderId} = req.params; 
            const {paymentStatus, transactionId} = req.body; 
            const order = await orderService.updatePaymentStatus(orderId, paymentStatus, transactionId);

            if (paymentStatus === 'paid' && order && order.items) {
                for (const item of order.items) {
                    await PlantModel.findByIdAndUpdate(item.plantId, {
                        $inc: { stock: -item.quantity }
                    });
                }
            }

            return res.status(200).json({success: true, data: order});
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async refundOrder(req: Request, res: Response){
        const {orderId} = req.params; 
        const order = await orderService.refundOrder(orderId);
        return res.status(200).json({success: true, data: order});
    }
}

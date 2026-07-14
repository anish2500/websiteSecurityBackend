import { z } from "zod";

export const CreateOrderDTO = z.object({
    items: z.array(z.object({
        plantId: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
    })).min(1, "Order must contain at least one item"),
    totalAmount: z.number().positive(),
    shippingAddress: z.string().min(5, "Shipping address is required"),
    phone: z.string().min(7, "Valid phone number is required"),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional(),
});

export type CreateOrderDTO = z.infer<typeof CreateOrderDTO>;

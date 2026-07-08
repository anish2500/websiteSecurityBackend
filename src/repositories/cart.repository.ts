import { ICart, CartModel } from "../models/cart.model";
import { CartItemType } from "../types/cart.type";
export interface ICartRepository {
    getCartByUserId(userId: string): Promise<ICart | null>;
    createCart(userId: string): Promise<ICart>;
    addItem(userId: string, item: CartItemType): Promise<ICart>;
    updateItemQuantity(userId: string, plantId: string, quantity: number): Promise<ICart>;
    removeItem(userId: string, plantId: string): Promise<ICart>;
    clearCart(userId: string): Promise<void>;
}
export class CartRepository implements ICartRepository {
    async getCartByUserId(userId: string): Promise<ICart | null> {
        return await CartModel.findOne({ userId }).populate('items.plantId');
    }
    async createCart(userId: string): Promise<ICart> {
        const cart = new CartModel({ userId, items: [], totalAmount: 0 });
        return await cart.save();
    }
    async addItem(userId: string, item: CartItemType): Promise<ICart> {
        let cart = await CartModel.findOne({ userId });
        
        if (!cart) {
            cart = await this.createCart(userId);
        }
        const existingItemIndex = cart.items.findIndex(
            (i:CartItemType) => i.plantId.toString() === item.plantId
        );
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += item.quantity;
            cart.items[existingItemIndex].price = item.price;
        } else {
            cart.items.push(item);
        }
        cart.totalAmount = cart.items.reduce(
            (sum:number, item:CartItemType) => sum + (item.price * item.quantity), 0
        );
        return await cart.save();
    }
    async updateItemQuantity(userId: string, plantId: string, quantity: number): Promise<ICart> {
        const cart = await CartModel.findOne({ userId });
        
        if (!cart) {
            throw new Error("Cart not found");
        }
        const itemIndex = cart.items.findIndex(
            (i:CartItemType) => i.plantId.toString() === plantId
        );
        if (itemIndex === -1) {
            throw new Error("Item not found in cart");
        }
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }
        cart.totalAmount = cart.items.reduce(
            (sum:number, item:CartItemType) => sum + (item.price * item.quantity), 0
        );
        return await cart.save();
    }
    async removeItem(userId: string, plantId: string): Promise<ICart> {
        const cart = await CartModel.findOne({ userId });
        
        if (!cart) {
            throw new Error("Cart not found");
        }
        cart.items = cart.items.filter(
            (i:CartItemType) => i.plantId.toString() !== plantId
        );
        cart.totalAmount = cart.items.reduce(
            (sum:number, item:CartItemType) => sum + (item.price * item.quantity), 0
        );
        return await cart.save();
    }
    async clearCart(userId: string): Promise<void> {
        await CartModel.findOneAndUpdate(
            { userId },
            { items: [], totalAmount: 0 }
        );
    }
}
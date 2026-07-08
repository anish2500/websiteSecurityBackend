import { CartRepository } from "../repositories/cart.repository";
import { PlantRepository } from "../repositories/plant.repository";
import { HttpError } from "../errors/http-error";
const cartRepository = new CartRepository();
const plantRepository = new PlantRepository();
export class CartService {
    async getUserCart(userId: string) {
        const cart = await cartRepository.getCartByUserId(userId);
        
        if (!cart) {
            return cartRepository.createCart(userId);
        }
        
        return cart;
    }
    async addToCart(userId: string, plantId: string, quantity: number = 1) {
        const plant = await plantRepository.getPlantById(plantId);
        
        if (!plant) {
            throw new HttpError(404, "Plant not found");
        }
        const item = {
            plantId,
            quantity,
            price: plant.price
        };
        return await cartRepository.addItem(userId, item);
    }
    async updateCartItem(userId: string, plantId: string, quantity: number) {
        return await cartRepository.updateItemQuantity(userId, plantId, quantity);
    }
    async removeFromCart(userId: string, plantId: string) {
        return await cartRepository.removeItem(userId, plantId);
    }
    async clearCart(userId: string) {
        await cartRepository.clearCart(userId);
    }
}
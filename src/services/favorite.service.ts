import { FavoriteRepository } from "../repositories/favorite.repository";
import { PlantRepository } from "../repositories/plant.repository";
import { HttpError } from "../errors/http-error";


const favoriteRepository = new FavoriteRepository();
const plantRepository = new PlantRepository();

export class FavoriteService{
    async getUserFavorites(userId: string){
        const favorite = await favoriteRepository.getFavoriteByUserId(userId);

        if(!favorite){
            return { userId, plants: [] };
        }

        return favorite; 
    }

    async addToFavorites (userId: string, plantId: string){
        const plant = await plantRepository.getPlantById(plantId);

        if(!plant){
            throw new HttpError(404, "Plant not found");
        }

        return await favoriteRepository.addPlant(userId, plantId);
    }

    async removeFromFavorites(userId: string, plantId: string){
        return await favoriteRepository.removePlant(userId, plantId);
    }

    async isFavorite(userId:string, plantId: string){
        return await favoriteRepository.isPlantFavorited(userId, plantId);
    }
}
import { IFavorite, FavoriteModel } from "../models/favorite.model";
import mongoose from "mongoose";

export interface IFavoriteRepository {
    getFavoriteByUserId(userId: string): Promise<IFavorite | null>;
    addPlant(userId:string, plantId:string): Promise<IFavorite>;
    removePlant(userId:string, plantId:string) : Promise<boolean>;
    isPlantFavorited(userId: string, plantId:string) : Promise<boolean>;
}

export class FavoriteRepository implements IFavoriteRepository{
    async addPlant(userId: string, plantId: string): Promise<IFavorite> {
        if (!plantId || plantId.trim() === "") {
            throw new Error("Plant ID is required");
        }

        let favorite = await FavoriteModel.findOne({userId});

        if(!favorite){
            favorite = new FavoriteModel({userId, plants: []});
        }

        const plantExists = favorite.plants.some(
          (p:mongoose.Types.ObjectId) => p.toString() === plantId 
        );

        if (!plantExists){
            favorite.plants.push(plantId as any);

        }
        return await favorite.save();
    }
    async removePlant(userId: string, plantId: string): Promise<boolean> {
        const favorite = await FavoriteModel.findOne({userId});
        if(!favorite) {
            throw new Error("Favorite not found");
        }
        favorite.plants = favorite.plants.filter(
            (p: mongoose.Types.ObjectId) => p.toString() !== plantId
        );
        return await favorite.save();
    }
    async isPlantFavorited(userId: string, plantId: string): Promise<boolean> {
        const favorite = await FavoriteModel.findOne({userId});
        if(!favorite) return false; 
        return favorite.plants.some((p: mongoose.Types.ObjectId) => p.toString() === plantId);
    }
    async getFavoriteByUserId(userId: string): Promise<IFavorite | null> {
        return await FavoriteModel.findOne({ userId}).populate('plants');
    }



}
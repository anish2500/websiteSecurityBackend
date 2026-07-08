import { Request, Response } from "express";
import { FavoriteService } from "../services/favorite.service";
import { success } from "zod";

const favoriteService = new FavoriteService();


export class FavoriteController {
    async getFavorites(req: Request, res: Response){
        try {
            const userId = req.user?._id?.toString();
            const favorites = await favoriteService.getUserFavorites(userId!);
            return res.status(200).json({
                success: true, 
                data: favorites, 
                message: "Favorites fetched successfully"
            });

        }catch(error: any){
            return res.status(error.statusCode || 500).json({
                success: false, 
                message: error.message || "Internal Server Error"
            });
        }
    }

    async addToFavorites(req: Request, res: Response){
        try{
            const userId = req.user?._id?.toString();
            const { plantId} = req.body; 
            
            if(!plantId){
                return res.status(400).json({
                    success: false, 
                    message: "Plant ID is required"
                });
            }
            const favorites = await favoriteService.addToFavorites(userId!, plantId);
            return res.status(200).json({
                success: true, 
                data: favorites, 
                message: "Plant added to favorites"
            });
        } catch (error: any){
            return res.status(error.statusCode || 500).json({
                success: false, 
                message: error.message || "Internal Server Error"
            });
        }


    }

    async removeFromFavorites (req: Request, res: Response){
        try {
            const userId  = req.user?._id?.toString();
            const {plantId} = req.params; 

            const favorites = await favoriteService.removeFromFavorites(userId!, plantId);
            return res.status(200).json({
                success: true, 
                data: favorites, 
                message: "Plant removed from favorites"
            });
        }catch (error: any){
            return res.status(error.statusCode || 500).json({
                success : false, 
                message: error.message || "Internal server Error"
            });
        }
    }

    async checkIsFavorited(req: Request, res: Response){
        try {
            const userId = req.user?._id?.toString();
            const {plantId} = req.params; 

            const isFavorited = await favoriteService.isFavorite(userId!, plantId);
            return res.status(200).json({
                success: true, 
                data : {isFavorited}, 
                message: "Checked successfully"
            });
        }catch (error: any){
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || "Internal Server Error "
            });
        }
    }
}
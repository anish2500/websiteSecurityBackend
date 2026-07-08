import { PlantService } from "../services/plant.service";
import {Request, Response} from "express";
import { QueryParams } from "../types/query.type";
import { success } from "zod";


let plantService  = new PlantService();


export class PlantController {
    async getAllPlant(req: Request, res: Response){
        try {
            const {page, size, search, category, minPrice, maxPrice} : QueryParams = req.query; 

            const {plant, pagination} = 
                await plantService.getAllPlants(page, size, search, category, minPrice ? parseInt(minPrice) : undefined, maxPrice ? parseInt(maxPrice) : undefined);


            return res.status(200).json({
                success: true, 
                data: plant, 
                pagination : pagination,
                message : "Plant Fetched", 

            });    
        } catch (error : any){
            return res.status(error.statusCode || 500).json({
                success: false, 
                message: error.message || "Internal Server Error",
            });
        }


    }


    async getPlantDetails(req: Request, res: Response){
        try{
            const plantId = req.params.id; 
            const plant = await plantService.getPlantDetails(plantId);

            return res.status(200).json({
                success: true, 
                message: "Plant Details Fetched",
                data: plant, 
            });
        } catch (error: any){
            return res.status(error.statusCode ?? 500).json({
                success: false, 
                message: error.message || "Internal Server Error",
            });
        }
    }
}
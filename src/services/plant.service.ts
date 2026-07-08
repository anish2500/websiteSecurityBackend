

import { CreatePlantDTO, UpdatePlantDTO } from "../dtos/plant.dto";
import { PlantRepository } from "../repositories/plant.repository";
import { HttpError } from "../errors/http-error";

let plantRepository = new PlantRepository();

export class PlantService {
    async getAllPlants (page?: string, size?: string, search?: string, category?:string, minPrice?: number, maxPrice?:number){
        const pageNumber = page? parseInt(page) : 1; 
        
        const pageSize = size ? parseInt(size) : 12; 

        const {plant, total} = await plantRepository.getAllPlant(
            pageNumber, 
            pageSize, 
            search, 
            category, 
            minPrice, 
            maxPrice
        );

        return {
            plant, 
            pagination : {
                page: pageNumber, 
                size: pageSize, 
                totalItems : total, 
                totalPages : Math.ceil(total / pageSize),
            },
        };
    }

    async getPlantDetails(plantId: string){
        const plant = await plantRepository.getPlantById(plantId);

        if(!plant){
            throw new HttpError(404, "Plant not found");
        }

        return plant; 
    }
}
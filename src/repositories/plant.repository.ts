import { QueryFilter } from "mongoose";
import { PlantModel, IPlant } from "../models/plant.model";


export interface IPlantRepository {
    createPlant(plantData: Partial<IPlant>): Promise<IPlant>;
    getPlantById(id: string): Promise<IPlant | null>;
    
    getAllPlant(
        page: number, 
        size: number, 
        search?: string, 
    ): Promise<{plant: IPlant[]; total: number}>;
    updateOnePlant(
        id: string, 
        data: Partial<IPlant>
    ): Promise <IPlant | null>;

    deleteOnePlant (id: string) : Promise<boolean | null>;

    updateOnePlant(
        id: string, 
        updateData: Partial<IPlant>
    ): Promise<IPlant | null>;

    updatePlant(
        id: string, 
        updatedData: Partial<IPlant>
    ): Promise<IPlant | null>;

    deletePlant(id: string) : Promise<boolean>;
}


export class PlantRepository implements IPlantRepository {
    async createPlant (plantData: Partial<IPlant>): Promise<IPlant>{
        const plant  = new PlantModel(plantData);
        return await plant.save();
    }


    async getPlantById(id: string): Promise<IPlant | null> {
        const plant = await PlantModel.findById(id);
        return plant; 
    }

    async getAllPlant(page: number, size: number, search?: string ,category?:string,  minPrice?:number, maxPrice?:number): Promise<{ plant: IPlant[]; total: number; }> {
        
        const filter : QueryFilter<IPlant>  = {};

        if(search) {
            filter.$or = [
                {name: {$regex : search, $options: "i"}},
                {description : {$regex : search, $options : "i"}},
                
            ];
        }
        if(category){
            filter.category =category;
        }

        if(minPrice!==undefined ||maxPrice!==undefined){
            filter.price = {};
            if(minPrice !==undefined) filter.price.$gte = minPrice;
            if(maxPrice !==undefined) filter.price.$lte = maxPrice; 
        }
        

        const [plant, total] = await Promise.all([
            PlantModel.find(filter)
                .sort({createdAt : -1})
                .skip((page - 1) *size)
                .limit(size),
              PlantModel.countDocuments(filter),  
        ]);

       

        return {plant, total};
    }

    async updateOnePlant (
        id: string, 
        data: Partial<IPlant>

    ): Promise<IPlant | null>{
        const updatedPlant = await PlantModel.findByIdAndUpdate(
            id, 
            data, {new: true}
        );

        return updatedPlant;
    }


    async deleteOnePlant(id: string): Promise<boolean | null> {
        const result = await PlantModel.findByIdAndDelete(id);
        return result ? true: null;
    }


    async updatePlant(id: string, updatedData: Partial<IPlant>): Promise<IPlant | null> {
        const updatedPlant = await PlantModel.findByIdAndUpdate(
            id, 
            updatedData, 
            { new : true, runValidators : true}
        );

        return updatedPlant;
    }

    async deletePlant(id: string): Promise<boolean> {
        const result = await PlantModel.findByIdAndDelete(id);
        return result ? true : false; 
    }


}
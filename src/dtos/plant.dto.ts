import z from "zod";
import { PlantSchema } from "../types/plant.type";

export const CreatePlantDTO = PlantSchema.pick(
    {
        name: true, 
        description: true, 
        category: true, 
        price: true, 
        stock: true, 
        plantImage : true, 
    }
);


export type CreatePlantDTO = z.infer<typeof CreatePlantDTO>;

export const UpdatePlantDTO = PlantSchema.partial();

export type UpdatePlantDTO = z.infer<typeof UpdatePlantDTO>;


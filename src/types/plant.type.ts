import z from "zod";

export const PlantSchema   = z.object({
   name : z.string().min(3, 'plant name must be at least 3 characters'),
   description : z.string().min(10, 'Description must be at least 10 characters'),
    category : z.enum(
        ["INDOOR", "OUTDOOR", "FLOWERING"], 
        {message : "Please select a valid plant category"},
    ),

    price : z.coerce.number().positive("Price must be a positive number"),
    stock : z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
    plantImage : z.array(z.string()).optional(),

});

export type PlantType = z.infer<typeof PlantSchema>;


export enum PlantCategoryEnum {
    INDOOR = "INDOOR", 
    OUTDOOR = "OUTDOOR", 
    FLOWERING = "FLOWERING"
}
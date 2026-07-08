import mongoose , {Document, Schema} from "mongoose"
import { PlantType, PlantCategoryEnum } from "../types/plant.type"
import { Doc } from "zod/v4/core"

const PlantSchema : Schema = new Schema <PlantType>(
    {
        name: {
            type: String, 
            required : true, 
            minLength: 3, 
        },

        description: {
            type: String, 
            requrired : true, 
            minLength: 10, 
        }, 

        category: {
            type: String,
            enum: Object.values(PlantCategoryEnum),
            required:true,
        },

        price: {
            type: Number, 
            required: true, 

        },
        stock: {
            type: Number, 
            required: true, 
            default: 0,
        },

        plantImage : [
            {
            type: String, 
            required : true, 
            }
          
        ],


    },

    {
        timestamps : true, 
    }
);



export interface IPlant extends PlantType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date; 
    updatedAt: Date;  
}

export const PlantModel = mongoose.model <IPlant>('Plant', PlantSchema);
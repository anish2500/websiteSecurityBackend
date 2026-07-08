import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const MONGODB_URI: string = 
    process.env.MONGODB_URI || 'mongodb://localhost:27017/35a_backend';// this is the backup database 
// Application level constants, with fallbacks 
// databse path is called here as well 


export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'default_secret'
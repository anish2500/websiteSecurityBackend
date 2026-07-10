import mongoose from "mongoose"; 
import bcryptjs from "bcryptjs";
import { AdminModel } from "../models/admin/admin.model";
import { MONGODB_URI } from "../config";


async function seedAdmin(){
    const email = process.env.SEED_ADMIN_EMAIL; 
    const password = process.env.SEED_ADMIN_PASSWORD; 
    if(!email || !password){
        console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env before running this. ");
        process.exit(1); 
    }

    await mongoose.connect(MONGODB_URI); 
   const existing = await AdminModel.findOne({ email});
if (existing){
    console.log("Admin already exists for this email, aborting");
    process.exit(0);
}


    const hashedPassword = await bcryptjs.hash(password, 12);
    await AdminModel.create({ email, password: hashedPassword, username: email.split("@")[0], role: "admin"});
    console.log("Seed admin created: ", email);
    process.exit(0);
}

seedAdmin();
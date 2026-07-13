import { Request} from "express"; 
import { ActivityLogModel } from "../models/activity-log.model";


export async function logActivity(userId: string | undefined, action: string, req: Request, metadata: object = {}){
    try {
        await ActivityLogModel.create({
            userId, 
            action, 
            ip: req.ip, 
            userAgent: req.headers["user-agent"], 
            metadata, 

        });
    } catch (e){
        console.error("Activity log write failed", e);
    }
}




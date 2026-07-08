import { Router } from "express";
import { PlantController } from "../controllers/plant.controller";

let plantController = new PlantController();
const router = Router();

router.get("/", plantController.getAllPlant);
router.get("/:id", plantController.getPlantDetails);

export default router;
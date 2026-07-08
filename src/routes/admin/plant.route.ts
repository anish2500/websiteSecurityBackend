import { Router } from "express";
import { AdminPlantController } from "../../controllers/admin/plant.controller";
import { authorizedMiddleware, isAdmin } from "../../middlewares/authorization.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { Types } from "mongoose";

const router = Router();
const adminPlantController = new AdminPlantController();

// Apply authentication + admin check
router.use(authorizedMiddleware);
router.use(isAdmin);

// -------------------- Plant Routes --------------------

// Create a new plant
router.post(
  "/",
  upload.single("plantImage"),
  adminPlantController.createPlant.bind(adminPlantController)
);

// Get all plants with optional pagination & search
router.get("/", adminPlantController.getAllPlant.bind(adminPlantController));

// Validate Plant ID for dynamic routes
const validatePlantId = (req: any, res: any, next: any) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid Plant ID" });
  }
  next();
};

// Get plant by ID
router.get("/:id", validatePlantId, adminPlantController.getPlantById.bind(adminPlantController));

// Update plant by ID
router.put(
  "/:id",
  validatePlantId,
  upload.single("plantImage"),
  adminPlantController.updatePlant.bind(adminPlantController)
);

// Delete plant by ID
router.delete("/:id", validatePlantId, adminPlantController.deletePlant.bind(adminPlantController));

// Restock plant
router.patch("/:id/restock", validatePlantId, adminPlantController.restockPlant.bind(adminPlantController));

export default router;

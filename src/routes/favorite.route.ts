import { Router } from "express";
import { FavoriteController } from "../controllers/favorite.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const favoriteController = new FavoriteController();
const router = Router();


router.use(authorizedMiddleware);

router.get("/", favoriteController.getFavorites);
router.post("/", favoriteController.addToFavorites);
router.delete("/:plantId", favoriteController.removeFromFavorites);
router.get("/:plantId", favoriteController.checkIsFavorited);

export default router; 
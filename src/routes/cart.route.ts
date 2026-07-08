import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const cartController = new CartController();
const router = Router();

router.use(authorizedMiddleware);

router.get(
    "/", cartController.getCart
);
router.post("/", cartController.addToCart);
router.put("/:plantId", cartController.updateCartItem);
router.delete(
    "/:plantId", cartController.removeFromCart
);

export default router; 
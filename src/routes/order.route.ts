import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authorizedMiddleware, isAdmin } from "../middlewares/authorization.middleware";
import { orderLimiter, paymentActionLimiter } from "../middlewares/rate-limit.middleware";

const orderController = new OrderController();
const router = Router();

router.use(authorizedMiddleware);

router.post("/",orderLimiter,  orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:orderId", orderController.getOrderById);
router.delete("/:orderId", orderController.clearOrder);

router.patch("/:orderId/payment",isAdmin, paymentActionLimiter,  orderController.updatePaymentStatus);
router.post("/:orderId/refund" ,isAdmin,  paymentActionLimiter, orderController.refundOrder);

export default router;

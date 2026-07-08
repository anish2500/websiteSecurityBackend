import { Router } from "express";
import { AdminController } from "../../controllers/admin/admin.controller";
import { authorizedMiddleware, isAdmin } from "../../middlewares/authorization.middleware";
import { uploadProfilePicture } from "../../middlewares/upload.middleware";

const router = Router();
const adminController = new AdminController();

// Public admin routes (no admin access required)
router.post("/register", adminController.registerAdmin.bind(adminController));
router.post("/login", adminController.loginAdmin.bind(adminController));

// Apply authentication to all admin routes
router.use(authorizedMiddleware);

// Apply admin access check to protected routes
router.use(isAdmin);

// Admin profile and management routes (protected)
router.get("/profile", adminController.getAdminProfile.bind(adminController));
router.put("/profile", adminController.updateAdminProfile.bind(adminController));
router.get("/", adminController.getAllAdmins.bind(adminController));
router.get("/:adminId", adminController.getAdminById.bind(adminController));
router.delete("/:adminId", adminController.deleteAdmin.bind(adminController));

// User Management Routes for Admin
router.get("/users/all", adminController.getAllUsers.bind(adminController));
router.get("/users/:userId", adminController.getUserById.bind(adminController));
router.post("/users", uploadProfilePicture.single('profilePicture'), adminController.createUser.bind(adminController));
router.put("/users/:userId", uploadProfilePicture.single('profilePicture'), adminController.updateUser.bind(adminController));
router.delete("/users/:userId", adminController.deleteUser.bind(adminController));


//Order Management Routes for Admin 
router.get("/orders/all", adminController.getAllOrders.bind(adminController));
router.get("/orders/:orderId", adminController.getOrderByIdAdmin.bind(adminController));

export default router;
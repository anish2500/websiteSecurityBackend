import { OrderService } from "../../../services/order.service";
import { OrderModel } from "../../../models/order.model";
import { HttpError } from "../../../errors/http-error";
jest.mock("../../../models/order.model");
describe("OrderService Unit Tests", () => {
    let orderService: OrderService;
    beforeEach(() => {
        orderService = new OrderService();
        jest.clearAllMocks();
    });
    describe("createOrder", () => {
        it("should create a new order with items and totalAmount", async () => {
            const mockOrder = {
                _id: "order-id-123",
                userId: "user-id-123",
                items: [{ plantId: "plant-1", quantity: 2, price: 100 }],
                totalAmount: 200,
                paymentMethod: "cash_on_delivery",
                paymentStatus: "pending",
            };
            (OrderModel.create as jest.Mock).mockResolvedValue(mockOrder);
            const result = await orderService.createOrder(
                "user-id-123",
                [{ plantId: "plant-1", quantity: 2, price: 100 }],
                200
            );
            expect(OrderModel.create).toHaveBeenCalledWith({
                userId: "user-id-123",
                items: [{ plantId: "plant-1", quantity: 2, price: 100 }],
                totalAmount: 200,
                paymentMethod: "cash_on_delivery",
                paymentStatus: "pending",
            });
            expect(result).toEqual(mockOrder);
        });
        it("should create order with payment info when provided", async () => {
            const mockOrder = {
                _id: "order-id-123",
                userId: "user-id-123",
                items: [{ plantId: "plant-1", quantity: 1, price: 50 }],
                totalAmount: 50,
                paymentMethod: "stripe",
                transactionId: "txn-123",
                paymentStatus: "paid",
                paidAt: new Date(),
            };
            (OrderModel.create as jest.Mock).mockResolvedValue(mockOrder);
            const result = await orderService.createOrder(
                "user-id-123",
                [{ plantId: "plant-1", quantity: 1, price: 50 }],
                50,
                { paymentMethod: "stripe", transactionId: "txn-123" }
            );
            expect(result.paymentStatus).toBe("paid");
            expect(result.transactionId).toBe("txn-123");
        });
    });
    describe("getOrdersByUser", () => {
        it("should return all orders for a specific user", async () => {
            const mockOrders = [
                { _id: "order-1", userId: "user-1", totalAmount: 100 },
                { _id: "order-2", userId: "user-1", totalAmount: 200 },
            ];
            (OrderModel.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockOrders),
                }),
            });
            const result = await orderService.getOrdersByUser("user-1");
            expect(OrderModel.find).toHaveBeenCalledWith({ userId: "user-1" });
            expect(result).toEqual(mockOrders);
        });
    });
    describe("getOrderById", () => {
        it("should return order by ID for a user", async () => {
            const mockOrder = { _id: "order-1", userId: "user-1", totalAmount: 100 };
            (OrderModel.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockOrder),
            });
            const result = await orderService.getOrderById("user-1", "order-1");
            expect(result).toEqual(mockOrder);
        });
        it("should throw 404 if order not found", async () => {
            (OrderModel.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });
            await expect(orderService.getOrderById("user-1", "invalid-order")).rejects.toThrow(
                new HttpError(404, "Order not found")
            );
        });
    });
    describe("clearOrder", () => {
        it("should delete an order successfully", async () => {
            const mockOrder = { _id: "order-1", userId: "user-1" };
            (OrderModel.findOneAndDelete as jest.Mock).mockResolvedValue(mockOrder);
            const result = await orderService.clearOrder("user-1", "order-1");
            expect(OrderModel.findOneAndDelete).toHaveBeenCalledWith({
                _id: "order-1",
                userId: "user-1",
            });
            expect(result).toEqual(mockOrder);
        });
        it("should throw 404 if order not found", async () => {
            (OrderModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);
            await expect(orderService.clearOrder("user-1", "invalid-order")).rejects.toThrow(
                new HttpError(404, "Order not found")
            );
        });
    });

});
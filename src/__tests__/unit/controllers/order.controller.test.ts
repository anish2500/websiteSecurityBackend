import { Request, Response } from "express";
import { OrderController } from "../../../controllers/order.controller";
import { OrderService } from "../../../services/order.service";
import { CartService } from "../../../services/cart.service";

// Mock services
jest.mock("../../../services/order.service");
jest.mock("../../../services/cart.service");

describe("OrderController Unit Tests", () => {
  let orderController: OrderController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  let orderServiceMock: jest.Mocked<OrderService>;
  let cartServiceMock: jest.Mocked<CartService>;

  beforeEach(() => {
    orderController = new OrderController();

    orderServiceMock = new OrderService() as jest.Mocked<OrderService>;
    cartServiceMock = new CartService() as jest.Mocked<CartService>;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================
  // 1️⃣ CREATE ORDER SUCCESS
  // =========================================
  it("should create order successfully", async () => {
    mockRequest = {
      user: { _id: "123" },
      body: {
        items: [{ productId: "1", quantity: 2 }],
        totalAmount: 200,
        paymentMethod: "COD",
        transactionId: "txn_001",
      },
    } as any;

    orderServiceMock.createOrder.mockResolvedValue({
      _id: "order123",
      totalAmount: 200,
    } as any);

    cartServiceMock.clearCart.mockResolvedValue(undefined);

    await orderController.createOrder(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Order placed successfully",
      })
    );
  });

  // =========================================
  // 2️⃣ CREATE ORDER VALIDATION FAIL
  // =========================================
  it("should return 400 if items or totalAmount missing", async () => {
    mockRequest = {
      user: { _id: "123" },
      body: {}, // Missing required fields
    } as any;

    await orderController.createOrder(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Items and totalAmount are required",
      })
    );
  });

  // =========================================
  // 3️⃣ GET ORDERS SUCCESS
  // =========================================
  it("should fetch orders successfully", async () => {
    mockRequest = {
      user: { _id: "123" },
    } as any;

    orderServiceMock.getOrdersByUser.mockResolvedValue([
      { _id: "order1" },
      { _id: "order2" },
    ] as any);

    await orderController.getOrders(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Orders fetched successfully",
      })
    );
  });
});
import { CartRepository } from "../../../repositories/cart.repository";
import { CartModel } from "../../../models/cart.model";

jest.mock("../../../models/cart.model");

describe("CartRepository Unit Tests", () => {
  let cartRepository: CartRepository;

  beforeEach(() => {
    cartRepository = new CartRepository();
    jest.clearAllMocks();
  });

  // =========================================
  // 1️⃣ ADD ITEM (creates cart if not exists)
  // =========================================
it("should add item to existing cart", async () => {
  const mockCart: any = {
    userId: "123",
    items: [],
    totalAmount: 0,
    save: jest.fn().mockResolvedValue({
      userId: "123",
      items: [{ plantId: "p1", quantity: 2, price: 100 }],
      totalAmount: 200,
    }),
  };

  (CartModel.findOne as jest.Mock).mockResolvedValue(mockCart);

  const result = await cartRepository.addItem("123", {
    plantId: "p1",
    quantity: 2,
    price: 100,
  });

  expect(mockCart.items.length).toBe(1);
  expect(mockCart.totalAmount).toBe(200);
  expect(mockCart.save).toHaveBeenCalled();
});

  it("should update item quantity correctly", async () => {
    const mockCart: any = {
      userId: "123",
      items: [
        {
          plantId: { toString: () => "p1" },
          quantity: 1,
          price: 100,
        },
      ],
      totalAmount: 100,
      save: jest.fn().mockResolvedValue(true),
    };

    (CartModel.findOne as jest.Mock).mockResolvedValue(mockCart);

    await cartRepository.updateItemQuantity("123", "p1", 3);

    expect(mockCart.items[0].quantity).toBe(3);
    expect(mockCart.save).toHaveBeenCalled();
  });


  it("should remove item and recalculate total", async () => {
    const mockCart: any = {
      userId: "123",
      items: [
        { plantId: { toString: () => "p1" }, quantity: 2, price: 100 },
        { plantId: { toString: () => "p2" }, quantity: 1, price: 50 },
      ],
      totalAmount: 250,
      save: jest.fn().mockResolvedValue({
        userId: "123",
        items: [
          { plantId: { toString: () => "p2" }, quantity: 1, price: 50 },
        ],
        totalAmount: 50,
      }),
    };

    (CartModel.findOne as jest.Mock).mockResolvedValue(mockCart);

    const result = await cartRepository.removeItem("123", "p1");

    expect(result.totalAmount).toBe(50);
    expect(mockCart.save).toHaveBeenCalled();
  });
});
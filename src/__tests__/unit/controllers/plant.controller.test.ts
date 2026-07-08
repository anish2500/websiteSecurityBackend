import { Request, Response } from "express";
import { PlantController } from "../../../controllers/plant.controller";
import { PlantService } from "../../../services/plant.service";

describe("PlantController Unit Tests", () => {
  let plantController: PlantController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    plantController = new PlantController();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =========================================
  // 1️⃣ GET ALL PLANTS SUCCESS
  // =========================================
  it("should fetch all plants successfully", async () => {
    mockRequest = {
      query: {
        page: "1",
        size: "10",
        search: "rose",
        category: "flower",
        minPrice: "100",
        maxPrice: "500",
      },
    };

    jest.spyOn(PlantService.prototype, "getAllPlants")
      .mockResolvedValue({
        plant: [{ _id: "1", name: "Rose" }],
        pagination: { total: 1, page: 1, size: 10 },
      } as any);

    await plantController.getAllPlant(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Plant Fetched",
      })
    );
  });

  // =========================================
  // 2️⃣ GET PLANT DETAILS SUCCESS
  // =========================================
  it("should fetch plant details successfully", async () => {
    mockRequest = {
      params: { id: "plant123" },
    };

    jest.spyOn(PlantService.prototype, "getPlantDetails")
      .mockResolvedValue({
        _id: "plant123",
        name: "Snake Plant",
      } as any);

    await plantController.getPlantDetails(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Plant Details Fetched",
      })
    );
  });

  // =========================================
  // 3️⃣ ERROR CASE
  // =========================================
  it("should return 500 if service throws error", async () => {
    mockRequest = {
      params: { id: "wrongId" },
    };

    jest.spyOn(PlantService.prototype, "getPlantDetails")
      .mockRejectedValue({
        statusCode: 500,
        message: "Plant not found",
      });

    await plantController.getPlantDetails(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Plant not found",
      })
    );
  });
});
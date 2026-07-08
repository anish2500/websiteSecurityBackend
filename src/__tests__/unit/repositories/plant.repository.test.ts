import { PlantRepository } from "../../../repositories/plant.repository";
import { PlantModel } from "../../../models/plant.model";

jest.mock("../../../models/plant.model");

describe("PlantRepository Unit Tests", () => {
  let plantRepository: PlantRepository;

  beforeEach(() => {
    plantRepository = new PlantRepository();
    jest.clearAllMocks();
  });


  it("should create a new plant", async () => {
    const mockPlant = {
      name: "Rose",
      price: 100,
      save: jest.fn().mockResolvedValue({ name: "Rose", price: 100 }),
    };

    (PlantModel as any).mockImplementation(() => mockPlant);

    const result = await plantRepository.createPlant({ name: "Rose", price: 100 });

    expect(result.name).toBe("Rose");
    expect(result.price).toBe(100);
    expect(mockPlant.save).toHaveBeenCalled();
  });


 
  it("should return paginated plants", async () => {
    const mockPlants = [{ name: "Rose" }, { name: "Tulip" }];
    (PlantModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockPlants),
    });
    (PlantModel.countDocuments as jest.Mock).mockResolvedValue(2);

    const result = await plantRepository.getAllPlant(1, 10);

    expect(result.plant.length).toBe(2);
    expect(result.total).toBe(2);
    expect(PlantModel.find).toHaveBeenCalled();
    expect(PlantModel.countDocuments).toHaveBeenCalled();
  });

  it("should delete a plant and return true if exists", async () => {
    (PlantModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ name: "Rose" });

    const result = await plantRepository.deletePlant("plantId123");

    expect(result).toBe(true);
    expect(PlantModel.findByIdAndDelete).toHaveBeenCalledWith("plantId123");
  });
});
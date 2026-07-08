import { PlantRepository } from "../../repositories/plant.repository";
import { HttpError } from "../../errors/http-error";
import { CreatePlantDTO, UpdatePlantDTO } from "../../dtos/plant.dto";

let plantRepository = new PlantRepository();

export class AdminPlantService {
  async createPlant(data: CreatePlantDTO) {
    const newPlant = await plantRepository.createPlant(data);
    return newPlant;
  }

  async getPlantById(id: string) {
    const plant = await plantRepository.getPlantById(id);
    if (!plant) throw new HttpError(404, "Plant not found");
    return plant;
  }

  async getAllPlant(page?: string, size?: string, search?: string) {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;

    const { plant, total } = await plantRepository.getAllPlant(
      pageNumber,
      pageSize,
      search
    );

    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { plant, pagination };
  }

  async updatePlant(id: string, updateData: UpdatePlantDTO) {
    const plant = await plantRepository.getPlantById(id);
    if (!plant) {
      throw new HttpError(404, "Plant not Found");
    }
    const updatedPlant = await plantRepository.updatePlant(id, updateData);
    return updatedPlant;
  }

  async deletePlant(id: string) {
    const plant = await plantRepository.getPlantById(id);
    if (!plant) {
      throw new HttpError(404, "Plant not Found");
    }
    const deleted = await plantRepository.deletePlant(id);
    return deleted;
  }

  async updateOnePlant(id: string, data: any) {
    const plant = await plantRepository.updateOnePlant(id, data);
    return plant;
  }

  async deleteOnePlant(id: string) {
    const plant = await plantRepository.deleteOnePlant(id);
    return plant;
  }

  async restockPlant(id: string, stock: number) {
    const plant = await plantRepository.getPlantById(id);
    if (!plant) {
      throw new HttpError(404, "Plant not found");
    }
    return await plantRepository.updatePlant(id, { stock });
  }
}

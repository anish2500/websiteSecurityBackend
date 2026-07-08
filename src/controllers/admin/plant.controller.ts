import { AdminPlantService } from "../../services/admin/plant.service";
import { NextFunction, Request, Response } from "express";
import z from "zod";
import { CreatePlantDTO, UpdatePlantDTO } from "../../dtos/plant.dto";
import { QueryParams } from "../../types/query.type";

let adminPlantService = new AdminPlantService();

export class AdminPlantController {

  async createPlant(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreatePlantDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      if (req.file) {
        parsedData.data.plantImage = [req.file.filename];
        }


      const plantData: CreatePlantDTO = parsedData.data;
      const newPlant = await adminPlantService.createPlant(plantData);

      return res.status(201).json({
        success: true,
        message: "Plant Created",
        data: newPlant,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getPlantById(req: Request, res: Response) {
    try {
      const plantId = req.params.id;
      const plant = await adminPlantService.getPlantById(plantId);

      return res.status(200).json({
        success: true,
        data: plant,
        message: "Plant Fetched",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllPlant(req: Request, res: Response) {
    try {
      const { page, size, search }: QueryParams = req.query;
      const { plant, pagination } = await adminPlantService.getAllPlant(
        page,
        size,
        search
      );

      return res.status(200).json({
        success: true,
        data: plant,
        pagination: pagination,
        message: "Plant Fetched",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updatePlant(req: Request, res: Response, next: NextFunction) {
    try {
      const plantId = req.params.id;
      const parsedData = UpdatePlantDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      if (req.file) {
        parsedData.data.plantImage = [req.file.filename];
      }

      const updateData: UpdatePlantDTO = parsedData.data;
      const updatedPlant = await adminPlantService.updatePlant(
        plantId,
        updateData
      );

      return res.status(200).json({
        success: true,
        message: "Plant Updated",
        data: updatedPlant,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deletePlant(req: Request, res: Response, next: NextFunction) {
    try {
      const plantId = req.params.id;
      const deleted = await adminPlantService.deletePlant(plantId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Plant not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Plant Deleted",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async restockPlant(req: Request, res: Response, next: NextFunction) {
    try {
      const plantId = req.params.id;
      const { stock } = req.body;

      if (stock === undefined || typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid stock amount is required",
        });
      }

      const plant = await adminPlantService.restockPlant(plantId, stock);

      return res.status(200).json({
        success: true,
        message: "Plant restocked successfully",
        data: plant,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

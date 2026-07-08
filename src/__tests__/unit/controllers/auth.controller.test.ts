import { AuthController } from "../../../controllers/auth.controller";
import { UserService } from "../../../services/user.service";
import { Request, Response } from "express";

// Mock UserService
jest.mock("../../../services/user.service");

describe("AuthController Unit Tests", () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let userServiceMock: jest.Mocked<UserService>;

  beforeEach(() => {
    authController = new AuthController();
    userServiceMock = new UserService() as jest.Mocked<UserService>;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it("should register a user successfully", async () => {
    mockRequest = {
      body: {
        name: "Anish",
        email: "anish@test.com",
        password: "123456",
      },
    };

    userServiceMock.registerUser.mockResolvedValue({
      id: "1",
      name: "Anish",
      email: "anish@test.com",
    } as any);

    await authController.register(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User registered successfully",
      })
    );
  });


  it("should return 400 if login validation fails", async () => {
    mockRequest = {
      body: {
        email: "", // invalid email
        password: "",
      },
    };

    await authController.login(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Validation Error",
      })
    );
  });

  //get profile tests 
  it("should return user profile successfully", async () => {
    mockRequest = {
      user: { id: "1" },
    } as any;

    userServiceMock.getUserById.mockResolvedValue({
      id: "1",
      name: "Anish",
      email: "anish@test.com",
    } as any);

    await authController.getProfile(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User Profile fetched successfully",
      })
    );
  });
});
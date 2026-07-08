import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { PlantModel } from '../../models/plant.model';

describe('Plant Integration Tests', () => {
    let testPlantId: string;
    let testPlantId2: string;

    beforeAll(async () => {
        await PlantModel.deleteMany({ name: { $in: ['Test Plant', 'Test Plant 2'] } });
        
        const plant1 = await PlantModel.create({
            name: 'Test Plant',
            description: 'A beautiful test plant for integration testing',
            category: 'INDOOR',
            price: 25.99,
            stock: 50,
            plantImage: ['/plant_images/test1.jpg']
        });
        testPlantId = plant1._id.toString();

        const plant2 = await PlantModel.create({
            name: 'Test Plant 2',
            description: 'Another beautiful test plant',
            category: 'OUTDOOR',
            price: 19.99,
            stock: 30,
            plantImage: ['/plant_images/test2.jpg']
        });
        testPlantId2 = plant2._id.toString();
    });

    afterAll(async () => {
        await PlantModel.deleteMany({ name: { $in: ['Test Plant', 'Test Plant 2'] } });
    });

    describe('GET /api/plants', () => {
        test('should get all plants', async () => {
            const response = await request(app)
                .get('/api/plants');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should get plant by ID', async () => {
            const response = await request(app)
                .get(`/api/plants/${testPlantId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data.name).toBe('Test Plant');
        });

        test('should return 404 for non-existent plant', async () => {
            const response = await request(app)
                .get('/api/plants/507f1f77bcf86cd799439011');

            expect(response.status).toBe(404);
        });
    });
});

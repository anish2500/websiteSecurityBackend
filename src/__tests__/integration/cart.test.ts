import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { PlantModel } from '../../models/plant.model';
import { CartModel } from '../../models/cart.model';

describe('Cart Integration Tests', () => {
    const testUser = {
        fullName: 'Cart Test User',
        email: 'carttest@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
    };

    let authToken: string;
    let testPlantId: string;
    let testPlantId2: string;

    beforeAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await PlantModel.deleteMany({ name: { $in: ['Cart Test Plant', 'Cart Test Plant 2'] } });
        await CartModel.deleteMany({});

        await request(app)
            .post('/api/auth/register')
            .send(testUser);

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });
        authToken = loginResponse.body.token;

        const plant1 = await PlantModel.create({
            name: 'Cart Test Plant',
            description: 'A beautiful test plant for cart testing',
            category: 'INDOOR',
            price: 25.99,
            stock: 50,
            plantImage: ['/plant_images/test1.jpg']
        });
        testPlantId = plant1._id.toString();

        const plant2 = await PlantModel.create({
            name: 'Cart Test Plant 2',
            description: 'Another beautiful test plant for cart',
            category: 'OUTDOOR',
            price: 19.99,
            stock: 30,
            plantImage: ['/plant_images/test2.jpg']
        });
        testPlantId2 = plant2._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await PlantModel.deleteMany({ name: { $in: ['Cart Test Plant', 'Cart Test Plant 2'] } });
        await CartModel.deleteMany({});
    });

    describe('GET /api/cart', () => {
        test('should get empty cart for new user', async () => {
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
        });

        test('should reject unauthenticated cart access', async () => {
            const response = await request(app)
                .get('/api/cart');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/cart', () => {
        test('should add plant to cart', async () => {
            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    plantId: testPlantId,
                    quantity: 3
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].quantity).toBe(3);
        });

        test('should add second plant to cart', async () => {
            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    plantId: testPlantId2,
                    quantity: 2
                });

            expect(response.status).toBe(200);
            expect(response.body.data.items).toHaveLength(2);
        });

        test('should fail adding non-existent plant to cart', async () => {
            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    plantId: '507f1f77bcf86cd799439011',
                    quantity: 1
                });

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/cart/:plantId', () => {
        test('should update cart item quantity', async () => {
            const response = await request(app)
                .put(`/api/cart/${testPlantId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    quantity: 5
                });

            expect(response.status).toBe(200);
            expect(response.body.data.items[0].quantity).toBe(5);
        });
    });

    describe('DELETE /api/cart/:plantId', () => {
        test('should remove plant from cart', async () => {
            const response = await request(app)
                .delete(`/api/cart/${testPlantId2}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.items).toHaveLength(1);
        });
    });
});

import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { PlantModel } from '../../models/plant.model';
import { FavoriteModel } from '../../models/favorite.model';

describe('Favorites Integration Tests', () => {
    const testUser = {
        fullName: 'Favorites Test User',
        email: 'favoritestest@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
    };

    let authToken: string;
    let testPlantId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await PlantModel.deleteMany({ name: 'Favorite Test Plant' });
        await FavoriteModel.deleteMany({});

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

        const plant = await PlantModel.create({
            name: 'Favorite Test Plant',
            description: 'A beautiful test plant for favorites testing',
            category: 'INDOOR',
            price: 25.99,
            stock: 50,
            plantImage: ['/plant_images/test1.jpg']
        });
        testPlantId = plant._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await PlantModel.deleteMany({ name: 'Favorite Test Plant' });
        await FavoriteModel.deleteMany({});
    });

    describe('POST /api/favorites', () => {
        test('should add plant to favorites', async () => {
            const response = await request(app)
                .post('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    plantId: testPlantId
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
        });
    });

    describe('GET /api/favorites', () => {
        test('should get user favorites', async () => {
            const response = await request(app)
                .get('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data.plants)).toBe(true);
        });
    });

    describe('DELETE /api/favorites/:plantId', () => {
        test('should remove plant from favorites', async () => {
            const response = await request(app)
                .delete(`/api/favorites/${testPlantId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });
});

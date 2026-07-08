import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { PlantModel } from '../../models/plant.model';
import { CartModel } from '../../models/cart.model';
import { OrderModel } from '../../models/order.model';

describe('Order Integration Tests', () => {
    const testUser = {
        fullName: 'Order Test User',
        email: 'ordertest@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
    };

    const testUser2 = {
        fullName: 'Order Test User 2',
        email: 'ordertest2@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
    };

    let authToken: string;
    let authToken2: string;
    let testPlantId: string;
    let testOrderId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({ email: { $in: [testUser.email, testUser2.email] } });
        await PlantModel.deleteMany({ name: 'Order Test Plant' });
        await CartModel.deleteMany({});
        await OrderModel.deleteMany({});

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
            name: 'Order Test Plant',
            description: 'A beautiful test plant for order testing',
            category: 'INDOOR',
            price: 25.99,
            stock: 50,
            plantImage: ['/plant_images/test1.jpg']
        });
        testPlantId = plant._id.toString();

        await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                plantId: testPlantId,
                quantity: 3
            });
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: [testUser.email, testUser2.email] } });
        await PlantModel.deleteMany({ name: 'Order Test Plant' });
        await CartModel.deleteMany({});
        await OrderModel.deleteMany({});
    });

    describe('POST /api/orders', () => {
        test('should reject unauthenticated order access', async () => {
            const response = await request(app)
                .get('/api/orders');

            expect(response.status).toBe(401);
        });

        test('should create order from cart', async () => {
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`);
            
            const cartItems = cartResponse.body.data.items.map((item: any) => ({
                plantId: item.plantId._id,
                quantity: item.quantity,
                price: item.price
            }));
            
            const totalAmount = cartItems.reduce((sum: number, item: any) => 
                sum + (item.price * item.quantity), 0);

            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    items: cartItems,
                    totalAmount: totalAmount,
                    paymentMethod: 'COD'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data.items).toHaveLength(1);
            testOrderId = response.body.data._id;
        });
    });

    describe('GET /api/orders', () => {
        test('should get user orders', async () => {
            const response = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/orders/:orderId', () => {
        test('should get order by ID', async () => {
            const response = await request(app)
                .get(`/api/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data._id).toBe(testOrderId);
        });

        test('should not access other user order', async () => {
            await request(app)
                .post('/api/auth/register')
                .send(testUser2);
            
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser2.email,
                    password: testUser2.password
                });
            authToken2 = loginResponse.body.token;

            const response = await request(app)
                .get(`/api/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${authToken2}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/orders/:orderId/payment', () => {
        test('should update payment status', async () => {
            const response = await request(app)
                .patch(`/api/orders/${testOrderId}/payment`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    paymentStatus: 'paid',
                    transactionId: 'TXN123456'
                });

            expect(response.status).toBe(200);
            expect(response.body.data.paymentStatus).toBe('paid');
        });
    });
});

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { AdminModel } from '../../models/admin/admin.model';
import { OrderModel } from '../../models/order.model';
import { JWT_SECRET } from '../../config';
import { encryptField } from '../../utils/encryption.util';

describe('Security and Access Control Integration', () => {
    let userToken: string;
    let otherUserToken: string;
    let ownedOrderId: string;
    let testUserId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({ email: { $in: ['rbactest_user@example.com', 'rbactest_other@example.com'] } });
        await AdminModel.deleteMany({ email: 'rbactest_admin@example.com' });

        // 1. Create a regular user
        const user = await UserModel.create({
            email: 'rbactest_user@example.com',
            password: 'RbacTestUser123!',
        });
        userToken = jwt.sign({ id: user._id }, JWT_SECRET);
        testUserId = user._id.toString();

        // 2. Create another user (to test "not your data" scenarios)
        const otherUser = await UserModel.create({
            email: 'rbactest_other@example.com',
            password: 'RbacTestOther123!',
        });
        otherUserToken = jwt.sign({ id: otherUser._id }, JWT_SECRET);

        // 3. An order belonging to the first user, for the ownership test.
        // shippingAddress/phone must be pre-encrypted here, same as orderService.createOrder
        // does - getOrderById unconditionally decrypts on read, so raw plaintext would fail.
        const order = await OrderModel.create({
            userId: user._id,
            items: [],
            totalAmount: 100,
            shippingAddress: encryptField('RBAC test order'),
            phone: encryptField('9800000000'),
        });
        ownedOrderId = order._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: { $in: ['rbactest_user@example.com', 'rbactest_other@example.com'] } });
        await AdminModel.deleteMany({ email: 'rbactest_admin@example.com' });
        await OrderModel.deleteMany({ userId: testUserId });
    });

    describe('RBAC Enforcement (User vs Admin)', () => {
        test('should reject a regular user trying to create a plant (admin-only)', async () => {
            const response = await request(app)
                .post('/api/admin/plants')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Hack Attempt' });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test('should reject a regular user trying to list all users (admin-only)', async () => {
            const response = await request(app)
                .get('/api/admin/users/all')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('Public vs Protected Data', () => {
        test('should allow unauthenticated users to see the plants list', async () => {
            const response = await request(app).get('/api/plants');
            expect(response.status).toBe(200);
        });

        test('should reject unauthenticated cart access', async () => {
            const response = await request(app).post('/api/cart').send({});
            expect(response.status).toBe(401);
        });

        test('should reject requests with an invalid/malformed token', async () => {
            const response = await request(app)
                .get('/api/orders')
                .set('Authorization', 'Bearer invalid-token-here');

            expect(response.status).toBe(401);
        });
    });

    describe('Ownership (IDOR)', () => {
        test("should reject a user fetching another user's order", async () => {
            const response = await request(app)
                .get(`/api/orders/${ownedOrderId}`)
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(response.status).toBe(404);
        });

        test('should allow the owner to fetch their own order', async () => {
            const response = await request(app)
                .get(`/api/orders/${ownedOrderId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
        });
    });
});

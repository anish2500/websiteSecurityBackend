import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Auth Integration Tests',()=>{
    const testUser = {
        fullName : 'Test User', 
        email : 'test@example.com', 
        password: 'Password123!', 
        confirmPassword : 'Password123!'
    };

    beforeAll(async () => {
            // Ensure the test user does not exist before tests
            await UserModel.deleteMany({ email: testUser.email });
        });
    afterAll(async () => {
            // Clean up the test user after tests
            await UserModel.deleteMany({ email: testUser.email });
        });
         describe(
            'POST /api/auth/register', // Test Case name
            () => { // Test Case function
                test(
                    'should register a new user successfully', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/register')
                            .send(testUser)
                            
                        
                        // Validate response structure
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty('message', 'User registered successfully');
                        expect(response.body).toHaveProperty('data');
                    }
                )

                //arko test case esma 
                 test(
                    'should fail to register a user with existing email', // Test name
                    async () => { // Test function
                        const response = await request(app)
                            .post('/api/auth/register')
                            .send(testUser) // same user details
                        
                        // Validate response structure
                        expect(response.status).toBe(403);
                        expect(response.body).toHaveProperty('message', 'Email already in use');
                    }
                )



           test(
  'should fail to register if password is missing',
  async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email: 'nopassword@example.com',
        confirmPassword: 'Password123!'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  }
);

        

            }
        )    



});


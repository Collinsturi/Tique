import request from 'supertest';
import app from '../../../../src/index';
import { UserService } from '../../../../src/components/authentication/authentication.service';
import { sendEmail } from '../../../../src/communication/mailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserSelect } from '../../../../src/drizzle/schema';

jest.mock('../../../../src/components/authentication/authentication.service');

const mockUserService = UserService as jest.Mocked<typeof UserService>;

jest.mock('../../../../src/communication/mailer');
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;


process.env.JWT_SECRET = 'test_jwt_secret_for_integration_tests';

describe('Authentication Module Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test_jwt_secret_for_integration_tests';
    });

    const mockUser: UserSelect = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedpassword123',
        contactPhone: '1234567890',
        address: '123 Main St',
        role: 'customer',
        verificationCode: 123456,
        isVerified: false,
    };

    describe('POST /auth/register', () => {
        it('should register a new user and send a verification email', async () => {
            mockBcrypt.hash.mockResolvedValue('hashedpassword123');
            mockUserService.createUser.mockResolvedValue(mockUser);
            mockSendEmail.mockResolvedValue({ messageId: 'email-sent-id' });

            const newUser = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123',
                contactPhone: '1234567890',
                address: "Nairobi"
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(newUser);

            // Assertions:
            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual({ message: 'User created. Verification code sent to email.' });

            expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);

            expect(mockUserService.createUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: newUser.email,
                    isVerified: false,
                    verificationCode: expect.any(Number),
                })
            );
            // Verify that sendEmail was called with the correct arguments.
            expect(mockSendEmail).toHaveBeenCalledWith(
                newUser.email,
                'Verify your account',
                expect.stringContaining('your verification code is:'),
                expect.stringContaining('<strong>')
            );
        });

        it('should return 500 if user creation fails in the service layer', async () => {
            mockBcrypt.hash.mockResolvedValue('hashedpassword123');
            mockUserService.createUser.mockResolvedValue(null);

            const newUser = {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
                password: 'password123',
                contactPhone: '0987654321',
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(newUser);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'User not created' });
        });


    });

    describe('POST /auth/verify', () => {
        it('should verify user with correct code and send success email', async () => {
            mockUserService.getUserByEmail.mockResolvedValue({ ...mockUser, isVerified: false, verificationCode: 123456 });
            mockUserService.verifyUser.mockResolvedValue({ ...mockUser, isVerified: true });
            mockSendEmail.mockResolvedValue({ messageId: 'email-sent-id' });

            const res = await request(app)
                .post('/api/auth/verify')
                .send({ email: mockUser.email, code: 123456 });

            console.log(res.body)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'User verified successfully' });
            expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(mockUser.email);
            expect(mockUserService.verifyUser).toHaveBeenCalledWith(mockUser.email);

            expect(mockSendEmail).toHaveBeenCalledWith(
                mockUser.email,
                'Account Verified Successfully',
                expect.stringContaining('your account has been verified.'),
                expect.stringContaining('Your account has been <strong>successfully verified</strong>!')
            );
        });

        it('should return 400 for invalid verification code', async () => {
            mockUserService.getUserByEmail.mockResolvedValue({ ...mockUser, isVerified: false, verificationCode: 654321 });

            const res = await request(app)
                .post('/api/auth/verify')
                .send({ email: mockUser.email, code: 123456 });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: 'Invalid verification code' });
            expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(mockUser.email);

            expect(mockUserService.verifyUser).not.toHaveBeenCalled();
        });

        it('should return 200 with "User not found" if user does not exist for verification', async () => {
            mockUserService.getUserByEmail.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/verify')
                .send({ email: 'nonexistent@example.com', code: 123456 });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'User not found' });
            expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
        });

        it('should return 500 if an error occurs during verification process', async () => {
            mockUserService.getUserByEmail.mockRejectedValue(new Error('DB error during verification lookup'));

            const res = await request(app)
                .post('/api/auth/verify')
                .send({ email: mockUser.email, code: 123456 });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'DB error during verification lookup' });
        });
    });

    describe('POST /auth/login', () => {
        it('should log in a verified user successfully and return a token', async () => {
            mockUserService.loginUser.mockResolvedValue({ ...mockUser, isVerified: true, password: 'hashedpassword123' });
            mockBcrypt.compare.mockResolvedValue(true);
            mockJwt.sign.mockReturnValue('mock_jwt_token');

            const loginCredentials = {
                email: mockUser.email,
                password: 'password123',
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({
                message: 'Login successful',
                token: 'mock_jwt_token',
                user: {
                    user_id: mockUser.id,
                    first_name: mockUser.firstName,
                    last_name: mockUser.lastName,
                    email: mockUser.email,
                    role: mockUser.role,
                },
            });
            expect(mockUserService.loginUser).toHaveBeenCalledWith(loginCredentials);
            expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword123');

            expect(mockJwt.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    sub: mockUser.id,
                    user_id: mockUser.id,
                    role: mockUser.role,
                    exp: expect.any(Number)
                }),
                'test_jwt_secret_for_integration_tests'
            );
        });

        it('should return 200 with "User not found" if user does not exist during login', async () => {
            mockUserService.loginUser.mockResolvedValue(null);

            const loginCredentials = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'User not found' });
            expect(mockUserService.loginUser).toHaveBeenCalledWith(loginCredentials);
        });

        it('should return 401 for invalid credentials (password mismatch)', async () => {
            mockUserService.loginUser.mockResolvedValue({ ...mockUser, isVerified: true, password: 'hashedpassword123' });

            mockBcrypt.compare.mockResolvedValue(false);

            const loginCredentials = {
                email: mockUser.email,
                password: 'wrongpassword',
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(res.statusCode).toEqual(401);
            expect(res.body).toEqual({ message: 'Invalid credentials' });
            expect(mockUserService.loginUser).toHaveBeenCalledWith(loginCredentials);
            expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword123');
        });

        it('should return 403 if account is not verified', async () => {
            mockUserService.loginUser.mockResolvedValue({ ...mockUser, isVerified: false, password: 'hashedpassword123' });
            mockBcrypt.compare.mockResolvedValue(true);

            const loginCredentials = {
                email: mockUser.email,
                password: 'password123',
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(res.statusCode).toEqual(403);
            expect(res.body).toEqual({ message: 'Account not verified' });
        });

        it('should return 500 if JWT_SECRET is not defined in environment variables', async () => {
            process.env.JWT_SECRET = '';
            mockUserService.loginUser.mockResolvedValue({ ...mockUser, isVerified: true, password: 'hashedpassword123' });
            mockBcrypt.compare.mockResolvedValue(true);

            const loginCredentials = {
                email: mockUser.email,
                password: 'password123',
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'JWT_SECRET is not defined in environment variables.' });
        });

        it('should return 500 if an error occurs during login process', async () => {
            mockUserService.loginUser.mockRejectedValue(new Error('DB error during login attempt'));

            const loginCredentials = {
                email: mockUser.email,
                password: 'password123',
            };

            const res = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'DB error during login attempt' });
        });
    });

    describe('GET /auth/user/:id', () => {
        it('should return a user by ID', async () => {
            mockUserService.getUserById.mockResolvedValue(mockUser);

            const res = await request(app)
                .get(`/api/auth/user/${mockUser.id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockUser);
            expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser.id);
        });

        it('should return 200 with "User not found" if user not found by ID', async () => {
            mockUserService.getUserById.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/auth/user/999');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'User not found' });
            expect(mockUserService.getUserById).toHaveBeenCalledWith(999);
        });
    });

    describe('GET /auth/users', () => {
        it('should return all users', async () => {
            const mockUsers = [
                mockUser,
                { ...mockUser, id: 2, email: 'jane.doe@example.com', firstName: 'Jane' }
            ];
            mockUserService.getAllUsers.mockResolvedValue(mockUsers);

            const res = await request(app)
                .get('/api/auth/users');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockUsers);
            expect(mockUserService.getAllUsers).toHaveBeenCalled();
        });

        it('should return 200 with message if no users found', async () => {
            mockUserService.getAllUsers.mockResolvedValue([]);

            const res = await request(app)
                .get('/api/auth/users');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'No users found.' });
            expect(mockUserService.getAllUsers).toHaveBeenCalled();
        });

        it('should return 500 if an error occurs fetching all users', async () => {
            mockUserService.getAllUsers.mockRejectedValue(new Error('DB error fetching all users'));

            const res = await request(app)
                .get('/api/auth/users');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'DB error fetching all users' });
        });
    });

    describe('PATCH /auth/user/roles', () => {
        it('should change user role successfully', async () => {
            const updatedUser = { ...mockUser, role: 'admin' };
            mockUserService.changeUserRole.mockResolvedValue(updatedUser);

            const res = await request(app)
                .patch('/api/auth/user/roles')
                .send({ id: mockUser.id, role: 'admin' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'User role updated successfully', user: updatedUser });
            expect(mockUserService.changeUserRole).toHaveBeenCalledWith(mockUser.id, 'admin');
        });

        it('should return 400 for invalid user ID', async () => {
            const res = await request(app)
                .patch('/api/auth/user/roles')
                .send({ id: 'abc', role: 'admin' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: 'Invalid user ID' });
            expect(mockUserService.changeUserRole).not.toHaveBeenCalled();
        });

        it('should return 200 with message if user not found or invalid role provided to service', async () => {
            mockUserService.changeUserRole.mockResolvedValue(null);

            const res = await request(app)
                .patch('/api/auth/user/roles')
                .send({ id: 999, role: 'admin' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'User not found or invalid role provided.' });
            expect(mockUserService.changeUserRole).toHaveBeenCalledWith(999, 'admin');
        });

        it('should return 500 if an error occurs changing user role', async () => {
            mockUserService.changeUserRole.mockRejectedValue(new Error('DB error changing role'));

            const res = await request(app)
                .patch('/api/auth/user/roles')
                .send({ id: mockUser.id, role: 'admin' });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'DB error changing role' });
        });
    });
});

import {
    createUserController,
    verifyUserController,
    loginUserController,
    getUserByIdController,
    getAllUsersController,
    changeRolesController
} from '../../../../src/components/authentication/authentication.controller';
import { UserService } from '../../../../src/components/authentication/authentication.service';
import { sendEmail } from '../../../../src/communication/mailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../../../src/components/authentication/authentication.service');
jest.mock('../../../../src/communication/mailer');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Authentication Controllers (Updated)', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createUserController', () => {
        it('should create a user and send verification email', async () => {
            req.body = { email: 'test@example.com', password: 'password123', lastName: 'Doe' };
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (UserService.createUser as jest.Mock).mockResolvedValue({ id: 1 });
            (sendEmail as jest.Mock).mockResolvedValue(undefined);

            await createUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: "User created. Verification code sent to email." });
        });

        it('should return 500 if user creation fails', async () => {
            req.body = { email: 'test@example.com', password: 'password123', lastName: 'Doe' };
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (UserService.createUser as jest.Mock).mockRejectedValue(new Error('DB error'));

            await createUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
        });
    });

    describe('verifyUserController', () => {
        it('should verify user and send success email', async () => {
            req.body = { email: 'test@example.com', code: 123456 };
            (UserService.getUserByEmail as jest.Mock).mockResolvedValue({ email: 'test@example.com', verificationCode: 123456, lastName: 'Doe' });
            (UserService.verifyUser as jest.Mock).mockResolvedValue({});
            (sendEmail as jest.Mock).mockResolvedValue(undefined);

            await verifyUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "User verified successfully" });
        });

        it('should return 200 if user not found', async () => {
            req.body = { email: 'test@example.com', code: 123456 };
            (UserService.getUserByEmail as jest.Mock).mockResolvedValue(null);

            await verifyUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
        });

        it('should return 400 if verification code is invalid', async () => {
            req.body = { email: 'test@example.com', code: 654321 };
            (UserService.getUserByEmail as jest.Mock).mockResolvedValue({ email: 'test@example.com', verificationCode: 123456 });

            await verifyUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid verification code" });
        });
    });

    describe('loginUserController', () => {
        it('should login user and return token', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword', firstName: 'John', lastName: 'Doe', role: 'customer', isVerified: true };
            (UserService.loginUser as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mockToken');

            process.env.JWT_SECRET = 'testsecret';

            await loginUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Login successful",
                token: 'mockToken',
                user: {
                    user_id: mockUser.id,
                    first_name: mockUser.firstName,
                    last_name: mockUser.lastName,
                    email: mockUser.email,
                    role: mockUser.role
                }
            });
        });

        it('should return 200 if user not found', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            (UserService.loginUser as jest.Mock).mockResolvedValue(null);

            await loginUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
        });

        it('should return 401 if password does not match', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword', firstName: 'John', lastName: 'Doe', role: 'customer', isVerified: true };
            (UserService.loginUser as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await loginUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
        });

        it('should return 403 if account is not verified', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword', firstName: 'John', lastName: 'Doe', role: 'customer', isVerified: false };
            (UserService.loginUser as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await loginUserController(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: "Account not verified" });
        });
    });

    describe('getUserByIdController', () => {
        it('should return user by ID', async () => {
            req.params = { id: '1' };
            const mockUser = { id: 1, email: 'test@example.com' };
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

            await getUserByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 200 if user not found', async () => {
            req.params = { id: '1' };
            (UserService.getUserById as jest.Mock).mockResolvedValue(null);

            await getUserByIdController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
        });
    });

    describe('getAllUsersController', () => {
        it('should return all users', async () => {
            const users = [{ id: 1 }, { id: 2 }];
            (UserService.getAllUsers as jest.Mock).mockResolvedValue(users);

            await getAllUsersController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(users);
        });

        it('should return 200 if no users found', async () => {
            (UserService.getAllUsers as jest.Mock).mockResolvedValue([]);

            await getAllUsersController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "No users found." });
        });
    });

    describe('changeRolesController', () => {
        it('should update user role successfully', async () => {
            req.body = { id: 1, role: 'admin' };
            const updatedUser = { id: 1, role: 'admin' };
            (UserService.changeUserRole as jest.Mock).mockResolvedValue(updatedUser);

            await changeRolesController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "User role updated successfully", user: updatedUser });
        });

        it('should return 400 for invalid user ID', async () => {
            req.body = { id: 'abc', role: 'admin' };

            await changeRolesController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid user ID" });
        });

        it('should return 200 if user not found or invalid role provided', async () => {
            req.body = { id: 1, role: 'admin' };
            (UserService.changeUserRole as jest.Mock).mockResolvedValue(null);

            await changeRolesController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "User not found or invalid role provided." });
        });
    });
});

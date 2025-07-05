import { UserService } from '../../../../src/components/authentication/authentication.service';
import db from '../../../../src/drizzle/db';
import { UserRole } from '../../../../src/drizzle/schema ';

jest.mock('../../../../src/drizzle/db', () => ({
    insert: jest.fn(),
    update: jest.fn(),
    query: {
        User: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('UserService', () => {

    const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: 'customer',
        isVerified: false,
        contactPhone: '0712345678',
        verificationCode: 123456,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a new user and return it', async () => {
            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([mockUser]),
                }),
            });

            const result = await UserService.createUser(mockUser);
            expect(result).toEqual(mockUser);
        });

        it('should throw an error if creation fails', async () => {
            (db.insert as jest.Mock).mockImplementationOnce(() => { throw new Error('Insert error'); });

            await expect(UserService.createUser(mockUser)).rejects.toThrow('Failed to create user.');
        });
    });

    describe('getUserByEmail', () => {
        it('should return user by email', async () => {
            (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(mockUser);

            const result = await UserService.getUserByEmail(mockUser.email);
            expect(result).toEqual(mockUser);
        });

        it('should throw an error if fetching fails', async () => {
            (db.query.User.findFirst as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'));

            await expect(UserService.getUserByEmail(mockUser.email)).rejects.toThrow('Failed to fetch user by email.');
        });
    });

    describe('verifyUser', () => {
        it('should verify user and return updated user', async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([{ ...mockUser, isVerified: true }]),
                    }),
                }),
            });

            const result = await UserService.verifyUser(mockUser.email);
            expect(result.isVerified).toBe(true);
        });

        it('should throw an error if user not found', async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([]),
                    }),
                }),
            });

            await expect(UserService.verifyUser(mockUser.email)).rejects.toThrow('User not found for verification.');
        });

        it('should throw an error if DB operation fails during verification', async () => {
            (db.update as jest.Mock).mockImplementationOnce(() => { throw new Error('DB error'); });

            await expect(UserService.verifyUser(mockUser.email)).rejects.toThrow('Failed to verify user.');
        });
    });

    describe('loginUser', () => {
        it('should return existing user on successful login', async () => {
            (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(mockUser);

            const result = await UserService.loginUser(mockUser);
            expect(result).toEqual(mockUser);
        });

        it('should throw an error if user is not found', async () => {
            (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(null);

            await expect(UserService.loginUser(mockUser)).rejects.toThrow('User not found.');
        });

        it('should throw an error if DB operation fails during login', async () => {
            (db.query.User.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

            await expect(UserService.loginUser(mockUser)).rejects.toThrow('Failed to login user.');
        });
    });

    describe('getUserById', () => {
        it('should return user by ID', async () => {
            (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(mockUser);

            const result = await UserService.getUserById(mockUser.id);
            expect(result).toEqual(mockUser);
        });

        it('should throw an error if user is not found', async () => {
            (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(null);

            await expect(UserService.getUserById(mockUser.id)).rejects.toThrow('User not found.');
        });

        it('should throw an error if DB operation fails when fetching by ID', async () => {
            (db.query.User.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

            await expect(UserService.getUserById(mockUser.id)).rejects.toThrow('Failed to fetch user by ID.');
        });
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            (db.query.User.findMany as jest.Mock).mockResolvedValueOnce([mockUser]);

            const result = await UserService.getAllUsers();
            expect(result).toEqual([mockUser]);
        });

        it('should throw an error if fetching fails', async () => {
            (db.query.User.findMany as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'));

            await expect(UserService.getAllUsers()).rejects.toThrow('Failed to fetch all users.');
        });
    });

    describe('changeUserRole', () => {
        it('should update user role successfully', async () => {
            (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(mockUser);
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([{ ...mockUser, role: 'admin' }]),
                    }),
                }),
            });

            const result = await UserService.changeUserRole(mockUser.id, 'admin' as UserRole);
            expect(result.role).toBe('admin');
        });

        it('should throw an error if user is not found', async () => {
            (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(null);

            await expect(UserService.changeUserRole(mockUser.id, 'admin' as UserRole)).rejects.toThrow('User not found.');
        });

        it('should throw an error if invalid role is provided', async () => {
            (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(mockUser);

            await expect(UserService.changeUserRole(mockUser.id, 'invalidRole' as UserRole)).rejects.toThrow('Invalid role provided.');
        });

        it('should throw an error if DB operation fails when changing role', async () => {
            (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(mockUser);
            (db.update as jest.Mock).mockImplementationOnce(() => { throw new Error('DB error'); });

            await expect(UserService.changeUserRole(mockUser.id, 'admin' as UserRole)).rejects.toThrow('Failed to change user role.');
        });
    });
});

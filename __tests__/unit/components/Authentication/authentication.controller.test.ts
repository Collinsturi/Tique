// // __tests__/authentication.controller.test.ts
// import request from 'supertest';
// import express from 'express';
// import jwt from 'jsonwebtoken';
// import * as authService from '../../../src/Authentication/authentication.service';
// import * as mailer from '../../../src/communication/mailer';
// import { createUserController, verifyUserController, loginUserController } from '../../../src/Authentication/authentication.controller';
//
// const app = express();
// app.use(express.json());
// app.post('/register', createUserController);
// app.post('/verify', verifyUserController);
// app.post('/login', loginUserController);
//
// describe('Authentication Controller', () => {
//   afterEach(() => jest.clearAllMocks());
//
//   describe('POST /register', () => {
//     it('should create user and send verification email', async () => {
//       jest.spyOn(authService, 'createUserService').mockResolvedValue({ userID: 1 });
//       jest.spyOn(mailer, 'sendEmail').mockResolvedValue();
//
//       const res = await request(app)
//         .post('/register')
//         .send({ email: 'test@example.com', lastName: 'Doe', password: 'password123' });
//
//       expect(res.status).toBe(201);
//       expect(res.body.message).toMatch(/Verification code sent/);
//     });
//
//     it('should return 500 on service error', async () => {
//       jest.spyOn(authService, 'createUserService').mockRejectedValue(new Error('DB error'));
//
//       const res = await request(app)
//         .post('/register')
//         .send({ email: 'test@example.com', lastName: 'Doe', password: 'password123' });
//
//       expect(res.status).toBe(500);
//       expect(res.body.error).toBe('DB error');
//     });
//   });
//
//   describe('POST /verify', () => {
//     it('should verify user when code matches', async () => {
//       const mockUser = {
//         email: 'test@example.com',
//         lastName: 'Doe',
//         verificationCode: '123456'
//       };
//
//       jest.spyOn(authService, 'getUserByEmailService').mockResolvedValue(mockUser);
//       jest.spyOn(authService, 'verifyUserService').mockResolvedValue(undefined);
//       jest.spyOn(mailer, 'sendEmail').mockResolvedValue();
//
//       const res = await request(app)
//         .post('/verify')
//         .send({ email: 'test@example.com', code: '123456' });
//
//       expect(res.status).toBe(200);
//       expect(res.body.message).toBe('User verified successfully');
//     });
//
//     it('should return 400 if code does not match', async () => {
//       jest.spyOn(authService, 'getUserByEmailService').mockResolvedValue({ verificationCode: '000000' });
//
//       const res = await request(app)
//         .post('/verify')
//         .send({ email: 'test@example.com', code: '999999' });
//
//       expect(res.status).toBe(400);
//       expect(res.body.message).toBe('Invalid verification code');
//     });
//   });
//
//   describe('POST /login', () => {
//     it('should return token for valid login', async () => {
//       process.env.JWT_SECRET = 'test_secret';
//
//       jest.spyOn(authService, 'userLoginService').mockResolvedValue({
//         userID: 1,
//         email: 'test@example.com',
//         password: '$2a$10$abcdefghijklmnopqrstuv',
//         role: 'user'
//       });
//
//       jest.spyOn(require('bcryptjs'), 'compareSync').mockReturnValue(true);
//
//       const res = await request(app)
//         .post('/login')
//         .send({ email: 'test@example.com', password: 'password123' });
//
//       expect(res.status).toBe(200);
//       expect(res.body).toHaveProperty('token');
//       expect(res.body.user.email).toBe('test@example.com');
//     });
//
//     it('should return 401 for invalid credentials', async () => {
//       jest.spyOn(authService, 'userLoginService').mockResolvedValue({
//         email: 'test@example.com', password: 'hash', userID: 1
//       });
//       jest.spyOn(require('bcryptjs'), 'compareSync').mockReturnValue(false);
//
//       const res = await request(app)
//         .post('/login')
//         .send({ email: 'test@example.com', password: 'wrongpass' });
//
//       expect(res.status).toBe(401);
//       expect(res.body.message).toBe('Invalid credentials');
//     });
//   });
// });

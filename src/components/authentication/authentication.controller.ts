import { Request, Response } from "express";
import {
    changeRolesService,
    createUserService,
    getAllUsersService,
    getUserByEmailService,
    getUserByIdService,
    userLoginService,
    verifyUserService
} from "./authentication.service";
import bycrypt from "bcryptjs";
import "dotenv/config"
import jwt from "jsonwebtoken"
import { sendEmail } from "../communication/mailer";
import { UserEntity } from "../Drizzle/schema";

// create a user controller
export const createUserController = async (req: Request, res: Response) => {
    try {

        const user: UserEntity = req.body;
        const password = user.password;
        const hashedPassword = await bycrypt.hashSync(password, 10)
        user.password = hashedPassword

        // Generate a 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        user.isVerified = false;

        const createUser = await createUserService(user);
        if (!createUser) return res.json({ message: "User not created" })

        try {
            await sendEmail(
                user.email,
                "Verify your account",
                `Hello ${user.lastName}, your verification code is: ${verificationCode}`,
                `<div>
                <h2>Hello ${user.lastName},</h2>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                 <p>Enter this code to verify your account.</p>
                </div>`
            );
        } catch (emailError) {
            console.error("Failed to send registration email:", emailError);
        }
        return res.status(201).json({ message: "User created. Verification code sent to email." })

    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    }
}

export const verifyUserController = async (req: Request, res: Response) => {
    const { email, code } = req.body;
    console.log(email, code)
    try {
        const user = await getUserByEmailService(email);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log(user)

        if (user.verificationCode == code) {
            await verifyUserService(email);

            // Send verification success email
            try {
                await sendEmail(
                    user.email,
                    "Account Verified Successfully",
                    `Hello ${user.lastName}, your account has been verified. You can now log in and use all features.`,
                    `<div>
                    <h2>Hello ${user.lastName},</h2>
                    <p>Your account has been <strong>successfully verified</strong>!</p>
                     <p>You can now log in your account using the credentials you provided at register.</p>
                     </div>`
                )

            } catch (error: any) {
                console.error("Failed to send verification success email:", error);

            }
            return res.status(200).json({ message: "User verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid verification code" });
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message });

    }
}

//login user controller
export const loginUserController = async (req: Request, res: Response) => {
    try {
        const user = req.body;

        // check if the user exist
        const userExist = await userLoginService(user)
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        const userMatch = await bycrypt.compareSync(user.password, userExist.password)
        if (!userMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // create a payload
        const payload = {
            sub: userExist.userID,
            user_id: userExist.userID,
            first_name: userExist.email,
            last_name: userExist.email,
            role: userExist.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
        }

        // Generate the JWT token
        const secret = process.env.JWT_SECRET as string
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in the environment variables");
        }
        const token = jwt.sign(payload, secret)

        return res.status(200).json({
            message: "Login successfull",
            token,
            user: {
                user_id: userExist.userID,
                first_name: userExist.firstName,
                last_name: userExist.lastName,
                email: userExist.email,
                role: userExist.role
            }
        })
    } catch (error: any) {
        return res.status(500).json({ error: error.message });

    }
}

export const getUserByIdController = async (req: Request, res: Response) => {
    try {
        const user = await getUserByIdService(parseInt(req.params.id));

        if(!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(user)
        return;
    }catch(error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const getAllUsersController = async (req: Request, res: Response) => {
    try{
        const users = await getAllUsersService()

        if(!users.length) {
            res.status(404).json({ message: "No users found." });
        }
        res.status(200).json(users);
        return;
    }catch(error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const changeRolesController = async (req: Request, res: Response) => {
    try{
        const { id, role } = req.body;

        console.log(req.body);
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const userId = Number(id);


        const userRole = await changeRolesService(userId, role)

        if(!userRole) {
            res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(userRole);
    }catch(error: any) {
        res.status(500).json({ error: error.message });
    }
}
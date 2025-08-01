import { Request, Response } from "express";
import { UserService} from "./authentication.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { sendEmail } from "../../communication/mailer";
import { type UserInsert } from "../../drizzle/schema";

// Create user controller
export const createUserController = async (req: Request, res: Response) => {
    try {
        const user: UserInsert = req.body;
        user.password = await bcrypt.hash(user.password, 10);

        // Generate a 6-digit verification code
        const verificationCode: number = Math.floor(100000 + Math.random() * 900000);
        user.verificationCode = verificationCode;
        user.isVerified = false;

        const createdUser = await UserService.createUser(user);

        if (!createdUser) {
            return res.status(500).json({ message: "User not created" });
        }

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

        return res.status(201).json({ message: "User created. Verification code sent to email." });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const verifyUserController = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    try {
        const user = await UserService.getUserByEmail(email);

        if (!user) {
            return res.status(200).json({ message: "User not found" });
        }

        if (user.verificationCode === code) {
            await UserService.verifyUser(email);

            try {
                await sendEmail(
                    user.email,
                    "Account Verified Successfully",
                    `Hello ${user.lastName}, your account has been verified.`,
                    `<div>
                        <h2>Hello ${user.lastName},</h2>
                        <p>Your account has been <strong>successfully verified</strong>!</p>
                        <p>You can now log in using your credentials.</p>
                    </div>`
                );
            } catch (emailError) {
                console.error("Failed to send verification success email:", emailError);
            }

            return res.status(200).json({ message: "User verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid verification code" });
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// Login user controller
export const loginUserController = async (req: Request, res: Response) => {
    try {
        const user = req.body;

        const userExist = await UserService.loginUser(user);
        if (!userExist) {
            return res.status(200).json({ message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(user.password, userExist.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log(userExist)

        if (!userExist.isVerified) {
            return res.status(403).json({ message: "Account not verified" });
        }

        const payload = {
            sub: userExist.id,
            user_id: userExist.id,
            first_name: userExist.firstName,
            last_name: userExist.lastName,
            role: userExist.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // Token expires in 24 hours
        };

        const secret = process.env.JWT_SECRET as string;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables.");
        }

        const token = jwt.sign(payload, secret);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                user_id: userExist.id,
                first_name: userExist.firstName,
                last_name: userExist.lastName,
                email: userExist.email,
                role: userExist.role,
                profilePicture: userExist.profilePicture,
            }
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// Controller to initiate Google OAuth (handled by Passport middleware)
export const googleAuthRedirectController = (req: Request, res: Response) => {
    // This function will typically not be reached directly as Passport handles the redirect.
    // It's here for completeness if I need to do something before Passport redirects.
};

// Controller for Google OAuth callback
export const googleAuthCallbackController = async (req: Request, res: Response) => {
    try {
        // Passport attaches the user to req.user after successful authentication
        const user = req.user as UserInsert;

        if (!user) {
            // Redirect to the auth page with an error if authentication fails
            return res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
        }

        // Generate a JWT token for the authenticated user
        const payload = {
            sub: user.id,
            user_id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // Token expires in 24 hours
        };

        const secret = process.env.JWT_SECRET as string;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables.");
        }

        const token = jwt.sign(payload, secret);

        // Redirect to your frontend's /auth page with the token and user data
        // The frontend's Auth component useEffect will then handle these parameters
        res.redirect(`${process.env.FRONTEND_URL}/auth?token=${token}&userId=${user.id}&firstName=${user.firstName}&lastName=${user.lastName}&email=${user.email}&role=${user.role}`);

    } catch (error: any) {
        console.error("Google OAuth callback error:", error);
        // Redirect to the auth page with an error if an unexpected error occurs
        res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
    }
};


export const getUserByIdController = async (req: Request, res: Response) => {
    try {
        const user = await UserService.getUserById(parseInt(req.params.id));

        if (!user) {
            return res.status(200).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const users = await UserService.getAllUsers();

        if (!users.length) {
            return res.status(200).json({ message: "No users found." });
        }

        return res.status(200).json(users);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const changeRolesController = async (req: Request, res: Response) => {
    try {
        const { id, role } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const userId = Number(id);

        const updatedUser = await UserService.changeUserRole(userId, role);

        if (!updatedUser) {
            return res.status(200).json({ message: "User not found or invalid role provided." });
        }

        return res.status(200).json({ message: "User role updated successfully", user: updatedUser });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

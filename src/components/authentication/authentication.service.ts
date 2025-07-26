import { eq, sql } from "drizzle-orm";
import db from "../../drizzle/db";
import { type UserInsert, User, UserRole } from "../../drizzle/schema";

export class UserService {
    static async createUser(user: UserInsert) {
        try {
            // If it's a social login (has googleId but no password), set password to empty string
            // and mark as verified.
            if (user.googleId && !user.password) {
                user.password = 'OAUTH_LOGIN';
                user.isVerified = true;
                user.verificationCode = 0; // Clear verification code for social logins
            } else if (!user.googleId && !user.password) {
                // Handle cases where a password is expected but missing for non-social logins
                throw new Error("Password is required for non-social registrations.");
            }

            const result = await db.insert(User).values(user).returning();
            return result[0];
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user.");
        }
    }

    static async getUserByEmail(email: string) {
        try {
            return await db.query.User.findFirst({
                where: eq(User.email, email)
            });
        } catch (error) {
            console.error("Error fetching user by email:", error);
            throw new Error("Failed to fetch user by email.");
        }
    }

    // New method to find a user by their Google ID
    static async findUserByGoogleId(googleId: string) {
        try {
            return await db.query.User.findFirst({
                where: eq(User.googleId, googleId)
            });
        } catch (error) {
            console.error("Error fetching user by Google ID:", error);
            throw new Error("Failed to fetch user by Google ID.");
        }
    }

    static async verifyUser(email: string) {
        try {
            const result = await db.update(User)
                .set({ isVerified: true })
                .where(eq(User.email, email))
                .returning();

            if (result.length === 0) {
                throw new Error("User not found for verification.");
            }

            return result[0];
        } catch (error: any) {
            if (error.message === "User not found for verification.") throw error;

            console.error("Error verifying user:", error);
            throw new Error("Failed to verify user.");
        }
    }

    static async loginUser(user: UserInsert) {
        try {
            const { email } = user;

            const existingUser = await db.query.User.findFirst({
                columns: {
                    firstName: true,
                    lastName: true,
                    id: true,
                    email: true,
                    password: true,
                    role: true,
                    isVerified: true,
                },
                where: eq(User.email, email)
            });

            if (!existingUser) {
                throw new Error("User not found.");
            }

            return existingUser;
        } catch (error: any) {
            if (error.message === "User not found.") throw error;

            console.error("Error during user login:", error);
            throw new Error("Failed to login user.");
        }
    }

    static async getUserById(id: number) {
        try {
            const user = await db.query.User.findFirst({
                where: eq(User.id, id)
            });

            if (!user) {
                throw new Error("User not found.");
            }

            return user;
        } catch (error: any) {
            if (error.message === "User not found.") throw error;

            console.error("Error fetching user by ID:", error);
            throw new Error("Failed to fetch user by ID.");
        }
    }

    static async getAllUsers() {
        try {
            return await db.query.User.findMany();
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw new Error("Failed to fetch all users.");
        }
    }

    static async changeUserRole(userId: number, userRole: UserRole) {
        try {
            const user = await db.query.User.findFirst({
                where: eq(User.id, userId)
            });

            if (!user) {
                throw new Error("User not found.");
            }

            const allowedRoles = ["admin", "customer", "check_in_staff"];
            if (!allowedRoles.includes(userRole)) {
                throw new Error("Invalid role provided.");
            }

            const updatedUser = await db.update(User)
                .set({ role: userRole })
                .where(eq(User.id, userId))
                .returning();

            return updatedUser[0];
        } catch (error: any) {
            if (error.message === "User not found.") throw error;
            if (error.message === "Invalid role provided.") throw error;

            console.error("Error changing user role:", error);
            throw new Error("Failed to change user role.");
        }
    }
}

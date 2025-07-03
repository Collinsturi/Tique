import { eq, sql } from "drizzle-orm";
import db from "../../drizzle/db";
import {type UserInsert, User,  UserRole} from "../../drizzle/schema";

export class UserService {
    static async createUser(user: UserInsert) {
        try {
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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            console.error("Error changing user role:", error);
            throw new Error("Failed to change user role.");
        }
    }
}

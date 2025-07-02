import { eq, sql } from "drizzle-orm";
import db from "../../drizzle/db";
import { type UserInsert, User } from "../../drizzle/schema";

export const createUserService = async (user: UserInsert) => {
    const result = await db.insert(User).values(user).returning();
    // const insertedUser = result[0]; // Always access the first row from returning()

    // // Insert into role-specific table
    // if (insertedUser.role === "admin") {
    //     await db.insert(AdminTable).values({ userID: insertedUser.userID });
    // } else if (insertedUser.role === "customer") {
    //     await db.insert(CustomerTable).values({ userID: insertedUser.userID });
    // } else if (insertedUser.role === "check_in_staff") {
    //
    // }

    return "User created successfully";
}

export const getUserByEmailService = async (email: string) => {
    return await db.query.User.findFirst({
        where: eq(User.email, email)
    });
};


export const verifyUserService = async (email: string) => {
    // await db.update(User)
        // .set({ isVerified: true, verificationCode: null })
        // .where(sql`${User.email} = ${email}`);
}


//login a user
export const userLoginService = async (user: UserInsert) => {
    // email and password
    const { email } = user;

    return await db.query.User.findFirst({
        columns: {
            firstName: true,
            lastName: true,
            id: true,
            email: true,
            password: true,
            role: true
        }, where: sql`${User.email} = ${email} `
    })
}

export const getUserByIdService = async (id: number) => {
    return await db.query.User.findFirst({
        where: eq(User.id, id)
    })
}

export const getAllUsersService = async () =>{
    return await db.query.User.findMany()
}

export const changeRolesService = async (userId: number, userRole: string) => {
    const user = await db.query.User.findFirst({
        where: eq(User.id, userId)
    });

    if (!user) {
        return;
    }

    // Validate the role to only allow specific roles
    if (userRole !== "admin" && userRole !== "customer" && userRole !== "check_in_staff") {
        throw new Error("Invalid role provided.");
    }

    // Perform update
    const updatedUser = await db
        .update(User)
        .set({ role: userRole })
        .where(eq(User.id, userId))
        .returning();

    return updatedUser;
}
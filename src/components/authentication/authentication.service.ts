import { eq, sql } from "drizzle-orm";
import db from "../Drizzle/db";
import { AdminTable, CustomerTable, UserEntity, UsersTable } from "../Drizzle/schema";

export const createUserService = async (user: UserEntity) => {
    const result = await db.insert(UsersTable).values(user).returning();
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
    return await db.query.UsersTable.findFirst({
        where: eq(UsersTable.email, email)
    });
};


export const verifyUserService = async (email: string) => {
    await db.update(UsersTable)
        .set({ isVerified: true, verificationCode: null })
        .where(sql`${UsersTable.email} = ${email}`);
}


//login a user
export const userLoginService = async (user: UserEntity) => {
    // email and password
    const { email } = user;

    return await db.query.UsersTable.findFirst({
        columns: {
            firstName: true,
            lastName: true,
            userID: true,
            email: true,
            password: true,
            role: true
        }, where: sql`${UsersTable.email} = ${email} `
    })
}

export const getUserByIdService = async (id: number) => {
    return await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userID, id)
    })
}

export const getAllUsersService = async () =>{
    return await db.query.UsersTable.findMany()
}

export const changeRolesService = async (userId: number, userRole: string) => {
    const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.userID, userId)
    });

    if (!user) {
        return;
    }

    // Validate the role to only allow specific roles
    if (userRole !== "admin" && userRole !== "user") {
        throw new Error("Invalid role provided.");
    }

    // Perform update
    const updatedUser = await db
        .update(UsersTable)
        .set({ role: userRole })
        .where(eq(UsersTable.userID, userId))
        .returning();

    return updatedUser;
}
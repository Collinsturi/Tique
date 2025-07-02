import { migrate } from "drizzle-orm/neon-http/migrator";
import db from "./db";

async function migration() {
    console.log("......Migrations Started......");

    try {
        await migrate(db, { migrationsFolder: __dirname + "/migrations" });
        console.log("......Migrations Completed......");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migration();

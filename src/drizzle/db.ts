// import { drizzle } from 'drizzle-orm/neon-http';
// import { neon } from '@neondatabase/serverless';
// import * as schema from "./schema";
//
// import * as dotenv from "dotenv";
// dotenv.config();
//
// const sql = neon(process.env.Database_URL!);
//
// const db = drizzle(sql, { schema, logger: true });
// export default db;

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema, logger: true });

export default db;

const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST, 
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id UUID PRIMARY KEY, 
            name VARCHAR(100) NOT NULL,
            age  INTEGER NOT NULL CHECK(age > 0)
        )`);

    console.log("Users table is ready");
}

module.exports = {pool , initDb};
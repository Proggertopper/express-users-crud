const {Pool} = require('pg');

const pool = new Pool({
    host: 'localhost', 
    port: 5432,
    database: 'express_practice',
    user: 'postgres',
    password: 'Sasha23987h'
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
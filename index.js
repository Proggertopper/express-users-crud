const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const {pool , initDb} = require('./db')

const app = express();

app.use(express.static('public'));

app.use(express.json());// парсит запросы , которые пришли в формате json их может читать и сохраняет в свойство req.body 

function validateUser(req , res , next){
    const {name , age} = req.body;

    if(typeof name !== 'string' || name.trim() === ''){
        res.status(400).json({message: 'Name is required'});
        return;
    }

    if(!Number.isInteger(Number(age)) || Number(age) < 1){
        res.status(400).json({message: 'Age must be positive'});
        return;
    }

    req.body.name = name.trim();
    req.body.age = Number(age);

    next();
    
}

// function readUsers(){
//     const fileContent = fs.readFileSync('data.json' , "utf-8");
//     return JSON.parse(fileContent);
// }

// function saveUsers(){
//     const json = JSON.stringify(users , null , 2);
//     fs.writeFileSync('data.json' , json)
// }

// const users = readUsers();

app.get("/" , (req , res)=>{
    res.send('My first express server works!');
})



app.get("/api/users" , async (req , res) => {
    try {
        const result = await pool.query(`
            SELECT id , name , age
            FROM users
            ORDER BY name ASC`);

        res.json(result.rows);
    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Could not get users'});
    }
});

app.post("/api/users" , validateUser , async (req , res) => {

    try {
        const newUserId = crypto.randomUUID();

    const result = await pool.query(`
        INSERT INTO users(id , name , age)
        VALUES($1, $2 , $3)
        RETURNING id, name, age
        `, [newUserId , req.body.name , req.body.age]
    );

    res.status(201).json(result.rows[0]);

    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Could not create user'});
    }
    
});

app.get("/api/users/:id", async(req , res) => {
    try{
        const result = await pool.query(`
            SELECT id, name, age
            FROM users
            WHERE id=$1
            ` , [req.params.id]);

            if(result.rowCount === 0){
                res.status(404).json({message: 'User not found'});
                return;
            }

        res.json(result.rows[0]);
    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Could not get user'});
    }
});

app.delete("/api/users/:id" , async(req , res) =>{
    try{
        const result = await pool.query(`
            DELETE FROM users
            WHERE id=$1
            RETURNING id, name , age
            ` , [req.params.id]);

        if(result.rowCount === 0){
            res.status(404).json({message: 'User not found'});
            return;
        }

        res.json(result.rows[0]);
    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Could not delete user'});
    }
})

app.put("/api/users/:id" , validateUser ,  async(req , res)=>{
    try{
        const result = await pool.query(`
            UPDATE users
            SET name=$1, age=$2
            WHERE id=$3
            RETURNING id, name , age
            ` , [req.body.name , req.body.age , req.params.id]);

        if(result.rowCount === 0){
            res.status(404).json({message: 'User not found'});
            return;
        }

        res.json(result.rows[0]);
    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Could not update user'});
    }
})

// app.listen(3000 , ()=>{
//     console.log('Server started: http://localhost:3000');
// });

async function startServer(){
    try {
        await initDb();

        app.listen(3000 , ()=>{
            console.log('Server started: http://localhost:3000');
        });
    } catch(error){
        console.error('Database connection error:', error.message);
    }
}

startServer();
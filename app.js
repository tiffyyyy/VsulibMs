const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config({ path: './.env'})

const app = express();
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// Add this line to parse JSON request bodies
app.use(express.json());

app.set('view engine', 'hbs');

db.connect( (error) => {
    if(error) {
        console.log(error)
    }
    else {
        console.log("MYSQL Connected")
    }
})

app.get("/", (req, res) => {
    //res.send("<h1>Home Page</h1>")
    res.render("login")
})

app.get("/index", (req, res) => {
    //res.send("<h1>Home Page</h1>")
    res.render("index")
})

app.post('/login', (req, res) => {
    const username = req.body.username; // Change here to access username
    const password = req.body.password; // Change here to access password

    // Query the database to check if the username and password are valid
    db.query('SELECT * FROM admin WHERE name = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            console.error('Error executing database query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Check if the query returned any rows
        if (results.length > 0) {
            // Username and password are correct
            res.status(200).send('Login successful');
        } else {
            // Invalid username or password
            res.status(401).send('Invalid username or password');
        }
    });
});


app.listen(5001, () => {
    console.log("Server started on Port 5001")
})

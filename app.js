const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require("dotenv");
const crypto = require("crypto");
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ storage:multer.memoryStorage()}); 

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

app.use(express.static(path.join(__dirname, 'public')));

db.connect( (error) => {
    if(error) {
        console.log(error)
    }
    else {
        console.log("MYSQL Connected")
    }
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get("/createAccount", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'createAccount.html'));
});

app.get('/inventory', (req, res) => {
    const username = req.query.username; // Assuming username is passed as a query parameter
    res.sendFile(path.join(__dirname, 'views', 'inventory.html'));
});

app.get('/floorPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'floorPage.html'));
});

app.get('/equipmentPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'equipmentPage.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

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

            // Set a cookie with the username
            res.cookie('username', username, { maxAge: 900000, httpOnly: true });

            res.status(200).send('Login successful');
        } else {
            // Invalid username or password
            res.status(401).send('Invalid username or password');
        }
    });
});


app.post('/createAccount', (req, res) => {
    const user = req.body.user; // Change here to access username
    const pass = req.body.pass;

    // Check if the username already exists in the database
    db.query('SELECT * FROM users WHERE username = ?', [user], (err, results) => {
        if (err) {
            console.error('Error executing database query:', err);
            return res.status(500).send(err.message); // Send the actual error message
        }
        // If username already exists, return error
        if (results.length > 0) {
            return res.status(409).send('Username already exists');
        } else {
            // If username is unique, proceed to insert new user
            // Insert the password into the database without encryption
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [user, pass], (err, result) => {
                if (err) {
                    console.error('Error executing database query:', err);
                    return res.status(500).send(err.message); // Send the actual error message
                }
                res.status(200).send('Account created successfully');
            });
        }
    });
});

app.post('/inventory', (req, res) => {
    const floorName = req.body.floorName;

    console.log('Floor name inserted:', floorName);
    // Your database query to insert the new floor name into the Floor table
    db.query('INSERT INTO floor (name) VALUES (?)', [floorName], (error, results) => {
        if (error) {
            console.error('Error inserting floor name:', error);
            return res.status(500).send('Error inserting floor name');
        }

        // Floor name inserted successfully
        console.log('Floor name inserted:', floorName);
        res.sendStatus(200); // Send a success response
    });
});

app.post('/areaPage', (req, res) => {
    const areaName = req.body.areaName;
    const url = require('url');
    const referer = req.headers.referer;

    // Parse the URL
    const parsedUrl = url.parse(referer, true);

    // Extract the floorId from the query parameters
    const floorId = parsedUrl.query.floorId;

    console.log('Area name inserted:', areaName);
    // Your database query to insert the new floor name into the Floor table
    db.query('INSERT INTO areas (name, floorId) VALUES (?, ?)', [areaName,floorId], (error, results) => {
        if (error) {
            console.error('Error inserting floor name:', error);
            return res.status(500).send('Error inserting floor name');
        }

        // Floor name inserted successfully
        console.log('Floor name inserted:', areaName);
        res.sendStatus(200); // Send a success response
    });
});

app.get('/floors', (req, res) => {
    db.query('SELECT floorId, name FROM floor', (error, results) => {
        if (error) {
            console.error('Error fetching floors from database:', error);
            return res.status(500).send('Error fetching floors');
        }
        const floorsData = results.map(result => ({ floorId: result.floorId, name: result.name }));
        res.json(floorsData);
    });
});

app.get('/area', (req, res) => {
    //const floorId = req.query.floorId; // Get floorId from request query
    
    const url = require('url');
    const referer = req.headers.referer;

    // Parse the URL
    const parsedUrl = url.parse(referer, true);

    // Extract the floorId from the query parameters
    const floorId = parsedUrl.query.floorId;
    // Query database to fetch areas for the given floorId
    db.query('SELECT * FROM areas WHERE floorId = ?', [floorId], (error, results) => {
        if (error) {
            console.error('Error fetching areas from database:', error);
            res.status(500).send('Internal Server Error');
        } else {
            if (results.length > 0) {
                console.log('Areas found:', results);
            } else {
                console.log('No areas found for floorId:', floorId);
            }
            res.json(results); // Send areas data as JSON response
        }
    });
});

app.post('/equipment', upload.single('equipPic'), (req, res) => {
    const equipName = req.body.equipName;
    const equipNo = req.body.equipNo;
    const equipPic = req.file.buffer.toString("base64"); // Path to the uploaded file
    const areaId = req.body.areaId;
    const equipStatus = req.body.equipStatus;
  
    // Insert data into the database
    const sql = 'INSERT INTO equipment (equip_name, equip_no, equip_pic, areaId, status) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [equipName, equipNo, equipPic, areaId, equipStatus], (err, result) => {
      if (err) {
        console.error('Error saving equipment data: ' + err.message);
        res.status(500).send('Error saving equipment data');
        return;
      }
        console.log('Equipment data saved successfully');
        res.status(200).send('Equipment data saved successfully');
    });
});

app.get('/fetchEquipment', (req,res) => {
    const url = require('url');
    const referer = req.headers.referer;

    // Parse the URL
    const parsedUrl = url.parse(referer, true);

    // Extract the floorId from the query parameters
    const areaId = parsedUrl.query.areaId;

    const sql = 'SELECT * FROM equipment WHERE areaId = ?'; // Adjust the SQL query as needed
    db.query(sql, [areaId], (err, results) => {
        if (err) {
            console.error('Error fetching equipment data:', err);
            res.status(500).send('Error fetching equipment data');
            return;
        }
        res.json(results); // Send the equipment data as JSON
    });
})

app.use((error, req, res, next) => {
if (error instanceof multer.MulterError) {
    console.log('This is the rejected field ->', error.field);
}
    next(error);
});

app.listen(5001, () => {
    console.log("Server started on Port 5001")
})

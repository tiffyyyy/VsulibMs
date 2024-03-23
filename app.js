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

app.get('/partsPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'partsPage.html'));
})

app.get('/specsPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'specsPage.html'));
})

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

app.post('/saveParts', (req, res) => {
    const partsName = req.body.partsName;
    const equipStatus = req.body.equipStatus;
    const url = require('url');
    const referer = req.headers.referer;

    // Parse the URL
    const parsedUrl = url.parse(referer, true);

    // Extract the floorId from the query parameters
    const equipId = parsedUrl.query.equip_id;

    console.log('Parts name and status inserted:', partsName, equipStatus);

    // Your database query to insert the new parts name and status into the Parts table
    db.query('INSERT INTO part (name, status, equipId) VALUES (?, ?, ?)', [partsName, equipStatus, equipId], (error, results) => {
        if (error) {
            console.error('Error inserting parts name and status:', error);
            return res.status(500).send('Error inserting parts name and status');
        }

        // Parts name and status inserted successfully
        console.log('Parts name and status inserted:', partsName, equipStatus);
        res.sendStatus(200); // Send a success response
    });
});

app.get('/getParts', (req, res) => {  
    const url = require('url');
    const referer = req.headers.referer;

    // Parse the URL
    const parsedUrl = url.parse(referer, true);

    // Extract the equipId from the query parameters
    const equipId = parsedUrl.query.equip_id;
    console.log(equipId);

    // Check if equipId is provided
    if (!equipId) {
        return res.status(400).send('Missing equip_id parameter');
    }

    // Execute the query with the equipId parameter
    db.query('SELECT * FROM part WHERE equipId = ?', [equipId], (error, results) => {
        if (error) {
            console.error('Error fetching parts:', error);
            return res.status(500).send('Error fetching parts');
        }

        // Send the parts data as JSON
        res.json(results);
    });
});

app.post('/saveSpecs', (req, res) => {
    const specsName = req.body.specsName;
    const url = require('url');
    const referer = req.headers.referer;

    // Parse the URL
    const parsedUrl = url.parse(referer, true);

    // Extract the equipId from the query parameters
    const equipId = parsedUrl.query.equip_id;

    // Assuming you have a database connection set up as `db`
    const query = 'INSERT INTO specs (name, equipId) VALUES (?, ?)';
    db.query(query, [specsName, equipId], (error, results) => {
        if (error) {
            console.error('Error inserting specs:', error);
            return res.status(500).send('Error inserting specs');
        }
        console.log('Specs inserted successfully');
        res.sendStatus(200); // Send a success response
    });
});

app.get('/getSpecs', (req, res) => {

    const url = require('url');
    const referer = req.headers.referer;

    // Parse the URL
    const parsedUrl = url.parse(referer, true);

    // Extract the equipId from the query parameters
    const equipId = parsedUrl.query.equip_id;

    const query = 'SELECT * FROM specs WHERE equipId = ?';
    db.query(query, [equipId], (error, results) => {
        if (error) {
            console.error('Error fetching specs:', error);
            return res.status(500).send('Error fetching specs');
        }
        res.json(results); // Send the specs data as JSON
    });
});

app.post('/updatePart', function(req, res) {
    console.log('Received updatePart request:', req.body); // Log the request data

    const partId = req.body.id;
    const updatedPartName = req.body.name;
    const updatedPartStatus = req.body.status;

    const sql = "UPDATE part SET name = ?, status = ? WHERE id = ?";
    db.query(sql, [updatedPartName, updatedPartStatus, partId], function(err, result) { // Use 'db' instead of 'connection'
        if (err) {
            console.error('Error updating part:', err); // Log the error
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log(result.affectedRows + " record(s) updated");
        res.send("Part updated successfully");
    });
});

app.delete('/deletePart/:id', function(req, res) {
    const partId = req.params.id;

    const sql = "DELETE FROM part WHERE id = ?";
    db.query(sql, [partId], function(err, result) {
        if (err) {
            console.error('Error deleting part:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log(`Part with ID ${partId} deleted successfully`);
        res.sendStatus(200); // Send a success status code
    });
});

app.post('/updateSpec', function(req, res) {
    // Extract spec ID and new name from the request body
    const specId = req.body.id;
    const newSpecName = req.body.name;

    // Validate request data (e.g., check if specId and newSpecName are provided)
    if (!specId || !newSpecName) {
        return res.status(400).send('Missing required fields');
    }

    // SQL query to update the spec
    const sql = "UPDATE specs SET name = ? WHERE id = ?";

    // Execute the query with the new spec name and ID
    db.query(sql, [newSpecName, specId], function(err, result) {
        if (err) {
            console.error('Error updating spec:', err);
            return res.status(500).send('Internal Server Error');
        }

        console.log(`Spec with ID ${specId} updated successfully`);
        res.sendStatus(200); // Send a success status code
    });
});

app.delete('/deleteSpec/:id', function(req, res) {
    const specId = req.params.id;

    const sql = "DELETE FROM specs WHERE id = ?";
    db.query(sql, [specId], function(err, result) {
        if (err) {
            console.error('Error deleting spec:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log(`Spec with ID ${specId} deleted successfully`);
        res.sendStatus(200); // Send a success status code
    });
});

app.delete('/deleteEquipment/:id', function(req, res) {
    const equipId = req.params.id;
    console.log(equipId);

    // Step 1: Delete the equipment
    const deleteEquipmentSql = "DELETE FROM equipment WHERE equip_id = ?";
    db.query(deleteEquipmentSql, [equipId], function(err, result) {
        if (err) {
            console.error('Error deleting equipment:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log(`Equipment with ID ${equipId} deleted successfully`);
        res.sendStatus(200); // Send a success status code
    });
});

app.post('/updateEquipment', upload.single('updatedEquipPic'), (req, res) => {
    const equipId = req.body.equipId;
    const updatedEquipName = req.body.updatedEquipName;
    const updatedEquipNo = req.body.updatedEquipNo;
    const updatedEquipStatus = req.body.updatedEquipStatus;
    const updatedEquipPic = req.file.buffer.toString("base64"); // Convert the file to base64

    // SQL query to update the equipment
    const sql = 'UPDATE equipment SET equip_name = ?, equip_no = ?, status = ?, equip_pic = ? WHERE equip_id = ?';
    db.query(sql, [updatedEquipName, updatedEquipNo, updatedEquipStatus, updatedEquipPic, equipId], (err, result) => {
        if (err) {
            console.error('Error updating equipment:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log('Equipment updated successfully');
        res.status(200).send('Equipment updated successfully');
    });
});

app.post('/updateArea', (req, res) => {
    const areaId = req.body.areaId;
    const updatedAreaName = req.body.updatedAreaName;

    const sql = 'UPDATE areas SET name = ? WHERE id = ?';
    db.query(sql, [updatedAreaName, areaId], (err, result) => {
        if (err) {
            console.error('Error updating area:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log('Area updated successfully');
        res.status(200).send('Area updated successfully');
    });
});

app.delete('/deleteArea/:id', function(req, res) {
    const areaId = req.params.id;
    console.log(`Area ID to delete: ${areaId}`);

    // Step 1: Delete the dependent equipment
    const deleteEquipmentSql = "DELETE FROM equipment WHERE areaId = ?";
    db.query(deleteEquipmentSql, [areaId], function(err, result) {
        if (err) {
            console.error('Error deleting dependent equipment:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log(`Dependent equipment deleted successfully`);

        // Step 2: Delete the area
        const deleteAreaSql = "DELETE FROM areas WHERE id = ?";
        db.query(deleteAreaSql, [areaId], function(err, result) {
            if (err) {
                console.error('Error deleting area:', err);
                return res.status(500).send('Internal Server Error');
            }
            console.log(`Area with ID ${areaId} deleted successfully`);
            res.sendStatus(200); // Send a success status code
        });
    });
});

app.delete('/deleteFloor/:id', function(req, res) {
    const floorId = req.params.id;
    console.log(`Floor ID to delete: ${floorId}`);

    // Step 1: Retrieve all area IDs associated with the floor
    const getAreaIdsSql = "SELECT id FROM areas WHERE floorId = ?";
    db.query(getAreaIdsSql, [floorId], function(err, result) {
        if (err) {
            console.error('Error retrieving area IDs:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Extract area IDs from the result
        const areaIds = result.map(row => row.id);

        // Step 2: Delete the dependent equipment for each area
        const deleteEquipmentSql = "DELETE FROM equipment WHERE areaId = ?";
        const deleteEquipmentPromises = areaIds.map(areaId => {
            return new Promise((resolve, reject) => {
                db.query(deleteEquipmentSql, [areaId], function(err, result) {
                    if (err) {
                        console.error('Error deleting dependent equipment:', err);
                        reject(err);
                    } else {
                        console.log(`Dependent equipment for area ID ${areaId} deleted successfully`);
                        resolve();
                    }
                });
            });
        });

        // Step 3: Delete the dependent areas
        const deleteAreasSql = "DELETE FROM areas WHERE floorId = ?";
        db.query(deleteAreasSql, [floorId], function(err, result) {
            if (err) {
                console.error('Error deleting dependent areas:', err);
                return res.status(500).send('Internal Server Error');
            }
            console.log(`Dependent areas deleted successfully`);

            // Step 4: Delete the floor
            const deleteFloorSql = "DELETE FROM floor WHERE floorId = ?";
            db.query(deleteFloorSql, [floorId], function(err, result) {
                if (err) {
                    console.error('Error deleting floor:', err);
                    return res.status(500).send('Internal Server Error');
                }
                console.log(`Floor with ID ${floorId} deleted successfully`);
                res.sendStatus(200); // Send a success status code
            });
        });

        // Wait for all equipment deletion promises to resolve before proceeding
        Promise.all(deleteEquipmentPromises)
            .then(() => console.log('All dependent equipment deleted successfully'))
            .catch(err => {
                console.error('Error deleting dependent equipment:', err);
                res.status(500).send('Internal Server Error');
            });
    });
});

app.post('/updateFloor', function(req, res) {
    // Extract floor ID and new name from the request body
    const floorId = req.body.id;
    const newFloorName = req.body.name;

    // Validate request data (e.g., check if floorId and newFloorName are provided)
    if (!floorId || !newFloorName) {
        return res.status(400).send('Missing required fields');
    }

    // SQL query to update the floor
    const sql = "UPDATE floor SET name = ? WHERE floorId = ?";

    // Execute the query with the new floor name and ID
    db.query(sql, [newFloorName, floorId], function(err, result) {
        if (err) {
            console.error('Error updating floor:', err);
            return res.status(500).send('Internal Server Error');
        }

        console.log(`Floor with ID ${floorId} updated successfully`);
        res.sendStatus(200); // Send a success status code
    });
});


app.use((error, req, res, next) => {
if (error instanceof multer.MulterError) {
    console.log('This is the rejected field ->', error.field);
}
    next(error);
});

app.listen(5001, () => {
    console.log("Server started on Port 5001")
})

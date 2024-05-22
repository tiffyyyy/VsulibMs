const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require("dotenv");
const crypto = require("crypto");
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ storage:multer.memoryStorage()});
const { chromium } = require('playwright');

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

app.get('/scheduleFloorPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'scheduleFloorPage.html'));
})

app.get('/scheduleAreaPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'scheduleAreaPage.html'));
})

app.get('/scheduleEquipmentPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'scheduleEquipmentPage.html'));
})

app.get('/calendarPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'calendarPage.html'));
})

app.get('/inspectionFloorPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'inspectionFloorPage.html'));
})

app.get('/inspectionAreaPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'inspectionAreaPage.html'));
})

app.get('/inspectionEquipmentPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'inspectionEquipmentPage.html'));
})

app.get('/inspectionPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'inspectionPage.html'));
})

app.get('/historyPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'historyPage.html'));
})

app.get('/historyDetailPage', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'historyDetailPage.html'));
})

app.get('/pending', (req,res) => {
    res.sendFile(path.join(__dirname, 'views', 'pending.html'));
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM admin WHERE name =? AND password =?', [username, password], (err, results) => {
        if (err) {
            console.error('Error executing database query:', err);
            res.status(500).send({ error: 'Internal Server Error' });
            return;
        }
        if (results.length > 0) {
            const authority = results[0].authority;
            res.cookie('username', username, { maxAge: 900000, httpOnly: true });
            res.status(200).send({ loginStatus: 'success', message: 'Login successful', authority: authority });
        } else {
            res.status(401).send({ loginStatus: 'error', message: 'Invalid username or password' });
        }
    });
});


app.post('/createAccount', (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    db.query('SELECT * FROM admin WHERE name = ?', [user], (err, results) => {
        if (err) {
            console.error('Error executing database query:', err);
            return res.status(500).send(err.message);
        }
        if (results.length > 0) {
            return res.status(409).send('Username already exists');
        } else {
            db.query('INSERT INTO admin (name, password, authority) VALUES (?, ?, 1)', [user, pass], (err, result) => {
                if (err) {
                    console.error('Error executing database query:', err);
                    return res.status(500).send(err.message);
                }
                res.status(200).send('Account created successfully');
            });
        }
    });
});

app.post('/inventory', (req, res) => {
    const floorName = req.body.floorName;

    console.log('Floor name inserted:', floorName);
  
    db.query('INSERT INTO floor (name) VALUES (?)', [floorName], (error, results) => {
        if (error) {
            console.error('Error inserting floor name:', error);
            return res.status(500).send('Error inserting floor name');
        }

        console.log('Floor name inserted:', floorName);
        res.sendStatus(200);
    });
});

app.post('/areaPage', (req, res) => {
    const areaName = req.body.areaName;
    const url = require('url');
    const referer = req.headers.referer;

    const parsedUrl = url.parse(referer, true);

    const floorId = parsedUrl.query.floorId;

    console.log('Area name inserted:', areaName);

    db.query('INSERT INTO areas (name, floorId) VALUES (?, ?)', [areaName,floorId], (error, results) => {
        if (error) {
            console.error('Error inserting floor name:', error);
            return res.status(500).send('Error inserting floor name');
        }

        console.log('Floor name inserted:', areaName);
        res.sendStatus(200);
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
    const url = require('url');
    const referer = req.headers.referer;

    const parsedUrl = url.parse(referer, true);

    const floorId = parsedUrl.query.floorId;

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
            res.json(results);
        }
    });
});

app.post('/equipment', upload.single('equipPic'), (req, res) => {
    const equipName = req.body.equipName;
    const equipNo = req.body.equipNo;
    const equipPic = req.file.buffer.toString("base64");
    const areaId = req.body.areaId;
    const equipStatus = req.body.equipStatus;
  
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

    const parsedUrl = url.parse(referer, true);

    const areaId = parsedUrl.query.areaId;

    const sql = 'SELECT * FROM equipment WHERE areaId = ?';
    db.query(sql, [areaId], (err, results) => {
        if (err) {
            console.error('Error fetching equipment data:', err);
            res.status(500).send('Error fetching equipment data');
            return;
        }
        res.json(results);
    });
})

app.post('/saveParts', (req, res) => {
    const partsName = req.body.partsName;
    const equipStatus = req.body.equipStatus;
    const url = require('url');
    const referer = req.headers.referer;

    const parsedUrl = url.parse(referer, true);

    const equipId = parsedUrl.query.equip_id;

    console.log('Parts name and status inserted:', partsName, equipStatus);

    db.query('INSERT INTO part (name, status, equipId) VALUES (?, ?, ?)', [partsName, equipStatus, equipId], (error, results) => {
        if (error) {
            console.error('Error inserting parts name and status:', error);
            return res.status(500).send('Error inserting parts name and status');
        }

        console.log('Parts name and status inserted:', partsName, equipStatus);
        res.sendStatus(200);
    });
});

app.get('/getParts', (req, res) => {  
    const url = require('url');
    const referer = req.headers.referer;

    const parsedUrl = url.parse(referer, true);

    const equipId = parsedUrl.query.equip_id;
    console.log(equipId);

    // Check if equipId is provided
    if (!equipId) {
        return res.status(400).send('Missing equip_id parameter');
    }

    db.query('SELECT * FROM part WHERE equipId = ?', [equipId], (error, results) => {
        if (error) {
            console.error('Error fetching parts:', error);
            return res.status(500).send('Error fetching parts');
        }

        res.json(results);
    });
});

app.post('/saveSpecs', (req, res) => {
    const specsName = req.body.specsName;
    const url = require('url');
    const referer = req.headers.referer;

    const parsedUrl = url.parse(referer, true);

    const equipId = parsedUrl.query.equip_id;

    const query = 'INSERT INTO specs (name, equipId) VALUES (?, ?)';
    db.query(query, [specsName, equipId], (error, results) => {
        if (error) {
            console.error('Error inserting specs:', error);
            return res.status(500).send('Error inserting specs');
        }
        console.log('Specs inserted successfully');
        res.sendStatus(200);
    });
});

app.get('/getSpecs', (req, res) => {

    const url = require('url');
    const referer = req.headers.referer;

    const parsedUrl = url.parse(referer, true);

    const equipId = parsedUrl.query.equip_id;

    const query = 'SELECT * FROM specs WHERE equipId = ?';
    db.query(query, [equipId], (error, results) => {
        if (error) {
            console.error('Error fetching specs:', error);
            return res.status(500).send('Error fetching specs');
        }
        res.json(results);
    });
});

app.post('/updatePart', function(req, res) {
    console.log('Received updatePart request:', req.body); // Log the request data

    const partId = req.body.id;
    const updatedPartName = req.body.name;
    const updatedPartStatus = req.body.status;

    const sql = "UPDATE part SET name = ?, status = ? WHERE id = ?";
    db.query(sql, [updatedPartName, updatedPartStatus, partId], function(err, result) {
        if (err) {
            console.error('Error updating part:', err);
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
        res.sendStatus(200);
    });
});

app.post('/updateSpec', function(req, res) {
    const specId = req.body.id;
    const newSpecName = req.body.name;

    if (!specId || !newSpecName) {
        return res.status(400).send('Missing required fields');
    }

    const sql = "UPDATE specs SET name = ? WHERE id = ?";

    db.query(sql, [newSpecName, specId], function(err, result) {
        if (err) {
            console.error('Error updating spec:', err);
            return res.status(500).send('Internal Server Error');
        }

        console.log(`Spec with ID ${specId} updated successfully`);
        res.sendStatus(200);
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
        res.sendStatus(200);
    });
});

app.delete('/deleteEquipment/:id', function(req, res) {
    const equipId = req.params.id;
    console.log(equipId);

    const deleteEquipmentSql = "DELETE FROM equipment WHERE equip_id = ?";
    db.query(deleteEquipmentSql, [equipId], function(err, result) {
        if (err) {
            console.error('Error deleting equipment:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log(`Equipment with ID ${equipId} deleted successfully`);
        res.sendStatus(200);
    });
});

app.post('/updateEquipment', upload.single('updatedEquipPic'), (req, res) => {
    const equipId = req.body.equipId;
    const updatedEquipName = req.body.updatedEquipName;
    const updatedEquipNo = req.body.updatedEquipNo;
    const updatedEquipStatus = req.body.updatedEquipStatus;
    const updatedEquipPic = req.file.buffer.toString("base64"); // Convert the file to base64

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
        res.status(200).json('Area updated successfully');
    });
});

app.delete('/deleteArea/:id', function(req, res) {
    const areaId = req.params.id;
    console.log(`Area ID to delete: ${areaId}`);

    const deleteEquipmentSql = "DELETE FROM equipment WHERE areaId = ?";
    db.query(deleteEquipmentSql, [areaId], function(err, result) {
        if (err) {
            console.error('Error deleting dependent equipment:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log(`Dependent equipment deleted successfully`);

        const deleteAreaSql = "DELETE FROM areas WHERE id = ?";
        db.query(deleteAreaSql, [areaId], function(err, result) {
            if (err) {
                console.error('Error deleting area:', err);
                return res.status(500).send('Internal Server Error');
            }
            console.log(`Area with ID ${areaId} deleted successfully`);
            res.sendStatus(200);
        });
    });
});

app.delete('/deleteFloor/:id', function(req, res) {
    const floorId = req.params.id;
    console.log(`Floor ID to delete: ${floorId}`);

    //Retrieve all area IDs associated with the floor
    const getAreaIdsSql = "SELECT id FROM areas WHERE floorId = ?";
    db.query(getAreaIdsSql, [floorId], function(err, result) {
        if (err) {
            console.error('Error retrieving area IDs:', err);
            return res.status(500).send('Internal Server Error');
        }

        const areaIds = result.map(row => row.id);

        //Delete the dependent equipment for each area
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

        //Delete the dependent areas
        const deleteAreasSql = "DELETE FROM areas WHERE floorId = ?";
        db.query(deleteAreasSql, [floorId], function(err, result) {
            if (err) {
                console.error('Error deleting dependent areas:', err);
                return res.status(500).send('Internal Server Error');
            }
            console.log(`Dependent areas deleted successfully`);

            //Delete the floor
            const deleteFloorSql = "DELETE FROM floor WHERE floorId = ?";
            db.query(deleteFloorSql, [floorId], function(err, result) {
                if (err) {
                    console.error('Error deleting floor:', err);
                    return res.status(500).send('Internal Server Error');
                }
                console.log(`Floor with ID ${floorId} deleted successfully`);
                res.sendStatus(200);
            });
        });

        Promise.all(deleteEquipmentPromises)
            .then(() => console.log('All dependent equipment deleted successfully'))
            .catch(err => {
                console.error('Error deleting dependent equipment:', err);
                res.status(500).send('Internal Server Error');
            });
    });
});

app.post('/updateFloor', function(req, res) {
    const floorId = req.body.id;
    const newFloorName = req.body.name;

    if (!floorId || !newFloorName) {
        return res.status(400).send('Missing required fields');
    }

    const sql = "UPDATE floor SET name = ? WHERE floorId = ?";

    db.query(sql, [newFloorName, floorId], function(err, result) {
        if (err) {
            console.error('Error updating floor:', err);
            return res.status(500).send('Internal Server Error');
        }

        console.log(`Floor with ID ${floorId} updated successfully`);
        res.sendStatus(200);
    });
});

app.get('/getEquipDetails', (req, res) => {
    const equipId = req.query.equip_id;

    if (!equipId) {
        return res.status(400).send('Missing equip_id parameter');
    }

    const query = 'SELECT * FROM equipment WHERE equip_id = ?';
    db.query(query, [equipId], (error, results) => {
        if (error) {
            console.error('Error fetching equipment details:', error);
            return res.status(500).send('Error fetching equipment details');
        }
        if (results.length === 0) {
            return res.status(404).send('Equipment not found');
        }
        res.json(results[0]);
    });
});

app.post('/saveSchedule', (req, res) => {
    const { proposedDate, actualDate, remarks1, remarks2 } = req.body;

    const url = require('url');
    const referer = req.headers.referer;

    const parsedUrl = url.parse(referer, true);

    const equipId = parsedUrl.query.equip_id;
    
    let query, params;
    if (proposedDate) {
        query = 'INSERT INTO schedule (proposedDate, remarks1, equip_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE proposedDate = ?, remarks1 = ?';
        params = [proposedDate, remarks1, equipId, proposedDate, remarks1];
    } else if (actualDate) {
        query = 'INSERT INTO schedule (actualDate, remarks2, equip_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE actualDate = ?, remarks2 = ?';
        params = [actualDate, remarks2, equipId, actualDate, remarks2];
    } else {
        res.status(400).json({ success: false, message: 'Date is required.' });
        return;
    }

    db.query(query, params, (error, results) => {
        if (error) {
            console.error('Error saving schedule:', error);
            res.status(500).json({ success: false });
            return;
        }
        res.json({ success: true });
    });
});

app.get('/getProposedDate', (req, res) => {
    const equipId = req.query.equip_id;

    if (!equipId) {
        return res.status(400).json({ error: 'equip_id is required' });
    }

    const query = 'SELECT proposedDate FROM schedule WHERE equip_id = ?';
    db.query(query, [equipId], (error, results) => {
        if (error) {
            console.error('Error fetching proposed date:', error);
            return res.status(500).json({ error: 'Error fetching proposed date' });
        }

        if (results.length > 0) {
            return res.json({ proposedDate: results[0].proposedDate });
        } else {
            //return empty
            return res.json({});
        }
    });
    
});

app.post('/finishMaintenance', (req, res) => {
    const equipId = req.body.equipId;

    const insertHistoryQuery = 'INSERT INTO history (proposedDate, equip_id, actualDate, remarks1, remarks2) SELECT proposedDate, equip_id, actualDate, remarks1, remarks2 FROM schedule WHERE equip_id = ?';
    db.query(insertHistoryQuery, [equipId], (error, results) => {
        if (error) {
            console.error('Error inserting into history:', error);
            res.json({ success: false });
            return;
        }

        // Delete from schedule table
        const deleteScheduleQuery = 'DELETE FROM schedule WHERE equip_id = ?';
        db.query(deleteScheduleQuery, [equipId], (error, results) => {
            if (error) {
                console.error('Error deleting from schedule:', error);
                res.json({ success: false });
                return;
            }

            res.json({ success: true });
        });
    });
});

app.get('/getActualDate', (req, res) => {
    const equipId = req.query.equip_id;

    if (!equipId) {
        return res.status(400).json({ error: 'equip_id is required' });
    }

    const query = 'SELECT actualDate FROM schedule WHERE equip_id = ?';
    db.query(query, [equipId], (error, results) => {
        if (error) {
            console.error('Error fetching actual date:', error);
            return res.status(500).json({ error: 'Error fetching actual date' });
        }

        if (results.length > 0) {
            return res.json({ actualDate: results[0].actualDate });
        } else {
            // return empty
            return res.json({});
        }
    });
});

app.post('/updatePartInspection', function(req, res) {
    console.log('Received updatePart request:', req.body); // Log the request data

    const partId = req.body.id;
    const updatedPartStatus = req.body.status;

    const sql = "UPDATE part SET status = ? WHERE id = ?";
    db.query(sql, [updatedPartStatus, partId], function(err, result) {
        if (err) {
            console.error('Error updating part:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log(result.affectedRows + " record(s) updated");
        res.send("Part updated successfully");
    });
});

app.get('/getEquipDetails', (req, res) => {
    const equipId = req.query.equip_id;

    if (!equipId) {
        return res.status(400).json({ error: 'equip_id is required' });
    }

    const query = 'SELECT equip_name, status FROM equipment WHERE equip_id = ?';
    db.query(query, [equipId], (error, results) => {
        if (error) {
            console.error('Error fetching equipment details:', error);
            return res.status(500).json({ error: 'Error fetching equipment details' });
        }

        if (results.length > 0) {
            const equipDetails = results[0];
            return res.json({ equip_name: equipDetails.equip_name, status: equipDetails.status });
        } else {
            return res.status(404).json({ error: 'Equipment not found' });
        }
    });
});

app.post('/updateEquipStatus', (req, res) => {
    const equipId = req.query.equip_id;
    const newStatus = req.body.status;

    if (!equipId || !newStatus) {
        return res.status(400).json({ success: false, message: 'equip_id and status are required' });
    }

    const query = 'UPDATE equipment SET status = ? WHERE equip_id = ?';
    db.query(query, [newStatus, equipId], (error, results) => {
        if (error) {
            console.error('Error updating equipment status:', error);
            return res.status(500).json({ success: false });
        }

        if (results.affectedRows > 0) {
            return res.json({ success: true });
        } else {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }
    });
});

// Get all history records
app.get('/history', (req, res) => {
    const query = `
        SELECT h.id, e.equip_name, e.equip_no, h.saved_at
        FROM history h
        JOIN equipment e ON h.equip_id = e.equip_id
    `;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching history:', error);
            return res.status(500).json({ error: 'Error fetching history' });
        }

        return res.json(results);
    });
});

app.get('/history/:id', (req, res) => {
    const historyId = req.params.id;

    const historyQuery = `
        SELECT h.id, e.equip_name, e.equip_no, h.saved_at, h.remarks1, h.remarks2, h.proposedDate, h.actualDate, 
               e.equip_pic, e.status, a.name AS area_name, f.name AS floor_name
        FROM history h
        JOIN equipment e ON h.equip_id = e.equip_id
        JOIN areas a ON e.areaId = a.id
        JOIN floor f ON a.floorId = f.floorId
        WHERE h.id = ?
    `;

    db.query(historyQuery, [historyId], (error, results) => {
        if (error) {
            console.error('Error fetching history:', error);
            return res.status(500).json({ error: 'Error fetching history' });
        }

        if (results.length > 0) {
            const historyDetails = results[0];
            const equipmentDetails = {
                equip_name: historyDetails.equip_name,
                equip_no: historyDetails.equip_no,
                equip_pic: `data:image/jpeg;base64,${historyDetails.equip_pic}`,
                status: historyDetails.status
            };
            const areaDetails = {
                area_name: historyDetails.area_name,
                floor_name: historyDetails.floor_name
            };

            return res.json({ historyDetails, equipmentDetails, areaDetails });
        } else {
            return res.status(404).json({ error: 'History not found' });
        }
    });
});

app.get('/pdf/:id', async (req, res) => {
    const { id } = req.params;

    const rawCookies = req.headers.cookie;
    if (!rawCookies) {
        return res.status(401).send('No cookies found');
    }

    const cookies = rawCookies.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return {
            name: name.trim(),
            value: decodeURIComponent(value.trim()),
            domain: 'localhost',
            path: '/historyDetailPage',
        };
    });

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await context.addCookies(cookies);

    await page.goto(`http://localhost:5001/historyDetailPage?id=${id}`, { 
        waitUntil: 'networkidle0', 
        timeout: 60000
    });

    try {
        await page.waitForSelector('#body-area-div', { timeout: 120000 });
        await page.evaluate(() => {
            document.body.style.background = 'white';
            document.body.style.border = 'none';

            document.getElementById('wrapper-div').style.background = 'white';
            document.getElementById('main-div').style.background = 'white';

            const bodyAreaDiv = document.querySelector('#body-area-div');
            bodyAreaDiv.style.background = 'white';
            bodyAreaDiv.style.border = 'none';

            const parent = bodyAreaDiv.parentElement;
            Array.from(parent.children).forEach(child => {
                if (child!== bodyAreaDiv) {
                    child.style.display = 'none';
                }
            });
            document.body.innerHTML = '';
            document.body.appendChild(bodyAreaDiv);
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=history-details.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        await browser.close();
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.get('/fetchEquipments', (req, res) => {
    const searchTerm = req.query.term || '';
    const sqlQuery = `
        SELECT * FROM equipment 
        WHERE equip_name LIKE? OR equip_no LIKE?
    `;

    db.query(sqlQuery, [`%${searchTerm}%`, `%${searchTerm}%`], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/fetchEquipmentsinArea', (req, res) => {
    const url = require('url');
    const referer = req.headers.referer;

    const parsedUrl = url.parse(referer, true);

    const areaId = parsedUrl.query.areaId;
    const searchTerm = req.query.term || '';
    const sqlQuery = `
        SELECT * FROM equipment 
        WHERE equip_name LIKE? AND areaId =?
        OR equip_no LIKE? AND areaId =?
    `;

    db.query(sqlQuery, [`%${searchTerm}%`, areaId, `%${searchTerm}%`, areaId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


app.get('/searchHistory', (req, res) => {
    const searchTerm = req.query.term || '';

    const sqlQuery = `
        SELECT h.id, e.equip_name, h.equip_id, h.actualDate, h.saved_at, h.remarks1, h.remarks2
        FROM history h
        JOIN equipment e ON h.equip_id = e.equip_id
        WHERE (e.equip_name LIKE? OR e.equip_no LIKE?)
        ORDER BY h.saved_at DESC
    `;

    db.query(sqlQuery, [`%${searchTerm}%`, `%${searchTerm}%`], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/fetchPending', (req, res) => {
    const sqlQuery = `
        SELECT e.*, s.proposedDate
        FROM equipment e
        LEFT JOIN schedule s ON e.equip_id = s.equip_id
        WHERE s.proposedDate IS NOT NULL AND s.actualDate IS NULL
        ORDER BY e.equip_name ASC
    `;

    db.query(sqlQuery, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/searchEquipmentInspection', (req, res) => {
    const areaId = req.query.areaId;
    const search = req.query.search;

    let query = 'SELECT * FROM equipment WHERE areaId = ?';
    const queryParams = [areaId];
    console.log(search);
    console.log(areaId);

        query += ' AND (equip_name LIKE ? OR equip_no LIKE ?)';
        queryParams.push(`%${search}%`, `%${search}%`);
    

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching equipment:', err);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
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

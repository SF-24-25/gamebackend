import express from 'express';
import mysql from 'mysql2';
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

const app = express();
app.use(express.json())
app.use(cors())
dotenv.config()

const PORT = 14452.
// const PORT = 4000

var con = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port:14452
});

const server = http.createServer(app);

con.connect(function (err) {
    if (err) throw err;
    else {
        server.listen(PORT, () => {
            console.log(`API listening on PORT ${PORT} `)
        })
    }
});

app.use((req, res, next) => {
    con.ping((err) => {
        if (err) {
            return res.status(503).json({ error: "Database not connected yet" });
        }
        next();
    });
});

app.get('/', (req, res) => {
    try {
        res.send("Server is running and database is connected!");
    } catch (err) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
});

app.get('/players', (req, res) => {
    try {
        con.query("SELECT *, rank() OVER (ORDER BY points desc) AS players_rank FROM leaderb_witch ORDER BY points DESC, user_name", function (err, players) {
            if (err) {
                return res.status(401).json({ code: 1, message: "Could not fetch the data", error: err.message })
            }
            else {
                return res.status(200).json({ code: 0, message: "Players Fetched Successfully", players: players })
            }
        });
    } catch (error) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
})

const checkExistingPlayer = (userdata) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM leaderb_witch WHERE user_name = ?", [userdata.user_name], (err, result) => {
            if (err) {
                return reject(err)
            }
            if (result.length > 0 && result[0].points <= userdata.points) {
                con.query("UPDATE leaderb_witch SET points = ? WHERE user_name = ?", [userdata.points, userdata.user_name], (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve(true);
                });
            }
            else {
                resolve(false)
            }
        });
    });
};

app.post('/player', async (req, res) => {
    const userdata = req.body;

    if (!userdata.user_name || !userdata.points || userdata.pin) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const playerUpdated = await checkExistingPlayer(userdata);
        if (playerUpdated) {
            return res.status(200).json({ code: 0, message: 'Score updated successfully' });
        }
        const sql = `INSERT INTO leaderb_witch (user_name, points, pin) VALUES (?, ?, ?)`;
        const values = [userdata.user_name, userdata.points, userdata.pin];

        con.query(sql, values, (err, result) => {
            if (err) {
                return res.status(400).json({ code: 4, message: "Player's score insertion failed"});
            }
            res.status(200).json({ code: 0, message: 'Player added successfully' });
        });
    } catch (error) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
});

app.post('/checkPlayer', async (req, res) => {
    const user_name = req.body.user_name;
    const pin = req.body.pin;

    if(!user_name || !pin) {
        return res.status(400).json({ code: 1, message: "User_name and pin are required" });
    }

    try{
        con.query(`SELECT pin FROM leaderb_witch WHERE user_name = ?`, [user_name], function (err, user_pin  ) {
            if(user_pin.length=== 0) {
                return res.status(200).json({ code: 0, message: "New User" });
            }
            if(pin === user_pin[0].pin) {
                return res.status(200).json({ code: 0, message: "Enter the game"});
            }
            if(pin !== user_pin[0].pin && user_pin[0].pin !== null) {
                return res.status(400).json({ code: 10, message: "User name and pin did not match" });
            }
            if (err) {
                return res.status(401).json({ code: 5, message: "Could not fetch the data", error: err.message });
            }
            res.status(200).json({ code: 0, message: "Player's details fetched successfully", player: player });
        });
    }
    catch (error) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
});

app.get('/player', (req, res) => {
    const user_name = req.query.user_name;

    if (!user_name) {
        return res.status(400).json({ code: 1, message: "User name is required" });
    }

    try {
        con.query(`SELECT * FROM leaderb_witch WHERE user_name = ?`, [user_name], function (err, player) {
            if (err) {
                return res.status(401).json({ code: 5, message: "Could not fetch the data", error: err.message });
            }
            res.status(200).json({ code: 0, message: "Player's details fetched successfully", player: player });
        });
    } catch (error) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
});

// Smash the cans 

app.get('/cans/players', (req, res) => {
    try {
        con.query("SELECT *, rank() OVER (ORDER BY points_m desc) AS players_rank FROM leaderb_cans ORDER BY points_m DESC, user_name", function (err, players) {
            if (err) {
                return res.status(401).json({ code: 1, message: "Could not fetch the data", error: err.message })
            }
            else {
                return res.status(200).json({ code: 0, message: "Players Fetched Successfully", players: players })
            }
        });
    } catch (error) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
})

const checkExistingPlayerCans = (userdata) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM leaderb_cans WHERE user_name = ?", [userdata.user_name], (err, result) => {
            if (err) {
                return reject(err)
            }
            if (result.length > 0 && result[0].points_m <= userdata.points_m) {
                con.query("UPDATE leaderb_cans SET points_m = ? WHERE user_name = ?", [userdata.points_m, userdata.user_name], (err) => {
                    if (err) {
                        return reject(err)
                    }
                    resolve(true);
                });
            }
            else {
                resolve(false)
            }
        });
    });
};

app.post('/cans/player', async (req, res) => {
    const userdata = req.body;

    if (!userdata.user_name || !userdata.points_m || userdata.pin) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const playerUpdated = await checkExistingPlayerCans(userdata);
        if (playerUpdated) {
            return res.status(200).json({ code: 0, message: 'Score updated successfully' });
        }
        const sql = `INSERT INTO leaderb_cans (user_name, points_m) VALUES (?, ?, ?)`;
        const values = [userdata.user_name, userdata.points_m, userdata.pin];

        con.query(sql, values, (err, result) => {
            if (err) {
                return res.status(400).json({ code: 4, message: "Player's score insertion failed"});
            }
            res.status(200).json({ code: 0, message: 'Player added successfully' });
        });
    } catch (error) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
});

app.get('/cans/player', (req, res) => {
    const user_name = req.query.user_name;

    if (!user_name) {
        return res.status(400).json({ code: 1, message: "User_name is required" });
    }

    try {
        con.query(`SELECT * FROM leaderb_cans WHERE user_name = ?`, [user_name], function (err, player) {
            if (err) {
                return res.status(401).json({ code: 5, message: "Could not fetch the data", error: err.message });
            }
            res.status(200).json({ code: 0, message: "Player's details fetched successfully", player: player });
        });
    } catch (error) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
});

app.post('/cans/checkPlayer', async (req, res) => {
    const user_name = req.body.user_name;
    const pin = req.body.pin;

    if(!user_name || !pin) {
        return res.status(400).json({ code: 1, message: "User name and pin are required" });
    }

    try{
        con.query(`SELECT pin FROM leaderb_cans WHERE user_name = ?`, [user_name], function (err, user_pin  ) {
            if(user_pin.length=== 0) {
                return res.status(200).json({ code: 0, message: "New User" });
            }
            if(pin === user_pin[0].pin) {
                return res.status(200).json({ code: 0, message: "Enter the game"});
            }
            if(pin !== user_pin[0].pin && user_pin[0].pin !== null) {
                return res.status(400).json({ code: 10, message: "User name and pin did not match" });
            }
            if (err) {
                return res.status(401).json({ code: 5, message: "Could not fetch the data", error: err.message });
            }
            res.status(200).json({ code: 0, message: "Player's details fetched successfully", player: player });
        });
    }
    catch (error) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
});

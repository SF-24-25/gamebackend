import express from 'express';
import mysql from 'mysql2';
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

const app = express();
app.use(express.json())
app.use(cors())
dotenv.config()

const PORT = 14452
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
        con.query("SELECT *, rank() OVER (ORDER BY points desc) AS players_rank FROM leaderboard ORDER BY points DESC, user_name", function (err, players) {
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
        con.query("SELECT * FROM leaderboard WHERE sfID = ?", [userdata.sfID], (err, result) => {
            if (err) {
                return reject(err)
            }
            if (result.length > 0 && result[0].points <= userdata.points) {
                con.query("UPDATE leaderboard SET points = ? WHERE sfID = ?", [userdata.points, userdata.sfID], (err) => {
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

    if (!userdata.user_name || !userdata.sfID || !userdata.points) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const playerUpdated = await checkExistingPlayer(userdata);
        if (playerUpdated) {
            return res.status(200).json({ code: 0, message: 'Score updated successfully' });
        }
        const sql = `INSERT INTO leaderboard (user_name, sfID, points) VALUES (?, ?, ?)`;
        const values = [userdata.user_name, userdata.sfID, userdata.points];

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

app.get('/player', (req, res) => {
    const sfID = req.query.sfID;

    if (!sfID) {
        return res.status(400).json({ code: 1, message: "sfID is required" });
    }

    try {
        con.query(`SELECT * FROM leaderboard WHERE sfID = ?`, [sfID], function (err, player) {
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
        con.query("SELECT *, rank() OVER (ORDER BY points_m desc) AS players_rank FROM leaderboard_cans ORDER BY points_m DESC, user_name", function (err, players) {
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
        con.query("SELECT * FROM leaderboard_cans WHERE sfID = ?", [userdata.sfID], (err, result) => {
            if (err) {
                return reject(err)
            }
            if (result.length > 0 && result[0].points_m <= userdata.points_m) {
                con.query("UPDATE leaderboard_cans SET points_m = ? WHERE sfID = ?", [userdata.points_m, userdata.sfID], (err) => {
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

    if (!userdata.user_name || !userdata.sfID || !userdata.points_m) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const playerUpdated = await checkExistingPlayerCans(userdata);
        if (playerUpdated) {
            return res.status(200).json({ code: 0, message: 'Score updated successfully' });
        }
        const sql = `INSERT INTO leaderboard_cans (user_name, sfID, points_m) VALUES (?, ?, ?)`;
        const values = [userdata.user_name, userdata.sfID, userdata.points_m];

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
    const sfID = req.query.sfID;

    if (!sfID) {
        return res.status(400).json({ code: 1, message: "sfID is required" });
    }

    try {
        con.query(`SELECT * FROM leaderboard_cans WHERE sfID = ?`, [sfID], function (err, player) {
            if (err) {
                return res.status(401).json({ code: 5, message: "Could not fetch the data", error: err.message });
            }
            res.status(200).json({ code: 0, message: "Player's details fetched successfully", player: player });
        });
    } catch (error) {
        res.status(500).json({ code: -1, message: 'Internal server error' });
    }
});
import express from 'express'
const app = express()
// var mysql = require('mysql');
import mysql from 'mysql2'

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root85",
    database: "players_data"
});

con.connect(function (err) {
    if (err) throw err;
    else {
        app.listen(4000, () => {
            console.log("App listening on port 4000")
        })
    }
});

app.use(express.json())

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
        res.status(500).json({ message: 'Internal server error' });
    }

});

app.get('/players', (req, res) => {
    try {
        con.query("SELECT * FROM leaderboard ORDER BY points desc, user_name", function (err, players) {
            if (err) {
                return res.status(500).json({ message: "Could not fetch the data", error: err.message })
            }
            else {
                return res.status(200).json({message: "Players Fetched Successfully",players: players})
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

const checkExistingPlayer = (userdata) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM leaderboard WHERE sfID = ?", [userdata.sfID], (err, result) => {
            if (err) {
                res.status(500).json({ message: "Error while fetching Player's details", error: err.message });
                return reject(err)
            }
            if (result.length > 0 && result[0].points < userdata.points) {
                con.query("UPDATE leaderboard SET points = ? WHERE sfID = ?", [userdata.points, userdata.sfID], (err) => {
                    if (err) {
                        res.status(500).json({ message: "Error while updating Player's points", error: err.message });
                        return reject(err)
                    }
                    res.status(200).json({ message: "Player updated successfully" })
                    resolve(true);
                });
            } else {
                resolve(false)
            }
        });
    });
};

app.post('/player',  async(req, res) => {
    const userdata = req.body;

    if (!userdata.user_name || !userdata.sfID || !userdata.points) {
        return res.status(400).json({ message: 'Invalid input data' });
    }

    try {
        const playerUpdated = await checkExistingPlayer(userdata);
        if (playerUpdated) {
            return res.status(200).json({ message: 'Player updated successfully' });
        }
        const sql = `INSERT INTO leaderboard (user_name, sfID, points) VALUES (?, ?, ?)`;
        const values = [userdata.user_name, userdata.sfID, userdata.points];

        con.query(sql, values, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', details: err.message });
            }
            res.status(200).json({ message: 'Player added successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error'});
    }
});

app.get('/player', (req, res) => {
    const sfID = req.body
    try {
        con.query(`SELECT * FROM leaderboard WHERE sfID = ?`, [sfID], function (err, player) {
            if (err) {
                return res.status(500).json({ message: "Could not fetch the data", error: err.message })
            }
            else {
                res.status(200).json({message: "Player's details fetched successfully",player: player})
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})
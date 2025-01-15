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
    res.send("Server is running and database is connected!");
});

app.get('/players', (req, res) => {
    con.query("SELECT * FROM leaderboard ORDER BY points desc, user_name", function (err, players) {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: "Could not fetch the data" })
        }
        else {
            res.status(200).json(players)
        }
    });
})

app.post('/players', (req, res) => {
    const userdata = req.body
    console.log(userdata)
    if (err) {
        console.log("Error is ", err)
        throw err
    };
    var sql = ` INSERT INTO leaderboard (user_name, sfID, points) VALUES ${userdata.user_name, userdata.sfID, userdata.points}`;
    con.query(sql, function (err, result) {
        if (!err) {
            res.status(200).json(result)
        }
        else {
            throw err
            res.status(400).json({ error: 'Cannot update the score' })
        }
    });
})

//     const user = req.body
//     db.collection("users")
//         .insertOne(user)
//         .then(result => {
//             res.status(201).json(result)
//         })
//         .catch(err => {
//             res.status(400).json({ error: 'Cannot update the score' })
//         })
// })

// app.get('/users/:id', (req, res) => {
//     if (ObjectId.isValid()) {
//         db.collection("users")
//             .findOne({ _id: ObjectId(req.params.id) })
//             .then(doc => {
//                 res.status(200).json(doc)
//             })
//             .catch(err => {
//                 res.status(408).json({ error: "Could not fetch the data of the user" })
//             })
//     }
//     else {
//         res.status(412).json({ error: "Enter a valid id" })
//     }
// })

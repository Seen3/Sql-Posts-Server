const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();


//I heard bodyParser is depracted btw :( used it too much
app.use(bodyParser.json());
app.use(cors());

//SECRET
//
const db = mysql.createConnection({
    host: 'localhost',
    user: 'Seen',
    password: 'wordpass',
    database: 'dbdbdbdbdb'
});
//

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected');
});

const JWT_SECRET = 'SECRET';


app.post('/login', (req, res) => {
    //some assumptions made
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            //:(
            throw err;
        }

        if (results.length > 0) {
            //console.log(results);
            let token = jwt.sign({ userId: results[0].id }, JWT_SECRET, { expiresIn: '10h' }); // :)
            res.json({ token });
        } else {
            res.status(400).json({ message: 'YOU SHALL NOT PASS !!!' });
        }
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Data Missing' });
    }
    //Assuming multiple unames not allowed
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            throw err;
        }
        if (results.length > 0) {
            res.status(400).json({ message: 'IMPOSTER, WE ALREADY HAVE YOU' });
        } else {
            // Good case
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, results) => {
                if (err) {
                    throw err;
                }

                res.status(400).json({ message: 'Welcome to the Database' });
            });
        }
    });
});
app.get('/posts', (req, res) => {
    const S = `
    SELECT posts.id, posts.title, posts.content, users.username AS created_by
    FROM posts
    INNER JOIN users ON posts.user_id = users.id
  `;
    db.query(S, (err, results) => {
        if (err) {
            //console.error(err);
            res.status(500).send('No Fetching');
            return;
        }
        //console.log(results);
        res.json(results);
    });
});


app.get('/posts/:userId', (req, res) => {
    const userId = req.params.userId;
    const sqlQ = `SELECT * FROM posts WHERE user_id = ${userId}`;
    connection.query(sqlQ, (error, results, fields) => {
        if (error) {
            //console.log(error);
            res.status(500).json({ error: 'No posts for U' });
        } else {
            res.status(200).json(results);
        }
    });
});


app.post('/posts/new', (req, res) => {
    //console.log(req.body);
    //Also assuming user_id is valid and not spoofed.
    const { title, content, user_id } = req.body;
    if (!title || !content || !user_id) {
        res.status(400).json({ error: 'Data Missing' });
        return;
    }

    const sql = `INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)`;
    connection.query(sql, [title, content, user_id], (error, results, fields) => {
        if (error) {
            //console.log(error);
            res.status(500).json({ error: 'No posts.' });
        } else {
            res.status(200).json({ message: 'post created' });
        }
    });
});
app.listen(9009, () => {
    console.log('server on port 9009.');
});
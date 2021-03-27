const express = require('express');
const app = express();
const { pool } = require('./config');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(flash());

app.use(
  session({
    secret: ' secret ',
    resave: 'false,',
    saveUninitialized: false,
  })
);

app.use;
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/users/register', (req, res) => {
  res.render('register.ejs');
});
app.get('/users/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/users/userpanel', (req, res) => {
  res.render('userpanel.ejs');
});

app.post('/users/register', async (req, res) => {
  let { name, email, password, password_confirm } = req.body;
  console.log({
    name,
    email,
    password,
    password_confirm,
  });
  let errors = [];

  if (!name || !email || !password || !password_confirm) {
    errors.push({ message: 'Please enter all field correctly' });
  }
  if (password.length < 8) {
    errors.push({ message: 'Password must be 6 characters long' });
  }

  if (password !== password_confirm) {
    errors.push({ message: 'Passwords do not match' });
  }

  if (errors.length > 0) {
    res.render('register', { errors, name, email, password, password_confirm });
  } else {
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    pool.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);
        if (results.rows.length > 0) {
          errors.push({ message: 'You have already registered' });
          res.render('register', { errors });
        } else {
          pool.query(
            `INSERT INTO users (name,email,password)
            VALUES ($1, $2,$3)
            RETURNING id,password `,
            [name, email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash('success_msg', 'You are successfuly registered');
              res.redirect('/users/login');
            }
          );
        }
      }
    );
  }
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 5000;
}
app.listen(port, function () {
  console.log(`Server has started successfully at ${port}`);
});

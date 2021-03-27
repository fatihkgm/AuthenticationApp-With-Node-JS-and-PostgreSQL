const express = require('express');
const app = express();
const { pool } = require('./config');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
require('dotenv').config();
const initializePassport = require('./pswConfig');
initializePassport(passport);
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(
  session({
    secret: 'secret',
    resave: 'false,',
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/users/register', checkAuthenticated, (req, res) => {
  res.render('register');
});
app.get('/users/login', checkAuthenticated, (req, res) => {
  res.render('login');
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user.name });
});

app.get('/users/logout', (req, res) => {
  req.logout();
  res.render('index', { message: 'You have logged out successfully' });
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
  if (password.length < 6) {
    errors.push({ message: 'Password must be 6 characters long' });
  }

  if (password !== password_confirm) {
    errors.push({ message: 'Passwords do not match' });
  }

  if (errors.length > 0) {
    res.render('register', { errors, name, email, password, password_confirm });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    pool.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);
        if (results.rows.length > 0) {
          return res.render('register', {
            message: 'Email already registered',
          });
        } else {
          pool.query(
            `INSERT INTO users (name,email,password)
            VALUES ($1, $2, $3)
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

app.post(
  '/users/login',
  passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/dashboard');
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

let port = process.env.PORT;
if (port == null || port == '') {
  port = 5000;
}
app.listen(port, function () {
  console.log(`Server has started successfully at ${port}`);
});

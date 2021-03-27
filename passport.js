const localSave = require('passport-local').Strategy;
const { pool } = require('/config');
const bcrypt = require('bcrypt');

function implementation(passport) {
  const authenticateLocal = (email, password, exu) => {
    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (err, result) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);
        if (results.rows.length > 0) {
          const user = results.rows[0];
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              throw err;
            }
            if (isMatch) {
              return exu(null, user);
            } else {
              return exu(null, false, { message: 'Password is not correct' });
            }
          });
        } else {
          return exu(null, false, { message: 'You are not registered' });
        }
      }
    );
  };
  passport.use(
    new localSave(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      authenticateLocal
    )
  );
  passport.serializeuser((user, exu) => exu(null, user.id));

  passport.deserializeUser((id, exu) => {
    `SELECT * FROM users WHERE id = $1`,
      [id],
      (err, results) => {
        if (err) {
          throw err;
        }
        return done(null, results.row[0]);
      };
  });
}

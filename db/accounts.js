const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "E-commerce api",
  password: "postgres2",
  port: 5433,
});
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");


const createAccount = async (account) => {
  const { username, password, email } = account;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const results = await pool.query(
      "INSERT INTO accounts (username, password, email) VALUES($1, $2, $3) RETURNING *",
      [username, hashedPassword, email]
    );
    const newAccount = results.rows[0];
    return newAccount;
  } catch (err) {
    console.log("Error creating account", err);
    throw err;
  }
};

const login = new localStrategy( {passReqToCallback: true}, async (req, username, password, done) => {
  try {
    const result = await pool.query(
      "SELECT * FROM accounts WHERE username = $1",
      [username]
    );
    if (result.rows.length === 0)
      return done(null, false, { message: "Incorrect Username." });

    const user = result.rows[0];
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched)
      {return done(null, false, { message: "Incorrect Password" });};

    req.session.authorized = true;
    console.log('session after login:', req.session);

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

const deserializeAccountById = async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM accounts WHERE id = $1", [
      id,
    ]);
    if (result.rows.length == 0) {
      done(new Error("User not found"));
    }
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
};

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware
    return next();
  } else {
    // User is not authenticated, return a 401 Unauthorized response
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const isOwner = (req, res, next) => {
  const requestedUserId = parseInt(req.params.id);
  const authenticatedUserId = parseInt(req.user.id);
  // console.log('this is what you request:', requestedUserId);
  // console.log('this is you:', authenticatedUserId);
  // console.log('this is req.user', req.user);
  // console.log('this is session', req.session);

  if(requestedUserId !== authenticatedUserId) {
    return res.status(401).json({error: "You're not him"})
  }
  next()
};

module.exports = { createAccount, login, deserializeAccountById, checkAuthenticated, isOwner };

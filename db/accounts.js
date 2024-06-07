const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "E-commerce api",
  password: "postgres2",
  port: 5433,
});
const localStrategy = require("passport-local");

const createAccount = async (account) => {
  const { username, password, email } = account;
  try {
    const results = await pool.query(
      "INSERT INTO accounts (username, password, email) VALUES($1, $2, $3) RETURNING *",
      [username, password, email]
    );
    const newAccount = results.rows[0];
    return newAccount;
  } catch (err) {
    console.log("Error creating account", err);
    throw err;
  }
};

const login = new localStrategy(async function (username, password, done) {
  try {
    const result = await pool.query(
      "SELECT * FROM accounts WHERE username = $1",
      [username]
    );
    if (result.rows.length === 0)
      return done(null, false, { message: "Incorrect Username." });

    const user = result.rows[0];
    if (user.password != password)
      return done(null, false, { message: "Incorrect Password" });

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

module.exports = { createAccount, login, deserializeAccountById };

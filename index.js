const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db/queries");
const accounts = require("./db/accounts");
const passport = require("passport");
const session = require('express-session');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
  secret: 'foS5gMf6Y6',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(accounts.login);

passport.serializeUser((user, done) => {
  req.session.authenticated = true;
  done(null, user.id);
});
passport.deserializeUser(accounts.deserializeAccountById);

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.send('login success')
  }
);
app.get("/login", (req, res) => {
  res.send("Please log in again"); // Or any other response
});

app.post("/register", async (req, res) => {
  try {
    const newAccount = await accounts.createAccount(req.body);
    res.status(201).send(newAccount);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/accounts", db.getAllAccounts);
app.get("/accounts/:id", db.getAccountById);


app.get("/products", (req, res, next) => {
  const {categoryId} = req.query;
  if (categoryId) {
    db.getProductByCategoryId(req, res, next);
  } else {
    db.getAllProducts(req, res, next);
  }
});
app.get("/products/:id", db.getProductById);


app.get("/accounts/:accountId/cart", db.getCart);


app.get("/orders", db.getAllOrders);
app.get("/orders/:id", db.getOrderById);

app.listen(3001, () => {
  console.log("listen to server 3001");
});
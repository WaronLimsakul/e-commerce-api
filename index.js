const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db/queries");
const accounts = require("./db/accounts");
const passport = require("passport");
const session = require("express-session");

////////////////////////////////////////////////////////// session and server configuration
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(
  session({
    secret: "foS5gMf6Y6",
    cookie: {maxAge: 1000*60*5, secure: false, sameSite: "none"},
    resave: false,
    saveUninitialized: false,
  })
);


app.use(passport.initialize());
app.use(passport.session());


passport.use(accounts.login);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(accounts.deserializeAccountById);


////////////////////////////////////////////////////////// login - register -logout
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/success",
  })
);
app.get("/login", (req, res) => {
  res.status(400).send("Please log in again"); // Or any other response
});
app.get("/success", accounts.checkAuthenticated,(req, res) => {
  res.send("login success!");
});

app.post("/register", async (req, res) => {
  try {
    const newAccount = await accounts.createAccount(req.body);
    res.status(201).send(newAccount);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("error logging out");
    } 
      res.send("logout successful");
    });
  });
  

////////////////////////////////////////////////////////// endpoint part
app.get("/accounts", db.getAllAccounts);
app.get(
  "/accounts/:id",
  accounts.checkAuthenticated,
  accounts.isOwner,
  db.getAccountById
);

app.get("/products", (req, res, next) => {
  const { categoryId } = req.query;
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


////////////////////////////////////////////////////////// activate server
app.listen(3001, () => {
  console.log("listen to server 3001");
});

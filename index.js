const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./db/queries");
const accounts = require("./db/accounts");
const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());

passport.use(accounts.login);

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("products");
  }
);

app.get("/accounts", db.getAllAccounts);
app.get("/accounts/:id", db.getAccountById);
app.get("/products", db.getAllProducts);
app.get("/products/:id", db.getProductById);
app.get("/accounts/:accountId/cart", db.getCart);
app.get("/orders", db.getAllOrders);
app.get("/orders/:id", db.getOrderById);

app.post("/register", async (req, res) => {
  try {
    const newAccount = await accounts.createAccount(req.body);
    res.status(201).send(newAccount);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => {
  console.log("listen to server 3001");
});

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db/queries');


app.get('/accounts', db.getAllAccounts);
app.get('/accounts/:id', db.getAccountById);
app.get('/products', db.getProducts);
app.get('/products/:id', db.getProductById);
app.get('/accounts/:accountId/cart', db.getCart);
app.get('/orders', db.getAllOrders);
app.get('/orders/:id', db.getOrderById);

app.listen(3001, () => {
    console.log('listen to server 3001')
});
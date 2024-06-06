const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db/queries');

app.get('/products', db.getProducts);

app.listen(3001, () => {
    console.log('listen to server 3001')
});
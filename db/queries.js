const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'E-commerce api',
    password: 'postgres2',
    port: 5433,
})

const getAllProducts = (req, res) => {
    pool.query('SELECT * FROM products ORDER BY id', (err, results) => {
        if (err) {
            throw err
        }
        res.status(200).send(results.rows);
    })
};


const getCart = 

module.exports = {getAllProducts, };
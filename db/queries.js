const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "E-commerce api",
  password: "postgres2",
  port: 5433,
});

// Accounts
const getAllAccounts = (req, res) => {
  pool.query("SELECT username, email FROM accounts ORDER BY id", (err, results) => {
    if (err) {
      throw err;
    }
    res.status(200).json(results.rows);
  });
};
const getAccountById = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query("SELECT * FROM accounts WHERE id = $1", [id], (err, results) => {
    if (err) {
      console.error("Error fetching account by ID", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(200).json(results.rows);
  });
};

// Products
const getAllProducts = (req, res) => {
  pool.query("SELECT * FROM products ORDER BY id", (err, results) => {
    if (err) {
      throw err;
    }
    res.status(200).json(results.rows);
  });
};

const getProductById = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query("SELECT * FROM products WHERE id = $1", [id], (err, results) => {
    if (err) {
      console.error("Error fetching product by ID", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(200).json(results.rows);
  });
};

const getProductByCategoryId = (req, res) => {
  const { categoryId } = req.query;
  pool.query("SELECT * FROM products WHERE category_id = $1", [categoryId], (err, results) => {
    if (err) {
      console.error("Error fetching product by category", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(200).json(results.rows);
  });
};

// Carts
const getCart = (req, res) => {
  const accountId = parseInt(req.params.accountId);
  pool.query(
    "SELECT * FROM products WHERE account_id = $1",
    [accountId],
    (err, results) => {
      if (err) {
        console.error("Error fetching cart by ID", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.status(200).json(results.rows);
    }
  );
};

// Orders
const getAllOrders = (req, res) => {
  pool.query("SELECT * FROM orders ORDER BY id", (err, results) => {
    if (err) {
      throw err;
    }
    res.status(200).json(results.rows);
  });
};

const getOrderById = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query("SELECT * FROM orders WHERE id = $1", [id], (err, results) => {
    if (err) {
      console.error("Error fetching order by ID", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.status(200).json(results.rows);
  });
};



module.exports = {
  getAllProducts,
  getProductById,
  getProductByCategoryId,
  getAccountById,
  getAllAccounts,
  getCart,
  getOrderById,
  getAllOrders,
};

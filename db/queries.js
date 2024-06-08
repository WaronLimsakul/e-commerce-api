const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "E-commerce api",
  password: "postgres2",
  port: 5433,
});

////////////////////////////////////////////////// Accounts
const getAllAccounts = (req, res) => {
  pool.query(
    "SELECT id, username FROM accounts ORDER BY id",
    (err, results) => {
      if (err) {
        throw err;
      }
      res.status(200).json(results.rows);
    }
  );
};
const getAccountById = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query(
    "SELECT * FROM accounts_detail WHERE id = $1",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error fetching account by ID", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.status(200).json(results.rows);
    }
  );
};
const updateAccountById = async (req, res) => {
  const id = parseInt(req.params.id);
  const { full_name, email, date_of_birth, address } = req.body;
  try {
    if (full_name) {
      await pool.query(
        "UPDATE accounts_detail SET full_name = $1 WHERE account_id = $2",
        [full_name, id]
      );
    }
    if (email) {
      await pool.query(
        "UPDATE accounts_detail SET email = $1 WHERE account_id = $2",
        [email, id]
      );
    }
    if (date_of_birth) {
      await pool.query(
        "UPDATE accounts_detail SET date_of_birth = $1 WHERE account_id = $2",
        [date_of_birth, id]
      );
    }
    if (address) {
      await pool.query(
        "UPDATE accounts_detail SET address = $1 WHERE account_id = $2",
        [address, id]
      );
    }
  } catch (err) {
    res.status(500).send("error updating accounts");
  }
  const updatedAccount = await pool.query(
    "SELECT * FROM accounts_detail WHERE account_id = $1",
    [id]
  );

  res.send(updatedAccount.rows[0]);
};

////////////////////////////////////////////////// Products
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
  pool.query(
    "SELECT * FROM products WHERE category_id = $1",
    [categoryId],
    (err, results) => {
      if (err) {
        console.error("Error fetching product by category", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.status(200).json(results.rows);
    }
  );
};

////////////////////////////////////////////////// Carts
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


////////////////////////////////////////////////// Orders
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

//////////////////////////////////////////////////
module.exports = {
  getAllProducts,
  getProductById,
  getProductByCategoryId,
  getAccountById,
  getAllAccounts,
  updateAccountById,
  getCart,
  getOrderById,
  getAllOrders,
};

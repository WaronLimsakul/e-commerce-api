const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
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
    "SELECT * FROM accounts_detail WHERE account_id = $1",
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
    const updatedAccount = await pool.query("SELECT * FROM accounts_detail WHERE account_id = $1", [id]);
    res.status(201).json({message: "update success!", detail:updatedAccount.rows[0]} );
  } catch (err) {
    res.status(500).send("error updating accounts");
  }
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

////////////////////////////////////////////////// Help calculate total price
const calculateTotalPrice = async (cartId) => {
  try {
    const result = await pool.query(
      `SELECT SUM(pc.quantity * p.price) AS total_price
      FROM products_carts pc 
      JOIN products p ON pc.product_id = p.id 
      WHERE pc.cart_id = $1`,
      [cartId]
    );
    if (result.rows.length > 0) {
      return result.rows[0].total_price;
    } else {
      return 0;
    }
  } catch (err) {
    console.error(err);
  }
};

////////////////////////////////////////////////// Carts
const getCart = async (req, res) => {
  const accountId = parseInt(req.params.id);
  try {
    const cart = await pool.query("SELECT * FROM carts WHERE account_id = $1 AND checked_out = false", [
      accountId,
    ]);
    // const cartProducts = await pool.query(
    //   "SELECT product_id, quantity FROM products_carts WHERE cart_id = $1",
    //   [cart.rows[0].id]
    // );
    console.log("cart found:", cart.rows.length);
    if (cart.rows.length == 0) {
      return res.status(404).send("cart not found");
    }
    res.json(cart.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
};

const createCart = async (req, res) => {
  //assume that the user is authenticated
  const userId = req.user.id;
  try {
    const existingCart = await pool.query(
      "SELECT * FROM carts WHERE account_id = $1 AND checked_out = false",
      [userId]
    );
    if (existingCart.rows.rength > 0) {
      return res.redirect(`/accounts/${userId}/cart`);
    }
    const newCart = await pool.query(
      "INSERT INTO carts (account_id, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *",
      [userId]
    );
    res.status(201).json(newCart.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
    throw err
  }
};

const updateCart = async (req, res) => {
  const cartId = parseInt(req.params.id);
  const { productId, quantity } = req.body;

  try {
    const existingProduct = await pool.query(
      "SELECT * FROM products_carts WHERE cart_id = $1 AND product_id = $2",
      [cartId, productId]
    );
    if (existingProduct.rows.length > 0) {
      const updatedCart = await pool.query(
        "UPDATE products_carts SET quantity = quantity + $1, updated_at = NOW() WHERE cart_id = $2 AND product_id = $3 RETURNING *",
        [quantity, cartId, productId]
      );
      const totalPrice = await calculateTotalPrice(cartId);
      const cartNow = await pool.query(
        "UPDATE carts SET total_price = $1 WHERE id = $2 RETURNING id, updated_at, total_price",
        [totalPrice, cartId]
      );
      return res
        .status(200)
        .json({ cart: cartNow.rows[0], detail: updatedCart.rows[0] });
    }
    const newProduct = await pool.query(
      "INSERT INTO products_carts (cart_id, product_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
      [cartId, productId, quantity]
    );
    const totalPrice = await calculateTotalPrice(cartId);
    const cartNow = await pool.query(
      "UPDATE carts SET total_price = $1 WHERE id = $2 RETURNING id, updated_at, total_price",
      [totalPrice, cartId]
    );
    res.status(201).json({ cart: cartNow.rows[0], detail: newProduct.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
    throw err;
  }
};
////////////////////////////////////////////////// Checkout

const checkout = async (req, res) => {
  const cartId = parseInt(req.params.id);
  const accountId = parseInt(req.user.id);
  try {
    // check if cart exist + has products
    const cart = await pool.query(
      "SELECT * FROM carts WHERE id = $1 AND account_id = $2 AND checked_out = false",
      [cartId, accountId]
    );
    console.log('cart id :', cartId);
    console.log('account id:', accountId);
    if (cart.rows.length == 0) {
      return res
        .status(404)
        .json({ error: "Cart not found or already checked out" });
    }
    const cartProducts = await pool.query(
      "SELECT * FROM products_carts WHERE cart_id = $1",
      [cartId]
    );
    if (cartProducts.rows.length == 0) {
      return res.status(404).send({ error: "Items not found" });
    }

    // payment (mocked)
    const paymentSuccess = true;
    if (!paymentSuccess) {
      res.status(500).json({ error: "payment failed" });
    }

    // create order
    const orderResult = await pool.query(
      `INSERT INTO orders (account_id, order_date, total_price, status) 
      VALUES ($1, CURRENT_DATE, $2, $3) RETURNING *`,
      [accountId, cart.rows[0].total_price, "completed"]
    );
    const newOrder = orderResult.rows[0];

    // tick checked_out cart
    await pool.query(`UPDATE carts SET checked_out = true WHERE id = $1`, [
      cartId,
    ]);

    // send products in cart to order
    for (const product of cartProducts.rows) {
      await pool.query(
        `INSERT INTO products_orders (product_id, order_id, quantity) VALUES ($1, $2, $3)`,
        [product.product_id, newOrder.id, product.quantity]
      );
    }
    // respond woohoo
    res.status(200).json({message: "successful order", newOrder});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "INternal server error" });
    throw err;
  }
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

const getOrderHistory = async (req, res) => {
  const accountId = parseInt(req.user.id);
  try {
    const orderResult = await pool.query("SELECT * FROM orders WHERE account_id = $1 ORDER BY order_date", [accountId]);
    if (orderResult.rows.length == 0) {
      return res.send("No order found");
    }
    const orderHistory = orderResult.rows;
    res.json(orderHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({error: "internal server error"});
  }
};

////////////////////////////////////////////////// exports
module.exports = {
  getAllProducts,
  getProductById,
  getProductByCategoryId,
  getAccountById,
  getAllAccounts,
  updateAccountById,
  getCart,
  createCart,
  updateCart,
  getOrderById,
  getAllOrders,
  getOrderHistory,
  checkout,
};

import express, { Request, Response, Router } from "express";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";

dotenv.config();

const router: Router = express();
const verifyJWT = require("../middleware/verifyJWT");
router.use(express.json());

function connect() {
  return new sqlite3.Database(
    "C:/Users/filip/projekty/wdai/Sklepik_R/express-server/database.db"
  );
}

router.get("/prices", (req: Request, res: Response) => {
  const { ids } = req.query;

  if (!ids) {
    res.status(400).send({ message: "Product IDs are required" });
    return;
  }

  const productIds = (ids as string).split(",").map((id) => parseInt(id, 10));

  const db = connect();

  db.all(
    `SELECT price FROM products WHERE id IN (${productIds
      .map(() => "?")
      .join(",")})`,
    productIds,
    (err, rows) => {
      if (err) {
        console.error("Error fetching product prices from the database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.json(rows);
    }
  );

  db.close();
});

router.post("/send", verifyJWT, (req: Request, res: Response) => {
  const { userid, ids, quantities, totalValue, address } = req.body;

  if (!userid || !ids || !quantities || !totalValue || !address) {
    res.status(400).send({ message: "Missing required fields" });
    return;
  }

  if (ids.length !== quantities.length) {
    res
      .status(400)
      .send({ message: "Mismatch between product IDs and quantities" });
    return;
  }

  const db = connect();
  const date = new Date().toISOString();

  db.serialize(() => {
    db.run(
      `INSERT INTO orders (user_id, date, total_value, address)
         VALUES (?, ?, ?, ?)`,
      [userid, date, totalValue, address],
      function (err) {
        if (err) {
          console.error("Error inserting order into database:", err);
          db.close();
          res.status(500).send({ message: "Error processing the order" });
          return;
        }

        const orderId = this.lastID;
        let completedItems = 0;
        let hasError = false;

        const insertDetails = db.prepare(`
            INSERT INTO order_details (order_id, product_id, unit_price, quantity)
            VALUES (?, ?, ?, ?)
          `);

        for (let i = 0; i < ids.length; i++) {
          const productId = ids[i];
          const quantity = quantities[i];

          db.get(
            "SELECT price, quantity AS stock FROM products WHERE id = ?",
            [productId],
            (err: Error, row: { price: number; stock: number } | undefined) => {
              if (err) {
                console.error("Error fetching product price:", err);
                hasError = true;
                db.close();
                res
                  .status(500)
                  .send({ message: "Error fetching product price" });
                return;
              }

              const unitPrice = row?.price || 0;
              const stock = row?.stock || 0;

              if (stock < quantity) {
                db.get(
                  "SELECT title AS name from products WHERE id = ?",
                  [productId],
                  (err: Error, row: { name: string } | undefined) => {
                    if (err) {
                      console.error("Error fetching product title:", err);
                      hasError = true;
                      db.close();
                      res
                        .status(500)
                        .send({ message: "Error fetching product title" });
                      return;
                    }
                    hasError = true;
                    db.close();
                    res.status(400).send({
                      message: `Brak produktu ${row?.name} w magazynie`,
                    });
                  }
                );
                return;
              }

              insertDetails.run(
                orderId,
                productId,
                unitPrice,
                quantity,
                (err: Error) => {
                  if (err) {
                    console.error("Error inserting order detail:", err);
                    hasError = true;
                    db.close();
                    res
                      .status(500)
                      .send({ message: "Error processing order details" });
                    return;
                  }

                  // Reduce product stock in the database
                  db.run(
                    `UPDATE products SET quantity = quantity - ? WHERE id = ?`,
                    [quantity, productId],
                    (updateErr) => {
                      if (updateErr) {
                        console.error(
                          "Error updating product stock:",
                          updateErr
                        );
                        hasError = true;
                        db.close();
                        res
                          .status(500)
                          .send({ message: "Error updating product stock" });
                        return;
                      }

                      completedItems++;

                      // Only proceed if this is the last item and no errors occurred
                      if (completedItems === ids.length && !hasError) {
                        insertDetails.finalize(() => {
                          db.close();
                          res.status(201).send({
                            message: "Order successfully created",
                            orderId,
                          });
                        });
                      }
                    }
                  );
                }
              );
            }
          );
        }
      }
    );
  });
});

router.get("/history", verifyJWT, (req: Request, res: Response) => {
  const { userid } = req.query;

  if (!userid) {
    res.status(400).send({ message: "User ID is required" });
    return;
  }

  const db = connect();

  db.all(
    `
      SELECT 
        o.order_id AS orderId,
        o.total_value AS totalValue,
        o.date AS orderDate,
        o.address AS orderAddress,
        od.product_id AS productId,
        od.quantity AS quantity
      FROM orders o
      JOIN order_details od ON o.order_id = od.order_id
      WHERE o.user_id = ?
    `,
    [userid],
    (err, rows) => {
      if (err) {
        console.error("Error fetching order history:", err);
        res.status(500).send({ message: "Internal Server Error" });
        return;
      }

      res.json(rows); // Send raw rows directly
    }
  );

  db.close();
});

module.exports = router;

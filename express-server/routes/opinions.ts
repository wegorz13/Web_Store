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

router.get("/validate", (req: Request, res: Response) => {
  console.log("Opinion validation endpoint hit");
  console.log("Query params:", req.query);

  const productId = req.query.productId;
  const userId = req.query.userId;

  if (!productId || !userId) {
    res.status(400).send({
      validation: false,
      error: "Missing product_id or user_id",
    });
    return;
  }

  const db = connect();

  db.all(
    `
      SELECT o.order_id
      FROM orders o
      JOIN order_details od ON o.order_id = od.order_id
      WHERE od.product_id = ? AND o.user_id = ?
    `,
    [productId, userId],
    (err, orderRows) => {
      if (err) {
        console.error("Error checking orders:", err);
        db.close();
        res.status(500).send({
          validation: false,
          error: "Database error during order query",
        });
        return;
      }

      console.log("Order query results:", orderRows);

      if (!orderRows || orderRows.length === 0) {
        db.close();
        res.send({
          validation: false,
          reason: "No orders found for this user and product",
        });
        return;
      }

      console.log("Executing opinion query with values:", {
        productId,
        userId,
      });

      db.get(
        `
        SELECT opinion_id
        FROM opinions
        WHERE product_id = ? AND user_id = ?
      `,
        [productId, userId],
        (err, opinionRow) => {
          if (err) {
            console.error("Error checking opinions:", err);
            db.close();
            res.status(500).send({
              validation: false,
              error: "Database error during opinion query",
            });
            return;
          }

          console.log("Opinion query result:", opinionRow);

          db.close();
          res.send({
            validation: !opinionRow,
          });
          return;
        }
      );
    }
  );
});

router.get("/:product_id", (req: Request, res: Response) => {
  const { product_id } = req.params;
  const db = connect();
  db.all(
    "SELECT opinion_id, product_id, email as username, opinions.user_id, content, rating FROM opinions JOIN users ON opinions.user_id=users.user_id WHERE product_id = ?",
    [product_id],
    (err, rows) => {
      if (err) {
        console.error("Error fetching product from the database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (!rows) {
        res.status(404).send({ message: "Brak opinii" });
      } else {
        res.json(rows);
      }
    }
  );

  db.close();
});

router.post("/", verifyJWT, (req: Request, res: Response) => {
  const { userId, productId, content, rating } = req.body;

  if (!userId || !productId || !content || !rating) {
    res.status(404).send({ message: "some data missing" });
    return;
  }

  const db = connect();

  db.run(
    `INSERT INTO opinions (product_id, user_id, content,rating) VALUES (?,?,?,?)`,
    [productId, userId, content, rating],
    function (err) {
      if (err) {
        res.status(500).send("Error inserting opinion");
        return;
      }

      const insertedOpinionId = this.lastID;

      db.get(
        `SELECT opinions.*, users.email FROM opinions JOIN users ON opinions.user_id = users.user_id WHERE opinions.opinion_id = ?`,
        [insertedOpinionId],
        (
          err,
          row: {
            id: number;
            product_id: number;
            user_id: number;
            content: string;
            rating: number;
            email: string;
          }
        ) => {
          if (err) {
            res
              .status(500)
              .send({ message: "Error fetching inserted opinion" });
            return;
          }

          const fullOpinion = {
            id: row.id,
            product_id: row.product_id,
            user_id: row.user_id,
            content: row.content,
            rating: row.rating,
            email: row.email.split("@")[0],
          };

          res.json(fullOpinion);
        }
      );
    }
  );

  db.close();
});

router.delete("/:opinion_id", verifyJWT, (req: Request, res: Response) => {
  const { opinion_id } = req.params;
  const db = connect();

  db.run(
    "DELETE FROM opinions WHERE opinion_id = ?",
    [opinion_id],
    function (err) {
      if (err) {
        console.error("Error deleting opinion:", err);
        res.status(500).send({ message: "Error deleting opinion" });
        return;
      }

      if (this.changes === 0) {
        res.status(404).send({ message: "Opinion not found" });
        return;
      }

      res.json({ message: "Opinion deleted successfully" });
    }
  );

  db.close();
});

module.exports = router;

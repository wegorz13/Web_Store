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

router.get("/", (req: Request, res: Response) => {
  const db = connect();
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      console.error("Error fetching products from the database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.json(rows);
  });
  db.close();
});

router.get("/cart", verifyJWT, (req: Request, res: Response) => {
  const { ids } = req.query;

  if (!ids) {
    res.status(400).send({ message: "Product IDs are required" });
    return;
  }

  const productIds = (ids as string).split(",").map((id) => parseInt(id, 10));

  const db = connect();

  db.all(
    `SELECT * FROM products WHERE id IN (${productIds
      .map(() => "?")
      .join(",")})`,
    productIds,
    (err, rows) => {
      if (err) {
        console.error("Error fetching products from the database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.json(rows);
    }
  );

  db.close();
});

router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params; // Extract id from request parameters
  const db = connect();
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching product from the database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (!row) {
      res.status(404).send({ message: "Product not found" });
    } else {
      console.log(row);
      res.status(201).json(row);
    }
  });

  db.close();
});

module.exports = router;

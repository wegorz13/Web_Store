import express, { Request, Response, Router } from "express";
import sqlite3 from "sqlite3";

const router: Router = Router();
router.use(express.json());

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

function connect() {
  return new sqlite3.Database(
    "C:/Users/filip/projekty/wdai/Sklepik_R/express-server/database.db"
  );
}

router.post("/register", async (req: Request, res: Response) => {
  let email = req.query.email as string;
  let password = req.query.password as string;

  email = decodeURI(email);
  password = decodeURI(password);
  const hashedPwd = await bcrypt.hash(password, 10);

  const db = connect();

  db.all(`SELECT * FROM users WHERE email = ?`, email, (err, rows) => {
    if (err) {
      console.error("Error fetching products from the database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (rows && rows.length > 0) {
      res.json({ message: "Użytkownik o danym emailu już istnieje" });
      return;
    } else {
      db.run(`INSERT INTO USERS (email, password,role) VALUES (?, ?, ?)`, [
        email,
        hashedPwd,
        1234,
      ]);
      res.json({ message: "Użytkownik zarejestrowany pomyślnie" });
    }
  });

  db.close();
});

router.get("/login", (req: Request, res: Response) => {
  let email = req.query.email as string;
  let password = req.query.password as string;

  email = decodeURI(email);
  password = decodeURI(password);

  const db = connect();

  db.get(
    `SELECT user_id,email, password,role FROM users WHERE email = ?`,
    [email],
    async (
      err: Error,
      user: { user_id: number; email: string; password: string; role: number }
    ) => {
      if (err) {
        console.error("Error fetching user from the database:", err);
        res.status(500).send("Internal Server Error");
        db.close();
        return;
      }

      if (user) {
        const foundPwd = user.password;

        try {
          const match = await bcrypt.compare(password, foundPwd);
          if (match) {
            const accessToken = jwt.sign(
              {
                userInfo: {
                  id: user.user_id,
                  email: user.email,
                  role: user.role,
                },
              },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "15m" }
            );
            const refreshToken = jwt.sign(
              { email: user.email },
              process.env.REFRESH_TOKEN_SECRET,
              { expiresIn: "1d" }
            );
            db.run(
              `UPDATE users SET token = ? WHERE user_id = ?`,
              [refreshToken, user.user_id],
              (updateErr) => {
                if (updateErr) {
                  console.error(
                    "Error updating token in the database:",
                    updateErr
                  );
                  res.status(500).send("Internal Server Error");
                  return;
                }

                res.cookie("jwt", refreshToken, {
                  httpOnly: true,
                  secure: true,
                  maxAge: 24 * 60 * 60 * 1000,
                });
                res.json({
                  accessToken,
                  id: user.user_id,
                  role: user.role,
                });
              }
            );
          } else {
            res.status(401).json({ message: "Błędne dane logowania" });
          }
        } catch (error) {
          console.error("Error comparing passwords:", error);
          res.status(500).send("Internal Server Error");
        }
      } else {
        res.status(404).json({ message: "Nie istnieje taki użytkownik" });
      }

      db.close();
    }
  );
});

router.get("/refresh", (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    res.sendStatus(401);
    return;
  }
  console.log(cookies.jwt);

  const refreshToken = cookies.jwt;

  const db = connect();

  db.get(
    `SELECT user_id, email, password, role FROM users WHERE token = ?`,
    [refreshToken],
    async (
      err: Error,
      user: { user_id: number; email: string; password: string; role: number }
    ) => {
      if (err) {
        console.error("Error fetching user from the database:", err);
        res.status(500).send("Internal Server Error");
        db.close();
        return;
      }

      if (!user) {
        res.status(403).json({ message: "Nie istnieje taki użytkownik" });
        return;
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err: Error, decoded: { email: string }) => {
          if (err || user.email !== decoded.email) {
            res.sendStatus(403);
            return;
          }
          const accessToken = jwt.sign(
            { userInfo: { email: decoded.email, role: user.role } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
          );
          res.json({ accessToken });
        }
      );

      db.close();
    }
  );
});

router.get("/logout", (req: Request, res: Response) => {
  // w react usunąć access token
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    res.sendStatus(401);
    return;
  }

  const refreshToken = cookies.jwt;

  const db = connect();

  db.get(
    `SELECT user_id,email, password FROM users WHERE token = ?`,
    [refreshToken],
    async (
      err: Error,
      user: { user_id: number; email: string; password: string }
    ) => {
      if (err) {
        console.error("Error fetching user from the database:", err);
        res.status(500).send("Internal Server Error");
        db.close();
        return;
      }

      if (!user) {
        res.clearCookie("jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.sendStatus(204);
        return;
      }

      db.run(
        `UPDATE users SET token = ? WHERE user_id = ?`,
        ["", user.user_id],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating token in the database:", updateErr);
            res.status(500).send("Internal Server Error");
            return;
          }
        }
      );

      db.close();
    }
  );
  res.clearCookie("jwt", {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.sendStatus(204);
});

module.exports = router;

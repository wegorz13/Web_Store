import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }
  console.log(authHeader);

  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err: Error, decoded: { userInfo: { email: string; role: number } }) => {
      if (err) {
        return res.sendStatus(403);
      }
      // req.user = decoded.userInfo.email;
      // req.role = decoded.userInfo.role;
      next();
    }
  );
};

module.exports = verifyJWT;

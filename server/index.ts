import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use("/products", require("./routes/products"));
app.use("/orders", require("./routes/orders"));
app.use("/users", require("./routes/users"));
app.use("/opinions", require("./routes/opinions"));

app.listen(port, () => {
  console.log(`Server is Fire at https://localhost:${port}`);
});

import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import { connectDb } from "./config/connectDb.js";
const app = express();
app.use(express.json());
app.use(cors());
connectDb();
app.use("/api/v1/user", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/order", orderRouter);

app.listen(3000, () => console.log(`Server running on port 3000`));

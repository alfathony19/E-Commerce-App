import express from "express";
import ordersApi from "./api/orders";

const app = express();
app.use(express.json());
app.use("/api/orders", ordersApi);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

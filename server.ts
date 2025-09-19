import express from "express";
import path from "path";
import ordersApi from "./src/api/orders";

const app = express();
app.use(express.json());

// API routes
app.use("/api/orders", ordersApi);

// Serve React build
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

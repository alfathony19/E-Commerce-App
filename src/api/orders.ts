import { db } from "../libs/firebaseAdmin";
import express from "express";

const router = express.Router();

// GET semua order
router.get("/", async (_req, res) => {
  const snapshot = await db.collection("orders").get();
  res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});

// POST bikin order baru
router.post("/", async (req, res) => {
  const { customerName, total } = req.body;
  const newDoc = await db
    .collection("orders")
    .add({ customerName, total, createdAt: new Date() });
  res.status(201).json({ id: newDoc.id, customerName, total });
});

export default router;

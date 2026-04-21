import "dotenv/config";
import express from "express";
import cors from "cors";

import { db, users } from "@repo/db";

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Server is running");
});


app.post("/users", async (req, res) => {
  try {
    const { name } = req.body;

    const result = await db
      .insert(users)
      .values({ name })
      .returning();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


app.get("/users", async (req, res) => {
  try {
    const result = await db.select().from(users);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-63cf4c5a/health", (c) => {
  return c.json({ status: "ok" });
});

// --- Transactions API ---

app.get("/make-server-63cf4c5a/transactions", async (c) => {
  try {
    const transactions = await kv.getByPrefix("transaction:");
    // Return raw data, let client handle sorting
    return c.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return c.json({ error: "Failed to fetch transactions" }, 500);
  }
});

app.post("/make-server-63cf4c5a/transactions", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const transaction = { ...body, id };
    
    // Store in KV
    await kv.set(`transaction:${id}`, transaction);
    
    return c.json(transaction, 201);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return c.json({ error: "Failed to create transaction" }, 500);
  }
});

app.delete("/make-server-63cf4c5a/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`transaction:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return c.json({ error: "Failed to delete transaction" }, 500);
  }
});

Deno.serve(app.fetch);
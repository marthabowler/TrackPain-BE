import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

const herokuSSLSetting = { rejectUnauthorized: false };
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting;
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/pain", async (req, res) => {
  try {
    const dbres = await client.query(
      "SELECT * FROM pain p JOIN users u ON p.user_id = u.user_id JOIN painkillers p1 ON p.painkiller_id=p1.painkiller_id JOIN conditions c ON c.condition_id= p.condition_id order by time asc"
    );
    res.status(200).json({ status: "success", data: dbres.rows });
  } catch (err) {
    res.status(404).json({ status: "failed", error: err });
  }
});

// POST the pain into the db
app.post("/pain", async (req, res) => {
  const { seriousness, description, condition_id, painkiller_id } = req.body;

  try {
    const dbres = await client.query(
      `insert into pain (seriousness, description, condition_id, painkiller_id) values($1, $2, $3, $4) returning *`,
      [seriousness, description, condition_id, painkiller_id]
    );
    res.status(201).json({
      status: "success",
      data: dbres.rows[0],
    });
  } catch (err) {
    res.status(400).json({ status: "failed", error: err });
  }
});

app.post("/painkiller", async (req, res) => {
  const { painkiller_name } = req.body;
  try {
    const dbres = await client.query(
      `insert into painkillers (painkiller_name) values($1) returning *`,
      [painkiller_name]
    );
    res.status(201).json({
      status: "success",
      data: dbres.rows[0],
    });
  } catch (err) {
    res.status(400).json({ status: "failed", error: err });
  }
});

app.post("/conditions", async (req, res) => {
  const { condition_name } = req.body;
  try {
    const dbres = await client.query(
      `insert into conditions (condition_name) values($1) returning *`,
      [condition_name]
    );
    res.status(201).json({
      status: "success",
      data: dbres.rows[0],
    });
  } catch (err) {
    res.status(400).json({ status: "failed", error: err });
  }
});

let port = process.env.PORT;
if (!port) {
  port = "4000";
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});

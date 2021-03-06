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
      "SELECT * FROM pain p JOIN users u ON p.user_id = u.user_id JOIN conditions c ON c.condition_id= p.condition_id order by time asc"
    );
    res.status(200).json({ status: "success", data: dbres.rows });
  } catch (err) {
    res.status(404).json({ status: "failed", error: err });
  }
});

app.get("/pain/:condition_id", async (req, res) => {
  try {
    const dbres = await client.query(
      "SELECT * FROM pain p JOIN users u ON p.user_id = u.user_id JOIN conditions c ON c.condition_id= p.condition_id where p.condition_id = $1 order by time asc",
      [req.params.condition_id]
    );
    res.status(200).json({ status: "success", data: dbres.rows });
  } catch (err) {
    res.status(404).json({ status: "failed", error: err });
  }
});

app.get("/users", async (req, res) => {
  try {
    const dbres = await client.query("SELECT * FROM users");
    res.status(200).json({ status: "success", data: dbres.rows });
  } catch (err) {
    res.status(404).json({ status: "failed", error: err });
  }
});

app.get("/correlations/hasworked", async (req, res) => {
  try {
    const dbres = await client.query(
      "select count (has_worked) as has_worked, painkiller_name, condition_name from painkillers_taken pt JOIN painkillers p on p.painkiller_id=pt.painkiller_id JOIN conditions c on c.condition_id=pt.condition_id where has_worked=true group by (condition_name, painkiller_name)"
    );
    res.status(200).json({ status: "success", data: dbres.rows });
  } catch (err) {
    res.status(404).json({ status: "failed", error: err });
  }
});

app.get("/correlations/notworked", async (req, res) => {
  try {
    const dbres = await client.query(
      "select count (has_worked) as not_worked, painkiller_name, condition_name from painkillers_taken pt JOIN painkillers p on p.painkiller_id=pt.painkiller_id JOIN conditions c on c.condition_id=pt.condition_id where has_worked=false group by (condition_name, painkiller_name)"
    );
    res.status(200).json({ status: "success", data: dbres.rows });
  } catch (err) {
    res.status(404).json({ status: "failed", error: err });
  }
});

app.get("/painkillers", async (req, res) => {
  try {
    const dbres = await client.query("SELECT * FROM painkillers");
    res.status(200).json({ status: "success", data: dbres.rows });
  } catch (err) {
    res.status(404).json({ status: "failed", error: err });
  }
});

app.get("/user/:user_id", async (req, res) => {
  try {
    const dbres = await client.query(
      "SELECT p.condition_id FROM pain p JOIN users u ON p.user_id = u.user_id JOIN conditions c ON c.condition_id= p.condition_id where p.user_id=$1",
      [req.params.user_id]
    );
    res.status(200).json({ status: "success", data: dbres.rows });
  } catch (err) {
    res.status(404).json({ status: "failed", error: err });
  }
});

app.get("/conditions", async (req, res) => {
  try {
    const dbres = await client.query("SELECT * FROM conditions");
    res.status(200).json({ status: "success", data: dbres.rows });
  } catch (err) {
    res.status(404).json({ status: "failed", error: err });
  }
});
// POST the pain into the db
app.post("/pain", async (req, res) => {
  const { seriousness, condition_id } = req.body;

  try {
    const dbres = await client.query(
      `insert into pain (seriousness, condition_id) values($1, $2) returning *`,
      [seriousness, condition_id]
    );
    res.status(201).json({
      status: "success",
      data: dbres.rows[0],
    });
  } catch (err) {
    res.status(400).json({ status: "failed", error: err });
  }
});

app.post("/painkillertaken", async (req, res) => {
  const { painkiller_id, condition_id, user_id, has_worked } = req.body;

  try {
    const dbres = await client.query(
      `insert into painkillers_taken (painkiller_id, condition_id, user_id, has_worked) values($1, $2, $3, $4) returning *`,
      [painkiller_id, condition_id, user_id, has_worked]
    );
    res.status(201).json({
      status: "success",
      data: dbres.rows[0],
    });
  } catch (err) {
    res.status(400).json({ status: "failed", error: err });
  }
});

app.post("/user", async (req, res) => {
  const { username } = req.body;

  try {
    const dbres = await client.query(
      `insert into users (username) values($1) returning *`,
      [username]
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
  console.log("posting painkiller:", painkiller_name);
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

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

// API info page
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

let port = process.env.PORT;
if (!port) {
  port = "4000";
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});

require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const dns = require("dns").promises;
const express = require("express");
const { URL } = require("url");
const { Sequelize, Model, DataTypes } = require("sequelize");

const app = express();
const sequelize = new Sequelize({ dialect: "sqlite", storage: "./db.sqlite" });
const port = process.env.PORT || 3000;

class UrlShortener extends Model {}
UrlShortener.init(
  {
    url: DataTypes.STRING,
  },
  { sequelize, modelName: "url_shorteners" }
);
sequelize.sync();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", async function (req, res) {
  if (req.body.url === null || req.body.url === "") {
    return res.json({ error: "invalid url" });
  }

  let hostname = "";
  try {
    hostname = new URL(req.body.url).hostname;
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  try {
    await dns.lookup(hostname);
  } catch (err) {
    return res.json({ error: "invalid hostname" });
  }

  const urlShortener = await UrlShortener.create({ url: req.body.url });
  res.json({ original_url: req.body.url, short_url: urlShortener.id });
});

app.get("/api/shorturl/:shorturl", async function (req, res) {
  const urlShortener = await UrlShortener.findByPk(req.params.shorturl);
  if (!urlShortener) {
    return res.json({ error: "No short url found for the given input" });
  }

  res.redirect(urlShortener.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

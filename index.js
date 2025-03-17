require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const dns = require("dns");
const express = require("express");
const { URL } = require("url");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", function (req, res) {
  let url = "";
  try {
    url = new URL(req.body.url.trim());
  } catch (error) {
    return res.json({ error: "Invalid URL" });
  }

  dns.lookup(url.hostname, (error, address, family) => {
    console.log(error, address, family);
    if (error) {
      res.json({ error: "Invalid Hostname" });
    }
  });

  res.json({ greeting: req.body.url });
});

app.get("/api/shorturl/:shorturl");

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

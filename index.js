const express = require("express");
const Count = require("./models/visit-count");

const app = express();

app.get("/", async (req, res) => {
  const count = await Count.next();

  res.send(`Hello World, this web site has visited ${count} times`);
});

app.listen(8080, () => console.log(">> listening port 8080"));

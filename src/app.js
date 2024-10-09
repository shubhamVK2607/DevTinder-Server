const express = require("express");

const app = express();

app.use("/test", (req, res) => {
  res.send("Hello from route and this route");
});

app.listen(7777, () => {
  console.log("Server is successfully started on port 7777");
});

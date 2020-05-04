const express = require("express");
const app = express();

app.get("/", function (req, res, next) {
  try {
    res.send("HelloWorld");
  } catch (error) {
    next(error)
  }
});

app.get("/search/recipes", async (req, res, next) => {
  try {

  } catch (error) {
    next(error)
  }
})

module.exports = {
  path: "/api/",
  handler: app
};

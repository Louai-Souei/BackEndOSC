const http = require("http");
const app = require("./index");
const express = require("express");
const path = require("path");

const port = process.env.PORT || 5000;
app.set("port", port);
const server = http.createServer(app);

server.listen(port, () => {
  console.log("listening on " + port);
});

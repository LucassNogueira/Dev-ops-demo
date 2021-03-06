require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const Rollbar = require("rollbar");

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

rollbar.log("Testing");
const students = ["jimmy", "sam", "ben", "peter"];

app.get("/", (req, res) => {
  console.log("hit");
  rollbar.log("Someone hit the server!");
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/api/students", (req, res) => {
  rollbar.info("Someone got all the students!");
  res.status(200).send(students);
});

app.post("/api/students", (req, res) => {
  const { name } = req.body;
  students.unshift(name);
  res.status(200).send(students);
});

app.get("/api/students/:idx", (req, res) => {
  const idx = +req.params.idx;
  if (idx < 0 || idx >= students.length) {
    if (idx < 0) {
      rollbar.error("Someone tried to input a index less than 0");
    } else {
      rollbar.error(
        "Someone tried to input a index greater than the number of students"
      );
    }
    return res.sendStatus(400);
  }
  res.status(200).send(students[idx]);
});

app.get("/test", (req, res) => {
  console.log("hit");
  try {
    doSomething();
  } catch (e) {
    rollbar.error("Something went wrong", e);
    res.sendStatus(404);
    return;
  }
  res.status(404).send(res);
});

app.delete("/api/students/:idx", (req, res) => {
  if (req.params.idx === "0") {
    1;
    rollbar.error("Someone tried to delete the first student!");
    return res.status(403).send(students);
  }
  rollbar.info(`Someone deleted  ${students[+req.params.idx]}`);
  students.splice(+req.params.idx, 1);
  res.status(200).send(students);
});

const port = process.env.PORT || process.env.SERVER_PORT;

app.listen(port, () => console.log("Server is on " + port));

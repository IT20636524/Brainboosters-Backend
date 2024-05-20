const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

dotenv.config();
app.use(express.json());

const parentRouter = require("./routes/parents");
app.use("/api", parentRouter);

const childRouter = require("./routes/children");
app.use("/api", childRouter);

const focusRouter = require('./routes/focus');
app.use("/api", focusRouter);

const quizRouter = require("./routes/quiz");
app.use("/api", quizRouter);

const taskRouter = require("./routes/tasks");
app.use("/api", taskRouter);

const poseRouter = require('./routes/poses');
app.use("/api", poseRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Brainboosters API!");
});

const PORT = process.env.PORT||5000;

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});

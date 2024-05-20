const router = require("express").Router();
const {
  createTask,
  getAllTasks,
  getOneTask,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

router.route("/task").post(createTask);
router.route("/task").get(getAllTasks);
router.route("/task/:taskId").get(getOneTask).put(updateTask).delete(deleteTask);

module.exports = router;

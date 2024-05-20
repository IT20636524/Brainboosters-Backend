const router = require("express").Router();
const {
  createQuiz,
  getAllQuizzes,
  getOneQuiz,
  updateQuiz,
  deleteQuiz
} = require("../controllers/quizController");

router.route("/quiz").post(createQuiz);
router.route("/quiz").get(getAllQuizzes);
router.route("/quiz/:quizId").get(getOneQuiz).put(updateQuiz).delete(deleteQuiz);

module.exports = router;

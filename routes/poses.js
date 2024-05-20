const router = require("express").Router();
const {
  createPose,
  getAllPoses,
  getOnePose,
  updatePose,
  deletePose
} = require("../controllers/poseController");

router.route("/pose").post(createPose);
router.route("/pose").get(getAllPoses);
router.route("/pose/:poseId").get(getOnePose).put(updatePose).delete(deletePose);

module.exports = router;

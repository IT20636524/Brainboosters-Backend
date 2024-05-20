const router = require("express").Router();
const {
  createChild,
  getAllChildren,
  getOneChild,
  updateChild,
  deleteChild
} = require("../controllers/childController");

router.route("/child/:parentId").post(createChild);
router.route("/child").get(getAllChildren);
router.route("/child/:childId").get(getOneChild).put(updateChild).delete(deleteChild);

module.exports = router;

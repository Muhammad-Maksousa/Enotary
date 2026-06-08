const router = require("express").Router();
const controller = require("../controllers/auth");
const { verifyUserToken, verifyAdminToken } = require("../middleware/auth");
const apiHandler = require("../helpers/wrappers/api-handler");


router.post("/login", apiHandler(controller.login));
router.post("/register", apiHandler(controller.register));
router.post("/getMessage", apiHandler(controller.getMessage));
module.exports = router;

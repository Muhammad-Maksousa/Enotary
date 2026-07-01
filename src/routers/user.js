const router = require("express").Router();
const controller = require("../controllers/user");
const { verifyUserToken } = require("../middleware/auth");
const apiHandler = require("../helpers/wrappers/api-handler");

router.post("/wallet", apiHandler(verifyUserToken), apiHandler(controller.getMyWalletId));
router.get("/profile", apiHandler(verifyUserToken), apiHandler(controller.profile));

module.exports = router;

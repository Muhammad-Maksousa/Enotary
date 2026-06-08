const router = require("express").Router();
const controller = require("../controllers/transactio");
const { verifyUserToken } = require("../middleware/auth");
const apiHandler = require("../helpers/wrappers/api-handler");


router.post("/", apiHandler(verifyUserToken), apiHandler(controller.create));
router.get("/:id", apiHandler(controller.getById));
router.get("/", apiHandler(verifyUserToken), apiHandler(controller.getTransactionsByStatus));
router.get("/created", apiHandler(verifyUserToken), apiHandler(controller.getTransactionsUserCreated));
router.put("/:id", apiHandler(controller.update));
router.delete("/:id", apiHandler(controller.cancel));

module.exports = router;

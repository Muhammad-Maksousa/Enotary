const router = require("express").Router();
const controller = require("../controllers/transactio");
const { verifyUserToken, verifyNotaryToken } = require("../middleware/auth");
const apiHandler = require("../helpers/wrappers/api-handler");


router.post("/", apiHandler(verifyUserToken), apiHandler(controller.create));
router.post("/claim", apiHandler(verifyNotaryToken), apiHandler(controller.claim));
router.post("/notaryAction", apiHandler(verifyNotaryToken), apiHandler(controller.notaryAction));
router.post("/getFinal", apiHandler(verifyUserToken), apiHandler(controller.getFinal));
router.post("/signed",apiHandler(verifyUserToken),apiHandler(controller.signedTransaction));
router.get("/created", apiHandler(verifyUserToken), apiHandler(controller.getTransactionsUserCreated));
router.get("/notaryArchive", apiHandler(verifyNotaryToken), apiHandler(controller.getNotaryTransactions));
router.get("/allMine", apiHandler(verifyUserToken), apiHandler(controller.getMyAllTransactions));
router.get("/allByNid/:NID", apiHandler(verifyUserToken), apiHandler(controller.getAlltransactionsByNID));
router.get("/allByWalletAddress/:walletAddress", apiHandler(verifyUserToken), apiHandler(controller.getAlltransactionsBywalletAddress));
router.get("/stats/:status", apiHandler(verifyUserToken), apiHandler(controller.getTransactionStatsByStatus));
router.get("/templates", apiHandler(controller.getTemplates));
router.get("/template/:id", apiHandler(controller.getTemplateById));
router.get("/:id", apiHandler(controller.getById));
router.get("/", apiHandler(verifyUserToken), apiHandler(controller.getTransactionsByStatus));
router.put("/:id", apiHandler(controller.update));
router.delete("/:id", apiHandler(controller.cancel));

module.exports = router;

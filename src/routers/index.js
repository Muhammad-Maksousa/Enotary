const router = require("express").Router();

router.use("/user", require("./user"));
router.use("/auth", require("./auth"));
router.use("/transaction",require("./transaction"));



//should be in the end of all routers
//match every request that reached this point.
router.use((req, res) => {
    res.status(404).json({ message: 'The Page Not Found', httpStatusCode: 404 })
});
module.exports = router;

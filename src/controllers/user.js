const UserService = require("../services/user");
const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors");
const { ResponseSenderWithToken, updateResponseSender, responseSender } = require("../helpers/wrappers/response-sender");

module.exports = {
    getMyWalletId: async (req, res) => {
        const { message, signature } = req.body;
        console.log(message);
        console.log(signature);
        
        const result = await new UserService().getMyWalletId(message, signature, req.user.userId);

        responseSender(res, result);
    }

};

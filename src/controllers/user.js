const UserService = require("../services/user");
const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors");
const { ResponseSenderWithToken, updateResponseSender, responseSender } = require("../helpers/wrappers/response-sender");

module.exports = {
    getMyWalletId: async (req, res) => {
        const { message, signature } = req.body;
        const result = await new UserService().getMyWalletId(message, signature, req.user.userId);

        responseSender(res, result);
    },

    profile: async (req,res) =>{
        const result = await new UserService().getProfile(req.user.userId);
        responseSender(res,result);
    }

};

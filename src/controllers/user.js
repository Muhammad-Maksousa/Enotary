/*const UserService = require("../services/user");
const walletService = require("../services/wallet");
const Role = require("../helpers/roles");
const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors");
const { ResponseSenderWithToken, updateResponseSender, responseSender } = require("../helpers/wrappers/response-sender");

module.exports = {
    add: async (req, res) => {
        const { body } = req;
        const result = await new UserService({ ...body }).add();
        if (result.role == Role.user) {
            body.userId = result.id;
            await new walletService({ ...body }).add();
        }
        if (result.role == Role.admin) {
            body.adminId = result.id;
            await new StorageAdminService({ ...body }).add();
        }
        responseSender(res, result);
    },
    update: async (req, res) => {
        const id = req.userId;
        const { body } = req;
        const user = await new UserService({ ...body }).update(id);
        updateResponseSender(res, 'user');
    },
    login: async (req, res) => {
        const { body } = req;
        const result = await new UserService({ ...body }).login();
        ResponseSenderWithToken(res, result.user, result.token);
    },
    getById: async (req, res) => {
        const id = req.userId;
        const result = await new UserService({}).getById(id);
        responseSender(res, result);
    },
    chargeWallet: async (req, res) => {
        const { body } = req;
        body.userId = req.userId;
        const result = await new walletService({ ...body }).charge();
        responseSender(res, result);
    },
    getUserWallet:async (req,res)=>{
        const {body} = req;
        body.userId = req.userId;
        const result = await new walletService({...body}).getWallet();
        responseSender(res,result);
    }

};
*/
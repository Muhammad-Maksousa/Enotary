const TransactionService = require("../services/transaction");
const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors.json");
const { TransactionStatus } = require('@prisma/client');
const { ResponseSenderWithToken, responseSender } = require("../helpers/wrappers/response-sender");
const { TEMPLATES } = require("../helpers/templates");
class TransactionController {

    async create(req, res) {

        const { templateId, body, signers } = req.body;

        if (!templateId || !body || !Array.isArray(signers)) {
            throw new CustomError(errors.Missing_Value_Field);
        }

        if (signers.length === 0) {
            throw new CustomError(errors.Invalid_Signers);
        }
        const result = await new TransactionService().create({
            creatorId: req.user.userId,
            templateId,
            body,
            signers
        });

        responseSender(res, result);
    }
    async claim(req, res) {
        const { body } = req;
        const result = await new TransactionService().claim(body.transactionId, req.user.userId);
        responseSender(res, result);
    }

    async getById(req, res) {

        const transactioId = req.params.id;
        const result = await new TransactionService().getById(transactioId);

        responseSender(res, result);
    }

    async getTransactionsByStatus(req, res) {

        const { status } = req.query;

        if (status && !Object.values(TransactionStatus).includes(status)) {
            return res.status(400).json({
                message: 'Invalid transaction status',
            });
        }

        const result = await new TransactionService().getTransactionsByStatus(req.user.userId, status);

        responseSender(res, result);
    }
    async update(req, res) {

        const result =
            await new TransactionService().update(
                req.params.id,
                req.user.userId,
                req.body
            );

        responseSender(res, result);
    }

    async cancel(req, res) {

        const result =
            await new TransactionService().cancel(
                req.params.id,
                req.user.userId
            );

        responseSender(res, result);
    }

    async getTransactionsUserCreated(req, res) {
        const { status } = req.query;

        const transactions = await new TransactionService().getCreatedTransactions(req.user.userId, status);
        responseSender(res, transactions);
    }

    async getNotaryTransactions(req, res) {

        const transactions = await new TransactionService().getNotaryTransactions(req.user.userId);
        responseSender(res, transactions);
    }

    async notaryAction(req, res) {
        const { transactionId, action } = req.body;

        if (action != "ACCEPT" && action != "REJECT")
            throw new CustomError(errors.Validation_Error);

        const result = await new TransactionService().notaryAction(transactionId, action, req.user.userId);
        responseSender(res, result);
    }

    async getTemplates(req, res) {
        const templates = [{
            "templateId": "PROPERTY_SALE_V1",
            "name": "Property Sale"
        }, {
            "templateId": "VEHICLE_TRANSFER_V1",
            "name": "Vehicle Sale"
        }, {
            "templateId": "GENERAL_POWER_OF_ATTORNEY_V1",
            "name": "General Power"
        }]
        responseSender(res, templates);
    }

    async getTemplateById(req, res) {
        const { id } = req.params;
        let template;

        if (id == "PROPERTY_SALE_V1")
            template = TEMPLATES.PROPERTY_SALE_V1;
        else if (id == "GENERAL_POWER_OF_ATTORNEY_V1")
            template = TEMPLATES.GENERAL_POWER_OF_ATTORNEY_V1;
        else if (id == "VEHICLE_TRANSFER_V1")
            template = TEMPLATES.VEHICLE_TRANSFER_V1;

        responseSender(res, template);
    }

    async getMyAllTransactions(req, res) {
        const result = await new TransactionService().getMyAllTransactions(req.user.userId);
        responseSender(res, result);
    }
}

module.exports = new TransactionController();
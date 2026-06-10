const TransactionService = require("../services/transaction");
const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors.json");
const { TransactionStatus } = require('@prisma/client');
const { ResponseSenderWithToken, responseSender } = require("../helpers/wrappers/response-sender");

class TransactionController {

    async create(req, res) {

        const { templateId, body, signers } = req.body;

        if (!templateId || !body || !Array.isArray(signers)) {
            throw new CustomError(errors.Missing_Value_Field);
        }

        if (signers.length === 0) {
            throw new CustomError(errors.Invalid_Signers);
        }
        //get this userId from the token
        const result = await new TransactionService().create({
            creatorId: req.user.userId,
            templateId,
            body,
            signers
        });

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
}

module.exports = new TransactionController();
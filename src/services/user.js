const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors.json");
const prisma = require("../../prisma/client");
const AuthService = require("./auth");

class UserService {

    async getMyWalletId(message, signature, userId) {
        
        const address = await new AuthService().validateSignature({message, signature});

        const wallet = await prisma.wallet.findFirst({
            where: {
                userId,
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                address: true,
            },
        });

        if (!wallet) {
            throw new Error("No active wallet found");
        }

        return wallet;
    }


}

module.exports = UserService;
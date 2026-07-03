const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors.json");
const prisma = require("../../prisma/client");
const AuthService = require("./auth");
const Roles = require("../helpers/roles");

class UserService {

    async getMyWalletId(message, signature, userId) {

        const address = await new AuthService().validateSignature({ message, signature });

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

    async getProfile(userId) {
        const wallet = await prisma.wallet.findFirst({
            where: {
                userId,
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                address: true,
            },
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                fullName: true,
                isActive: true
            }
        });
        return { user, wallet }
    }

    async makeNotary(address){
        const wallet = await prisma.wallet.findFirst({
            where: {
                address,
                isActive: true
            },
            select: {
                id: true,
                userId: true
            }
        });


        return prisma.user.update({
            where: { id: wallet.userId },
            data: {
                role:Roles.NOTARY
            }
        });
        return true;
    }
}

module.exports = UserService;
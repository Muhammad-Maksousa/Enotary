let jwt = require('jsonwebtoken');
const secretKey = require("../helpers/db/config.secret");
const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors.json");
const Role = require("../helpers/roles");
const prisma = require('../../prisma/client');

const verifyUserToken = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new CustomError(
            errors.No_Token_Provided
        );
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.userId
        },
        include: {
            wallets: {
                where: {
                    isActive: true
                }
            }
        }
    });

    if (!user || !user.isActive) {
        throw new CustomError(
            errors.Not_Authorized
        );
    }

    req.user = {
        userId: user.id,
        role: user.role,
        wallets: user.wallets
    };

    next();
};
module.exports = {
    verifyUserToken: verifyUserToken,
};


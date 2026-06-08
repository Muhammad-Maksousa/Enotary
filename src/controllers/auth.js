const AuthService = require("../services/auth");
const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors.json");

const { ResponseSenderWithToken, responseSender } = require("../helpers/wrappers/response-sender");

class AuthController {

    // Generate SIWE message
    async getMessage(req, res) {

        const { walletAddress } = req.body;

        if (!walletAddress) {
            throw new CustomError(errors.Missing_Value_Field);
        }

        const result = await new AuthService({}).generateSiweMessage(walletAddress);

        responseSender(res, result);
    }


    // Register
    async register(req, res) {

        const { nationalId, message, signature } = req.body;

        if (!nationalId || !message || !signature) {
            throw new CustomError(errors.Missing_Value_Field);
        }

        const result = await new AuthService({}).register({ nationalId, message, signature });

        ResponseSenderWithToken(
            res,
            "Registration successful",
            result.token
        );
    }


    // Login
    async login(req, res) {

        const { message, signature } = req.body;

        if (!message || !signature) {
            throw new CustomError(errors.Missing_Value_Field);
        }

        const result =
            await new AuthService()
                .login({ message, signature });

        ResponseSenderWithToken(
            res,
            "Login successful",
            result.token
        );
    }
}

module.exports = new AuthController();
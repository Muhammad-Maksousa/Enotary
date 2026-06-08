const { Prisma } = require("@prisma/client");

class CustomError extends Error {
    constructor({ message, httpStatusCode }) {
        super(message);

        this.name = "CustomError";
        this.httpStatusCode =
            httpStatusCode || 400;
    }

    static defaultHandler(err, req, res, next) {

        console.log(
            err instanceof CustomError
        );

        if (err instanceof CustomError) {
            return res.status(
                err.httpStatusCode
            ).json({
                message: err.message,
                statusCode:
                    err.httpStatusCode,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
            statusCode: 500,
        });
    }
}

module.exports = CustomError;
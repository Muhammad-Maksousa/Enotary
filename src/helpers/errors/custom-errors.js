const { Prisma } = require("@prisma/client");
const { ResponseSenderWithToken, responseSender } = require("../wrappers/response-sender");
class CustomError {
    constructor({ message, httpStatusCode }) {
        //super(message);

        this.name = "CustomError";
        this.httpStatusCode =
            httpStatusCode || 400;
    }

    static defaultHandler(err, req, res, next) {
        console.log('err instanceof CustomError');
        console.log(err instanceof CustomError);
        console.log("Error had Happened", err);

        if (err instanceof CustomError) {
            let message = {
                "message": err.message,
                "statusCode": err.httpStatusCode
            };
            res.status(err.httpStatusCode).send(message)
        } else {
            res.status(500).send({'message':err.message,stackTrace:err.stack});
        }
    }
}

module.exports = CustomError;
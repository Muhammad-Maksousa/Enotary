const responseSender = (res, result, status, code) => {
    return res.status(code || 200).json({
        status: status || "Success",
        data: result,
    });
};
const ResponseSenderWithToken = (res, result, token, status, code) => {
    return res.status(code || 200).json({
        status: status || "Success",
        data: result,
        token: token
    });
};
const updateResponseSender = (res, result, status, code) => {
    return res.status(code || 200).json({
        status: status || "Success",
        data: `the ${result} was updated successfully`
    });
};

module.exports = {
    responseSender: responseSender,
    ResponseSenderWithToken: ResponseSenderWithToken,
    updateResponseSender: updateResponseSender,
};


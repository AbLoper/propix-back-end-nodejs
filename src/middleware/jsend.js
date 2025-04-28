const jsend = {
    success: (data) => ({ status: 'success', data }),
    fail: (data) => ({ status: 'fail', data }),
    error: (message) => ({ status: 'error', message }),
};

module.exports = (req, res, next) => {
    res.success = (data) => res.status(200).json(jsend.success(data));
    res.fail = (data, code = 400) => res.status(code).json(jsend.fail(data));
    res.error = (message, code = 400) => res.status(code).json(jsend.error(message));
    next();
};

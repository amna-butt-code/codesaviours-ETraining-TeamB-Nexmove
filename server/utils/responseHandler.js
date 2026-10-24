const responseHandler = (res, statusCode, message, data = null) => {
  const response = {
    status: statusCode,
    message,
  };
  if (data) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

module.exports = responseHandler;

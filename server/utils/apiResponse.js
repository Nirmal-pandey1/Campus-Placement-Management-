const successResponse = (res, statusCode = 200, message = "Success", data = {}) =>
  res.status(statusCode).json({ success: true, message, data });

const errorResponse = (res, statusCode = 500, message = "Server Error") =>
  res.status(statusCode).json({ success: false, message });

module.exports = { successResponse, errorResponse };
export class ServerError extends Error {
  constructor(message, status, statusCode) {
    super(message);
    this.message = message;
    this.status = status;
    this.statusCode = statusCode;
    this.handled = true;
  }
}

export class NotFoundUserError extends ServerError {
  constructor(userId) {
    super(`User ${userId} not found`, "NOT_FOUND", 404);
  }
}

export class UnhandledError extends ServerError {
  constructor() {
    super("Internal server error", "SERVER_ERROR", 500);
  }
}

export class UnauthorizedError extends ServerError {
  constructor() {
    super("Unauthorized", "UNAUTHORIZED", 401);
  }
}

export class WrongCredentialError extends ServerError {
  constructor() {
    super("Wrong credentials", "UNAUTHORIZED", 401);
  }
}

export const errorHandler = (error, req, res, next) => {
  if (!error.handled) {
    error = new UnhandledError();
  }
  return res.status(error.statusCode).json({
    status: error.status,
    statusCode: error.statusCode,
    message: error.message,
  });
};

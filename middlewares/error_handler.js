export class ServerError extends Error {
  constructor(message, status) {
    super(message);
    this.message = message;
    this.status = status;
    this.handled = true;
  }
}

export class NotFoundUserError extends ServerError {
  constructor(userId) {
    super(`User ${userId} not found`, 404);
  }
}

export class UnhandledError extends ServerError {
  constructor() {
    super("UNHANDLED", 500);
  }
}

export class UnauthorizedError extends ServerError {
  constructor() {
    super("UNAUTHORIZED", 401);
  }
}

export class WrongCredentialError extends ServerError {
  constructor() {
    super("WRONG_CREDENTIAL", 401);
  }
}

export const errorHandler = (error, req, res, next) => {
  if (error.handled === false) {
    error = new UnhandledError();
  }
  return res.status(error.status).json({ message: error.message });
};

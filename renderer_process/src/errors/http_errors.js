import { ExtendableBuiltinGen } from '../utils/classes';

const ExtendableErrors = ExtendableBuiltinGen(Error);

export class HTTPError extends ExtendableErrors {
  constructor(status, errors, message) {
    super();
    this.message = message || 'HTTP Error';
    this.status = parseInt(status, 10) || 500;
    this.name = this.constructor.name;
    if (ExtendableErrors.captureStackTrace) {
      ExtendableErrors.captureStackTrace(this, this.constructor.name);
    } else {
      this.stack = (new ExtendableErrors()).stack;
    }

    const errs = errors || {};
    this.errors = errs;
  }
}

export class BadRequestError extends HTTPError {
  constructor(errors, message = 'Bad Request') {
    super(400, errors, message);
  }
}

export class UnhandledHTTPCodeError extends HTTPError {
  constructor(errors, message = 'Unhandled HTTP Code') {
    super(-1, errors, message);
  }
}

export class NetworkError extends ExtendableErrors {
  constructor(errors, message = 'Network Error') {
    super();
    this.message = message;
    this.name = this.constructor.name;

    if (ExtendableErrors.captureStackTrace) {
      ExtendableErrors.captureStackTrace(this, this.constructor.name);
    } else {
      this.stack = (new ExtendableErrors()).stack;
    }

    const errs = errors || {};
    this.errors = errs;
  }
}

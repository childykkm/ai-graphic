export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string) {
    super(message, undefined, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class PermissionError extends ApiError {
  constructor(message: string) {
    super(message, 403, 'PERMISSION_ERROR');
    this.name = 'PermissionError';
  }
}

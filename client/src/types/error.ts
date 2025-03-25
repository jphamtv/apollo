// Types for API errors and validation errors

// Express validator error structure
export interface ValidationErrorItem {
  value: string;
  msg: string;
  param: string;
  location: string;
}

// API response structure for validation errors
export interface ValidationErrorResponse {
  errors: ValidationErrorItem[];
  message?: string;
}

// API response structure for general errors
export interface ErrorResponse {
  message: string;
  [key: string]: unknown;
}

// Extended Error class for API errors
export class ApiError extends Error {
  status: number;
  data?: ValidationErrorResponse | ErrorResponse;

  constructor(
    status: number,
    message: string,
    data?: ValidationErrorResponse | ErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Type guard to check if an error is an ApiError
export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    'status' in error &&
    typeof (error as ApiError).status === 'number'
  );
}

// Type guard to check if an error response contains validation errors
export function hasValidationErrors(
  data: unknown
): data is ValidationErrorResponse {
  return (
    !!data &&
    typeof data === 'object' &&
    'errors' in data &&
    Array.isArray((data as ValidationErrorResponse).errors) &&
    (data as ValidationErrorResponse).errors.length > 0 &&
    typeof (data as ValidationErrorResponse).errors[0].msg === 'string'
  );
}

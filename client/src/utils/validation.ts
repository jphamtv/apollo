/**
 * Form validation utilities
 * 
 * Design pattern: 
 * - Modular validation functions (validateRequired, validateEmail, etc.)
 * - Composite validation through validateForm
 * 
 * We intentionally use this lightweight custom validation approach instead of
 * a form library like Formik or React Hook Form to minimize dependencies,
 * while maintaining consistent validation across all forms in the application.
 * 
 * Security consideration: We validate on both client and server - client validation
 * is for UX, server validation (in controllers) is the security boundary.
 */

export interface ValidationError {
  [key: string]: string;
}

/**
 * Validates that a field has a non-empty value
 * @param value The input value to validate
 * @param fieldName Display name of the field for error messages
 * @returns Error message if validation fails, undefined if valid
 */
export const validateRequired = (
  value: string,
  fieldName: string
): string | undefined => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
};

/**
 * Validates email format using a basic regex pattern
 * Note: This is intentionally a simple check; more complex validation occurs server-side
 * @param email Email string to validate
 * @returns Error message if validation fails, undefined if valid
 */
export const validateEmail = (email: string): string | undefined => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
};

/**
 * Validates password based on minimum requirements
 * Only checks length; more complex password requirements could be added
 * @param password Password string to validate
 * @returns Error message if validation fails, undefined if valid
 */
export const validatePassword = (password: string): string | undefined => {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
};

/**
 * Comprehensive form validation for any form values object
 * Uses appropriate specialized validators based on field name
 * 
 * Usage example: 
 * ```ts
 * const errors = validateForm({ email: 'user@example.com', password: 'password123' });
 * if (Object.keys(errors).length === 0) {
 *   // Form is valid, proceed
 * }
 * ```
 * 
 * @param values Object containing form field values with field names as keys
 * @returns Object with field names as keys and error messages as values (empty if all valid)
 */
export const validateForm = (
  values: Record<string, string>
): ValidationError => {
  const errors: ValidationError = {};

  Object.entries(values).forEach(([key, value]) => {
    let error;

    if (key === 'email') {
      error = validateEmail(value);
    } else if (key === 'password') {
      error = validatePassword(value);
    } else {
      error = validateRequired(value, key);
    }

    if (error) {
      errors[key] = error;
    }
  });

  return errors;
};

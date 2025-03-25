export interface ValidationError {
  [key: string]: string;
}

export const validateRequired = (
  value: string,
  fieldName: string
): string | undefined => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
};

export const validateEmail = (email: string): string | undefined => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
};

export const validatePassword = (password: string): string | undefined => {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
};

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

export interface ValidationError {
  [key: string]: string;
}

export const validateRequired = (
  value: string,
  fieldName: string,
): string | undefined => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
};

export const validateForm = (
  values: Record<string, string>,
): ValidationError => {
  const errors: ValidationError = {};

  Object.entries(values).forEach(([key, value]) => {
    const error = validateRequired(value, key);
    if (error) {
      errors[key] = error;
    }
  });

  return errors;
};

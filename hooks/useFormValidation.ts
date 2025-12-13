/**
 * ========================================
 * FORM VALIDATION HOOK
 * ========================================
 * Custom hook để handle form validation
 * Tuân thủ TypeScript strict mode
 */

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

export interface FormErrors {
  [key: string]: string[];
}

export interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onError?: (error: Error) => void;
}

export interface UseFormValidationReturn<T> {
  values: Partial<T>;
  errors: FormErrors;
  touched: Set<string>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setFieldValue: (field: string, value: unknown) => void;
  setFieldError: (field: string, error: string | string[]) => void;
  clearErrors: () => void;
  resetForm: () => void;
}

/**
 * Custom hook để handle form validation
 */
export function useFormValidation<T extends Record<string, unknown>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const { schema, onSubmit, onError } = options;

  const [values, setValues] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      // Convert to appropriate type
      let finalValue: unknown = value;
      if (type === 'number') {
        finalValue = value === '' ? undefined : Number(value);
      } else if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
      }

      setValues((prev) => ({
        ...prev,
        [name]: finalValue,
      }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  /**
   * Handle input blur
   */
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => new Set([...prev, name]));
    },
    []
  );

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((field: string, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Set field error programmatically
   */
  const setFieldError = useCallback((field: string, error: string | string[]) => {
    setErrors((prev) => ({
      ...prev,
      [field]: Array.isArray(error) ? error : [error],
    }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setValues({});
    setErrors({});
    setTouched(new Set());
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        setIsSubmitting(true);
        clearErrors();

        // Validate
        const validated = schema.parse(values);

        // Call onSubmit
        await onSubmit(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Build errors object from Zod errors
          const newErrors: FormErrors = {};
          error.errors.forEach((err) => {
            const path = err.path.join('.');
            if (!newErrors[path]) {
              newErrors[path] = [];
            }
            newErrors[path]!.push(err.message);
          });
          setErrors(newErrors);
        } else if (error instanceof ValidationError) {
          setErrors(error.fields);
        } else if (error instanceof Error) {
          onError?.(error);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, schema, onSubmit, onError, clearErrors]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    clearErrors,
    resetForm,
  };
}


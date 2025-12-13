/**
 * ========================================
 * VALIDATION MIDDLEWARE
 * ========================================
 * Input validation middleware cho Cloudflare Worker
 */

import { z } from 'zod';
import { ValidationError } from '../../../utils/errors';

/**
 * Validate request body
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path]!.push(err.message);
      });

      throw new ValidationError('Request body validation failed', fields);
    }

    throw error;
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  request: Request,
  schema: z.ZodSchema<T>
): T {
  try {
    const url = new URL(request.url);
    const params: Record<string, string | string[]> = {};

    url.searchParams.forEach((value, key) => {
      if (params[key]) {
        // Handle multiple values
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });

    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path]!.push(err.message);
      });

      throw new ValidationError('Query parameters validation failed', fields);
    }

    throw error;
  }
}

/**
 * Validate path parameters
 */
export function validatePathParams<T>(
  params: Record<string, string | undefined>,
  schema: z.ZodSchema<T>
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path]!.push(err.message);
      });

      throw new ValidationError('Path parameters validation failed', fields);
    }

    throw error;
  }
}


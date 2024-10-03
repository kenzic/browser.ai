import { ZodError, ZodIssue } from 'zod';
import { formatZodError } from './format-zod-error';

describe('formatZodError', () => {
  test('should format single error correctly', () => {
    const error = new ZodError([
      {
        path: ['field1'],
        message: 'Invalid input',
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
      } as ZodIssue,
    ]);

    const result = formatZodError(error);
    expect(result).toBe(
      'Validation errors:\n\n1. Field: field1 - Error: Invalid input\n   Expected: string, Received: number',
    );
  });

  test('should format multiple errors correctly', () => {
    const error = new ZodError([
      {
        path: ['field1'],
        message: 'Invalid input',
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
      } as ZodIssue,
      {
        path: ['field2'],
        message: 'Required',
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
      } as ZodIssue,
    ]);

    const result = formatZodError(error);
    expect(result).toBe(
      'Validation errors:\n\n1. Field: field1 - Error: Invalid input\n   Expected: string, Received: number\n2. Field: field2 - Error: Required\n   Expected: string, Received: undefined',
    );
  });

  test('should format error without path correctly', () => {
    const error = new ZodError([
      {
        path: [],
        message: 'General error',
        code: 'custom',
      } as ZodIssue,
    ]);

    const result = formatZodError(error);
    expect(result).toBe('Validation errors:\n\n1. Error: General error');
  });
});

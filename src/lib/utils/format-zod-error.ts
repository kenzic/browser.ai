import { ZodError } from 'zod';

export function formatZodError(error: ZodError): string {
  let formattedError = 'Validation errors:\n';

  error.errors.forEach((err, index) => {
    formattedError += `\n${index + 1}. `;

    if (err.path.length > 0) {
      formattedError += `Field: ${err.path.join('.')} - `;
    }

    formattedError += `Error: ${err.message}`;

    if (err.code === 'invalid_type') {
      formattedError += `\n   Expected: ${err.expected}, Received: ${err.received}`;
    }
  });

  return formattedError;
}

import { ValidationPipeOptions } from '@nestjs/common';
import type { ApiFieldErrors } from '@crm/types';
import type { ValidationError as ClassValidatorError } from 'class-validator';
import { ValidationError } from '../errors/app-error';

/**
 * Flattens class-validator's nested error tree into the flat, dot-delimited
 * field map the API contract specifies.
 *
 * `items.0.quantity` reads naturally on the client and maps directly onto form
 * field paths (API.md section 22, FRONTEND.md section 40).
 */
function collectFieldErrors(
  errors: ClassValidatorError[],
  parentPath = '',
  accumulator: ApiFieldErrors = {},
): ApiFieldErrors {
  for (const error of errors) {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;

    const messages = Object.values(error.constraints ?? {});
    if (messages.length > 0) {
      accumulator[path] = [...(accumulator[path] ?? []), ...messages];
    }

    if (error.children && error.children.length > 0) {
      collectFieldErrors(error.children, path, accumulator);
    }
  }

  return accumulator;
}

/**
 * Shared validation pipe configuration.
 *
 * `whitelist` and `forbidNonWhitelisted` together reject unknown properties,
 * which prevents mass-assignment through unvalidated fields
 * (ARCHITECTURE.md section 104).
 */
export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: (errors: ClassValidatorError[]) =>
    new ValidationError(collectFieldErrors(errors)),
};

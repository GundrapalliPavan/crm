import { Matches, MaxLength, MinLength } from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_POLICY_MESSAGE,
} from '../auth.constants';

/**
 * Composed validators for any field that must satisfy the project's password
 * policy (Step 4 section 9). Applying this in one place means the policy
 * cannot drift between reset-password, change-password and user-creation DTOs.
 */
export function IsValidNewPassword(): PropertyDecorator {
  const decorators = [
    MinLength(PASSWORD_MIN_LENGTH, { message: PASSWORD_POLICY_MESSAGE }),
    MaxLength(PASSWORD_MAX_LENGTH, { message: PASSWORD_POLICY_MESSAGE }),
    Matches(PASSWORD_PATTERN, { message: PASSWORD_POLICY_MESSAGE }),
  ];

  return (target: object, propertyKey: string | symbol) => {
    for (const decorate of decorators) {
      decorate(target, propertyKey);
    }
  };
}

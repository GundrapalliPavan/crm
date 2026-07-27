import { ValidationError } from '../errors/app-error';

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

/** DATABASE.md section 89: controlled `{{placeholder}}` tokens only - never executable code. */
export function resolveTemplate(template: string, variables: Record<string, string>): string {
  const missing = new Set<string>();

  const resolved = template.replace(PLACEHOLDER_PATTERN, (_match, name: string) => {
    if (!(name in variables)) {
      missing.add(name);
      return '';
    }
    return variables[name];
  });

  if (missing.size > 0) {
    throw new ValidationError({
      variables: [`Missing template variable(s): ${[...missing].join(', ')}.`],
    });
  }

  return resolved;
}

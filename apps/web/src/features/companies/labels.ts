import type { CompanyType } from '@crm/types';

function toTitleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

export function companyTypeLabel(companyType: CompanyType): string {
  return toTitleCase(companyType);
}

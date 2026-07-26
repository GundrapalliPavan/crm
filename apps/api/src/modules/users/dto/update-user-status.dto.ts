import { IsIn } from 'class-validator';
import type { UserStatus } from '@crm/types';

const USER_STATUSES: UserStatus[] = ['active', 'inactive', 'suspended'];

export class UpdateUserStatusDto {
  @IsIn(USER_STATUSES, { message: `status must be one of: ${USER_STATUSES.join(', ')}` })
  status!: UserStatus;
}

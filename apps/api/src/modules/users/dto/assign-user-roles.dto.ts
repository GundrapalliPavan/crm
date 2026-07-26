import { ArrayMaxSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class AssignUserRolesDto {
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsUUID('4', { each: true, message: 'Each role ID must be a valid UUID.' })
  roleIds!: string[];
}

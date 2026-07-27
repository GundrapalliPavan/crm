import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  /** null clears the manager; a string must be a valid user ID. */
  @IsOptional()
  @ValidateIf((dto: UpdateWarehouseDto) => dto.managerId !== null)
  @IsUUID()
  managerId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

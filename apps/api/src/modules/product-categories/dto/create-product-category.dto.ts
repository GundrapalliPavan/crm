import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

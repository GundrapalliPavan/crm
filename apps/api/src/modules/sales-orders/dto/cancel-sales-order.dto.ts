import { IsString, MaxLength, MinLength } from 'class-validator';

export class CancelSalesOrderDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;
}

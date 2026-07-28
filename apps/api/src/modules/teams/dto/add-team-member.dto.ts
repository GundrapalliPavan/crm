import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddTeamMemberDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  membershipRole?: string;
}

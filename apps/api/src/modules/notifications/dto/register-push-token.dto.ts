import { IsIn, IsString, MaxLength } from 'class-validator';
import { PUSH_PLATFORMS, type PushPlatform } from '@crm/types';

export class RegisterPushTokenDto {
  @IsString()
  @MaxLength(200)
  expoPushToken!: string;

  @IsIn(PUSH_PLATFORMS)
  platform!: PushPlatform;
}

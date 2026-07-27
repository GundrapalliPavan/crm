import { Module } from '@nestjs/common';
import { FollowUpsController, MyFollowUpsController } from './follow-ups.controller';
import { FollowUpsService } from './follow-ups.service';

@Module({
  controllers: [FollowUpsController, MyFollowUpsController],
  providers: [FollowUpsService],
})
export class FollowUpsModule {}

import { Module } from '@nestjs/common';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';
import { AuthModule } from '../auth/auth.module';
import { AccountEmailService } from '../auth/services/account-email.service';
import { PasswordResetService } from '../auth/services/password-reset.service';
import { SessionService } from '../auth/services/session.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, MessagingModule],
  controllers: [UsersController],
  // PasswordResetService, SessionService and AccountEmailService are not
  // exported by AuthModule (they are login/session/email internals), so this
  // module provides its own instances rather than widening AuthModule's
  // public surface for one consumer.
  providers: [UsersService, PasswordResetService, SessionService, AccountEmailService],
})
export class UsersModule {}

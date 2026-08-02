import { Module } from '@nestjs/common';
import { ExpoPushProvider } from './providers/expo-push.provider';
import { PUSH_PROVIDER } from './push-provider.interface';

/**
 * Wires the real `PushProvider` binding once (mirrors messaging.module.ts).
 * Only one vendor exists today (Expo Push), so this binds directly rather
 * than through a composite - add one if a second provider is ever needed.
 */
@Module({
  providers: [ExpoPushProvider, { provide: PUSH_PROVIDER, useClass: ExpoPushProvider }],
  exports: [PUSH_PROVIDER],
})
export class PushModule {}

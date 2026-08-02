import { Injectable, Logger } from '@nestjs/common';
import type { Expo as ExpoType } from 'expo-server-sdk';
import { AppConfigService } from '../../../config/app-config.service';
import type { PushProvider, PushSendParams, PushSendResult } from '../push-provider.interface';

/**
 * Expo Push - one API for iOS+Android (MOBILE_ARCHITECTURE.md section 9),
 * rather than talking to APNs/FCM directly.
 *
 * `expo-server-sdk` ships ESM-only (no CJS build) while this project
 * compiles to CommonJS - a dynamic `import()` is Node's own documented
 * interop path for consuming an ESM-only package from CJS, so the class
 * itself stays a normal CommonJS-compiled NestJS provider.
 */
@Injectable()
export class ExpoPushProvider implements PushProvider {
  private readonly logger = new Logger(ExpoPushProvider.name);

  constructor(private readonly config: AppConfigService) {}

  async send(params: PushSendParams): Promise<PushSendResult> {
    const { Expo } = await import('expo-server-sdk');

    if (!Expo.isExpoPushToken(params.expoPushToken)) {
      return { status: 'failed', failureReason: 'Not a valid Expo push token.' };
    }

    const expo: ExpoType = new Expo({ accessToken: this.config.expoAccessToken });

    try {
      const [ticket] = await expo.sendPushNotificationsAsync([
        {
          to: params.expoPushToken,
          title: params.title,
          body: params.body,
          data: params.data,
        },
      ]);

      if (ticket.status === 'error') {
        this.logger.warn(`Push send to ${params.expoPushToken} failed: ${ticket.message}`);
        return { status: 'failed', failureReason: ticket.message };
      }

      return { status: 'sent' };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Push send to ${params.expoPushToken} failed: ${reason}`);
      return { status: 'failed', failureReason: reason };
    }
  }
}

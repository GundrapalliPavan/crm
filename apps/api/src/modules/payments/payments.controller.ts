import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, Payment, PaymentSummary } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CancelPaymentDto } from './dto/cancel-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsQuery } from './dto/list-payments.query';
import { PaymentsService } from './payments.service';

/** API.md section 80. */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @RequirePermission('payment.read')
  @Get()
  list(@Query() query: ListPaymentsQuery): Promise<ApiCollectionResponse<PaymentSummary>> {
    return this.paymentsService.list(query);
  }

  @RequirePermission('payment.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Payment> {
    return this.paymentsService.getById(id);
  }

  @RequirePermission('payment.record')
  @Post()
  create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Payment> {
    return this.paymentsService.create(dto, actor.id);
  }

  /** No dedicated `payment.reverse` permission is seeded - reuses `payment.record`, mirroring how quotation.cancel/purchase_order.cancel reuse `.update`. */
  @RequirePermission('payment.record')
  @HttpCode(HttpStatus.OK)
  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelPaymentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Payment> {
    return this.paymentsService.cancel(id, dto, actor.id);
  }
}

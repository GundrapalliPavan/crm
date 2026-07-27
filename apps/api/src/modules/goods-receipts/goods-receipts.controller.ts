import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, GoodsReceipt } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { ListGoodsReceiptsQuery } from './dto/list-goods-receipts.query';
import { GoodsReceiptsService } from './goods-receipts.service';

/** API.md sections 72-74. Receipts are immutable once created - they are the evidence behind stock movements. */
@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: GoodsReceiptsService) {}

  @RequirePermission('goods_receipt.read')
  @Get()
  list(@Query() query: ListGoodsReceiptsQuery): Promise<ApiCollectionResponse<GoodsReceipt>> {
    return this.goodsReceiptsService.list(query);
  }

  @RequirePermission('goods_receipt.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<GoodsReceipt> {
    return this.goodsReceiptsService.getById(id);
  }

  @RequirePermission('goods_receipt.create')
  @Post()
  create(
    @Body() dto: CreateGoodsReceiptDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<GoodsReceipt> {
    return this.goodsReceiptsService.create(dto, actor.id);
  }
}

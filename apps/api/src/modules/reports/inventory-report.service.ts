import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { InventoryReportResponse } from '@crm/types';
import { PrismaService } from '../../database/prisma.service';
import { toCsv } from '../../common/reports/csv';
import { InventoryReportQuery } from './dto/inventory-report.query';

interface LowStockRawRow {
  productId: string;
  sku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  availableQuantity: Prisma.Decimal;
  minimumStockLevel: Prisma.Decimal;
}

@Injectable()
export class InventoryReportService {
  constructor(private readonly prisma: PrismaService) {}

  /** REPORTS.md section 44: a point-in-time snapshot, not a period metric. */
  async getReport(query: InventoryReportQuery): Promise<InventoryReportResponse> {
    const productFilter: Prisma.ProductWhereInput = {};
    if (query.categoryId) productFilter.categoryId = query.categoryId;
    if (query.brandId) productFilter.brandId = query.brandId;

    const balanceWhere: Prisma.InventoryBalanceWhereInput = {};
    if (query.warehouseId) balanceWhere.warehouseId = query.warehouseId;
    if (query.categoryId || query.brandId) balanceWhere.product = productFilter;

    const [warehouseGroups, warehouses, lowStock] = await Promise.all([
      this.prisma.inventoryBalance.groupBy({
        by: ['warehouseId'],
        where: balanceWhere,
        _sum: { onHandQuantity: true, reservedQuantity: true },
      }),
      this.prisma.warehouse.findMany(),
      this.getLowStockRows(query),
    ]);
    const warehouseNameById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse.name]));

    return {
      byWarehouse: warehouseGroups.map((row) => {
        const onHand = new Prisma.Decimal(row._sum.onHandQuantity ?? 0);
        const reserved = new Prisma.Decimal(row._sum.reservedQuantity ?? 0);
        return {
          warehouseId: row.warehouseId,
          warehouseName: warehouseNameById.get(row.warehouseId) ?? 'Unknown warehouse',
          onHandQuantity: onHand.toString(),
          reservedQuantity: reserved.toString(),
          availableQuantity: onHand.minus(reserved).toString(),
        };
      }),
      lowStock: lowStock.map((row) => ({
        productId: row.productId,
        sku: row.sku,
        productName: row.productName,
        warehouseId: row.warehouseId,
        warehouseName: row.warehouseName,
        availableQuantity: row.availableQuantity.toString(),
        minimumStockLevel: row.minimumStockLevel.toString(),
      })),
    };
  }

  async getReportCsv(query: InventoryReportQuery): Promise<string> {
    const report = await this.getReport(query);
    return toCsv(
      ['Product', 'SKU', 'Warehouse', 'Available', 'Minimum Stock Level'],
      report.lowStock.map((row) => [row.productName, row.sku, row.warehouseName, row.availableQuantity, row.minimumStockLevel]),
    );
  }

  /** Mirrors InventoryService's own low-stock guard (inventory.service.ts) - kept as a separate query since this needs full row detail for a report, not just the matching keys. */
  private async getLowStockRows(query: InventoryReportQuery): Promise<LowStockRawRow[]> {
    return this.prisma.$queryRaw<LowStockRawRow[]>`
      SELECT p.id AS "productId", p.sku, p.name AS "productName",
             w.id AS "warehouseId", w.name AS "warehouseName",
             (ib.on_hand_quantity - ib.reserved_quantity) AS "availableQuantity",
             p.minimum_stock_level AS "minimumStockLevel"
      FROM inventory_balances ib
      INNER JOIN products p ON p.id = ib.product_id
      INNER JOIN warehouses w ON w.id = ib.warehouse_id
      WHERE p.minimum_stock_level IS NOT NULL
        AND (ib.on_hand_quantity - ib.reserved_quantity) <= p.minimum_stock_level
        ${query.warehouseId ? Prisma.sql`AND ib.warehouse_id = ${query.warehouseId}::uuid` : Prisma.empty}
        ${query.categoryId ? Prisma.sql`AND p.category_id = ${query.categoryId}::uuid` : Prisma.empty}
        ${query.brandId ? Prisma.sql`AND p.brand_id = ${query.brandId}::uuid` : Prisma.empty}
      ORDER BY "availableQuantity" ASC
    `;
  }
}

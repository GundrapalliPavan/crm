import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, Product } from '@crm/types';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQuery } from './dto/list-products.query';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRODUCT_INCLUDE, toProduct } from './product.mapper';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProductsQuery): Promise<ApiCollectionResponse<Product>> {
    const where: Prisma.ProductWhereInput = { archivedAt: null };

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    if (query.q) {
      const term = query.q.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: rows.map(toProduct),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    if (!product) {
      throw new NotFoundError('Product not found.');
    }
    return toProduct(product);
  }

  async create(dto: CreateProductDto, actorUserId: string): Promise<Product> {
    await this.assertReferencesExist(dto.categoryId, dto.brandId, dto.unitId);
    await this.assertNoDuplicateSku(dto.sku);

    const product = await this.prisma.product.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        unitId: dto.unitId,
        hsnCode: dto.hsnCode,
        taxRate: dto.taxRate,
        purchasePriceReference: dto.purchasePriceReference,
        sellingPriceReference: dto.sellingPriceReference,
        minimumStockLevel: dto.minimumStockLevel,
        createdBy: actorUserId,
      },
      include: PRODUCT_INCLUDE,
    });

    return toProduct(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found.');
    }

    await this.assertReferencesExist(dto.categoryId, dto.brandId, dto.unitId);
    if (dto.sku !== undefined) {
      await this.assertNoDuplicateSku(dto.sku, id);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: PRODUCT_INCLUDE,
    });

    return toProduct(product);
  }

  /** DELETE means archive (matching Leads/Contacts/Companies) - historical documents keep resolving the product. */
  async archive(id: string): Promise<void> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found.');
    }
    if (existing.archivedAt) {
      return;
    }

    await this.prisma.product.update({ where: { id }, data: { archivedAt: new Date() } });
  }

  private async assertReferencesExist(
    categoryId?: string,
    brandId?: string,
    unitId?: string,
  ): Promise<void> {
    if (categoryId) {
      const category = await this.prisma.productCategory.findUnique({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundError('Product category not found.');
      }
    }
    if (brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand) {
        throw new NotFoundError('Brand not found.');
      }
    }
    if (unitId) {
      const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
      if (!unit) {
        throw new NotFoundError('Unit not found.');
      }
    }
  }

  private async assertNoDuplicateSku(sku: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.product.findFirst({
      where: { sku: { equals: sku, mode: 'insensitive' }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (existing) {
      throw new ConflictError(`A product with SKU "${sku}" already exists.`);
    }
  }
}

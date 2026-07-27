import { Injectable } from '@nestjs/common';
import type { ProductCategory } from '@crm/types';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

const CATEGORY_INCLUDE = { parent: { select: { id: true, name: true } } } as const;

type CategoryWithParent = Awaited<ReturnType<ProductCategoriesService['getRawById']>>;

@Injectable()
export class ProductCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<{ data: ProductCategory[] }> {
    const categories = await this.prisma.productCategory.findMany({
      include: CATEGORY_INCLUDE,
      orderBy: { name: 'asc' },
    });

    return { data: categories.map((category) => this.toProductCategory(category)) };
  }

  async getById(id: string): Promise<ProductCategory> {
    const category = await this.getRawById(id);
    if (!category) {
      throw new NotFoundError('Product category not found.');
    }
    return this.toProductCategory(category);
  }

  /**
   * DATABASE.md section 39: "do not create category hierarchy unless the
   * business needs it" - the DB unique constraint is scoped to (parentId,
   * name), which Postgres does not enforce across NULL parentId values, so
   * top-level duplicates are checked explicitly here.
   */
  async create(dto: CreateProductCategoryDto): Promise<ProductCategory> {
    if (dto.parentId) {
      const parent = await this.prisma.productCategory.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundError('Parent category not found.');
      }
    }

    await this.assertNoDuplicateName(dto.name, dto.parentId ?? null);

    const category = await this.prisma.productCategory.create({
      data: { name: dto.name, parentId: dto.parentId, description: dto.description },
      include: CATEGORY_INCLUDE,
    });

    return this.toProductCategory(category);
  }

  async update(id: string, dto: UpdateProductCategoryDto): Promise<ProductCategory> {
    const existing = await this.prisma.productCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product category not found.');
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new ConflictError('A category cannot be its own parent.');
      }
      if (dto.parentId) {
        const parent = await this.prisma.productCategory.findUnique({ where: { id: dto.parentId } });
        if (!parent) {
          throw new NotFoundError('Parent category not found.');
        }
      }
    }

    if (dto.name !== undefined) {
      const parentId = dto.parentId !== undefined ? dto.parentId : existing.parentId;
      await this.assertNoDuplicateName(dto.name, parentId, id);
    }

    const category = await this.prisma.productCategory.update({
      where: { id },
      data: dto,
      include: CATEGORY_INCLUDE,
    });

    return this.toProductCategory(category);
  }

  private async getRawById(id: string) {
    return this.prisma.productCategory.findUnique({ where: { id }, include: CATEGORY_INCLUDE });
  }

  private async assertNoDuplicateName(
    name: string,
    parentId: string | null,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.productCategory.findFirst({
      where: {
        parentId,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictError(`A category named "${name}" already exists at this level.`);
    }
  }

  private toProductCategory(category: NonNullable<CategoryWithParent>): ProductCategory {
    return {
      id: category.id,
      name: category.name,
      parent: category.parent,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}

import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import type { AuthenticatedUser, SupplierProfile } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { UpsertSupplierProfileDto } from './dto/upsert-supplier-profile.dto';
import { SupplierProfileService } from './supplier-profile.service';

/**
 * A supplier is a Company with `isSupplier: true` (DATABASE.md section 62) -
 * this controller only owns the supplier-specific extension fields.
 * Supplier contacts reuse the existing Contact model; no new endpoint here.
 */
@Controller('companies')
export class SupplierProfileController {
  constructor(private readonly supplierProfileService: SupplierProfileService) {}

  @RequirePermission('company.read')
  @Get(':id/supplier-profile')
  getByCompanyId(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: SupplierProfile | null }> {
    return this.supplierProfileService.getByCompanyId(id);
  }

  @RequirePermission('company.update')
  @Patch(':id/supplier-profile')
  upsert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertSupplierProfileDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<SupplierProfile> {
    return this.supplierProfileService.upsert(id, dto, actor.id);
  }
}

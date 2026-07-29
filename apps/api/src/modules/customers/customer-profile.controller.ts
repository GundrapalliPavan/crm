import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import type { AuthenticatedUser, CustomerProfile } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { UpsertCustomerProfileDto } from './dto/upsert-customer-profile.dto';
import { CustomerProfileService } from './customer-profile.service';

/**
 * A customer is a Company with `isCustomer: true` (DATABASE.md section 34) -
 * this controller only owns the customer-specific extension fields (credit
 * limit / payment terms override, customer code, customer-since). Customer
 * contacts reuse the existing Contact model; no new endpoint here.
 */
@Controller('companies')
export class CustomerProfileController {
  constructor(private readonly customerProfileService: CustomerProfileService) {}

  @RequirePermission('company.read')
  @Get(':id/customer-profile')
  getByCompanyId(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: CustomerProfile | null }> {
    return this.customerProfileService.getByCompanyId(id);
  }

  @RequirePermission('company.update')
  @Patch(':id/customer-profile')
  upsert(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertCustomerProfileDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<CustomerProfile> {
    return this.customerProfileService.upsert(id, dto, actor.id);
  }
}

import { Module } from '@nestjs/common';
import { SupplierProfileController } from './supplier-profile.controller';
import { SupplierProfileService } from './supplier-profile.service';

@Module({
  controllers: [SupplierProfileController],
  providers: [SupplierProfileService],
})
export class SuppliersModule {}

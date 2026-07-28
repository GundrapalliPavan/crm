import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from './common/audit/audit.module';
import { DocumentsModule } from './common/documents/documents.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingModule } from './common/logging/logging.module';
import { validationPipeOptions } from './common/pipes/validation-exception.factory';
import { RequestContextModule } from './common/request-context/request-context.module';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { BrandsModule } from './modules/brands/brands.module';
import { CommunicationTemplatesModule } from './modules/communication-templates/communication-templates.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { CustomersModule } from './modules/customers/customers.module';
import { FilesModule } from './modules/files/files.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { GoodsReceiptsModule } from './modules/goods-receipts/goods-receipts.module';
import { HealthModule } from './modules/health/health.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { LeadSourcesModule } from './modules/lead-sources/lead-sources.module';
import { LeadsModule } from './modules/leads/leads.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';
import { ProductsModule } from './modules/products/products.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RolesModule } from './modules/roles/roles.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { TeamsModule } from './modules/teams/teams.module';
import { UnitsModule } from './modules/units/units.module';
import { UsersModule } from './modules/users/users.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';

/**
 * Root module.
 *
 * The request-context middleware is intentionally *not* registered here: it
 * must run before the body parsers, which module middleware cannot do. It is
 * applied in `configureApp` instead.
 *
 * Global guard order (Step 4 section 46-47, 23):
 *   1. ThrottlerGuard    - cheap, no DB access; blocks abuse before anything
 *                          else runs. A stricter per-route limit is applied to
 *                          login/forgot-password with `@Throttle(...)`.
 *   2. JwtAuthGuard      - authentication; deny-by-default unless `@Public()`.
 *   3. PermissionsGuard  - authorization; no-op unless `@RequirePermission()`.
 * `useExisting` (not `useClass`) for the auth guards: they are already
 * singletons exported by `AuthModule`, so this reuses that instance instead of
 * constructing a second one.
 */
@Module({
  imports: [
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    RequestContextModule,
    AuditModule,
    DocumentsModule,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    RolesModule,
    LeadSourcesModule,
    LeadsModule,
    FollowUpsModule,
    ContactsModule,
    CompaniesModule,
    UnitsModule,
    ProductCategoriesModule,
    BrandsModule,
    ProductsModule,
    WarehousesModule,
    InventoryModule,
    QuotationsModule,
    SalesOrdersModule,
    SuppliersModule,
    PurchaseOrdersModule,
    GoodsReceiptsModule,
    CustomersModule,
    InvoicesModule,
    PaymentsModule,
    ReportsModule,
    CommunicationTemplatesModule,
    CommunicationsModule,
    TeamsModule,
    FilesModule,
    NotificationsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useValue: new ValidationPipe(validationPipeOptions) },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
    { provide: APP_GUARD, useExisting: PermissionsGuard },
  ],
})
export class AppModule {}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { ApiCollectionResponse, AuthenticatedUser, Company, Contact } from '@crm/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ListCompaniesQuery } from './dto/list-companies.query';
import { PaginationQuery } from './dto/pagination.query';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @RequirePermission('company.read')
  @Get()
  list(@Query() query: ListCompaniesQuery): Promise<ApiCollectionResponse<Company>> {
    return this.companiesService.list(query);
  }

  @RequirePermission('company.read')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<Company> {
    return this.companiesService.getById(id);
  }

  @RequirePermission('contact.read')
  @Get(':id/contacts')
  listContacts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQuery,
  ): Promise<ApiCollectionResponse<Contact>> {
    return this.companiesService.listContacts(id, query.page, query.pageSize);
  }

  @RequirePermission('company.create')
  @Post()
  create(
    @Body() dto: CreateCompanyDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Company> {
    return this.companiesService.create(dto, actor.id);
  }

  @RequirePermission('company.update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<Company> {
    return this.companiesService.update(id, dto, actor.id);
  }

  @RequirePermission('company.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  archive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser): Promise<void> {
    return this.companiesService.archive(id, actor.id);
  }
}

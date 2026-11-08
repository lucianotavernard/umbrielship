import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { pageQueryParamSchema } from '@/package/shared/lib/http/page-query';
import type { PageQueryParamSchema } from '@/package/shared/lib/http/page-query';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe';

import { FetchInvitationsUseCase } from '../invitation/fetch-invitations.use-case';
import { CountOrganizationRolesUseCase } from '../user/count-organization-roles.use-case';
import { FetchOrganizationUsersUseCase } from '../user/fetch-organization-users.use-case';
import { FetchOrganizationsUseCase } from './fetch-organizations.use-case';
import { CreateOrganizationUseCase } from './create-organization.use-case';
import { GetOrganizationByIdUseCase } from './get-organization-by-id.use-case';
import { InternalAdministratorGuard } from './internal-administrator.guard';

const createOrganizationBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
});

type CreateOrganizationBodySchema = z.infer<
  typeof createOrganizationBodySchema
>;

@UseGuards(InternalAdministratorGuard)
@Controller('/organizations')
export class OrganizationController {
  constructor(
    private createOrganization: CreateOrganizationUseCase,
    private fetchOrganizations: FetchOrganizationsUseCase,
    private getOrganizationById: GetOrganizationByIdUseCase,
    private fetchOrganizationUsers: FetchOrganizationUsersUseCase,
    private countOrganizationRoles: CountOrganizationRolesUseCase,
    private fetchInvitations: FetchInvitationsUseCase,
  ) {}

  @Get()
  async get(
    @Query(new ZodValidationPipe(pageQueryParamSchema))
    { page, per_page }: PageQueryParamSchema,
  ) {
    const { organizations, total } = await this.fetchOrganizations.handle({
      page,
      perPage: per_page,
    });

    return {
      organizations,
      total,
    };
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createOrganizationBodySchema))
  async create(@Body() body: CreateOrganizationBodySchema) {
    try {
      const { name, email } = body;

      const { organization } = await this.createOrganization.handle({
        name,
        email,
      });

      return {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        isInternal: organization.isInternal,
      };
    } catch (error) {
      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const { organization } = await this.getOrganizationById.handle(id);

      return {
        organization,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Get(':id/users')
  async getUsers(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(pageQueryParamSchema))
    { page, per_page }: PageQueryParamSchema,
  ) {
    try {
      const { users, total } = await this.fetchOrganizationUsers.handle({
        organizationId: id,
        page,
        perPage: per_page,
      });

      return {
        users,
        total,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Get(':id/roles')
  async getRoles(@Param('id') id: string) {
    try {
      const { roles } = await this.countOrganizationRoles.handle({
        organizationId: id,
      });

      return {
        roles,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Get(':id/invitations')
  async getInvitations(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(pageQueryParamSchema))
    { page, per_page }: PageQueryParamSchema,
  ) {
    try {
      const { invitations, total } = await this.fetchInvitations.handle({
        organizationId: id,
        page,
        perPage: per_page,
      });

      return {
        invitations,
        total,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}

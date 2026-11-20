import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { pageQueryParamSchema } from '@/package/shared/lib/http/page-query.js';
import type { PageQueryParamSchema } from '@/package/shared/lib/http/page-query.js';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe.js';

import { FetchInvitationsUseCase } from '../invitation/fetch-invitations.use-case.js';
import { CountOrganizationRolesUseCase } from '../user/count-organization-roles.use-case.js';
import { FetchOrganizationUsersUseCase } from '../user/fetch-organization-users.use-case.js';
import { FetchOrganizationsUseCase } from './fetch-organizations.use-case.js';
import { CreateOrganizationUseCase } from './create-organization.use-case.js';
import { DeleteOrganizationUseCase } from './delete-organization.use-case.js';
import { GetOrganizationByIdUseCase } from './get-organization-by-id.use-case.js';
import { InternalAdministratorGuard } from './internal-administrator.guard.js';

const createOrganizationBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
});

type CreateOrganizationBodySchema = z.infer<
  typeof createOrganizationBodySchema
>;

// The page, and the text the names and emails must contain (AD-111).
const fetchOrganizationsQuerySchema = pageQueryParamSchema.extend({
  search: z.string().trim().max(80).optional(),
});

type FetchOrganizationsQuerySchema = z.infer<
  typeof fetchOrganizationsQuerySchema
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
    private deleteOrganization: DeleteOrganizationUseCase,
  ) {}

  @Get()
  async get(
    @Query(new ZodValidationPipe(fetchOrganizationsQuerySchema))
    { page, per_page, search }: FetchOrganizationsQuerySchema,
  ) {
    const { organizations, total } = await this.fetchOrganizations.handle({
      page,
      perPage: per_page,
      search,
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

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    try {
      await this.deleteOrganization.handle({ id });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ConflictDomainException) {
        throw new ConflictException(error.message);
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

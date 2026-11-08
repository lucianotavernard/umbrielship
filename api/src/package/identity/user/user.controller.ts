import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { pageQueryParamSchema } from '@/package/shared/lib/http/page-query';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe';

import { InternalAdministratorGuard } from '../organization/internal-administrator.guard';
import { CreateUserUseCase } from './create-user.use-case';
import { FetchUsersUseCase } from './fetch-users.use-case';

const createUserBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  password: z.string().min(8).max(72),
  role: z.enum(['administrator', 'operator']),
  organizationId: z.uuid(),
});

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>;

const fetchUsersQuerySchema = pageQueryParamSchema.extend({
  not_in_organization: z.uuid(),
});

type FetchUsersQuerySchema = z.infer<typeof fetchUsersQuerySchema>;

@UseGuards(InternalAdministratorGuard)
@Controller('/users')
export class UserController {
  constructor(
    private createUser: CreateUserUseCase,
    private fetchUsers: FetchUsersUseCase,
  ) {}

  @Get()
  async get(
    @Query(new ZodValidationPipe(fetchUsersQuerySchema))
    { not_in_organization, page, per_page }: FetchUsersQuerySchema,
  ) {
    const { users, total } = await this.fetchUsers.handle({
      notInOrganizationId: not_in_organization,
      page,
      perPage: per_page,
    });

    return {
      users,
      total,
    };
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  async create(@Body() body: CreateUserBodySchema) {
    try {
      const { name, email, password, role, organizationId } = body;

      const { user } = await this.createUser.handle({
        name,
        email,
        password,
        role,
        organizationId,
      });

      return user;
    } catch (error) {
      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}

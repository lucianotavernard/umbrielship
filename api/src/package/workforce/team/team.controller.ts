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
  Put,
} from '@nestjs/common';
import { z } from 'zod';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe.js';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator.js';
import { Roles } from '@/package/shared/module/auth/roles.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { CreateTeamUseCase } from './create-team.use-case.js';
import { DeleteTeamUseCase } from './delete-team.use-case.js';
import { FetchTeamsUseCase } from './fetch-teams.use-case.js';
import { Team } from './team.entity.js';
import { UpdateTeamUseCase } from './update-team.use-case.js';

const teamBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  specialty: z.string().trim().min(1).max(100),
});

type TeamBodySchema = z.infer<typeof teamBodySchema>;

const present = ({ id, name, specialty }: Team) => ({ id, name, specialty });

@Controller('/teams')
export class TeamController {
  constructor(
    private createTeam: CreateTeamUseCase,
    private deleteTeam: DeleteTeamUseCase,
    private fetchTeams: FetchTeamsUseCase,
    private updateTeam: UpdateTeamUseCase,
  ) {}

  @Get()
  async get(@CurrentUser() user: UserPayload) {
    const { teams } = await this.fetchTeams.handle({
      organizationId: user.organizationId,
    });

    return {
      teams: teams.map(({ team, staffCount }) => ({
        ...present(team),
        staffCount,
      })),
    };
  }

  @Roles('administrator')
  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(teamBodySchema)) body: TeamBodySchema,
  ) {
    try {
      const { team } = await this.createTeam.handle({
        organizationId: user.organizationId,
        ...body,
      });

      return { team: present(team) };
    } catch (error) {
      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Roles('administrator')
  @Put(':id')
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(teamBodySchema)) body: TeamBodySchema,
  ) {
    try {
      const { team } = await this.updateTeam.handle({
        organizationId: user.organizationId,
        id,
        ...body,
      });

      return { team: present(team) };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Roles('administrator')
  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    try {
      await this.deleteTeam.handle({ organizationId: user.organizationId, id });
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
}

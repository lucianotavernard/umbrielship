import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/package/shared/module/prisma/prisma.service';

import { IUsersRepository } from './contracts/user-repository.contract';
import { User } from './user.entity';

@Injectable()
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return row ? User.create(row, row.id) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return row ? User.create(row, row.id) : null;
  }
}

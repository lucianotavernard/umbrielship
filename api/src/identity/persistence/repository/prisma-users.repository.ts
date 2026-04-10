import { Injectable } from '@nestjs/common';

import { User } from '@/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/shared/module/prisma/service/prisma.service';

import { UserRepository } from '@/identity/core/interface/user.repository';

@Injectable()
export class PrismaUsersRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
}

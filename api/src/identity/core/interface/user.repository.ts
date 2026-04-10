import { User } from '@/shared/module/prisma/generated/prisma/client';

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
}
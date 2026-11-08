import { User } from '../user.entity';

export abstract class IUsersRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
}

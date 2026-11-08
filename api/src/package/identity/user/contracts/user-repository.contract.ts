import { Role, User } from '../user.entity';

export abstract class IUsersRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findManyByOrganization(
    organizationId: string,
    page: number,
    perPage: number,
  ): Promise<User[]>;
  abstract countByOrganization(organizationId: string): Promise<number>;
  abstract countByOrganizationAndRole(
    organizationId: string,
    role: Role,
  ): Promise<number>;
  abstract findManyOutsideOrganization(
    organizationId: string,
    page: number,
    perPage: number,
  ): Promise<User[]>;
  abstract countOutsideOrganization(organizationId: string): Promise<number>;
  // Writes the User and its Memberships; throws AlreadyExistsDomainException when the email is taken.
  abstract save(user: User): Promise<void>;
  // Writes the active Organization and adds the Memberships the User lacks.
  abstract update(user: User): Promise<void>;
}

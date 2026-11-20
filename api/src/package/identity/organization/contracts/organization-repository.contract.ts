import { Organization } from '../organization.entity.js';

export abstract class IOrganizationsRepository {
  /** By name; `search`, when given, keeps the names and emails that contain it, without case. */
  abstract findAll(
    page: number,
    perPage: number,
    search?: string,
  ): Promise<Organization[]>;
  abstract count(search?: string): Promise<number>;
  abstract findById(id: string): Promise<Organization | null>;
  abstract findByName(name: string): Promise<Organization | null>;
  abstract findByEmail(email: string): Promise<Organization | null>;
  // Throws AlreadyExistsDomainException when another Organization took the name or the email first.
  abstract save(organization: Organization): Promise<void>;
  // Deletes its Memberships and Invitations with it; a User it was active for keeps no active one.
  abstract delete(id: string): Promise<void>;
}

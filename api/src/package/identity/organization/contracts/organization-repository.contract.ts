import { Organization } from '../organization.entity.js';

export abstract class IOrganizationsRepository {
  abstract findAll(page: number, perPage: number): Promise<Organization[]>;
  abstract count(): Promise<number>;
  abstract findById(id: string): Promise<Organization | null>;
  abstract findByName(name: string): Promise<Organization | null>;
  abstract findByEmail(email: string): Promise<Organization | null>;
  // Throws AlreadyExistsDomainException when another Organization took the name or the email first.
  abstract save(organization: Organization): Promise<void>;
}

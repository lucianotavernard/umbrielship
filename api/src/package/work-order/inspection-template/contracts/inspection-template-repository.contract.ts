import { Paginate } from '@/package/shared/lib/type/paginate.js';

import { InspectionTemplate } from '../inspection-template.entity.js';

export abstract class IInspectionTemplatesRepository {
  abstract findById(
    organizationId: string,
    id: string,
  ): Promise<InspectionTemplate | null>;
  // The name is compared without case.
  abstract findByName(
    organizationId: string,
    name: string,
  ): Promise<InspectionTemplate | null>;
  // Newest first, ties by id.
  abstract findMany(
    organizationId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<InspectionTemplate>>;
  abstract create(template: InspectionTemplate): Promise<void>;
  // Replaces the name and every item.
  abstract save(template: InspectionTemplate): Promise<void>;
  abstract delete(organizationId: string, id: string): Promise<void>;
}

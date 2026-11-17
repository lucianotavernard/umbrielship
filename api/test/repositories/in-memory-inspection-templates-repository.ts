import { Paginate } from '@/package/shared/lib/type/paginate.js';
import { IInspectionTemplatesRepository } from '@/package/work-order/inspection-template/contracts/inspection-template-repository.contract.js';
import { InspectionTemplate } from '@/package/work-order/inspection-template/inspection-template.entity.js';

export class InMemoryInspectionTemplatesRepository implements IInspectionTemplatesRepository {
  public items: InspectionTemplate[] = [];

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<InspectionTemplate | null> {
    return this.of(organizationId).find((item) => item.id === id) ?? null;
  }

  async findByName(
    organizationId: string,
    name: string,
  ): Promise<InspectionTemplate | null> {
    return (
      this.of(organizationId).find(
        (item) => item.name.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  }

  async findMany(
    organizationId: string,
    take?: number,
    skip?: number,
  ): Promise<Paginate<InspectionTemplate>> {
    const owned = [...this.of(organizationId)].sort(
      (a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime() ||
        b.id.localeCompare(a.id),
    );
    const start = skip ?? 0;
    const data =
      take === undefined
        ? owned.slice(start)
        : owned.slice(start, start + take);

    return { data, total: owned.length };
  }

  async create(template: InspectionTemplate): Promise<void> {
    this.items.push(template);
  }

  async save(template: InspectionTemplate): Promise<void> {
    const index = this.items.findIndex((item) => item.id === template.id);
    this.items[index] = template;
  }

  async delete(organizationId: string, id: string): Promise<void> {
    this.items = this.items.filter(
      (item) => !(item.organizationId === organizationId && item.id === id),
    );
  }
}

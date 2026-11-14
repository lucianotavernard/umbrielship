import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';

import { makeInspectionTemplate } from '@test/factory.js';
import { InMemoryInspectionTemplatesRepository } from '@test/repositories/in-memory-inspection-templates-repository.js';
import { CreateInspectionTemplateUseCase } from '../create-inspection-template.use-case.js';

let templates: InMemoryInspectionTemplatesRepository;
let sut: CreateInspectionTemplateUseCase;

describe('CreateInspectionTemplateUseCase', () => {
  beforeEach(() => {
    templates = new InMemoryInspectionTemplatesRepository();
    sut = new CreateInspectionTemplateUseCase(templates);
  });

  it('template C1 stores the template and its items at positions 0 and 1 in the order sent', async () => {
    const before = Date.now();

    const { inspectionTemplate } = await sut.handle({
      organizationId: 'org-1',
      name: 'Pintura',
      labels: ['Casco limpo', 'Pintura sem bolhas'],
    });

    expect(templates.items).toEqual([inspectionTemplate]);
    expect(inspectionTemplate.organizationId).toBe('org-1');
    expect(inspectionTemplate.name).toBe('Pintura');
    expect(inspectionTemplate.createdAt.getTime()).toBeGreaterThanOrEqual(
      before,
    );
    expect(
      inspectionTemplate.items.map(({ label, position }) => ({
        label,
        position,
      })),
    ).toEqual([
      { label: 'Casco limpo', position: 0 },
      { label: 'Pintura sem bolhas', position: 1 },
    ]);
  });

  it('template C4 accepts two items with the same label', async () => {
    const { inspectionTemplate } = await sut.handle({
      organizationId: 'org-1',
      name: 'Pintura',
      labels: ['Sem bolhas', 'Sem bolhas'],
    });

    expect(inspectionTemplate.items.map((item) => item.label)).toEqual([
      'Sem bolhas',
      'Sem bolhas',
    ]);
    expect(new Set(inspectionTemplate.items.map((item) => item.id)).size).toBe(
      2,
    );
  });

  it('template C5 refuses PINTURA when Pintura exists and accepts a name of another Organization', async () => {
    templates.items.push(makeInspectionTemplate({ name: 'Pintura' }));

    await expect(
      sut.handle({ organizationId: 'org-1', name: 'PINTURA', labels: ['x'] }),
    ).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    expect(templates.items).toHaveLength(1);

    await sut.handle({
      organizationId: 'org-2',
      name: 'Pintura',
      labels: ['x'],
    });
    expect(templates.items).toHaveLength(2);
  });
});

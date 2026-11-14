import { beforeEach, describe, expect, it } from 'vitest';

import { makeInspectionTemplate } from '@test/factory.js';
import { InMemoryInspectionTemplatesRepository } from '@test/repositories/in-memory-inspection-templates-repository.js';
import { FetchInspectionTemplatesUseCase } from '../fetch-inspection-templates.use-case.js';

let templates: InMemoryInspectionTemplatesRepository;
let sut: FetchInspectionTemplatesUseCase;

describe('FetchInspectionTemplatesUseCase', () => {
  beforeEach(() => {
    templates = new InMemoryInspectionTemplatesRepository();
    sut = new FetchInspectionTemplatesUseCase(templates);
  });

  it('template C8 returns 10 then 1 of 11 templates with total 11', async () => {
    for (let day = 1; day <= 11; day++) {
      templates.items.push(
        makeInspectionTemplate({
          name: `Modelo ${day}`,
          createdAt: new Date(2026, 0, day),
        }),
      );
    }
    templates.items.push(
      makeInspectionTemplate({ organizationId: 'org-2', name: 'Outro' }),
    );

    const first = await sut.handle({ organizationId: 'org-1', page: 1 });
    expect(first.total).toBe(11);
    expect(first.inspectionTemplates.map((item) => item.name)).toEqual(
      Array.from({ length: 10 }, (_, index) => `Modelo ${11 - index}`),
    );

    const second = await sut.handle({ organizationId: 'org-1', page: 2 });
    expect(second.total).toBe(11);
    expect(second.inspectionTemplates.map((item) => item.name)).toEqual([
      'Modelo 1',
    ]);
  });

  it('template C8 returns no template and total 0 for an empty Organization', async () => {
    templates.items.push(makeInspectionTemplate({ organizationId: 'org-2' }));

    expect(await sut.handle({ organizationId: 'org-1', page: 1 })).toEqual({
      inspectionTemplates: [],
      total: 0,
    });
  });
});

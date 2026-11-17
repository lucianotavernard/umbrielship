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

    const first = await sut.handle({
      organizationId: 'org-1',
      page: 1,
      perPage: 10,
    });
    expect(first.total).toBe(11);
    expect(first.inspectionTemplates.map((item) => item.name)).toEqual(
      Array.from({ length: 10 }, (_, index) => `Modelo ${11 - index}`),
    );

    const second = await sut.handle({
      organizationId: 'org-1',
      page: 2,
      perPage: 10,
    });
    expect(second.total).toBe(11);
    expect(second.inspectionTemplates.map((item) => item.name)).toEqual([
      'Modelo 1',
    ]);
  });

  it('template C8 returns no template and total 0 for an empty Organization', async () => {
    templates.items.push(makeInspectionTemplate({ organizationId: 'org-2' }));

    expect(
      await sut.handle({ organizationId: 'org-1', page: 1, perPage: 10 }),
    ).toEqual({
      inspectionTemplates: [],
      total: 0,
    });
  });

  it('assignment C14 returns 100 then 1 of 101 templates with perPage 100', async () => {
    for (let index = 0; index < 101; index++) {
      templates.items.push(
        makeInspectionTemplate({
          name: `Modelo ${index}`,
          createdAt: new Date(2026, 0, 1, 0, 0, index),
        }),
      );
    }

    const first = await sut.handle({
      organizationId: 'org-1',
      page: 1,
      perPage: 100,
    });
    expect(first.total).toBe(101);
    expect(first.inspectionTemplates).toHaveLength(100);
    expect(first.inspectionTemplates[0].name).toBe('Modelo 100');

    const second = await sut.handle({
      organizationId: 'org-1',
      page: 2,
      perPage: 100,
    });
    expect(second.inspectionTemplates.map((item) => item.name)).toEqual([
      'Modelo 0',
    ]);
  });

  it('work-order-ui C36 returns every template when no page is given', async () => {
    for (let day = 1; day <= 12; day++) {
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

    const all = await sut.handle({ organizationId: 'org-1' });

    expect(all.total).toBe(12);
    expect(all.inspectionTemplates.map((item) => item.name)).toEqual(
      Array.from({ length: 12 }, (_, index) => `Modelo ${12 - index}`),
    );

    const first = await sut.handle({
      organizationId: 'org-1',
      page: 1,
      perPage: 10,
    });
    expect(first.inspectionTemplates).toHaveLength(10);
    expect(first.total).toBe(12);
  });
});

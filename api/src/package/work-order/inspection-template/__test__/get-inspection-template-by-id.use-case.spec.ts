import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeInspectionTemplate } from '@test/factory.js';
import { InMemoryInspectionTemplatesRepository } from '@test/repositories/in-memory-inspection-templates-repository.js';
import { GetInspectionTemplateByIdUseCase } from '../get-inspection-template-by-id.use-case.js';

let templates: InMemoryInspectionTemplatesRepository;
let sut: GetInspectionTemplateByIdUseCase;

describe('GetInspectionTemplateByIdUseCase', () => {
  beforeEach(() => {
    templates = new InMemoryInspectionTemplatesRepository();
    sut = new GetInspectionTemplateByIdUseCase(templates);
  });

  it('template C9 returns the template with its items', async () => {
    templates.items.push(makeInspectionTemplate({ labels: ['A', 'B'] }, 't1'));

    const { inspectionTemplate } = await sut.handle({
      organizationId: 'org-1',
      id: 't1',
    });

    expect(inspectionTemplate.id).toBe('t1');
    expect(
      inspectionTemplate.items.map(({ label, position }) => [label, position]),
    ).toEqual([
      ['A', 0],
      ['B', 1],
    ]);
  });

  it('template C10 throws NotFoundDomainException for an unknown id and for another Organization', async () => {
    templates.items.push(
      makeInspectionTemplate({ organizationId: 'org-2' }, 't1'),
    );

    await expect(
      sut.handle({ organizationId: 'org-1', id: 't1' }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(
      sut.handle({ organizationId: 'org-1', id: 'unknown' }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);
  });
});

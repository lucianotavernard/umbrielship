import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeInspectionTemplate } from '@test/factory.js';
import { InMemoryInspectionTemplatesRepository } from '@test/repositories/in-memory-inspection-templates-repository.js';
import { DeleteInspectionTemplateUseCase } from '../delete-inspection-template.use-case.js';

let templates: InMemoryInspectionTemplatesRepository;
let sut: DeleteInspectionTemplateUseCase;

describe('DeleteInspectionTemplateUseCase', () => {
  beforeEach(() => {
    templates = new InMemoryInspectionTemplatesRepository();
    sut = new DeleteInspectionTemplateUseCase(templates);
  });

  it('template C7 deletes the template and its items', async () => {
    templates.items.push(
      makeInspectionTemplate({}, 't1'),
      makeInspectionTemplate({ name: 'Solda' }, 't2'),
    );

    await sut.handle({ organizationId: 'org-1', id: 't1' });

    expect(templates.items.map((item) => item.id)).toEqual(['t2']);
    expect(await templates.findById('org-1', 't1')).toBeNull();
  });

  it('template C10 throws NotFoundDomainException for another Organization and deletes nothing', async () => {
    templates.items.push(
      makeInspectionTemplate({ organizationId: 'org-2' }, 't1'),
    );

    await expect(
      sut.handle({ organizationId: 'org-1', id: 't1' }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(
      sut.handle({ organizationId: 'org-1', id: 'unknown' }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);

    expect(templates.items).toHaveLength(1);
  });
});

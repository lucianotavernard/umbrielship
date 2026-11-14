import { beforeEach, describe, expect, it } from 'vitest';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { makeInspectionTemplate } from '@test/factory.js';
import { InMemoryInspectionTemplatesRepository } from '@test/repositories/in-memory-inspection-templates-repository.js';
import { EditInspectionTemplateUseCase } from '../edit-inspection-template.use-case.js';

let templates: InMemoryInspectionTemplatesRepository;
let sut: EditInspectionTemplateUseCase;

const questions = (id: string) =>
  templates.items
    .find((item) => item.id === id)!
    .items.map(({ label, position }) => ({ label, position }));

describe('EditInspectionTemplateUseCase', () => {
  beforeEach(() => {
    templates = new InMemoryInspectionTemplatesRepository();
    sut = new EditInspectionTemplateUseCase(templates);
  });

  it('template C6 replaces the items with the ones sent, renumbered from 0', async () => {
    templates.items.push(
      makeInspectionTemplate(
        { name: 'Pintura', labels: ['A', 'B', 'C'] },
        't1',
      ),
    );

    await sut.handle({
      organizationId: 'org-1',
      id: 't1',
      name: 'Pintura nova',
      labels: ['C', 'A'],
    });

    expect(templates.items[0].name).toBe('Pintura nova');
    expect(questions('t1')).toEqual([
      { label: 'C', position: 0 },
      { label: 'A', position: 1 },
    ]);

    await sut.handle({
      organizationId: 'org-1',
      id: 't1',
      name: 'Pintura nova',
      labels: ['A', 'C'],
    });

    expect(questions('t1')).toEqual([
      { label: 'A', position: 0 },
      { label: 'C', position: 1 },
    ]);
  });

  it('template C5 keeps its own name and refuses the name of another template', async () => {
    templates.items.push(
      makeInspectionTemplate({ name: 'Pintura' }, 't1'),
      makeInspectionTemplate({ name: 'Solda' }, 't2'),
    );

    await sut.handle({
      organizationId: 'org-1',
      id: 't1',
      name: 'PINTURA',
      labels: ['x'],
    });
    expect(templates.items[0].name).toBe('PINTURA');

    await expect(
      sut.handle({
        organizationId: 'org-1',
        id: 't2',
        name: 'pintura',
        labels: ['y'],
      }),
    ).rejects.toBeInstanceOf(AlreadyExistsDomainException);
    expect(templates.items[1].name).toBe('Solda');
    expect(questions('t2').map((item) => item.label)).toEqual([
      'Casco limpo',
      'Pintura sem bolhas',
    ]);
  });

  it('template C10 throws NotFoundDomainException for another Organization and changes nothing', async () => {
    templates.items.push(
      makeInspectionTemplate(
        { organizationId: 'org-2', name: 'Pintura' },
        't1',
      ),
    );

    await expect(
      sut.handle({
        organizationId: 'org-1',
        id: 't1',
        name: 'Outro',
        labels: ['x'],
      }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(
      sut.handle({
        organizationId: 'org-1',
        id: 'unknown',
        name: 'Outro',
        labels: ['x'],
      }),
    ).rejects.toBeInstanceOf(NotFoundDomainException);

    expect(templates.items[0].name).toBe('Pintura');
    expect(questions('t1')).toHaveLength(2);
  });
});

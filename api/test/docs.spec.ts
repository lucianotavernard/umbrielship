import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = join(import.meta.dirname, '..', '..');
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8');

const skillDir = '.cursor/skills/modular-architecture';
const skillFiles = [
  `${skillDir}/SKILL.md`,
  ...readdirSync(join(repoRoot, skillDir, 'references')).map(
    (name) => `${skillDir}/references/${name}`,
  ),
];

const expectAll = (text: string, tokens: string[], where: string) => {
  for (const token of tokens) {
    expect(text.includes(token), `${where} names ${token}`).toBe(true);
  }
};

const expectNone = (text: string, tokens: string[], where: string) => {
  for (const token of tokens) {
    expect(text.includes(token), `${where} still names ${token}`).toBe(false);
  }
};

// A glossary entry is a `**Term**:` line plus its paragraph, up to the next blank line.
const glossaryEntry = (context: string, term: string) => {
  const start = context.indexOf(`**${term}**:`);
  expect(start, `CONTEXT.md defines ${term}`).toBeGreaterThanOrEqual(0);
  const end = context.indexOf('\n\n', start);
  return context.slice(start, end === -1 ? undefined : end);
};

const roadmapItem = (roadmap: string, number: number) => {
  const start = roadmap.indexOf(`## ${number}. `);
  expect(start, `ROADMAP.md has item ${number}`).toBeGreaterThanOrEqual(0);
  const end = roadmap.indexOf('\n## ', start + 1);
  return roadmap.slice(start, end === -1 ? undefined : end);
};

describe('documents follow the acme platform', () => {
  it('[C73] AGENTS.md describes the running stack and the acme layout, and drops the old one', () => {
    const agents = read('AGENTS.md');

    expectAll(
      agents,
      [
        'Redis',
        'Mailpit',
        'REDIS_URL',
        'WEB_ORIGIN',
        'MAIL_HOST',
        'MAIL_PORT',
        'MAIL_FROM',
        'MAIL_USER',
        'MAIL_PASS',
        'npx prisma db seed',
        'Vitest',
        'oxlint',
        'ESM',
        'package/<context>/<aggregate>',
        'organizationId',
        'CustomerFacade',
        'GET /me',
        'Context7',
      ],
      'AGENTS.md',
    );
    expectNone(
      agents,
      [
        'core/interface',
        'core/entity',
        'http/rest',
        'persistence.module',
        'CommonJS',
        'tsc-alias',
        'dist/src/main.js',
        'Jest',
        '/whoami',
        'create the first User by hand',
      ],
      'AGENTS.md',
    );
  });

  it('[C74] CONTEXT.md defines the tenancy terms, keeps the old ones and scopes uniqueness by Organization', () => {
    const context = read('CONTEXT.md');

    for (const term of [
      'Organization',
      'Membership',
      'Role',
      'Invitation',
      'User',
      'Customer',
      'Vessel',
      'IMO number',
      'WorkOrder',
      'WorkOrderService',
      'WorkOrderServiceImage',
    ]) {
      glossaryEntry(context, term);
    }

    expectNone(context, ['MANAGER', 'DEVELOPER'], 'CONTEXT.md');
    expect(glossaryEntry(context, 'IMO number')).toContain(
      'within its Organization',
    );
    expect(glossaryEntry(context, 'Customer')).toContain(
      'within its Organization',
    );
  });

  it('[C75] the modular-architecture skill and the roadmap-execution skill describe the flat layout', () => {
    const skill = skillFiles.map(read).join('\n');

    expectAll(
      skill,
      [
        'package/<context>/<aggregate>',
        'contracts/',
        'I<Plural>Repository',
        '__test__',
        'Facade',
        'organizationId',
        '.js',
        'Vitest',
        'oxlint',
      ],
      'the modular-architecture skill',
    );
    expectNone(
      skill,
      [
        'core/entity',
        'core/interface',
        'core/use-case',
        'http/rest/controller',
        'persistence/repository',
        'persistence.module',
        'PersistenceModule',
        'Jest',
        'CommonJS',
        'tsc-alias',
        'NestJS 11',
      ],
      'the modular-architecture skill',
    );

    expectNone(
      read('.cursor/skills/roadmap-execution/SKILL.md'),
      ['core/', 'persistence/'],
      'the roadmap-execution skill',
    );
  });

  it('[C76] ROADMAP.md marks items 5 and 6 built, keeps item 7 a proposal and drops the old routes', () => {
    const roadmap = read('ROADMAP.md');

    expect(roadmapItem(roadmap, 5)).toMatch(/\*\*Status:\*\* built/);
    expect(roadmapItem(roadmap, 6)).toMatch(/\*\*Status:\*\* built/);
    expect(roadmapItem(roadmap, 7)).not.toMatch(/\*\*Status:\*\*/);
    expect(roadmapItem(roadmap, 7)).toContain('(proposal)');
    expectNone(roadmap, ['/whoami', 'inserted by hand'], 'ROADMAP.md');
  });
});

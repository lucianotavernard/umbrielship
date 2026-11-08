import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const web = path.resolve(import.meta.dirname, '..');
const repo = path.resolve(web, '..');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const srcFiles = () => walk(path.join(web, 'src')).filter((file) => file.endsWith('.ts') || file.endsWith('.html') || file.endsWith('.json'));

test('[C77] Angular packages are on 22', () => {
  const pkg = JSON.parse(read(path.join(web, 'package.json')));
  const names = [
    '@angular/core',
    '@angular/common',
    '@angular/compiler',
    '@angular/forms',
    '@angular/platform-browser',
    '@angular/router',
    '@angular/build',
    '@angular/cli',
    '@angular/compiler-cli',
  ];
  for (const name of names) {
    const range = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];
    assert.match(String(range), /^\^22/, name);
  }
  const installed = JSON.parse(read(path.join(web, 'node_modules/@angular/core/package.json')));
  assert.match(installed.version, /^22\./);
});

test('[C78] each module has a page, components and one @Service()', () => {
  const modules = [
    'customer/customer',
    'customer/vessel',
    'work-order/work-order',
    'work-order/work-order-service',
    'work-order/work-order-service-image',
    'identity/authentication',
    'identity/organization',
    'identity/user',
    'identity/invitation',
  ];
  for (const module of modules) {
    const root = path.join(web, 'src/package', module);
    assert.equal(fs.existsSync(root), true, module);
    assert.equal(fs.existsSync(path.join(root, 'components')), true, `${module} components`);
    const services = fs.readdirSync(root).filter((name) => name.endsWith('.service.ts'));
    assert.deepEqual(services.length, 1, module);
    assert.match(read(path.join(root, services[0])), /@Service\(\)/);
    const pages = fs.readdirSync(root, { withFileTypes: true }).filter(
      (entry) => entry.isDirectory() && entry.name !== 'components' && entry.name !== '__test__',
    );
    assert.ok(pages.length >= 1, `${module} page directory`);
  }
  for (const gone of ['app/customer', 'app/work-order', 'app/identity', 'app/analytics']) {
    assert.equal(fs.existsSync(path.join(web, 'src', gone)), false, gone);
  }
});

test('[C79] shared selectors use the t prefix', () => {
  const angular = JSON.parse(read(path.join(web, 'angular.json')));
  assert.equal(angular.projects.web.prefix, 't');
  const selectors = walk(path.join(web, 'src/package/shared/components/ui'))
    .filter((file) => file.endsWith('.ts'))
    .map(read)
    .join('\n');
  for (const selector of ["'t-sheet'", "'t-pagination'", "'t-confirmation'", "'t-toaster'", "'table[tTable]'", "'button[tButton], a[tButton]'"]) {
    assert.ok(selectors.includes(selector), selector);
  }
  assert.match(selectors, /t-skeleton/);
  const all = srcFiles().map(read).join('\n');
  assert.equal(/selector:\s*[^;\n]*acme/i.test(all), false);
});

test('[C80] no component CSS', () => {
  const files = walk(path.join(web, 'src'));
  const css = files.filter((file) => file.endsWith('.css')).map((file) => path.relative(path.join(web, 'src'), file));
  assert.deepEqual(css, ['styles.css']);
  for (const file of files.filter((item) => item.endsWith('.ts'))) {
    const text = read(file);
    assert.equal(/styleUrls?\s*:/.test(text), false, file);
  }
});

test('[C81] the eight forms use Signal Forms', () => {
  const forms = [
    'src/package/identity/authentication/components/authentication-form.ts',
    'src/package/customer/customer/components/customer-form.ts',
    'src/package/customer/vessel/components/vessel-form.ts',
    'src/package/work-order/work-order/components/work-order-form.ts',
    'src/package/work-order/work-order-service/components/work-order-service-form.ts',
    'src/package/identity/organization/components/organization-form.ts',
    'src/package/identity/user/components/user-form.ts',
    'src/package/identity/invitation/components/invitation-form.ts',
  ];
  for (const form of forms) {
    const text = read(path.join(web, form));
    assert.match(text, /from '@angular\/forms\/signals'/);
    assert.match(text, /\bform\(/);
  }
  for (const file of srcFiles()) {
    const text = read(file);
    assert.equal(text.includes('FormBuilder'), false, file);
    assert.equal(text.includes('NgModel'), false, file);
    assert.equal(text.includes('[(ngModel)]'), false, file);
  }
});

test('[C82] the session read is GET /api/me', () => {
  for (const file of srcFiles()) {
    assert.equal(read(file).toLowerCase().includes('whoami'), false, file);
  }
  const service = read(path.join(web, 'src/package/identity/authentication/authentication.service.ts'));
  assert.match(service, /\/api\/me/);
});

test('[C83] lists are tables with the Portuguese empty copy', () => {
  const lists = [
    ['src/package/customer/customer/components/customer-list.ts', 'Nenhum cliente encontrado'],
    ['src/package/customer/vessel/components/vessel-list.ts', 'Nenhuma embarcação encontrada'],
    ['src/package/work-order/work-order/components/work-order-list.ts', 'Nenhuma ordem de serviço'],
    ['src/package/work-order/work-order-service/components/work-order-service-list.ts', 'Nenhum serviço executado'],
  ];
  for (const [file, copy] of lists) {
    const text = read(path.join(web, file));
    assert.match(text, /tTable/);
    assert.ok(text.includes(copy), copy);
    assert.equal(text.includes('<card'), false, file);
  }
});

test('[C96] AGENTS.md describes the Angular 22 web', () => {
  const text = read(path.join(repo, 'AGENTS.md'));
  for (const phrase of [
    'Angular 22',
    'web/src/package/<context>/<module>/',
    '@Service()',
    'Signal Forms',
    't-',
    'GET /me',
  ]) {
    assert.ok(text.includes(phrase), phrase);
  }
  assert.equal(text.includes('feature/ui/data-access'), false);
  assert.equal(text.toLowerCase().includes('whoami'), false);
});

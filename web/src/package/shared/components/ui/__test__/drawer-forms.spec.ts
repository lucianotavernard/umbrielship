import { OutputRef, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';

import { CustomerForm } from '../../../../customer/customer/components/customer-form';
import { VesselForm } from '../../../../customer/vessel/components/vessel-form';
import { InvitationForm } from '../../../../identity/invitation/components/invitation-form';
import { OrganizationForm } from '../../../../identity/organization/components/organization-form';
import { UserForm } from '../../../../identity/user/components/user-form';
import { AppointmentForm } from '../../../../work-order/agenda/components/appointment-form';
import { AssignToWorkOrderForm } from '../../../../work-order/inspection-assignment/components/assign-to-work-order-form';
import { InspectionAssignmentForm } from '../../../../work-order/inspection-assignment/components/inspection-assignment-form';
import { InspectionTemplateForm } from '../../../../work-order/inspection-template/components/inspection-template-form';
import { WorkOrderServiceForm } from '../../../../work-order/work-order-service/components/work-order-service-form';
import { WorkOrderForm } from '../../../../work-order/work-order/components/work-order-form';

/** A required field that opens empty, and the message its form gives when it is left empty. */
type Field = { selector: string; message: string };
/** A value typed into a field. */
type Step = [selector: string, value: string];
/** What the specs read of a form's state, to know the test reached the state it means to. */
type State = { invalid: () => boolean; touched: () => boolean };

type Row<T = unknown> = {
  name: string;
  component: Type<T>;
  inputs?: Record<string, unknown>;
  /** Every required field that opens empty, with its form's own message. */
  required: Field[];
  /** Typed in order, they leave the form with an invalid value (C34). */
  invalid: Step[];
  /** A valid value for one of the required fields (C37). */
  correct: Step;
  state: (component: T) => State;
  /** The reset or load the page calls when it opens the drawer again (C38). */
  reopen?: (component: T) => void;
};

const row = <T>(spec: Row<T>) => spec as Row;

const orderId = 'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

const rows: Row[] = [
  row({
    name: 'work-order-form',
    component: WorkOrderForm,
    inputs: {
      vessels: [{ id: 'v-aur', name: 'Aurora', customerId: 'c-atl' }],
      customerNames: new Map([['c-atl', 'Pescados Atlântico']]),
    },
    required: [
      { selector: '#wo-vessel', message: 'Embarcação é obrigatória' },
      { selector: '#wo-service-name-0', message: 'Nome do serviço é obrigatório' },
      { selector: '#wo-service-description-0', message: 'Descrição do serviço é obrigatória' },
      { selector: '#wo-start', message: 'Data de início é obrigatória' },
      { selector: '#wo-end', message: 'Data de fim é obrigatória' },
    ],
    invalid: [['#wo-service-description-0', 'x'.repeat(241)]],
    correct: ['#wo-service-name-0', 'Revisão do motor principal'],
    state: (component) => component.workOrderForm(),
    reopen: (component) => component.reset(),
  }),
  row({
    name: 'vessel-form',
    component: VesselForm,
    inputs: {
      customers: [
        {
          id: 'c-atl',
          name: 'Pescados Atlântico',
          email: 'ops@atl.test',
          phone: '1',
          address: { address: 'Rua 1', city: 'Itajaí', state: 'SC' },
        },
      ],
    },
    required: [
      { selector: '#vessel-name', message: 'Nome é obrigatório' },
      { selector: '#customerId', message: 'Cliente é obrigatório' },
      { selector: '#imoNumber', message: 'Número IMO é obrigatório' },
      { selector: '#type', message: 'Tipo é obrigatório' },
      { selector: '#length', message: 'Comprimento é obrigatório' },
    ],
    invalid: [['#vessel-name', 'Aurora']],
    correct: ['#vessel-name', 'Aurora'],
    state: (component) => component.vesselForm(),
    reopen: (component) => component.reset(),
  }),
  row({
    name: 'work-order-service-form',
    component: WorkOrderServiceForm,
    required: [
      { selector: '#svc-name', message: 'Nome é obrigatório' },
      { selector: '#svc-description', message: 'Descrição é obrigatória' },
      { selector: '#svc-start', message: 'Data de início é obrigatória' },
      { selector: '#svc-end', message: 'Data de fim é obrigatória' },
    ],
    invalid: [['#svc-name', 'Pintura do casco']],
    correct: ['#svc-name', 'Pintura do casco'],
    state: (component) => component.serviceForm(),
    reopen: (component) => component.reset(),
  }),
  row({
    name: 'customer-form',
    component: CustomerForm,
    required: [
      { selector: '#name', message: 'Nome é obrigatório' },
      { selector: '#email', message: 'E-mail é obrigatório' },
      { selector: '#phone', message: 'Telefone é obrigatório' },
      { selector: '#address', message: 'Endereço é obrigatório' },
      { selector: '#city', message: 'Cidade é obrigatório' },
      { selector: '#state', message: 'Estado é obrigatório' },
    ],
    invalid: [['#email', 'ana@']],
    correct: ['#name', 'Náutica Costa Sul'],
    state: (component) => component.customerForm(),
    reopen: (component) => component.load(null),
  }),
  row({
    name: 'appointment-form',
    component: AppointmentForm,
    inputs: { workOrders: [{ id: orderId, vesselName: 'Aurora' }] },
    required: [
      { selector: '#appointment-work-order', message: 'Ordem de serviço é obrigatória' },
      { selector: '#appointment-name', message: 'Serviço é obrigatório' },
      { selector: '#appointment-description', message: 'Descrição é obrigatória' },
      { selector: '#appointment-start', message: 'Início é obrigatório' },
      { selector: '#appointment-end', message: 'Fim é obrigatório' },
    ],
    invalid: [['#appointment-name', 'Revisão do motor']],
    correct: ['#appointment-name', 'Revisão do motor'],
    state: (component) => component.appointmentForm(),
    reopen: (component) => component.open(null),
  }),
  row({
    name: 'inspection-template-form',
    component: InspectionTemplateForm,
    required: [
      { selector: '#template-name', message: 'Nome é obrigatório' },
      { selector: '#question-0', message: 'Pergunta é obrigatória' },
    ],
    invalid: [['#template-name', 'A'.repeat(101)]],
    correct: ['#template-name', 'Inspeção do casco'],
    state: (component) => component.templateForm(),
    reopen: (component) => component.reset(),
  }),
  row({
    name: 'assign-to-work-order-form',
    component: AssignToWorkOrderForm,
    inputs: {
      workOrders: [
        {
          id: orderId,
          vesselId: 'v-aur',
          startDate: '2026-11-17T12:00:00.000Z',
          endDate: '2026-11-20T13:00:00.000Z',
          status: 'IN_PROGRESS',
          services: [
            {
              id: 'svc-1',
              name: 'Pintura do casco',
              startDate: '2026-11-17T12:00:00.000Z',
              endDate: '2026-11-20T13:00:00.000Z',
              status: 'PENDING',
            },
          ],
          vesselName: 'Aurora',
          customerName: 'Pescados Atlântico',
        },
      ],
      questionCount: 3,
    },
    required: [{ selector: '#assign-work-order', message: 'Ordem de serviço é obrigatória' }],
    invalid: [
      ['#assign-work-order', orderId],
      ['#assign-work-order', ''],
    ],
    correct: ['#assign-work-order', orderId],
    state: (component) => component.assignForm(),
    reopen: (component) => component.reset(),
  }),
  row({
    name: 'inspection-assignment-form',
    component: InspectionAssignmentForm,
    inputs: {
      templates: [{ id: 't-1', name: 'Inspeção do casco', itemCount: 3, createdAt: '2026-11-01T12:00:00.000Z' }],
      services: [],
    },
    required: [{ selector: '#assignment-template', message: 'Modelo é obrigatório' }],
    invalid: [
      ['#assignment-template', 't-1'],
      ['#assignment-template', ''],
    ],
    correct: ['#assignment-template', 't-1'],
    state: (component) => component.assignmentForm(),
  }),
  row({
    name: 'organization-form',
    component: OrganizationForm,
    required: [
      { selector: '#organization-name', message: 'Nome é obrigatório' },
      { selector: '#organization-email', message: 'E-mail é obrigatório' },
    ],
    invalid: [['#organization-email', 'ana@']],
    correct: ['#organization-name', 'Acme Inc'],
    state: (component) => component.organizationForm(),
    reopen: (component) => component.reset(),
  }),
  row({
    name: 'user-form',
    component: UserForm,
    required: [
      { selector: '#user-name', message: 'Nome é obrigatório' },
      { selector: '#user-email', message: 'E-mail é obrigatório' },
      { selector: '#user-password', message: 'Senha é obrigatória' },
    ],
    invalid: [
      ['#user-name', 'Ana Souza'],
      ['#user-email', 'ana@acme.com'],
      ['#user-password', '12345'],
    ],
    correct: ['#user-name', 'Ana Souza'],
    state: (component) => component.userForm(),
    reopen: (component) => component.reset(),
  }),
  row({
    name: 'invitation-form',
    component: InvitationForm,
    inputs: { users: [{ id: 'u-1', name: 'Ana Souza', email: 'ana@acme.com' }] },
    required: [{ selector: '#invitation-user', message: 'Usuário é obrigatório' }],
    invalid: [
      ['#invitation-user', 'u-1'],
      ['#invitation-user', ''],
    ],
    correct: ['#invitation-user', 'u-1'],
    state: (component) => component.invitationForm(),
    reopen: (component) => component.reset(),
  }),
];

describe('Drawer forms', () => {
  beforeEach(() => {
    // The app's own config: Angular marks the controls ng-touched / ng-invalid, as in the browser.
    TestBed.configureTestingModule({ providers: [provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })] });
  });

  const squash = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();

  async function settle(fixture?: ComponentFixture<unknown>) {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
    await fixture?.whenStable();
  }

  async function mount(spec: Row) {
    const fixture = TestBed.createComponent(spec.component);
    for (const [name, value] of Object.entries(spec.inputs ?? {})) {
      fixture.componentRef.setInput(name, value);
    }
    const emitted: unknown[] = [];
    (fixture.componentInstance as { submitted: OutputRef<unknown> }).submitted.subscribe((value) =>
      emitted.push(value),
    );
    await settle(fixture);
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, emitted, element, form: element.querySelector<HTMLFormElement>('form')! };
  }

  const control = (element: ParentNode, selector: string) => {
    const field = element.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(selector);
    if (!field) throw new Error(`no field ${selector}`);
    return field;
  };

  /** The messages shown in the `t-form-group` of the field `selector`. */
  const messagesUnder = (element: ParentNode, selector: string) =>
    [...control(element, selector).closest('t-form-group')!.querySelectorAll('[data-slot="error"]')].map((error) =>
      squash(error.textContent),
    );

  const saveButton = (element: ParentNode) => element.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  async function type(fixture: ComponentFixture<unknown>, [selector, value]: Step) {
    const field = control(fixture.nativeElement, selector);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    await settle(fixture);
  }

  async function save(fixture: ComponentFixture<unknown>) {
    saveButton(fixture.nativeElement).click();
    await settle(fixture);
  }

  /**
   * Class tokens that paint an element red now, or in the browser once Angular marks it
   * ng-invalid / ng-touched; tokens that wait on `data-invalid`, `aria-invalid` or hover are left out.
   */
  const redTokens = (element: Element) =>
    [...element.classList].filter(
      (token) => token.includes('destructive') && !/aria-invalid|data-\[invalid|\[data-invalid\]|hover:/.test(token),
    );

  /** Every element painted red, except the red `*` marks the drawer always shows. */
  const paintedRed = (form: HTMLElement) =>
    [...form.querySelectorAll('*')]
      .filter((element) => !element.closest('[data-slot="required-mark"], [data-slot="required-hint"]'))
      .filter((element) => redTokens(element).length > 0)
      .map((element) => `${element.tagName.toLowerCase()}#${element.id}: ${redTokens(element).join(' ')}`);

  for (const spec of rows) {
    it(`drawer-standard C34 ${spec.name} keeps the save button enabled while empty and while invalid`, async () => {
      const { fixture, element } = await mount(spec);
      expect(spec.state(fixture.componentInstance).invalid()).toBe(true);
      expect(saveButton(element).disabled).toBe(false);

      for (const step of spec.invalid) {
        await type(fixture, step);
      }
      expect(spec.state(fixture.componentInstance).invalid()).toBe(true);
      expect(saveButton(element).disabled).toBe(false);

      fixture.componentRef.setInput('loading', true);
      await settle(fixture);
      expect(saveButton(element).disabled).toBe(true);

      fixture.componentRef.setInput('loading', false);
      await settle(fixture);
      expect(saveButton(element).disabled).toBe(false);
    });
  }

  for (const spec of rows) {
    it(`drawer-standard C35 ${spec.name} shows no red and no message after a field is left before saving`, async () => {
      const { fixture, form } = await mount(spec);

      for (const { selector } of spec.required) {
        const field = control(form, selector);
        field.focus();
        field.blur();
        field.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        await settle(fixture);
        expect(field.value).toBe('');
      }

      // The fields were left: Angular holds them touched and invalid, as before the drawer standard showed red.
      expect(spec.state(fixture.componentInstance).touched()).toBe(true);
      for (const { selector } of spec.required) {
        expect([...control(form, selector).classList]).toEqual(expect.arrayContaining(['ng-touched', 'ng-invalid']));
      }

      expect(form.querySelectorAll('[data-invalid]')).toHaveLength(0);
      expect(form.querySelectorAll('.border-destructive')).toHaveLength(0);
      expect(form.querySelectorAll('[data-slot="error"]')).toHaveLength(0);
      expect(form.querySelectorAll('t-input-error')).toHaveLength(0);
      for (const label of form.querySelectorAll('label')) {
        expect([...label.classList]).not.toContain('text-destructive');
      }
      expect(paintedRed(form)).toEqual([]);
    });
  }

  for (const spec of rows) {
    it(`drawer-standard C36 ${spec.name} saved empty sends nothing and shows one message under each invalid field`, async () => {
      const { fixture, emitted, form } = await mount(spec);

      await save(fixture);

      expect(emitted).toEqual([]);
      for (const { selector, message } of spec.required) {
        expect(messagesUnder(form, selector)).toEqual([message]);
        const field = control(form, selector);
        expect(field.hasAttribute('data-invalid')).toBe(true);
        expect([...field.classList]).toContain('border-destructive');
      }
      // One message per invalid field and no list of errors anywhere else.
      expect(form.querySelectorAll('[data-invalid]')).toHaveLength(spec.required.length);
      expect(form.querySelectorAll('[data-slot="error"]')).toHaveLength(spec.required.length);
      expect(form.querySelectorAll('t-input-error')).toHaveLength(0);
      expect(form.querySelectorAll('[role="alert"]')).toHaveLength(0);
    });
  }

  it('drawer-standard C36 a short password, ana@ and a 101-character model name speak only under their field', async () => {
    const examples: { spec: string; steps: Step[]; selector: string; message: string }[] = [
      {
        spec: 'user-form',
        steps: [
          ['#user-name', 'Ana Souza'],
          ['#user-email', 'ana@acme.com'],
          ['#user-password', '12345'],
        ],
        selector: '#user-password',
        message: 'Senha deve ter no mínimo 8 caracteres',
      },
      {
        spec: 'customer-form',
        steps: [
          ['#name', 'Náutica Costa Sul'],
          ['#email', 'ana@'],
          ['#phone', '(47) 99999-0000'],
          ['#address', 'Rua das Gaivotas, 100'],
          ['#city', 'Itajaí'],
          ['#state', 'SC'],
        ],
        selector: '#email',
        message: 'E-mail inválido',
      },
      {
        spec: 'inspection-template-form',
        steps: [
          ['#template-name', 'A'.repeat(101)],
          ['#question-0', 'O casco está íntegro?'],
        ],
        selector: '#template-name',
        message: 'Nome deve ter no máximo 100 caracteres',
      },
    ];

    for (const example of examples) {
      const { fixture, emitted, form } = await mount(rows.find((candidate) => candidate.name === example.spec)!);
      for (const step of example.steps) {
        await type(fixture, step);
      }

      await save(fixture);

      expect(emitted).toEqual([]);
      expect(messagesUnder(form, example.selector)).toEqual([example.message]);
      expect([...form.querySelectorAll('[data-slot="error"]')].map((error) => squash(error.textContent))).toEqual([
        example.message,
      ]);
      expect([...form.querySelectorAll('[data-invalid]')]).toEqual([control(form, example.selector)]);
      fixture.destroy();
    }
  });

  for (const spec of rows) {
    it(`drawer-standard C37 ${spec.name} clears a corrected field at once and keeps the others`, async () => {
      const { fixture, form } = await mount(spec);
      await save(fixture);
      expect(form.querySelectorAll('[data-slot="error"]')).toHaveLength(spec.required.length);

      await type(fixture, spec.correct);

      const [corrected] = spec.correct;
      expect(messagesUnder(form, corrected)).toEqual([]);
      expect(control(form, corrected).hasAttribute('data-invalid')).toBe(false);
      expect([...control(form, corrected).classList]).not.toContain('border-destructive');

      const others = spec.required.filter(({ selector }) => selector !== corrected);
      for (const { selector, message } of others) {
        expect(messagesUnder(form, selector)).toEqual([message]);
        expect(control(form, selector).hasAttribute('data-invalid')).toBe(true);
      }
      expect(form.querySelectorAll('[data-slot="error"]')).toHaveLength(others.length);
      expect(form.querySelectorAll('[data-invalid]')).toHaveLength(others.length);
    });
  }

  for (const spec of rows.filter((candidate) => candidate.reopen)) {
    it(`drawer-standard C38 ${spec.name} shows no red and no message after reset`, async () => {
      const { fixture, form } = await mount(spec);
      await save(fixture);
      expect(form.querySelectorAll('[data-slot="error"]')).toHaveLength(spec.required.length);
      expect(form.querySelectorAll('[data-invalid]')).toHaveLength(spec.required.length);

      spec.reopen!(fixture.componentInstance);
      await settle(fixture);

      expect(form.querySelectorAll('[data-invalid]')).toHaveLength(0);
      expect(form.querySelectorAll('[data-slot="error"]')).toHaveLength(0);
      expect(form.querySelectorAll('.border-destructive')).toHaveLength(0);
      expect(paintedRed(form)).toEqual([]);
    });
  }
});

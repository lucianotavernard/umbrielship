import { Component, effect, input, output, signal } from '@angular/core';
import { applyEach, form, FormField, validate } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideClipboardList,
  lucideListChecks,
  lucidePlus,
  lucideTrash,
} from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import {
  DrawerAddButton,
  DrawerBody,
  DrawerCard,
  DrawerEntry,
  DrawerFooter,
  DrawerForm,
  RequiredMark,
} from '../../../shared/components/ui/drawer';
import { FormGroup, Input, Label, Select } from '../../../shared/components/ui/form';
import {
  InspectionTemplate,
  InspectionTemplateRequest,
  MAX_NAME_LENGTH,
  MAX_QUESTION_LENGTH,
  MAX_QUESTIONS,
  QUESTION_TYPES,
  QuestionType,
} from '../inspection-template.service';

type Model = { name: string; items: { label: string; type: QuestionType }[] };

// A new question starts at "Texto livre", as the mareos `makeQuestion`.
const blankQuestion = () => ({ label: '', type: 'TEXT' as QuestionType });

const empty = (): Model => ({ name: '', items: [blankQuestion()] });

// The API trims every text before checking it, so the form checks the trimmed text too.
const blank = (message: string) => ({ value }: { value: () => string }) =>
  value().trim() === '' ? { kind: 'required', message } : undefined;

const longerThan = (limit: number, message: string) => ({ value }: { value: () => string }) =>
  value().trim().length > limit ? { kind: 'maxLength', message } : undefined;

@Component({
  selector: 'inspection-template-form-ui',
  imports: [
    NgIcon,
    FormField,
    FormGroup,
    Label,
    Input,
    Select,
    Button,
    DrawerForm,
    DrawerBody,
    DrawerCard,
    DrawerEntry,
    DrawerAddButton,
    DrawerFooter,
    RequiredMark,
  ],
  viewProviders: [
    provideIcons({ lucideArrowDown, lucideArrowUp, lucideClipboardList, lucideListChecks, lucidePlus, lucideTrash }),
  ],
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <form [tDrawerForm]="shownErrors()" novalidate (submit)="submitForm($event)">
      <t-drawer-body>
        <section tDrawerCard heading="Modelo" subheading="Identifique o modelo de inspeção" icon="lucideClipboardList">
          <t-form-group>
            <label tLabel for="template-name">Nome do modelo <t-required /></label>
            <input
              tInput
              id="template-name"
              type="text"
              placeholder="Ex.: Inspeção do casco"
              [formField]="templateForm.name"
            />
          </t-form-group>
        </section>

        <section
          tDrawerCard
          heading="Perguntas"
          subheading="Todas as perguntas precisam ser respondidas; “Não se aplica” vale como resposta."
          icon="lucideListChecks"
        >
          @for (item of model().items; track $index; let index = $index, first = $first, last = $last) {
            <div tDrawerEntry data-slot="question-editor" [heading]="'Pergunta ' + number(index)">
              @if (model().items.length > 1) {
                <!-- Reordering is the umbrielship's own, shown once there is something to reorder (AD-051). -->
                <div tDrawerEntryActions class="flex items-center gap-1">
                  <button
                    tButton
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    class="size-[26px]"
                    aria-label="Subir"
                    title="Subir"
                    [disabled]="first"
                    (click)="move(index, -1)"
                  >
                    <ng-icon name="lucideArrowUp" class="!size-3.5" />
                  </button>
                  <button
                    tButton
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    class="size-[26px]"
                    aria-label="Descer"
                    title="Descer"
                    [disabled]="last"
                    (click)="move(index, 1)"
                  >
                    <ng-icon name="lucideArrowDown" class="!size-3.5" />
                  </button>
                  <button
                    tButton
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    class="size-[26px] text-[#a27575] hover:bg-[#fbefed] hover:text-destructive"
                    [attr.aria-label]="'Remover pergunta ' + (index + 1)"
                    [title]="'Remover pergunta ' + (index + 1)"
                    (click)="remove(index)"
                  >
                    <ng-icon name="lucideTrash" class="!size-3.5" />
                  </button>
                </div>
              }
              <t-form-group>
                <label tLabel [for]="'question-' + index">Enunciado <t-required /></label>
                <input
                  tInput
                  type="text"
                  [id]="'question-' + index"
                  placeholder="Digite a pergunta"
                  [formField]="templateForm.items[index].label"
                />
              </t-form-group>
              <t-form-group>
                <label tLabel [for]="'question-type-' + index">Tipo de resposta</label>
                <select tSelect [id]="'question-type-' + index" [formField]="templateForm.items[index].type">
                  @for (type of questionTypes; track type) {
                    <option [value]="type">{{ optionLabels[type] }}</option>
                  }
                </select>
              </t-form-group>
            </div>
          }
          <button tDrawerAdd type="button" [disabled]="model().items.length >= maxQuestions" (click)="add()">
            <ng-icon name="lucidePlus" class="!size-3.5" />
            Adicionar pergunta
          </button>
        </section>
      </t-drawer-body>

      <footer
        tDrawerFooter
        [submitLabel]="inspectionTemplate() ? 'Salvar alterações' : 'Criar modelo'"
        [loading]="loading()"
        (cancelled)="closed.emit()"
      ></footer>
    </form>
  `,
})
export class InspectionTemplateForm {
  inspectionTemplate = input<InspectionTemplate | null>(null);
  loading = input(false);

  submitted = output<InspectionTemplateRequest>();
  closed = output<void>();

  /** Errors show once the save button was used (AD-057). */
  protected readonly shownErrors = signal(false);

  protected readonly maxQuestions = MAX_QUESTIONS;
  protected readonly questionTypes = QUESTION_TYPES;
  /** The mareos "Tipo de resposta" options, plus the score the umbrielship also asks (AD-019). */
  protected readonly optionLabels: Record<QuestionType, string> = {
    TEXT: 'Texto livre',
    YES_NO: 'Sim ou não',
    CONFORMITY: 'Conforme / não conforme',
    SCORE: 'Nota de 0 a 10',
  };
  protected readonly number = (index: number) => String(index + 1).padStart(2, '0');

  model = signal<Model>(empty());

  templateForm = form(this.model, (path) => {
    validate(path.name, blank('Nome é obrigatório'));
    validate(
      path.name,
      longerThan(MAX_NAME_LENGTH, `Nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres`),
    );
    applyEach(path.items, (item) => {
      validate(item.label, blank('Pergunta é obrigatória'));
      validate(
        item.label,
        longerThan(MAX_QUESTION_LENGTH, `Pergunta deve ter no máximo ${MAX_QUESTION_LENGTH} caracteres`),
      );
    });
  });

  constructor() {
    effect(() => {
      const template = this.inspectionTemplate();

      if (template) {
        this.model.set({
          name: template.name,
          items: [...template.items]
            .sort((a, b) => a.position - b.position)
            .map((item) => ({ label: item.label, type: item.type })),
        });
      }
    });
  }

  add() {
    this.model.update((model) =>
      model.items.length >= MAX_QUESTIONS
        ? model
        : { ...model, items: [...model.items, blankQuestion()] },
    );
  }

  move(index: number, offset: -1 | 1) {
    this.model.update((model) => {
      const target = index + offset;
      if (target < 0 || target >= model.items.length) return model;

      const items = [...model.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...model, items };
    });
  }

  remove(index: number) {
    this.model.update((model) =>
      model.items.length === 1
        ? model
        : { ...model, items: model.items.filter((_, position) => position !== index) },
    );
  }

  reset() {
    this.shownErrors.set(false);
    this.templateForm().reset(empty());
  }

  submitForm(event: Event) {
    event.preventDefault();
    this.shownErrors.set(true);

    if (this.templateForm().invalid()) {
      return;
    }

    const { name, items } = this.templateForm().value();
    this.submitted.emit({
      name: name.trim(),
      items: items.map((item) => ({ label: item.label.trim(), type: item.type })),
    });
  }
}

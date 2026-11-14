import { randomUUID } from 'crypto';

export const QUESTION_TYPES = [
  'TEXT',
  'YES_NO',
  'CONFORMITY',
  'SCORE',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

// A question as written on a template, and as copied into an assignment.
export type Question = { label: string; type: QuestionType };

export type InspectionTemplateItem = {
  id: string;
  label: string;
  position: number;
  type: QuestionType;
};

export type InspectionTemplateProps = {
  organizationId: string;
  name: string;
  questions: Question[];
  createdAt?: Date;
};

export type RestoredInspectionTemplateProps = {
  organizationId: string;
  name: string;
  items: InspectionTemplateItem[];
  createdAt: Date;
};

// Questions are numbered from 0 in the order given.
const itemsOf = (questions: Question[]): InspectionTemplateItem[] =>
  questions.map(({ label, type }, position) => ({
    id: randomUUID(),
    label,
    position,
    type,
  }));

export class InspectionTemplate {
  id: string;
  organizationId: string;
  name: string;
  createdAt: Date;
  items: InspectionTemplateItem[];

  private constructor(props: RestoredInspectionTemplateProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.createdAt = props.createdAt;
    this.items = [...props.items].sort((a, b) => a.position - b.position);
  }

  static create(props: InspectionTemplateProps, id?: string) {
    return new InspectionTemplate(
      {
        organizationId: props.organizationId,
        name: props.name,
        items: itemsOf(props.questions),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  static restore(props: RestoredInspectionTemplateProps, id: string) {
    return new InspectionTemplate(props, id);
  }

  // An edit replaces the name and every question; nothing references a question (D3).
  replace(name: string, questions: Question[]) {
    this.name = name;
    this.items = itemsOf(questions);
  }
}

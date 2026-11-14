import { randomUUID } from 'crypto';

export type InspectionTemplateItem = {
  id: string;
  label: string;
  position: number;
};

export type InspectionTemplateProps = {
  organizationId: string;
  name: string;
  labels: string[];
  createdAt?: Date;
};

export type RestoredInspectionTemplateProps = {
  organizationId: string;
  name: string;
  items: InspectionTemplateItem[];
  createdAt: Date;
};

// Questions are numbered from 0 in the order given.
const itemsOf = (labels: string[]): InspectionTemplateItem[] =>
  labels.map((label, position) => ({ id: randomUUID(), label, position }));

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
        items: itemsOf(props.labels),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  static restore(props: RestoredInspectionTemplateProps, id: string) {
    return new InspectionTemplate(props, id);
  }

  // An edit replaces the name and every question; nothing references a question (D3).
  replace(name: string, labels: string[]) {
    this.name = name;
    this.items = itemsOf(labels);
  }
}

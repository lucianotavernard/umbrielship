import { Component, effect, input, output, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideWrench } from '@ng-icons/lucide';

import { FormGroup, Label, Input, Combobox } from '@/shared/ui/form';
import { Button } from '@/shared/ui/button';

import type { WorkOrderServiceDto, WorkOrderServiceStatusDto } from '@/work-order/data-access/dto/work-order-service.dto';

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'work-order-service-form-ui',
  templateUrl: './work-order-service-form.html',
  imports: [NgIcon, FormField, FormGroup, Label, Input, Combobox, Button],
  viewProviders: [provideIcons({ lucideLoader2, lucideWrench })],
})
export class WorkOrderServiceFormUi {
  // loading = input(false);
  // mode = input<'create' | 'edit'>('create');
  // service = input<WorkOrderServiceDto | null>(null);

  // closed = output<void>();
  // submitted = output<{
  //   name: string;
  //   description: string;
  //   startDate: string;
  //   endDate: string;
  //   status: WorkOrderServiceStatusDto;
  // }>();

  // statusOptions = signal<{ value: WorkOrderServiceStatusDto; label: string }[]>([
  //   { value: 'PENDING', label: 'Pendente' },
  //   { value: 'IN_PROGRESS', label: 'Em andamento' },
  //   { value: 'COMPLETED', label: 'Concluído' },
  // ]);

  // formState = signal({
  //   name: '',
  //   description: '',
  //   startLocal: '',
  //   endLocal: '',
  //   status: 'PENDING' as WorkOrderServiceStatusDto,
  // });

  // serviceForm = form(this.formState, (path) => {
  //   required(path.name);
  //   required(path.description);
  //   required(path.startLocal);
  //   required(path.endLocal);
  //   required(path.status);
  // });

  // constructor() {
  //   effect(() => {
  //     const svc = this.service();
  //     if (this.mode() === 'edit' && svc) {
  //       this.formState.set({
  //         name: svc.name,
  //         description: svc.description,
  //         startLocal: toDatetimeLocalValue(svc.startDate),
  //         endLocal: toDatetimeLocalValue(svc.endDate),
  //         status: svc.status,
  //       });
  //     }
  //   });
  // }

  // close() {
  //   this.closed.emit();
  //   if (this.mode() === 'create') {
  //     this.formState.set({
  //       name: '',
  //       description: '',
  //       startLocal: '',
  //       endLocal: '',
  //       status: 'PENDING',
  //     });
  //   }
  // }

  // handleSubmit(event: Event) {
  //   event.preventDefault();
  //   const s = this.formState();
  //   this.submitted.emit({
  //     name: s.name,
  //     description: s.description,
  //     startDate: new Date(s.startLocal).toISOString(),
  //     endDate: new Date(s.endLocal).toISOString(),
  //     status: s.status,
  //   });
  // }
}

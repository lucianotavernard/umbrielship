import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal, viewChild } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucidePlus, lucideSearch, lucideShip, lucideX } from '@ng-icons/lucide';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Metric, twoDigits } from '../../../shared/components/ui/metric';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { GetCustomersResponse } from '../../customer/customer.service';
import { VesselForm } from '../components/vessel-form';
import { VesselList as VesselListUI, VesselRow } from '../components/vessel-list';
import { downloadCsv, vesselsCsv } from '../vessel-csv';
import { CreateVesselRequest, GetVesselsResponse, VesselService, vesselTypeLabels } from '../vessel.service';

const fold = (text: string) => text.toLocaleLowerCase('pt-BR');

@Component({
  selector: 'vessel-list',
  imports: [NgIcon, Button, Confirmation, Metric, Sheet, Skeleton, VesselForm, VesselListUI],
  viewProviders: [provideIcons({ lucideDownload, lucidePlus, lucideSearch, lucideShip, lucideX })],
  templateUrl: './vessel-list.html',
})
export class VesselList {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  private readonly vesselService = inject(VesselService);
  private readonly vesselForm = viewChild(VesselForm);

  /** Every Vessel and every Customer of the Organization (AD-023): the join and the search run here. */
  vesselResource = httpResource<GetVesselsResponse>(() => '/api/vessels');
  customerResource = httpResource<GetCustomersResponse>(() => '/api/customers');

  search = signal('');
  selected = signal<ReadonlySet<string>>(new Set());
  submitting = signal(false);
  confirming = signal(false);
  isSheetActive = signal(false);
  isDialogActive = signal(false);

  /** The Vessel the drawer edits; null while it creates one. */
  editing = signal<VesselRow | null>(null);
  selectedVessel = signal<VesselRow | null>(null);

  loading = computed(() => this.vesselResource.isLoading() || this.customerResource.isLoading());
  customers = computed(() => resourceValue(this.customerResource)?.customers ?? []);

  rows = computed<VesselRow[]>(() => {
    const names = new Map(this.customers().map((customer) => [customer.id, customer.name]));
    return (resourceValue(this.vesselResource)?.vessels ?? [])
      .map((vessel) => ({ ...vessel, customerName: names.get(vessel.customerId) ?? '' }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  });

  shown = computed(() => {
    const term = fold(this.search().trim());
    if (!term) return this.rows();
    return this.rows().filter((vessel) =>
      fold([vessel.name, vessel.customerName, vessel.imoNumber, vesselTypeLabels[vessel.type]].join(' ')).includes(
        term,
      ),
    );
  });

  total = computed(() => twoDigits(this.rows().length));
  selectedCount = computed(() => this.selected().size);
  exportLabel = computed(() => {
    const count = this.selectedCount();
    if (count === 0) return 'Selecione embarcações para exportar';
    if (count === 1) return 'Exportar 1 embarcação selecionada em CSV';
    return `Exportar ${count} embarcações selecionadas em CSV`;
  });

  toggle(id: string) {
    this.selected.update((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Selects every row shown, or clears them when they are all selected already. */
  toggleShown() {
    const shown = this.shown().map((vessel) => vessel.id);
    this.selected.update((current) => {
      const next = new Set(current);
      const all = shown.length > 0 && shown.every((id) => next.has(id));
      for (const id of shown) {
        if (all) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  /** Exports every selected Vessel, the ones the search hides included. */
  exportSelected() {
    const selected = this.selected();
    const rows = this.rows().filter((vessel) => selected.has(vessel.id));
    if (!rows.length) return;
    downloadCsv('embarcacoes.csv', vesselsCsv(rows));
  }

  openCreate() {
    this.editing.set(null);
    this.vesselForm()?.reset();
    this.isSheetActive.set(true);
    this.vesselForm()?.focusName();
  }

  /** Every opening shows the Vessel's values, also after a Cancelar that left typed ones. */
  openEdit(vessel: VesselRow) {
    this.editing.set(vessel);
    this.vesselForm()?.load(vessel);
    this.isSheetActive.set(true);
    this.vesselForm()?.focusName();
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  openDialog(vessel: VesselRow) {
    this.selectedVessel.set(vessel);
    this.isDialogActive.set(true);
  }

  closeDialog() {
    this.selectedVessel.set(null);
    this.isDialogActive.set(false);
  }

  saveVessel(vessel: CreateVesselRequest) {
    const editing = this.editing();
    this.submitting.set(true);

    const request = editing
      ? this.vesselService.updateVessel(editing.id, {
          customerId: editing.customerId,
          name: vessel.name,
          type: vessel.type,
          length: vessel.length,
        })
      : this.vesselService.createVessel(vessel);

    request.subscribe({
      next: () => {
        if (editing) {
          toast.success('Embarcação atualizada com sucesso', {
            description: 'A embarcação foi atualizada com sucesso.',
          });
        } else {
          toast.success('Embarcação criada com sucesso', {
            description: 'A embarcação foi criada com sucesso.',
          });
          this.search.set('');
        }
        this.submitting.set(false);
        this.closeSheet();
        this.editing.set(null);
        this.vesselResource.reload();
      },
      error: (response) => {
        // The drawer stays open with what was typed.
        toast.error(editing ? 'Erro ao atualizar embarcação' : 'Erro ao criar embarcação', {
          description: apiErrorMessage(
            response,
            editing ? 'Ocorreu um erro ao atualizar a embarcação.' : 'Ocorreu um erro ao criar a embarcação.',
          ),
        });
        this.submitting.set(false);
      },
    });
  }

  deleteVessel() {
    const vessel = this.selectedVessel();
    if (!vessel) return;
    this.confirming.set(true);

    this.vesselService.deleteVessel(vessel.id).subscribe({
      next: () => {
        this.confirming.set(false);
        this.closeDialog();
        this.selected.update((current) => {
          const next = new Set(current);
          next.delete(vessel.id);
          return next;
        });
        this.vesselResource.reload();
        toast.success('Embarcação excluída com sucesso', {
          description: 'A embarcação foi excluída com sucesso.',
        });
      },
      error: (response) => {
        this.confirming.set(false);
        this.closeDialog();
        toast.error('Erro ao excluir embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir a embarcação.'),
        });
      },
    });
  }
}

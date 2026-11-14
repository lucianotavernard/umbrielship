import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';


import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail, lucidePhone, lucidePencil, lucideTrash, lucideArrowLeft, lucideMapPin, lucidePlus } from '@ng-icons/lucide';

import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { Button } from '../../../shared/components/ui/button';
import { Confirmation } from '../../../shared/components/ui/confirmation';
import { Pagination } from '../../../shared/components/ui/pagination';
import { Sheet } from '../../../shared/components/ui/sheet';
import { toast } from '../../../shared/components/ui/toaster';
import { VesselForm } from '../../vessel/components/vessel-form';
import { CustomerDetail as CustomerDetailUI } from '../components/customer-detail';
import { VesselList as VesselListUI } from '../../vessel/components/vessel-list';
import {
  CreateVesselRequest,
  GetVesselsResponse,
  Vessel,
  VesselService,
} from '../../vessel/vessel.service';
import { Customer, CustomerService, UpdateCustomerRequest } from '../customer.service';
import { CustomerForm } from '../components/customer-form';

@Component({
  selector: 'customer-detail',
  imports: [
    NgIcon,
    RouterLink,
    Button,
    Confirmation,
    Pagination,
    Sheet,
    CustomerForm,
    CustomerDetailUI,
    VesselForm,
    VesselListUI,
  ],
  viewProviders: [provideIcons({ lucideMapPin, lucideArrowLeft,  lucidePlus, lucideMail, lucidePhone, lucidePencil, lucideTrash })],
  templateUrl: './customer-detail.html',
})
export class CustomerDetail {
  sanitizer = inject(DomSanitizer);
  vesselService = inject(VesselService);
  customerService = inject(CustomerService);
  
  id = input.required<string>();
  customer = input.required<Customer>();

  vesselsResource = httpResource<GetVesselsResponse>(() => `/api/vessels?customerId=${this.id()}&page=${this.page()}`);

  page = signal(1);
  submitting = signal(false);
  confirming = signal(false);
  isEditCustomerSheetActive = signal(false);
  isCreateVesselSheetActive = signal(false);
  isDeleteVesselDialogActive = signal(false);
  
  selectedVessel = signal<Vessel | null>(null);

  loading = computed(() => this.vesselsResource.isLoading());
  vessels = computed(() => this.vesselsResource.hasValue() ? this.vesselsResource.value()?.vessels ?? [] : []);
  totalVessels = computed(() => this.vesselsResource.hasValue() ? this.vesselsResource.value()?.total ?? 0 : 0);

  mapEmbedSrc = computed((): SafeResourceUrl | null => {
    const customer = this.customer();
    if (!customer.address) {
      return null;
    }

    const { address, city, state } = customer.address;
    if (!address?.trim() && !city?.trim()) {
      return null;
    }

    const parts = [address?.trim(), city?.trim(), state?.trim(), 'Brasil'].filter(Boolean);
    const url = `https://www.google.com/maps?q=${encodeURIComponent(parts.join(', '))}&output=embed&z=16`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  openCreateVesselSheet() {
    this.isCreateVesselSheetActive.set(true);
  }

  closeCreateVesselSheet() {
    this.isCreateVesselSheetActive.set(false);
  }

  openEditCustomerSheet() {
    this.isEditCustomerSheetActive.set(true);
  }

  closeEditCustomerSheet() {
    this.isEditCustomerSheetActive.set(false);
  } 

  openDeleteVesselDialog(vessel: Vessel) {
    this.selectedVessel.set(vessel);
    this.isDeleteVesselDialogActive.set(true);
  }

  closeDeleteVesselDialog() {
    this.isDeleteVesselDialogActive.set(false);
    this.selectedVessel.set(null);
  }

  editCustomer(customer: UpdateCustomerRequest) {
    this.submitting.set(true);
    this.customerService.updateCustomer(this.id(), customer).subscribe({
      next: () => {
        toast.success('Embarcação criada com sucesso', {
          description: 'A embarcação foi criada com sucesso.',
        });
        this.closeEditCustomerSheet();
        this.vesselsResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar a embarcação.'),
        });
      },
    });
  }

  createVessel(vessel: CreateVesselRequest) {
    this.vesselService.createVessel(vessel).subscribe({
      next: () => {
        toast.success('Embarcação criada com sucesso', {
          description: 'A embarcação foi criada com sucesso.',
        });
        this.closeCreateVesselSheet();
        this.vesselsResource.reload();
      },
      error: (response) => {
        toast.error('Erro ao criar embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao criar a embarcação.'),
        });
      },
    });
  } 

  deleteVessel() {
    this.confirming.set(true);

    const vessel = this.selectedVessel();
    this.vesselService.deleteVessel(vessel!.id).subscribe({
      next: () => {
        this.vesselsResource.reload();
        this.closeDeleteVesselDialog();

        toast.success('Embarcação excluída com sucesso', {
          description: 'A embarcação foi excluída com sucesso.',
        });
      },
      error: (response) => {
        toast.error('Erro ao excluir embarcação', {
          description: apiErrorMessage(response, 'Ocorreu um erro ao excluir a embarcação.'),
        });
      },
    });
  }
}

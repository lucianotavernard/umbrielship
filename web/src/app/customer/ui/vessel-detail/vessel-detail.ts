import { Component, computed, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShip, lucidePencil, lucideIdCard, lucideBuilding2 } from '@ng-icons/lucide';

import { VesselDto } from '@/customer/data-access/dto/vessel.dto';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';

@Component({
  selector: 'vessel-detail-ui',
  templateUrl: './vessel-detail.html',
  imports: [NgIcon, Skeleton, Button],
  viewProviders: [provideIcons({ lucideShip, lucidePencil, lucideIdCard, lucideBuilding2 })],
})
export class VesselDetailUi {
  vessel = input.required<VesselDto | null>();

  loading = input(false);

  edited = output<void>();

  editVessel() {
    this.edited.emit();
  }

  getVesselAvatar(vessel: VesselDto) {
    const [firstName, lastName = ''] = vessel.name.split(' ');
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }

  getVesselType(type: string) {
    const labels = {
      CARGO: 'Embarcação de Carga',
      TANKER: 'Embarcação Tanque',
      PASSENGER: 'Embarcação de Passageiros',
      FISHING: 'Embarcação Pesqueira',
      BULK_CARRIER: 'Embarcação de Carga em Massa',
      CONTAINER: 'Embarcação de Container',
      OTHER: 'Outro',
    };

    return labels[type as keyof typeof labels];
  }
}

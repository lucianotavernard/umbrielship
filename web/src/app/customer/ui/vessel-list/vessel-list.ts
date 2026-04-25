import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideMapPin,
  lucideTrash2,
  lucideShip,
  lucideFlag,
  lucideShipWheel,
  lucideRuler,
} from '@ng-icons/lucide';

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { VesselDto } from '@/customer/data-access/dto/vessel.dto';

@Component({
  selector: 'vessel-list-ui',
  templateUrl: './vessel-list.html',
  imports: [RouterLink, NgIcon, Button, Skeleton],
  viewProviders: [
    provideIcons({
      lucideBuilding2,
      lucideMapPin,
      lucideTrash2,
      lucideShip,
      lucideFlag,
      lucideShipWheel,
      lucideRuler,
    }),
  ],
})
export class VesselListUi {
  loading = input(true);
  vessels = input<VesselDto[]>([]);

  deleted = output<VesselDto>();

  deleteVessel(vessel: VesselDto) {
    this.deleted.emit(vessel);
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

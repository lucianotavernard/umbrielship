import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin, lucideTrash2, lucideShip } from '@ng-icons/lucide';

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { VesselDto } from '@/customer/data-access/dto/vessel.dto';

@Component({
  selector: 'vessel-list-ui',
  templateUrl: './vessel-list.html',
  imports: [RouterLink, NgIcon, Button, Skeleton],
  viewProviders: [provideIcons({ lucideBuilding2, lucideMapPin, lucideTrash2, lucideShip })],
})
export class VesselListUi {
  loading = input(true);
  vessels = input<VesselDto[]>([]);

  deleted = output<VesselDto>();

  deleteVessel(vessel: VesselDto) {
    this.deleted.emit(vessel);
  }
}

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

  avatar = computed(() => {
    const vessel = this.vessel();
    const [firstName, lastName] = vessel ? vessel.name.split(' ') : [];
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  });

  editVessel() {
    this.edited.emit();
  }
}

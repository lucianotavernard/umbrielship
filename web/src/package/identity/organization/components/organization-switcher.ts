import { Component, computed, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

import { Button } from '../../../shared/components/ui/button';
import { MeOrganization } from '../../authentication/authentication.service';
import { roleLabels } from '../../user/user.service';

@Component({
  selector: 'organization-switcher-ui',
  imports: [Button],
  template: `
    @if (organizations().length > 1) {
      <div class="relative">
        <button
          tButton
          type="button"
          variant="ghost"
          aria-haspopup="menu"
          [attr.aria-expanded]="isOpen()"
          (click)="isOpen.set(!isOpen())"
        >
          {{ active()?.name }}
        </button>

        @if (isOpen()) {
          <div
            role="menu"
            class="absolute right-0 z-20 mt-2 flex w-64 origin-top-right flex-col rounded-md bg-popover p-1 shadow-lg ring-1 ring-foreground/10"
          >
            @for (organization of organizations(); track organization.id) {
              <button
                tButton
                type="button"
                role="menuitem"
                variant="ghost"
                class="w-full justify-between"
                [class.bg-accent]="organization.id === activeId()"
                (click)="pick(organization.id)"
              >
                <span>{{ organization.name }}</span>
                <span class="text-xs text-muted-foreground">{{ roleLabels[organization.role] }}</span>
              </button>
            }
          </div>
        }
      </div>
    } @else if (active(); as organization) {
      <span class="px-3 text-sm font-medium">{{ organization.name }}</span>
    }
  `,
})
export class OrganizationSwitcher {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  organizations = input<MeOrganization[]>([]);
  activeId = input<string>('');
  picked = output<string>();

  isOpen = signal(false);

  active = computed(
    () => this.organizations().find((organization) => organization.id === this.activeId()) ?? null,
  );

  protected readonly roleLabels = roleLabels;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (event.target instanceof Node && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  pick(organizationId: string) {
    this.isOpen.set(false);
    if (organizationId === this.activeId()) return;
    this.picked.emit(organizationId);
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import { UserResponseDto } from '@/identity/data-access/dto/auth.dto';
import { AuthService } from '@/identity/data-access/service/auth.service';

@Component({
  selector: 'internal-layout',
  templateUrl: './internal-layout.html',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    Button,
    Skeleton,
    Avatar,
    AvatarImage,
    AvatarFallback,
  ],
  viewProviders: [provideIcons({ lucideMoon, lucideSun })],
})
export class InternalLayout {
  private readonly authService = inject(AuthService);

  private readonly userResource = httpResource<UserResponseDto>(() => `/api/whoami`);

  isDarkMode = signal(!!document.documentElement.classList.contains('dark'));
  isMenuOpen = signal(false);

  user = computed(() => this.userResource.value()?.user ?? null);
  loading = computed(() => this.userResource.isLoading());

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  toggleDarkMode() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      this.isDarkMode.set(false);
      localStorage.setItem('@umbriel:theme', 'light');
    } else {
      html.classList.add('dark');
      this.isDarkMode.set(true);
      localStorage.setItem('@umbriel:theme', 'dark');
    }
  }

  handleLogout() {
    this.authService.logout();
    window.location.reload();
  }
}

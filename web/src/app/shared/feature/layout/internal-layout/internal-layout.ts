import { Component, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';

import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import { UserResponseDto } from '@/identity/data-access/dto/auth.dto';

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
  private readonly userResource = httpResource<UserResponseDto>(() => `/api/whoami`);

  isDarkMode = signal(!!document.documentElement.classList.contains('dark'));

  user = computed(() => this.userResource.value()?.user ?? null);
  loading = computed(() => this.userResource.isLoading());

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
}

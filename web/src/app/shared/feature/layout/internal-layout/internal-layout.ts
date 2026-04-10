import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Avatar } from '../../../ui/avatar/avatar';
import { AvatarImage } from '../../../ui/avatar/avatar-image';
import { AvatarFallback } from '../../../ui/avatar/avatar-fallback';

@Component({
  selector: 'internal-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Avatar, AvatarImage, AvatarFallback],
  templateUrl: './internal-layout.html',
})
export class InternalLayout {
  
}

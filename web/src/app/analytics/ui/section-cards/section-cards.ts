import { Component } from '@angular/core';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

@Component({
  selector: 'section-cards',
  templateUrl: './section-cards.html',
  imports: [Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter, Badge],
})
export class SectionCards {}

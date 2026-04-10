import { Component } from '@angular/core';

import { Card, CardContent, CardDescription, CardHeader } from '@/shared/ui/card';
import { SectionCards } from '@/analytics/ui/section-cards/section-cards';

@Component({
  selector: 'analytics-dashboard',
  templateUrl: './dashboard.html',
  imports: [SectionCards, Card, CardHeader, CardDescription, CardContent],
})
export class Dashboard {}

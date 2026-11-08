import { Component } from '@angular/core';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';

@Component({
  selector: 'dashboard',
  imports: [Card, CardHeader, CardTitle, CardDescription, CardContent],
  templateUrl: './dashboard.html',
})
export class Dashboard {}

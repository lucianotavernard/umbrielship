import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app.config';
import { App } from './app';
import { restoreTheme } from './package/shared/components/lib/theme';

restoreTheme();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

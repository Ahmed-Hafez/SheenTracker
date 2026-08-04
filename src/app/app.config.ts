import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';

import { routes } from './app.routes';
import { PrimeNG_Preset } from '../primeng-preset';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// Custom build — only import what you need (Angular 19+)
import * as echarts from 'echarts/core';
import { provideEchartsCore } from 'ngx-echarts';
import { BarChart, GaugeChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
import { authInterceptor } from './core/interceptors/auth.interceptor';

echarts.use([
  BarChart,
  PieChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  SVGRenderer,
  CanvasRenderer,
]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
    provideEchartsCore({ echarts }),

    MessageService,
    providePrimeNG({
      theme: {
        preset: PrimeNG_Preset,
        options: {
          darkModeSelector: false || 'none',
        },
      },
    }),
  ],
};

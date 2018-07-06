import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { MonitorComponent } from './components/monitor/monitor.component';
import { MonitorPageComponent } from './pages/monitor-page/monitor-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';

const routes: Routes = [
  { path: 'monitor/:fab', component: MonitorPageComponent,  },
  { path: 'monitor', component: MonitorPageComponent,  },
  { path: 'layout', component: LayoutPageComponent,  },
  { path: '', redirectTo: 'monitor', pathMatch: 'full' }
];

const config: ExtraOptions = {
  useHash: true,
  enableTracing: false
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [
    RouterModule,
  ],
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { MonitorComponent } from './components/monitor/monitor.component';
import { MonitorPageComponent } from './pages/monitor-page/monitor-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { AlwaysAuthGuard } from './auth/always-auth.guard';
import { AuthenticateComponent } from './pages/authenticate/authenticate.component';
// import { InitializeComponent } from './components/initialize/initialize.component';

const routes: Routes = [
  // { path: 'initialize',
  //   component: InitializeComponent, },
  { path: 'authenticate',
    component: AuthenticateComponent, },
  { path: 'monitor/:fab',
    canActivate: [AlwaysAuthGuard],
    component: MonitorPageComponent,  },
  { path: 'monitor/:fab/:layout',
    canActivate: [AlwaysAuthGuard],
    component: MonitorPageComponent,  },
  { path: 'monitor', component: MonitorPageComponent,
    canActivate: [AlwaysAuthGuard],
  },
  { path: 'layout', component: LayoutPageComponent,
    canActivate: [AlwaysAuthGuard],
  },
  { path: 'layout/:fab', component: LayoutPageComponent,
    canActivate: [AlwaysAuthGuard],
  },
  { path: '', redirectTo: '/authenticate', pathMatch: 'full',
    canActivate: [AlwaysAuthGuard],
  }
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

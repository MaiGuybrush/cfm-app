import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // { path: '', redirectTo: '', pathMatch: 'full' }
]

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

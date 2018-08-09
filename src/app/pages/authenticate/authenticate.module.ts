import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticateComponent } from './authenticate.component';
import { BlockUIModule } from 'primeng/blockui';


@NgModule({
  imports: [
    CommonModule,
    BlockUIModule
  ],
  exports: [
    AuthenticateComponent
  ],
  declarations: [AuthenticateComponent]
})
export class AuthenticateModule { }

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { InxAuthJwtLibModule } from 'inx-auth-jwt-lib';
import { AuthenticateComponent } from './authenticate.component';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

@NgModule({
  imports: [
    CommonModule,
    InxAuthJwtLibModule,
    FormsModule,
    MDBBootstrapModule.forRoot(),
    ReactiveFormsModule
  ],
  exports: [
    AuthenticateComponent
  ],
  declarations: [
    AuthenticateComponent,
    LoginFormComponent,
  ]
})
export class AuthenticateModule { }

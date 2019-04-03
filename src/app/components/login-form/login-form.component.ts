import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef,
                AfterViewInit, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthData, UserService } from 'inx-auth-jwt-lib';
import { ModalDirective } from 'angular-bootstrap-md';
import { Router } from '@angular/router';
import { trigger } from '@angular/animations';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit, OnChanges, AfterViewInit {
  loginFormModalID = new FormControl('', Validators.required);
  loginFormModalPassword = new FormControl('', Validators.required);
  @ViewChild('frame') public showModalOnClick: ModalDirective;
  authFail = false;
  errorMessage = "";
  @ViewChild("loginBtn") loginBtn: ElementRef;

  @Output() summit = new EventEmitter<AuthData>();

  @Input()
  showModal: boolean;

  constructor(private user: UserService, private router: Router) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngAfterViewInit(): void {
    if (!(this.user && this.user.currentUser)) {
      this.showModalOnClick.show();
    }
  }

  onKeydown(event) {
    if (event.key === "Enter") {
      console.log(event);
      this.loginBtn.nativeElement.dispatchEvent(new MouseEvent('click'));
    }
  }

  loginSummit(): void {
    const authData = {
      id: this.loginFormModalID.value,
      password: this.loginFormModalPassword.value
    };

    this.user.authenticate(authData).subscribe(m => {
      this.showModalOnClick.hide();
      this.router.navigate(['/alarm']);
    },
    e => {
      this.authFail = true;
      this.errorMessage = "帳號或密碼錯誤，請重新輸入";
    });
  }
}

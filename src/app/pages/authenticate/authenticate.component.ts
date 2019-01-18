import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Location } from '@angular/common';
import { LocalConfigService } from '../../services/local-config.service';
// import { Connection } from '../../../services/common'

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent implements OnInit {
  @Input() certKey: string;
  err: string;
  blocked = false;
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private httpClient: HttpClient,
    private userService: UserService, private localConfig: LocalConfigService) {
  }

  ngOnInit() {
    // console.log("authenticate ngOnInit");
    // console.log(document.URL);
    // this.activatedRouter.paramMap.subscribe(params => console.log("params", params.get('CertificateKey')))
    // var url = this.userService.parseURL(document.URL);
    // console.log(url.searchObject);
    // let certKey = url.searchObject["CertificateKey"];
    // let ssoTicket = this.userService.getCookie("SsoTicket");
    console.log('authenticate init');
    this.activatedRoute.params.subscribe(params => {


      const certKey = this.activatedRoute.snapshot.queryParams['CertificateKey'] ?
      decodeURIComponent(this.activatedRoute.snapshot.queryParams['CertificateKey']) : null;
      const ssoTicket = this.userService.getSsoTicket();
      const returnUrl = this.activatedRoute.snapshot.queryParams['url'] ?
      decodeURIComponent(this.activatedRoute.snapshot.queryParams['url']) : null;


      // if (this.userService.checkDomainName() === false && JSON.parse(localStorage.getItem('currentUser')) === null) {
      //   this.userService.logInforGuset();
      // }
      // else
      if (certKey && ssoTicket) {
        // certKey = decodeURIComponent(certKey);
        // console.log("certKey: " + certKey)
        // console.log("ssoTicket: " + ssoTicket)

        // this.blocked = true;
        this.userService.logIn(certKey, ssoTicket).subscribe(
            res => {
            this.localConfig.init().subscribe(m => {
              if (returnUrl) {
                console.log('returnUrl:' + returnUrl);
                const url = returnUrl;
                this.router.navigateByUrl(url);
              } else {
                this.router.navigate(['/monitor']);
              }
            });
//            localStorage["currentUser"] = JSON.stringify(res);
            // this.userService.setUser(res.ticketInfo);
            // this.location.back();
            // this.blocked = false;
          },
          err => {
            console.log('login error:', err);
            this.userService.logOut();
          });


      } else {
        // window.location.href = 'http://inlcnws.cminl.oa/InxSSO/Logon.aspx?url=' +
        // encodeURI("http://c3c003469n.cminl.oa:4200/#/pages/authenticate");
        // localStorage.removeItem('currentUser');
        this.userService.redirectToSso();
        // Connection.redirectToSso();
      }
    });
  }

}




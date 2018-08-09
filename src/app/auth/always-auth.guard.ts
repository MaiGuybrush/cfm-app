import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { UserService } from "../services/user.service";
import { NgModule } from "@angular/core";

@NgModule({
  imports: [
      // UserService,
  ]
})
export class AlwaysAuthGuard implements CanActivate {
    constructor(private router: Router, private userService: UserService) { };

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

      // let ssoTicket = this.userService.getCookie("SsoTicket");
      // console.log('privagte-guard ssoTicket:', ssoTicket);
      let ssoTicket = this.userService.getSsoTicket();
      if (ssoTicket != null) {
          // logged in so return true
          if (!this.userService.isAuthenticated()) {
              this.router.navigate(['/authenticate'], {queryParams: {'url': state.url}});
              // let certKey = this.userService.getCertificateKey();
              // this.userService.logIn(certKey, ssoTicket);
          }
          return true;
      }

      else {
          // localStorage.removeItem('currentUser');
          //window.location.href = 'http://inlcnws.cminl.oa/InxSSO/Logon.aspx?url=' + encodeURI(document.URL);
          this.router.navigate(['/authenticate'], {queryParams: {'url': state.url}});
          // Connection.redirectToSso();
          // not logged in so redirect to login page
          return false;
      }
    }
  }
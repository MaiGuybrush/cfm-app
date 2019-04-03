import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { UserService } from 'inx-auth-jwt-lib';
import { NgModule } from "@angular/core";

@NgModule({
  imports: [
      // UserService,
  ]
})
export class AlwaysAuthGuard implements CanActivate {
    constructor(private router: Router, private userService: UserService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        // let ssoTicket = this.userService.getCookie("SsoTicket");
        // console.log('privagte-guard ssoTicket:', ssoTicket);
        // logged in so return true
        if (!this.userService.isAuthenticated()) {
            this.router.navigate(['/authenticate'], {queryParams: {'url': state.url}});
            return false;
        }
        return true;
    }
}

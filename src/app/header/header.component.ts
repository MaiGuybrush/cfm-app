import { Component, OnInit, Input } from '@angular/core';
import { NavMenuItem } from '../models/model.ui';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, ActivationEnd } from '@angular/router';
import { ServerConfigService } from '../services/server-config.service';
import { Observable } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';
import { SyncService } from '../services/sync.service';
import { UserService } from '../services/user.service';
import { LocalConfigService } from '../services/local-config.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() menuItems: NavMenuItem[] = [];
  @Input() fabList: string[];
  currentFab: string;
  urlSegment0: string;
  pictureUrl: string;
  loading = false;
  constructor(public activatedRoute: ActivatedRoute, private router: Router, private localConfig: LocalConfigService
            , private syncService: SyncService, private userService: UserService, private serverConfig: ServerConfigService) {
  }

  ngOnInit() {
    this.router.events.subscribe(m => {
      if (m instanceof ActivationEnd) {
        this.currentFab = m.snapshot.params['fab'];
        this.urlSegment0 = m.snapshot.url[0].path;
      }
    });

    this.localConfig.configSubject.subscribe(m => {
      this.currentFab = m.currentFab;
    });

    this.serverConfig.getFabList().subscribe(m => {
      this.fabList = m;
      this.localConfig.fabList = m;
    });
    this.userService.currentUserSubject.subscribe(res => {
      if (res) {
        this.userService.currentUserSubject.subscribe(m => {
          console.log("header catch user changed.")
          this.pictureUrl = 'http://jnpmdd01.cminl.oa/employee_pic/' + m.EmployeeId + '.jpg';
        });
      }
    });


  }

  selectFab(event: any, fab: string) {
    console.log("selectFab clicked!");
    if (fab !== this.currentFab) {
      this.router.navigate([this.urlSegment0 + '/' + fab
      , {}]);
    }
  }


  signOut(event: any) {
    this.userService.logOut();
  }
}

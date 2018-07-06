import { Component, OnInit, Input } from '@angular/core';
import { NavMenuItem } from '../models/model.ui';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ServerConfigService } from '../services/server-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SyncService } from '../services/sync.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() menuItems: NavMenuItem[] = [];
  fabList: Observable<string[]>;
  currentFab: Observable<string>;
  constructor(public activatedRoute: ActivatedRoute, private router: Router, private serverConfig: ServerConfigService
            , private syncService: SyncService) {
  }

  ngOnInit() {
    this.currentFab = this.syncService.getObservableStatus().pipe(map(m => m ? m.fab : ''));
    this.fabList = this.serverConfig.getFabList();
  }

}

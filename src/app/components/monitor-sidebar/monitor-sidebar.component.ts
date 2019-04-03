import { Component, OnInit, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LocalConfigService } from '../../services/local-config.service';
import { ServerConfigService } from '../../services/server-config.service';
import { ValueTransformer } from '../../../../node_modules/@angular/compiler/src/util';
import { validateConfig } from '../../../../node_modules/@angular/router/src/config';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-monitor-sidebar',
  templateUrl: './monitor-sidebar.component.html',
  styleUrls: ['./monitor-sidebar.component.css']
})
export class MonitorSidebarComponent implements OnInit {
  @Input() model: MenuItem[];
  loading: boolean;
  visibleSideBar: boolean;
  constructor(private localConfig: LocalConfigService, private router: Router, private serverConfig: ServerConfigService) { }

  ngOnInit() {
    this.localConfig.fabSubject.subscribe(m => {
      if (m) {
        this.loading = true;
        this.model = [];
        this.serverConfig.getLayoutList(m, "").subscribe(layouts => {
          this.model = layouts.map((value, index, array) => {
            return {
              label: value,
              command: this.handleMenuClicked,
              routerLink: '/monitor/' + m + '/' + value,
              queryParams: {'shop': value.split('_')[0]}
            };
          });
          this.loading = false;
        });
      }
    });
  }

  handleMenuClicked(event?: any) {
    console.log('menu click');
    console.log(event);
    this.router.navigate(['/monitor/' + event],
      { queryParams: { 'shop': event.split('_')[0] }})
  }

  menuClicked() {

  }

}

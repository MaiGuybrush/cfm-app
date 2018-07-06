import { Component, OnInit } from '@angular/core';
import { ServerConfigService } from '../../services/server-config.service';
import { ActivatedRoute } from '@angular/router';
import { SyncService } from '../../services/sync.service';
import { Observable, concat } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Api } from '../../services/api';

@Component({
  selector: 'app-layout-page',
  templateUrl: './layout-page.component.html',
  styleUrls: ['./layout-page.component.css']
})
export class LayoutPageComponent implements OnInit {
  layoutList: Observable<string[]>;
  content: SVGElement;
  constructor(private serverConfig: ServerConfigService, private activatedRoute: ActivatedRoute
    , private syncService: SyncService) { }

  ngOnInit() {
    this.layoutList =
      this.serverConfig.getLayoutList(this.syncService.getStatus().fab, '').pipe(map(layouts => {
      return layouts.map((value, index, array) => {
        let fab = this.syncService.getStatus().fab;
        return Api.getOpiApiUrl() + 'layout/' + value + '?fab=' + fab + '&shop=' + '&useFunc=RawOnly&employeeId=';
      });
    }));
    this.layoutList.subscribe(m => {
      console.log(m);
    });
  }

}




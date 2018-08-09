import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ServerConfigService } from '../../services/server-config.service';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SyncService } from '../../services/sync.service';
import { Observable, concat } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Api } from '../../services/api';
import { LocalConfigService } from '../../services/local-config.service';
import { LocalConfig } from '../../models/local-config';
import { HttpUrlEncodingCodec } from '@angular/common/http';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-layout-page',
  templateUrl: './layout-page.component.html',
  styleUrls: ['./layout-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutPageComponent implements OnInit {
  layoutList: Observable<string[]>;
  content: SVGElement;
  fab: string;
  constructor( private localConfig: LocalConfigService, private serverConfig: ServerConfigService, 
    private activatedRoute: ActivatedRoute, private userService: UserService, private route: Router) { 
    this.activatedRoute.params.subscribe(params => {
      let fab = params['fab'];
      if (!fab && this.userService.currentUser.Shops.length > 0) {
        this.route.navigate(['/layout', this.localConfig.shopMap[this.userService.currentUser.Shops[0]].Fab]);
        return;
      }
      if (this.fab !== fab)
      {
        this.fab = fab;
        this.getLayoutList(fab);  
      }
    })
    this.localConfig.fabSubject.subscribe(m => {
      this.fab = m;
      this.getLayoutList(m);
    });
  }

  private getLayoutList(fab: string) {
    this.layoutList = this.serverConfig.getLayoutList(fab, '');
  }

  ngOnInit() {
  }

  dropHandler(ev) {
    console.log('File(s) dropped');
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          console.log('... file[' + i + '].name = ' + file.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
      }
    } 
    
    // Pass event to removeDragData for cleanup
    this.removeDragData(ev)
  }

  dragOverHandler(ev) {
    console.log('File(s) in drop zone'); 
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  removeDragData(ev) {
    console.log('Removing drag data')
  
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to remove the drag data
      ev.dataTransfer.items.clear();
    } else {
      // Use DataTransfer interface to remove the drag data
      ev.dataTransfer.clearData();
    }
  }
}


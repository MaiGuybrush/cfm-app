import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalConfig } from '../../models/local-config';
import { LocalConfigService } from '../../services/local-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { ServerConfigService } from '../../services/server-config.service';
import { concatMap } from 'rxjs/operators';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-monitor-page',
  templateUrl: './monitor-page.component.html',
  styleUrls: ['./monitor-page.component.css']
})
export class MonitorPageComponent implements OnInit, OnDestroy {
  currentConfig: LocalConfig;
  configSub: Subscription;
  constructor( private localConfig: LocalConfigService
    , private activatedRoute: ActivatedRoute, private serverConfig: ServerConfigService
    , private userService: UserService, private route: Router ) { 

      console.log("page constructed");
    }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let fab = params['fab'];
      if (!fab && this.userService.currentUser.Shops.length > 0) {
        this.route.navigate(['/monitor', this.localConfig.shopMap[this.userService.currentUser.Shops[0]].Fab]);
        return;
      }
      let shop = this.activatedRoute.snapshot.queryParamMap.get('shop');
      let layout = params['layout'];
      // if (!fab || !shop || !layout) {
      //   console.log("invalid fab, shop, layout - " + fab + "," + shop + "," + layout);
      // }
      // if (!fab) {

      // }
      
      this.localConfig.changeLayout(fab, shop, layout).subscribe(m => {
      });;
    });        
    this.localConfig.configSubject.subscribe( m =>{
      this.currentConfig = m;
    });
    //this.currentConfig = this.localConfig.config;
    // this.configSub = this.changeLayout(fab, shop, layout).subscribe(m => {
    //   if (!m) {
    //     console.log("change to params assigned layout fail!")
    //     ///TODO:
    //   }
    // });
}

  ngOnDestroy() {
    // if (this.configSub) {
    //   this.configSub.unsubscribe();
    // }
  }

  // changeLayout(fab: string, shop:string, layout:string): Observable<boolean> {
  //   let config = this.localConfig.config;
  //   if (this.localConfig.fabList.indexOf(fab) < 0) {
  //     return of(false);
  //   } else {
  //     config.currentFab = fab;
  //     return this.serverConfig.getShopList(fab)
  //     .pipe(concatMap(shopList => {
  //       this.localConfig.shopList = shopList;
  //       if (!shop) {
  //         shop = shopList[0];
  //       }
  //       if (this.localConfig.shopList.indexOf(shop) < 0) {
  //         return of(false);
  //       } else {
  //         config.currentShop = shop;
  //         return this.serverConfig.getLayoutList(fab, shop).pipe(concatMap(layoutList => {
  //           this.localConfig.layoutList = layoutList;
  //           if (!layout) {
  //             layout = layoutList[0];
  //           }
  //           if (this.localConfig.layoutList.indexOf(layout) < 0) {
  //             return of(false);
  //           } else {
  //             config.currentLayout = layout;
  //             this.localConfig.config = config;
  //             return of(true);
  //           }
  //         }));
  //       }
  //     }))
  //   }
  // }
 
}

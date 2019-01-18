import { Injectable } from '@angular/core';
import { LocalConfig } from '../models/local-config';
import { Observable, of, from, BehaviorSubject, concat } from 'rxjs';
import { ServerConfigService } from './server-config.service';
import { concatMap, tap, map, first } from 'rxjs/operators';
import { Local } from 'protractor/built/driverProviders';
import { LocaleDataIndex } from '@angular/common/src/i18n/locale_data';
import { Shop } from '../models/shop';



@Injectable({
  providedIn: 'root'
})
export class LocalConfigService {
//  public static readonly defaultFab = 'FAB3';
  readonly localConfigTag = 'LocalConfig';
  defaultConfig: LocalConfig = {
    currentFab: "",
    currentShop: "",
    currentLayout: "",
    refreshInterval: 1
  };
  private _fabList: string[] = [];
  private _shopList: string[] = [];
  private _layoutList: string[] = [];
  private _config: LocalConfig = new LocalConfig();
  private _initialized = false;
  shopMap: Map<string, Shop> = null;

  readonly fabSubject = new BehaviorSubject(this._config.currentFab);
  readonly shopListSubject = new BehaviorSubject(this._shopList);
  readonly layoutListSubject = new BehaviorSubject(this._layoutList);
  readonly configSubject = new BehaviorSubject(this._config);
  readonly initializedSubject = new BehaviorSubject(this._initialized);

  set initialized(val) {
    this._initialized = val;
    this.initializedSubject.next(val);
  }

  get config(): LocalConfig {
    return this._config;
  }

  set config(value: LocalConfig) {
    localStorage.setItem(this.localConfigTag, JSON.stringify(value));
    if (this._config.currentFab !== value.currentFab) {
      this.fabSubject.next(value.currentFab);
    }
    this._config = value;
    this.configSubject.next(value);
  }

  set shopList(value: string[]) {
    this._shopList = value;
    this.shopListSubject.next(value);
  }

  get shopList(): string[] {
    return this._shopList;
  }

  set fabList(value: string[]) {
    this._fabList = value;
  }

  get fabList(): string[] {
    return this._fabList;
  }

  set layoutList(value: string[]) {
    this._layoutList = value;
    this.layoutListSubject.next(value);
  }

  get layoutList(): string[] {
    return this._layoutList;
  }

  constructor(private serverConfig: ServerConfigService) {
  }

  init(): Observable<boolean> {
    if (this._initialized) {
      return of(true);
    }
    return this.serverConfig.getShopMap().pipe(concatMap(shopMap => {
      this.shopMap = shopMap;
      return this.serverConfig.getFabList().pipe(concatMap(fabList => {
        if (!fabList || fabList.length === 0) {
          this.initialized = true;
          return of(false);
        }
        this.fabList = fabList;
        const localConfigStr = localStorage.getItem(this.localConfigTag);
        if (localConfigStr) {
          this.config = JSON.parse(localConfigStr);
        } else {
          this.config = this.defaultConfig;
        }
        return of(true);
      }));
    }));
  }

  changeLayout(fab: string, shop: string, layout: string): Observable<boolean> {
    const config = {
      currentFab: fab,
      currentShop: shop,
      currentLayout: layout,
      refreshInterval: this.config.refreshInterval
    };
    if (this.fabList.indexOf(config.currentFab) < 0) {
      config.currentFab = this.fabList[0];
    }
    return this.serverConfig.getShopList(config.currentFab).pipe(concatMap(shopList => {
      this.shopList = shopList;
      if (shopList.indexOf(config.currentShop) < 0) {
        config.currentShop = shopList[0];
      }
      if (!config.currentLayout) {
        config.currentLayout = config.currentShop;
      }
      this.config = config;
      return of(true);
    }));
  }

  public changeFab(fab: string): Observable<boolean> {
    const config = JSON.parse(JSON.stringify(this.config));
    if (config.currentFab !== fab) {
      config.currentFab = fab;
      return this.serverConfig.getShopList(fab).pipe(concatMap(shopList => {
        this.shopList = shopList;
        config.currentShop = shopList[0];
        config.currentLayout = config.currentShop;
        this.config = config;
        return of(true);
      }));

    }
    return of(true);
  }

  // private loadFabList(): Observable<string[]> {
  //   return this.serverConfig.getFabList().pipe(tap(m => {
  //     this._fabList = m;
  //     this.fabList.next(m);
  //     if (!m || m.length == 0) {
  //       return;
  //     }
  //     if (this._fabList.indexOf(this._config.currentFab) < 0) {
  //       this._config.currentFab = this.defaultFab;
  //       this._config.currentShop = null;
  //       this._config.currentLayout = null;
  //       this._shopList = [];
  //       this._layoutList = [];
  //     }
  //     this.loadShopList(this.defaultFab).subscribe(m => {
  //       console.log(m);
  //     });
  //   }));
  // }

  // private loadShopList(fab: string): Observable<string[]> {
  //   return this.serverConfig.getShopList(fab).pipe(tap(m => {
  //     this._shopList = m;
  //     this.shopList.next(m);
  //     if (!m || m.length == 0) {
  //       return;
  //     }
  //     if (this._shopList.indexOf(this._config.currentShop) < 0) {
  //       this._config.currentShop = this._shopList[0];
  //       this._config.currentLayout = null;
  //       this._layoutList = [];
  //     }
  //   }));
  // }

  // private loadLayoutList(fabList: string, shop: string): Observable<string[]> {
  //   return this.serverConfig.getLayoutList(fabList, shop).pipe(tap(m => {
  //     this._layoutList = m;
  //     this.layoutList.next(m);
  //     if (!m || m.length == 0) {
  //       return;
  //     }
  //     if (m.indexOf(this._config.currentLayout) < 0) {
  //       this._config.currentLayout = this._layoutList[0];
  //     }
  //     this.config.next(this._config);
  //   }));
  // }


  // changeFab(fab: string): Observable<boolean> {
  //   if (this._fabList.indexOf(fab) < 0) {
  //     return of(false);
  //   }
  //   if (this._config.currentFab !== fab) {
  //     this._config.currentFab = fab;
  //     this._shopList = [];
  //     this._layoutList = [];
  //     this.configObserver.next(this._config);
  //   }
  //   return of(true);
  // }

  // changeShop(shop: string) {
  //   if (this._shopList.indexOf(shop) < 0) {
  //     return false;
  //   }
  //   if (this._config.currentShop !== shop) {
  //     this._config.currentShop = shop;
  //     this._layoutList = [];
  //     // this.loadLayoutList(this._config.currentFab, this._config.currentShop).subscribe();
  //   }
  //   this.configObserver.next(this._config);
  // }

}

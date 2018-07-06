import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, filter, scan } from 'rxjs/operators';
import { Api } from './api';
import { Shop } from '../models/shop';
import { LayoutInfo } from '../models/layout-info';

/*
  Generated class for the ConfigProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerConfigService {
  dummyShop = 'tft3';
  constructor(public http: HttpClient) {
    console.log('Hello ConfigProvider Provider');
  }

  getFabList(): Observable<string[]> {
    return this.http.get<string[]>(Api.getOpiWebUrl(this.dummyShop) + 'config/getFabList').pipe(map(m => {
      return m;
    }));
  }

  getShopList(fab: string): Observable<string[]> {
    return this.http.get<string[]>(Api.getOpiWebUrl(this.dummyShop) + 'config/getShopList?fab=' + fab).pipe(map(m => {
      return m;
    }));
  }

  getShopMap(): Observable<Map<string, Shop>> {
    return this.http.get<Map<string, Shop>>(Api.getOpiWebUrl(this.dummyShop) + 'config/getShopMap?productionOnly=true').pipe(map(m => {
      return m;
    }));
  }

  getLayoutList(fab: string, shop: string): Observable<string[]> {
    let url = Api.getOpiApiUrl() + 'layout?' + 'fab=' + fab;
    url += '&shop=';
    url += shop ? shop : '';
    return this.http.get<string[]>(url).pipe(map(m => {
      const output = [];
      m.forEach(s => {
        output.push(s.toUpperCase());
      });
      return output;
    }));
  }


  protected getLayoutKey(layoutID: string, fab: string, shop: string): string {
    return fab + '_' + shop + '_' + layoutID;
  }

  getLayout(layoutID: string, fab: string, shop: string): Observable<any> {
    const layoutKey = this.getLayoutKey(layoutID, fab, shop);
    return this.http.get<LayoutInfo>(Api.getOpiApiUrl() + 'layout/' + layoutID
    + '?fab=' + fab + '&shop=' + shop + '&useFunc=&employeeId=' + 'guy.mai')
    .pipe(
      map(layout => {
        return layout.Content;
    }));
  }
}

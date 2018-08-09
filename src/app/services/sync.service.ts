import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { map, filter, scan } from 'rxjs/operators';
import { Api } from './api';
import { Shop } from '../models/shop';
import { LayoutInfo } from '../models/layout-info';

/*
  Generated class for the ConfigProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export interface ApStatus {
  fab: string;
  shop: string;
  shopList: string[];
}

@Injectable()
export class SyncService {
    // statusObserver: Observer<ApStatus>;
    // statusObservable: Observable<ApStatus>;
    // obs: Observable<ApStatus>;
    // status: ApStatus = {
    //   fab: '',
    //   shop: '',
    //   shopList: [],
    // };
    // public static currentShop: string;
    // constructor() {
    //   this.obs = Observable.create( observer => {
    //     this.statusObserver = observer;
    //   });
    // }

    // public updateStatus(status: ApStatus) {
    //   this.status = status;
    // }

    // public updateFab(fab: string) {
    //   if (this.status.fab === fab) {
    //     return;
    //   }
    //   this.status.fab = fab;
    // }

    // public getObservableStatus(): Observable<ApStatus> {
    //   return this.obs;
    // }

    // public getStatus(): ApStatus {
    //   return this.status;
    // }

}

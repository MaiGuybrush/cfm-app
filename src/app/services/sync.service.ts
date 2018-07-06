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
}

@Injectable()
export class SyncService {
    statusObserver: Observer<ApStatus>;
    statusObservable: Observable<ApStatus>;
    obs: Observable<ApStatus>;
    status: ApStatus = {
      fab: ''
    };
    constructor() {
      this.obs = Observable.create( observer => {
        this.statusObserver = observer;
      });
      this.obs.subscribe();
    }

    public updateStatus(status: ApStatus) {
      this.status = status;
      this.statusObserver.next(status);
    }

    public getObservableStatus(): Observable<ApStatus> {
      this.statusObserver.next(this.status);
      return this.obs;
    }

    public getStatus(): ApStatus {
      return this.status;
    }

}

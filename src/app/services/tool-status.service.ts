import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Api } from './api';
import { GlobalService } from './global-service';

@Injectable({
  providedIn: 'root'
})
export class ToolStatusService {

  constructor(private http: HttpClient, private global: GlobalService) { }

  getToolStatus(eqptList: string[], shop: string): Observable<any> {
    return this.http.post(this.global.getOpiWebUrl(shop) + '/equipment/cfmstatus/', eqptList).pipe(map(m => {
      return m;
    }));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Api } from './api';

@Injectable({
  providedIn: 'root'
})
export class ToolStatusService {

  constructor(private http: HttpClient) { }

  getToolStatus(eqptList: string[], shop: string): Observable<any> {
    return this.http.post(Api.getOpiWebUrl(shop) + 'equipment/cfmstatus/', eqptList).pipe(map(m => {
      return m;
    }));
  }
}

import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Api } from './api';
import { InxSsoPage } from '../models/inx-sso-page';
import { tap } from 'rxjs/operators';
import { EmpInfo } from '../models/emp-info';
import { AuthInfo } from '../models/auth-info';
import { GlobalService } from './global-service';



@Injectable({
  providedIn: 'root'  //singleton
})
export class UserService {
  private _currentUser: EmpInfo = null;
  currentUserSubject = new BehaviorSubject(this._currentUser);
  private _token: string;
  public get token(): string {
    return this._token;
  }
  public get currentUser() {
    return this._currentUser;
  }
  private jsonFileURL = './assets/config/Config.json';
  constructor(private http: HttpClient, private global: GlobalService) {
    // let lastAuthRes = localStorage.getItem("currentUser");
    // if (lastAuthRes) {
    //   let res = JSON.parse(lastAuthRes)
    //   this._currentUser = res.userInfo;
    //   this._token = res.token;    
    //   this.currentUser.next(this._currentUser);    
    // }
  }

  public isAuthenticated(): boolean {
    return this._currentUser != null;
  }

  public getSsoTicket(): any {
    let ssoTicket = this.getCookie("SsoTicket");
    console.log('ssoTicket:', ssoTicket);
    return ssoTicket;
  }

  public logIn(certKey: string, ssoTicket: string): Observable<any> {
    return this.http.post<AuthInfo>(this.global.getOpiApiUrl() + "/apiauth"
    , { "CertificateKey": certKey, "SsoTicket": ssoTicket }).pipe(tap(res => {
//        localStorage["currentUser"] = JSON.stringify(res);
        this._currentUser = res.empInfo;
        this._token = res.empInfo.Token;
        console.log('user changed publish!');
        this.currentUserSubject.next(this._currentUser);
    }));
  }

  public clearLoginInfo() {
    console.log("publish user logout.")
    this.currentUserSubject.next(null);
//    localStorage.removeItem("currentUser");
  }

  public redirectToSso() {
    this.getInxSSOPage().subscribe(p => {
        let url = this.removeURLParameter(document.URL, "CertificateKey");
        if (url.indexOf('#/authenticate') < 0) {
          url = url.concat('#/authenticate');
        }
        console.log('redirectToSso:', p.loginPage + '?url=' + encodeURIComponent(url));
        window.location.href = p.loginPage + '?url=' + encodeURIComponent(url);
    });
    //        var url = window.location.protocol.concat("//").concat(window.location.host + "/");
    //http://HP06609P.cminl.oa
    // var url = window.location.href.split('?')[0];
    // url = url.concat("#/pages/authenticate");
    // window.location.href = Connection.ssoServer + '/InxSSO/Logon.aspx?url=' + encodeURI(url);
    // window.location.href = 'http://10.99.1.143/InxSSO/Logon.aspx?url=' + encodeURI(url);
    // window.location.href = 'http://10.53.56.79/InxSSO/Logon.aspx?url=' + encodeURI(url);
    // window.location.href = 'http://inlcnws.cminl.oa/InxSSO/Logon.aspx?url=' + encodeURI(url);
  }

  removeURLParameter(url, parameter): string {
    //prefer to use l.search if you have a location/link object
    var urlparts= url.split('?');   
    if (urlparts.length >= 2) {

        var prefix= encodeURIComponent(parameter)+'=';
        var pars= urlparts[1].split(/[&;]/g);

        //reverse iteration as may be destructive
        for (var i= pars.length; i-- > 0;) {    
            //idiom for string. startsWith
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {  
                pars.splice(i, 1);
            }
        }
        url= urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
        return url;
    } else {
        return url;
    }
  }

  private getInxSSOPage(): Observable<InxSsoPage> {
    return this.http.get<InxSsoPage>(this.global.getOpiApiUrl() + "/ApiAuth?category=SSOURL");
  }

  public logOut() {
    // localStorage.removeItem('currentUser');
    // Connection.logOutToSso();
    this.clearLoginInfo();
    this.getInxSSOPage().subscribe(p => {
      let url = window.location.href.split('?')[0];
      if (url.indexOf('#/authenticate') < 0) {
        url = url.concat('#/authenticate');
      }
      console.log('logOutToSso:', p.logoutPage + '?url=' + encodeURI(url));
      window.location.href = p.logoutPage + '?url=' + encodeURI(url);
  });

    // window.location.href = 'http://inlcnws.cminl.oa/InxSSO/Logout.aspx?url=' +
    //   encodeURI(window.location.href.split('#')[0] + "#/pages/authenticate");
  }

  public getCookie(name: string): string {
    const nameLenPlus = (name.length + 1);
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => {
        return cookie.substring(0, nameLenPlus) === `${name}=`;
      })
      .map(cookie => {
        return decodeURIComponent(cookie.substring(nameLenPlus));
      })[0] || null;
  }

//   public verifyCertificateKey(certKey: string): Observable<AuthInfo>  {
//     return this.http.get<AuthInfo>(this.global.getOpiApiUrl() + "/apiauth?category=Verify&CertificateKey=" + certKey)
//     .pipe(tap(res => {
// //        localStorage["currentUser"] = JSON.stringify(res);
//         this._currentUser = res.empInfo;
//         this._token = res.token;
//         console.log('user changed publish!');
//         this.currentUserSubject.next(this._currentUser);
//     }));  
//   }
  // public checkUserPic(picUrl: string): Observable<any> {
  // return this.httpClient.get<any>(picUrl)
  // .do(m => { console.log('checkUserPic:', m); })
  // .catch((err) => {
  //   return Observable.throw(err);
  // });
  // return this.httpClient.get(picUrl);
  // }

  public getUrlInfo(): any {
    console.log(document.URL);
    // this.activatedRouter.paramMap.subscribe(params => console.log("params", params.get('CertificateKey')))
    var url = this.parseURLByHash(document.URL);
    console.log(url.searchObject);
    return url;
  }

  public parseURLByHash(url) {
    var parser = document.createElement('a'),
      searchObject = {},
      queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.hash.replace(/^.*\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
      split = queries[i].split('=');
      searchObject[split[0]] = split[1];
    }
    return {
      protocol: parser.protocol,
      host: parser.host,
      hostname: parser.hostname,
      port: parser.port,
      pathname: parser.pathname,
      search: parser.search,
      searchObject: searchObject,
      hash: parser.hash
    };
  }
}

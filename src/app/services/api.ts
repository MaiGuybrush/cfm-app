import { Injectable } from '@angular/core';

declare var window: any;
/*
  Generated class for the Api provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

enum ApiSource {
    Dev,
    ProdInInx,
    ProdOutInx
}

@Injectable()
export class Api {

    public static source: ApiSource = window.cordova ? ApiSource.ProdOutInx : ApiSource.Dev;
    public static getOpiApiUrl(): string {
        switch (Api.source) {

            case ApiSource.Dev:
                return 'http://10.53.56.79/apps/mes/opi/api/';
            case ApiSource.ProdInInx:
                return 'http://tncimap.cminl.oa/apps/mesclient/api/';
        }
    }
    public static getOpiWebUrl(shop: string): string {
        switch (Api.source) {
            case ApiSource.Dev:
                return 'http://10.53.56.79/apps/mes/opi/zh-tw/{shop}/'.replace('{shop}', shop);
            case ApiSource.ProdInInx:
                return 'http://tncimap.cminl.oa/apps/mesclient/zh-tw/{shop}/'.replace('{shop}', shop);
        }
    }
    static toCamel(o): any {
        let newO, origKey, newKey, value;
        if (o instanceof Array) {
            newO = [];
            for (origKey in o) {
                value = o[origKey];
                if (typeof value === 'object') {
                    value = this.toCamel(value);
                }
                newO.push(value);
            }
        } else {
            newO = {};
            for (origKey in o) {
                if (o.hasOwnProperty(origKey)) {
                    newKey = (origKey.charAt(0).toLowerCase() + origKey.slice(1) || origKey).toString()
                    value = o[origKey];
                    if (value !== null && (value.constructor === Object || value instanceof Array)) {
                        value = this.toCamel(value);
                    }
                    newO[newKey] = value;
                }
            }
        }
        return newO;
    }

    static toPascal(o): any {
        let newO, origKey, newKey, value;
        if (o instanceof Array) {
            newO = [];
            for (origKey in o) {
                value = o[origKey];
                if (typeof value === 'object') {
                    value = this.toPascal(value);
                }
                newO.push(value);
            }
        } else {
            newO = {};
            for (origKey in o) {
                if (o.hasOwnProperty(origKey)) {
                    newKey = (origKey.charAt(0).toUpperCase() + origKey.slice(1) || origKey).toString()
                    value = o[origKey];
                    if (value !== null && (value.constructor === Object || value instanceof Array)) {
                        value = this.toPascal(value);
                    }
                    newO[newKey] = value;
                }
            }
        }
        return newO;
    }

    //   static getHttpUrl(category: API_CATEGORY, funcName: string): any {
    //     switch (category)
    //     {
    //         case API_CATEGORY.OPI_API:
    //         {
    //             return 'http://10.53.56.79/apps/mes/opi/api/layout/'
    //         }
    //         case API_CATEGORY.OPI_WEB:
    //         {
    //             return 'http://10.53.56.79/apps/mes/opi/zh-tw/{shop}/equipment/cfmstatus/'
    //         }

    //     }


    //     let apiConnect: string = 'CIM';  //MIS,CIM
    //     let serverUrl: string = '';
    //     //  if (apiConnect === 'CIM'){
    //         // serverUrl = 'http://c4c010685.cminl.oa/UMD/Services/UMDDataService.svc/';
    //       // serverUrl = 'http://tnvtwebapi.cminl.oa/NewWebApi/Agency/api/service/c18ac7b5-bbfa-8919-eb8e-b3fe20e2ac93/';
    //         // serverUrl = 'http://c3c003309.cminl.oa/UMD/Services/UMDDataService.svc/';
    //           serverUrl = 'https://apptest.innolux.com/agency/api/proxy/c18ac7b5-bbfa-8919-eb8e-b3fe20e2ac93/';
    //           //serverUrl = 'http://c7c002811.cminl.oa:8080/agency/api/proxy/c18ac7b5-bbfa-8919-eb8e-b3fe20e2ac93/';
    //           //serverUrl = 'https://jnapp02/WebApi/Agency/cbf3b47d-115b-a97c-62c8-40dc52b6b1c7'
    //       // }else if (apiConnect === 'MIS'){
    //       //serverUrl = 'http://ptnecimumd.cminl.oa/Services/UMDDataService.svc/';
    //     //  }
    //      return serverUrl + funcName;
    //   }


}

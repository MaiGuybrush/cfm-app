import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ResolveStart } from '@angular/router';
import { LocalConfigService } from './services/local-config.service';
import { GlobalService } from './services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  loading = false;
  // public static certKey: string;
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private localConfig: LocalConfigService, private global: GlobalService) {
      // const urlObj = user.parseURLByHash(document.location.href.toLowerCase());
      // const segments = urlObj.pathname.split('/');
      // const idx = segments.indexOf('cfm', 0);
      // let shop = null;
      // const regexp = new RegExp('^(((tft|cf|lcd)([1-8]|8b|l))|usl)$');
      // if (idx >= 0 && segments.length > idx + 1) {
      //   if (regexp.exec(segments[idx + 1]).length > 0) {
      //     shop = segments[idx + 1];
      //   }
      // }
      // if (shop) {
      //   global.Shop = shop;
      // }
  }
  ngOnInit() {
    // let url = this.userService.getUrlInfo();
    // let certKey = this.getCertificateKey(url);
    // if (certKey) {
    //   this.router.navigate(["/authenticate" ], { queryParams: { 'certKey': certKey, 'url': this.activatedRoute.snapshot.url } });
    //   return;
    // }


    // if (!this.localConfig.initialized) {
    //   this.router.navigate(['initialize'], {
    //     queryParams: {
    //       'fab': url.searchObject['fab'],
    //       'shop': url.searchObject['shop'],
    //       'layout': url.searchObject['layout'],
    //     }
    //   });
    //   return;
    // }
  }

  public parseURL(url) {
    const parser = document.createElement('a');
    const searchObject = {};
    const queries = parser.search.replace(/^\?/, '').split('&');
    let split;

    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    for (let i = 0; i < queries.length; i++) {
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



  public getCertificateKey(url: any): any {
    const certKeyString = url.searchObject["CertificateKey"];
    if (certKeyString) {
      const certKey = decodeURIComponent(certKeyString);
      console.log('certKey:', certKey);
      return certKey;
    }
    return null;
  }


}

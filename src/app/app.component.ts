import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalConfigService } from './services/local-config.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';
  loading = false;
  // public static certKey: string;
  constructor(private router: Router, private activatedRoute: ActivatedRoute, 
    private localConfig: LocalConfigService, private userService: UserService) {

  }
  ngOnInit()
  {
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
    var parser = document.createElement('a'),
      searchObject = {},
      queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
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



  public getCertificateKey(url: any): any {
    let certKeyString = url.searchObject["CertificateKey"];
    if (certKeyString) {
      let certKey = decodeURIComponent(certKeyString);
      console.log('certKey:', certKey);
      return certKey;
    }
    return null;
  }

  
}

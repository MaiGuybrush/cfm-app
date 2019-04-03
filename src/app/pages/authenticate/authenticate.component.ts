import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from 'inx-auth-jwt-lib';
import { GlobalService } from '../../services/global.service';
// import { Connection } from '../../../services/common'

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent implements OnInit {
  @Input() certKey: string;
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private httpClient: HttpClient,
    private userService: UserService, private global: GlobalService) {
  }

  ngOnInit() {
    console.log('authenticate init');
    const urlObj = this.userService.parseURLByHash(document.location.href.toLowerCase());
    const segments = urlObj.pathname.split('/');
    const idx = segments.indexOf('cfm', 0);
    let shop = null;
    const regexp = new RegExp('^(((tft|cf|lcd)([1-8]|8b|l))|usl)$');
    if (idx >= 0 && segments.length > idx + 1) {
      if (regexp.exec(segments[idx + 1]).length > 0) {
        shop = segments[idx + 1];
      }
    }
    if (shop) {
      this.global.Shop = shop;
    }
  }

}




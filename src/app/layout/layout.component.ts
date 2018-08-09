import { Component, OnInit } from '@angular/core';
import { NavMenuItem } from '../models/model.ui';
import { ServerConfigService } from '../services/server-config.service';
import { LocalConfigService } from '../services/local-config.service';
import { UserService } from '../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  menuItems: NavMenuItem[] = [
     { title: 'Monitor', link: 'monitor' }
   , { title: 'Layout', link: 'layout' }
   , { title: 'Analysis', link: 'analysis' }
  ];
  fabList: string[]

  constructor(private router: Router, private localConfig: LocalConfigService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
  }
}

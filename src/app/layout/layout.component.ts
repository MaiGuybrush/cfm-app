import { Component, OnInit } from '@angular/core';
import { NavMenuItem } from '../models/model.ui';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  menuItems: NavMenuItem[] = [
     { title: 'Monitor', link: 'monitor' }
   , { title: 'Alarm', link: 'alarm' }
   , { title: 'Analysis', link: 'analysis' }
  ];

  constructor() { }

  ngOnInit() {
  }

}

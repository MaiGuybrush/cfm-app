import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-monitor-page',
  templateUrl: './monitor-page.component.html',
  styleUrls: ['./monitor-page.component.css']
})
export class MonitorPageComponent implements OnInit {
  items: MenuItem[];
  constructor() { }

  ngOnInit() {
    this.items = [
    {
      label: 'File',
        items: [{
                  label: 'New', 
                  icon: 'fa fa-fw fa-plus',
                  items: [
                      {label: 'Project'},
                      {label: 'Other'},
                  ]
              },
              {label: 'Open'},
              {label: 'Quit'}
          ]
        },
        {
          label: 'Edit',
          icon: 'fa fa-fw fa-edit',
          items: [
              {label: 'Undo', icon: 'fa fa-fw fa-mail-forward'},
              {label: 'Redo', icon: 'fa fa-fw fa-mail-reply'}
        ]
      }
    ];
  }

}

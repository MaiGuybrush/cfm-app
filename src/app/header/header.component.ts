import { Component, OnInit, Input } from '@angular/core';
import { NavMenuItem } from '../models/model.ui';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() menuItems: NavMenuItem[] = []; 

  constructor(public router: ActivatedRoute) {
  }

  ngOnInit() {
    
      console.log(this.router.snapshot);
    
 
  }

}

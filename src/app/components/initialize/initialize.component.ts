import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { LocalConfigService } from 'src/app/services/local-config.service';
import { Router, ActivatedRoute, ActivationEnd } from '@angular/router';
import { concatMap } from '../../../../node_modules/rxjs/operators';
import { ServerConfigService } from '../../services/server-config.service';

@Component({
  selector: 'app-initialize',
  templateUrl: './initialize.component.html',
  styleUrls: ['./initialize.component.css']
})
export class InitializeComponent implements OnInit {

  constructor(private router: Router, 
    private activatedRoute: ActivatedRoute, private localConfig: LocalConfigService, 
    private serverConfig: ServerConfigService, private userService: UserService) { }

  ngOnInit() {
    // if (this.userService.isAuthenticated()) {
    //   let fab = this.activatedRoute.snapshot.queryParamMap.get('fab');
    //   let shop = this.activatedRoute.snapshot.queryParamMap.get('shop');
    //   let layout = this.activatedRoute.snapshot.queryParamMap.get('layout');
    //   this.serverConfig.getShopMap().subscribe(shopMap => {
    //     this.localConfig.shopMap = shopMap;
    //     if (!fab) {
    //       shop = this.userService.currentUser.Shops[0];
    //       fab = shopMap[shop].Fab;
    //       layout = shop;
    //     }

    //     this.localConfig.init(fab, shop, layout).subscribe(m => {
    //       this.router.navigate(["/monitor/" + this.localConfig.config.currentFab], {queryParams: {
    //         "shop": this.localConfig.config.currentShop,
    //         "layout": this.localConfig.config.currentLayout,
    //       }});
    //     });
    //   });
      
    // } else {
    //   this.router.navigate(["/authenticate"]);
    // }
  }

}

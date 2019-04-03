import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalConfig } from '../../models/local-config';
import { LocalConfigService } from '../../services/local-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription, timer } from 'rxjs';
import { ServerConfigService } from '../../services/server-config.service';
import { concatMap } from 'rxjs/operators';
import { ToolStyle, PortStyle } from '../../components/layout-svg/layout-svg.component';
import { ToolStatusService } from '../../services/tool-status.service';
import { UserService } from 'inx-auth-jwt-lib';

@Component({
  selector: 'app-monitor-page',
  templateUrl: './monitor-page.component.html',
  styleUrls: ['./monitor-page.component.css']
})
export class MonitorPageComponent implements OnInit, OnDestroy {
  currentConfig: LocalConfig;
  configSub: Subscription;
  layoutModel: ToolStyle[] = [];
  toolDetailSvg: string;
  showDetail = false;
  visibleSideBar = false;
  colorMap = [];
  modeColorMap = [];
  portColorMap = [];
  toolList: string[] = [];
  timer: Subscription;
  layoutRaw: string;
  defaultShop = "TFT1";
  defaultFab = "FAB1";
  convertToolIdForPortStatus: (toolId: string) => string;

  constructor( public statusProvider: ToolStatusService, private localConfig: LocalConfigService
    , private activatedRoute: ActivatedRoute, private serverConfig: ServerConfigService
    , private userService: UserService, private route: Router ) {

      this.colorMap.push({ color: 'C0C0C0', desc: 'Unknown' });         // 0:Unknown ,
      this.colorMap.push({ color: '00FF00', desc: 'Run' });             // 1:RUN     ,1000
      this.colorMap.push({ color: 'ACFFAC', desc: 'Monitor Run' });     // 2:MRUN    ,1100
      this.colorMap.push({ color: '65CA00', desc: 'E-Run' });           // 3:ERUN    ,1200
      this.colorMap.push({ color: 'FFFF00', desc: 'Idle' });            // 4:IDLE    ,2000
      this.colorMap.push({ color: '80FFFF', desc: 'P-Setup' });         // 5:PSTUP   ,2100
      this.colorMap.push({ color: '00CACA', desc: 'E-Setup' });         // 6:ESTUP   ,2200
      this.colorMap.push({ color: '008000', desc: 'Chang Material' });  // 7:CHMT    ,2300
      this.colorMap.push({ color: 'FF00FF', desc: 'AMHS' });            // 8:AMHS    ,2400
      this.colorMap.push({ color: 'FF0000', desc: 'Down' });            // 9:DOWN    ,4000
      this.colorMap.push({ color: 'FF8000', desc: 'PM' });              // 10:PM      ,4100
      this.colorMap.push({ color: '804040', desc: 'Warm up' });         // 11:WARMUP  ,4200
      this.colorMap.push({ color: '0000FF', desc: 'Eng lend' });        // 12:ENG     ,4300
      this.colorMap.push({ color: 'FF80FF', desc: 'Show down' });       // 13:SHDW    ,6000
      this.colorMap.push({ color: 'FEB18D', desc: 'PM2' });             // 14:PM2     ,4400
      this.colorMap.push({ color: 'FF0000', desc: 'PE down' });         // 15:PEDown  ,4500
      this.colorMap.push({ color: '804040', desc: 'EQ warm up' });      // 16:EQWarmUp,4201
      this.colorMap.push({ color: '804040', desc: 'PE warm up' });      // 17:PEWarmUp,4202
      this.colorMap.push({ color: '804040', desc: 'Other warn up' });   // 18:OtherWUp,4203
      this.colorMap.push({ color: '808080', desc: 'Norel' });           // 19:NOREL   ,nore
      this.colorMap.push({ color: '9700EE', desc: 'Technical Use' });        // 20:Technical Use, 3000
      this.colorMap.push({ color: '9700EE', desc: 'Equipment Experiment' }); // 21:Equipment Experiment, 3100
      this.colorMap.push({ color: 'FF0000', desc: 'Process Experiment' });   // 22:Process Experiment, 3200
      this.colorMap.push({ color: 'FF00FF', desc: 'Down Shooting' });        // 23:Down Shooting, 4800
      this.colorMap.push({ color: '0080FF', desc: 'Technical Use' });        // 24:Technical Use, ENG
      this.colorMap.push({ color: 'FF0000', desc: 'Technical Use' });        // 25:Technical Use,ENGDOWN
      this.colorMap.push({ color: '808080', desc: 'PSetup' });               // 26:PSetup, SETUP
      this.colorMap.push({ color: 'FF0000', desc: 'FACDWN' });               // 27:FACDWN, FACDWN
      this.colorMap.push({ color: '009932', desc: 'P-Run' });                // 28:P-Run,P_RUN
      this.colorMap.push({ color: '80FFFF', desc: 'ENDMON' });               // 29:ENDMON,ENDMON
      this.colorMap.push({ color: '80FFFF', desc: 'WAITSETUP' });            // 30:WAITSETUP,WAITSETUP
      this.colorMap.push({ color: 'FF33CC', desc: 'WAITENG' });              // 31:WAITENG,WAITENG
      this.colorMap.push({ color: 'FF0000', desc: 'AGVDOWN' });              // 32:AGVDOWN,AGVDOWN
      this.colorMap.push({ color: 'FF0000', desc: 'STKDOWN' });              // 33:STKDOWN,STKDOWN
      this.colorMap.push({ color: 'FF8040', desc: 'MATSHT' });               // 34:MATSHT,MATSHT
      this.colorMap.push({ color: 'BC8CBF', desc: 'STK Warning' });          // 35:STK Warning,WARNING
      this.colorMap.push({ color: 'ABA000', desc: 'STK FULL' });             // 36:STK FULL,FULL
      this.modeColorMap.push('C0C0C0');  // unknown
      this.modeColorMap.push('008000');  // MANU
      this.modeColorMap.push('000080');  // CONT
      this.modeColorMap.push('A60000');  // MONI
      this.modeColorMap.push('FF8040');  // ?
      this.modeColorMap.push('C0C0C0');  // ?
      this.portColorMap.push({ color: 'C0C0C0', desc: 'Unknown' });      // 0:Unknown
      this.portColorMap.push({ color: '40FF00', desc: 'BUSY' });         // 1:BUSY
      this.portColorMap.push({ color: '0000FF', desc: 'DOWN' });         // 2:DOWN
      this.portColorMap.push({ color: '008080', desc: 'FREE' });         // 3:FREE
      this.portColorMap.push({ color: 'FFFF00', desc: 'LDCM' });         // 4:LDCM
      this.portColorMap.push({ color: 'FF0000', desc: 'LDCP' });         // 5:LDCP
      this.portColorMap.push({ color: 'FFFFFF', desc: 'LDRQ' });         // 6:LDRQ
      this.portColorMap.push({ color: 'CC33FF', desc: 'MANT' });         // 7:MANT
      this.portColorMap.push({ color: '663399', desc: 'PAUS' });         // 8:PAUS
      this.portColorMap.push({ color: 'FF80FF', desc: 'UDCM' });         // 9:UDCM
      this.portColorMap.push({ color: '4080FF', desc: 'UDRQ' });         // 10:UDRQ
      this.portColorMap.push({ color: '067CF2', desc: 'ULRQ' });         // 11:ULRQ
      this.portColorMap.push({ color: '008080', desc: 'UNUS' });         // 12:UNUS
      this.portColorMap.push({ color: '408080', desc: 'USED' });         // 13:USED
      this.portColorMap.push({ color: '404080', desc: 'USEM' });         // 14:USEM
      this.portColorMap.push({ color: 'FFFF00', desc: 'USNE' });         // 15:USNE
    }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const fab = params['fab'];
      if (!fab && this.userService.currentUser.Shops && this.userService.currentUser.Shops.length > 0) {
        const command = ['/monitor'];
        if (this.localConfig.config.currentFab) {
          command.push(this.localConfig.config.currentFab);
          if (this.localConfig.config.currentLayout) {
            command.push(this.localConfig.config.currentLayout);
          }

        } else {
          command.push(this.localConfig.shopMap[this.userService.currentUser.Shops[0]].Fab);
        }
        this.route.navigate(command);
        return;
      }
      let shop = this.activatedRoute.snapshot.queryParamMap.get('shop');
      let layout = params['layout'];
      if (!shop) {
        shop = this.defaultShop;
        layout = this.defaultShop;
      }
      if (!layout) {
        layout = shop;
      }
      this.localConfig.changeLayout(fab, shop, layout);
    });
    this.localConfig.configSubject.subscribe( m => {
      const cfg = this.currentConfig = m;
      this.serverConfig.getLayout(cfg.currentLayout, cfg.currentFab, cfg.currentShop).subscribe(layout => {
        if (this.currentConfig.currentFab === 'FAB1') {
          this.convertToolIdForPortStatus = (toolId: string) => toolId;
        } else {
          this.convertToolIdForPortStatus = (toolId: string) => toolId.substring(0, 6) + '00';
        }
        this.layoutRaw = layout;
      });
    });
  }

  setRefreshTimer() {
    if (this.timer) {
      this.timer.unsubscribe();
    }
    this.timer = timer(500, this.currentConfig.refreshInterval * 60 * 1000).subscribe(t => this.refreshToolStatus());
  }

  refreshToolStatus() {
    this.statusProvider.getToolStatus(this.toolList, this.currentConfig.currentShop).subscribe(m => {
      const output: ToolStyle[] = [];
      m.forEach(tool => {
        const toolStyle: ToolStyle = {
          id: tool.id,
          fillStyleIdx: parseInt(tool.status, 10),
          strokeStyleIdx: parseInt(tool.mode, 10),
          portsStyle: [],
          comment: tool.comment,
          info: '' + (+tool.moveCount)
        };
        if (tool.port_list) {
          tool.port_list.forEach( port => {
            const portStyle: PortStyle = {
              id: port.port_id,
              fillStyleIdx: parseInt(port.status, 10)
            };
            portStyle.strokeStyleIdx = portStyle.fillStyleIdx;
            toolStyle.portsStyle.push(portStyle);
          });
        }
        output.push(toolStyle);
        this.layoutModel = output;
      });
    });
  }


  ngOnDestroy() {
    if (this.timer) {
      this.timer.unsubscribe();
    }
  }

  onToolClicked(event) {
    /* not released function
    console.log(event.srcElement.outerHTML);
    this.toolDetailSvg = event.srcElement.outerHTML;
    this.showDetail = true;
    */
  }

  onLayoutInitialized(event: string[]) {
    this.toolList = event;
    this.setRefreshTimer();
  }
}

import { Component, ViewChildren, ViewChild, ElementRef, OnInit, OnDestroy, QueryList
  , AfterViewInit, Pipe, PipeTransform, ViewEncapsulation, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ToolStatusService } from '../../services/tool-status.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Doc, Element, ViewBox, adopt } from 'svg.js';
import * as SvgPanZoom from 'svg-pan-zoom';
import * as Rx from 'rxjs';
import { timer, Observable, Subject, asapScheduler, pipe, of, from, interval, merge, fromEvent } from 'rxjs';
import { ServerConfigService } from '../../services/server-config.service';
import { LocalConfig } from '../../models/local-config';
import 'hammerjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SyncService } from '../../services/sync.service';
import { concatMap, map, debounceTime } from 'rxjs/operators';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Message } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { LocalConfigService } from '../../services/local-config.service';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

// @Pipe({ name: 'safeHtml' })
// export class SafeHtmlPipe implements PipeTransform {
//   constructor(private sanitized: DomSanitizer) { }
//   transform(value) {
//     return this.sanitized.bypassSecurityTrustHtml(value);
//   }
// }

// @Component({
//   selector: "tool",
//   templateUrl: "tool.html"
// })
// export class ToolComponent
// {
//   private shape="rect";
//   private param= { x: 100, y: 200, width: 100, height:80 };
//   constructor() {

//   }
// }
declare var Hammer;
const svgEventHander = {
  haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel']
  , init: function (options) {
    const instance = options.instance;
    let initialScale = 1;
    let pannedX = 0;
    let pannedY = 0;

    // Init Hammer
    // Listen only for pointer and touch events
    this.hammer = Hammer(options.svgElement, {
      inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
    });

    // Enable pinch
    this.hammer.get('pinch').set({ enable: true });

    // Handle double tap
    this.hammer.on('doubletap', function (ev) {
      instance.zoomIn();
    });

    // Handle pan
    this.hammer.on('panstart panmove', function (ev) {
      // On pan start reset panned variables
      if (ev.type === 'panstart') {
        pannedX = 0;
        pannedY = 0;
      }

      // Pan only the difference
      instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
      pannedX = ev.deltaX;
      pannedY = ev.deltaY;
    });

    // Handle pinch
    this.hammer.on('pinchstart pinchmove', function (ev) {
      // On pinch start remember initial zoom
      if (ev.type === 'pinchstart') {
        initialScale = instance.getZoom();
        instance.zoom(initialScale * ev.scale);
      }
      instance.zoom(initialScale * ev.scale);
    });

    // Prevent moving the page on some devices when panning over SVG
    options.svgElement.addEventListener('touchmove', function (e) { e.preventDefault(); });
  }

  , destroy: function () {
    this.hammer.destroy();
  }
};

declare var window;

class ToolInfoGroup {
  toolTextElement: svgjs.Text;
  toolTextBackGroundElement: svgjs.Rect;
  toolTextGroup: svgjs.G;
}

class ToolShapeGroup {
  toolShapeElement: svgjs.Element;
  toolShapeTransformedRect: any;
  toolInfoGroup: ToolInfoGroup;
  toolPortElements: svgjs.Circle[];
}

class ToolMapData {
  toolShapeGroup: ToolShapeGroup[] = [];
  toolData: any = null;
}
let me;
@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MonitorComponent implements OnInit, AfterViewInit, OnDestroy {
  svgPanZoomOptions: SvgPanZoom.Options;
  visibleSideBar = false;
  menuItems: MenuItem[];
  layoutMenu: MenuItem[];
  layout: Rx.Observable<any>;
  svgDoc: svgjs.Doc;
  colorMap = [];
  modeColorMap = [];
  portColorMap = [];
  toolList: string[] = [];
  toolMap: Map<string, ToolMapData> = new Map<string, ToolMapData>();
  svgPanZoom: SvgPanZoom.Instance;
  portMap: any = {};
  @ViewChild('layoutContainer') layoutContainer: ElementRef;
  @ViewChild('op') toolInfoPanel: OverlayPanel;
  @Output() toolClicked: EventEmitter<any> = new EventEmitter<any>();
//  @ViewChild('localSvg') localSvg: ElementRef;
  toolInfoSet: svgjs.G[] = [];
  svg: SVGElement;
  filterNormalTool = false;
  lastToast: any;
  private _config: LocalConfig;
  get config(): LocalConfig {
    // transform value for display
    return this._config;
  }

  @Input() set config(config: LocalConfig) {
    this._config = config;
    if (config) {

      this.loadLayoutAndInitial();
    }
  }
  msgs: Message[];
  timer: Rx.Subscription;
  searchControl: FormControl;
  searchToolMap: Map<string, ToolMapData> = new Map<string, ToolMapData>();
  searchText = "";
//  private items: MenuItem[];
  constructor(public statusProvider: ToolStatusService, private localConfig: LocalConfigService
    , private serverConfig: ServerConfigService, private activatedRoute: ActivatedRoute
    , private router: Router, private syncService: SyncService) {
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
    me = this;
    this.searchControl = new FormControl('');
    this.menuItems = [
      {
          label: 'Layout',
//          icon: 'fa fa-fw fa-file-o',
          items: this.layoutMenu
      }
    ];
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
    this.searchControl.valueChanges.pipe(debounceTime(700)).subscribe(m => {
      this.filterSearchTool(m);
    });
  }

  filterSearchTool(input: string): any {
    const upperText = input.toUpperCase();
    this.toolMap.forEach((value, key) => {
      const tools = value.toolShapeGroup;
      const toolData = value.toolData;
      if (tools && toolData) {
        const display = toolData.id.startsWith(upperText) ? '' : 'none';

        tools.forEach(tool => {
          tool.toolShapeElement.style('display', display);
          if (tool.toolInfoGroup) {
            if (display === '') {
              tool.toolInfoGroup.toolTextGroup.show();
            } else {
              tool.toolInfoGroup.toolTextGroup.hide();
            }
          }
        });
      }
    });
  }

  onReorganize(event) {

  }

  // Note: this means svgPanZoom
  zoomHandler(event) {
    console.log(event);

    me.toolInfoSet.forEach(m => {
      let zoom = event; // me.svgPanZoom.getZoom();
      if (zoom >= 1 && zoom < 1.7) {
        return;
      }
      if (zoom >= 1.7) {
        zoom = zoom / 1.7;
      }
      m.transform({scaleX: 1 / zoom, scaleY: 1 / zoom});
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      this.timer.unsubscribe();
    }
  }

  unionViewBox(svgViewBox: ViewBox, toolClientRect: ClientRect, svgClientRect: ClientRect) {
    let diff: number;
    const svgLeft = toolClientRect.left - svgClientRect.left;
    const svgTop = toolClientRect.top - svgClientRect.top;
    if ((diff = svgViewBox.x - svgLeft) > 0) {
      svgViewBox.width += diff;
      svgViewBox.x = svgLeft;
    }
    if ((diff = svgViewBox.y - svgTop) > 0) {
      svgViewBox.height += diff;
      svgViewBox.y = svgTop;
    }
    if ((diff = toolClientRect.right - (svgViewBox.x + svgViewBox.width)) > 0) {
      svgViewBox.width += diff;
    }
    if ((diff = toolClientRect.bottom - (svgViewBox.y + svgViewBox.height)) > 0) {
      svgViewBox.height += diff;
    }
  }

  onToolClicked(event: any) {
    if (this.toolMap.get(event.srcElement.getAttribute('tool_id'))
      && this.toolMap.get(event.srcElement.getAttribute('tool_id')).toolData) {
      console.log('tool[' + event.srcElement.getAttribute('tool_id') + '] Clicked');
      const toolMapData = this.toolMap.get(event.srcElement.getAttribute('tool_id')).toolData;
      const toastMessage = `[${toolMapData.id}][${this.colorMap[+toolMapData.status].desc}][${toolMapData.comment}]`;
      const tool: svgjs.Element = adopt(event.srcElement);
      this.toolClicked.emit(event);
      // let toast = this.toastCtrl.create({
      //   message: toastMessage,
      //   duration: 8000,
      //   position: 'bottom',
      //   showCloseButton: true
      // });

      // toast.onDidDismiss(() => {
      //   console.log('Dismissed toast');
      // });

      // if (this.lastToast) {
      //   this.lastToast.dismiss();
      // }
      // this.lastToast = toast;
      // toast.present();
    }
  }

  addExtraElement(toolShapeGroup: ToolShapeGroup, toolClientRect: any
    , svgDoc: svgjs.Doc, svgClientRect: any, ratioX: number, ratioY: number) {
    const tool = toolShapeGroup.toolShapeElement;
    const id: string = this.toolMap[tool.attr('id')];
    const portList: string = tool.attr('port');
    const toolLeft = svgDoc.viewbox().x + (toolClientRect.left - svgClientRect.left) * ratioX;
    const toolTop = svgDoc.viewbox().y + (toolClientRect.top - svgClientRect.top) * ratioY;
    toolShapeGroup.toolShapeTransformedRect = {
      'left': toolLeft,
      'top': toolTop,
      'width': toolClientRect.width * ratioX,
      'height': toolClientRect.height * ratioY
    };
    const drawPort = false;
    if (portList && drawPort) {
      const ports = portList.split(' ');
      toolShapeGroup.toolPortElements = [];
      // draw port by layout data
      for (let i = 0; i < ports.length; i++) {
        const portData = ports[i].split(',');
        if (portData.length < 3) { continue; }
        let portID;
        if (this.config.currentFab === 'FAB1') {
          portID = tool.attr('tool_id') + '#' + portData[2].trim().replace(/^0+/gm, '');
        } else {
          portID = tool.attr('tool_id').substring(0, 6) + '00' + '#' + portData[2].trim().replace(/^0+/gm, '');
        }
        const port = svgDoc.circle(3);
        port.cx(toolLeft + parseFloat(portData[0]) + 3);
        port.cy(toolTop + parseFloat(portData[1]) + 3);
        port.radius(3);
        this.portMap[portID] = {
          portElement: port
        };

        toolShapeGroup.toolPortElements.push(port);

      }
    }

    const toolId: string = '' + tool.attr('tool_id');
    // add tool text
    if (toolId && toolId !== 'null') {
      if (toolId.length >= 8 && toolId.substring(6, 8) === '00') {
        const g = svgDoc.group();
        this.toolInfoSet.push(g);
        const toolInfoGroup: ToolInfoGroup = {
          toolTextBackGroundElement: g.rect(),
          toolTextElement: g.text('0'),
          toolTextGroup: g
        };
        const info = toolInfoGroup.toolTextElement;
        const backRect = toolInfoGroup.toolTextBackGroundElement;
        const bbox = info.bbox();
        info.style('fill', 'blue');
        info.style('fill-opacity', '80');
        info.x(toolLeft);
        info.y(toolTop);

        backRect.x(toolLeft);
        backRect.y(toolTop);
        backRect.width(bbox.width);
        backRect.height(bbox.height);
        backRect.fill({ color: 'white', opacity: 60 });
        toolShapeGroup.toolInfoGroup = toolInfoGroup;
      }
    }

  }

  resetForLayoutChange() {
    // if (this.svg) {
    //   while (this.svg.childNodes.length > 0) {
    //     this.svg.childNodes[0].remove();
    //   }

    //   for (let i = this.svg.attributes.length - 1; i >= 0; i--) {
    //     if (this.svg.attributes[i].name.startsWith('_ngcontent')) {
    //       continue;
    //     }
    //     this.svg.removeAttribute(this.svg.attributes[i].name);
    //   }
    // }
    this.svgPanZoomOptions = {
      viewportSelector: '.svg-pan-zoom_viewport'
      , panEnabled: true
      , controlIconsEnabled: false
      , zoomEnabled: true
      , dblClickZoomEnabled: false
      , mouseWheelZoomEnabled: true
      , preventMouseEventsDefault: false
      , zoomScaleSensitivity: 0.1
      , minZoom: 0.5
      , maxZoom: 10
      , fit: false
      , contain: false
      , center: true
      , refreshRate: 'auto'
      , beforeZoom: function () { }
      , onZoom: this.zoomHandler
      , beforePan: function (event) {
      }
      , onPan: function () { }
      , onUpdatedCTM: function () { }
      , customEventsHandler: svgEventHander
      , eventsListenerElement: null
    };
    this.toolInfoSet = [];
}

  loadLayoutAndInitial() {
    const cfg = this.config;
    this.layout = this.serverConfig.getLayout(cfg.currentLayout, cfg.currentFab, cfg.currentShop);
    this.config.currentFab = cfg.currentFab;
    this.toolList = [];
    this.toolMap = new Map<string, ToolMapData>();

    this.layout.subscribe(m => {
      this.resetForLayoutChange();
      // var parser = new DOMParser();
      // var doc = parser.parseFromString(m, "image/svg+xml");
      // let serverSvg = doc.querySelector('svg');
      //      this.svg = this.localSvg.nativeElement;//this.layoutContainer.nativeElement.querySelector('#svg-local');
      // for (let i = 0; i < localSvg.attributes.length; i++) {
      //   localSvg.setAttributeNode(localSvg.attributes[0]);
      // }
      // for (let i = 0; i < serverSvg.attributes.length; i++) {
      //   this.svg.setAttribute(serverSvg.attributes[i].name, serverSvg.attributes[i].value);
      // }

      // while (serverSvg.childNodes.length > 0) {
      //   this.svg.appendChild(serverSvg.childNodes[0]);
      // }
      this.layoutContainer.nativeElement.innerHTML = m;
      this.svg = this.layoutContainer.nativeElement.querySelector('svg');
      this.svg.setAttribute('preserveAspectRatio', 'none');
      const svgClientRect = this.svg.getBoundingClientRect();
      const svgDoc = new Doc(this.layoutContainer.nativeElement.querySelector('svg'));

      this.svgDoc = svgDoc;
      const ratioX = svgDoc.viewbox().width / svgClientRect.width;
      const ratioY = svgDoc.viewbox().height / svgClientRect.height;
      const allNode = svgDoc.select('*');
      let svgViewBox: ViewBox;
      allNode.each((index, toolSet) => {
        const tool = toolSet[index];
        const toolClientRect = tool.node.getBoundingClientRect();
        if (!svgViewBox) {
          svgViewBox = new ViewBox(toolClientRect.left, toolClientRect.top, toolClientRect.width, toolClientRect.height);
        } else {
          this.unionViewBox(svgViewBox, toolClientRect, svgClientRect);
        }
        if (tool.attr('tool_id') && tool.attr('tool_id') !== 'null') {
          tool.click(($event) => {
            this.onToolClicked(event);
          });
          tool.on('contextmenu', ($event) => {
            this.onToolClicked(event);
          });
          tool.on('mouseleave', () => {
            this.msgs = [];
          });

          tool.on('mouseover', ($event) => {
            if (event.srcElement.attributes['tool_id']) {
              const toolID = event.srcElement.attributes['tool_id'].value;
              // console.log('mouse over tool-' + event.srcElement.attributes['tool_id'].value);
              const toolsClientRect = event.srcElement.getClientRects()[0];
              const svgRect = this.svg.getClientRects()[0];
              me.msgs = [];
              if (!this.toolMap.get(toolID)) {
                console.log("toolMap return null. toolId=[" + toolID + "].");
                return;
              }
              const toolMapData = this.toolMap.get(toolID).toolData;
              if (toolMapData) {
                const toastMessage = `[${toolMapData.id}][${this.colorMap[+toolMapData.status].desc}][${toolMapData.comment}]`;
                me.msgs.push({severity: '', summary: toolID
                          , detail: toastMessage});
              }
            }
          });
          const toolId = tool.attr('tool_id');
          this.toolList.push(toolId);
          let firstFound = false;
          if (!this.toolMap.get(toolId)) {
            this.toolMap.set(toolId, new ToolMapData());
            firstFound = true;
          }

          const toolGroup = new ToolShapeGroup();
          toolGroup.toolShapeElement = tool;
          this.toolMap.get(toolId).toolShapeGroup.push(toolGroup);
          if (firstFound) {
            this.addExtraElement(toolGroup, toolClientRect, svgDoc, svgClientRect, ratioX, ratioY);
          }
        }
      });

      svgDoc.viewbox(svgViewBox);
      svgDoc.attr('width', '100%');
      this.svgPanZoom = SvgPanZoom(this.svg, this.svgPanZoomOptions);
      this.setRefreshTimer();
    }, e => {
      // const toast = this.toastCtrl.create({
      //   message: '無法取得layout 資訊，可能為網路問題或權限未開啟。',
      //   duration: 8000,
      //   position: 'bottom',
      //   showCloseButton: true
      // });
      // if (this.lastToast) {
      //   this.lastToast.dismiss();
      // }
      // this.lastToast = toast;
      // toast.present();
    }, () => {
      // loading.dismiss();
    }); // layout subscribe
  }

  refreshToolStatus() {
    this.statusProvider.getToolStatus(this.toolList, this.config.currentShop).subscribe(m => {
      console.log('get status');
      // let svgClientRect = this.svg.getBoundingClientRect();
      // let ratioX = this.svgDoc.viewbox().width / svgClientRect.width;
      // let ratioY = this.svgDoc.viewbox().height / svgClientRect.height;

      m.forEach(toolData => {
        if (this.toolMap.get(toolData.id)) {
          const toolMapData = this.toolMap.get(toolData.id);
          toolMapData.toolData = toolData;
          toolMapData.toolShapeGroup.forEach(t => {
            t.toolShapeElement.style('fill', '#' + this.colorMap[+toolData.status].color);
            t.toolShapeElement.style('stroke', '#' + this.modeColorMap[+toolData.mode]);
            if (t.toolInfoGroup) {
              const backRect = t.toolInfoGroup.toolTextBackGroundElement;
              t.toolInfoGroup.toolTextElement.text('' + (+toolData.moveCount));
              const bbox = t.toolInfoGroup.toolTextElement.bbox();
              backRect.width(bbox.width);
              backRect.height(bbox.height);
            }
          });



          if (toolData.port_list != null) {
            for (let j = 0; j < toolData.port_list.length; j++) {
              let portID = '';
              const portData = toolData.port_list[j];
              if (this.config.currentFab === 'FAB1') {
                portID = toolData.id + '#' + toolData.port_list[j].port_id.replace(/^0+/gm, '');
              } else {
                portID = toolData.id.substring(0, 6) + '00' + '#' + portData.port_id.trim().replace(/^0+/gm, '');
              }
              if (this.portMap[portID]) {
                this.portMap[portID].portElement.style('fill', '#' + this.portColorMap[parseInt(portData.status, 10)].color);
                this.portMap[portID].portElement.style('stroke', '#' + this.portColorMap[parseInt(portData.status, 10)].color);
                this.portMap[portID].portData = portData;
              }
            }
          }
        }

      });
    });

  }

  // ngAfterViewInit() {
  // }
  searchChange(event) {
    console.log(event);
  }
  toggleFilter(event) {
    this.filterNormalTool = !this.filterNormalTool;
    this.toolMap.forEach((value, key) => {
      const tools = value.toolShapeGroup;
      const toolData = value.toolData;
      if (tools && toolData) {
        if (+toolData.status === 1 && toolData.id.substring(6, 8) !== '00') { // status is run
          tools.forEach(tool => {
            tool.toolShapeElement.style('display', this.filterNormalTool ? 'none' : '');
          });
        }
      }
    });
  }

  setRefreshTimer() {
    if (this.timer) {
      this.timer.unsubscribe();
    }
    this.timer = timer(500, this.config.refreshInterval * 60 * 1000).subscribe(t => this.refreshToolStatus());
  }

  ionViewWillEnter(event) {
    console.log('enter monitor!');
  }

  ionViewWillLeave(event) {
    console.log('leave monitor!');
    this.timer.unsubscribe();
    this.timer = null;
  }

  handlePinch(event) {
    console.log('handle pinch');
  }

  enterConfig(event) {
  }

  onMenuClick(event) {
    console.log(event);
  }
}




// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-monitor',
//   templateUrl: './monitor.component.html',
//   styleUrls: ['./monitor.component.css']
// })
// export class MonitorComponent implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }

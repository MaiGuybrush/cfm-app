import { Component, OnInit, EventEmitter, Output, AfterViewInit, OnDestroy, Input
          , ElementRef, ViewChild, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Message } from 'primeng/api';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Doc, ViewBox, adopt } from 'svg.js';
import * as SvgPanZoom from 'svg-pan-zoom';
import 'hammerjs';

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
  toolData: ToolStyle = null;
}

export class ToolStyle {
  id: string;
  fillStyleIdx?: number;
  strokeStyleIdx?: number;
  info: string;
  comment?: string;
  portsStyle: PortStyle[];
}

export class PortStyle {
  id: string;
  fillStyleIdx?: number;
  strokeStyleIdx?: number;
}

let me;

@Component({
  selector: 'app-layout-svg',
  templateUrl: './layout-svg.component.html',
  styleUrls: ['./layout-svg.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class LayoutSvgComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  svgPanZoomOptions: SvgPanZoom.Options;
  visibleSideBar = false;
  layout: Observable<any>;
  svgDoc: svgjs.Doc;
  @Input() colorMap = [];
  @Input() modeColorMap = [];
  @Input() portColorMap = [];
  toolList: string[] = [];
  toolMap: Map<string, ToolMapData> = new Map<string, ToolMapData>();
  svgPanZoom: SvgPanZoom.Instance;
  portMap: any = {};
  @Output() toolClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() initialized: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Input() convertToolIdForPortStatus: (toolId: string) => string;
  @Input() layoutSvgRaw: string;
  @Input() layoutModel: ToolStyle[];
  @ViewChild('layoutContainer') layoutContainer: ElementRef;
  toolInfoSet: svgjs.G[] = [];
  svg: SVGElement;
  filterNormalTool = false;
  lastToast: any;

  msgs: Message[];
  searchControl: FormControl;
  searchToolMap: Map<string, ToolMapData> = new Map<string, ToolMapData>();
  searchText = "";

  constructor() {
    me = this;
    this.searchControl = new FormControl('');
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.layoutSvgRaw && this.layoutSvgRaw) {
      this.loadLayoutAndInitial();
    }
    if (changes.layoutModel && this.layoutModel) {
      this.refreshToolStatus();
    }
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
      // const toolMapData = this.toolMap.get(event.srcElement.getAttribute('tool_id')).toolData;
      // const toastMessage = `[${toolMapData.id}][${this.colorMap[+toolMapData.status].desc}][${toolMapData.comment}]`;
      // const tool: svgjs.Element = adopt(event.srcElement);
      this.toolClicked.emit(event);
    }
  }

  addExtraElement(toolShapeGroup: ToolShapeGroup, toolClientRect: any
    , svgDoc: svgjs.Doc, svgClientRect: any, ratioX: number, ratioY: number) {
    const tool = toolShapeGroup.toolShapeElement;
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
        let toolID = tool.attr('tool_id');
        if (this.convertToolIdForPortStatus) {
          toolID = this.convertToolIdForPortStatus(tool.attr('tool_id'));
        }
        portID = tool.attr('tool_id') + '#' + portData[2].trim().replace(/^0+/gm, '');
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
    this.resetForLayoutChange();
    this.toolList = [];
    this.toolMap = new Map<string, ToolMapData>();
    this.layoutContainer.nativeElement.innerHTML = this.layoutSvgRaw;
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
              const toastMessage = `[${toolMapData.id}][${this.colorMap[+toolMapData.fillStyleIdx].desc}][${toolMapData.comment}]`;
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
    this.initialized.emit(this.toolList);
  }

  refreshToolStatus() {
    const layoutModel = this.layoutModel;
    layoutModel.forEach(toolData => {
      if (this.toolMap.get(toolData.id)) {
        const toolMapData = this.toolMap.get(toolData.id);
        toolMapData.toolData = toolData;
        toolMapData.toolShapeGroup.forEach(t => {
          if (toolData.fillStyleIdx >= 0 && toolData.fillStyleIdx < this.colorMap.length) {
            t.toolShapeElement.style('fill', '#' + this.colorMap[toolData.fillStyleIdx].color);
          }
          if (toolData.strokeStyleIdx >= 0 && toolData.strokeStyleIdx < this.modeColorMap.length) {
            t.toolShapeElement.style('stroke', '#' + this.modeColorMap[toolData.strokeStyleIdx]);
          }
          if (t.toolInfoGroup) {
            const backRect = t.toolInfoGroup.toolTextBackGroundElement;
            t.toolInfoGroup.toolTextElement.text('' + (+toolData.info));
            const bbox = t.toolInfoGroup.toolTextElement.bbox();
            backRect.width(bbox.width);
            backRect.height(bbox.height);
          }
        });



        if (toolData.portsStyle != null) {
          for (let j = 0; j < toolData.portsStyle.length; j++) {
            let toolID = '';
            const portData = toolData.portsStyle[j];
            toolID = this.convertToolIdForPortStatus ? this.convertToolIdForPortStatus(toolData.id) : toolData.id;
            const portID = toolID + toolData.portsStyle[j].id.replace(/^0+/gm, '');
            if (this.portMap[portID]) {
              if (portData.fillStyleIdx >= 0 && portData.fillStyleIdx < this.portColorMap.length) {
                this.portMap[portID].portElement.style('fill', '#' + this.portColorMap[portData.fillStyleIdx]);
                this.portMap[portID].portElement.style('stroke', '#' + this.portColorMap[portData.strokeStyleIdx]);
              }
              this.portMap[portID].portData = portData;
            }
          }
        }
      }
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
        if (+toolData.fillStyleIdx === 1 && toolData.id.substring(6, 8) !== '00') { // status is run
          tools.forEach(tool => {
            tool.toolShapeElement.style('display', this.filterNormalTool ? 'none' : '');
          });
        }
      }
    });
  }

  ionViewWillEnter(event) {
    console.log('enter monitor!');
  }

  ionViewWillLeave(event) {
    console.log('leave monitor!');
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

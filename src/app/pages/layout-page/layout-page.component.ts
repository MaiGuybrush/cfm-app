import { Component, OnInit, ViewEncapsulation, ViewChild, OnChanges, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { ServerConfigService } from '../../services/server-config.service';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SyncService } from '../../services/sync.service';
import { Observable, concat } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Api } from '../../services/api';
import { LocalConfigService } from '../../services/local-config.service';
import { LocalConfig } from '../../models/local-config';
import { HttpUrlEncodingCodec } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { LayoutRawComponent } from '../../components/layout-raw/layout-raw.component';
import { Doc, Element, ViewBox, adopt, Rect } from 'svg.js';
import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

class BlockRect {
  bottom: number;
  top: number;
  left: number;
  right: number;
  get width(): number {
    return this.right - this.left;
  }
  get height(): number {
    return this.bottom - this.top;
  }
}
class LineCateInfo {
  constructor(lineCate: string, lineCount: number, maxSubToolCount: number) {
    this.lineCate = lineCate;
    this.lineCount = lineCount;
    this.maxSubToolCount = maxSubToolCount;
  }
  lineCate: string;
  lineCount: number;
  private _maxSubToolCount = 0;
  private _lineWidth = 1;
  private _lineHeight = 1;
  private _totalHeight = 0;
  private _totalWidth = 0;

  private _lineColSize = -1;

  get lineColSize(): number {
    return this.lineColSize;
  }

  set lineColSize(value: number) {
    this._lineColSize = value;
    if (this._lineColSize === -1) {
      this._totalWidth = this._lineWidth;
    }
    this._totalWidth = Math.ceil(this.lineCount / this._lineColSize) * this._lineWidth;

    if (this._lineColSize === -1) {
      this._totalHeight = this._lineHeight * this.lineCount;
    }
    this._totalHeight = this._lineHeight * this._lineColSize;

  }

  get totalArea(): number {
    return this.lineCount * this._lineHeight * this._lineWidth;
  }

  get totalWidth(): number {
    return this._totalWidth;
  }

  get totalHeight(): number {
    return this._totalHeight;
  }

  set maxSubToolCount(value: number) {
    this._maxSubToolCount = value;
    if (value === 0) {
      this._lineWidth = 1;
      this._lineHeight = 1;
    } else {
      this._lineWidth = value > 5 ? 4 : 2;
      this._lineHeight = value > 5 ?
        Math.ceil(value / 10) : Math.ceil(value / 5);
    }
  }
  get maxSubToolCount(): number {
    return this._maxSubToolCount;
  }

  get lineWidth(): number {
    return this._lineWidth;
  }

  get lineHeight(): number {
    return this._lineHeight;
  }

  isFit(block: BlockRect): number {
    if (block.height < this._lineHeight) {
      return -99;
    }
    if (this.totalHeight <= block.height) {
      return block.width - this.totalWidth;
    } else {
      this._lineColSize = Math.ceil(this.lineCount / 2);
      return this.isFit(block);
    }

  }

  putInBlock(blocks: BlockRect[]): BlockRect[] {
    const remainBlocks: BlockRect[] = [];
    let candidate: BlockRect = null;
    let candidateShort = 0;
    blocks.forEach(block => {
      const short = this.isFit(block);
      if (short < 0) {
        if (!candidate || candidateShort < short) {
          candidate = block;
          candidateShort = short;
        }
        return;
      }
      if (block.height - this.totalHeight > 1) {
        remainBlocks.push({
          top: block.top + this.totalHeight,
          left: block.left,
          right: this.totalWidth,
          bottom: block.height,
          height: block.height - this.totalHeight,
          width: block.width
        });
      }
      if (block.width - this.totalWidth > 1) {
        remainBlocks.push({
          top: block.top,
          left: block.left,
          right: this.totalWidth,
          bottom: block.height,
          height: block.height - this.totalHeight,
          width: block.width
        });
      }
    });
    return remainBlocks;
  }
}

@Component({
  selector: 'app-layout-page',
  templateUrl: './layout-page.component.html',
  styleUrls: ['./layout-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutPageComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChildren(LayoutRawComponent) layoutRaws: QueryList<LayoutRawComponent>;
  layoutList: Observable<string[]>;
  content: SVGElement;
  fab: string;
  constructor( private localConfig: LocalConfigService, private serverConfig: ServerConfigService,
    private activatedRoute: ActivatedRoute, private userService: UserService, private route: Router) {
    this.activatedRoute.params.subscribe(params => {
      const fab = params['fab'];
      if (!fab && this.userService.currentUser.Shops.length > 0) {
        this.route.navigate(['/layout', this.localConfig.shopMap[this.userService.currentUser.Shops[0]].Fab]);
        return;
      }
      if (this.fab !== fab) {
        this.fab = fab;
        this.getLayoutList(fab);
      }
    });
    this.localConfig.fabSubject.subscribe(m => {
      this.fab = m;
      this.getLayoutList(m);
    });
  }

  private getLayoutList(fab: string) {
    this.layoutList = this.serverConfig.getLayoutList(fab, '');
  }

  ngOnInit() {
  }

  ngOnChanges() {

  }

  ngAfterViewInit() {
  }

  dropHandler(event) {   // TODO: 上傳layout 至server
    console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened)
    const files = event.files;
    for (const droppedFile of event.files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          // Here you can access the real file
          console.log(droppedFile.relativePath, file);

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  dragOverHandler(ev) {
    console.log('File(s) in drop zone');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  removeDragData(ev) {
    console.log('Removing drag data');

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to remove the drag data
      ev.dataTransfer.items.clear();
    } else {
      // Use DataTransfer interface to remove the drag data
      ev.dataTransfer.clearData();
    }
  }

  easyLayout(event: any) {
    console.log(this.layoutRaws.filter((item) =>
      item.fab === event.fab && item.layout === event.layout
    ));
    const svgElement = this.layoutRaws.filter((item) =>
        item.fab === event.fab && item.layout === event.layout
    )[0].layoutContainer.nativeElement.querySelector('svg');

    const svgDoc = new Doc(svgElement);

    const tools = svgDoc.select('[tool_id]');
    const lineMap = new Map<string, {lineId: string, toolIds: string[]}>();
    const toolIdSet = new Set<string>();
    tools.each((index, toolSet) => {
      const tool = toolSet[index];
      const toolId: string = tool.attr('tool_id');
      if (toolIdSet.has(toolId)) {
        return;
      }
      if (toolId && toolId !== 'null') {
        const lineId = toolId.length >= 6 ? toolId.substr(0, 6) : null;
        if (!lineId) { return; }
        if (!toolIdSet.has(toolId)) {
          toolIdSet.add(toolId);
        }
        if (!lineMap.has(lineId)) {
          lineMap.set(lineId, {lineId: lineId, toolIds: []});
        }
        lineMap.get(lineId).toolIds.push(toolId);
      }
    });
    const lines = Array.from(lineMap.values()).sort((a, b) => {
      return a.lineId > b.lineId ? 1 : -1;
    });
    const lineSummary = Array.from(
      lines.map((v, i, a) => {
        return { 'lineCate': v.lineId.substr(0, 4), 'subToolCount': v.toolIds.length };
      }).reduce((pv, cv, i, a) => {
        if (!pv.has(cv.lineCate)) {
          pv.set(cv.lineCate, new LineCateInfo(cv.lineCate, 1, cv.subToolCount));
        }
        pv.get(cv.lineCate).lineCount += 1;
        if (cv.subToolCount > pv.get(cv.lineCate).maxSubToolCount) {
          pv.get(cv.lineCate).maxSubToolCount = cv.subToolCount;
        }
        return pv;
      }, new Map<string, LineCateInfo>()).values()
    ).sort((a, b) => a.lineCount > b.lineCount ? 1 : -1);
    const width = 0, height = 0;
    const shortest = -1;
    const totalSize = lineSummary.map(m => m.lineCount * m.lineHeight * m.lineWidth).reduce((pv, m, i, array) => {
      return pv + m;
    });
    const estimateW = Math.ceil(Math.sqrt(totalSize / (14 * 9)) * 14);
    const estimateH = Math.ceil(Math.sqrt(totalSize / (14 * 9)) * 9);
    let blocks: BlockRect[] = [{top: 0, left: 0, width: estimateW, height: estimateH, right: estimateW, bottom: estimateH}];
    lineSummary.forEach((m, i, array) => {
      try {
        blocks = m.putInBlock(blocks);
      } catch (e) {

      }
    });
  }

  fileOver(event: any) {

  }

  fileLeave(event: any) {

  }
}


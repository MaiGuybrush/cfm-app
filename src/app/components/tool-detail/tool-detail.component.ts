import { Component, OnInit, ViewChild, ElementRef, Input, AfterContentInit } from '@angular/core';
import { OnChanges } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Doc, ViewBox, adopt, Transform, Matrix } from 'svg.js';

@Component({
  selector: 'app-tool-detail',
  templateUrl: './tool-detail.component.html',
  styleUrls: ['./tool-detail.component.css']
})
export class ToolDetailComponent implements OnInit, OnChanges, AfterViewInit, AfterContentInit {
  svg: SVGElement;
  svgHtml: HTMLElement;
  toolDoc: svgjs.Doc;
  toolId: string;
  tool: svgjs.Element;
  @Input() toolSvgRaw: string;
  @ViewChild('toolDetailContainer') toolDetailContainer: ElementRef;

  constructor() { }

  ngOnInit() {
    console.log("tool detail initial.");
    this.toolDetailContainer.nativeElement.innerHTML = "<svg>" + this.toolSvgRaw + "</svg>";
    this.svg = this.toolDetailContainer.nativeElement.querySelector('svg');
    this.svg.setAttribute('preserveAspectRatio', 'none');
    const svgClientRect = this.svg.getBoundingClientRect();
    this.toolDoc = new Doc(this.toolDetailContainer.nativeElement.querySelector('svg'));
//    this.tool = this.svg.querySelector('[tool_id');
    const toolSet = this.toolDoc.select('[tool_id]');
    if (toolSet.length() === 0) {
      return;
    }
    this.tool = toolSet.get(0);
    this.toolId = this.tool.attr("tool_id");
    const bBox = this.tool.bbox();

    const matrix = this.tool.ctm();
    this.tool.dmove(bBox.x * -1, bBox.y * -1);
    matrix.e = 0; // remove translate
    matrix.f = 0; // remove translate
    this.tool.matrix(matrix);
    this.toolDoc.viewbox(0 - 5, 0 - 5, bBox.width + 10, bBox.height + 10);
    this.toolDoc.width("100%");
    this.toolDoc.height("100%");
    console.log(this.tool.type);
  }

  ngAfterViewInit() {
    //      let bBox: svgjs.BBox = tool.bbox();
    //      tool.attr("transform", "translate(" + (bBox.x * -1) + "," + (bBox.y * -1) + ")");
    // tool.matrix(1, 0, 0, 1, bBox.x * -1, bBox.y * -1);
    // this.toolDoc.width("100%");
    // this.toolDoc.height("100%");
    // tool.translate(bBox.x * -1, bBox.y * -1);
  }

  ngAfterContentInit() {
  }

  ngOnChanges() {
  }

  toolOnClick(event) {
    console.log(this.tool.node.getBoundingClientRect());
  }
}

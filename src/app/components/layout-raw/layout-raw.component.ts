import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { ServerConfigService } from '../../services/server-config.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-layout-raw',
  templateUrl: './layout-raw.component.html',
  styleUrls: ['./layout-raw.component.css']
})
export class LayoutRawComponent implements OnInit {
  svg: SVGElement;
  @Input() fab: string;
  @Input() shop: string;
  @Input() layout: string;
  @ViewChild('layoutContainer') layoutContainer: ElementRef;

  constructor(private serverConfig: ServerConfigService) { 

  }

  ngOnInit() {
    // let fab = this.activatedRoute.snapshot.params['fab'];
    // let shop = this.activatedRoute.snapshot.queryParams['shop'];
    // let layout = this.activatedRoute.snapshot.queryParams['layout'];
    this.serverConfig.getLayout(this.layout, this.fab, "").subscribe(m => {
      this.layoutContainer.nativeElement.innerHTML = m;
      this.svg = this.layoutContainer.nativeElement.querySelector('svg');
      this.svg.setAttribute('preserveAspectRatio', 'none');
      this.svg.setAttribute('width', '100%');
      this.svg.setAttribute('height', '100%');

    });
  }

}

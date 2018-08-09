import {
  Component, Input, Output,
  EventEmitter, Renderer2, ElementRef, OnChanges, SimpleChange,Inject
} from '@angular/core';

@Component({
  selector: 'app-avatar',
  styles: [`
  :host{
    border-radius: "50%";
  }
  `],
  template: `
    <div class="avatar-container" [ngStyle]="hostStyle">
    <img *ngIf="src"
      [src]="src"
      [width]="size"
      [height]="size"
      [ngStyle]="avatarStyle"
      (error)="fetch($event)"
      class="avatar-content"
     />
   
   <div *ngIf="data && !src"
     [ngStyle]="avatarStyle"
     class="avatar-content">{{data}}</div>
   </div>`
  })
export class AvatarComponent implements OnChanges {

  @Input() round: boolean = true;
  @Input() size: number = 50;
  @Input() textSizeRatio: number = 3;
  @Input() bgColor: string;
  @Input() fgColor: string = "#FFF";
  @Input() borderColor: string;
  @Input() style: any = {};
  @Input() cornerRadius: number = 0;
  @Output() clickOnAvatar: EventEmitter<any> = new EventEmitter<any>();

  _currentSource: number = 0;
  // avatar img src
  @Input() src: string;
  // avatar text value
  data: string;

  avatarStyle: any = {}
  hostStyle: any = {};

  constructor(public renderer: Renderer2, public elementRef: ElementRef) {
    // listen to click events on the root element
    this.renderer.listen(this.elementRef.nativeElement, "click", (event) => {
      this.clickOnAvatar.emit();
    });
  }

  /**
   * Detect inputs change
   * 
   * @param {{ [propKey: string]: SimpleChange }} changes 
   * 
   * @memberof AvatarComponent
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (let propName in changes) {
      // if (this.avatarService.isSource(propName)) {
      //   let currentValue = changes[propName].currentValue;
      //   this._addSource(propName, currentValue);
      // }

    }
    // reintialize the avatar component when a source property value has changed
    // the fallback system must be re-invoked with the new values.
    this._initializeAvatar()

  }

  /**
   * Initialize the avatar component and its fallback system
   */
  _initializeAvatar() {
    this._currentSource = 0;
    this.hostStyle = {
      width: this.size + 'px',
      height: this.size + 'px'
    }
    this.avatarStyle = this._initialsStyle();
  }

  /**
   * 
   * @returns initials style
   * 
   * @memberOf AvatarComponent
   */
  _initialsStyle() {
    return {
      textAlign: 'center',
      borderRadius: this.round ? '100%' : this.cornerRadius + 'px',
      border: this.borderColor ? '1px solid ' + this.borderColor : '',
      textTransform: 'uppercase',
      color: this.fgColor,
      backgroundColor: this.bgColor,
      font: Math.floor(this.size / this.textSizeRatio) + 'px Helvetica, Arial, sans-serif',
      lineHeight: this.size + 'px',
      ...this.style
    }

  }

  /**
   * 
   * @returns image style
   * 
   * @memberOf AvatarComponent
   */
  _imageStyle() {
    return {
      maxWidth: '100%',
      borderRadius: this.round ? '50%' : this.cornerRadius + 'px',
      border: this.borderColor ? '1px solid ' + this.borderColor : '',
      width: this.size,
      height: this.size,
      ...this.style
    }
  }
}
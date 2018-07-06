import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MDBBootstrapModule, ModalModule } from 'angular-bootstrap-md';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from './app-routing.module';
import { MonitorComponent } from './components/monitor/monitor.component';
import { ToolStatusService } from './services/tool-status.service';
import { ServerConfigService } from './services/server-config.service';
import { HttpClientModule } from '@angular/common/http';
import { DropdownModule, WavesModule } from 'angular-bootstrap-md';
import { SyncService } from './services/sync.service';
import { MonitorPageComponent } from './pages/monitor-page/monitor-page.component';
import { TieredMenuModule } from 'primeng/tieredmenu';
import {ButtonModule} from 'primeng/button';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {TooltipModule} from 'primeng/tooltip';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {GrowlModule} from 'primeng/growl';
@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    MonitorComponent,
    MonitorPageComponent,
    LayoutPageComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MDBBootstrapModule,
    MessageModule,
    MessagesModule,
    TooltipModule,
    BrowserAnimationsModule,
    OverlayPanelModule,
    ModalModule.forRoot(),
    DropdownModule.forRoot(),
    WavesModule,
    TieredMenuModule,
    ButtonModule,
    GrowlModule
  ],
  providers: [
    ToolStatusService,
    ServerConfigService,
    SyncService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

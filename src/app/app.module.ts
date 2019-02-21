import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MDBBootstrapModule, ModalModule, InputsModule, DropdownModule, WavesModule } from 'angular-bootstrap-md';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from './app-routing.module';
import { ToolStatusService } from './services/tool-status.service';
import { ServerConfigService } from './services/server-config.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SyncService } from './services/sync.service';
import { MonitorPageComponent } from './pages/monitor-page/monitor-page.component';
import { TieredMenuModule } from 'primeng/tieredmenu';
import {DragDropModule} from 'primeng/dragdrop';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { PanelMenuModule } from 'primeng/panelmenu';
import { GrowlModule } from 'primeng/growl';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonitorSidebarComponent } from './components/monitor-sidebar/monitor-sidebar.component';
import { AlwaysAuthGuard } from './auth/always-auth.guard';
import { AuthenticateModule } from './pages/authenticate/authenticate.module';
import { UserService } from './services/user.service';
import { JwtInterceptor } from './jwt-interceptor';
// import { InitializeComponent } from './components/initialize/initialize.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { LayoutRawComponent } from './components/layout-raw/layout-raw.component';
import { GlobalService } from './services/global-service';
import { FileDropModule } from 'ngx-file-drop';
import { ToolDetailComponent } from './components/tool-detail/tool-detail.component';
import { LayoutSvgComponent } from './components/layout-svg/layout-svg.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    MonitorPageComponent,
    LayoutPageComponent,
    MonitorSidebarComponent,
    // InitializeComponent,
    AvatarComponent,
    LayoutRawComponent,
    ToolDetailComponent,
    LayoutSvgComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    MDBBootstrapModule,
    InputsModule,
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
    SidebarModule,
    PanelMenuModule,
    AuthenticateModule,
    ProgressSpinnerModule,
    DragDropModule,
    GrowlModule,
    FileDropModule
  ],
  providers: [
    ToolStatusService,
    ServerConfigService,
    UserService,
    GlobalService,
    SyncService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    AlwaysAuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

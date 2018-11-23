import { Injectable } from "@angular/core";

@Injectable()
export class GlobalService {
  // public httpServer = "http://localhost:8080";
  public Shop = "LCD5";
  // public MesApi = "http://10.53.56.79/ApiGateway/mes/" + this.Shop; // for Dev LCD3
  // public RtqcsApi = "http://10.53.56.79/ApiGateway/rtqcs/" + this.Shop; // for Dev LCD3
  // public FileApi = "http://10.53.56.79/ApiGateway/FileService/FAB" + this.Shop.substr(this.Shop.length - 1) + "/"; // for Dev LCD3
  // public MesApi = "http://tncimap.cminl.oa/apps/mesclient/api"; // for Dev LCD3
  // public MesWeb = "http://tncimap.cminl.oa/apps/mesclient/zh-tw/{shop}"; // for Dev LCD3
  public MesApi = "http://hp06609p.cminl.oa/apps/mesclient/api"; // for Dev LCD3
  public MesWeb = "http://hp06609p.cminl.oa/apps/mesclient/zh-tw/{shop}"; // for Dev LCD3
  // public RtqcsApi = "http://10.53.56.79/ApiGateway/rtqcs/" + this.Shop; // for Dev LCD3
  // public FileApi = "http://10.53.56.79/ApiGateway/FileService/FAB" + this.Shop.substr(this.Shop.length - 1) + "/"; // for Dev LCD3
  // public httpServer = "http://localhost:9003";
  //  public httpServer = "http://" + window.location.host + "/rtqcsapi";  // for Demo
  public GlassSpecX = 0;
  public GlassSpecY = 0;

  public getOpiApiUrl(): string {
    return this.MesApi;
  }

  public getOpiWebUrl(shop: string): string {
    return this.MesWeb.replace("{shop}", shop ? shop : this.Shop);
  }
}

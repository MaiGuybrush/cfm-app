import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable()
export class GlobalService {
  // public httpServer = "http://localhost:8080";
  public Shop = "LCD5";
  // public MesApi = "http://10.53.56.79/ApiGateway/mes/" + this.Shop; // for Dev LCD3
  // public RtqcsApi = "http://10.53.56.79/ApiGateway/rtqcs/" + this.Shop; // for Dev LCD3
  // public FileApi = "http://10.53.56.79/ApiGateway/FileService/FAB" + this.Shop.substr(this.Shop.length - 1) + "/"; // for Dev LCD3
  public MesApi = environment.mesApi; // prod
  // public MesApi = "http://hp06609p.cminl.oa/ApiGateway/mesapi"; // for Dev LCD3
  // public MesWeb = "http://hp06609p.cminl.oa/apps/mesclient/zh-tw/{shop}"; // for Dev LCD3
  // public MesWeb = "http://hp06609p.cminl.oa/ApiGateway/mes/{shop}"; // for Dev LCD3
  public MesWeb = environment.mesWeb; // prod
  private OaAuthBase = environment.oaAuthBase;
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
    return this.MesWeb + "/" + (shop ? shop : this.Shop);
  }

  public getOaAuth(): string {
    return this.OaAuthBase;
  }
}

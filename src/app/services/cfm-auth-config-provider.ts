import { Injectable } from "@angular/core";
import { GlobalService } from './global.service';
import { AuthConfigProvider } from 'inx-auth-jwt-lib';

@Injectable()
export class CfmAuthConfigProvider extends AuthConfigProvider {
    constructor(private global: GlobalService) {
        super();
    }

    getAuthUrl(): string {
        return this.global.getOaAuth();
    }
}

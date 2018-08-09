import { EmpInfo } from "./emp-info";

export class AuthInfo {
    result: boolean;
    token: string;
    expire: string;
    empInfo: EmpInfo;  
    errorCode: string;
    errorMessage: string;
}


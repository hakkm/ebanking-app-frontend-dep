import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {

  constructor(
    private http: HttpClient
  ) { }


  /**
   * body : {
   *  code: string
   *  accountId: string || number
   *  userId: string || number
   * } 
   * @param body 
   * @returns 
   */
  payViaQRCode(body: any){
    
    return this.http.post(environment.apiUrl + "/client/qr-code/pay", body, {headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`
    }});
      

  }

  generateQRCode(body: any){
    return this.http.post(environment.apiUrl + "/client/qr-code", body, {headers: {"Authorization": `Bearer ${localStorage.getItem('auth_token')}`}})
  }

  getQRCode(code : string) {
    return this.http.get(environment.apiUrl + `/client/qr-code/${code}`);
  }

  getAllQRCodes(){
    return this.http.get(environment.apiUrl + "/client/qr-code", {headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`
    }});
  }
}

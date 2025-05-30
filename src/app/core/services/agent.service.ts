import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  constructor(
    private http: HttpClient
    
  ) { }


  login({name, password}: {name: string, password: string}) {
    
    return this.http.post(environment.apiUrl + '/agent/public/login', {name, password});
  }

  getTransactions(){
    return this.http.get(environment.apiUrl + '/agent/transactions');
  }

}

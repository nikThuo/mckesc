import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppConst } from '../../constants/app.const';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Origin': '*',
  })
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private serverURL:string = AppConst.serverPath;

  constructor(private http: HttpClient) { }

  loginUser(user){
    let url = this.serverURL+'accounts/login/';
    return this.http.post(url, user, httpOptions) 
  }

  resetPassword(reset){
    let url = this.serverURL+'accounts/forgot_password/';
    return this.http.post(url, reset, httpOptions);
  }
}

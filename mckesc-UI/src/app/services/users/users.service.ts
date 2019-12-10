import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppConst } from '../../constants/app.const';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private serverURL:string = AppConst.serverPath;

  constructor(private http: HttpClient) { }

  getUsers(){
    let url = this.serverURL+'accounts/users/';
    return this.http.get(url, httpOptions); 
  }

  createUser(user){
    let url = this.serverURL+'accounts/register/';
    return this.http.post(url, user, httpOptions) 
  }

  resetPass(pass){
    let url = this.serverURL+'accounts/resetpass/';
    return this.http.post(url, pass, httpOptions) 
  }

  searchUsername(name: string): Observable<any> {
    let url = this.serverURL+'accounts/search/username/?q='+name;
    return this.http.get(url)
    .pipe(
      tap((response: any) => {
        return response;
      })
    );
  }

  searchEmail(email: string): Observable<any> {
    let url = this.serverURL+'accounts/search/email/?q='+email;
    return this.http.get(url)
    .pipe(
      tap((response: any) => {
        return response;
      })
    );
  }

  changeUsertype(user){
    let url = this.serverURL+'accounts/change_usertype/';
    return this.http.post(url, user, httpOptions) 
  }

  updateUser(user){
    let url = this.serverURL+'accounts/update_user_project/';
    return this.http.post(url, user, httpOptions) 
  }
  
  deleteUser(user){
    let url = this.serverURL+'accounts/delete_user/';
    return this.http.post(url, user, httpOptions) 
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, last } from 'rxjs/operators';
import { AppConst } from '../../constants/app.const';
import { HttpRequest, HttpEventType, HttpEvent, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Http, Headers, RequestOptions} from '@angular/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    // 'Access-Control-Allow-Origin': '*',
  })
};

@Injectable({
  providedIn: 'root'
})

export class DataService {

  private serverURL:string = AppConst.serverPath;
  
  constructor(private http: HttpClient) { }

  searchName(name: string): Observable<any> {
    let url = this.serverURL+'search_esc_name/?q='+name;
    return this.http.get(url)
    .pipe(
      tap((response: any) => {
        return response;
      })
    );
  }

  newEscalation(formData) {
    let url = this.serverURL+'escalation/';
    return this.http.post(url, formData);
  }

  editEscalation(formData) {
    let url = this.serverURL+'edit_escalation/';
    return this.http.post(url, formData);
  }

  getEscalation(datefrom, dateto, user_id) {
    let url = this.serverURL+'escalations/'+datefrom+'/'+dateto+'/'+user_id+'/';
    return this.http.get(url, httpOptions);
  }

  downloadEscalations(datefrom, dateto, user_id){
    let url = this.serverURL+'download_escalations/'+datefrom+'/'+dateto+'/'+user_id+'/';
    return this.http.get(url)
    .pipe(
      tap((response: any) => {
        console.log(response)
        return response;
      })
    );
  }
  
  getAttachments(id){
    let url = this.serverURL+'attachments/'+id+'/';
    return this.http.get(url, httpOptions);
  }

  createHuddle(huddle){
    let url = this.serverURL+'huddle/';
    return this.http.post(url, huddle); 
  }

  getHuddles(datefrom, dateto) {
    let url = this.serverURL+'huddles/'+datefrom+'/'+dateto+'/';
    return this.http.get(url, httpOptions);
  }

  getHuddleDetails(id){
    let url = this.serverURL+'huddle_details/'+id+'/';
    return this.http.get(url, httpOptions);
  }

  viewUpdate(viewed){
    let url = this.serverURL+'viewed_update/';
    return this.http.post(url, viewed, httpOptions); 
  }

  getUpdateViewsDetails(id){
    let url = this.serverURL+'updateview_details/'+id+'/';
    return this.http.get(url, httpOptions);
  }

  deleteFile(id){
    let url = this.serverURL+'delete_attachment/';
    return this.http.post(url, id, httpOptions);  
  }

  createClarification(clarification){
    let url = this.serverURL+'create_clarification/';
    return this.http.post(url, clarification, httpOptions);  
  }

  respondClarification(clarification){
    let url = this.serverURL+'respond_clarification/';
    return this.http.post(url, clarification, httpOptions);  
  }

  getClarification(id){
    let url = this.serverURL+'get_clarification/'+id+'/';
    return this.http.get(url, httpOptions);
  }

  getMessages(id){
    let url = this.serverURL+'get_messages/'+id+'/';
    return this.http.get(url, httpOptions);
  }

  getToClarify(){
    let url = this.serverURL+'to_clarify/';
    return this.http.get(url, httpOptions); 
  }

  searchSubject(name: string): Observable<any> {
    let url = this.serverURL+'search_subject/?q='+name;
    return this.http.get(url)
    .pipe(
      tap((response: any) => {
        return response;
      })
    );
  }

}

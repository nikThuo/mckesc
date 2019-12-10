import { Component, OnInit, ViewChild, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../../../app.component'; 
import { DataService } from '../../../services/data/data.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, Observable, of, concat } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap, finalize } from 'rxjs/operators/';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { ScrollToBottomDirective } from './scroll-to-bottom'

@Component({
  selector: 'app-clarify',
  templateUrl: './clarify.component.html',
  styleUrls: ['./clarify.component.css'],
	// changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('700ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('700ms ease-in', style({transform: 'translateY(-100%)'}))
      ])
    ]),
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ClarifyComponent implements OnInit {

	new_clarify: Clarify = new Clarify()
  clarifications: any;	
  to_clarify: any;	
  isAdmin = false;
  nameForm: FormGroup;
  visible: boolean = false;
  result_subjects: any;
  not_assigned: any;
  messages: any;
  isLoading = false;
  userId: any;
  @ViewChild(ScrollToBottomDirective)
  scroll: ScrollToBottomDirective;

  constructor(
    public appcomp: AppComponent,
    private _dataService: DataService,
    private formBuilder: FormBuilder,
    // private ref: ChangeDetectorRef
  ) {
    this.appcomp.checkLogin();
    // ref.detach();
    // setInterval(() => { this.ref.detectChanges(); }, 50);
  }

  ngOnInit() {
  	// this.userId = parseInt(sessionStorage.getItem('user_id'));
  	this.userId = sessionStorage.getItem('user_id');
    if (sessionStorage.getItem('user_type') != '2'){
      this.isAdmin = true;
	  	this.getToClarify();
    }else{
	  	this.getClarification();
    }
    this.nameForm = this.formBuilder.group({
      name: null
    })
    this.searchName('');
  }

  searchName(value){
    this.nameForm
    .get('name')
    .valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.isLoading = true),
      switchMap(value =>
        value == '' ? this.result_subjects = [] : this._dataService.searchSubject(value)
      .pipe(
        finalize(() => this.isLoading = false),
        )))
    .subscribe(result =>{
      if(result == 'Empty'){
        this.result_subjects = [];
      }else if(result.length==0){
        this.result_subjects = [];
      }else{
        this.result_subjects = result;
      }
    });
  }

  openForm() {
    this.visible = !this.visible;
  }
  closeForm() {
    this.visible = false;
		this.new_clarify = new Clarify();
    this.nameForm = this.formBuilder.group({
      name: null
    });
  }

  getClarification(){
  	this._dataService.getClarification(sessionStorage.getItem('user_id')).subscribe(data=>{
  		// this.clarifications = data;
  		this.to_clarify = data;
  	})
  }

  getToClarify(){
  	this._dataService.getToClarify().subscribe(data=>{
  		this.to_clarify = data;
  	});
  }

  fetchMessages(id){
  	this._dataService.getMessages(id).subscribe(data=>{
  		this.messages = data;
  	})
  }

  createClarification(item){
	  if(item != undefined){
	  	this.new_clarify['sender'] = sessionStorage.getItem('user_id');
	  	this.new_clarify['subject']= this.nameForm.get('name').value;
	  	this._dataService.createClarification(this.new_clarify).subscribe(data=>{
		  	this.closeForm();
		  	this.getClarification();
	  	});
	  }
  }

  respondClarification(item, id){
	  if(item != undefined){
	  	this.new_clarify['subject'] = id;
	  	this.new_clarify['responder'] = sessionStorage.getItem('user_id');
	  	this._dataService.respondClarification(this.new_clarify).subscribe(data=>{
	  		this.new_clarify = new Clarify();
		  	this.fetchMessages(id);
	  	});
	  }
  }
}

export class Clarify{
	clarification: any;
	subject: any;
	sender: any;
	responder: any;
}
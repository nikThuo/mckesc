import { Component, OnInit, ViewChild, Inject, ElementRef } from '@angular/core';
import { AppComponent } from '../../../app.component'; 
import { trigger, transition, animate, style, state } from '@angular/animations'
import { DataService } from '../../../services/data/data.service';
import { UsersService } from '../../../services/users/users.service';
import { DatePipe } from '@angular/common'
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppConst } from '../../../constants/app.const';

@Component({
  selector: 'app-huddle',
  templateUrl: './huddle.component.html',
  styleUrls: ['./huddle.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('700ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('700ms ease-in', style({transform: 'translateY(-100%)'}))
      ])
    ])
  ]
})
export class HuddleComponent implements OnInit {

  visible: boolean = false;
	new_huddle: Huddle = new Huddle();
  index: any;
  agenda_list = [];
  action_list = [];
  agenda: Agenda = new Agenda();
  action: Action = new Action();
  huddles_list: any;
  huddle_report: HuddleReport = new HuddleReport();
  displayedColumns = [
                      'shift_name',
											// 'total_agents',
											'date',
											'user',
											'created_at',
											'details',
                    ];
  dataSource: any;
  loading_filter: boolean = false;
  loading_download: boolean = false;
  isAdmin = false;
  displayedColumnsAttendees = ['name','check'];
  dataSourceAttendees: any;
  users_list: any;
  select_list = [];
  selection = new SelectionModel<any>(true, []);
  admin_list = [];
  agent_list = [];
  admin_present = new FormControl();
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  form: FormGroup;
  noFile: boolean = true;

  constructor(
    public _userService: UsersService,
    public appcomp: AppComponent,
    private _dataService: DataService,
    public datepipe: DatePipe,
    public dialog: MatDialog,
    private formbuilder: FormBuilder,
  ) {
    this.appcomp.checkLogin();
    this.createForm();
  }

  ngOnInit() {
    if (sessionStorage.getItem('user_type') != '2'){
      this.isAdmin = true;
    }
    this.huddle_report['datefrom'] = Date.now();
    this.huddle_report['dateto'] = Date.now();
  	this.fetchHuddles();
    this.fetchUsers();
  }
  
  openForm() {
    this.visible = true;
  }
  
  closeForm() {
    this.visible = false;
    this.agenda = new Agenda();
    this.action = new Action();
		this.new_huddle = new Huddle();
    this.agenda_list = [];
    this.action_list = [];
  }

  fetchUsers(){
    this._userService.getUsers().subscribe(data=>{
      this.users_list = data;
      for(let user of this.users_list){
        if (user.user_type == 1){
          this.admin_list.push(user);
        }else{
          this.agent_list.push(user);
        }
      }
      this.dataSourceAttendees = new MatTableDataSource(this.agent_list);
      this.dataSourceAttendees.paginator = this.paginator;
    });
  }

  isAllSelected() {
    if(this.select_list.includes(this.selection.selected)){
      this.index = this.select_list.indexOf(this.selection.selected);
      this.select_list.splice(this.index,1);
    }else{
      this.select_list.push(this.selection.selected)
    }
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceAttendees.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSourceAttendees.data.forEach(row => {
        this.selection.select(row)
        if(this.select_list.includes(row)){
          this.index = this.select_list.indexOf(row);
          this.select_list.splice(this.index,1);
        }else{
          this.select_list.push(row)
        }
      });
    // console.log(this.selection.selected);
  }

  applyFilter(filterValue: string) {
    this.dataSourceAttendees.filter = filterValue.trim().toLowerCase();
  }

  pileItem(item:any){
	  if(item != undefined){
	    this.agenda_list.push(item)
	    this.agenda = new Agenda();
  	}
  }

  removeItem(item:any){
    this.index = this.agenda_list.indexOf(item);
    this.agenda_list.splice(this.index,1);
  }

  pileAction(item:any){
	  if(item != undefined){
	    this.action_list.push(item)
	    this.action = new Action();
  	}
  }

  removeAction(item:any){
    this.index = this.action_list.indexOf(item);
    this.action_list.splice(this.index,1);
  }

  createForm(){
    this.form = this.formbuilder.group({
      file: null
    });
  }
  onFileChange(event) {
    if(event.target.files.length > 0) {
      let file = event.target.files[0];
      this.form.get('file').setValue(file);
    }
    if(event.target.files.length < 1){
      this.noFile = true;
    }else{
      this.noFile = false;
    }
  }
  private prepareSave(): any {
    let input = new FormData();
    this.new_huddle['conducted_by'] = this.admin_present.value;
  	this.new_huddle['agenda'] = this.agenda_list;
  	this.new_huddle['action'] = this.action_list;
    input.append('file', this.form.get('file').value);
    input.append('attendees', JSON.stringify(this.selection.selected));
    input.append('conducted_by', JSON.stringify(this.new_huddle['conducted_by']));
    input.append('agenda', JSON.stringify(this.new_huddle['agenda']));
    input.append('action', JSON.stringify(this.new_huddle['action']));
    input.append('user_id', sessionStorage.getItem('user_id'));
    input.append('shift_name', this.new_huddle['shift_name']);
    input.append('date', this.datepipe.transform(this.new_huddle['date'], 'yyyy-MM-dd'));
    this.noFile = false;
    return input;
  }
  clearFile() {
    this.form.get('file').setValue(null);
    this.noFile = true;
  }

  createHuddle(){
    const formModel = this.prepareSave();
  	this._dataService.createHuddle(formModel).subscribe(data=>{
  		this.closeForm();
  		this.fetchHuddles();
  	})
  }

  fetchHuddles(){
    this.huddle_report['datefrom'] = this.datepipe.transform(this.huddle_report['datefrom'], 'yyyy-MM-dd');
    this.huddle_report['dateto'] = this.datepipe.transform(this.huddle_report['dateto'], 'yyyy-MM-dd');
  	this._dataService.getHuddles(this.huddle_report['datefrom'], this.huddle_report['dateto']).subscribe(data=>{
  		this.huddles_list = data;
      this.dataSource = new MatTableDataSource(this.huddles_list);
      // this.dataSource.paginator = this.paginator;
  	})
  }

  openHuddleDetailDialog(huddle){
    let dialogRef = this.dialog.open(HuddleDetailDialog, {
      width: '800px',
      data: huddle
    });
  }
}

export class Huddle{
	shift_name: any;
  conducted_by: any;
	date: any;
	action: any;
	agenda: any;
	user_id: any;
	attendees: any;
}

export class Agenda{
	agenda: any;
}

export class Action{
	action: any;
}

export class HuddleReport{
  datefrom: any;
  dateto: any;
}

@Component({
  selector: 'huddle_detail',
  templateUrl: 'modals/huddle_detail.html',
})
export class HuddleDetailDialog implements OnInit{

  huddle: any;
  agenda: any;
  action: any;
  attendees: any;
  conducted_by: any;
  res;
  src;
  private serverPath: string = AppConst.mediaPath;

  constructor(
    private _dataService: DataService,
    public dialogRef: MatDialogRef<HuddleDetailDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  
  ngOnInit(){
    this.huddle = this.data;
    this.src = this.serverPath+this.huddle.image;
    this._dataService.getHuddleDetails(this.huddle.id).subscribe(data=>{
      this.res = data;
      this.huddle['agenda'] = this.res.agenda;
      this.huddle['action'] = this.res.action;
      this.huddle['attendees'] = this.res.attendees;
      this.huddle['conducted_by'] = this.res.conducted_by;
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

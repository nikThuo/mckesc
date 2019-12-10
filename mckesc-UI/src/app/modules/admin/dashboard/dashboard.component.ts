import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { AppComponent } from '../../../app.component'; 
import { DataService } from '../../../services/data/data.service';
import * as Pusher from '../../../../pusher.min.js'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, Observable, of, concat } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap, finalize } from 'rxjs/operators/';
import { FileUploader, FileLikeObject } from 'ng2-file-upload';
import { trigger, transition, animate, style, state } from '@angular/animations'
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { AppConst } from '../../../constants/app.const';
import { DatePipe } from '@angular/common'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
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

export class DashboardComponent implements OnInit {

  nameForm: FormGroup;
  isLoading = false;
  isAdmin = false;
  isSaving = false;
  owner_id: any;
  result_name: any;
  visible: boolean = false;
  new_ecs: Escalation = new Escalation();
  form: FormGroup;
  public uploader: FileUploader = new FileUploader({});
  public hasBaseDropZoneOver: boolean = false;
  index: any;
  escalations: any = [];
  displayedColumns = [
                      'name',
                      'from_name',
                      'channel_received',
                      'date',
                      'state',
                    ];
  dataSource: any;
  expandedElement: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  attachments: any;
  emp_files: any;

  esc_report: EscReport = new EscReport();
  loading_filter: boolean = false;
  loading_download: boolean = false;
  reportdata: any;
  simpleObservable: any;
  currentItem: any;
  currentHeader: boolean= false;
  date = new Date();

  private serverPath: string = AppConst.mediaPath;

  constructor(
    private formBuilder: FormBuilder,
    public appcomp: AppComponent,
    private fb: FormBuilder,
    private _dataService: DataService,
    public datepipe: DatePipe,
    public dialog: MatDialog,
  ) { 
    this.appcomp.checkLogin();
  }

  ngOnInit() {
    if (sessionStorage.getItem('user_type') != '2'){
      this.isAdmin = true;
      this.owner_id = parseInt(sessionStorage.getItem('user_id'));
    }
    this.nameForm = this.formBuilder.group({
      name: null
    })
    this.form = this.formBuilder.group({
      profile: ['']
    });
    // this.esc_report['datefrom'] = new Date(Date.now());
    // this.esc_report['dateto'] = new Date(Date.now());
    this.esc_report['dateto'] = this.date.setDate(this.date.getDate());
    this.esc_report['datefrom'] = this.date.setDate(this.date.getDate() - 10);
    this.fetchEscalations();
    this.searchName('');

    // Enable pusher logging - don't include this in production
    // Pusher.logToConsole = true;
    var pusher = new Pusher('88e089bdad7cd752de3d', {
      cluster: 'ap2',
      forceTLS: true
    });
    var channel = pusher.subscribe('newupdate-channel');
    this.simpleObservable = new Observable((observer) => {
      channel.bind('newupdate-event', function(res) {
        observer.next(res)
      });
    })
    this.simpleObservable.subscribe((event)=>{
      let item = event;
      if(item.user_id == sessionStorage.getItem('user_id')){
        item.viewed = true;
      }
      navigator.serviceWorker.getRegistration().then(function(reg) {
        reg.showNotification('Hello MCK!');
      });
      this.escalations.unshift(item);
      this.dataSource = new MatTableDataSource(this.escalations);
      this.dataSource.paginator = this.paginator;
    })
  }

  openForm() {
    this.visible = true;
  }
  closeForm() {
    this.visible = false;
    this.new_ecs = new Escalation();
    this.nameForm = this.formBuilder.group({
      name: null
    })
    this.form = this.formBuilder.group({
      profile: ['']
    });
    this.uploader.queue = [];
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  fetchEscalations(){
    this.loading_filter = true;
    this.esc_report['datefrom'] = this.datepipe.transform(this.esc_report['datefrom'], 'yyyy-MM-dd');
    this.esc_report['dateto'] = this.datepipe.transform(this.esc_report['dateto'], 'yyyy-MM-dd');
    this._dataService.getEscalation(this.esc_report['datefrom'], this.esc_report['dateto'], sessionStorage.getItem('user_id')).subscribe(data =>{
      this.escalations = data;
      this.dataSource = new MatTableDataSource(this.escalations);
      this.dataSource.paginator = this.paginator;
      this.loading_filter = false;
    },error=>{
      this.loading_filter = false;
    })
  }

  fetchAttachments(item: any){
    this.currentItem = item.id;
    this.attachments = [];
    if(item.viewed == false){
      this.index = this.escalations.indexOf(item);
      this.escalations[this.index]['viewed'] = true;
      this.dataSource = new MatTableDataSource(this.escalations);
      this.dataSource.paginator = this.paginator;
      var viewed_update = {
        'update': item.id,
        'user_id': sessionStorage.getItem('user_id'),
      }
      this._dataService.viewUpdate(viewed_update).subscribe(data=>{ })
    }

    this._dataService.getAttachments(item.id).subscribe(data=>{
      this.attachments = data;
      for (var i in this.attachments) {
        if(this.attachments[i].file.endsWith('.pdf')){
          this.attachments[i].type = 'pdf'  
        }else if (
            this.attachments[i].file.endsWith('xlsx') || 
            this.attachments[i].file.endsWith('xml') || 
            this.attachments[i].file.endsWith('xls') || 
            this.attachments[i].file.endsWith('xlt') ||
            this.attachments[i].file.endsWith('ods') || 
            this.attachments[i].file.endsWith('ots') ||  
            this.attachments[i].file.endsWith('csv')){
          this.attachments[i].type = 'excel'  
        }else if (
            this.attachments[i].file.endsWith('odt') || 
            this.attachments[i].file.endsWith('ott') || 
            this.attachments[i].file.endsWith('dot') || 
            this.attachments[i].file.endsWith('doc') || 
            this.attachments[i].file.endsWith('docx') || 
            this.attachments[i].file.endsWith('docm') || 
            this.attachments[i].file.endsWith('fodt')){
          this.attachments[i].type = 'word'  
        }else if (
            this.attachments[i].file.endsWith('ppt') || 
            this.attachments[i].file.endsWith('xps') || 
            this.attachments[i].file.endsWith('pot') || 
            this.attachments[i].file.endsWith('pps') || 
            this.attachments[i].file.endsWith('pptx') || 
            this.attachments[i].file.endsWith('pptm') || 
            this.attachments[i].file.endsWith('potx') || 
            this.attachments[i].file.endsWith('potm') || 
            this.attachments[i].file.endsWith('ppsm') || 
            this.attachments[i].file.endsWith('ppam') || 
            this.attachments[i].file.endsWith('ppa')){
          this.attachments[i].type = 'powerpoint'  
        }else if (
            this.attachments[i].file.endsWith('tif') || 
            this.attachments[i].file.endsWith('png') || 
            this.attachments[i].file.endsWith('gif') || 
            this.attachments[i].file.endsWith('jpg') || 
            this.attachments[i].file.endsWith('jpeg') || 
            this.attachments[i].file.endsWith('JPEG')){
          this.attachments[i].type = 'picture'  
        }else{
          this.attachments[i].type = 'unknown'  
        }
        this.attachments[i].fileurl = this.serverPath+this.attachments[i].file
      }
    })
  }

  downloadAttachment(url){
    window.location.replace(url)
  }

  downloadEscalations(){
    this.loading_download = true;
    this.esc_report['datefrom'] = this.datepipe.transform(this.esc_report['datefrom'], 'yyyy-MM-dd');
    this.esc_report['dateto'] = this.datepipe.transform(this.esc_report['dateto'], 'yyyy-MM-dd');
    this._dataService.downloadEscalations(this.esc_report['datefrom'], this.esc_report['dateto'], sessionStorage.getItem('user_id')).subscribe(data=>{
      this.reportdata = data;
      window.location.replace(this.reportdata.url)
      this.loading_download = false;
    }, error =>{
      this.reportdata = error;
      // console.log(error);
      window.location.replace(this.reportdata.url)
      this.loading_download = false;
    })
  }

  searchName(value){
    this.nameForm
    .get('name')
    .valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.isLoading = true),
      switchMap(value =>
        value == '' ? this.result_name = [] : this._dataService.searchName(value)
      .pipe(
        finalize(() => this.isLoading = false),
        )))
    .subscribe(result =>{
      if(result == 'Empty'){
        this.result_name = [];
      }else if(result.length==0){
        this.result_name = [];
      }else{
        this.result_name = result;
      }
    });
  }

  fileOverBase(event):  void {
    this.hasBaseDropZoneOver  =  event;
  }

  getFiles(): FileLikeObject[] {
    return this.uploader.queue.map((fileItem) => {
      return fileItem.file;
    });
  }

  onChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.get('profile').setValue(file);
    }
  }

  removeFile(item:any){
    this.index = this.uploader.queue.indexOf(item);
    this.uploader.queue.splice(this.index,1);
  }

  createEscalation() {
    this.isSaving = true;
    let files = this.getFiles();
    let requests = [];
    let to_save = [];
    let formData = new FormData();
    files.forEach((file) => {
      formData.append('files' , file.rawFile, file.name);
    });
    formData.append('name' , this.nameForm.get('name').value );
    formData.append('user_id' , sessionStorage.getItem('user_id'));
    formData.append('date_received' , this.new_ecs['date_received']);
    formData.append('time_received' , this.new_ecs['time_received']);
    formData.append('from_name' , this.new_ecs['from_name']);
    formData.append('contents' , this.new_ecs['contents']);
    formData.append('channel_received' , this.new_ecs['channel_received']);
    // formData.append('channel_communicated' , this.new_ecs['channel_communicated']);
    // formData.append('time_cascaded' , this.new_ecs['time_cascaded']);
    if(this.new_ecs['from_email'] != ''){
      formData.append('from_email' , this.new_ecs['from_email']);
    }
    if(this.new_ecs['from_name']){
      formData.append('from_name' , this.new_ecs['from_name']);
    }
    this._dataService.newEscalation(formData).subscribe(data=>{
      this.isSaving = false;
      this.closeForm();
      this.new_ecs = new Escalation();
      this.nameForm = this.formBuilder.group({
        name: null
      })
      this.form = this.formBuilder.group({
        profile: ['']
      });
    },err=>{
      this.isSaving = false;
      console.log(err);
    });
  }

  openUpdateViewsDialog(update){
    let dialogRef = this.dialog.open(UpdateViewsDialog, {
      width: '800px',
      data: update
    });
  }

  openEditUpdateDialog(update){
    let dialogRef = this.dialog.open(EditUpdateDialog, {
      width: '1000px',
      data: update
    });
    dialogRef.afterClosed().subscribe(result => {
      this.fetchEscalations();
    });
  }
}

export class Escalation{
  date_received: any;
  time_received: any;
  from_email: any;
  from_name: any;
  name: any;
  contents: any;
  channel_received: any;
  // channel_communicated: any;
  // time_cascaded: any;
}

export class EscReport{
  datefrom: any;
  dateto: any;
}

@Component({
  selector: 'update_views',
  templateUrl: 'modals/update_views.html',
})
export class UpdateViewsDialog implements OnInit{

  update: any;
  res: any;
  has_viewed: any;
  hasnot_viewed: any;

  constructor(
    private _dataService: DataService,
    public dialogRef: MatDialogRef<UpdateViewsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  
  ngOnInit(){
    this.update = this.data;
    this._dataService.getUpdateViewsDetails(this.update.id).subscribe(data=>{
      this.res = data;
      this.update['has_viewed'] = this.res.has_viewed;
      this.update['hasnot_viewed'] = this.res.hasnot_viewed;
      
      this.update['has_viewed'].sort(function(a, b) {
        var dateA = <any>new Date(a.datetime), dateB = <any>new Date(b.datetime);
        return dateB - dateA;
      });
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'edit_update',
  templateUrl: 'modals/edit_update.html',
  styleUrls: ['./dashboard.component.css'],
})
export class EditUpdateDialog implements OnInit{

  update: any;
  nameForm: FormGroup;
  isLoading = false;
  result_name: any;
  attachments: any;
  index: any;
  update_ecs: Escalation = new Escalation();
  public uploader: FileUploader = new FileUploader({});
  public hasBaseDropZoneOver: boolean = false;
  private serverPath: string = AppConst.mediaPath;
 
  constructor(
    public datepipe: DatePipe,
    private formBuilder: FormBuilder,
    private _dataService: DataService,
    public dialogRef: MatDialogRef<EditUpdateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  
  ngOnInit(){
    this.update = this.data;
    // console.log(this.update);
      
    this.nameForm = this.formBuilder.group({
      name: this.update.name
    })

    this.update_ecs.channel_received = this.update.channel_received;
    this.update_ecs.time_received = this.update.time_received;
    this.update_ecs.from_name = this.update.from_name;
    this.update_ecs.from_email = this.update.from_email;
    this.update_ecs.contents = this.update.contents;
    this.update_ecs.date_received =  new Date(this.update.date_received);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteFile(item){
    this.index = this.uploader.queue.indexOf(item);
    this.uploader.queue.splice(this.index,1);

    this._dataService.deleteFile(item.id).subscribe(
      data=> { console.log(data) },
      error=>{ console.log(error) }
    );
  }

  fileOverBase(event):  void {
    this.hasBaseDropZoneOver  =  event;
  }

  searchName(value){
    this.nameForm
    .get('name')
    .valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.isLoading = true),
      switchMap(value =>
        value == '' ? this.result_name = [] : this._dataService.searchName(value)
      .pipe(
        finalize(() => this.isLoading = false),
        )))
    .subscribe(result =>{
      if(result == 'Empty'){
        this.result_name = [];
      }else if(result.length==0){
        this.result_name = [];
      }else{
        this.result_name = result;
      }
    });
  }

  getFiles(): FileLikeObject[] {
    return this.uploader.queue.map((fileItem) => {
      return fileItem.file;
    });
  }

  updateEscalation() {
    // console.log(this.update_ecs);
    let files = this.getFiles();
    let formData = new FormData();
    files.forEach((file) => {
      formData.append('files' , file.rawFile, file.name);
    });
    formData.append('id' , this.update.id);
    formData.append('name' , this.nameForm.get('name').value );
    formData.append('user_id' , sessionStorage.getItem('user_id'));
    formData.append('date_received' , this.update_ecs['date_received']);
    formData.append('time_received' , this.update_ecs['time_received']);
    formData.append('contents' , this.update_ecs['contents']);
    formData.append('channel_received' , this.update_ecs['channel_received']);
    // formData.append('time_cascaded' , this.update_ecs['time_cascaded']);
    // formData.append('channel_communicated' , this.update_ecs['channel_communicated']);
    if(this.update_ecs['from_email'] != undefined ){
      formData.append('from_email' , this.update_ecs['from_email']);
    }
    if(this.update_ecs['from_name'] != undefined ){
      formData.append('from_name' , this.update_ecs['from_name']);
    }
    this._dataService.editEscalation(formData).subscribe(data=>{
      this.dialogRef.close();
    },err=>{
      console.log(err);
    });
  }
}
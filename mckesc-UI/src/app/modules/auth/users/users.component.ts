import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { UsersService } from '../../../services/users/users.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap, finalize } from 'rxjs/operators/';
import { AppComponent } from '../../../app.component'; 

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: any;
	users_list: any = [];
  displayedColumns = [ 'name', 'delete'];
  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(
  	public _userService: UsersService,
    public dialog: MatDialog,
    public appcomp: AppComponent,
	) {
    this.appcomp.checkLogin();
  }

  ngOnInit() {
  	this.fetchUsers();
  }
  

  fetchUsers(){
  	this.users_list = [];
  	this._userService.getUsers().subscribe(data=>{
  		this.users = data;
      this.dataSource = new MatTableDataSource(this.users);
    	this.dataSource.paginator = this.paginator;
  	});
  }

  openUserDialog(): void {
    let dialogRef = this.dialog.open(NewUserDialog, {
      width: '800px'
    });
    dialogRef.afterClosed().subscribe(result => {
      this.fetchUsers();
    });
  }

  openDeleteUserDialog(user): void {
    let dialogRef = this.dialog.open(DeleteUserDialog, {
      width: '800px',
      data: { user: user }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.fetchUsers();
    });
  }
}


@Component({
  selector: 'new_user',
  templateUrl: 'modals/new_user.html',
})
export class NewUserDialog implements OnInit{

  new_user: User = new User();
  users_list: any;
  admins_list: any =[];
  agents_list: any =[];
  usernames: any;
  usermails: any;

  searchTerms = new Subject<string>();
  userForm: FormGroup;
  emailForm: FormGroup;
  isLoading = false;
  loading = true;
  email_user: emailUser = new emailUser();

  email_exist: boolean = false;
  email_not_exist: boolean = false;
  username_exist: boolean = false;
  username_not_exist: boolean = false;
  savinguser: boolean = false;
  error: any;

  email = new FormControl('', [Validators.required, Validators.email]);

  constructor(
    private _usersService: UsersService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<NewUserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  
  ngOnInit(){
    this.userForm = this.fb.group({
      username: null
    })
    this.userForm
    .get('username')
    .valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.isLoading = true),
      switchMap(value => this._usersService.searchUsername(value)
      .pipe(
        finalize(() => this.isLoading = false),
        )))
    .subscribe(users =>{
      this.usernames = users;
      if(this.usernames == true){
        this.username_not_exist = true;
        this.username_exist = false;
      }else{
        this.username_exist = true;
        this.username_not_exist = false;
      }
    });

    this.emailForm = this.fb.group({
      email: null
    })
    this.emailForm
    .get('email')
    .valueChanges
    .pipe(
      debounceTime(300),
      tap(() => this.isLoading = true),
      switchMap(value => this._usersService.searchEmail(value)
      .pipe(
        finalize(() => this.isLoading = false),
        )))
    .subscribe(emails => {
      this.usermails = emails
      if(this.usermails == true){
        this.email_not_exist = true;
        this.email_exist = false;
      }else{
        this.email_exist = true;
        this.email_not_exist = false;
      }
    });
    this.onkeyup();
  }

  onkeyup(){
    this.error = ''
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addUser(){
    this.savinguser = true;
    this.new_user['email'] = this.emailForm.get('email').value;
    this.new_user['username'] = this.userForm.get('username').value;
    this._usersService.createUser(this.new_user).subscribe(data=>{
      this.new_user = new User();
      this.savinguser = false;
      this.dialogRef.close();
    }, error =>{
      this.savinguser = false;
      this.error = 'Error saving'
    })
  }
}

export class User{
  first_name: any;
  last_name: any;
  username: any;
  password: any;
  user_type: any;
  email: any;
}

export class emailUser{
  email: any;
}

@Component({
  selector: 'delete_user',
  templateUrl: 'modals/delete_user.html',
})
export class DeleteUserDialog implements OnInit{

  delete_user: DeleteUser = new DeleteUser();
  user: any;

  constructor(
    private _usersService: UsersService,
    public dialogRef: MatDialogRef<DeleteUserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  
  ngOnInit(){
    this.user = this.data.user;
    this.delete_user['user_id'] = this.user.id;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  deleteUser(){
    this._usersService.deleteUser(this.delete_user).subscribe(data=>{
      this.dialogRef.close();
    })
  }
}

export class DeleteUser{
  user_id: any;
}

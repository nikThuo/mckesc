import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login/login.service'
import { FormControl, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material';
import { AppComponent } from '../../../app.component'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  post_user: User = new User();
  reset_pass: ResetPass = new ResetPass();
  user : any;
  error_message: any;
  passreset_message: any;
  pass_error_message: any;
  project_name: any;
  login: boolean = true;
  reset: boolean = false;
  
  success: boolean = false;
  fail: boolean = false;

  default: boolean = true;
  select: boolean = false;
  loading: boolean = false;

  constructor(
    private _loginService: LoginService,
    private router: Router,
    public snackBar: MatSnackBar,
    public appcomp: AppComponent,
  ) {
    setTimeout(() => {
      this.appcomp.checkLogin();
    }, 100);
  }

  ngOnInit() {
    sessionStorage.clear();
  }

  loginView(){
    this.login = true;
    this.reset = false;
  }

  resetView(){
    this.reset = true;
    this.login = false;
  }

  loginUser(){
    this._loginService.loginUser(this.post_user).subscribe(res=>{
      this.user = res;
      this.router.navigate(['/home/updates']);
      if (this.user.id != null){
        sessionStorage.setItem("users_names", this.user.first_name +' '+this.user.last_name);
        sessionStorage.setItem("username", this.user.username);
        sessionStorage.setItem("user_id", this.user.id);
        sessionStorage.setItem("user_type", this.user.user_type);
        sessionStorage.setItem("email", this.user.email);
      }
      this.post_user = new User();
    },
    error=>{
      this.error_message = error.body;
      this.post_user = new User();
    });
  }

  resetPassword(){
    this.loading = true;
    this._loginService.resetPassword(this.reset_pass).subscribe(data=>{
      this.passreset_message = data;
      if (this.passreset_message.Successful == 'Successful'){
          this.success = true;
          setTimeout(() => {
            this.success = false;
          }, 4000);
      }else{
          this.fail = true;
          setTimeout(() => {
            this.fail = false;
          }, 5000);
      }
      this.reset_pass = new ResetPass();
      this.loading = false;
    },
    error=>{
      setTimeout(() => {
        this.pass_error_message = error.body;
      }, 5000);
      this.reset_pass = new ResetPass();
    })
  }
}

export class User {
  username: any;
  password: any;
}

export class ResetPass{
  email: any;
}

@Component({
  selector: 'passreset-success',
  template: `
						<span class="passreset-success">
						  <small>Password reset succesfully, please check your email :-)</small>
						</span>
  				`,
  styles: [`
    .passreset-success {
      color: lightgreen;
    }
  `],
})
export class PassresetSuccessfulComponent {}

@Component({
  selector: 'passreset-failed',
  template: `
						<span class="passreset-failed">
						  <small>Password reset failed :-(</small>
						</span>
  				`,
  styles: [`
    .passreset-failed {
      color: red;
    }
  `],
})
export class PassresetFailedComponent {}

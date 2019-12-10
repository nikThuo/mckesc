import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users/users.service'
import { AppComponent } from '../../../app.component'; 

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  user_email: any;
	user_type: any;

  registrationFormGroup: FormGroup;
  passwordFormGroup: FormGroup;
 	password_reset: PasswordReset = new PasswordReset();

 	repeatPassword: any;
  @ViewChild('newPass') newPass: ElementRef;
  @ViewChild('rptPass') rptPass: ElementRef;


  constructor(
  	private formBuilder: FormBuilder,
    private _userService: UsersService,
    public appcomp: AppComponent,
  ) {
    this.appcomp.checkLogin();
    
    this.passwordFormGroup = this.formBuilder.group({
      password: ['', Validators.required],
      repeatPassword: ['', Validators.required]
    }, {
      validator: this.validate.bind(this)
    });
    this.registrationFormGroup = this.formBuilder.group({
      username: ['', Validators.required],
      passwordFormGroup: this.passwordFormGroup
    });
  }

  ngOnInit() {
    this.user_email = sessionStorage.getItem('email');
  	this.user_type = sessionStorage.getItem('user_type');
  }

  resetPass(){
  	// console.log(this.password_reset);
  	this.password_reset['username'] = sessionStorage.getItem('username')
  	this.password_reset['password_reset'] = this.repeatPassword;
  	this._userService.resetPass(this.password_reset).subscribe(data=>{
  		this.password_reset = new PasswordReset();
      this.registrationFormGroup = this.formBuilder.group({
        username: null
      });
      this.passwordFormGroup = this.formBuilder.group({
        password: null,
        repeatPassword: null,
      });
  	})
  }

	validate(registrationFormGroup: FormGroup) {
		let password = registrationFormGroup.controls.password.value;
		this.repeatPassword = registrationFormGroup.controls.repeatPassword.value;
		if (this.repeatPassword.length <= 0) {
			return null;
		}
		if (this.repeatPassword !== password) {
	    return {
				doesMatchPassword: true
	    };
		}
		return null;
	}
}

export class PasswordReset{
	username: any;
	password: any;
	password_reset: any;
}
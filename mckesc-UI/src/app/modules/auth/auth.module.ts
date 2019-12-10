import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//materials
import { 
  MatFormFieldModule, 
  MatInputModule,
  MatNativeDateModule,
  MatDatepickerModule
} from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

//routing
import { AuthRoutingModule } from './auth-routing.module';

//services
import { LoginService } from '../../services/login/login.service';
import { UsersService } from '../../services/users/users.service';

import { NavigationModule } from '../navigation/navigation.module';
//components
import { 
  LoginComponent,
  PassresetSuccessfulComponent,
  PassresetFailedComponent,
} from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { 
  UsersComponent,
  NewUserDialog,
  DeleteUserDialog,
 } from './users/users.component';

@NgModule({
  declarations: [
    LoginComponent, 
    SettingsComponent, 
    UsersComponent,
    PassresetSuccessfulComponent,
    PassresetFailedComponent,
    NewUserDialog,
    DeleteUserDialog,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    NavigationModule,
    FormsModule,
    ReactiveFormsModule,
	  MatFormFieldModule, 
	  MatInputModule,
	  MatNativeDateModule,
	  MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatToolbarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  providers: [
  	LoginService,
    UsersService,
  ],
  entryComponents: [
    NewUserDialog,
    DeleteUserDialog,
    PassresetFailedComponent,
    PassresetSuccessfulComponent,
  ],
})
export class AuthModule { }

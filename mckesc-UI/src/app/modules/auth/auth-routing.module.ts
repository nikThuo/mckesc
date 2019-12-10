import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  { 
  	path: '', 
  	redirectTo: 'login', 
  	pathMatch: 'full' 
  },
  { 
  	path: 'login', 
  	component: LoginComponent 
  },
  { 
    path: 'users', 
    component: UsersComponent 
  },
  { 
    path: 'settings', 
    component: SettingsComponent 
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }

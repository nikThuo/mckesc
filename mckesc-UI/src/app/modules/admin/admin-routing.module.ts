import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { HuddleComponent } from './huddle/huddle.component';
import { ClarifyComponent } from './clarify/clarify.component';

const routes: Routes = [
  { 
  	path: '', 
  	redirectTo: 'updates', 
  	pathMatch: 'full' 
  },
  {
  	path: 'updates', 
  	component: DashboardComponent 
  },
  { 
  	path: 'huddle', 
  	component: HuddleComponent 
  },
  { 
    path: 'clarification', 
    component: ClarifyComponent 
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
